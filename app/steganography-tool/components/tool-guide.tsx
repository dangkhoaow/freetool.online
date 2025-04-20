import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, EyeOff, Eye, Save, FileText, Download } from "lucide-react"

export default function ToolGuide() {
  const steps = [
    {
      title: "Upload a Carrier Image",
      description:
        "Start by uploading an image that will carry your hidden content. Larger images can store more data.",
      icon: <Upload className="h-6 w-6" />,
    },
    {
      title: "Choose What to Hide",
      description:
        "Select whether you want to hide text or a file. For text, type your message. For files, select the file you want to hide.",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: "Hide Your Content",
      description:
        "Click the 'Hide Text in Image' or 'Hide File in Image' button to embed your content into the image using steganography.",
      icon: <EyeOff className="h-6 w-6" />,
    },
    {
      title: "Save or Download",
      description:
        "Your steganographic image will be automatically saved in the 'Saved Images' tab. You can also download it to your device.",
      icon: <Download className="h-6 w-6" />,
    },
    {
      title: "Extract Hidden Content",
      description:
        "To extract hidden content, go to the 'Extract Text' tab, upload a steganographic image, and click 'Extract Hidden Content'.",
      icon: <Eye className="h-6 w-6" />,
    },
    {
      title: "Manage Your Images",
      description:
        "Use the 'Saved Images' tab to view, download, or extract content from your previously created steganographic images.",
      icon: <Save className="h-6 w-6" />,
    },
  ]
  return (
    <section className="py-16" id="tool-guide">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use Our Steganography Tool</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to hide your messages in images or extract hidden messages.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="hide">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="hide">Hiding Text</TabsTrigger>
                <TabsTrigger value="extract">Extracting Text</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="hide" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">1. Upload an Image</h3>
                    <p className="text-sm text-gray-600">
                      Start by uploading the image you want to use as a carrier for your hidden message. We support PNG,
                      JPG, WEBP, and GIF formats.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <EyeOff className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">2. Enter Your Secret Text</h3>
                    <p className="text-sm text-gray-600">
                      Type or paste the text you want to hide. The maximum length depends on the image dimensions -
                      larger images can store more text.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <Save className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">3. Hide and Download</h3>
                    <p className="text-sm text-gray-600">
                      Click "Hide Text in Image" to encode your message. The processed image will be saved automatically
                      and available for download.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2">Important Notes:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>The encoded image will be saved in PNG format to preserve all data.</li>
                    <li>There is no visible difference between the original and encoded images.</li>
                    <li>The maximum text length depends on the image size - larger images can store more text.</li>
                    <li>Your data never leaves your device - all processing happens locally in your browser.</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="extract" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">1. Upload the Image</h3>
                    <p className="text-sm text-gray-600">
                      Upload the image that contains the hidden message. You can use an image from your saved list or
                      upload a new one.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">2. Extract the Hidden Text</h3>
                    <p className="text-sm text-gray-600">
                      Click "Extract Hidden Text" to decode the message. The tool will analyze the image and retrieve
                      any hidden text.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">3. View the Message</h3>
                    <p className="text-sm text-gray-600">
                      The extracted text will be displayed in the output area. You can copy it to your clipboard or read
                      it directly.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2">Troubleshooting:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>If no text is found, the image might not contain any hidden messages.</li>
                    <li>Image compression can damage hidden data - always use the original encoded image.</li>
                    <li>
                      Some image editing tools or social media platforms may strip hidden data when saving or uploading
                      images.
                    </li>
                    <li>For best results, use PNG format and avoid editing the image after encoding.</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Understanding LSB Steganography</h3>
                    <p className="text-sm text-gray-700">
                      Our tool uses the Least Significant Bit (LSB) technique, which works by replacing the least
                      significant bit of each color channel (Red, Green, Blue) in each pixel with bits from your
                      message.
                    </p>
                    <p className="text-sm text-gray-700">
                      Since changing the least significant bit only changes the color value by at most 1/255, these
                      changes are imperceptible to the human eye, making the steganography virtually invisible.
                    </p>

                    <h3 className="text-lg font-medium mt-6">Capacity Calculation</h3>
                    <p className="text-sm text-gray-700">
                      The maximum text length an image can store depends on its dimensions:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Each pixel has 3 color channels (RGB)</li>
                      <li>Each channel can store 1 bit of data</li>
                      <li>Each character requires 16 bits (for Unicode support)</li>
                      <li>We reserve 32 bits (96 bits) to store the text length</li>
                      <li>Formula: Max Characters = ((Width × Height × 3) - 96) ÷ 16</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Best Practices</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>
                        <strong>Use PNG format:</strong> PNG is lossless and preserves all pixel data exactly.
                      </li>
                      <li>
                        <strong>Choose larger images:</strong> They can store more text and make changes less
                        detectable.
                      </li>
                      <li>
                        <strong>Use complex images:</strong> Images with lots of detail and color variation hide data
                        better.
                      </li>
                      <li>
                        <strong>Avoid compression:</strong> Don't edit or save the encoded image with lossy compression.
                      </li>
                      <li>
                        <strong>Keep original filenames discrete:</strong> Don't name your files in ways that suggest
                        hidden content.
                      </li>
                    </ul>

                    <h3 className="text-lg font-medium mt-6">Security Considerations</h3>
                    <p className="text-sm text-gray-700">
                      While steganography hides the existence of a message, it doesn't encrypt the content. For
                      sensitive information, consider these additional steps:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Encrypt your text before hiding it in an image</li>
                      <li>Use a password or key that only the recipient knows</li>
                      <li>Avoid sharing the image on social media or public platforms</li>
                      <li>Remember that specialized steganalysis tools can detect the presence of hidden data</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
