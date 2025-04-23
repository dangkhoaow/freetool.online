"use client"

import React from "react"
import { ChatMessage } from "./ChatMessage"

interface ChatContainerProps {
  messages: Array<{
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: number
  }>
  isModelLoaded: boolean
  isGenerating: boolean
  copiedMessageId: string | null
  handleCopyMessage: (messageId: string, content: string) => void
  formatMessageContent: (content: string) => React.ReactNode
  chatContainerRef: React.RefObject<HTMLDivElement | null>
}

export function ChatContainer({
  messages,
  isModelLoaded,
  isGenerating,
  copiedMessageId,
  handleCopyMessage,
  formatMessageContent,
  chatContainerRef
}: ChatContainerProps) {
  const filteredMessages = messages.filter(m => m.role !== "system")
  
  return (
    <div 
      ref={chatContainerRef}
      className="border rounded-lg overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900 dark:border-gray-700 flex-1 min-h-0"
    >
      {filteredMessages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 p-4 h-full flex items-center justify-center">
          <div>
            {isModelLoaded ? (
              "Send a message to start chatting with the AI."
            ) : (
              "Select and load a model to start chatting with the AI."
            )}
          </div>
        </div>
      ) : (
        filteredMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            copiedMessageId={copiedMessageId}
            isGenerating={isGenerating}
            handleCopyMessage={handleCopyMessage}
            formatMessageContent={formatMessageContent}
          />
        ))
      )}
    </div>
  )
} 