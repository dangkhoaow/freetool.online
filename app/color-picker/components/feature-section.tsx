import { Palette, Copy, Heart, History, Droplet, Contrast } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Multiple Color Formats</h3>
            <p className="text-gray-600">
              Work with HEX, RGB, and HSL color formats. Easily convert between formats with real-time synchronization.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Copy className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">One-Click Copy</h3>
            <p className="text-gray-600">
              Copy color values to your clipboard with a single click. Perfect for web developers and designers.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Save Favorites</h3>
            <p className="text-gray-600">
              Save your favorite colors for quick access later. Create your own color library that persists across
              sessions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Color History</h3>
            <p className="text-gray-600">
              Automatically track recently used colors. Never lose that perfect shade you found earlier.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplet className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Color Palettes</h3>
            <p className="text-gray-600">
              Generate complementary, analogous, and monochromatic color schemes from your selected color.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Contrast className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Accessibility Checks</h3>
            <p className="text-gray-600">
              Check contrast ratios for accessibility compliance. Ensure your color choices meet WCAG standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
