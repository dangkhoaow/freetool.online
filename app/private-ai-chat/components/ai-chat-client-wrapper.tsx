"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the AIChatTool to run only on the client side
// where WebGPU is available
const AIChatTool = dynamic(
  () => import("./ai-chat-tool-refactored"),
  { ssr: false }
)

export default function AIChatClientWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading AI Chat Tool...</div>}>
      <AIChatTool />
    </Suspense>
  )
} 