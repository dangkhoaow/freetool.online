"use client"

import type { Layer, AdjustmentType } from "@/lib/services/photo-editor-service"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface AdjustmentsPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
}

export default function AdjustmentsPanel({ layers, activeLayerId, onUpdateLayer }: AdjustmentsPanelProps) {
  if (!activeLayerId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select a layer to adjust</p>
      </div>
    )
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId)
  if (!activeLayer) {
    return null
  }

  const getAdjustmentValue = (type: AdjustmentType): number => {
    const adjustment = activeLayer.filters.find((a) => a.type === type)
    return adjustment ? adjustment.value : 0
  }

  const handleAdjustmentChange = (type: AdjustmentType, value: number) => {
    const newFilters = activeLayer.filters.map((filter) => (filter.type === type ? { ...filter, value } : filter))

    onUpdateLayer(activeLayerId, { filters: newFilters })
  }

  const resetAdjustment = (type: AdjustmentType) => {
    handleAdjustmentChange(type, 0)
  }

  const resetAllAdjustments = () => {
    const resetFilters = activeLayer.filters.map((filter) => ({ ...filter, value: 0 }))
    onUpdateLayer(activeLayerId, { filters: resetFilters })
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Adjustments</h3>
        <Button variant="outline" size="sm" onClick={resetAllAdjustments} className="h-7 text-xs">
          Reset All
        </Button>
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Brightness</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("brightness")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("brightness")]}
            min={-100}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("brightness", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("brightness")}</span>
        </div>
      </div>

      {/* Contrast */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Contrast</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("contrast")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("contrast")]}
            min={-100}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("contrast", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("contrast")}</span>
        </div>
      </div>

      {/* Saturation */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Saturation</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("saturation")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("saturation")]}
            min={-100}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("saturation", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("saturation")}</span>
        </div>
      </div>

      {/* Hue */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Hue</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("hue")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("hue")]}
            min={-180}
            max={180}
            step={1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("hue", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("hue")}</span>
        </div>
      </div>

      {/* Blur */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Blur</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("blur")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("blur")]}
            min={0}
            max={20}
            step={0.1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("blur", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("blur").toFixed(1)}</span>
        </div>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Temperature</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("temperature")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("temperature")]}
            min={-100}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("temperature", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("temperature")}</span>
        </div>
      </div>

      {/* Tint */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Tint</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => resetAdjustment("tint")}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[getAdjustmentValue("tint")]}
            min={-100}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(values) => handleAdjustmentChange("tint", values[0])}
          />
          <span className="text-sm w-10 text-right">{getAdjustmentValue("tint")}</span>
        </div>
      </div>
    </div>
  )
}
