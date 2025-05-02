"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
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

interface Point {
  x: number
  y: number
}

type RasterTool = "select" | "brush" | "eraser" | "fill" | "eyedropper" | "move"

export default function RasterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [currentTool, setCurrentTool] = useState<RasterTool>("brush")
  const [currentBrush, setCurrentBrush] = useState<BrushStyle>({
    size: 10,
    hardness: 0.5,
    opacity: 1,
    color: "#000000",
    blendMode: "source-over",
  })
  
  // Access raster store
  const { 
    layers,
    activeLayerIndex,
    setActiveLayerIndex,
    addLayer,
    updateLayer,
    deleteLayer,
    history,
    pushHistory,
    loadImageData,
    setCanvasRef 
  } = useRasterStore()
  
  // Effect to register the canvas ref in the store
  useEffect(() => {
    console.log("Registering raster canvas ref in store");
    setCanvasRef(canvasRef);
    
    return () => {
      console.log("Cleaning up raster canvas ref in store");
      setCanvasRef(null);
    };
  }, [setCanvasRef]);
  
  // Render all visible layers
  const renderLayers = useCallback(() => {
    console.log("[RasterCanvas] renderLayers called");
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (!canvas || !ctx) {
      console.error("[RasterCanvas] renderLayers - Canvas or context is null");
      return;
    }
    
    console.log("[RasterCanvas] Layers count:", layers.length);
    console.log("[RasterCanvas] Active layer index:", activeLayerIndex);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("[RasterCanvas] Canvas cleared");
    
    // Draw each visible layer in order
    layers.forEach((layer, index) => {
      console.log(`[RasterCanvas] Processing layer ${index}: ${layer.name}, visible: ${layer.visible}, has data: ${!!layer.imageData}`);
      
      if (layer.visible && layer.imageData) {
        // Set global alpha for layer opacity
        ctx.globalAlpha = layer.opacity;
        
        // Set blend mode
        ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        
        // Create a temporary canvas to apply the layer's blend mode
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        
        if (tempCtx && layer.imageData) {
          tempCtx.putImageData(layer.imageData, 0, 0);
          console.log(`[RasterCanvas] Drawing layer ${index} to main canvas`);
          
          // Draw the layer with its blend mode onto the main canvas
          ctx.drawImage(tempCanvas, 0, 0);
        } else {
          console.error(`[RasterCanvas] Failed to get temp context for layer ${index}`);
        }
      }
    });
    
    // Reset to default settings
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    console.log("[RasterCanvas] Layers rendering complete");
  }, [layers, activeLayerIndex]);
  
  // Function to sync the current canvas with the persistent canvas
  const syncWithPersistentCanvas = useCallback(() => {
    console.log("[RasterCanvas] syncWithPersistentCanvas called");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("[RasterCanvas] syncWithPersistentCanvas - Canvas is null");
      return;
    }

    // Find the persistent canvas
    const persistentCanvas = document.getElementById('persistent-raster-canvas') as HTMLCanvasElement;
    if (!persistentCanvas) {
      console.error("[RasterCanvas] Persistent canvas not found");
      return;
    }

    // Get contexts
    const ctx = canvas.getContext('2d');
    const persistentCtx = persistentCanvas.getContext('2d');
    if (!ctx || !persistentCtx) {
      console.error("[RasterCanvas] Could not get context from canvas");
      return;
    }

    console.log("[RasterCanvas] Canvas dimensions:", canvas.width, "x", canvas.height);
    console.log("[RasterCanvas] Persistent canvas dimensions:", persistentCanvas.width, "x", persistentCanvas.height);

    try {
      // Make sure persistent canvas has the same dimensions
      persistentCanvas.width = canvas.width;
      persistentCanvas.height = canvas.height;
      
      // IMPORTANT: We only copy FROM the visible canvas TO the persistent canvas
      // Clear the persistent canvas first to avoid ghosting
      persistentCtx.clearRect(0, 0, persistentCanvas.width, persistentCanvas.height);
      
      // Copy the current canvas to the persistent canvas (for export purposes)
      persistentCtx.drawImage(canvas, 0, 0);
      console.log("[RasterCanvas] Successfully synced visible canvas TO persistent canvas");
    } catch (error) {
      console.error("[RasterCanvas] Error syncing with persistent canvas:", error);
    }
  }, []);

  // Handle mouse up to stop drawing
  const handleMouseUp = useCallback(() => {
    console.log("[RasterCanvas] handleMouseUp", isDrawing);
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setLastPoint(null);
    
    // We don't need to call renderLayers here as it's already been called
    // during the mouse move drawing operations
    
    // Copy the current visible canvas to the persistent canvas
    // We use a slight delay to ensure all drawing operations are complete
    console.log("[RasterCanvas] Setting timeout for sync");
    setTimeout(() => {
      console.log("[RasterCanvas] Timeout fired, syncing with persistent canvas");
      // This only copies TO the persistent canvas, not FROM it
      syncWithPersistentCanvas();
    }, 50);
  }, [isDrawing, syncWithPersistentCanvas]);
  
  // Initialize canvas on mount
  useEffect(() => {
    console.log("[RasterCanvas] Initializing canvas on mount");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("[RasterCanvas] Canvas ref is null on mount");
      return;
    }

    // Set up the canvas size once on mount
    console.log("[RasterCanvas] Setting canvas dimensions to 1200x800");
    canvas.width = 1200;
    canvas.height = 800;

    // Initialize the canvas with a white background
    const ctx = canvas.getContext("2d");
    if (ctx) {
      console.log("[RasterCanvas] Filling canvas with white background");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create an initial layer if none exists
      if (layers.length === 0) {
        console.log("[RasterCanvas] No layers found, creating initial background layer");
        // Get the initial canvas data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Add the initial layer
        addLayer({
          id: `layer-${Date.now()}`,
          name: "Background",
          visible: true,
          opacity: 1,
          blendMode: "normal",
          imageData
        });
        
        // Set the active layer
        setActiveLayerIndex(0);
        console.log("[RasterCanvas] Background layer created and set as active");
      }
      
      // Sync with the persistent canvas after initialization
      console.log("[RasterCanvas] Syncing with persistent canvas after initialization");
      syncWithPersistentCanvas();
    } else {
      console.error("[RasterCanvas] Could not get 2D context from canvas");
    }
  }, [addLayer, layers.length, setActiveLayerIndex, syncWithPersistentCanvas]);

  // Handle brush drawing
  const drawBrush = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    options: BrushStyle
  ) => {
    console.log(`[RasterCanvas] Drawing brush at (${x.toFixed(1)}, ${y.toFixed(1)})`);
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
    console.log(`[RasterCanvas] Drawing line from (${x1.toFixed(1)}, ${y1.toFixed(1)}) to (${x2.toFixed(1)}, ${y2.toFixed(1)})`);
    // Calculate distance between points
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    
    // Calculate number of steps based on distance and brush size
    // Smaller brush = more steps for smoother lines
    const stepsPerPixel = Math.max(2, 6 - Math.floor(options.size / 10))
    const steps = Math.max(Math.floor(dist * stepsPerPixel), 1)
    
    // Interpolate points along the line with higher precision
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      
      drawBrush(ctx, x, y, options)
    }
  }

  // Handle mouse down to start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("[RasterCanvas] handleMouseDown");
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d", { willReadFrequently: true })
    
    if (!canvas || !ctx || activeLayerIndex === null) return
    
    setIsDrawing(true)
    
    // Save canvas state before drawing for history
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    pushHistory(imageData)
    
    // Get precise mouse position relative to canvas
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
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
    
    // Get precise mouse position relative to canvas (adjusting for any scaling)
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    console.log(`[RasterCanvas] Mouse move at (${x.toFixed(1)}, ${y.toFixed(1)})`);
    
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
    
    // Update last point with precise coordinates
    setLastPoint({ x, y })
    
    // Update the active layer with new image data
    const updatedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    updateLayer(activeLayerIndex, { imageData: updatedImageData })
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
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap">Size:</span>
            <Slider
              value={[currentBrush.size]}
              min={1}
              max={100}
              step={1}
              onValueChange={handleBrushSizeChange}
              className="w-24"
            />
            <span className="text-xs">{currentBrush.size}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap">Hard:</span>
            <Slider
              value={[currentBrush.hardness]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleBrushHardnessChange}
              className="w-24"
            />
            <span className="text-xs">{Math.round(currentBrush.hardness * 100)}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap">Opacity:</span>
            <Slider
              value={[currentBrush.opacity]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleBrushOpacityChange}
              className="w-24"
            />
            <span className="text-xs">{Math.round(currentBrush.opacity * 100)}%</span>
          </div>
          
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
      
      <div className="flex-1 relative bg-white dark:bg-gray-950 overflow-hidden">
        <canvas
          id="raster-main-canvas"
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
