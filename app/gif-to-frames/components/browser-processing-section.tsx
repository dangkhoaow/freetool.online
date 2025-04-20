"use client"

import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface BrowserProcessingSectionProps {
  progress: number
  currentFile: string
  error?: string | null
}

export default function BrowserProcessingSection({ progress, currentFile, error }: BrowserProcessingSectionProps) {
  // Determine the current processing status text
  const getStatusText = () => {
    if (error) return "Error"
    if (progress <= 0) return "Starting..."
    if (progress >= 100) return "Complete"
    return "Processing..."
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-center">Processing Your GIFs</h3>
      <div className="text-center text-gray-500 text-lg">{getStatusText()}</div>

      <Progress value={progress} className="w-full h-2" />
      <div className="text-center text-gray-500">{progress}% complete</div>

      {currentFile && (
        <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
          <h4 className="font-semibold">Currently Processing</h4>
          <p className="text-sm text-blue-800">{currentFile}</p>
        </div>
      )}

      <div className="bg-green-50 p-4 rounded-lg max-w-md mx-auto">
        <h4 className="font-semibold">Browser-Based Processing</h4>
        <p className="text-sm text-green-800">All processing happens in your browser!</p>
        <p className="text-xs text-gray-500 mt-2">No files are sent to a server, enhancing your privacy.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 