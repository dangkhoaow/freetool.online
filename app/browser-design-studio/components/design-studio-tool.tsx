"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
  Plus,
  PenTool
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { StorageService } from "@/lib/storage"
import { WebLLMProvider, useWebLLM } from "@/lib/services/webllm/webllm-provider"
import { WebLLMModel } from "@/lib/services/webllm/config"
import { Progress } from "@/components/ui/progress"
import { FileDropzone } from "@/components/ui/file-dropzone"
import { DesignStudioProvider, useDesignStudio } from "@/lib/services/browser-design-studio/store-provider"
import { useRasterStore } from "@/lib/services/browser-design-studio/stores/raster-store"
import { useTextStore, TextNode } from "@/lib/services/browser-design-studio/stores/text-store"

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
  const [vectorTool, setVectorToolState] = useState("pen")
  const [vectorStrokeColor, setVectorStrokeColorState] = useState("#000000")
  const [vectorStrokeWidth, setVectorStrokeWidthState] = useState(2)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingState, setLoadingState] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // History states
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])

  // Text attachment state
  const [attachTextToPath, setAttachTextToPath] = useState(true)

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
  const vectorComponentRef = useRef<any>(null);

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

  useEffect(() => {
    // Listen for text-to-vector events
    const handleSwitchToVectorForText = (event: CustomEvent) => {
      console.log("[DesignStudioTool] Received switch-to-vector-for-text event:", event.detail);
      
      // Set active tab to vector and store text information in component data for sharing between tabs
      setActiveTab("vector");
      
      // Store the text node ID in a global data attribute for components to access
      if (event.detail && event.detail.textId) {
        document.body.setAttribute('data-pending-text-id', event.detail.textId);
        console.log("[DesignStudioTool] Stored pending text ID in DOM:", event.detail.textId);
      }
      
      // Get the requested tool name from the event (default to 'path')
      const toolName = event.detail?.activateTool || 'path';
      
      // Add a slight delay to ensure the tab switch completes before activating the tool
      setTimeout(() => {
        console.log("[DesignStudioTool] Activating tool:", toolName);
        
        // Update vector tool state
        setVectorToolState(toolName);
        
        // Try to set the tool directly on the VectorCanvas component if available
        if (vectorComponentRef.current?.setCurrentTool) {
          vectorComponentRef.current.setCurrentTool(toolName);
        }
        
        // Also dispatch an event as a fallback mechanism
        const toolEvent = new CustomEvent('vector-tool-change', { 
          detail: { tool: toolName } 
        });
        window.dispatchEvent(toolEvent);
      }, 100);
    };
    
    window.addEventListener('switch-to-vector-for-text', handleSwitchToVectorForText as EventListener);
    
    return () => {
      window.removeEventListener('switch-to-vector-for-text', handleSwitchToVectorForText as EventListener);
    };
  }, [setActiveTab, setVectorToolState]);

  useEffect(() => {
    // Listen for path creation events to switch back to text tab
    const handlePathCreatedForText = (event: CustomEvent) => {
      console.log("[DesignStudioTool] Received path-created-for-text event:", event.detail);
      
      // We're removing the automatic tab switch back to text
      // This allows the user to continue working in the Vector tab after path creation
      // If the event explicitly requests to switch tabs, then we'll do it
      if (event.detail?.switchToTextTab === true) {
        setTimeout(() => {
          console.log("[DesignStudioTool] Switching back to text tab after path creation (explicitly requested)");
          setActiveTab("text");
        }, 200);
      } else {
        console.log("[DesignStudioTool] Path created for text, but staying in Vector tab");
      }
    };
    
    window.addEventListener('path-created-for-text', handlePathCreatedForText as EventListener);
    
    return () => {
      window.removeEventListener('path-created-for-text', handlePathCreatedForText as EventListener);
    };
  }, [setActiveTab]);

  useEffect(() => {
    // Find and store reference to VectorCanvas component
    const canvas = document.querySelector('[data-component-name="VectorCanvas"]');
    if (canvas) {
      vectorComponentRef.current = (canvas as any).__reactFiber$?.return?.stateNode;
    }
  }, []);

  const setVectorTool = (tool: string) => {
    setVectorToolState(tool);
    if (vectorComponentRef.current?.setCurrentTool) {
      vectorComponentRef.current.setCurrentTool(tool);
    } else {
      // Fallback to custom event
      if (typeof window !== "undefined") {
        const event = new CustomEvent("vector-tool-change", { detail: { tool } });
        window.dispatchEvent(event);
      }
    }
  };

  const setVectorStrokeColor = (color: string) => {
    setVectorStrokeColorState(color);
    if (vectorComponentRef.current?.setStrokeColor) {
      vectorComponentRef.current.setStrokeColor(color);
    } else {
      // Fallback to custom event
      if (typeof window !== "undefined") {
        const event = new CustomEvent("vector-stroke-color-change", { detail: { color } });
        window.dispatchEvent(event);
      }
    }
  };

  const setVectorStrokeWidth = (width: number) => {
    setVectorStrokeWidthState(width);
    if (vectorComponentRef.current?.setStrokeWidth) {
      vectorComponentRef.current.setStrokeWidth(width);
    } else {
      // Fallback to custom event
      if (typeof window !== "undefined") {
        const event = new CustomEvent("vector-stroke-width-change", { detail: { width } });
        window.dispatchEvent(event);
      }
    }
  };

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
          <CardTitle className="text-center text-2xl font-bold">Browser Design Studio</CardTitle>
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
        {/* Main canvas area */}
        <div className="flex-1 relative">
          <Tabs defaultValue="vector" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-800">
              <TabsList className="mx-4 mb-0 grid grid-cols-7">
                <TabsTrigger value="vector" onClick={() => setActiveTab("vector")}>Vector</TabsTrigger>
                <TabsTrigger value="raster" onClick={() => setActiveTab("raster")}>Raster</TabsTrigger>
                <TabsTrigger value="text" onClick={() => setActiveTab("text")}>Text</TabsTrigger>
                <TabsTrigger style={{ display: "none" }} value="ai" onClick={() => setActiveTab("ai")}>AI Tools</TabsTrigger>
                <TabsTrigger value="export" onClick={() => setActiveTab("export")}>Export</TabsTrigger>
                <TabsTrigger style={{ display: "none" }}value="collaborate" onClick={() => setActiveTab("collaborate")}>Collaborate</TabsTrigger>
                <TabsTrigger value="history" onClick={() => setActiveTab("history")}>History</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="vector" className="p-4 pt-0">
              {/* Vector Toolbar */}
              <div className="mb-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={vectorTool === "select" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setVectorTool("select");
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("vector-tool-change", { detail: { tool: "select" } });
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={vectorTool === "pen" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setVectorTool("pen");
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("vector-tool-change", { detail: { tool: "pen" } });
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={vectorTool === "rectangle" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setVectorTool("rectangle");
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("vector-tool-change", { detail: { tool: "rectangle" } });
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={vectorTool === "circle" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setVectorTool("circle");
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("vector-tool-change", { detail: { tool: "circle" } });
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={vectorTool === "path" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setVectorTool("path");
                      if (typeof window !== "undefined") {
                        const event = new CustomEvent("vector-tool-change", { detail: { tool: "path" } });
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs whitespace-nowrap">Stroke:</span>
                    <input
                      type="color"
                      value={vectorStrokeColor}
                      onChange={(e) => setVectorStrokeColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs whitespace-nowrap">Width:</span>
                    <Select onValueChange={(value) => setVectorStrokeWidth(parseInt(value))} value={vectorStrokeWidth.toString()}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={`${vectorStrokeWidth}px`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1px</SelectItem>
                        <SelectItem value="2">2px</SelectItem>
                        <SelectItem value="4">4px</SelectItem>
                        <SelectItem value="8">8px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Move className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowUpToLine className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowDownToLine className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Text on Path dropdown - only show in Vector tab when applicable */}
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs whitespace-nowrap font-medium">Text on Path:</span>
                      <Select 
                        value={attachTextToPath ? (document.body.getAttribute('data-pending-text-id') || '') : 'none'}
                        onValueChange={(value) => {
                          if (value === 'none') {
                            // Detach text
                            setAttachTextToPath(false);
                            // Notify vector canvas of attachment change
                            if (typeof window !== "undefined") {
                              const event = new CustomEvent("vector-text-attachment-change", { 
                                detail: { attachText: false } 
                              });
                              window.dispatchEvent(event);
                              console.log("[DesignStudioTool] Text attachment disabled");
                            }
                          } else {
                            // Attach text with selected ID
                            setAttachTextToPath(true);
                            // Update the pending text ID
                            document.body.setAttribute('data-pending-text-id', value);
                            
                            // Notify vector canvas of changes
                            if (typeof window !== "undefined") {
                              // Enable text attachment
                              const attachEvent = new CustomEvent("vector-text-attachment-change", { 
                                detail: { attachText: true } 
                              });
                              window.dispatchEvent(attachEvent);
                              
                              // Update selected text
                              const textEvent = new CustomEvent("vector-text-change", { 
                                detail: { textId: value } 
                              });
                              window.dispatchEvent(textEvent);
                              
                              console.log("[DesignStudioTool] Text attachment enabled with ID:", value);
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 min-h-8 w-[180px] bg-white dark:bg-gray-800 text-xs">
                          <SelectValue placeholder="Select text" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Option to detach text */}
                          <SelectItem value="none">None (Detach Text)</SelectItem>
                          
                          {/* Text nodes from the Text tab */}
                          {(() => {
                            const textNodes = useTextStore.getState().textNodes;
                            console.log("[DesignStudioTool] Available text nodes for dropdown:", 
                              textNodes.map(n => ({ id: n.id, text: n.text })));
                            
                            if (textNodes.length === 0) {
                              return <SelectItem value="no-texts" disabled>No text nodes available</SelectItem>;
                            }
                            
                            return textNodes.map((node: TextNode) => (
                              <SelectItem key={node.id} value={node.id}>
                                {node.text.substring(0, 20)}{node.text.length > 20 ? '...' : ''}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden h-[600px] flex flex-col" ref={vectorCanvasRef}>
                <VectorCanvas />
              </div>
            </TabsContent>
            
            <TabsContent value="raster" className="p-4 pt-0">
              <div className="bg-white dark:bg-gray-900 rounded-md overflow-hidden h-[600px] flex flex-col" ref={rasterCanvasRef}>
                <RasterCanvas />
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="p-4">
              <TextPanel />
            </TabsContent>
            
            <TabsContent value="ai" className="p-4">
              <AIToolsPanel />
            </TabsContent>
            
            <TabsContent value="export" className="p-4 pt-0">
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
  // Get raster store
  const { setCanvasRef } = useRasterStore()
  
  // Set up a persistent canvas that will be used for exporting
  useEffect(() => {
    // Create a persistent canvas element for raster content
    const persistentCanvas = document.createElement('canvas');
    persistentCanvas.width = 1200;
    persistentCanvas.height = 800;
    persistentCanvas.id = 'persistent-raster-canvas';
    persistentCanvas.style.display = 'none';
    document.body.appendChild(persistentCanvas);
    
    // Create a ref object for the persistent canvas
    const persistentRef = {
      current: persistentCanvas
    };
    
    // Register the persistent canvas with the store
    console.log("Registering persistent raster canvas with the store");
    setCanvasRef(persistentRef as React.RefObject<HTMLCanvasElement>);
    
    return () => {
      console.log("Cleaning up persistent raster canvas");
      setCanvasRef(null);
      if (persistentCanvas && document.body.contains(persistentCanvas)) {
        document.body.removeChild(persistentCanvas);
      }
    };
  }, [setCanvasRef]);

  return (
    <DesignStudioProvider>
      <DesignStudioToolContent />
    </DesignStudioProvider>
  )
}
