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
    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            {isBrowserMode && (
              <div className="mt-2 text-sm">
                <p>Browser-based conversion errors can occur due to:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>File format not properly supported</li>
                  <li>Browser memory limitations</li>
                  <li>Browser security restrictions</li>
                </ul>
                <p className="mt-2">
                  Try switching to server-based conversion in Settings → Advanced tab.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    if (job && job.status === "completed") {
      return (
        <div className="flex items-center gap-2 text-green-600 mb-6">
          <Check className="h-5 w-5" />
          <p className="font-medium">Conversion Complete</p>
        </div>
      )
    }

    if (job && job.status === "failed") {
      // Check if any files were processed successfully
      const successCount = job.files?.filter((file: any) => file.status === "completed").length || 0
      const failedCount = job.files?.filter((file: any) => file.status === "failed").length || 0

      if (successCount > 0) {
        return (
          <Alert variant="default" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Partial Conversion</AlertTitle>
            <AlertDescription>
              {successCount} of {successCount + failedCount} files were successfully converted.
              {failedCount > 0 && ` ${failedCount} files failed.`}
            </AlertDescription>
          </Alert>
        )
      }

      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Failed</AlertTitle>
          <AlertDescription>
            {job.error || "Failed to convert files. Please try again or try server-based conversion."}
            {isBrowserMode && (
              <div className="mt-2 text-sm">
                <p>Browser-based conversion may fail due to:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Large file sizes</li>
                  <li>Unsupported HEIC variants</li>
                  <li>Browser memory limitations</li>
                </ul>
                <p className="mt-2">
                  Try server-based conversion in Settings → Advanced tab.
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 text-blue-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <p className="font-medium">Processing your files...</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isBrowserMode 
            ? "Converting files directly in your browser. This might take some time for larger files."
            : "Your files are being processed on our servers. This might take a moment."}
        </p>
      </div>
    )
  }

  // Get details about in-progress files
  const getProgressDetails = () => {
    if (job && job.files && job.files.length > 0) {
      const completed = job.files.filter((file: any) => file.status === "completed").length
      const failed = job.files.filter((file: any) => file.status === "failed").length
      const pending = job.files.filter((file: any) => file.status === "pending" || file.status === "processing").length

      return (
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Completed: {completed}</span>
          <span>Pending: {pending}</span>
          {failed > 0 && <span className="text-red-500">Failed: {failed}</span>}
        </div>
      )
    }

    return null
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Processing</h3>

      {getStatusMessage()}

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
