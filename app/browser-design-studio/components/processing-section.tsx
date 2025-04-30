export default function ProcessingSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our design studio processes everything directly in your browser using cutting-edge web technologies, without ever sending your designs to a server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WebAssembly */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">1</div>
            <h3 className="text-xl font-semibold mb-2">WebAssembly Power</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We use WebAssembly (WASM) modules to provide near-native performance for complex operations like boolean path calculations, image processing, and export generation.
            </p>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Tech:</span> boolean-op-wasm for vector operations, wasm-image-magick for filters, pdf-lib for exports
              </p>
            </div>
          </div>

          {/* GPU Acceleration */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">2</div>
            <h3 className="text-xl font-semibold mb-2">GPU Acceleration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              WebGL and WebGPU APIs accelerate rendering and complex computations, utilizing your device's graphics hardware for smooth performance even with large designs.
            </p>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Tech:</span> WebGL for vector rendering, WebGPU for advanced effects and AI acceleration
              </p>
            </div>
          </div>

          {/* Local Processing */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">3</div>
            <h3 className="text-xl font-semibold mb-2">Local Storage</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your designs are automatically saved to your device using IndexedDB, with regular auto-saving and custom font storage for complete offline capability.
            </p>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Tech:</span> IndexedDB for persistent storage, File System Access API for font management
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Technical Architecture</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20">
                <h4 className="font-medium mb-2">User Interface</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600 dark:text-gray-300">React + Tailwind CSS</li>
                  <li className="text-gray-600 dark:text-gray-300">Canvas API for rendering</li>
                  <li className="text-gray-600 dark:text-gray-300">Web Workers for background tasks</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20">
                <h4 className="font-medium mb-2">Processing Engines</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600 dark:text-gray-300">Vector Engine (SVG, boolean ops)</li>
                  <li className="text-gray-600 dark:text-gray-300">Raster Engine (image processing)</li>
                  <li className="text-gray-600 dark:text-gray-300">Text Engine (font handling)</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-medium mb-2">Acceleration</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600 dark:text-gray-300">WebAssembly modules</li>
                  <li className="text-gray-600 dark:text-gray-300">WebGL/WebGPU rendering</li>
                  <li className="text-gray-600 dark:text-gray-300">TensorFlow.js for AI tools</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20">
                <h4 className="font-medium mb-2">Local Storage</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600 dark:text-gray-300">IndexedDB for document storage</li>
                  <li className="text-gray-600 dark:text-gray-300">Local font database</li>
                  <li className="text-gray-600 dark:text-gray-300">Automatic versioning</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            All processing happens locally on your device — no data is ever sent to our servers.
          </div>
        </div>
      </div>
    </section>
  )
}
