"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Download, DownloadCloud, Check, X, AlertCircle, Clock } from "lucide-react"
import Image from "next/image"
import { type ConversionJob, getGifConverterService } from "@/lib/services/gif-converter-service"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OutputGalleryProps {
  files: File[]
  settings: any
  onReset: () => void
  job: ConversionJob | null
  jobId: string | null
}

// Add import for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function OutputGallery({ files, settings, onReset, job, jobId }: OutputGalleryProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewImage, setPreviewImage] = useState<any>(null)
  const { toast } = useToast()
  const converterService = getGifConverterService() // Get the service instance
  const token = localStorage.getItem("userId") || "anonymous" // Use userId as token

  // Add logic to show images even if job failed but some files were converted
  const hasConvertedFiles = useMemo(() => {
    if (!job?.files) return false
    return job.files.some((file) => file.status === "completed" && file.convertedPath)
  }, [job])

  // If the job failed but we have converted files, make sure to display them
  const showGallery = job?.status === "completed" || hasConvertedFiles

  // Filter to only show successfully converted files
  const successfulFiles = useMemo(() => {
    return job?.files?.filter((file) => file.status === "completed" && file.convertedPath) || []
  }, [job])

  // Count stats
  const totalFiles = files.length
  const successCount = successfulFiles.length
  const failedCount = job?.files?.filter((file) => file.status === "failed").length || 0

  // Determine status message based on conversion statistics
  const getStatusMessage = () => {
    if (successCount === 0 && failedCount === 0) {
      return "Waiting for files to be processed..."
    } else if (successCount === totalFiles) {
      return `All ${totalFiles} GIFs successfully converted to frames`
    } else if (successCount > 0) {
      return `${successCount} of ${totalFiles} GIFs successfully converted. ${failedCount} files failed.`
    } else {
      return "No files were successfully converted."
    }
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // View image in a new tab
  const handleViewImage = (url: string) => {
    if (!url) return
    window.open(url, "_blank")
  }

  // Download a single file
  const handleDownload = (url: string, fileName: string) => {
    if (!url) return
    setIsDownloading(true)

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        link.click()
        URL.revokeObjectURL(link.href)
        setIsDownloading(false)
      })
      .catch((error) => {
        console.error("Error downloading file:", error)
        setIsDownloading(false)
      })
  }

  // Handle downloading all files as a ZIP
  const handleDownloadAll = async () => {
    if (!jobId) {
      toast({
        title: "Download Failed",
        description: "Job ID not available",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDownloading(true)

      // Create and use direct download link with token
      const zipUrl = `${API_BASE_URL}/api/files/download-zip/${jobId}?token=user_${token}`
      const link = document.createElement("a")
      link.href = zipUrl
      link.download = `gif-frames-${jobId}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download Complete",
        description: "All frames have been downloaded as a ZIP",
      })
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {successfulFiles.length > 0 ? (
          successfulFiles.map((file, index) => {
            // Extract the original file name
            const originalName = file.originalName || `file-${index + 1}.${settings.outputFormat}`
            const convertedName = file.convertedName || originalName.replace(/\.gif$/i, `.${settings.outputFormat}`)

            return (
              <div
                key={index}
                className="bg-white border rounded-lg overflow-hidden shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-square bg-gray-100">
                  {/* Image thumbnail */}
                  <img
                    src={file.thumbnailUrl || "/placeholder.svg?height=200&width=300"}
                    alt={`Converted ${originalName}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fall back to placeholder if image fails to load
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium truncate">{convertedName}</p>
                  <p className="text-sm text-gray-500 truncate">Size: {formatFileSize(file.size || 0)}</p>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleDownload(file.convertedPath || "", convertedName)}
                      className="flex-1"
                      disabled={!file.convertedPath}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No Converted Frames Yet</h3>
            <p className="text-gray-500 mt-1">
              {job?.status === "failed"
                ? "Conversion failed. Please try again or check your files."
                : "Your files are still processing. Please wait..."}
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onReset}>
              Convert More GIFs
            </Button>
            <Button
              variant="default"
              onClick={handleDownloadAll}
              disabled={isDownloading || !job || successCount === 0}
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
            <DialogTitle className="flex justify-between items-center">
              <span>{previewImage?.name}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreviewImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Original: {previewImage?.originalName} • Size: {previewImage?.size}
            </DialogDescription>
          </DialogHeader>

          <div className="relative w-full h-[60vh] border rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
            {previewImage && (
              <a href={previewImage.downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                <Image
                  src={previewImage.url || "/placeholder.svg"}
                  alt={previewImage.name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Handle image load error by setting a placeholder
                    console.error(`Error loading preview image: ${previewImage.url}`)
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </a>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="default"
              onClick={() => previewImage && handleDownload(previewImage.downloadUrl || "", previewImage.name)}
              disabled={isDownloading || !previewImage || previewImage.status !== "completed"}
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
