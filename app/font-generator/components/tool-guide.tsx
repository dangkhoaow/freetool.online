import { Card, CardContent } from "@/components/ui/card"

export default function ToolGuide() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use the Font Generator</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to create and export your custom styled text
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              <ol className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Enter Your Text</h3>
                    <p className="text-gray-600 mb-2">
                      Type or paste the text you want to style in the text input area. You can use multiple lines by
                      pressing Enter.
                    </p>
                    <p className="text-sm text-gray-500">
                      Tip: Keep your text concise for the best results, especially when using larger font sizes.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Customize Font Settings</h3>
                    <p className="text-gray-600 mb-2">
                      Select your preferred font family, size, weight, and style. Adjust letter spacing and line height
                      to fine-tune the appearance.
                    </p>
                    <p className="text-sm text-gray-500">
                      Tip: Different font families support different weights. If a weight doesn't appear to change, try
                      another font family.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Apply Styling</h3>
                    <p className="text-gray-600 mb-2">
                      Choose text and background colors. Enable text shadow and adjust its properties for depth and
                      emphasis.
                    </p>
                    <p className="text-sm text-gray-500">
                      Tip: For better readability, ensure there's enough contrast between your text and background
                      colors.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Save Your Settings</h3>
                    <p className="text-gray-600 mb-2">
                      If you've created a style you like, save it as a preset by giving it a name and clicking the Save
                      button.
                    </p>
                    <p className="text-sm text-gray-500">
                      Tip: Create different presets for different purposes, like headings, quotes, or social media
                      posts.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Export Your Text</h3>
                    <p className="text-gray-600 mb-2">
                      When you're happy with your styled text, click the "Export as PNG" button to download it as an
                      image file.
                    </p>
                    <p className="text-sm text-gray-500">
                      Tip: You can also copy the image directly to your clipboard for quick pasting into other
                      applications.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
