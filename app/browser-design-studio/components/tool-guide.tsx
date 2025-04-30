import { Pen, Image as ImageIcon, Type, Cpu, Download, Share2 } from "lucide-react"

export default function ToolGuide() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use Browser Design Studio</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get started with our comprehensive design suite in just a few steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-xl font-bold">
                  1
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Pen className="h-5 w-5 mr-2 text-rose-600" />
                  Create or Open a Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start with a new blank canvas or open one of your recent designs. Set your canvas dimensions and background preferences.
                </p>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Pro tip:</span> For web designs, use common dimensions like 1920×1080px for desktop or 360×640px for mobile.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xl font-bold">
                  2
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Create Vector and Raster Elements
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Switch between vector and raster modes to create different types of graphics. Vector tools are perfect for logos and illustrations, while raster tools are ideal for photo editing and texture work.
                </p>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Pro tip:</span> Hold Shift while drawing to create perfect circles, squares, and straight lines.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-xl font-bold">
                  3
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Type className="h-5 w-5 mr-2 text-green-600" />
                  Add and Style Text
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use the text tools to add headings, paragraphs, and labels. Upload custom fonts or use our selection of web-safe fonts. Create curved text for logos and badges.
                </p>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Pro tip:</span> Convert text to paths for creative typography that can be edited like any vector shape.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Step 4 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xl font-bold">
                  4
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-purple-600" />
                  Enhance with AI Tools
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use our AI-powered tools to accelerate your design process. Convert sketches to clean vector paths, transfer styles between elements, or generate layout suggestions.
                </p>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Pro tip:</span> For best results with the vectorizer tool, use high-contrast sketches with clean lines.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xl font-bold">
                  5
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-orange-600" />
                  Organize Layers and Groups
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage your design elements using the layers panel. Group related elements, adjust opacity and blending modes, and rearrange the stacking order.
                </p>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Pro tip:</span> Use keyboard shortcuts (Ctrl+G to group, Ctrl+[ or Ctrl+] to change layer order) for faster workflow.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-xl font-bold">
                  6
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Download className="h-5 w-5 mr-2 text-indigo-600" />
                  Export Your Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export your finished design in various formats. Choose SVG for vector graphics, PNG or JPG for web images, PDF for print, AI for Adobe Illustrator, or CSS for web development.
                </p>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Pro tip:</span> Use the "Optimize file size" option when exporting SVGs for web use to reduce file size.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-rose-600 dark:text-rose-400">File Operations</h4>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">New Document</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">Ctrl+N</code>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Save</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">Ctrl+S</code>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Export</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">Ctrl+E</code>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Editing</h4>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Undo</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">Ctrl+Z</code>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Redo</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">Ctrl+Y</code>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Cut</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">Ctrl+X</code>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">Tools</h4>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Selection Tool</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">V</code>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Pen Tool</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">P</code>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Text Tool</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 text-sm">T</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
