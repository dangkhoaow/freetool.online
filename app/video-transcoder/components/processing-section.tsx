"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

type ProcessingStatus = 'idle' | 'processing' | 'complete' | 'error'

function formatTimeLeft(time: string, speed: number): string {
  const timeParts = time.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const remainingSeconds = Math.ceil((100 - totalSeconds / speed) / (totalSeconds / speed || 1) * (totalSeconds / speed * 0.8));
  const hoursLeft = Math.floor(remainingSeconds / 3600);
  const minutesLeft = Math.floor((remainingSeconds % 3600) / 60);
  const secondsLeft = remainingSeconds % 60;
  return `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
}

export default function ProcessingSection({
  processingStatus,
  progress,
  error,
  onRetry,
  onViewOutput,
  usingGPU = false,
  processingStats
}: {
  processingStatus: ProcessingStatus
  progress: number
  error: string | null
  onRetry: () => void
  onViewOutput: () => void
  usingGPU?: boolean
  processingStats?: {
    speed: number | null;
    fps: number | null;
    size: string | null;
    time: string | null;
    bitrate: string | null;
  }
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 dark:text-white">
          {processingStatus === 'idle' ? 'Ready to Process' :
           processingStatus === 'processing' ? 'Processing Your Video' :
           processingStatus === 'complete' ? 'Processing Complete' :
           'Processing Error'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {processingStatus === 'idle' ? 'Adjust your settings and start processing when ready.' :
           processingStatus === 'processing' ? 'Please wait while we process your video...' :
           processingStatus === 'complete' ? 'Your video has been successfully processed!' :
           'There was an error processing your video.'}
        </p>
      </div>
      
      <div className="flex flex-col items-center">
        {processingStatus === 'idle' && (
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        
        {processingStatus === 'processing' && (
          <>
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div className="w-full max-w-md mb-4">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {progress}% complete
            </p>
            
            {/* Processing speed and time estimate */}
            <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Processing Speed</h5>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ~ {processingStats?.speed ? processingStats.speed.toFixed(2) + 'x' : (usingGPU ? '8' : '1') + 'x'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {processingStats?.fps ? `${processingStats.fps} FPS` : (usingGPU ? 'GPU-accelerated' : 'Standard speed')}
                  </div>
                </div>
                
                <div className="text-center">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Time Left</h5>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {processingStats?.time && processingStats?.speed ? 
                      formatTimeLeft(processingStats.time, processingStats.speed) :
                      (progress < 5 ? '--:--' : 
                       progress > 95 ? '< 0:01' :
                       Math.ceil((100 - progress) / (progress || 1) * (progress * 0.8)).toString() + 's')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {processingStats?.size ? `Size: ${processingStats.size}` : 'Approximate time remaining'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 max-w-md text-center">
              <h4 className="font-medium mb-2 dark:text-white">GPU-Accelerated Processing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your browser is handling all the video processing locally, using WebCodecs and 
                GPU acceleration when available for maximum performance.
              </p>
            </div>
          </>
        )}
        
        {processingStatus === 'complete' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="w-full max-w-md mb-4">
              <Progress value={100} className="h-2 bg-gray-200 dark:bg-gray-700">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }} />
              </Progress>
            </div>
            <p className="text-center text-sm text-green-600 dark:text-green-400">
              Processing complete! Your video is ready.
            </p>
          </>
        )}
        
        {processingStatus === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Processing Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    There was an error processing your video. Please try again or use a different video file.
                  </p>
                </div>
                <div className="mt-4">
                  <Button variant="outline" onClick={onRetry}>
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
