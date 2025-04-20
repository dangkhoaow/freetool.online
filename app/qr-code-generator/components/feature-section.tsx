import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Palette, Download, History, ImageIcon, Shield } from "lucide-react"

export default function FeatureSection() {
  return (
    <section id="features" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">QR Code Generator Features</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our free QR code generator offers powerful features to create customized QR codes for any purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <QrCode className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Generate QR Codes</CardTitle>
              <CardDescription>Create QR codes for URLs, text, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Easily generate QR codes for websites, plain text, contact information, and more. Our tool supports all
                standard QR code formats with adjustable size and error correction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <ImageIcon className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Custom Logo Embedding</CardTitle>
              <CardDescription>Add your brand logo to QR codes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Personalize your QR codes by embedding your logo or any image in the center. Adjust the logo size and
                position to create branded QR codes that maintain excellent scannability with our automatic error
                correction optimization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Palette className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Customizable Design</CardTitle>
              <CardDescription>Personalize colors and appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Customize the appearance of your QR codes with different colors for foreground and background. Match
                your brand colors while maintaining optimal contrast for scanning reliability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Download className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Download & Share</CardTitle>
              <CardDescription>Save and distribute your QR codes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Download your QR codes as high-quality PNG images for printing or digital sharing. Copy directly to your
                clipboard for easy pasting into documents, presentations, or messages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <History className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>QR Code History</CardTitle>
              <CardDescription>Access your recent QR codes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your recently generated QR codes are automatically saved in your browser. Easily access, edit, and
                regenerate them without having to re-enter your information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Shield className="h-8 w-8 mb-2 text-blue-600" />
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Your data stays on your device</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All QR code generation happens locally in your browser. Your content and images are never sent to our
                servers, ensuring complete privacy and security for your data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
