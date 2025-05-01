"use client"

import { Check, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function ToolGuide() {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 dark:text-white">How to Use the Client Site Builder</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Follow these simple steps to create your website in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 text-white mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Your Project</h3>
              <p className="text-white/80 text-sm">
                Create a new project or open an existing one from your local storage
              </p>
            </div>
            <CardContent className="p-5">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Choose from template gallery or start blank</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Set page size, theme colors, and base fonts</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Projects automatically save as you work</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 text-white mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Design Your Pages</h3>
              <p className="text-white/80 text-sm">
                Use the drag-and-drop editor to build beautiful pages
              </p>
            </div>
            <CardContent className="p-5">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Drag components from the sidebar to your canvas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Customize styles, colors, and content</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Use AI to generate text and improve designs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/20 text-white mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Preview & Export</h3>
              <p className="text-white/80 text-sm">
                Test your site and export it for publishing
              </p>
            </div>
            <CardContent className="p-5">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Preview in desktop, tablet, and mobile views</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Export as clean HTML/CSS or static site package</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Deploy directly to hosting platforms</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <a href="#builder" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Get Started Now
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
