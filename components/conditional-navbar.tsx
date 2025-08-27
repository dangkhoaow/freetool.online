"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show navbar on av-foundation pages
  if (pathname.startsWith('/av-foundation')) {
    return null
  }
  
  return <Navbar />
}
