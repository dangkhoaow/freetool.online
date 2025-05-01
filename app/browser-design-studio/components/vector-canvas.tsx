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
      ctx.fillStyle = path.fill
      ctx.fill()
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

  // Handle mouse move event to continue drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
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
      const newPath: PathData = {
        id: `path-${Date.now()}`,
        type: currentTool === "rectangle" ? "rect" : 
              currentTool === "circle" ? "circle" : "path",
        points: currentPath,
        strokeColor,
        strokeWidth,
        fill: fillColor,
        closed: currentTool === "rectangle" || currentTool === "circle"
      }
      
      addPath(newPath)
    }
    
    setCurrentPath([])
  }

  // Special handling for shape tools
  const handleShapeTool = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== "rectangle" && currentTool !== "circle") return
    
    if (!isDrawing) {
      // Start drawing the shape
      handleMouseDown(e)
    } else {
      // We're already drawing, update the shape
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // For rectangle and circle, we only need start and current points
      if (currentPath.length >= 1) {
        const startPoint = currentPath[0]
        
        if (currentTool === "rectangle") {
          setCurrentPath([
            startPoint,
            { x: x, y: startPoint.y },
            { x, y },
            { x: startPoint.x, y },
            startPoint // Close the path
          ])
        } else if (currentTool === "circle") {
          // Calculate radius and center for circle
          const radiusX = Math.abs(x - startPoint.x) / 2
          const radiusY = Math.abs(y - startPoint.y) / 2
          const centerX = Math.min(startPoint.x, x) + radiusX
          const centerY = Math.min(startPoint.y, y) + radiusY
          
          // Generate points for an ellipse approximation
          const numPoints = 40
          const points: Point[] = []
          
          for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI
            const pointX = centerX + radiusX * Math.cos(angle)
            const pointY = centerY + radiusY * Math.sin(angle)
            points.push({ x: pointX, y: pointY })
          }
          
          // Close the path
          points.push(points[0])
          
          setCurrentPath(points)
        }
      }
    }
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
            variant={currentTool === "pen" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("pen")}
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "rectangle" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("rectangle")}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "circle" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("circle")}
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === "path" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("path")}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
          />
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-sm"
          >
            <option value="1">1px</option>
            <option value="2">2px</option>
            <option value="4">4px</option>
            <option value="8">8px</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-200 dark:border-gray-700"
          onMouseDown={currentTool === "select" ? undefined : handleMouseDown}
          onMouseMove={
            currentTool === "rectangle" || currentTool === "circle"
              ? handleShapeTool
              : handleMouseMove
          }
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  )
}
