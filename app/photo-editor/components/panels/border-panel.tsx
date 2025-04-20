"use client"

import { useState } from "react"
import type { Layer } from "@/lib/services/photo-editor-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BorderPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
}

export default function BorderPanel({ layers, activeLayerId, onUpdateLayer }: BorderPanelProps) {
  const [borderWidth, setBorderWidth] = useState(5)
  const [borderColor, setBorderColor] = useState("#000000")
  const [borderStyle, setBorderStyle] = useState<"solid" | "dashed" | "dotted">("solid")
  const [borderRadius, setBorderRadius] = useState(0)
  const [applyToAll, setApplyToAll] = useState(false)

  const activeLayer = activeLayerId ? layers.find((l) => l.id === activeLayerId) : null

  const handleApplyBorder = () => {
    if (!activeLayerId) return

    // In a real implementation, this would update the layer with border properties
    // For demonstration purposes, we're showing the UI only
    alert(
      "Border would be applied with the following settings:\n" +
        `Width: ${borderWidth}px\n` +
        `Color: ${borderColor}\n` +
        `Style: ${borderStyle}\n` +
        `Radius: ${borderRadius}px\n` +
        `Apply to all corners: ${applyToAll ? "Yes" : "No"}`,
    )
  }

  if (!activeLayerId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select a layer to add a border</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium">Border Settings</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm">Width</label>
          <span className="text-sm">{borderWidth}px</span>
        </div>
        <Slider value={[borderWidth]} min={0} max={20} step={1} onValueChange={(values) => setBorderWidth(values[0])} />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Color</label>
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-md border cursor-pointer"
            style={{ backgroundColor: borderColor }}
            onClick={() => document.getElementById("border-color-picker")?.click()}
          />
          <Input
            id="border-color-picker"
            type="color"
            value={borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
            className="w-0 h-0 opacity-0 absolute"
          />
          <Input value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="flex-1 h-8" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm">Style</label>
        <Select value={borderStyle} onValueChange={(value: "solid" | "dashed" | "dotted") => setBorderStyle(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Border style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm">Corner Radius</label>
          <span className="text-sm">{borderRadius}px</span>
        </div>
        <Slider
          value={[borderRadius]}
          min={0}
          max={50}
          step={1}
          onValueChange={(values) => setBorderRadius(values[0])}
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="apply-to-all"
          checked={applyToAll}
          onChange={(e) => setApplyToAll(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="apply-to-all" className="text-sm">
          Apply to all corners
        </label>
      </div>

      <div className="pt-4">
        <Button className="w-full" onClick={handleApplyBorder}>
          Apply Border
        </Button>
      </div>

      <div className="mt-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-800">
        <h4 className="text-sm font-medium mb-2">Preview</h4>
        <div
          className="aspect-video rounded flex items-center justify-center bg-white"
          style={{
            borderWidth: `${borderWidth}px`,
            borderStyle: borderStyle,
            borderColor: borderColor,
            borderRadius: `${applyToAll ? borderRadius : 0}px`,
          }}
        >
          <div className="text-center text-sm text-gray-500">Border Preview</div>
        </div>
      </div>
    </div>
  )
}
