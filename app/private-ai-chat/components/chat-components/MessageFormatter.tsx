"use client"

import React, { useContext, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import { cn } from '@/lib/utils';
import { CodeBlock } from './CodeBlock';
import { CustomCode } from './CustomCode';
import type { Components } from 'react-markdown';

// Register languages
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);

interface FormatterProps {
  content: string;
}

// Define type for markdown component props
type MarkdownComponentProps = {
  node?: any;
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
  href?: string;
};

// Specialized types for each HTML element
type HeadingProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MarkdownComponentProps;
type ParagraphProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & MarkdownComponentProps;
type ListProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> & MarkdownComponentProps;
type BlockQuoteProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement> & MarkdownComponentProps;
type TableProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableElement>, HTMLTableElement> & MarkdownComponentProps;
type TableCellProps = React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement> & MarkdownComponentProps;
type LinkProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & MarkdownComponentProps;
type CodeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & MarkdownComponentProps;
type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & MarkdownComponentProps;

// List of HTML block elements that cannot be nested inside paragraphs
const BLOCK_ELEMENTS = [
  'address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 
  'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 
  'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'table', 'tfoot', 
  'ul', 'video'
];

// Check if children contains any block elements
const hasBlockElement = (children: React.ReactNode): boolean => {
  const childrenArray = React.Children.toArray(children);
  
  for (const child of childrenArray) {
    // Check if it's a React element
    if (!React.isValidElement(child)) continue;
    
    // Check if it's a custom component that might render block elements
    if (child.type === CodeBlock) return true;
    
    // Check if it's a standard HTML block element
    if (typeof child.type === 'string' && BLOCK_ELEMENTS.includes(child.type)) {
      return true;
    }
    
    // Recursively check children of this element
    if (child.props && typeof child.props === 'object' && 'children' in child.props) {
      const childrenProp = child.props.children as React.ReactNode;
      if (hasBlockElement(childrenProp)) {
        return true;
      }
    }
  }
  
  return false;
};

// Custom component to prevent paragraph wrapping around block elements
const CustomParagraph: React.FC<React.ComponentPropsWithRef<'p'> & { node?: any }> = ({ children, node, ...props }) => {
  // First check if node directly contains a code block
  if (node?.children?.some((child: any) => 
    child.tagName === 'code' && 
    child.properties?.className?.some((cls: string) => cls.startsWith('language-'))
  )) {
    return <>{children}</>;
  }

  // Next check if children contains any block elements
  const containsBlockElement = React.Children.toArray(children).some(
    (child) => {
      if (React.isValidElement(child)) {
        const type = child.type as any;
        
        // Check if it's the CustomCode component (not inline)
        if (type === CustomCode && (child.props as any).inline === false) {
          return true;
        }
        
        // Check if it's CodeBlock
        if (type === CodeBlock || type?.displayName === 'CodeBlock') {
          return true;
        }
        
        // Check if it's a standard HTML block element
        return ['div', 'pre', 'table', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
          typeof type === 'string' ? type : type?.displayName || ''
        );
      }
      return false;
    }
  );

  // If contains block elements, render without the paragraph wrapper
  if (containsBlockElement) {
    return <>{children}</>;
  }

  // Otherwise, render as a normal paragraph
  return <p {...props}>{children}</p>;
};

// Define shared markdown components configuration
const markdownComponents: Record<string, React.ComponentType<any> | React.FC<any>> = {
  // Use the external CustomCode component for code blocks
  code: ({ node, inline, className, children, ...props }: any) => {
    const isCodeBlock = !inline && className && /language-(\w+)/.test(className);
    
    // For code blocks, render them directly without any additional wrapper
    if (isCodeBlock) {
      return (
        <CustomCode inline={inline} className={className} {...props}>
          {children || ''}
        </CustomCode>
      );
    }
    
    // For inline code, let CustomCode handle it
    return (
      <CustomCode inline={inline} className={className} {...props}>
        {children || ''}
      </CustomCode>
    );
  },
  
  // Use custom paragraph handler
  p: CustomParagraph,
  
  // Style headers
  h1: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <h4 className="text-base font-bold mt-3 mb-2" {...props}>{children}</h4>
  ),
  
  // Style lists
  ul: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <ul className="list-disc pl-6 mb-4 space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1" {...props}>{children}</ol>
  ),
  
  // Style blockquotes
  blockquote: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1 my-4 italic" {...props}>{children}</blockquote>
  ),
  
  // Handle tables
  table: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <th className="px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <td className="px-3 py-2 border-t border-gray-200 dark:border-gray-700" {...props}>{children}</td>
  ),
  
  // Handle links
  a: ({ children, href, ...props }: { children: React.ReactNode; href?: string; [key: string]: any }) => (
    <a 
      href={href} 
      className="text-blue-600 dark:text-blue-400 hover:underline" 
      target="_blank" 
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  
  // Handle pre elements - use div wrapper to avoid nesting issues
  pre: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
    return <div className="not-prose" {...props}>{children}</div>;
  }
}

/**
 * Formats message content with support for code blocks, thinking/reasoning tags, and Markdown.
 * 
 * This formatter handles:
 * 1. Code blocks using triple backticks: ```language\ncode```
 * 2. Thinking/reasoning sections using <thinking>text</thinking> tags
 * 3. Markdown formatting including headers, lists, tables, links, etc.
 *
 * @param content The message content to format
 * @returns Formatted React node with styled code blocks, thinking sections, and markdown formatting
 */
export function formatMessageContent(content: string): React.ReactNode {
  if (!content) return null;

  // Process content with thinking tags and code blocks
  const hasThinkingTags = content.includes("<thinking>") && content.includes("</thinking>");
  
  // Handle content with thinking tags
  if (hasThinkingTags) {
    // Safer regex that handles multiple thinking tags
    const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/g;
    const parts: Array<{type: 'thinking' | 'normal', content: string}> = [];
    
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    // Find all thinking tags and split content
    while ((match = thinkingRegex.exec(content)) !== null) {
      const startIndex = match.index;
      
      // Add normal text before thinking block
      if (startIndex > lastIndex) {
        parts.push({
          type: 'normal',
          content: content.substring(lastIndex, startIndex)
        });
      }
      
      // Add thinking block
      parts.push({
        type: 'thinking',
        content: match[1]  // The content inside thinking tags
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining normal text after last thinking tag
    if (lastIndex < content.length) {
      parts.push({
        type: 'normal',
        content: content.substring(lastIndex)
      });
    }
    
    // Render each part appropriately
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'thinking') {
            return (
              <div key={`thinking-${index}`} className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-3 my-4 rounded">
                <div className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">Thinking/Reasoning:</div>
                <div className="text-gray-700 dark:text-gray-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {part.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          } else {
            return (
              <ReactMarkdown
                key={`normal-${index}`}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {part.content}
              </ReactMarkdown>
            );
          }
        })}
      </>
    );
  }
  
  // Standard markdown rendering for content without thinking tags
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
} 