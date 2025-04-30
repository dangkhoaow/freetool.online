"use client"

import { ArrowRight } from "lucide-react"

export default function ProcessingSection() {
  return (
    <section className="py-16 px-4 bg-blue-50 dark:bg-gray-800">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          How Our Local Browser AI Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-blue-200 dark:bg-blue-900 hidden md:block"></div>

          {/* Step 1 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md relative">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-800 rounded-full text-white flex items-center justify-center font-bold text-xl absolute -top-6 left-1/2 transform -translate-x-1/2 shadow-md">
              1
            </div>
            <div className="pt-8 text-center">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Load Your Data</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload an Excel file, CSV, or paste your data directly. Your data stays entirely on your device and is never transmitted to any server.
              </p>
              <div className="flex justify-center mt-4">
                <ArrowRight className="h-6 w-6 text-blue-500 animate-pulse md:rotate-0 rotate-90" />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md relative">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-800 rounded-full text-white flex items-center justify-center font-bold text-xl absolute -top-6 left-1/2 transform -translate-x-1/2 shadow-md">
              2
            </div>
            <div className="pt-8 text-center">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Local AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The WebLLM model runs entirely in your browser and uses AI to analyze data patterns, identify structure, and prepare it for visualization.
              </p>
              <div className="flex justify-center mt-4">
                <ArrowRight className="h-6 w-6 text-blue-500 animate-pulse md:rotate-0 rotate-90" />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md relative">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-800 rounded-full text-white flex items-center justify-center font-bold text-xl absolute -top-6 left-1/2 transform -translate-x-1/2 shadow-md">
              3
            </div>
            <div className="pt-8 text-center">
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Generate Visualization</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Chart.js renders beautiful, interactive visualizations based on the AI's structured data. Export as PNG or save for future reference.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 dark:text-white">Why Browser-Based AI Matters for Your Data</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Unlike cloud-based visualization tools that require uploading your sensitive data to remote servers, our tool leverages cutting-edge WebGPU and WebLLM technology to perform all processing locally in your browser. This means:
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span><strong>Enhanced Privacy:</strong> Your data never leaves your device, eliminating data breach risks</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span><strong>Better Security:</strong> No account creation or API keys needed to access advanced visualization</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span><strong>Offline Capability:</strong> Continue working even without an internet connection</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-check">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span><strong>Lower Latency:</strong> No network delays when processing and visualizing data</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
