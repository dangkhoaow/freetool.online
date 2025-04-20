"use client"

import { useState, useEffect } from "react"
import type { Layer } from "@/lib/services/photo-editor-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface TextPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
  onAddLayer: (layer: Layer) => void
}

export default function TextPanel({ layers, activeLayerId, onUpdateLayer, onAddLayer }: TextPanelProps) {
  const [text, setText] = useState("Your text here")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState(24)
  const [fontWeight, setFontWeight] = useState("normal")
  const [fontStyle, setFontStyle] = useState("normal")
  const [textDecoration, setTextDecoration] = useState("none")
  const [textAlign, setTextAlign] = useState("left")
  const [color, setColor] = useState("#000000")

  const activeLayer = activeLayerId ? layers.find((l) => l.id === activeLayerId) : null
  const isTextLayer = activeLayer?.type === "text"

  // If we have an active text layer, load its properties
  useEffect(() => {
    if (isTextLayer && activeLayer?.data) {
      const textData = activeLayer.data
      setText(textData.text || "Your text here")
      setFontFamily(textData.fontFamily || "Arial")
      setFontSize(textData.fontSize || 24)
      setFontWeight(textData.fontWeight || "normal")
      setFontStyle(textData.fontStyle || "normal")
      setTextDecoration(textData.textDecoration || "none")
      setTextAlign(textData.textAlign || "left")
      setColor(textData.color || "#000000")
    }
  }, [activeLayerId, isTextLayer, activeLayer])

  const handleAddTextLayer = () => {
    const textData = {
      text,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textDecoration,
      textAlign,
      color,
    }

    const newLayer: Layer = {
      id: uuidv4(),
      name: "Text Layer",
      type: "text",
      visible: true,
      locked: false,
      opacity: 100,
      data: textData,
      position: { x: 100, y: 100 },
      width: 200,
      height: 50,
      rotation: 0,
      filters: [],
      blendMode: "normal",
    }

    onAddLayer(newLayer)
  }

  const handleUpdateText = () => {
    if (!activeLayerId || !isTextLayer) return

    const textData = {
      text,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textDecoration,
      textAlign,
      color,
    }

    onUpdateLayer(activeLayerId, { data: textData })
  }

  const toggleBold = () => {
    setFontWeight((prev) => (prev === "bold" ? "normal" : "bold"))
  }

  const toggleItalic = () => {
    setFontStyle((prev) => (prev === "italic" ? "normal" : "italic"))
  }

  const toggleUnderline = () => {
    setTextDecoration((prev) => (prev === "underline" ? "none" : "underline"))
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Text Tool</h3>

        {!isTextLayer && (
          <Button variant="default" size="sm" onClick={handleAddTextLayer} className="h-7 text-xs">
            Add Text Layer
          </Button>
        )}
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text..."
        className="min-h-[80px]"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Font Family</label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Impact">Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Font Size</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[fontSize]}
              min={8}
              max={120}
              step={1}
              className="flex-1"
              onValueChange={(values) => setFontSize(values[0])}
            />
            <span className="text-sm w-10">{fontSize}px</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={fontWeight === "bold" ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleBold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={fontStyle === "italic" ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleItalic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={textDecoration === "underline" ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleUnderline}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant={textAlign === "left" ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setTextAlign("left")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={textAlign === "center" ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setTextAlign("center")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={textAlign === "right" ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setTextAlign("right")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Text Color</label>
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-md border cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => document.getElementById("text-color-picker")?.click()}
          />
          <Input
            id="text-color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-0 h-0 opacity-0 absolute"
          />
          <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 h-8" />
        </div>
      </div>

      <div className="pt-4">
        <Button className="w-full" onClick={isTextLayer ? handleUpdateText : handleAddTextLayer}>
          {isTextLayer ? "Update Text" : "Add Text Layer"}
        </Button>
      </div>

      <div className="mt-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-800">
        <h4 className="text-sm font-medium mb-2">Preview</h4>
        <div className="p-4 bg-white dark:bg-slate-700 rounded border min-h-[80px] flex items-center justify-center">
          <div
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight,
              fontStyle,
              textDecoration,
              textAlign,
              color,
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}
