import { Zap, Image, FileDown, Sparkles } from "lucide-react"
import { Check } from "lucide-react"

export default function AiFeatures() {
  return (
    <section id="features" className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">AI-Powered Optimization</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our advanced AI technology enhances your images automatically, delivering superior results with every
            conversion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Smart Enhancement</h3>
            <p className="text-gray-600 dark:text-gray-300">
              AI automatically adjusts contrast, brightness, and color balance to make your images look their best.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FileDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Intelligent Compression</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Reduce file size without visible quality loss using content-aware compression algorithms.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Noise Reduction</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically detect and reduce image noise while preserving important details and textures.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Format Optimization</h3>
            <p className="text-gray-600 dark:text-gray-300">
              AI suggests the best format based on your image content and intended use case.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">How Our AI Works</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our advanced AI analyzes each image pixel by pixel to determine the optimal processing strategy. It
                identifies areas that need enhancement while preserving important details.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-1 mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Analyzes image content and quality</span>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-1 mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Applies targeted enhancements where needed</span>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-1 mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Optimizes compression based on content type</span>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-1 mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Preserves important metadata when requested</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden">
                <img src="/ai-heic-converter.jpg" alt="AI Image Enhancement Visualization" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
