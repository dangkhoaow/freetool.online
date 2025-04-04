"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
              HEIC Converter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#converter" className="text-gray-700 hover:text-primary transition-colors">
              Converter
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#guide" className="text-gray-700 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="hidden md:block">
            <Button asChild>
              <a href="#converter">Start Converting</a>
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
              href="#guide"
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Button className="w-full" asChild>
              <a href="#converter" onClick={() => setIsMobileMenuOpen(false)}>
                Start Converting
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

