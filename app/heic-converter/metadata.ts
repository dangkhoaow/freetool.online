import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free HEIC to JPG Converter | AI-Powered HEIC Image Conversion Tool",
  description: "Convert HEIC photos from iPhone to JPG, PNG, WEBP, or PDF with AI optimization. Fast, secure, browser-based conversion with no file upload required.",
  keywords: "HEIC converter, HEIC to JPG, HEIC to PNG, convert iPhone photos, HEIC converter online, free HEIC converter, HEIC to PDF, HEIC to WEBP, AI image optimization",
  openGraph: {
    title: "Free HEIC to JPG Converter | Convert iPhone Photos Online",
    description: "Convert HEIC photos from iPhone to JPG, PNG, WEBP, or PDF with AI optimization. 100% free, secure, and works directly in your browser.",
    url: "https://freetool.online/heic-converter",
    siteName: "FreeTool",
    images: [
      {
        url: "https://freetool.online/images/heic-converter-og.jpg",
        width: 1200,
        height: 630,
        alt: "HEIC to JPG Converter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HEIC to JPG Converter | Convert iPhone Photos Online",
    description: "Convert HEIC photos from iPhone to JPG, PNG, WEBP, or PDF with AI optimization. 100% free and secure.",
    images: ["https://freetool.online/images/heic-converter-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://freetool.online/heic-converter",
  },
}
