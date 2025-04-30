import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Data Visualization Tool | 100% Private Local Processing",
  description:
    "Free AI-powered data visualization tool that works entirely in your browser. Analyze Excel, CSV, or text data with local LLM processing for complete privacy. No data leaves your device.",
  keywords:
    "data visualization, AI chart generator, local LLM visualization, browser data analysis, private data analysis, Chart.js visualization, offline data visualization, Excel to chart, CSV to chart",
  openGraph: {
    title: "AI Data Visualization Tool | 100% Private & Secure",
    description:
      "Transform your data into beautiful charts using AI processing that stays entirely on your device. No data uploads, no privacy concerns.",
    url: "https://freetool.online/ai-data-visualization",
    siteName: "FreeTool",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/ai-data-visualization-og.jpg",
        width: 1200,
        height: 630,
        alt: "AI Data Visualization Tool with Local Processing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Data Visualization Tool | 100% Private & Secure",
    description:
      "Transform your data into beautiful charts with 100% local AI processing. No data leaves your device.",
    images: ["/images/ai-data-visualization-og.jpg"],
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
    canonical: "https://freetool.online/ai-data-visualization",
  },
}
