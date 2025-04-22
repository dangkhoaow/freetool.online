"use client"

import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, CheckCheck } from "lucide-react"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: number
  }
  copiedMessageId: string | null 
  isGenerating: boolean
  handleCopyMessage: (messageId: string, content: string) => void
  formatMessageContent: (content: string) => React.ReactNode
}

export function ChatMessage({ 
  message, 
  copiedMessageId, 
  isGenerating, 
  handleCopyMessage,
  formatMessageContent 
}: ChatMessageProps) {
  return (
    <div 
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div 
        className={`group relative max-w-[90%] rounded-lg p-3 ${
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.role === "assistant" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  onClick={() => handleCopyMessage(message.id, message.content)}
                >
                  {copiedMessageId === message.id ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {copiedMessageId === message.id ? "Copied!" : "Copy message"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {message.role === "assistant" ? (
          formatMessageContent(message.content)
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        
        {message.content === "" && isGenerating && message.role === "assistant" && (
          <div className="flex items-center">
            <span className="inline-block h-2 w-2 bg-gray-500 rounded-full mr-1 animate-bounce"></span>
            <span className="inline-block h-2 w-2 bg-gray-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
            <span className="inline-block h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          </div>
        )}
      </div>
    </div>
  )
} 