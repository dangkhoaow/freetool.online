"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, WandSparkles, Scissors, ImageIcon, Type, Brush, Sliders, Download } from "lucide-react"

export default function FeatureSection() {
  const features = [
    {
      title: "Layer-Based Editing",
      description:
        "Create and manage multiple layers for complex image compositions, just like in professional desktop applications.",
      icon: Layers,
    },
    {
      title: "Magic Selection Tools",
      description:
        "Automatically select objects and remove backgrounds with our smart selection tools powered by advanced algorithms.",
      icon: WandSparkles,
    },
    {
      title: "Background Removal",
      description: "Easily remove backgrounds from your images with a single click, no green screen required.",
      icon: Scissors,
    },
    {
      title: "4K/8K Support",
      description:
        "Edit high-resolution images with support for 4K and 8K resolution outputs for professional quality results.",
      icon: ImageIcon,
    },
    {
      title: "Text & Typography",
      description:
        "Add text with complete control over fonts, sizes, colors, and effects to create stunning typography.",
      icon: Type,
    },
    {
      title: "Drawing Tools",
      description: "Express your creativity with a variety of brushes, pens, and shapes with customizable properties.",
      icon: Brush,
    },
    {
      title: "Advanced Adjustments",
      description:
        "Fine-tune brightness, contrast, saturation, hue, and more with precise controls for perfect results.",
      icon: Sliders,
    },
    {
      title: "Multiple Export Formats",
      description:
        "Export your work in various formats including PNG, JPEG, WebP, and even vector SVG for certain elements.",
      icon: Download,
    },
  ]

  return (
    <section id="features" className="py-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Professional Features in Your Browser</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                {feature.icon && <feature.icon className="h-10 w-10 text-primary mb-2" />}
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
