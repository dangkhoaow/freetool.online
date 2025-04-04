"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, Zap } from "lucide-react"

interface ProcessingSectionProps {
  files: File[]
  settings: any
  progress: number
}

export default function ProcessingSection({ files, settings, progress }: ProcessingSectionProps) {
  // Calculate which file is currently being processed
  const totalFiles = files.length
  const fileProgress = Math.min(Math.floor((progress / 100) * totalFiles), totalFiles - 1)
  const currentFile = files[fileProgress]

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Converting Files</h3>

      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium">Overall Progress</p>
            <p className="text-sm text-gray-500">
              Converting {fileProgress + 1} of {totalFiles} files
            </p>
          </div>
          <div className="flex items-center text-primary">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm">Processing</span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span>{progress}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-primary/10 rounded mr-3">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-medium">Currently processing:</p>
              <p className="text-sm text-gray-500">{currentFile?.name}</p>
            </div>
          </div>

          {settings.aiOptimization && (
            <div className="flex items-center mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Zap className="h-4 w-4 text-blue-500 mr-2" />
              <div className="text-sm text-blue-700">
                AI optimization in progress - this may take a few extra seconds
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Please don't close this window during conversion</p>
          <p>Your files are being processed securely in your browser</p>
        </div>
      </div>
    </div>
  )
}

