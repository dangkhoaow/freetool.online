"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, Film } from "lucide-react"

interface ProcessingSectionProps {
  file: File | null;
  settings: {
    outputFormat: string;
    fps: number;
  };
  progress: number;
}

export default function ProcessingSection({ file, settings, progress }: ProcessingSectionProps) {
  // Calculate estimated info
  const estimatedFrames = file ? Math.floor((file.size / 1024) * (settings.fps / 24)) : 0;
  const processedFrames = Math.floor((progress / 100) * estimatedFrames);
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Extracting Frames</h3>

      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium">Overall Progress</p>
            <p className="text-sm text-gray-500">
              Processed approximately {processedFrames} of {estimatedFrames} frames
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
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Processing file:</p>
              <p className="text-sm text-gray-500">{file?.name}</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Output Format:</span>
              <span className="font-medium">{settings.outputFormat.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Frame Rate:</span>
              <span className="font-medium">{settings.fps} FPS</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Frames:</span>
              <span className="font-medium">{estimatedFrames}</span>
            </div>
          </div>
        </div>

        {settings.fps >= 30 && (
          <div className="flex items-center mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500 mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div className="text-blue-700">
              Higher frame rates may take longer to process. Please be patient.
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>Please don't close this window during extraction</p>
          <p>Your file is being processed securely in your browser</p>
        </div>
      </div>
    </div>
  )
}
