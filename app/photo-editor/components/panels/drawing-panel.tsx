"use client"

import { useState } from "react"
import type { Layer } from "@/lib/services/photo-editor-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Paintbrush, Eraser, Circle, Square, PenLineIcon as Line, Pen } from "lucide-react"

interface DrawingPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
}

export default function DrawingPanel({ layers, activeLayerId, onUpdateLayer }: DrawingPanelProps) {
  const [tool, setTool] = useState<"brush" | "eraser" | "shape">("brush")
  const [brushSize, setBrushSize] = useState(10)
  const [brushHardness, setBrushHardness] = useState(100)
  const [brushOpacity, setBrushOpacity] = useState(100)
  const [brushColor, setBrushColor] = useState("#000000")
  const [shapeType, setShapeType] = useState<"circle" | "rectangle" | "line" | "freeform">("rectangle")
  const [fillShape, setFillShape] = useState(true)

  const handleToolChange = (newTool: typeof tool) => {
    setTool(newTool)
  }

  if (!activeLayerId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select a layer to draw on</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Drawing Tools</h3>
        <div className="flex gap-2">
          <Button
            variant={tool === "brush" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleToolChange("brush")}
          >
            <Paintbrush className="h-4 w-4 mr-2" /> Brush
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleToolChange("eraser")}
          >
            <Eraser className="h-4 w-4 mr-2" /> Eraser
          </Button>
          <Button
            variant={tool === "shape" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleToolChange("shape")}
          >
            <Square className="h-4 w-4 mr-2" /> Shape
          </Button>
        </div>
      </div>

      {tool === "brush" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Brush Size</label>
              <span className="text-sm">{brushSize}px</span>
            </div>
            <Slider
              value={[brushSize]}
              min={1}
              max={100}
              step={1}
              onValueChange={(values) => setBrushSize(values[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Hardness</label>
              <span className="text-sm">{brushHardness}%</span>
            </div>
            <Slider
              value={[brushHardness]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setBrushHardness(values[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Opacity</label>
              <span className="text-sm">{brushOpacity}%</span>
            </div>
            <Slider
              value={[brushOpacity]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setBrushOpacity(values[0])}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Color</label>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md border cursor-pointer"
                style={{ backgroundColor: brushColor }}
                onClick={() => document.getElementById("brush-color-picker")?.click()}
              />
              <Input
                id="brush-color-picker"
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-0 h-0 opacity-0 absolute"
              />
              <Input value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="flex-1 h-8" />
            </div>
          </div>
        </div>
      )}

      {tool === "eraser" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Eraser Size</label>
              <span className="text-sm">{brushSize}px</span>
            </div>
            <Slider
              value={[brushSize]}
              min={1}
              max={100}
              step={1}
              onValueChange={(values) => setBrushSize(values[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Hardness</label>
              <span className="text-sm">{brushHardness}%</span>
            </div>
            <Slider
              value={[brushHardness]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setBrushHardness(values[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Opacity</label>
              <span className="text-sm">{brushOpacity}%</span>
            </div>
            <Slider
              value={[brushOpacity]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setBrushOpacity(values[0])}
            />
          </div>
        </div>
      )}

      {tool === "shape" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Shape Type</label>
            <div className="flex gap-2">
              <Button
                variant={shapeType === "rectangle" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setShapeType("rectangle")}
              >
                <Square className="h-4 w-4 mr-2" /> Rectangle
              </Button>
              <Button
                variant={shapeType === "circle" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setShapeType("circle")}
              >
                <Circle className="h-4 w-4 mr-2" /> Circle
              </Button>
              <Button
                variant={shapeType === "line" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setShapeType("line")}
              >
                <Line className="h-4 w-4 mr-2" /> Line
              </Button>
              <Button
                variant={shapeType === "freeform" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setShapeType("freeform")}
              >
                <Pen className="h-4 w-4 mr-2" /> Freeform
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm">Line Width</label>
              <span className="text-sm">{brushSize}px</span>
            </div>
            <Slider value={[brushSize]} min={1} max={50} step={1} onValueChange={(values) => setBrushSize(values[0])} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="fill-shape"
              checked={fillShape}
              onChange={(e) => setFillShape(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="fill-shape" className="text-sm">
              Fill Shape
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Color</label>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md border cursor-pointer"
                style={{ backgroundColor: brushColor }}
                onClick={() => document.getElementById("shape-color-picker")?.click()}
              />
              <Input
                id="shape-color-picker"
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-0 h-0 opacity-0 absolute"
              />
              <Input value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="flex-1 h-8" />
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 flex gap-3">
        <Button variant="outline" className="flex-1">
          Undo
        </Button>
        <Button variant="outline" className="flex-1">
          Redo
        </Button>
      </div>
    </div>
  )
}
