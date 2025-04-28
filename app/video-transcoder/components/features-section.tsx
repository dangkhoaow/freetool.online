"use client"

import React from "react"
import { 
  Zap, 
  Lock, 
  Scissors, 
  LayoutGrid, 
  RotateCcw, 
  Palette,
  CloudOff,
  Cpu
} from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "GPU Acceleration",
      description: "Leverage your device's GPU for faster video processing with WebGPU support when available."
    },
    {
      icon: <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "100% Private",
      description: "All processing happens directly in your browser. Your videos never leave your device."
    },
    {
      icon: <Scissors className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Cut & Trim",
      description: "Precisely trim videos, remove unwanted sections, or split into multiple clips."
    },
    {
      icon: <LayoutGrid className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Multiple Formats",
      description: "Convert videos to different formats including MP4, WebM, and more with various codec options."
    },
    {
      icon: <RotateCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "No File Size Limits",
      description: "Process videos of any size without restrictions, all powered by your device."
    },
    {
      icon: <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Quality Control",
      description: "Adjust resolution, bitrate, and other settings to balance quality and file size."
    },
    {
      icon: <CloudOff className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Works Offline",
      description: "Once loaded, the tool can function without an internet connection for complete privacy."
    },
    {
      icon: <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "FFmpeg.wasm Powered",
      description: "Utilizes the full power of FFmpeg compiled to WebAssembly for professional-grade processing."
    }
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Powerful Video Processing Features</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Our browser-based video transcoder provides professional-grade features without the need to install any software.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow transition-shadow duration-300">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Technical capabilities highlight */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Advanced Browser Technology</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Our video transcoder leverages cutting-edge web technologies to bring desktop-class video editing capabilities to your browser:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="dark:text-white"><strong>WebAssembly:</strong> FFmpeg compiled to run at near-native speed in your browser</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="dark:text-white"><strong>WebCodecs:</strong> Direct access to media encoders and decoders for efficient processing</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="dark:text-white"><strong>WebGPU:</strong> Hardware-accelerated processing for dramatically improved performance</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 rounded-full p-1 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="dark:text-white"><strong>OffscreenCanvas:</strong> Background processing to keep the UI responsive during intensive operations</span>
              </li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-center mb-4">
              <h4 className="font-bold dark:text-white">Processing Capabilities</h4>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-white">Video Encoding</span>
                  <span className="text-blue-600 dark:text-blue-400">Advanced</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-white">Format Support</span>
                  <span className="text-blue-600 dark:text-blue-400">Comprehensive</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-white">Processing Speed</span>
                  <span className="text-blue-600 dark:text-blue-400">GPU-Accelerated</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-white">Quality Control</span>
                  <span className="text-blue-600 dark:text-blue-400">Professional</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
