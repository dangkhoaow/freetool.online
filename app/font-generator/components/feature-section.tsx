import { Card, CardContent } from "@/components/ui/card"
import { Type, Download, Save, Palette, Layers, Smartphone } from "lucide-react"

export default function FeatureSection() {
  const features = [
    {
      icon: <Type className="h-10 w-10 text-blue-600" />,
      title: "Custom Typography",
      description:
        "Customize font family, weight, style, size, and spacing to create the perfect text appearance for your needs.",
    },
    {
      icon: <Palette className="h-10 w-10 text-blue-600" />,
      title: "Advanced Styling",
      description:
        "Apply colors, shadows, and backgrounds to make your text stand out. Fine-tune every aspect of your text's appearance.",
    },
    {
      icon: <Download className="h-10 w-10 text-blue-600" />,
      title: "Export as Images",
      description:
        "Download your styled text as PNG images for use in social media, presentations, designs, or anywhere you need custom text.",
    },
    {
      icon: <Save className="h-10 w-10 text-blue-600" />,
      title: "Save Presets",
      description:
        "Create and save your favorite font settings as presets for quick access later. Never lose your perfect text style.",
    },
    {
      icon: <Layers className="h-10 w-10 text-blue-600" />,
      title: "Real-time Preview",
      description:
        "See your changes instantly with our live preview. Experiment with different settings and get immediate visual feedback.",
    },
    {
      icon: <Smartphone className="h-10 w-10 text-blue-600" />,
      title: "Works Offline",
      description:
        "All processing happens in your browser. Create and export text images even without an internet connection.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our font generator tool provides everything you need to create beautiful, custom-styled text for any
            purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
