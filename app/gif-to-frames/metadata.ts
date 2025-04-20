import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free GIF to Frames Converter | Extract Images from Animated GIFs",
  description:
    "Convert animated GIFs to individual PNG or JPG frames with our free online tool. Extract every frame or select specific intervals. No software installation needed.",
  keywords:
    "GIF to frames, GIF splitter, extract frames from GIF, GIF to PNG, GIF to JPG, animated GIF converter, GIF frame extractor, online GIF tool",
  openGraph: {
    title: "Free GIF to Frames Converter | Extract Images from Animated GIFs",
    description:
      "Convert animated GIFs to individual PNG or JPG frames with our free online tool. 100% secure, browser-based processing.",
    url: "https://freetool.online/gif-to-frames",
    siteName: "FreeTool",
    images: [
      {
        url: "https://freetool.online/images/gif-to-frames-og.jpg",
        width: 1200,
        height: 630,
        alt: "GIF to Frames Converter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free GIF to Frames Converter | Extract Images from Animated GIFs",
    description:
      "Convert animated GIFs to individual PNG or JPG frames with our free online tool. 100% secure and private.",
    images: ["https://freetool.online/images/gif-to-frames-og.jpg"],
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
    canonical: "https://freetool.online/gif-to-frames",
  },
}
