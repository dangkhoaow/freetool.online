"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Loader2, 
  Save, 
  Upload, 
  Download, 
  Pen, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Settings, 
  Cpu,
  Undo,
  Redo,
  Square,
  Circle,
  MousePointer,
  Move,
  Crop,
  Palette,
  ArrowUpToLine,
  ArrowDownToLine,
  X as XIcon,
  ChevronDown, 
  RotateCw, 
  RotateCcw, 
  FolderOpen, 
  Trash2, 
  Plus
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { StorageService } from "@/lib/storage"
import { WebLLMProvider, useWebLLM } from "@/lib/services/webllm/webllm-provider"
import { WebLLMModel } from "@/lib/services/webllm/config"
import { Progress } from "@/components/ui/progress"
import { FileDropzone } from "@/components/ui/file-dropzone"
import { Switch } from "@/components/ui/switch"
import { DesignStudioProvider, useDesignStudio } from "@/lib/services/browser-design-studio/store-provider"

// Import design studio services
import { VectorEngine } from "@/lib/services/browser-design-studio/vector-engine"
import { RasterEngine } from "@/lib/services/browser-design-studio/raster-engine"
import { TextEngine } from "@/lib/services/browser-design-studio/text-engine"
import { ExportService } from "@/lib/services/browser-design-studio/export-service"
import { AIDesignService } from "@/lib/services/browser-design-studio/ai-design-service"
import VectorCanvas from "./vector-canvas"
import RasterCanvas from "./raster-canvas"
import TextPanel from "./text-panel"
import AIToolsPanel from "./ai-tools-panel"
import ExportPanel from "./export-panel"
import CollaborationPanel from "./collaboration-panel"
import VersionHistoryPanel from "./version-history-panel"

// Storage keys
const STORAGE_KEYS = {
  RECENT_DESIGNS: "browser_design_studio_recent_designs",
  USER_DATA: "browser_design_studio_user_data",
  DESIGN_SETTINGS: "browser_design_studio_settings",
}

// Canvas dimensions
const DEFAULT_CANVAS_SIZE = {
  width: 1200,
  height: 800,
}

interface DesignDocument {
  id: string
  name: string
  width: number
  height: number
  vectorLayers: any[]
  rasterLayers: any[]
  textLayers: any[]
  createdAt: number
  updatedAt: number
}

// Main Design Studio Tool Component
function DesignStudioToolContent() {
  // State for design document
  const [activeDocument, setActiveDocument] = useState<DesignDocument | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<DesignDocument[]>([])
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_SIZE.width)
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_CANVAS_SIZE.height)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("vector")
  const [activeToolTab, setActiveToolTab] = useState("draw")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingState, setLoadingState] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // History states
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])

  // Service refs
  const vectorEngineRef = useRef<VectorEngine | null>(null)
  const rasterEngineRef = useRef<RasterEngine | null>(null)
  const textEngineRef = useRef<TextEngine | null>(null)
  const exportServiceRef = useRef<ExportService | null>(null)
  const aiServiceRef = useRef<AIDesignService | null>(null)
  const storageServiceRef = useRef<StorageService | null>(null)
  
  // Canvas refs
  const vectorCanvasRef = useRef<HTMLDivElement | null>(null)
  const rasterCanvasRef = useRef<HTMLDivElement | null>(null)
  
  const { toast } = useToast()

  // Initialize services
  useEffect(() => {
    storageServiceRef.current = new StorageService("browser_design_studio")
    vectorEngineRef.current = new VectorEngine()
    rasterEngineRef.current = new RasterEngine()
    textEngineRef.current = new TextEngine()
    exportServiceRef.current = new ExportService()
    aiServiceRef.current = new AIDesignService()
    
    // Load saved documents
    loadRecentDocuments()
    
    // Setup auto-save interval (every 30 seconds)
    const autoSaveInterval = setInterval(() => {
      if (activeDocument) {
        saveCurrentDocument()
      }
    }, 30000)
    
    return () => {
      clearInterval(autoSaveInterval)
    }
  }, [])

  // Load recent documents
  const loadRecentDocuments = () => {
    try {
      if (storageServiceRef.current) {
        const saved = storageServiceRef.current.load<DesignDocument[]>(
          STORAGE_KEYS.RECENT_DESIGNS.replace('browser_design_studio_', ''),
          []
        )
        if (saved && saved.length > 0) {
          setRecentDocuments(saved)
        }
      }
    } catch (error) {
      console.error("Failed to load recent documents:", error)
    }
  }
  
  // Save current document
  const saveCurrentDocument = () => {
    if (!activeDocument || !storageServiceRef.current) return
    
    try {
      const updatedDoc = {
        ...activeDocument,
        updatedAt: Date.now(),
        vectorLayers: vectorEngineRef.current?.getLayers() || [],
        rasterLayers: rasterEngineRef.current?.getLayers() || [],
        textLayers: textEngineRef.current?.getLayers() || [],
      }
      
      // Update active document
      setActiveDocument(updatedDoc)
      
      // Update in recent documents list
      const updated = recentDocuments.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      )
      setRecentDocuments(updated)
      
      // Save to storage
      storageServiceRef.current.save(
        STORAGE_KEYS.RECENT_DESIGNS.replace('browser_design_studio_', ''),
        updated
      )
      
      toast({
        title: "Design saved",
        description: "Your design has been saved locally.",
        duration: 2000,
      })
    } catch (error) {
      console.error("Failed to save document:", error)
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save your design. Please try again.",
      })
    }
  }
  
  // Create new document
  const createNewDocument = (width: number = canvasWidth, height: number = canvasHeight) => {
    if (!storageServiceRef.current) return
    
    const newDoc: DesignDocument = {
      id: `design-${Date.now()}`,
      name: `Untitled Design ${recentDocuments.length + 1}`,
      width,
      height,
      vectorLayers: [],
      rasterLayers: [],
      textLayers: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    // Set as active document
    setActiveDocument(newDoc)
    
    // Add to recent documents
    const updated = [newDoc, ...recentDocuments]
    setRecentDocuments(updated)
    
    // Save to storage
    storageServiceRef.current.save(
      STORAGE_KEYS.RECENT_DESIGNS.replace('browser_design_studio_', ''),
      updated
    )
    
    // Initialize engines with new document dimensions
    if (vectorEngineRef.current) vectorEngineRef.current.initCanvas(width, height)
    if (rasterEngineRef.current) rasterEngineRef.current.initCanvas(width, height)
    if (textEngineRef.current) textEngineRef.current.initCanvas(width, height)
    
    toast({
      title: "New design created",
      description: `Created a new ${width}×${height} design canvas.`,
    })
  }
  
  // Handle undo/redo
  const handleUndo = () => {
    if (undoStack.length === 0) return
    
    // Get last state from undo stack
    const lastState = undoStack[undoStack.length - 1]
    
    // Update undo/redo stacks
    setUndoStack(undoStack.slice(0, -1))
    setRedoStack([...redoStack, lastState])
    
    // Apply the state based on active tab
    if (activeTab === "vector" && vectorEngineRef.current) {
      vectorEngineRef.current.restoreState(lastState)
    } else if (activeTab === "raster" && rasterEngineRef.current) {
      rasterEngineRef.current.restoreState(lastState)
    } else if (activeTab === "text" && textEngineRef.current) {
      textEngineRef.current.restoreState(lastState)
    }
  }
  
  const handleRedo = () => {
    if (redoStack.length === 0) return
    
    // Get last state from redo stack
    const lastState = redoStack[redoStack.length - 1]
    
    // Update undo/redo stacks
    setRedoStack(redoStack.slice(0, -1))
    setUndoStack([...undoStack, lastState])
    
    // Apply the state based on active tab
    if (activeTab === "vector" && vectorEngineRef.current) {
      vectorEngineRef.current.restoreState(lastState)
    } else if (activeTab === "raster" && rasterEngineRef.current) {
      rasterEngineRef.current.restoreState(lastState)
    } else if (activeTab === "text" && textEngineRef.current) {
      textEngineRef.current.restoreState(lastState)
    }
  }

  // When no active document, show the welcome screen
  if (!activeDocument) {
    return (
      <Card className="bg-white dark:bg-gray-900 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Browser Design Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="text-center max-w-xl">
              <h2 className="text-xl font-semibold mb-4">
                Create professional designs with full privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                All processing happens directly in your browser. Your designs are stored locally on your device and never uploaded to any server.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-4 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Pen size={18} className="text-rose-600" />
                    Vector Editing
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create precise vector shapes with Bezier curves, boolean operations, and path editing tools.
                  </p>
                </Card>
                
                <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-100 dark:border-orange-800">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ImageIcon size={18} className="text-orange-600" />
                    Raster Painting
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Use brushes, filters, and blending modes for pixel-perfect editing with 50+ brush presets.
                  </p>
                </Card>
                
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Type size={18} className="text-blue-600" />
                    Text Engine
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Advanced typography with custom fonts, text-on-path, and OpenType features.
                  </p>
                </Card>
                
                <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Cpu size={18} className="text-purple-600" />
                    AI Design Tools
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    AI-powered design suggestions, sketch-to-vector conversion, and style transfers.
                  </p>
                </Card>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => createNewDocument()}
                className="gap-2"
              >
                <Pen className="h-5 w-5" />
                New Design
              </Button>
              
              {recentDocuments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setActiveDocument(recentDocuments[0])}
                  className="gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Open Recent
                </Button>
              )}
            </div>
            
            {recentDocuments.length > 0 && (
              <div className="w-full max-w-2xl mt-8">
                <h3 className="text-lg font-medium mb-4">Recent Designs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recentDocuments.slice(0, 6).map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setActiveDocument(doc)}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {/* Thumbnail placeholder - would show actual design preview */}
                        <Layers size={32} className="text-gray-400" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main design studio UI
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{activeDocument.name}</h2>
          <Input
            className="w-64"
            value={activeDocument.name}
            onChange={(e) => setActiveDocument({...activeDocument, name: e.target.value})}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length === 0}>
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button size="sm" onClick={saveCurrentDocument}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex">
        {/* Tools panel */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 p-4">
          <Tabs defaultValue="draw" value={activeToolTab} onValueChange={setActiveToolTab}>
            <TabsList className="w-full">
              <TabsTrigger value="draw">Draw</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="draw" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <MousePointer className="h-5 w-5 mb-1" />
                  <span className="text-xs">Select</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <Pen className="h-5 w-5 mb-1" />
                  <span className="text-xs">Pen</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <Square className="h-5 w-5 mb-1" />
                  <span className="text-xs">Rectangle</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <Circle className="h-5 w-5 mb-1" />
                  <span className="text-xs">Ellipse</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <Type className="h-5 w-5 mb-1" />
                  <span className="text-xs">Text</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <Crop className="h-5 w-5 mb-1" />
                  <span className="text-xs">Crop</span>
                </Button>
              </div>
              
              <div className="pt-4">
                <Label className="text-sm mb-2 block">Color</Label>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    <div className="w-6 h-6 rounded-full bg-black"></div>
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    <div className="w-6 h-6 rounded-full bg-red-500"></div>
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    <div className="w-6 h-6 rounded-full bg-green-500"></div>
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>
                
                <Label className="text-sm mb-2 block">Thickness</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="2px" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1px</SelectItem>
                    <SelectItem value="2">2px</SelectItem>
                    <SelectItem value="4">4px</SelectItem>
                    <SelectItem value="8">8px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <Move className="h-5 w-5 mb-1" />
                  <span className="text-xs">Move</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <ArrowUpToLine className="h-5 w-5 mb-1" />
                  <span className="text-xs">Forward</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col py-3 h-auto">
                  <ArrowDownToLine className="h-5 w-5 mb-1" />
                  <span className="text-xs">Backward</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="layers" className="pt-4">
              <div className="space-y-2">
                <div className="border rounded p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    <span className="text-sm">Layer 1</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ArrowUpToLine className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border rounded p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4" />
                    <span className="text-sm">Layer 2</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ArrowUpToLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Main canvas area */}
        <div className="flex-1 relative">
          <Tabs defaultValue="vector" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="mx-4 mb-0 grid grid-cols-7">
                <TabsTrigger value="vector" onClick={() => setActiveTab("vector")}>Vector</TabsTrigger>
                <TabsTrigger value="raster" onClick={() => setActiveTab("raster")}>Raster</TabsTrigger>
                <TabsTrigger value="text" onClick={() => setActiveTab("text")}>Text</TabsTrigger>
                <TabsTrigger value="ai" onClick={() => setActiveTab("ai")}>AI Tools</TabsTrigger>
                <TabsTrigger value="export" onClick={() => setActiveTab("export")}>Export</TabsTrigger>
                <TabsTrigger value="collaborate" onClick={() => setActiveTab("collaborate")}>Collaborate</TabsTrigger>
                <TabsTrigger value="history" onClick={() => setActiveTab("history")}>History</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="vector" className="p-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden" ref={vectorCanvasRef}>
                <VectorCanvas />
              </div>
            </TabsContent>
            
            <TabsContent value="raster" className="p-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden" ref={rasterCanvasRef}>
                <RasterCanvas />
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="p-4">
              <TextPanel />
            </TabsContent>
            
            <TabsContent value="ai" className="p-4">
              <AIToolsPanel />
            </TabsContent>
            
            <TabsContent value="export" className="p-4">
              <ExportPanel />
            </TabsContent>
            
            <TabsContent value="collaborate" className="p-4">
              <CollaborationPanel />
            </TabsContent>
            
            <TabsContent value="history" className="p-4">
              <VersionHistoryPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Settings panel (conditionally rendered) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Settings</span>
                <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(false)}>
                  <XIcon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Canvas Width</Label>
                <Input
                  className="w-64"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Canvas Height</Label>
                <Input
                  className="w-64"
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-save" defaultChecked />
                <Label htmlFor="auto-save">Auto-save every 30 seconds</Label>
              </div>
              <Button onClick={() => {
                setIsSettingsOpen(false)
                // Would resize canvas here
              }}>
                Apply Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}

// Wrap the component with the provider
export default function DesignStudioTool() {
  return (
    <DesignStudioProvider>
      <DesignStudioToolContent />
    </DesignStudioProvider>
  )
}
