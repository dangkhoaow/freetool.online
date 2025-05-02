"use client"

import React, { useRef, useEffect, useState } from "react"
import { useVectorStore } from "@/lib/services/browser-design-studio/stores/vector-store"
import { Button } from "@/components/ui/button"
import { MousePointer, Pen, Square, Circle, PenTool } from "lucide-react"

interface Point {
  x: number
  y: number
}

interface PathData {
  id: string
  type: string
  points: Point[]
  strokeColor: string
  strokeWidth: number
  fill: string
  closed: boolean
}

export default function VectorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [currentTool, setCurrentTool] = useState<string>("pen")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fillColor, setFillColor] = useState("transparent")
  
  // Create connection to vector store for state management
  const { 
    paths, 
    addPath, 
    updatePath, 
    clearPaths,
    selectedPathId,
    setSelectedPathId
  } = useVectorStore()

  // Make component methods available externally
  useEffect(() => {
    // Add data attribute for component reference finding
    const canvas = canvasRef.current?.parentElement;
    if (canvas) {
      canvas.setAttribute('data-component-name', 'VectorCanvas');
    }

    // Listen for tool change events from sidebar
    const handleToolChange = (event: CustomEvent) => {
      if (event.detail && event.detail.tool) {
        setCurrentTool(event.detail.tool);
      }
    };

    const handleStrokeColorChange = (event: CustomEvent) => {
      if (event.detail && event.detail.color) {
        setStrokeColor(event.detail.color);
      }
    };

    const handleStrokeWidthChange = (event: CustomEvent) => {
      if (event.detail && event.detail.width) {
        setStrokeWidth(event.detail.width);
      }
    };

    window.addEventListener('vector-tool-change', handleToolChange as EventListener);
    window.addEventListener('vector-stroke-color-change', handleStrokeColorChange as EventListener);
    window.addEventListener('vector-stroke-width-change', handleStrokeWidthChange as EventListener);
    
    return () => {
      window.removeEventListener('vector-tool-change', handleToolChange as EventListener);
      window.removeEventListener('vector-stroke-color-change', handleStrokeColorChange as EventListener);
      window.removeEventListener('vector-stroke-width-change', handleStrokeWidthChange as EventListener);
    };
  }, []);

  // Initialize canvas and rendering context
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    
    if (!canvas || !ctx) return
    
    // Set up canvas dimensions and scale for high DPI displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    ctx.scale(dpr, dpr)
    
    // Reset canvas and redraw all paths
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw existing paths
    paths.forEach(drawPath)
    
    // Draw current path if we're in the middle of drawing
    if (isDrawing && currentPath.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      
      currentPath.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      
      ctx.stroke()
    }
  }, [paths, currentPath, isDrawing, strokeColor, strokeWidth])

  // Draw a single path on the canvas
  const drawPath = (path: PathData) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    
    if (!ctx) return
    
    ctx.beginPath()
    ctx.strokeStyle = path.strokeColor
    ctx.lineWidth = path.strokeWidth
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    
    path.points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    
    if (path.closed) {
      ctx.closePath()
      // Use a semi-transparent fill for better visibility
      if (path.type === "rect" || path.type === "circle") {
        ctx.fillStyle = path.fill !== "transparent" ? path.fill : "rgba(255, 255, 255, 0.1)"
        ctx.fill()
      }
    }
    
    ctx.stroke()
    
    // Draw selection indicator if this path is selected
    if (path.id === selectedPathId) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      // Create a bounding box for the path
      const points = path.points
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
      
      // Add padding
      const padding = 5
      ctx.strokeRect(
        minX - padding, 
        minY - padding, 
        maxX - minX + padding * 2, 
        maxY - minY + padding * 2
      )
      
      ctx.setLineDash([])
    }
  }

  // Handle mouse down event to start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "select") return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setCurrentPath([{ x, y }])
  }

  // Special handling for shape tools
  const startPoint = useRef<Point | null>(null);
  const handleShapeTool = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log("Drawing from:", { x: startPoint.current.x, y: startPoint.current.y }, "to:", { x, y });

    if (currentTool === "rectangle") {
      // Rectangle drawing logic
      const minX = Math.min(startPoint.current.x, x);
      const maxX = Math.max(startPoint.current.x, x);
      const minY = Math.min(startPoint.current.y, y);
      const maxY = Math.max(startPoint.current.y, y);

      const points = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
        { x: minX, y: minY },
      ];
      setCurrentPath(points);
    } else if (currentTool === "circle") {
      // Circle drawing logic
      const radius = Math.sqrt(
        Math.pow(x - startPoint.current.x, 2) + Math.pow(y - startPoint.current.y, 2)
      );

      const points = [];
      const steps = 64;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        points.push({
          x: startPoint.current.x + Math.cos(angle) * radius,
          y: startPoint.current.y + Math.sin(angle) * radius,
        });
      }
      if (points.length > 0) {
        points.push({ ...points[0] });
      }
      setCurrentPath(points);
    }
  }

  // Handle mouse move event to continue drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    // For rectangle and circle tools, use the specialized handler
    if (currentTool === "rectangle" || currentTool === "circle") {
      handleShapeTool(e)
      return
    }
    
    // For other tools (pen, path, etc.)
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCurrentPath([...currentPath, { x, y }])
  }

  // Handle mouse up event to finish drawing
  const handleMouseUp = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    // Only add the path if it has at least 2 points
    if (currentPath.length >= 2) {
      let actualFill = fillColor;
      // For MS Paint-like behavior, use a light fill for shapes by default if none is set
      if ((currentTool === "rectangle" || currentTool === "circle") && fillColor === "transparent") {
        actualFill = "rgba(255, 255, 255, 0.1)";
      }
      
      const newPath: PathData = {
        id: `path-${Date.now()}`,
        type: currentTool === "rectangle" ? "rect" : 
              currentTool === "circle" ? "circle" : "path",
        points: currentPath,
        strokeColor,
        strokeWidth,
        fill: actualFill,
        closed: currentTool === "rectangle" || currentTool === "circle"
      }
      
      addPath(newPath)
    }
    
    setCurrentPath([])
    startPoint.current = null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar removed entirely to maximize drawing space */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-white dark:bg-gray-900"
        onMouseDown={(e) => {
          if (currentTool === "select") return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setIsDrawing(true);
          setCurrentPath([{ x, y }]);
          startPoint.current = { x, y };
        }}
        onMouseMove={(e) => {
          if (isDrawing) {
            handleMouseMove(e);
          }
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
