"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Download, DownloadCloud, Check, X, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ProcessedFrame } from "@/lib/services/gif-processor"
import { useGifBrowserProcessor } from "@/hooks/use-gif-browser-processor"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BrowserOutputGalleryProps {
  files: File[]
  settings: any
  onReset: () => void
  processedFiles: Map<string, ProcessedFrame[]>
}

export default function BrowserOutputGallery({ files, settings, onReset, processedFiles }: BrowserOutputGalleryProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewImage, setPreviewImage] = useState<ProcessedFrame | null>(null)
  const { toast } = useToast()
  const { createZip, downloadZip } = useGifBrowserProcessor()

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Count stats
  const totalFiles = files.length
  const allFrames = useMemo(() => {
    const frames: ProcessedFrame[] = []
    processedFiles.forEach(fileFrames => {
      frames.push(...fileFrames)
    })
    return frames
  }, [processedFiles])

  const successfulFiles = useMemo(() => {
    return Array.from(processedFiles.entries())
      .filter(([_, frames]) => frames.length > 0)
      .map(([fileName]) => fileName)
  }, [processedFiles])
  
  const successCount = successfulFiles.length
  const failedCount = totalFiles - successCount

  // Organize frames by file
  const framesByFile = useMemo(() => {
    return Array.from(processedFiles.entries())
      .filter(([_, frames]) => frames.length > 0)
      .map(([fileName, frames]) => ({
        fileName,
        frames,
        previewFrame: frames.length > 0 ? frames[0] : null
      }))
  }, [processedFiles])

  // Determine status message based on conversion statistics
  const getStatusMessage = () => {
    if (successCount === totalFiles) {
      return `All ${totalFiles} GIFs successfully converted to frames`
    } else if (successCount > 0) {
      return `${successCount} of ${totalFiles} GIFs successfully converted. ${failedCount} files failed.`
    } else {
      return "No files were successfully converted."
    }
  }

  // Download a single frame
  const handleDownloadFrame = (frame: ProcessedFrame) => {
    const link = document.createElement("a")
    link.href = frame.dataUrl
    link.download = frame.filename
    link.click()
  }

  // View image in preview
  const handleViewImage = (frame: ProcessedFrame) => {
    setPreviewImage(frame)
  }

  // Handle downloading all files as a ZIP
  const handleDownloadAll = async () => {
    if (processedFiles.size === 0 || allFrames.length === 0) {
      toast({
        title: "Download Failed",
        description: "No frames available to download",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDownloading(true)

      // Create ZIP file
      const zipBlob = await createZip()
      
      if (zipBlob) {
        // Download the ZIP
        downloadZip(zipBlob, `gif-frames-${Date.now()}.zip`)
        
        toast({
          title: "Download Complete",
          description: "All frames have been downloaded as a ZIP",
        })
      } else {
        throw new Error("Failed to create ZIP file")
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "An error occurred during download",
        variant: "destructive",
      })
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-center">Conversion Complete</h3>

      {/* Add status message display */}
      <div className="text-center mb-6">
        <div
          className={`text-sm px-4 py-2 rounded-full inline-flex items-center ${
            successCount === totalFiles
              ? "bg-green-100 text-green-800"
              : successCount > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {successCount === totalFiles && <Check className="w-4 h-4 mr-2" />}
          {successCount > 0 && successCount < totalFiles && <AlertCircle className="w-4 h-4 mr-2" />}
          {successCount === 0 && <X className="w-4 h-4 mr-2" />}
          {getStatusMessage()}
        </div>
      </div>

      {/* Display each file with its frames */}
      {framesByFile.map(({ fileName, frames, previewFrame }) => (
        <div key={fileName} className="mb-8">
          <h4 className="text-lg font-medium mb-2">{fileName}</h4>
          <p className="text-sm text-gray-500 mb-4">{frames.length} frames extracted</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {frames.map((frame, index) => (
              <div
                key={index}
                className="bg-white border rounded-lg overflow-hidden shadow-sm transition hover:shadow-md"
              >
                <div 
                  className="relative aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => handleViewImage(frame)}
                >
                  {/* Image thumbnail */}
                  <img
                    src={frame.dataUrl}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium truncate text-sm">{frame.filename}</p>
                  <p className="text-xs text-gray-500 truncate">Frame {frame.frameIndex + 1}</p>

                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleDownloadFrame(frame)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* If no frames, show message */}
      {framesByFile.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <X className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">No Frames Generated</h3>
          <p className="text-gray-500 mt-1">
            No frames were successfully extracted. Please try again with different settings or files.
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onReset}>
              Convert More GIFs
            </Button>
            <Button
              variant="default"
              onClick={handleDownloadAll}
              disabled={isDownloading || allFrames.length === 0}
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Downloading...
                </>
              ) : (
                <>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Download All as ZIP
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.filename}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
            {previewImage && (
              <img 
                src={previewImage.dataUrl} 
                alt={previewImage.filename}
                className="max-h-[70vh] object-contain"
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
              Close
            </Button>
            {previewImage && (
              <Button onClick={() => handleDownloadFrame(previewImage)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 