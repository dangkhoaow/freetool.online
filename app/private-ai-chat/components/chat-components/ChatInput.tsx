"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, BrainCircuit, StopCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatInputProps {
  userInput: string
  setUserInput: (input: string) => void
  isModelLoaded: boolean
  isGenerating: boolean
  handleSendMessage: (e: React.FormEvent) => Promise<void>
  handleStopGeneration?: () => void // Optional stop generation function
}

export function ChatInput({ 
  userInput, 
  setUserInput, 
  isModelLoaded, 
  isGenerating, 
  handleSendMessage,
  handleStopGeneration
}: ChatInputProps) {
  
  // Handle form submission: either send message or stop generation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If generating and we have a stop function, call it
    if (isGenerating && handleStopGeneration) {
      handleStopGeneration();
      return;
    }
    
    // Otherwise send message as normal
    handleSendMessage(e);
  };
  
  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={
            !isModelLoaded
              ? "Load a model first..."
              : isGenerating
              ? "AI is generating a response..."
              : "Type your message..."
          }
          disabled={!isModelLoaded}
          className="flex-grow shadow-sm focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
        />
        <Button 
          type="submit" 
          disabled={!isModelLoaded || (!isGenerating && !userInput.trim())} 
          className={isGenerating ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
        >
          {isGenerating ? (
            <>
              <StopCircle className="h-4 w-4 mr-1" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              <span>Send</span>
            </>
          )}
        </Button>
      </form>
      
      {isModelLoaded && !isGenerating && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 cursor-help">
                <BrainCircuit className="h-3 w-3" />
                <span>This chat supports showing AI thinking/reasoning process for complex questions.</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs dark:bg-gray-800 dark:text-gray-200">
              <p>When you ask complex questions, the AI can show its reasoning process in highlighted sections. 
              Try questions about math problems, logic puzzles, or anything that requires step-by-step thinking!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
} 