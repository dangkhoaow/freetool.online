import { Code, Save, Play, History, Shield, Zap } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our browser-based code editor provides everything you need to write, test, and save JavaScript code directly
            in your browser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">JavaScript Execution</h3>
            <p className="text-gray-600">
              Write and run JavaScript code directly in your browser. See the output instantly without any server-side
              processing.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Snippet Management</h3>
            <p className="text-gray-600">
              Save your code snippets to localStorage for easy access later. Organize and manage your code library
              efficiently.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Undo/Redo Support</h3>
            <p className="text-gray-600">
              Full undo and redo functionality allows you to experiment with confidence, knowing you can always revert
              changes.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Execution</h3>
            <p className="text-gray-600">
              Code is executed in a sandboxed environment with proper error handling to prevent security issues and
              provide helpful debugging.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Execution</h3>
            <p className="text-gray-600">
              Run your code with a single click and see the results immediately. Perfect for quick testing and
              experimentation.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Offline Capability</h3>
            <p className="text-gray-600">
              Work on your code even without an internet connection. All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
