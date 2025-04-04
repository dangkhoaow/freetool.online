import { Button } from "@/components/ui/button"
import { Zap, ArrowRight } from "lucide-react"

export default function AiOptimizationSection() {
  return (
    <section id="ai-optimization" className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            AI-Powered Technology
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Image Optimization with AI</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our advanced AI algorithms analyze and optimize your images during conversion, delivering superior quality
            with smaller file sizes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Compression</h3>
              <p className="text-gray-600">
                Our AI analyzes image content to apply optimal compression levels to different areas, reducing file size
                without visible quality loss.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Intelligent Enhancement</h3>
              <p className="text-gray-600">
                Automatically adjusts color balance, contrast, and sharpness to make your images look their best while
                maintaining natural appearance.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-full"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M12 3v12"></path>
                  <path d="m8 11 4 4 4-4"></path>
                  <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Format Optimization</h3>
              <p className="text-gray-600">
                Our AI suggests the best output format based on your image content and intended use, ensuring optimal
                quality and compatibility.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="gap-2" asChild>
            <a href="#converter">
              Try AI Optimization <ArrowRight size={18} />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

