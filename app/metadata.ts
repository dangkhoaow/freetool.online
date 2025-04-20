import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FreeTool | Free Online Tools for Image & File Conversion",
  description: "Free browser-based tools for image conversion, file format transformation, and more. No software installation needed. 100% secure, private processing.",
  keywords: "free online tools, HEIC converter, file conversion tools, browser tools, image conversion, PDF tools, free software tools, no installation tools",
  openGraph: {
    title: "FreeTool | Free Online Tools for Image & File Conversion",
    description: "Free browser-based tools for image conversion, file format transformation, and more. No software installation needed and 100% secure.",
    url: "https://freetool.online",
    siteName: "FreeTool",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreeTool | Free Online Tools for Image & File Conversion",
    description: "Free browser-based tools for image conversion, file format transformation, and more. No software installation needed.",
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
    canonical: "https://freetool.online",
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
  verification: {
    google: "google-site-verification=abcdefghijklmnopqrstuvwxyz123456",
  }
}
