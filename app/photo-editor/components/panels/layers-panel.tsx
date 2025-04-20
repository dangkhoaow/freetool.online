"use client"

import type React from "react"

import { useState } from "react"
import type { Layer } from "@/lib/services/photo-editor-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Eye, EyeOff, Lock, Unlock, MoreVertical, Copy, Upload } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LayersPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  setActiveLayerId: (id: string) => void
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
  onAddLayer: () => void
  onDeleteLayer: () => void
  onUploadImage?: () => void
}

export default function LayersPanel({
  layers,
  activeLayerId,
  setActiveLayerId,
  onUpdateLayer,
  onAddLayer,
  onDeleteLayer,
  onUploadImage,
}: LayersPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleStartEditing = (layer: Layer) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }

  const handleSaveLayerName = () => {
    if (editingLayerId && editingName.trim()) {
      onUpdateLayer(editingLayerId, { name: editingName })
      setEditingLayerId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveLayerName()
    } else if (e.key === "Escape") {
      setEditingLayerId(null)
    }
  }

  const handleBlendModeChange = (layerId: string, blendMode: Layer["blendMode"]) => {
    onUpdateLayer(layerId, { blendMode })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-medium mb-2">Layers</h3>
        <div className="flex justify-between mb-4">
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={onAddLayer}>
              <Plus className="h-4 w-4 mr-1" /> Add Layer
            </Button>
            {onUploadImage && (
              <Button size="sm" variant="outline" onClick={onUploadImage}>
                <Upload className="h-4 w-4 mr-1" /> Upload
              </Button>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={onDeleteLayer} disabled={!activeLayerId}>
            <Trash className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>

        {activeLayerId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Opacity:</span>
              <Slider
                value={[layers.find((l) => l.id === activeLayerId)?.opacity || 100]}
                min={0}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={(values) => {
                  onUpdateLayer(activeLayerId, { opacity: values[0] })
                }}
              />
              <span className="text-sm w-8 text-right">
                {layers.find((l) => l.id === activeLayerId)?.opacity || 100}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Blend:</span>
              <Select
                value={layers.find((l) => l.id === activeLayerId)?.blendMode || "normal"}
                onValueChange={(value) => handleBlendModeChange(activeLayerId, value as Layer["blendMode"])}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Blend Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="multiply">Multiply</SelectItem>
                  <SelectItem value="screen">Screen</SelectItem>
                  <SelectItem value="overlay">Overlay</SelectItem>
                  <SelectItem value="darken">Darken</SelectItem>
                  <SelectItem value="lighten">Lighten</SelectItem>
                  <SelectItem value="color-dodge">Color Dodge</SelectItem>
                  <SelectItem value="color-burn">Color Burn</SelectItem>
                  <SelectItem value="hard-light">Hard Light</SelectItem>
                  <SelectItem value="soft-light">Soft Light</SelectItem>
                  <SelectItem value="difference">Difference</SelectItem>
                  <SelectItem value="exclusion">Exclusion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {layers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No layers yet</p>
            <Button variant="link" className="mt-2" onClick={onAddLayer}>
              Add your first layer
            </Button>
          </div>
        ) : (
          <ul className="space-y-1">
            {[...layers].reverse().map((layer) => (
              <li
                key={layer.id}
                className={`p-2 rounded-md flex items-center gap-2 border ${
                  layer.id === activeLayerId ? "bg-slate-100 dark:bg-slate-800 border-primary" : "border-transparent"
                } hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group`}
                onClick={() => setActiveLayerId(layer.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateLayer(layer.id, { visible: !layer.visible })
                  }}
                >
                  {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateLayer(layer.id, { locked: !layer.locked })
                  }}
                >
                  {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4 opacity-50" />}
                </Button>

                {editingLayerId === layer.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveLayerName}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="h-7 text-sm py-0 flex-1"
                  />
                ) : (
                  <span className="flex-1 text-sm truncate" onDoubleClick={() => handleStartEditing(layer)}>
                    {layer.name}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartEditing(layer)}>Rename</DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveLayerId(layer.id)} className="text-red-600">
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
