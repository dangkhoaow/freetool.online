"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Trash, Bug } from "lucide-react"
import Link from "next/link"

interface ChatFooterProps {
  showScrollButton: boolean
  handleScrollToBottom: () => void
  handleClearChat: () => void
  handleExportChat: () => void
}

export function ChatFooter({
  showScrollButton,
  handleScrollToBottom,
  handleClearChat,
  handleExportChat
}: ChatFooterProps) {
  return (
    <div className="flex justify-between bg-white dark:bg-gray-900 p-4 border-t dark:border-gray-700 mt-2 w-full">
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/private-ai-chat/debug">
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Link>
        </Button>
      </div>
      <div className="flex space-x-2">
        {showScrollButton && (
          <Button style={{ visibility: "hidden" }} variant="outline" size="icon" onClick={handleScrollToBottom}>
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleExportChat}>
          Export Chat
        </Button>
      </div>
    </div>
  )
} 