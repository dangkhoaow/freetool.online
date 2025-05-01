"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Wand2, 
  Sparkles, 
  Lightbulb, 
  PenTool, 
  ImageIcon, 
  Palette, 
  Grid, 
  Cpu,
  LoaderIcon,
  Info
} from "lucide-react"
import { useWebLLM } from "@/lib/services/webllm/webllm-provider"
import { WebLLMModel } from "@/lib/services/webllm/config"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIDesignService } from "@/lib/services/browser-design-studio/ai-design-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// AI Tool types
type AIToolType = "vectorizer" | "style-transfer" | "layout-generator" | "image-generator"

interface AIToolOption {
  id: AIToolType
  name: string
  description: string
  icon: React.ReactNode
  requiresModel: boolean
}

const AI_TOOLS: AIToolOption[] = [
  {
    id: "vectorizer",
    name: "Sketch to Vector",
    description: "Convert your sketch or bitmap image into clean vector paths",
    icon: <PenTool className="h-5 w-5" />,
    requiresModel: true,
  },
  {
    id: "style-transfer",
    name: "Style Transfer",
    description: "Apply the style of one design to another element",
    icon: <Palette className="h-5 w-5" />,
    requiresModel: true,
  },
  {
    id: "layout-generator",
    name: "Auto Layout",
    description: "Generate balanced layout suggestions based on your design elements",
    icon: <Grid className="h-5 w-5" />,
    requiresModel: true,
  },
  {
    id: "image-generator",
    name: "Image Generator",
    description: "Generate images from text descriptions using AI",
    icon: <ImageIcon className="h-5 w-5" />,
    requiresModel: true,
  },
]

export default function AIToolsPanel() {
  const [activeTool, setActiveTool] = useState<AIToolType | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const [styleSource, setStyleSource] = useState<"upload" | "select">("select")
  const [selectedStyle, setSelectedStyle] = useState("modern")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const aiServiceRef = useRef<AIDesignService | null>(null)
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Web LLM integration
  const {
    loadModel,
    isModelLoaded,
    isModelLoading,
    loadingProgress: modelLoadingProgress,
    loadingState: modelLoadingState,
    availableModels,
    selectedModelId,
    setSelectedModelId,
    llmService,
    supportsWebGPU,
    error: llmError,
  } = useWebLLM()

  // Initialize AI service on mount
  useEffect(() => {
    aiServiceRef.current = new AIDesignService()
  }, [])

  // Set canvas dimensions on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    
    // Set up canvas for drawing
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#000"
    }
  }, [])

  // Handle tool selection
  const selectTool = (toolId: AIToolType) => {
    setActiveTool(toolId)
    setResult(null)
    setPrompt("")
  }

  // Drawing state for vectorizer
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null)

  // Mouse handlers for sketch drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsDrawing(true)
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setLastPosition({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(lastPosition.x, lastPosition.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    
    setLastPosition({ x, y })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setLastPosition(null)
  }

  // Clear canvas for drawing
  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // Process the current tool
  const processAITool = async () => {
    if (!activeTool || !aiServiceRef.current) return
    
    setIsProcessing(true)
    setProgress(0)
    setProcessingStatus(`Preparing ${AI_TOOLS.find(t => t.id === activeTool)?.name}...`)
    
    try {
      if (activeTool === "vectorizer") {
        // Get canvas image data
        const canvas = canvasRef.current
        if (!canvas) throw new Error("Canvas not available")
        
        const imageDataUrl = canvas.toDataURL("image/png")
        
        // Process vectorization
        const result = await aiServiceRef.current.vectorizeImage(
          imageDataUrl,
          (progress, status) => {
            setProgress(progress * 100)
            if (status) setProcessingStatus(status)
          }
        )
        
        // Display result
        setResult(result)
        
        // Draw result on result canvas
        if (resultCanvasRef.current && result && Array.isArray(result.paths)) {
          const ctx = resultCanvasRef.current.getContext("2d")
          if (ctx) {
            ctx.clearRect(0, 0, resultCanvasRef.current.width, resultCanvasRef.current.height)
            
            // Draw each path
            result.paths.forEach((path: any) => {
              ctx.beginPath()
              ctx.strokeStyle = path.stroke || "#000"
              ctx.lineWidth = path.strokeWidth || 2
              
              if (path.points && path.points.length > 0) {
                ctx.moveTo(path.points[0].x, path.points[0].y)
                
                for (let i = 1; i < path.points.length; i++) {
                  ctx.lineTo(path.points[i].x, path.points[i].y)
                }
              }
              
              ctx.stroke()
            })
          }
        }
      } else if (activeTool === "style-transfer") {
        // Process style transfer
        const result = await aiServiceRef.current.applyStyleTransfer(
          selectedStyle,
          (progress, status) => {
            setProgress(progress * 100)
            if (status) setProcessingStatus(status)
          }
        )
        
        setResult(result)
      } else if (activeTool === "layout-generator") {
        // Process layout generation
        const result = await aiServiceRef.current.generateLayout(
          prompt,
          (progress, status) => {
            setProgress(progress * 100)
            if (status) setProcessingStatus(status)
          }
        )
        
        setResult(result)
      } else if (activeTool === "image-generator") {
        // Process image generation
        const result = await aiServiceRef.current.generateImage(
          prompt,
          (progress, status) => {
            setProgress(progress * 100)
            if (status) setProcessingStatus(status)
          }
        )
        
        setResult(result)
      }
      
      setProcessingStatus("Processing complete!")
    } catch (error) {
      console.error("AI processing error:", error)
      setProcessingStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  // Apply the result to the design canvas
  const applyToCanvas = () => {
    if (!result) return
    
    // This would interact with the other design components to apply the result
    console.log("Applying result to canvas:", result)
    
    // Reset state
    setResult(null)
    setActiveTool(null)
  }

  // Load AI model if needed for current tool
  const ensureModelLoaded = () => {
    const currentTool = AI_TOOLS.find(t => t.id === activeTool)
    
    if (currentTool?.requiresModel && !isModelLoaded && !isModelLoading) {
      // Select a model if none selected
      if (!selectedModelId && availableModels.length > 0) {
        setSelectedModelId(availableModels[0].id)
      }
      
      // Load model
      if (selectedModelId) {
        loadModel(selectedModelId, (progress, state) => {
          setProgress(progress * 100)
          if (state) setProcessingStatus(state)
        })
      }
    }
  }

  // Render tool specific UI based on active tool
  const renderToolUI = () => {
    if (!activeTool) return null
    
    // Check WebGPU support first if model is required
    const toolRequiresModel = AI_TOOLS.find(t => t.id === activeTool)?.requiresModel
    
    if (toolRequiresModel && !supportsWebGPU) {
      return (
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>WebGPU Not Supported</AlertTitle>
          <AlertDescription>
            Your browser doesn't support WebGPU, which is required for AI tools.
            Please use a modern browser like Chrome or Edge with WebGPU enabled.
          </AlertDescription>
        </Alert>
      )
    }
    
    // If model is required and not loaded, show loading UI
    if (toolRequiresModel && !isModelLoaded) {
      return (
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-medium">Load AI Model</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This tool requires an AI model to be loaded.
          </p>
          
          {availableModels.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Model:</label>
              <Select
                value={selectedModelId}
                onValueChange={setSelectedModelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={ensureModelLoaded} 
                disabled={isModelLoading || !selectedModelId}
                className="w-full"
              >
                {isModelLoading ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Loading Model...
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4 mr-2" />
                    Load Model
                  </>
                )}
              </Button>
              
              {isModelLoading && (
                <div className="space-y-1">
                  <Progress value={modelLoadingProgress} />
                  <p className="text-xs text-gray-500">{modelLoadingState}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
    
    // Render specific tool UI
    switch (activeTool) {
      case "vectorizer":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sketch to Vector</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Draw a sketch on the canvas and convert it to vector paths.
              </p>
              
              <div className="border rounded-md overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full h-64"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCanvas}>
                  Clear
                </Button>
                <Button onClick={processAITool} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Vectorize
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Result</h3>
              {isProcessing ? (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {processingStatus}
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden bg-white">
                    <canvas
                      ref={resultCanvasRef}
                      className="w-full h-64"
                    />
                  </div>
                  
                  <Button onClick={applyToCanvas}>
                    Apply to Canvas
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border rounded-md bg-gray-50 dark:bg-gray-900">
                  <p className="text-gray-500">Vectorized result will appear here</p>
                </div>
              )}
            </div>
          </div>
        )
        
      case "style-transfer":
        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-medium">Style Transfer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Apply the style of one element to another in your design.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Style Source</label>
              <Tabs value={styleSource} onValueChange={(value) => setStyleSource(value as "upload" | "select")}>
                <TabsList className="w-full">
                  <TabsTrigger value="select">Select Style</TabsTrigger>
                  <TabsTrigger value="upload">Upload Style</TabsTrigger>
                </TabsList>
                
                <TabsContent value="select" className="space-y-4 pt-4">
                  <Select
                    value={selectedStyle}
                    onValueChange={setSelectedStyle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="retro">Retro</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="geometric">Geometric</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4 pt-4">
                  <Input type="file" accept="image/*" />
                </TabsContent>
              </Tabs>
              
              <div className="pt-4">
                <Button onClick={processAITool} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4 mr-2" />
                      Apply Style
                    </>
                  )}
                </Button>
              </div>
              
              {isProcessing && (
                <div className="space-y-2 pt-4">
                  <Progress value={progress} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {processingStatus}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
        
      case "layout-generator":
        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-medium">Auto Layout</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate balanced layout suggestions based on your design elements.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Layout Description</label>
              <Textarea
                placeholder="Describe the layout you want, e.g. 'A balanced design with a large header, three column content, and a contact form at the bottom'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              
              <Button onClick={processAITool} disabled={isProcessing || !prompt.trim()}>
                {isProcessing ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Grid className="h-4 w-4 mr-2" />
                    Generate Layout
                  </>
                )}
              </Button>
            </div>
            
            {isProcessing ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {processingStatus}
                </p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-white dark:bg-gray-900">
                  <h4 className="font-medium mb-2">Layout Suggestion</h4>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 p-2">
                    {/* Layout preview would go here */}
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-sm text-gray-500">Layout preview</p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={applyToCanvas}>
                  Apply Layout
                </Button>
              </div>
            ) : null}
          </div>
        )
        
      case "image-generator":
        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-medium">Image Generator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate images from text descriptions using AI.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Description</label>
              <Textarea
                placeholder="Describe the image you want to generate, e.g. 'A vibrant sunset over mountains with reflections in a calm lake'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              
              <Button onClick={processAITool} disabled={isProcessing || !prompt.trim()}>
                {isProcessing ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
            
            {isProcessing ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {processingStatus}
                </p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <img src={result.imageUrl} alt="Generated image" className="w-full" />
                </div>
                
                <Button onClick={applyToCanvas}>
                  Add to Canvas
                </Button>
              </div>
            ) : null}
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* AI tools toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {AI_TOOLS.map((tool) => (
          <Card 
            key={tool.id}
            onClick={() => selectTool(tool.id)}
            className={`cursor-pointer transition-all ${
              activeTool === tool.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                {tool.icon}
                {tool.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4 px-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Tool specific UI */}
      <div className="flex-1">
        {renderToolUI()}
      </div>
      
      {/* WebGPU status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              AI Acceleration: {supportsWebGPU ? 'Available' : 'Not Available'}
            </span>
          </div>
          {llmError && (
            <span className="text-sm text-red-500">{llmError}</span>
          )}
        </div>
      </div>
    </div>
  )
}
