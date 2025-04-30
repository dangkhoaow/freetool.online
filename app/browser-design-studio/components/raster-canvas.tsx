"use client"

import React, { useRef, useEffect, useState } from "react"
import { useRasterStore } from "@/lib/services/browser-design-studio/stores/raster-store"
import { Button } from "@/components/ui/button"
import { 
  MousePointer, 
  PaintBucket, 
  Brush, 
  Eraser, 
  Droplet, 
  Image as ImageIcon,
  MoveHorizontal 
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface BrushStyle {
  size: number
  hardness: number
  opacity: number
  color: string
  blendMode: string
}

export default function RasterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<string>("brush")
  const [currentBrush, setCurrentBrush] = useState<BrushStyle>({
    size: 10,
    hardness: 0.8,
    opacity: 1,
    color: "#000000",
    blendMode: "source-over",
  })
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)

  // Create connection to raster store for state management
  const {
    layers,
    activeLayerIndex,
    setActiveLayerIndex,
    addLayer,
    updateLayer,
    history,
    pushHistory,
    loadImageData,
  } = useRasterStore()

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d", { willReadFrequently: true })
    
    if (!canvas || !ctx) return
    
    // Set up canvas size
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    
    // Set initial background
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Load initial layer if none exists
    if (layers.length === 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      addLayer({
        id: `layer-${Date.now()}`,
        name: "Background",
        visible: true,
        opacity: 1,
        blendMode: "normal",
        imageData,
      })
    } else {
      // Render existing layers
      renderLayers()
    }
  }, [])

  // Render all visible layers
  const renderLayers = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    
    if (!canvas || !ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw each visible layer
    layers.forEach((layer) => {
      if (layer.visible) {
        // Set global alpha for layer opacity
        ctx.globalAlpha = layer.opacity
        
        // Set blend mode
        ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation
        
        // Draw layer image data
        if (layer.imageData) {
          ctx.putImageData(layer.imageData, 0, 0)
        }
      }
    })
    
    // Reset composite operation and alpha
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
  }

  // Handle brush drawing
  const drawBrush = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    options: BrushStyle
  ) => {
    // Save context state
    ctx.save()
    
    // Set up brush parameters
    ctx.globalAlpha = options.opacity
    ctx.globalCompositeOperation = options.blendMode as GlobalCompositeOperation
    
    // Create radial gradient for soft brush
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, options.size)
    gradient.addColorStop(0, options.color)
    gradient.addColorStop(options.hardness, options.color)
    gradient.addColorStop(1, `${options.color}00`) // Transparent version of color
    
    ctx.fillStyle = gradient
    
    // Draw the brush stroke
    ctx.beginPath()
    ctx.arc(x, y, options.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Restore context state
    ctx.restore()
  }

  // Draw a line between two points for smooth brush strokes
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: BrushStyle
  ) => {
    // Calculate distance between points
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    
    // Calculate number of steps based on distance
    const steps = Math.max(Math.floor(dist / 2), 1)
    
    // Interpolate points along the line
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      
      drawBrush(ctx, x, y, options)
    }
  }

  // Handle mouse down to start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d", { willReadFrequently: true })
    
    if (!canvas || !ctx || activeLayerIndex === null) return
    
    setIsDrawing(true)
    
    // Save canvas state before drawing for history
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    pushHistory(imageData)
    
    // Get mouse position
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setLastPoint({ x, y })
    
    // Handle different tools
    if (currentTool === "brush" || currentTool === "eraser") {
      // For eraser, modify brush to use transparent color (eraser effect)
      const options = { ...currentBrush }
      if (currentTool === "eraser") {
        options.color = "#00000000" // Transparent
        options.blendMode = "destination-out"
      }
      
      drawBrush(ctx, x, y, options)
    } else if (currentTool === "fill") {
      // Implement flood fill (would need more complex logic)
      ctx.fillStyle = currentBrush.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    // Update the active layer with new image data
    const updatedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    updateLayer(activeLayerIndex, { imageData: updatedImageData })
  }

  // Handle mouse move to continue drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d", { willReadFrequently: true })
    
    if (!canvas || !ctx || activeLayerIndex === null) return
    
    // Get current mouse position
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Handle different tools
    if (currentTool === "brush" || currentTool === "eraser") {
      // For eraser, modify brush to use transparent color
      const options = { ...currentBrush }
      if (currentTool === "eraser") {
        options.color = "#00000000" // Transparent
        options.blendMode = "destination-out"
      }
      
      drawLine(ctx, lastPoint.x, lastPoint.y, x, y, options)
    }
    
    // Update last point
    setLastPoint({ x, y })
    
    // Update the active layer with new image data
    const updatedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    updateLayer(activeLayerIndex, { imageData: updatedImageData })
  }

  // Handle mouse up to stop drawing
  const handleMouseUp = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    setLastPoint(null)
    
    // Final render of all layers
    renderLayers()
  }

  // Handle brush settings changes
  const handleBrushSizeChange = (value: number[]) => {
    setCurrentBrush({
      ...currentBrush,
      size: value[0],
    })
  }
  
  const handleBrushHardnessChange = (value: number[]) => {
    setCurrentBrush({
      ...currentBrush,
      hardness: value[0],
    })
  }
  
  const handleBrushOpacityChange = (value: number[]) => {
    setCurrentBrush({
      ...currentBrush,
      opacity: value[0],
    })
  }
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBrush({
      ...currentBrush,
      color: e.target.value,
    })
  }
  
  const handleBlendModeChange = (value: string) => {
    setCurrentBrush({
      ...currentBrush,
      blendMode: value,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            variant={currentTool === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("select")}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "brush" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("brush")}
          >
            <Brush className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("eraser")}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "fill" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("fill")}
          >
            <PaintBucket className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "eyedropper" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("eyedropper")}
          >
            <Droplet className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "move" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("move")}
          >
            <MoveHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={currentBrush.color}
            onChange={handleColorChange}
            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
          />
          <Select 
            value={currentBrush.blendMode}
            onValueChange={handleBlendModeChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Blend Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="source-over">Normal</SelectItem>
              <SelectItem value="multiply">Multiply</SelectItem>
              <SelectItem value="screen">Screen</SelectItem>
              <SelectItem value="overlay">Overlay</SelectItem>
              <SelectItem value="darken">Darken</SelectItem>
              <SelectItem value="lighten">Lighten</SelectItem>
              <SelectItem value="color-dodge">Color Dodge</SelectItem>
              <SelectItem value="color-burn">Color Burn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs">Size: {currentBrush.size}</span>
          <Slider
            value={[currentBrush.size]}
            min={1}
            max={100}
            step={1}
            onValueChange={handleBrushSizeChange}
            className="w-32"
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs">Hardness: {Math.round(currentBrush.hardness * 100)}%</span>
          <Slider
            value={[currentBrush.hardness]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleBrushHardnessChange}
            className="w-32"
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs">Opacity: {Math.round(currentBrush.opacity * 100)}%</span>
          <Slider
            value={[currentBrush.opacity]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleBrushOpacityChange}
            className="w-32"
          />
        </div>
      </div>
      
      <div className="flex-1 relative bg-white dark:bg-gray-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  )
}
