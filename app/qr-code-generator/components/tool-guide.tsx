import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, ImageIcon, Palette, Share2 } from "lucide-react"

export default function ToolGuide() {
  return (
    <section id="tool-guide" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use Our QR Code Generator</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Follow these simple steps to create, customize, and download your QR codes with ease.
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span>Basic Usage</span>
            </TabsTrigger>
            <TabsTrigger value="custom-logo" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Custom Logo</span>
            </TabsTrigger>
            <TabsTrigger value="styling" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Styling</span>
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Saving & Sharing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creating a Basic QR Code</CardTitle>
                <CardDescription>Generate a QR code in just a few simple steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Enter your content</h3>
                  <p className="text-gray-600">
                    Type or paste the text or URL you want to encode in the QR code. URLs will automatically open in a
                    browser when scanned.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">2. Adjust size and margins</h3>
                  <p className="text-gray-600">
                    Use the sliders to adjust the size and margin of your QR code. Larger QR codes are easier to scan
                    from a distance.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">3. Set error correction level</h3>
                  <p className="text-gray-600">
                    Choose an error correction level. Higher levels make your QR code more resilient to damage or
                    obstruction, but create more complex patterns.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">4. Download your QR code</h3>
                  <p className="text-gray-600">
                    Click the Download button to save your QR code as a PNG image that you can print or share.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-logo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adding a Custom Logo to Your QR Code</CardTitle>
                <CardDescription>Personalize your QR code with your own logo or image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Enable logo feature</h3>
                  <p className="text-gray-600">
                    Toggle the "Add Logo Image" switch to enable the logo feature. This will automatically set the error
                    correction to "High" for better scanning reliability.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">2. Upload your logo</h3>
                  <p className="text-gray-600">
                    Click the "Upload Logo" button to select an image from your device. We support JPEG, PNG, GIF, and
                    SVG formats up to 2MB in size.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">3. Adjust logo size</h3>
                  <p className="text-gray-600">
                    Use the Logo Size slider to adjust how large your logo appears in the QR code. A smaller logo
                    generally improves scannability.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">4. Test your QR code</h3>
                  <p className="text-gray-600">
                    Always test your QR code with several different scanning apps to ensure it works reliably before
                    sharing it widely.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-md border border-amber-200 text-amber-800 text-sm">
                  <strong>Important:</strong> Adding a logo may reduce the scannability of your QR code. For best
                  results:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Use a simple, high-contrast logo</li>
                    <li>Keep the logo size small (under 25% of the QR code)</li>
                    <li>Always use "High" error correction</li>
                    <li>Test thoroughly before distributing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Styling Your QR Code</CardTitle>
                <CardDescription>Customize the appearance of your QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Change colors</h3>
                  <p className="text-gray-600">
                    Use the color pickers to change the foreground (dark) and background (light) colors of your QR code.
                    High contrast between these colors ensures better scannability.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">2. Adjust error correction</h3>
                  <p className="text-gray-600">
                    Higher error correction levels create more complex patterns but allow for more customization and
                    better scanning when the code is partially obscured.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">3. Add a custom logo</h3>
                  <p className="text-gray-600">
                    Personalize your QR code by adding your logo or brand image in the center. This makes your QR code
                    more recognizable and branded.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-md border border-blue-200 text-blue-800 text-sm">
                  <strong>Design Tip:</strong> While you can customize colors, maintain high contrast between foreground
                  and background colors for optimal scanning. Very light foreground colors or very dark background
                  colors may reduce scannability.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saving and Sharing QR Codes</CardTitle>
                <CardDescription>Download, save, and share your QR codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Download as PNG</h3>
                  <p className="text-gray-600">
                    Click the "Download PNG" button to save your QR code as a high-quality image file that can be
                    printed or shared digitally.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">2. Copy to clipboard</h3>
                  <p className="text-gray-600">
                    Use the "Copy to Clipboard" button to copy your QR code image directly to your clipboard for pasting
                    into documents or messages.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">3. Access history</h3>
                  <p className="text-gray-600">
                    Your recently generated QR codes are saved in the "Recent QR Codes" tab. You can quickly access and
                    regenerate them without re-entering the information.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">4. Print your QR code</h3>
                  <p className="text-gray-600">
                    For physical use, download your QR code and print it. Ensure the printed size is large enough to be
                    easily scanned (at least 2 x 2 inches or 5 x 5 cm for most uses).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
