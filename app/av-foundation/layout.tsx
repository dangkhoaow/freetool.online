import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./av-foundation-theme.css"
import { metadata as avMetadata } from "./metadata"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = avMetadata

export default function AVFoundationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`av-foundation-theme ${dmSans.variable} font-sans antialiased min-h-screen`}>
      {children}
    </div>
  )
}
