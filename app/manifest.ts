import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FreeTool Online",
    short_name: "FreeTool",
    description: "Free browser-based tools for everyday tasks",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon"
      }
    ]
  }
} 