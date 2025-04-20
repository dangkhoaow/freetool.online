"use client"

import dynamic from 'next/dynamic'

// Dynamically import the browser converter to avoid server-side rendering issues
const BrowserConverterTool = dynamic(
  () => import('./browser-converter-tool'),
  { ssr: false }
)

export default function ConverterWrapper() {
  return <BrowserConverterTool />
} 