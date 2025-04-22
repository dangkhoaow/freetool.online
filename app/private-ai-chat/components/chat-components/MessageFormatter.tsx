"use client"

import React from "react"
import { CodeBlock } from "./CodeBlock"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Formats message content with support for code blocks, thinking/reasoning tags, and Markdown.
 * 
 * This formatter supports:
 * 1. Code blocks using triple backticks: ```language\ncode```
 * 2. Thinking/reasoning sections using <think>text</think> tags
 * 3. Markdown formatting including headers, lists, tables, links, etc.
 *
 * The thinking tags are displayed in a highlighted box to visually separate them
 * from the regular content, making it easier to follow the AI's reasoning process.
 * 
 * @param content The message content to format
 * @returns Formatted React node with styled code blocks, thinking sections, and markdown formatting
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
            <div className="text-gray-700">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // @ts-ignore - ReactMarkdown types are incompatible
                  p: ({children}: any) => <p className="whitespace-pre-wrap">{children}</p>
                }}
              >
                {thinking}
              </ReactMarkdown>
            </div>
          </div>
        )
      } else {
        // Render regular text with markdown
        return (
          <div key={i} className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore - ReactMarkdown types are incompatible
                code: ({inline, className, children}: any) => {
                  if (inline) {
                    return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                  }
                  return null; // Code blocks are already handled
                },
                // @ts-ignore - ReactMarkdown types are incompatible
                p: ({children}: any) => <p className="whitespace-pre-wrap mb-4">{children}</p>
              }}
            >
              {part}
            </ReactMarkdown>
          </div>
        )
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
        const textContent = processedContent.substring(currentIndex, startIndex)
        textParts.push(textContent)
      }
      
      // Extract the thinking content
      const thinking = match[1]
      
      // Add the text before this thinking block with markdown support
      if (textParts.length > 0) {
        result.push(
          <div key={`text-${idx}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore - ReactMarkdown types are incompatible
                p: ({children}: any) => <p className="whitespace-pre-wrap mb-4">{children}</p>
              }}
            >
              {textParts.join('')}
            </ReactMarkdown>
          </div>
        )
        textParts.length = 0 // Clear text parts after adding
      }
      
      // Add the thinking section with markdown support
      result.push(
        <div key={`thinking-${idx}`} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 my-2 rounded">
          <div className="text-xs font-medium text-yellow-800 mb-1">Thinking/Reasoning:</div>
          <div className="text-gray-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore - ReactMarkdown types are incompatible
                p: ({children}: any) => <p className="whitespace-pre-wrap">{children}</p>
              }}
            >
              {thinking}
            </ReactMarkdown>
          </div>
        </div>
      )
      
      // Update current index
      currentIndex = endIndex
    })
    
    // Add any remaining text after the last thinking block
    if (currentIndex < processedContent.length) {
      const remainingText = processedContent.substring(currentIndex)
      result.push(
        <div key="text-final">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // @ts-ignore - ReactMarkdown types are incompatible
              p: ({children}: any) => <p className="whitespace-pre-wrap mb-4">{children}</p>
            }}
          >
            {remainingText}
          </ReactMarkdown>
        </div>
      )
    }
    
    return result
  }
  
  // If no code blocks or thinking tags, use ReactMarkdown for standard markdown rendering
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // @ts-ignore - ReactMarkdown types are incompatible
          code: ({inline, className, children}: any) => {
            if (inline) {
              return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
            }
            // This shouldn't happen since code blocks were handled above, but just in case
            const match = /language-(\w+)/.exec(className || '')
            const lang = match ? match[1] : ''
            return <CodeBlock code={String(children).replace(/\n$/, '')} language={lang} />
          },
          // @ts-ignore - ReactMarkdown types are incompatible
          p: ({children}: any) => <p className="whitespace-pre-wrap mb-4">{children}</p>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 