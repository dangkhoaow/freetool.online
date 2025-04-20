"use client"

import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/utils"
import { Download, RefreshCw, Share2 } from "lucide-react"
import type { CompressionJob } from "./compressor-tool"
import { useState, useEffect } from "react"

interface OutputSectionProps {
  job: CompressionJob
  onReset: () => void
}

export default function OutputSection({ job, onReset }: OutputSectionProps) {
  const [fileName, setFileName] = useState<string>("compressed.zip")
  
  useEffect(() => {
    // Generate a filename based on current date/time or first file name
    if (job.files.length === 1) {
      // If only one file, use its name with .zip extension
      const originalName = job.files[0].name
      setFileName(originalName.includes(".")
        ? originalName.substring(0, originalName.lastIndexOf(".")) + ".zip"
        : originalName + ".zip"
      )
    } else if (job.files.length > 1) {
      // Multiple files, use the current date
      const date = new Date()
      setFileName(`archive_${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}.zip`)
    }
  }, [job.files])

  if (!job.result) {
    return <div className="text-center p-8">No compression results available</div>
  }

  const handleDownload = () => {
    // Create a link element and trigger the download
    const link = document.createElement("a")
    link.href = job.result!.downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    try {
      // Create a file from the blob URL for sharing
      if (navigator.share && job.result?.downloadUrl) {
        const response = await fetch(job.result.downloadUrl)
        const blob = await response.blob()
        const file = new File([blob], fileName, { type: "application/zip" })

        await navigator.share({
          title: "Compressed Files",
          text: "Here are my compressed files",
          files: [file]
        })
      } else if (navigator.share) {
        // Fall back to URL sharing if file sharing isn't supported
        await navigator.share({
          title: "Compressed Files",
          text: "Check out my compressed files!",
          url: window.location.href,
        })
      } else {
        alert("Sharing is not supported on this browser")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      alert("There was an error while sharing.")
    }
  }

  const originalSize = job.files.reduce((acc, file) => acc + file.size, 0)

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Compression Complete!</h3>
        <p className="text-muted-foreground mb-4">Your files have been successfully compressed</p>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">Compression Results</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Original Size:</div>
          <div className="text-right">{formatBytes(originalSize)}</div>

          <div>Compressed Size:</div>
          <div className="text-right">{formatBytes(job.result.size)}</div>

          <div>Space Saved:</div>
          <div className="text-right text-green-600">
            {formatBytes(originalSize - job.result.size)} ({Math.round((1 - job.result.compressionRatio) * 100)}%)
          </div>

          <div>Compression Ratio:</div>
          <div className="text-right">{job.result.compressionRatio.toFixed(2)}x</div>

          <div>Format:</div>
          <div className="text-right">{job.settings.format.toUpperCase()}</div>

          <div>Password Protected:</div>
          <div className="text-right">{job.settings.password ? "Yes" : "No"}</div>

          <div>Filename:</div>
          <div className="text-right">{fileName}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleDownload} className="flex-1 gap-2">
          <Download size={18} />
          Download Archive
        </Button>

        <Button variant="outline" onClick={handleShare} className="flex-1 gap-2">
          <Share2 size={18} />
          Share
        </Button>

        <Button variant="ghost" onClick={onReset} className="flex-1 gap-2">
          <RefreshCw size={18} />
          Compress New Files
        </Button>
      </div>
    </div>
  )
}
