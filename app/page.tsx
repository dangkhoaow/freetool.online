"use client"

import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Image, Film, FileType, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function Home() {
  // Function to scroll to tools section
  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools")
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Function to scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="Free Online Tools for"
        titleHighlight="Everyday Tasks"
        description="A collection of free, browser-based tools to help you convert, transform, and optimize your files without installing any software."
        badge="100% Free Tools"
        primaryButtonText="Explore Tools"
        secondaryButtonText="View Features"
        onPrimaryButtonClick={scrollToTools}
        onSecondaryButtonClick={scrollToFeatures}
      />

      {/* Tools Section */}
      <section id="tools" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Free Online Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful, browser-based tools that work directly in your browser. No downloads, no installations, just
              results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* HEIC Converter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="h-40 bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-center">
                <Image className="h-16 w-16 text-blue-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">HEIC Converter</h3>
                <p className="text-gray-600 mb-4">
                  Convert HEIC images from your iPhone to JPG, PNG, WEBP, or PDF formats with our AI-powered
                  optimization.
                </p>
                <Button asChild className="w-full">
                  <Link href="/heic-converter" className="flex items-center justify-center gap-2">
                    Use Tool <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* GIF to Frames */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="h-40 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
                <Film className="h-16 w-16 text-purple-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">GIF to Frames</h3>
                <p className="text-gray-600 mb-4">
                  Extract individual frames from animated GIFs. Choose your output format and frames per second for
                  perfect results.
                </p>
                <Button asChild className="w-full">
                  <Link href="/gif-to-frames" className="flex items-center justify-center gap-2">
                    Use Tool <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="h-40 bg-gradient-to-r from-green-50 to-teal-50 flex items-center justify-center">
                <FileType className="h-16 w-16 text-green-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-bold">PDF Tools</h3>
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Coming Soon
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Merge, split, compress, and convert PDF files with ease. Powerful PDF manipulation without installing
                  any software.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="#" className="flex items-center justify-center gap-2">
                    Coming Soon <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our tools are designed with simplicity, security, and performance in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Processing</h3>
              <p className="text-gray-600">
                All processing happens directly in your browser, ensuring quick results without waiting for server
                uploads.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Secure</h3>
              <p className="text-gray-600">
                Your files never leave your device. All processing happens locally, ensuring complete privacy and
                security.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <path d="M12 2v4"></path>
                  <path d="M12 18v4"></path>
                  <path d="M4.93 4.93l2.83 2.83"></path>
                  <path d="M16.24 16.24l2.83 2.83"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                  <path d="M4.93 19.07l2.83-2.83"></path>
                  <path d="M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Our tools use advanced AI algorithms to optimize your files, delivering superior results with every
                conversion.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-600"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Cross-Platform</h3>
              <p className="text-gray-600">
                Works on all devices and browsers. Use our tools on desktop, tablet, or mobile without any compatibility
                issues.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Registration</h3>
              <p className="text-gray-600">
                No sign-ups, no accounts, no email required. Just visit the site and start using our tools immediately.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-600"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Completely Free</h3>
              <p className="text-gray-600">
                All our tools are 100% free to use with no hidden fees, no watermarks, and no limitations on the number
                of conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Try our free online tools today and see the difference. No registration required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/heic-converter">Try HEIC Converter</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/gif-to-frames">Try GIF to Frames</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

