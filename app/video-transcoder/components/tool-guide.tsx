"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Settings, 
  Play, 
  Download, 
  ArrowRight,
  Scissors,
  Split,
  FileCog,
  Merge
} from "lucide-react"

export default function ToolGuide() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">How To Use The Video Transcoder</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Follow this simple guide to transcode, trim, split, and merge your videos directly in your browser – no software installation required
        </p>
      </div>

      <div className="space-y-12 max-w-4xl mx-auto">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Step 1</h3>
              <p className="text-gray-700 dark:text-gray-300">Upload your video file</p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h4 className="text-xl font-semibold mb-3 dark:text-white">Upload Your Video</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Click the "Select Video File" button or drag and drop your video file into the upload area. Our web-based video transcoder supports many popular video formats including MP4, WebM, AVI, MOV, and MKV without requiring any software installation.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Pro Tip</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                There's no file size limit since all processing happens locally in your browser. Larger files may take longer to process depending on your device's capabilities, but your videos never leave your device, ensuring complete privacy.
              </p>
            </div>
          </div>
        </div>
        
        {/* Connector */}
        <div className="flex justify-center">
          <ArrowRight className="h-8 w-8 rotate-90 text-gray-300 dark:text-gray-600" />
        </div>
        
        {/* Step 2 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Step 2</h3>
              <p className="text-gray-700 dark:text-gray-300">Configure settings</p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h4 className="text-xl font-semibold mb-3 dark:text-white">Choose Task & Configure Settings</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Select the operation you want to perform and configure the settings for your video processing needs:
            </p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <FileCog className="h-3 w-3 text-white" />
                </span>
                <div>
                  <span className="dark:text-white font-medium">Convert</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Change your video format (MP4, WebM), adjust quality settings from 1-5, and modify resolution to optimize for different devices or platforms. Perfect for creating web-optimized videos or reducing file size.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <Scissors className="h-3 w-3 text-white" />
                </span>
                <div>
                  <span className="dark:text-white font-medium">Trim</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Set precise start and end points using interactive time sliders to extract the exact portion of video you need. Perfect for removing unwanted sections or creating shorter clips from longer footage.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <Split className="h-3 w-3 text-white" />
                </span>
                <div>
                  <span className="dark:text-white font-medium">Split</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add multiple split points to divide your video into separate clips at exact timestamps. Great for breaking long videos into shorter segments or extracting multiple scenes from a single file.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <Merge className="h-3 w-3 text-white" />
                </span>
                <div>
                  <span className="dark:text-white font-medium">Merge</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Combine multiple video files into a single continuous video. Rearrange clips using up/down buttons, trim each clip's start and end points, and create seamless transitions between segments.</p>
                </div>
              </li>
            </ul>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Recommended Settings</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                For best compatibility, use MP4 (H.264) format with quality level 4. This provides excellent quality with reasonable file sizes. If you need smaller files for web upload, WebM (VP9) offers good compression with slightly lower compatibility.
              </p>
            </div>
          </div>
        </div>
        
        {/* Connector */}
        <div className="flex justify-center">
          <ArrowRight className="h-8 w-8 rotate-90 text-gray-300 dark:text-gray-600" />
        </div>
        
        {/* Step 3 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Step 3</h3>
              <p className="text-gray-700 dark:text-gray-300">Process your video</p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h4 className="text-xl font-semibold mb-3 dark:text-white">Process the Video</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Click "Process Video" to begin transcoding according to your selected options. Our browser-based engine uses advanced FFmpeg technology to process your video entirely within your browser.
              The real-time progress display shows processing speed, estimated time remaining, and file size information.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                <FileCog className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h6 className="font-medium text-sm dark:text-white">Convert Mode</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Changes format and quality</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                <Scissors className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h6 className="font-medium text-sm dark:text-white">Trim Mode</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Creates one shortened clip</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                <Split className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h6 className="font-medium text-sm dark:text-white">Split Mode</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Creates multiple video files</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                <Merge className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h6 className="font-medium text-sm dark:text-white">Merge Mode</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Combines multiple videos</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
              <h5 className="font-medium mb-2 text-yellow-800 dark:text-yellow-300">Performance Notes</h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Keep the browser tab open during processing. GPU acceleration is automatically used when available to speed up processing. High-quality outputs and longer videos will take more time to process, especially on older devices.
              </p>
            </div>
          </div>
        </div>
        
        {/* Connector */}
        <div className="flex justify-center">
          <ArrowRight className="h-8 w-8 rotate-90 text-gray-300 dark:text-gray-600" />
        </div>
        
        {/* Step 4 */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Step 4</h3>
              <p className="text-gray-700 dark:text-gray-300">Download your processed video</p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h4 className="text-xl font-semibold mb-3 dark:text-white">Download & Share</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Once processing is complete, preview your video to ensure it meets your expectations. 
              For Split operations, you'll see multiple download buttons for each segment. For Merge, Convert, and Trim operations, a single download button will save your processed file.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900/50">
              <h5 className="font-medium mb-2 text-green-800 dark:text-green-300">Complete Privacy Protection</h5>
              <p className="text-sm text-green-700 dark:text-green-300">
                Our browser-based video processor never uploads your content to any server. All video converting, trimming, splitting, and merging is performed locally using WebAssembly and GPU acceleration when available, 
                ensuring complete privacy and security of your video files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
