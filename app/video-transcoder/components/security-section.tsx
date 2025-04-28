"use client"

import React from "react"
import { Shield, Lock, ServerOff, Cpu, DownloadCloud } from "lucide-react"

export default function SecuritySection() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Privacy & Security</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Our browser-based transcoder prioritizes your privacy and the security of your content
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">100% Local Processing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your videos never leave your device. All processing happens directly in your browser 
                using WebAssembly technology. No data is uploaded to our servers, ensuring 
                complete privacy and confidentiality.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pl-16">
            <div className="flex items-center mb-3">
              <ServerOff className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">No server uploads</span>
            </div>
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Protected from data breaches</span>
            </div>
            <div className="flex items-center">
              <Cpu className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">Uses your device's power</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
              <DownloadCloud className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Works Offline</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Once loaded, our tool functions completely offline. All necessary code and 
                libraries are downloaded to your browser on the initial visit. You can even 
                bookmark the page and use it later without an internet connection.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-6">
            <h4 className="font-medium mb-2 dark:text-white">How It Works</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Our video transcoder uses FFmpeg compiled to WebAssembly (FFmpeg.wasm) which runs 
              entirely within your browser. This provides professional-grade video processing 
              capabilities without needing to send your data to a server.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">No Data Collection Policy</h3>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          We do not track, store, or collect any information about the videos you process. 
          Your media files remain private, and no personal data is shared with any third parties.
        </p>
        <div className="text-sm text-blue-600 dark:text-blue-400">
          <p>
            <strong>Note:</strong> While browser-based processing ensures privacy, it does 
            rely on your device's capabilities. For very large or complex videos, processing 
            may take longer compared to server-based alternatives.
          </p>
        </div>
      </div>
    </div>
  )
}
