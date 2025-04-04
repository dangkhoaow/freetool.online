"use client"

import { Button } from "@/components/ui/button"
import { Download, DownloadCloud, Eye, Zap, Check } from "lucide-react"
import Image from "next/image"

interface OutputGalleryProps {
  files: File[]
  settings: any
  onReset: () => void
}

export default function OutputGallery({ files, settings, onReset }: OutputGalleryProps) {
  // For demo purposes, we'll show a static UI with placeholder images
  const convertedImages = files.map((file, index) => ({
    id: index + 1,
    name: file.name.replace(".heic", `.${settings.outputFormat}`),
    size: ((file.size / 1024 / 1024) * 0.7).toFixed(2) + " MB", // Simulate smaller file size
    url: "/placeholder.svg?height=200&width=300",
    originalSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
  }))

  // In a real implementation, this would show actual conversion results

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Converted Images</h3>

      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center">
        <div className="bg-green-100 rounded-full p-1 mr-3">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-green-800 font-medium">Conversion Complete!</p>
          <p className="text-sm text-green-700">
            All {files.length} files have been successfully converted to {settings.outputFormat.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-medium">Download Options</h4>
          <p className="text-sm text-gray-500">Download individual files or all at once</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview All
          </Button>
          <Button size="sm">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {convertedImages.map((image) => (
          <div key={image.id} className="border rounded-lg overflow-hidden bg-white">
            <div className="relative aspect-video bg-gray-100">
              <Image src={image.url || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
              <div className="absolute top-2 right-2 flex space-x-1">
                {settings.aiOptimization && (
                  <div className="p-1 bg-blue-500 rounded-full" title="AI Optimized">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="mb-2">
                <p className="text-sm font-medium truncate">{image.name}</p>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <span>{image.size}</span>
                  {settings.aiOptimization && (
                    <span className="flex items-center ml-2 text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                      {Math.round((1 - Number.parseFloat(image.size) / Number.parseFloat(image.originalSize)) * 100)}%
                      smaller
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Convert More Files
          </Button>
          <Button variant="default">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Download All as ZIP
          </Button>
        </div>
      </div>
    </div>
  )
}

