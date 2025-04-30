"use client"

import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ToolGuide() {
  return (
    <section className="py-16 px-4 bg-blue-50 dark:bg-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">
            How to Use the AI Data Visualization Tool
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform your data into beautiful visualizations in just a few simple steps
          </p>
        </div>

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="input">1. Input Data</TabsTrigger>
            <TabsTrigger value="customize">2. Customize</TabsTrigger>
            <TabsTrigger value="export">3. Visualize & Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4 dark:text-white">Input Your Data</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Upload a file</strong> - Drag and drop or upload a CSV or Excel file containing your data
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Paste data</strong> - Or paste your data directly in CSV, JSON, or plain text format
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Use templates</strong> - For quick testing, select one of our sample data templates
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Pro Tip:</strong> For best results, ensure your data includes clear column headers if it's in tabular format. If pasting plain text, try to format each data point on a new line with labels and values separated by commas or colons.
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="bg-gray-50 dark:bg-gray-800 aspect-video rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-gray-500 dark:text-gray-400">Data Input Illustration</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="bg-gray-50 dark:bg-gray-800 aspect-video rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-gray-500 dark:text-gray-400">Chart Customization Illustration</div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-semibold mb-4 dark:text-white">Customize Your Visualization</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Select chart type</strong> - Choose from bar charts, line charts, pie charts, scatter plots, and more
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Add a title</strong> - Give your visualization a descriptive title
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Choose AI model</strong> - Select an AI model based on your data complexity and device capabilities
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Pro Tip:</strong> Different chart types work better for different data structures. For comparison between categories, bar charts work well. For trends over time, consider line charts. For proportions of a whole, pie and doughnut charts are effective.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4 dark:text-white">Generate and Export</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Generate visualization</strong> - Click the "Generate Visualization" button to let the AI analyze and visualize your data
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Review your chart</strong> - Examine the visualization in the Chart View tab
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Export as PNG</strong> - Download your visualization as a high-quality PNG image
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      4
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong>Access saved charts</strong> - Your recent visualizations are automatically saved and can be accessed in the Recent Charts tab
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Pro Tip:</strong> For larger datasets, the AI processing might take a bit longer as it runs entirely on your device. Be patient during the analysis phase for the best results.
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="bg-gray-50 dark:bg-gray-800 aspect-video rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📥</div>
                    <div className="text-gray-500 dark:text-gray-400">Export Illustration</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
