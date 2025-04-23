import HeroSection from "../components/hero-section"
import Footer from "../components/footer"
import { Button } from "../components/ui/button"
import { ArrowRight, Image, Film, FileType, Zap, Shield, Palette, Code, QrCode, Ruler, CheckSquare, FileArchive, Eye, MessageSquare, Flame } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import ToolsSlider from "@/components/tools-slider"

export const metadata = {
  title: "FreeTool Online - Free Browser-Based Tools for Everyday Tasks",
  description: "A collection of free, browser-based tools to help you convert, transform, and optimize your files without installing any software. All processing happens locally for complete privacy.",
}

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Free Online Tools for"
        titleHighlight="Everyday Tasks"
        description="A collection of free, browser-based tools to help you convert, transform, and optimize your files without installing any software."
        badge="100% Free Tools"
        primaryButtonText="Explore Tools"
        secondaryButtonText="View Features"
        primaryButtonHref="#tools"
        secondaryButtonHref="#features"
      />

      {/* Tools Section */}
      <section id="tools" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Our Free Online Tools</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful, browser-based tools that work directly in your browser. No downloads, no installations, just
              results.
            </p>
          </div>

          <ToolsSlider>
            {/* Private AI Chat */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col relative"
            )}>
              {/* Hot Badge */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                <Flame className="h-3 w-3 mr-1" />
                HOT
              </div>
              <div className="h-40 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <MessageSquare className="h-16 w-16 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Private AI Chat</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Chat with AI that runs entirely in your browser. No data sent to servers, ensuring complete privacy.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/private-ai-chat" className="flex items-center justify-center gap-2" aria-label="Use Private AI Chat">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* HEIC Converter */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                <Image className="h-16 w-16 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">HEIC Converter</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Convert HEIC images from your iPhone to JPG, PNG, WEBP, or PDF formats with our AI-powered
                    optimization.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/heic-converter" className="flex items-center justify-center gap-2" aria-label="Use HEIC Converter Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                <Code className="h-16 w-16 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Code Editor</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Write, run, and save JavaScript code directly in your browser. No installation required.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/code-editor" className="flex items-center justify-center gap-2" aria-label="Use Code Editor Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                <Palette className="h-16 w-16 text-red-500 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Color Picker</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select, convert, and save colors in RGB, HEX, and HSL formats. Copy color codes with one click.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/color-picker" className="flex items-center justify-center gap-2" aria-label="Use Color Picker Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* QR Code Generator */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">QR Code Generator</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create custom QR codes for URLs, text, and more. Customize, download, and share instantly.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/qr-code-generator" className="flex items-center justify-center gap-2" aria-label="Use QR Code Generator Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Unit Converter */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 flex items-center justify-center">
                <Ruler className="h-16 w-16 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Unit Converter</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Convert between different units of measurement. Supports length, weight, temperature, and more.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/unit-converter" className="flex items-center justify-center gap-2" aria-label="Use Unit Converter Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Todo List */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <CheckSquare className="h-16 w-16 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Todo List</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    A simple, effective way to manage your tasks with automatic saving to your browser.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/todo-list" className="flex items-center justify-center gap-2" aria-label="Use Todo List Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Font Generator */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-600 dark:text-pink-400"
                >
                  <text x="3" y="18" fontSize="20" fontWeight="bold">A</text>
                </svg>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">Font Generator</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Design and customize text with different fonts, styles, and colors. Export as images.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/font-generator" className="flex items-center justify-center gap-2" aria-label="Use Font Generator Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Steganography Tool */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-center">
                <Eye className="h-16 w-16 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">Steganography Tool</h3>
                  <p className="text-gray-600">
                    Hide secret messages within images using advanced steganography techniques. 100% private.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/steganography-tool" className="flex items-center justify-center gap-2" aria-label="Use Steganography Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* GIF to Frames */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
                <Film className="h-16 w-16 text-purple-500" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">GIF to Frames</h3>
                  <p className="text-gray-600">
                    Extract individual frames from animated GIFs. Choose your output format and frames per second.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/gif-to-frames" className="flex items-center justify-center gap-2" aria-label="Use GIF to Frames Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* PDF Tools */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-green-50 to-teal-50 flex items-center justify-center">
                <FileType className="h-16 w-16 text-green-500" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">PDF Tools</h3>
                  <p className="text-gray-600">
                    Merge, split, compress, and convert PDF files with ease. Powerful PDF manipulation.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/pdf-tools" className="flex items-center justify-center gap-2" aria-label="Use PDF Tools">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Zip Compressor */}
            <div className={cn(
              "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
              "transition-all hover:shadow-md flex-shrink-0 snap-start",
              "w-[300px] flex flex-col"
            )}>
              <div className="h-40 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center justify-center">
                <FileArchive className="h-16 w-16 text-amber-500" aria-hidden="true" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">Zip Compressor</h3>
                  <p className="text-gray-600">
                    Compress folders online, reduce zip file size, and secure files with password protection.
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/zip-compressor" className="flex items-center justify-center gap-2" aria-label="Use Zip Compressor Tool">
                      Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </ToolsSlider>

          {/* View All Tools Button */}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/tools" className="flex items-center gap-2">
                View All Tools <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Why Choose Our Tools</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our tools are designed with simplicity, security, and performance in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Fast Processing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All processing happens directly in your browser, ensuring quick results without waiting for server
                uploads.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">100% Secure</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your files never leave your device. All processing happens locally, ensuring complete privacy and
                security.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-purple-600 dark:text-purple-400"
                  aria-hidden="true"
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
              <h3 className="text-xl font-bold mb-2 dark:text-white">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our tools use advanced AI algorithms to optimize your files, delivering superior results with every
                conversion.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Cross-Platform</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Works on all devices and browsers. Use our tools on desktop, tablet, or mobile without any compatibility
                issues.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-red-600 dark:text-red-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">No Registration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                No sign-ups, no accounts, no email required. Just visit the site and start using our tools immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-cyan-600 dark:text-cyan-400"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Completely Free</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All our tools are 100% free to use with no hidden fees, no watermarks, and no limitations on the number
                of conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Try our free online tools today and see the difference. No registration required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/#tools">Try Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
