"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Coffee, Star } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isHomePage = pathname === "/"
  const isToolsPage = pathname === "/tools"
  
  // Check if the current path is a tool page (any app page that's not home or admin)
  const isToolPage = !isHomePage && !isToolsPage && !pathname.startsWith("/admin") && !pathname.startsWith("/health")

  // Determine the tool section ID based on the pathname
  const getToolSectionId = () => {
    if (pathname.includes("/heic-converter") || pathname.includes("/gif-to-frames") || 
        pathname.includes("/pdf-tools") || pathname.includes("/zip-compressor")) {
      return "converter"
    } else if (pathname.includes("/code-editor")) {
      return "editor"
    } else if (pathname.includes("/color-picker")) {
      return "color-picker"
    } else if (pathname.includes("/qr-code-generator")) {
      return "qr-code-generator"
    } else if (pathname.includes("/unit-converter")) {
      return "converter"
    } else if (pathname.includes("/todo-list")) {
      return "todo-list"
    } else if (pathname.includes("/font-generator")) {
      return "font-generator"
    } else if (pathname.includes("/steganography-tool")) {
      return "steganography-tool"
    } else if (pathname.includes("/private-ai-chat")) {
      return "chat-tool"
    } else {
      return "tool" // Default section ID
    }
  }

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
        isScrolled 
          ? "bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 py-2" 
          : "bg-transparent dark:bg-transparent py-4"
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
                <Link href="/tools" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Tools
                </Link>
                <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Features
                </Link>
              </>
            ) : pathname.startsWith("/admin") ? (
              /* Admin page navigation */
              <>
                <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/settings" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Settings
                </Link>
              </>
            ) : isToolPage ? (
              /* Tool page navigation (standard for all tools) */
              <>
                <Link href={`#${getToolSectionId()}`} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  {pathname.includes("/code-editor") ? "Editor" : 
                   pathname.includes("/todo-list") ? "Todo List" : 
                   pathname.includes("/color-picker") ? "Color Picker" : 
                   pathname.includes("/qr-code-generator") ? "QR Code" : 
                   pathname.includes("/unit-converter") ? "Converter" : 
                   pathname.includes("/font-generator") ? "Font Generator" : 
                   pathname.includes("/steganography-tool") ? "Steganography" : 
                   pathname.includes("/private-ai-chat") ? "Start Chat" : "Converter"}
                </Link>
                <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="/tools" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                  All Tools
                </Link>
              </>
            ) : isToolsPage ? (
              /* No navigation links for /tools page */
              <></>
            ) : (
              /* Default navigation */
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                Home
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            {/* Trustpilot Review Button */}
            <Button asChild variant="outline" size="sm" className="text-[#00b67a] hover:text-[#00b67a] border-[#00b67a] hover:border-[#00b67a] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <a href="https://www.trustpilot.com/review/freetoolonline.com?utm_medium=trustbox&utm_source=TrustBoxReviewCollector" target="_blank" rel="noopener noreferrer">
                <Star className="h-4 w-4 mr-1 fill-[#00b67a]" />
                Review Us
              </a>
            </Button>
            
            {/* PayPal Donate Button */}
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" className="inline-block">
              <input type="hidden" name="cmd" value="_s-xclick" />
              <input type="hidden" name="hosted_button_id" value="W56TRR5BUFEGQ" />
              <Button variant="outline" size="sm" className="text-[#0070ba] hover:text-[#003087] border-[#0070ba] hover:border-[#003087] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 154.728 190.5" className="w-4 h-4 mr-1">
                  <g transform="translate(898.192 276.071)">
                    <path clipPath="none" d="M-837.663-237.968a5.49 5.49 0 0 0-5.423 4.633l-9.013 57.15-8.281 52.514-.005.044.01-.044 8.281-52.514c.421-2.669 2.719-4.633 5.42-4.633h26.404c26.573 0 49.127-19.387 53.246-45.658.314-1.996.482-3.973.52-5.924v-.003h-.003c-6.753-3.543-14.683-5.565-23.372-5.565z" fill="#001c64"/>
                    <path clipPath="none" d="M-766.506-232.402c-.037 1.951-.207 3.93-.52 5.926-4.119 26.271-26.673 45.658-53.246 45.658h-26.404c-2.701 0-4.999 1.964-5.42 4.633l-8.281 52.514-5.197 32.947a4.46 4.46 0 0 0 4.405 5.153h28.66a5.49 5.49 0 0 0 5.423-4.633l7.55-47.881c.423-2.669 2.722-4.636 5.423-4.636h16.876c26.573 0 49.124-19.386 53.243-45.655 2.924-18.649-6.46-35.614-22.511-44.026z" fill="#0070e0"/>
                    <path clipPath="none" d="M-870.225-276.071a5.49 5.49 0 0 0-5.423 4.636l-22.489 142.608a4.46 4.46 0 0 0 4.405 5.156h33.351l8.281-52.514 9.013-57.15a5.49 5.49 0 0 1 5.423-4.633h47.782c8.691 0 16.621 2.025 23.375 5.563.46-23.917-19.275-43.666-46.412-43.666z" fill="#003087"/>
                  </g>
                </svg>
                Donate
              </Button>
            </form>

            {/* Buy Me A Coffee Button */}
            <Button asChild variant="outline" size="sm" className="text-[#FFDD00] hover:text-[#FFDD00] border-[#FFDD00] hover:border-[#FFDD00] bg-[#2E2E2E] hover:bg-[#1A1A1A]">
              <a href="https://www.buymeacoffee.com/freetoolonline.com" target="_blank" rel="noopener noreferrer">
                <Coffee className="h-4 w-4 mr-1" />
                Buy Me A Coffee
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 dark:text-gray-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 mt-2">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {isHomePage ? (
              /* Home page mobile navigation */
              <>
                <Link
                  href="/tools"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tools
                </Link>
                <Link
                  href="#features"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Button className="w-full" asChild>
                  <Link href="/tools" onClick={() => setIsMobileMenuOpen(false)}>
                    Explore Tools
                  </Link>
                </Button>
              </>
            ) : pathname.startsWith("/admin") ? (
              /* Admin page mobile navigation */
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            ) : isToolPage ? (
              /* Tool page mobile navigation (standardized for all tools) */
              <>
                <Link
                  href={`#${getToolSectionId()}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {pathname.includes("/code-editor") ? "Editor" : 
                   pathname.includes("/todo-list") ? "Todo List" : 
                   pathname.includes("/color-picker") ? "Color Picker" : 
                   pathname.includes("/qr-code-generator") ? "QR Code" : 
                   pathname.includes("/unit-converter") ? "Converter" : 
                   pathname.includes("/font-generator") ? "Font Generator" : 
                   pathname.includes("/steganography-tool") ? "Steganography" : 
                   pathname.includes("/private-ai-chat") ? "Start Chat" : "Converter"}
                </Link>
                <Link
                  href="#features"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/tools"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Tools
                </Link>
              </>
            ) : isToolsPage ? (
              /* No navigation links for /tools page */
              <></>
            ) : (
              /* Default mobile navigation */
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            )}
            
            {/* Add Trustpilot Review Link to Mobile Menu */}
            <a 
              href="https://www.trustpilot.com/review/freetoolonline.com?utm_medium=trustbox&utm_source=TrustBoxReviewCollector"
              className="text-[#00b67a] hover:text-[#00b67a] font-medium transition-colors py-2 flex items-center border rounded-md border-[#00b67a] inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Star className="h-4 w-4 mr-2 fill-[#00b67a]" />
              Review Us on Trustpilot
            </a>
            
            {/* Mobile Donation Buttons */}
            <div className="flex flex-col space-y-2 mt-4">
              {/* Mobile PayPal Donate Button */}
              <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                <input type="hidden" name="cmd" value="_s-xclick" />
                <input type="hidden" name="hosted_button_id" value="W56TRR5BUFEGQ" />
                <input type="hidden" name="currency_code" value="USD" />
                <Button variant="outline" size="sm" className="text-[#0070ba] hover:text-[#003087] border-[#0070ba] hover:border-[#003087] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 w-full" type="submit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 154.728 190.5" className="w-4 h-4 mr-1">
                    <g transform="translate(898.192 276.071)">
                      <path clipPath="none" d="M-837.663-237.968a5.49 5.49 0 0 0-5.423 4.633l-9.013 57.15-8.281 52.514-.005.044.01-.044 8.281-52.514c.421-2.669 2.719-4.633 5.42-4.633h26.404c26.573 0 49.127-19.387 53.246-45.658.314-1.996.482-3.973.52-5.924v-.003h-.003c-6.753-3.543-14.683-5.565-23.372-5.565z" fill="#001c64"/>
                      <path clipPath="none" d="M-766.506-232.402c-.037 1.951-.207 3.93-.52 5.926-4.119 26.271-26.673 45.658-53.246 45.658h-26.404c-2.701 0-4.999 1.964-5.42 4.633l-8.281 52.514-5.197 32.947a4.46 4.46 0 0 0 4.405 5.153h28.66a5.49 5.49 0 0 0 5.423-4.633l7.55-47.881c.423-2.669 2.722-4.636 5.423-4.636h16.876c26.573 0 49.124-19.386 53.243-45.655 2.924-18.649-6.46-35.614-22.511-44.026z" fill="#0070e0"/>
                      <path clipPath="none" d="M-870.225-276.071a5.49 5.49 0 0 0-5.423 4.636l-22.489 142.608a4.46 4.46 0 0 0 4.405 5.156h33.351l8.281-52.514 9.013-57.15a5.49 5.49 0 0 1 5.423-4.633h47.782c8.691 0 16.621 2.025 23.375 5.563.46-23.917-19.275-43.666-46.412-43.666z" fill="#003087"/>
                    </g>
                  </svg>
                  Donate with PayPal
                </Button>
              </form>

              {/* Mobile Buy Me A Coffee Button */}
              <Button asChild variant="outline" size="sm" className="text-[#FFDD00] hover:text-[#FFDD00] border-[#FFDD00] hover:border-[#FFDD00] bg-[#2E2E2E] hover:bg-[#1A1A1A] w-full">
                <a href="https://www.buymeacoffee.com/freetoolonline.com" target="_blank" rel="noopener noreferrer">
                  <Coffee className="h-4 w-4 mr-1" />
                  Buy Me A Coffee
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
