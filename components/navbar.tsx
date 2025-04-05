"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const isHomePage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              FreeTool.Online
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isHomePage ? (
              /* Home page navigation */
              <>
                <Link href="#tools" className="text-gray-700 hover:text-primary transition-colors">
                  Tools
                </Link>
                <Link href="#features" className="text-gray-700 hover:text-primary transition-colors">
                  Features
                </Link>
              </>
            ) : pathname.includes('/heic-converter') ? (
              /* HEIC converter page navigation */
              <>
                <Link href="#converter" className="text-gray-700 hover:text-primary transition-colors">
                  Converter
                </Link>
                <Link href="#ai-features" className="text-gray-700 hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                  All Tools
                </Link>
              </>
            ) : pathname.includes('/gif-to-frames') ? (
              /* GIF to Frames page navigation */
              <>
                <Link href="#converter" className="text-gray-700 hover:text-primary transition-colors">
                  Converter
                </Link>
                <Link href="#features" className="text-gray-700 hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                  All Tools
                </Link>
              </>
            ) : pathname.startsWith('/admin') ? (
              /* Admin page navigation */
              <>
                <Link href="/admin/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/settings" className="text-gray-700 hover:text-primary transition-colors">
                  Settings
                </Link>
              </>
            ) : (
              /* Default navigation */
              <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                Home
              </Link>
            )}
          </nav>

          <div className="hidden md:block">
            <Button asChild>
              {isHomePage ? (
                <Link href="#tools">Explore Tools</Link>
              ) : (
                <a href="#converter">Start Converting</a>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t mt-2">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {isHomePage ? (
              /* Home page mobile navigation */
              <>
                <Link
                  href="#tools"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tools
                </Link>
                <Link
                  href="#features"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Button className="w-full" asChild>
                  <Link href="#tools" onClick={() => setIsMobileMenuOpen(false)}>
                    Explore Tools
                  </Link>
                </Button>
              </>
            ) : pathname.includes('/heic-converter') || pathname.includes('/gif-to-frames') ? (
              /* Tool page mobile navigation */
              <>
                <Link
                  href="#converter"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Converter
                </Link>
                <Link
                  href="#features"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Tools
                </Link>
                <Button className="w-full" asChild>
                  <a href="#converter" onClick={() => setIsMobileMenuOpen(false)}>
                    Start Converting
                  </a>
                </Button>
              </>
            ) : pathname.startsWith('/admin') ? (
              /* Admin page mobile navigation */
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            ) : (
              /* Default mobile navigation */
              <Link
                href="/"
                className="text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
