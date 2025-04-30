import { 
  Pen, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Cpu, 
  Download, 
  Share2, 
  ShieldCheck 
} from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Professional Graphics Suite, <span className="text-rose-600">Zero Uploads</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our browser-based design studio processes everything locally on your device, giving you pro-level features without compromising privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Vector Editing */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-rose-100 dark:bg-rose-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Pen className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Vector Editing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create and edit precise vector paths with Bezier curves, boolean operations, and path tools powered by WebAssembly.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-rose-100 dark:bg-rose-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Boolean operations (union, subtract, intersect)
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-rose-100 dark:bg-rose-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Path manipulation with Bezier control points
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-rose-100 dark:bg-rose-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                WebGL-accelerated rendering
              </li>
            </ul>
          </div>

          {/* Raster Painting */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Raster Painting</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create stunning digital artwork with our advanced brush engine, blending modes, and filters.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                50+ customizable brush presets
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Advanced blending modes and layer styles
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                WebAssembly-powered image filters
              </li>
            </ul>
          </div>

          {/* Text Engine */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Type className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Typography</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Perfect typography with our comprehensive text engine featuring custom fonts, text-on-path, and OpenType features.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Custom font upload and management
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Text on curved and custom paths
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                OpenType features and advanced styling
              </li>
            </ul>
          </div>

          {/* Advanced Layer System */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Layer System</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize your designs with a powerful layer system that supports blending modes, opacity control, and grouping.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Non-destructive layer editing
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Composite blending modes for creative effects
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Automatic local saving with version history
              </li>
            </ul>
          </div>

          {/* AI Tools */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Design Tools</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Accelerate your design process with local AI tools that run entirely in your browser using TensorFlow.js.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Sketch-to-vector conversion
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Style transfer between elements
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Smart layout generation and suggestions
              </li>
            </ul>
          </div>

          {/* Export Options */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Export</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Export your designs in multiple formats suitable for web, print, or development projects.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                SVG, PNG, JPG, PDF, and AI formats
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                CSS code generation for web projects
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full mr-2">
                  <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                High-resolution and optimized outputs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
