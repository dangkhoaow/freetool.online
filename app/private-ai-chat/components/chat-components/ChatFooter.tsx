"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Trash, Download } from "lucide-react"

interface ChatFooterProps {
  activeChat: {
    id: string
    messages: any[]
  } | null
  isGenerating: boolean
  handleClearChat: () => void
  handleExportChat: () => void
}

export function ChatFooter({ 
  activeChat, 
  isGenerating, 
  handleClearChat, 
  handleExportChat 
}: ChatFooterProps) {
  return (
    <div className="flex justify-between bg-white p-4 border-t mt-2 w-full">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClearChat}
        disabled={!activeChat || activeChat.messages.filter(m => m.role !== "system").length <= 0 || isGenerating}
        className="text-gray-700"
      >
        <Trash className="h-4 w-4 mr-2" />
        Clear Chat
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportChat}
        disabled={!activeChat || activeChat.messages.filter(m => m.role !== "system").length <= 0}
        className="text-gray-700"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Chat
      </Button>
    </div>
  )
} 