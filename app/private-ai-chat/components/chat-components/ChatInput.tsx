"use client"

import React, { useRef, useEffect } from "react"
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
  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set the height to scrollHeight (content height)
      // Max height will be limited by CSS
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    adjustTextareaHeight();
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Only submit if there's content and not already generating
      if (isModelLoaded && (isGenerating || userInput.trim())) {
        handleSubmit(e);
      }
    }
  };
  
  // Adjust height on initial render and when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [userInput]);
  
  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              !isModelLoaded
                ? "Load a model first..."
                : isGenerating
                ? "AI is generating a response..."
                : "Type your message..."
            }
            disabled={!isModelLoaded}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-grow shadow-sm focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400 resize-none min-h-[40px] max-h-[200px] overflow-y-auto"
            style={{ height: 'auto' }}
            rows={1}
          />
        </div>
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