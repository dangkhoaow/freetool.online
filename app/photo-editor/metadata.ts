import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Online Photo Editor - Edit Images in 4K/8K Quality",
  description:
    "Professional online photo editor with layers, adjustments, filters, drawing tools, text and vector support. Edit your photos in 4K/8K quality for free, directly in your browser.",
  keywords:
    "photo editor, online image editor, free photo editor, 4K photo editor, 8K photo editor, layer editing, background removal, image adjustment, photo filter, drawing tool, text overlay, image border, vector graphics",
  openGraph: {
    title: "Free Online Photo Editor - Edit Images in 4K/8K Quality",
    description:
      "Professional online photo editor with layers, adjustments, filters, drawing tools, text and vector support. Edit your photos in 4K/8K quality for free, directly in your browser.",
    images: [
      {
        url: "/photo-editor-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Photo Editor Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Photo Editor - Edit Images in 4K/8K Quality",
    description:
      "Professional online photo editor with layers, adjustments, filters, drawing tools, text and vector support. Edit your photos in 4K/8K quality for free, directly in your browser.",
    images: ["/photo-editor-preview.jpg"],
  },
}
