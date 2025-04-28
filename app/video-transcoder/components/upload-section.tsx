"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"

// Helper to format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function UploadSection({ 
  onFileSelect, 
  videoUrl, 
  videoMetadata,
  onNavigateToSettings 
}: { 
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  videoUrl: string | null
  videoMetadata: any
  onNavigateToSettings?: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Upload Video</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Select a video file to transcode, trim, split or merge
        </p>
      </div>
      
      <div 
        className={`
          border-2 border-dashed rounded-lg p-12 
          ${videoUrl ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'} 
          transition-colors duration-150 ease-in-out
        `}
      >
        {!videoUrl ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Video className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Drag and drop your video file here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Select Video File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={onFileSelect}
              className="hidden"
            />
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Supports: MP4, WebM, MOV, AVI and more
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <video 
              style={{ display: 'none' }}
              controls 
              src={videoUrl} 
              className="max-h-[300px] rounded mb-4 bg-gray-900"
            />
            
            {videoMetadata && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md text-center mt-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-semibold dark:text-white">
                    {formatTime(videoMetadata.duration)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Resolution</p>
                  <p className="font-semibold dark:text-white">
                    {videoMetadata.width}×{videoMetadata.height}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Format</p>
                  <p className="font-semibold dark:text-white">
                    MP4
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Action</p>
                  <Button 
                    variant="ghost" 
                    className="p-0 h-6 text-blue-600 hover:text-blue-800 font-semibold"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={onFileSelect}
              className="hidden"
            />
            
            {videoMetadata && (
              <div className="mt-6">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium flex items-center justify-center"
                  onClick={() => {
                    // Use the provided callback to navigate to settings
                    if (onNavigateToSettings) {
                      console.log("Navigating to settings via callback");
                      onNavigateToSettings();
                    } else {
                      console.log("No navigation callback provided, trying DOM approach");
                      // Fallback to direct DOM manipulation if no callback
                      const settingsTab = document.getElementById('settings-tab');
                      if (settingsTab) {
                        console.log("Found settings-tab element, attempting to click");
                        settingsTab.click();
                      } else {
                        console.error("Could not find settings-tab element");
                      }
                    }
                  }}
                >
                  Start Configuration
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Supported formats info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Fully browser-based video processing</h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          All video processing happens directly in your browser - your videos never leave your device. 
          No file size limits, and no waiting for uploads.
        </p>
      </div>
    </div>
  )
}
