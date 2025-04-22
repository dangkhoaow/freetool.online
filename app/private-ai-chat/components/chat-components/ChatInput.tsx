"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, BrainCircuit } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatInputProps {
  userInput: string
  setUserInput: (input: string) => void
  isModelLoaded: boolean
  isGenerating: boolean
  handleSendMessage: (e: React.FormEvent) => Promise<void>
}

export function ChatInput({ 
  userInput, 
  setUserInput, 
  isModelLoaded, 
  isGenerating, 
  handleSendMessage 
}: ChatInputProps) {
  return (
    <div className="space-y-2">
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={
            !isModelLoaded
              ? "Load a model first..."
              : isGenerating
              ? "Wait for response..."
              : "Type your message..."
          }
          disabled={!isModelLoaded || isGenerating}
          className="flex-grow shadow-sm focus-visible:ring-blue-500"
        />
        <Button type="submit" disabled={!isModelLoaded || isGenerating || !userInput.trim()} className="bg-blue-600 hover:bg-blue-700">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {isModelLoaded && !isGenerating && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-gray-500 cursor-help">
                <BrainCircuit className="h-3 w-3" />
                <span>This chat supports showing AI thinking/reasoning process for complex questions.</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>When you ask complex questions, the AI can show its reasoning process in highlighted sections. 
              Try questions about math problems, logic puzzles, or anything that requires step-by-step thinking!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
} 