"use client"

import { BarChart, Shield, Cpu, Zap, Cloud, PieChart, FileText } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">
            Advanced AI Data Visualization with Complete Privacy
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform your raw data into meaningful visualizations using browser-based AI technology
            that keeps your data 100% private and never sends it to any server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Shield className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">100% Private Processing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              All data analysis happens entirely in your browser using WebLLM technology. Your data never leaves your device and is never shared with any server or third party.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Cpu className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Local AI Processing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Leverages WebGPU acceleration to run powerful Large Language Models directly in your browser. Automatically analyzes and structures your data for optimal visualization.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <BarChart className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Multiple Chart Types</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create bar charts, line graphs, pie charts, scatter plots, and more from your data. The AI automatically suggests the best visualization based on your data structure.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <FileText className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Flexible Data Input</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Import data from CSV, Excel, JSON, or paste plain text. Our AI can understand and process various data formats, handling column detection and data type inference automatically.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Zap className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">High-Performance Rendering</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizes Chart.js for smooth, responsive chart rendering. Export your visualizations as high-quality PNG images for presentations, reports, or sharing with colleagues.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Cloud className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Works Offline</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Once the AI model is loaded, the tool works completely offline. Generate visualizations anytime, anywhere without requiring an internet connection.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
