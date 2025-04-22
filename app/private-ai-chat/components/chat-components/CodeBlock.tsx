"use client"

import React from "react"
import { Copy } from "lucide-react"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="relative bg-gray-900 text-gray-100 p-4 rounded my-2 font-mono text-sm overflow-x-auto">
      {language && (
        <div className="absolute top-0 right-0 bg-gray-700 text-xs px-2 py-1 rounded-bl">
          {language}
        </div>
      )}
      <pre>{code}</pre>
      <button 
        className="absolute top-2 right-2 p-1 bg-gray-700 text-white rounded hover:bg-gray-600"
        onClick={() => navigator.clipboard.writeText(code)}
      >
        <Copy size={14} />
      </button>
    </div>
  )
} 