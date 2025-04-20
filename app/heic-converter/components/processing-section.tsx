"use client"

import { AlertCircle, Clock, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { ConversionJob } from "@/lib/services/heic-converter-service"

interface ProcessingSectionProps {
  files: File[]
  settings: any
  progress: number
  error: string | null
  job: ConversionJob | null
}

export default function ProcessingSection({ files, settings, progress, error, job }: ProcessingSectionProps) {
  const fileCount = files.length
  const isBrowserMode = settings.conversionMode === 'browser'

  // Determine the current status
  const getStatusMessage = () => {
    // Check if files are still being uploaded (for server mode)
    const expectedFileCount = settings.conversionMode === "server" ? files.length : 0;
    const currentFileCount = job?.files?.length || 0;
    const isStillUploading = settings.conversionMode === "server" && currentFileCount < expectedFileCount;
    
    // If files are still uploading, prioritize showing that message over error
    if (isStillUploading) {
      return (
        <div className="flex items-center gap-2 text-blue-500">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Uploading files... {currentFileCount} of {expectedFileCount} uploaded</span>
        </div>
      )
    }
    
    // Only show errors if we're not currently uploading files
    if (error && !isStillUploading) {
      return (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )
    }

    if (job && job.status === "completed") {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <Check className="h-4 w-4" />
          <span>Conversion complete! All files converted successfully.</span>
        </div>
      )
    }

    // For partially completed jobs
    if (job?.files?.length) {
      const completedCount = job.files.filter(f => f.status === "completed").length;
      const totalCount = files.length;
      
      if (completedCount > 0 && completedCount < totalCount && job.status === "failed") {
        return (
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <span>Partial conversion: {completedCount} of {totalCount} files converted successfully.</span>
          </div>
        )
      }
    }

    return (
      <div className="flex items-center gap-2 text-blue-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Processing your files...</span>
      </div>
    )
  }

  // Get details about in-progress files
  const getProgressDetails = () => {
    if (!job?.files?.length) return null;
    
    const totalFiles = settings.conversionMode === "server" ? files.length : job.files.length;
    const completedCount = job.files.filter(f => f.status === "completed").length;
    const failedCount = job.files.filter(f => f.status === "failed").length;
    const pendingCount = totalFiles - completedCount - failedCount;
    
    return (
      <div className="mt-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Completed: {completedCount}</span>
          <span>Pending: {pendingCount}</span>
          <span>Failed: {failedCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Processing</h3>

      <div className="p-4 border border-gray-200 rounded-lg mb-6">
        {getStatusMessage()}
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Converting {fileCount} files ({settings.outputFormat.toUpperCase()})</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {getProgressDetails()}
        </div>

        <div className="p-5 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Conversion Settings</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Output Format:</span>
              <span className="ml-2 font-medium">{settings.outputFormat.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-500">Quality:</span>
              <span className="ml-2 font-medium">{settings.quality}%</span>
            </div>
            <div>
              <span className="text-gray-500">AI Optimization:</span>
              <span className="ml-2 font-medium">{settings.aiOptimization ? "Enabled" : "Disabled"}</span>
            </div>
            <div>
              <span className="text-gray-500">Conversion Mode:</span>
              <span className="ml-2 font-medium">{settings.conversionMode === 'browser' ? "Browser-based" : "Server-based"}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Troubleshooting</h4>
          <p className="text-sm text-gray-600 mb-2">
            {isBrowserMode 
              ? "Browser-based conversion runs locally on your device. For complex or large files, you might get better results with server-based conversion." 
              : "Server-based conversion handles larger and more complex files better than browser-based conversion."}
          </p>
          <p className="text-sm text-gray-600">
            If you're experiencing issues, try:
          </p>
          <ul className="list-disc pl-5 mt-1 text-sm text-gray-600 space-y-1">
            <li>Using smaller files (under 10MB each)</li>
            <li>Converting fewer files at once</li>
            <li>{isBrowserMode ? "Switching to server-based conversion" : "Checking your internet connection"}</li>
            <li>Using a different browser (Chrome or Safari recommended)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
