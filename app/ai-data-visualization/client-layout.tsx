"use client"

import { WebLLMProvider } from "@/lib/services/webllm/webllm-provider"

export default function AIDataVisualizationClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WebLLMProvider>{children}</WebLLMProvider>
  )
}
