"use client"

import { Button } from "@/components/ui/button"
import { ImageIcon, Zap, Upload } from "lucide-react"
import type { ReactNode } from "react"
import Link from "next/link"

interface HeroSectionProps {
  title?: string
  titleHighlight?: string
  description?: string
  badge?: string
  primaryButtonText?: string
  secondaryButtonText?: string
  primaryButtonIcon?: ReactNode
  secondaryButtonIcon?: ReactNode
  onPrimaryButtonClick?: () => void
  onSecondaryButtonClick?: () => void
  primaryButtonHref?: string
  secondaryButtonHref?: string
}

export default function HeroSection({
  title = "Convert HEIC Images with",
  titleHighlight = "AI Optimization",
  description = "Transform your HEIC images to JPG, PNG, WEBP, or PDF with our advanced AI-powered converter. Get smaller file sizes without sacrificing quality.",
  badge = "AI-Powered Image Conversion",
  primaryButtonText = "Start Converting",
  secondaryButtonText = "Learn More",
  primaryButtonIcon = <Upload className="h-5 w-5" />,
  secondaryButtonIcon = <Zap className="h-5 w-5" />,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  primaryButtonHref,
  secondaryButtonHref,
}: HeroSectionProps) {
  return (
    <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              {badge}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {title}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {titleHighlight}
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">{description}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryButtonHref ? (
                <Button asChild size="lg" className="gap-2">
                  <Link href={primaryButtonHref} aria-label={primaryButtonText}>
                    {primaryButtonIcon}
                    {primaryButtonText}
                  </Link>
                </Button>
              ) : (
                onPrimaryButtonClick && (
                  <Button size="lg" onClick={onPrimaryButtonClick} className="gap-2" aria-label={primaryButtonText}>
                    {primaryButtonIcon}
                    {primaryButtonText}
                  </Button>
                )
              )}

              {secondaryButtonHref ? (
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href={secondaryButtonHref} aria-label={secondaryButtonText}>
                    {secondaryButtonIcon}
                    {secondaryButtonText}
                  </Link>
                </Button>
              ) : (
                onSecondaryButtonClick && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={onSecondaryButtonClick}
                    aria-label={secondaryButtonText}
                  >
                    {secondaryButtonIcon}
                    {secondaryButtonText}
                  </Button>
                )
              )}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-blue-600" aria-hidden="true" />
                <span className="text-sm text-gray-600">Supports batch conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-blue-600" aria-hidden="true" />
                <span className="text-sm text-gray-600">AI-powered optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span className="text-sm text-gray-600">100% secure & private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
