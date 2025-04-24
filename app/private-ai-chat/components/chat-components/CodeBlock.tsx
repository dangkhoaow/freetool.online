"use client"

import React, { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Import icons directly from Lucide instead of relying on the local icons
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
}

// Use forwardRef to make CodeBlock compatible with ReactMarkdown
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, showLineNumbers = true }, ref) => {
    const [isCopied, setIsCopied] = useState(false)
    // For hydration safety, we'll use client-side rendering for interactive elements
    const [isClient, setIsClient] = useState(false)

    // Only enable interactive features after client-side hydration
    useEffect(() => {
      setIsClient(true)
    }, [])

    // Set a reasonable language fallback
    const normalizedLanguage = language ? language.toLowerCase() : 'text'
    
    // Handle copy to clipboard
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy code:', error)
      }
    }

    // Render the code block with syntax highlighting but outside of any paragraph context
    // The React.Fragment wrapper ensures we don't introduce additional nesting that could cause hydration errors
    return (
      <React.Fragment>
        <div 
          className="relative rounded-md overflow-hidden my-4"
          ref={ref}
        >
          {/* Language badge - only show on client to prevent hydration mismatch */}
          {isClient && language && (
            <div className="absolute right-1 top-1 z-10 bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
              {normalizedLanguage}
            </div>
          )}
          
          {/* Copy button - only show on client to prevent hydration mismatch */}
          {isClient && (
            <button
              onClick={handleCopy}
              className="absolute right-1 bottom-1 z-10 bg-gray-700 hover:bg-gray-600 text-gray-200 p-1.5 rounded-md transition-colors"
              aria-label={isCopied ? "Copied!" : "Copy code"}
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
          
          {/* Code with syntax highlighting */}
          <SyntaxHighlighter
            language={normalizedLanguage}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            wrapLines
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.9rem',
              borderRadius: '0.375rem',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'var(--font-mono)', 
                lineHeight: 1.5,
              }
            }}
          >
            {code.trim()}
          </SyntaxHighlighter>
        </div>
      </React.Fragment>
    )
  }
)

CodeBlock.displayName = 'CodeBlock' 