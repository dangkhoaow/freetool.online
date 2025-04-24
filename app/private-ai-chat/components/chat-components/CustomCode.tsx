"use client"

import React from "react"
import { CodeBlock } from "./CodeBlock"

// Define the props that ReactMarkdown will pass to our code component
export interface CustomCodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  node?: any;
}

/**
 * CustomCode component that properly renders both inline code and code blocks
 * Ensures code blocks are rendered outside of paragraph context to avoid hydration errors
 */
export const CustomCode = ({ inline, className, children, ...props }: CustomCodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');
  
  // For inline code, render normally with a code tag
  if (inline) {
    return (
      <code 
        className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }
  
  // For block code, wrap in a Fragment to break out of any paragraph context
  // This is crucial to prevent the <pre> from being nested in a <p>
  return (
    <React.Fragment>
      <CodeBlock 
        code={code} 
        language={language}
        showLineNumbers={true}
      />
    </React.Fragment>
  );
};

export default CustomCode; 