"use client"

import { WebLLMProvider } from "@/lib/services/webllm/webllm-provider"

export default function AIDataVisualizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WebLLMProvider>{children}</WebLLMProvider>
  )
}
