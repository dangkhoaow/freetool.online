"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface NewCanvasModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCanvas: (width: number, height: number, transparentBackground: boolean) => void
}

interface PresetSize {
  name: string
  width: number
  height: number
}

export default function NewCanvasModal({ isOpen, onClose, onCreateCanvas }: NewCanvasModalProps) {
  const [width, setWidth] = useState(1920)
  const [height, setHeight] = useState(1080)
  const [transparentBackground, setTransparentBackground] = useState(true)

  const presetSizes: PresetSize[] = [
    { name: "HD (1280 × 720)", width: 1280, height: 720 },
    { name: "Full HD (1920 × 1080)", width: 1920, height: 1080 },
    { name: "4K UHD (3840 × 2160)", width: 3840, height: 2160 },
    { name: "8K UHD (7680 × 4320)", width: 7680, height: 4320 },
    { name: "Instagram Post (1080 × 1080)", width: 1080, height: 1080 },
    { name: "Instagram Story (1080 × 1920)", width: 1080, height: 1920 },
    { name: "Facebook Cover (820 × 312)", width: 820, height: 312 },
    { name: "Twitter Header (1500 × 500)", width: 1500, height: 500 },
    { name: "YouTube Thumbnail (1280 × 720)", width: 1280, height: 720 },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateCanvas(width, height, transparentBackground)
    onClose()
  }

  const handlePresetSelect = (preset: string) => {
    const selectedPreset = presetSizes.find((p) => p.name === preset)
    if (selectedPreset) {
      setWidth(selectedPreset.width)
      setHeight(selectedPreset.height)
    }
  }

  const handleCreateCanvas = () => {
    onCreateCanvas(Number.parseInt(width, 10) || 1920, Number.parseInt(height, 10) || 1080, transparentBackground)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Canvas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="preset">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">Preset Size</TabsTrigger>
              <TabsTrigger value="custom">Custom Size</TabsTrigger>
            </TabsList>
            <TabsContent value="preset" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preset">Choose a preset size</Label>
                  <Select onValueChange={handlePresetSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset size" />
                    </SelectTrigger>
                    <SelectContent>
                      {presetSizes.map((preset) => (
                        <SelectItem key={preset.name} value={preset.name}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="custom" className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    max="10000"
                    value={width}
                    onChange={(e) => setWidth(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    max="10000"
                    value={height}
                    onChange={(e) => setHeight(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="transparent-bg"
              checked={transparentBackground}
              onCheckedChange={(checked) => setTransparentBackground(checked === true)}
            />
            <label htmlFor="transparent-bg" className="text-sm font-medium">
              Transparent background
            </label>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Current dimensions: {width} × {height} px
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Canvas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
