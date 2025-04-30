"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  FileImage, 
  FileCode, 
  File, 
  FileBadge, 
  FileType, 
  FileText,
  Check,
  LoaderIcon
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ExportService } from "@/lib/services/browser-design-studio/export-service"
import { useVectorStore } from "@/lib/services/browser-design-studio/stores/vector-store"
import { useRasterStore } from "@/lib/services/browser-design-studio/stores/raster-store"
import { useTextStore } from "@/lib/services/browser-design-studio/stores/text-store"

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  supportsLayers: boolean
  supportsVector: boolean
  supportsRaster: boolean
  supportsText: boolean
  defaultExtension: string
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: "svg",
    name: "SVG",
    description: "Scalable Vector Graphics - ideal for vector designs",
    icon: <FileCode className="h-5 w-5" />,
    supportsLayers: true,
    supportsVector: true,
    supportsRaster: false,
    supportsText: true,
    defaultExtension: "svg",
  },
  {
    id: "png",
    name: "PNG",
    description: "Portable Network Graphics - lossless compression with transparency",
    icon: <FileImage className="h-5 w-5" />,
    supportsLayers: false,
    supportsVector: true,
    supportsRaster: true,
    supportsText: true,
    defaultExtension: "png",
  },
  {
    id: "jpg",
    name: "JPG",
    description: "Joint Photographic Experts Group - best for photos",
    icon: <FileImage className="h-5 w-5" />,
    supportsLayers: false,
    supportsVector: true,
    supportsRaster: true,
    supportsText: true,
    defaultExtension: "jpg",
  },
  {
    id: "pdf",
    name: "PDF",
    description: "Portable Document Format - perfect for print designs",
    icon: <FileType className="h-5 w-5" />,
    supportsLayers: true,
    supportsVector: true,
    supportsRaster: true,
    supportsText: true,
    defaultExtension: "pdf",
  },
  {
    id: "ai",
    name: "AI",
    description: "Adobe Illustrator - professional vector editing",
    icon: <File className="h-5 w-5" />,
    supportsLayers: true,
    supportsVector: true,
    supportsRaster: true,
    supportsText: true,
    defaultExtension: "ai",
  },
  {
    id: "css",
    name: "CSS",
    description: "Cascading Style Sheets - export design as code",
    icon: <FileCode className="h-5 w-5" />,
    supportsLayers: false,
    supportsVector: true,
    supportsRaster: false,
    supportsText: true,
    defaultExtension: "css",
  },
]

export default function ExportPanel() {
  const [selectedFormat, setSelectedFormat] = useState<string>("svg")
  const [fileName, setFileName] = useState<string>("design")
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [exportProgress, setExportProgress] = useState<number>(0)
  const [exportStatus, setExportStatus] = useState<string>("")
  const [exportOptions, setExportOptions] = useState({
    includeVector: true,
    includeRaster: true,
    includeText: true,
    quality: 90,
    scale: 1,
    includeBackground: true,
    optimizeSize: true,
  })
  const [exportedFile, setExportedFile] = useState<{ url: string; name: string } | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  
  // Get services and store data
  const { paths: vectorPaths } = useVectorStore()
  const { layers: rasterLayers } = useRasterStore()
  const { textNodes } = useTextStore()
  
  // Reset file name when design is loaded
  useEffect(() => {
    // Would update with active document name
    setFileName("design")
  }, [])

  // Get current format information
  const currentFormat = EXPORT_FORMATS.find(format => format.id === selectedFormat) || EXPORT_FORMATS[0]

  // Handle export format change
  const handleFormatChange = (formatId: string) => {
    setSelectedFormat(formatId)
    setExportedFile(null) // Reset exported file when format changes
  }

  // Handle export options change
  const handleOptionChange = (key: string, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // Export the current design
  const exportDesign = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportStatus("Preparing export...")
    setExportedFile(null)
    
    try {
      // Create a web worker to handle the export process
      const worker = new Worker(new URL('@/lib/services/browser-design-studio/export-worker.ts', import.meta.url))
      
      // Listen for messages from the worker
      worker.onmessage = (e) => {
        const { type, data } = e.data
        
        if (type === 'progress') {
          setExportProgress(data.progress * 100)
          if (data.status) setExportStatus(data.status)
        } else if (type === 'complete') {
          // Create a download URL from the exported data
          const blob = new Blob([data.result], { type: getContentType(selectedFormat) })
          const url = URL.createObjectURL(blob)
          
          // Set the exported file
          setExportedFile({
            url,
            name: `${fileName}.${currentFormat.defaultExtension}`
          })
          
          // Clean up
          setIsExporting(false)
          setExportProgress(100)
          setExportStatus("Export complete!")
          
          // Terminate the worker
          worker.terminate()
        } else if (type === 'error') {
          throw new Error(data.message)
        }
      }
      
      // Send the export request to the worker
      worker.postMessage({
        type: 'export',
        data: {
          format: selectedFormat,
          options: exportOptions,
          vectorPaths,
          rasterLayers,
          textNodes,
        }
      })
      
      // Simulate export for demonstration
      simulateExport()
    } catch (error) {
      console.error("Export error:", error)
      setExportStatus(`Error: ${error instanceof Error ? error.message : "Export failed"}`)
      setIsExporting(false)
    }
  }
  
  // Helper to get content type for the blob
  const getContentType = (format: string) => {
    switch (format) {
      case 'svg':
        return 'image/svg+xml'
      case 'png':
        return 'image/png'
      case 'jpg':
        return 'image/jpeg'
      case 'pdf':
        return 'application/pdf'
      case 'ai':
        return 'application/illustrator'
      case 'css':
        return 'text/css'
      default:
        return 'application/octet-stream'
    }
  }
  
  // Simulate export for demonstration purposes
  const simulateExport = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      
      setExportProgress(progress)
      
      if (progress < 30) {
        setExportStatus("Processing vector elements...")
      } else if (progress < 60) {
        setExportStatus("Rendering raster layers...")
      } else if (progress < 90) {
        setExportStatus("Finalizing export...")
      } else {
        setExportStatus("Export complete!")
        clearInterval(interval)
        
        // Create a dummy blob for demonstration
        const blob = new Blob(["Dummy export data"], { type: getContentType(selectedFormat) })
        const url = URL.createObjectURL(blob)
        
        setExportedFile({
          url,
          name: `${fileName}.${currentFormat.defaultExtension}`
        })
        
        setIsExporting(false)
      }
    }, 300)
  }
  
  // Download the exported file
  const downloadExportedFile = () => {
    if (!exportedFile) return
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a')
    a.href = exportedFile.url
    a.download = exportedFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Export Design</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-name">File Name</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="mb-2 block">Export Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EXPORT_FORMATS.map((format) => (
                <Card
                  key={format.id}
                  className={`cursor-pointer transition-all ${
                    selectedFormat === format.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleFormatChange(format.id)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      {format.icon}
                    </div>
                    <div>
                      <p className="font-medium">{format.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format.defaultExtension.toUpperCase()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Export Options</Label>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
              </Button>
            </div>
            
            <div className="space-y-3 border rounded-md p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-vector"
                  checked={exportOptions.includeVector}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeVector', checked)
                  }
                  disabled={!currentFormat.supportsVector}
                />
                <Label htmlFor="include-vector" className="text-sm cursor-pointer">
                  Include Vector Layers
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-raster"
                  checked={exportOptions.includeRaster}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeRaster', checked)
                  }
                  disabled={!currentFormat.supportsRaster}
                />
                <Label htmlFor="include-raster" className="text-sm cursor-pointer">
                  Include Raster Layers
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-text"
                  checked={exportOptions.includeText}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeText', checked)
                  }
                  disabled={!currentFormat.supportsText}
                />
                <Label htmlFor="include-text" className="text-sm cursor-pointer">
                  Include Text Layers
                </Label>
              </div>
              
              {showAdvancedOptions && (
                <>
                  <div className="space-y-1 pt-2">
                    <Label htmlFor="quality" className="text-sm">
                      Quality: {exportOptions.quality}%
                    </Label>
                    <Input
                      id="quality"
                      type="range"
                      min="10"
                      max="100"
                      value={exportOptions.quality}
                      onChange={(e) => 
                        handleOptionChange('quality', parseInt(e.target.value))
                      }
                      disabled={selectedFormat === 'svg' || selectedFormat === 'css'}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-background"
                      checked={exportOptions.includeBackground}
                      onCheckedChange={(checked) => 
                        handleOptionChange('includeBackground', checked)
                      }
                    />
                    <Label htmlFor="include-background" className="text-sm cursor-pointer">
                      Include Background
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="optimize-size"
                      checked={exportOptions.optimizeSize}
                      onCheckedChange={(checked) => 
                        handleOptionChange('optimizeSize', checked)
                      }
                    />
                    <Label htmlFor="optimize-size" className="text-sm cursor-pointer">
                      Optimize File Size
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <Button 
            onClick={exportDesign} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export as {currentFormat.name}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Format Information</h3>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {currentFormat.icon}
              {currentFormat.name} (.{currentFormat.defaultExtension})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {currentFormat.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${currentFormat.supportsLayers ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">
                  {currentFormat.supportsLayers ? 'Supports' : 'Does not support'} layers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${currentFormat.supportsVector ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">
                  {currentFormat.supportsVector ? 'Supports' : 'Does not support'} vector paths
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${currentFormat.supportsRaster ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">
                  {currentFormat.supportsRaster ? 'Supports' : 'Does not support'} raster images
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${currentFormat.supportsText ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">
                  {currentFormat.supportsText ? 'Supports' : 'Does not support'} text elements
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isExporting && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Export Progress</h4>
              <Progress value={exportProgress} className="mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {exportStatus}
              </p>
            </CardContent>
          </Card>
        )}
        
        {exportedFile && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Export Complete</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exportedFile.name} is ready for download
                    </p>
                  </div>
                </div>
                <Button onClick={downloadExportedFile}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
