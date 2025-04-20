"use client"

import { useRef, useEffect, forwardRef, useState, useImperativeHandle } from "react"
import type { EditorTool } from "./photo-editor"
import { type Layer, magicSelection } from "@/lib/services/photo-editor-service"
import { Spinner } from "@/components/ui/spinner"

interface CanvasAreaProps {
  width: number
  height: number
  scale: number
  layers: Layer[]
  activeLayerId: string | null
  setActiveLayerId: (id: string) => void
  currentTool: EditorTool
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
}

const CanvasArea = forwardRef<HTMLCanvasElement, CanvasAreaProps>(
  ({ width, height, scale, layers, activeLayerId, setActiveLayerId, currentTool, onUpdateLayer }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isRendering, setIsRendering] = useState(false)
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
    const selectionRef = useRef<Path2D | null>(null)

    // Mouse position state
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // Expose the canvas ref
    useImperativeHandle(ref, () => canvasRef.current!)

    // Render the canvas
    const renderCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      setIsRendering(true)

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create transparent background (only visible in exported images)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw checkered pattern for better visibility of transparent areas
      const patternSize = 10
      for (let x = 0; x < canvas.width; x += patternSize * 2) {
        for (let y = 0; y < canvas.height; y += patternSize * 2) {
          ctx.fillStyle = "#f0f0f0"
          ctx.fillRect(x, y, patternSize, patternSize)
          ctx.fillRect(x + patternSize, y + patternSize, patternSize, patternSize)
          ctx.fillStyle = "#e0e0e0"
          ctx.fillRect(x + patternSize, y, patternSize, patternSize)
          ctx.fillRect(x, y + patternSize, patternSize, patternSize)
        }
      }

      // Render each visible layer
      layers
        .filter((layer) => layer.visible)
        .forEach((layer) => {
          // Skip layers without data
          if (!layer.data) return

          ctx.save()

          // Apply blend mode
          ctx.globalCompositeOperation = layer.blendMode === "normal" ? "source-over" : layer.blendMode

          // Apply opacity
          ctx.globalAlpha = layer.opacity / 100

          // Apply transformations
          ctx.translate(layer.position.x + layer.width / 2, layer.position.y + layer.height / 2)
          ctx.rotate((layer.rotation * Math.PI) / 180)
          ctx.translate(-(layer.position.x + layer.width / 2), -(layer.position.y + layer.height / 2))

          // Render by layer type
          if (layer.type === "image" && layer.data instanceof HTMLImageElement) {
            ctx.drawImage(layer.data, layer.position.x, layer.position.y, layer.width, layer.height)
          } else if (layer.type === "text" && typeof layer.data === "object") {
            const textData = layer.data
            ctx.font = `${textData.fontStyle} ${textData.fontWeight} ${textData.fontSize}px ${textData.fontFamily}`
            ctx.fillStyle = textData.color
            ctx.textBaseline = "top"
            ctx.fillText(textData.text, layer.position.x, layer.position.y)
          } else if (layer.type === "shape" && layer.data instanceof Path2D) {
            const shapeData = layer.data
            ctx.fillStyle = shapeData.fillStyle || "#000"
            ctx.strokeStyle = shapeData.strokeStyle || "#000"
            ctx.lineWidth = shapeData.lineWidth || 1

            if (shapeData.fill) {
              ctx.fill(layer.data)
            }

            if (shapeData.stroke) {
              ctx.stroke(layer.data)
            }
          }

          // Draw selection outline for active layer
          if (layer.id === activeLayerId) {
            ctx.strokeStyle = "#0ea5e9"
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(layer.position.x - 2, layer.position.y - 2, layer.width + 4, layer.height + 4)

            // Draw transform handles
            ctx.fillStyle = "#0ea5e9"
            const handleSize = 8

            // Corner handles
            ;[
              { x: layer.position.x - handleSize / 2, y: layer.position.y - handleSize / 2 },
              { x: layer.position.x + layer.width - handleSize / 2, y: layer.position.y - handleSize / 2 },
              { x: layer.position.x - handleSize / 2, y: layer.position.y + layer.height - handleSize / 2 },
              {
                x: layer.position.x + layer.width - handleSize / 2,
                y: layer.position.y + layer.height - handleSize / 2,
              },
            ].forEach((pos) => {
              ctx.fillRect(pos.x, pos.y, handleSize, handleSize)
            })

            // Side handles
            ;[
              { x: layer.position.x + layer.width / 2 - handleSize / 2, y: layer.position.y - handleSize / 2 },
              { x: layer.position.x - handleSize / 2, y: layer.position.y + layer.height / 2 - handleSize / 2 },
              {
                x: layer.position.x + layer.width - handleSize / 2,
                y: layer.position.y + layer.height / 2 - handleSize / 2,
              },
              {
                x: layer.position.x + layer.width / 2 - handleSize / 2,
                y: layer.position.y + layer.height - handleSize / 2,
              },
            ].forEach((pos) => {
              ctx.fillRect(pos.x, pos.y, handleSize, handleSize)
            })

            // Rotation handle
            ctx.beginPath()
            ctx.moveTo(layer.position.x + layer.width / 2, layer.position.y - 30)
            ctx.lineTo(layer.position.x + layer.width / 2, layer.position.y)
            ctx.stroke()
            ctx.fillRect(
              layer.position.x + layer.width / 2 - handleSize / 2,
              layer.position.y - 30 - handleSize / 2,
              handleSize,
              handleSize,
            )
          }

          ctx.restore()
        })

      // Draw current selection if any
      if (selectionRef.current) {
        ctx.save()
        ctx.strokeStyle = "#0ea5e9"
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.stroke(selectionRef.current)
        ctx.restore()
      }

      setIsRendering(false)
    }

    // Initialize canvas size
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = width
      canvas.height = height

      renderCanvas()
    }, [width, height])

    // Re-render when layers, activeLayerId, or scale changes
    useEffect(() => {
      renderCanvas()
    }, [layers, activeLayerId, scale])

    // Handle mouse events for tools
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const getLocalCoords = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        return {
          x: (e.clientX - rect.left) / scale,
          y: (e.clientY - rect.top) / scale,
        }
      }

      const handleMouseDown = (e: MouseEvent) => {
        const coords = getLocalCoords(e)

        if (currentTool === "hand") {
          setIsPanning(true)
          setPanStart({ x: e.clientX, y: e.clientY })
          return
        }

        if (currentTool === "move") {
          // Check if clicked on a layer
          for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i]
            if (!layer.visible || layer.locked) continue

            if (
              coords.x >= layer.position.x &&
              coords.x <= layer.position.x + layer.width &&
              coords.y >= layer.position.y &&
              coords.y <= layer.position.y + layer.height
            ) {
              setActiveLayerId(layer.id)
              break
            }
          }
        } else if (currentTool === "magicWand" && activeLayerId) {
          const activeLayer = layers.find((l) => l.id === activeLayerId)
          if (!activeLayer) return

          const ctx = canvas.getContext("2d")!
          const selection = magicSelection(ctx, Math.floor(coords.x), Math.floor(coords.y), 30)
          selectionRef.current = selection.path
          renderCanvas()
        } else if (currentTool === "selection") {
          // Start a new rectangular selection
          selectionRef.current = new Path2D()
          selectionRef.current.rect(coords.x, coords.y, 1, 1)
          renderCanvas()
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        const coords = getLocalCoords(e)
        setMousePosition(coords)

        if (isPanning && currentTool === "hand") {
          const dx = e.clientX - panStart.x
          const dy = e.clientY - panStart.y
          setViewportOffset((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }))
          setPanStart({ x: e.clientX, y: e.clientY })
          return
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        if (isPanning) {
          setIsPanning(false)
          return
        }

        if (currentTool === "selection" && selectionRef.current) {
          // Finalize selection
          selectionRef.current = null
          renderCanvas()
        }
      }

      canvas.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }, [currentTool, layers, activeLayerId, scale, isPanning, panStart])

    // Set up keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in input fields
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return
        }

        if (e.key === "Escape") {
          // Clear selection
          selectionRef.current = null
          renderCanvas()
        }
      }

      window.addEventListener("keydown", handleKeyDown)

      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [])

    return (
      <div
        ref={containerRef}
        className="flex-1 relative bg-[#8a8a8a] overflow-auto"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='10' height='10' fill='%23f0f0f0'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23f0f0f0'/%3E%3Crect x='10' width='10' height='10' fill='%23e0e0e0'/%3E%3Crect y='10' width='10' height='10' fill='%23e0e0e0'/%3E%3C/svg%3E\")",
        }}
      >
        <div className="absolute top-2 left-2 bg-white bg-opacity-80 rounded px-2 py-1 text-xs z-10">
          {mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)} px | {Math.round(scale * 100)}%
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px)`,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              transform: `scale(${scale})`,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          />
        </div>

        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <Spinner size="lg" />
          </div>
        )}
      </div>
    )
  },
)

CanvasArea.displayName = "CanvasArea"

export default CanvasArea
