"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportCanvas } from "@/lib/services/photo-editor-service"
import { Download } from "lucide-react"

interface ExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export default function ExportPanel({ canvasRef }: ExportPanelProps) {
  const [format, setFormat] = useState<"jpeg" | "png" | "webp" | "svg">("png")
  const [quality, setQuality] = useState(92)
  const [filename, setFilename] = useState("my-image")
  const [exportWidth, setExportWidth] = useState(1920)
  const [exportHeight, setExportHeight] = useState(1080)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [exportPreview, setExportPreview] = useState<string | null>(null)

  const handleExport = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Generate export preview
      const dataUrl = await exportCanvas(canvas, format, quality / 100)
      setExportPreview(dataUrl)

      // Trigger download
      const link = document.createElement("a")
      link.download = `${filename}.${format}`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    }
  }

  const handleWidthChange = (width: number) => {
    setExportWidth(width)

    if (maintainAspectRatio && canvasRef.current) {
      const canvas = canvasRef.current
      const aspectRatio = canvas.width / canvas.height
      setExportHeight(Math.round(width / aspectRatio))
    }
  }

  const handleHeightChange = (height: number) => {
    setExportHeight(height)

    if (maintainAspectRatio && canvasRef.current) {
      const canvas = canvasRef.current
      const aspectRatio = canvas.width / canvas.height
      setExportWidth(Math.round(height * aspectRatio))
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium mb-4">Export Settings</h3>

      <Tabs defaultValue="format">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="size">Size</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Export Format</label>
            <Select value={format} onValueChange={(value: "jpeg" | "png" | "webp" | "svg") => setFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG - High quality with transparency</SelectItem>
                <SelectItem value="jpeg">JPEG - Smaller file size</SelectItem>
                <SelectItem value="webp">WebP - Modern format with compression</SelectItem>
                <SelectItem value="svg">SVG - Vector format (limited support)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format === "jpeg" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm">Quality</label>
                <span className="text-sm">{quality}%</span>
              </div>
              <Slider value={[quality]} min={1} max={100} step={1} onValueChange={(values) => setQuality(values[0])} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="size" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Width (px)</label>
            <Input
              type="number"
              value={exportWidth}
              onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Height (px)</label>
            <Input
              type="number"
              value={exportHeight}
              onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="maintain-aspect-ratio"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="maintain-aspect-ratio" className="text-sm">
              Maintain aspect ratio
            </label>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Filename</label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename without extension"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4">
        <Button className="w-full" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export Image
        </Button>
      </div>

      {exportPreview && (
        <div className="mt-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-800">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="aspect-video rounded overflow-hidden">
            <img
              src={exportPreview || "/placeholder.svg"}
              alt="Export preview"
              className="w-full h-full object-contain bg-white"
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Format: {format.toUpperCase()} | Size: {exportWidth}×{exportHeight}px
          </div>
        </div>
      )}
    </div>
  )
}
