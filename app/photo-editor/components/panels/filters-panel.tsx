"use client"

import { useState } from "react"
import { type Layer, FILTER_PRESETS } from "@/lib/services/photo-editor-service"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FiltersPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
}

export default function FiltersPanel({ layers, activeLayerId, onUpdateLayer }: FiltersPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  if (!activeLayerId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select a layer to apply filters</p>
      </div>
    )
  }

  const activeLayer = layers.find((l) => l.id === activeLayerId)
  if (!activeLayer) {
    return null
  }

  const handleApplyFilter = (presetId: string) => {
    setSelectedPreset(presetId)

    // Apply the preset adjustments
    const preset = FILTER_PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    // Update the layer's filters with the preset adjustments
    // This would merge over existing adjustments
    const newFilters = [...activeLayer.filters]

    preset.adjustments.forEach((presetAdjustment) => {
      const existingIndex = newFilters.findIndex((f) => f.type === presetAdjustment.type)
      if (existingIndex !== -1) {
        newFilters[existingIndex] = { ...presetAdjustment }
      }
    })

    onUpdateLayer(activeLayerId, { filters: newFilters })
  }

  const handleResetFilters = () => {
    setSelectedPreset(null)

    // Reset all adjustments to 0
    const resetFilters = activeLayer.filters.map((filter) => ({ ...filter, value: 0 }))
    onUpdateLayer(activeLayerId, { filters: resetFilters })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Filters</h3>
        <Button variant="outline" size="sm" onClick={handleResetFilters} className="h-7 text-xs">
          Reset
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-2 gap-3">
          {FILTER_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className={`rounded-md overflow-hidden cursor-pointer transition-all ${
                selectedPreset === preset.id ? "ring-2 ring-primary" : "hover:opacity-90"
              }`}
              onClick={() => handleApplyFilter(preset.id)}
            >
              <div className="bg-slate-200 dark:bg-slate-700 aspect-square flex items-center justify-center">
                {preset.preview ? (
                  <img
                    src={preset.preview || "/placeholder.svg"}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-800" />
                )}
              </div>
              <div className="p-2 text-center text-sm font-medium">{preset.name}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
