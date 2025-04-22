"use client"

import React from "react"
import { CodeBlock } from "./CodeBlock"

/**
 * Formats message content with support for code blocks and thinking/reasoning tags.
 * 
 * This formatter supports:
 * 1. Code blocks using triple backticks: ```language\ncode```
 * 2. Thinking/reasoning sections using <think>text</think> tags
 *
 * The thinking tags are displayed in a highlighted box to visually separate them
 * from the regular content, making it easier to follow the AI's reasoning process.
 * 
 * @param content The message content to format
 * @returns Formatted React node with styled code blocks and thinking sections
 */
export function formatMessageContent(content: string): React.ReactNode {
  // Process thinking tags first
  const hasThinkingTags = content.includes('<think>') && content.includes('</think>')
  
  let processedContent = content
  if (hasThinkingTags) {
    // Replace thinking tags with styled divs, but preserve the pattern for later splitting
    processedContent = content.replace(/<think>([\s\S]*?)<\/think>/g, (match, thinking) => {
      // Create a unique marker to ensure proper splitting later
      return `<thinking>${thinking}</thinking>`
    })
  }
  
  // Check if the content contains code blocks with ```
  if (processedContent.includes('```')) {
    // Use a more precise regex to capture code blocks and thinking sections
    const parts = processedContent.split(/(```(?:.*?)\n[\s\S]*?```)|(<thinking>[\s\S]*?<\/thinking>)/g)
    
    return parts.filter(Boolean).map((part, i) => {
      if (part?.startsWith('```')) {
        // Extract language if specified (e.g., ```javascript)
        const language = part.match(/```(\w*)/)?.[1] || ''
        // Extract the code content (everything between the backticks)
        const code = part.replace(/```(?:\w*)\n([\s\S]*?)```/g, '$1')
        
        return <CodeBlock key={i} code={code} language={language} />
      } else if (part?.startsWith('<thinking>')) {
        // Extract the thinking content
        const thinking = part.replace(/<thinking>([\s\S]*?)<\/thinking>/g, '$1')
        
        return (
          <div key={i} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 my-2 rounded">
            <div className="text-xs font-medium text-yellow-800 mb-1">Thinking/Reasoning:</div>
            <p className="text-gray-700 whitespace-pre-wrap">{thinking}</p>
          </div>
        )
      } else {
        return <p key={i} className="whitespace-pre-wrap">{part}</p>
      }
    })
  }
  
  // If there are thinking tags but no code blocks
  if (hasThinkingTags) {
    // Use a direct approach to handle multiple thinking tags consistently
    const result: React.ReactNode[] = []
    const textParts: string[] = []
    
    // Process the content directly to ensure proper handling of multiple blocks
    let currentIndex = 0
    const thinkingMatches = Array.from(processedContent.matchAll(/<thinking>([\s\S]*?)<\/thinking>/g))
    
    thinkingMatches.forEach((match, idx) => {
      const startIndex = match.index! // TypeScript needs the non-null assertion
      const endIndex = startIndex + match[0].length
      
      // Add any text before this thinking block
      if (startIndex > currentIndex) {
        textParts.push(processedContent.substring(currentIndex, startIndex))
      }
      
      // Extract the thinking content
      const thinking = match[1]
      
      // Add the thinking block
      result.push(
        <p key={`text-${idx}`} className="whitespace-pre-wrap">
          {textParts.join('')}
        </p>
      )
      textParts.length = 0 // Clear text parts after adding
      
      // Add the thinking section
      result.push(
        <div key={`thinking-${idx}`} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 my-2 rounded">
          <div className="text-xs font-medium text-yellow-800 mb-1">Thinking/Reasoning:</div>
          <p className="text-gray-700 whitespace-pre-wrap">{thinking}</p>
        </div>
      )
      
      // Update current index
      currentIndex = endIndex
    })
    
    // Add any remaining text after the last thinking block
    if (currentIndex < processedContent.length) {
      result.push(
        <p key="text-final" className="whitespace-pre-wrap">
          {processedContent.substring(currentIndex)}
        </p>
      )
    }
    
    return result
  }
  
  // If no code blocks or thinking tags, just return the text
  return <p className="whitespace-pre-wrap">{content}</p>
} 