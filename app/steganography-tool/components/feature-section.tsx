import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, FileText, Eye, Save } from "lucide-react"

const features = [
  {
    title: "Hide Text & Files",
    description:
      "Securely hide text messages or files within images using advanced steganography techniques that preserve image quality.",
    icon: <FileText className="h-8 w-8" />,
  },
  {
    title: "Extract Hidden Content",
    description: "Easily extract hidden text messages or files from steganographic images with just a few clicks.",
    icon: <Eye className="h-8 w-8" />,
  },
  {
    title: "Client-Side Processing",
    description:
      "All processing happens in your browser. Your images and hidden data never leave your device, ensuring complete privacy.",
    icon: <Lock className="h-8 w-8" />,
  },
  {
    title: "Save & Manage",
    description: "Save your steganographic images locally and manage them easily through the built-in gallery.",
    icon: <Save className="h-8 w-8" />,
  },
]

export default function FeatureSection() {
  return (
    <section className="py-16 bg-gray-50" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced Steganography Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our steganography tool uses cutting-edge techniques to securely hide your messages within images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="pb-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
