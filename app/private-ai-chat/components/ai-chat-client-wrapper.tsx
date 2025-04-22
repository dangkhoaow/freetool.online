"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the AIChatTool component with SSR disabled
// This ensures it only runs on the client side where WebGPU is available
const AIChatTool = dynamic(() => import("./ai-chat-tool"), {
  ssr: false,
})

export default function AIChatClientWrapper() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto max-w-6xl py-12 px-4">
          Loading AI Chat...
        </div>
      }
    >
      <AIChatTool />
    </Suspense>
  )
} 