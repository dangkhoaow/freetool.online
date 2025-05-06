"use client"

import { useRef, useEffect, useState } from 'react'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { cn } from '@/lib/utils'

// Define available themes
export const EDITOR_THEMES = {
  'vs': 'Light',
  'vs-dark': 'Dark',
  'hc-black': 'High Contrast Dark',
  'hc-light': 'High Contrast Light'
}

// Define available languages
export const SUPPORTED_LANGUAGES = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'html': 'HTML',
  'css': 'CSS',
  'json': 'JSON',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'cpp': 'C++',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'sql': 'SQL',
  'markdown': 'Markdown',
  'yaml': 'YAML',
  'xml': 'XML',
  'shell': 'Shell/Bash'
}

// VS Code default configurations
const DEFAULT_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  contextmenu: true,
  fontSize: 14,
  lineHeight: 21,
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  roundedSelection: true,
  padding: { top: 10, bottom: 10 },
  cursorBlinking: 'blink',
  cursorStyle: 'line',
  cursorWidth: 2,
  wordWrap: 'on',
  wrappingIndent: 'same',
  dragAndDrop: true,
  formatOnPaste: true,
  tabSize: 2,
  insertSpaces: true,
  matchBrackets: 'always',
  glyphMargin: true,
  folding: true,
  lineNumbersMinChars: 3,
  scrollbar: {
    verticalScrollbarSize: 12,
    horizontalScrollbarSize: 12,
    vertical: 'auto',
    horizontal: 'auto',
    verticalHasArrows: false,
    horizontalHasArrows: false,
    useShadows: true
  }
}

// Options for the editor
export interface MonacoEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  theme?: string
  readOnly?: boolean
  className?: string
  height?: string
  path?: string
  options?: editor.IStandaloneEditorConstructionOptions
  onMount?: OnMount
}

// Main editor component
export function MonacoCodeEditor({
  value,
  onChange,
  language = 'javascript',
  theme = 'vs-dark',
  readOnly = false,
  className,
  height = '70vh',
  path,
  options = {},
  onMount
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Combine default options with user options
  const editorOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    readOnly
  }

  // Log for debugging
  useEffect(() => {
    console.log('Monaco editor initialized with language:', language)
    console.log('Monaco editor initialized with theme:', theme)
  }, [language, theme])

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    setIsLoaded(true)
    
    // Call user onMount if provided
    if (onMount) {
      onMount(editor, monaco)
    }
    
    console.log('Monaco editor mounted successfully')
  }

  // Handle content change
  const handleChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value)
    }
  }

  return (
    <div className={cn("relative w-full border border-gray-200", className)}>
      <Editor
        value={value}
        language={language}
        theme={theme}
        path={path || `file:///workspace.${language}`}
        options={editorOptions}
        onMount={handleEditorDidMount}
        onChange={handleChange}
        height={height}
        loading={<div className="flex items-center justify-center h-full">Loading VS Code Editor...</div>}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <div>Loading VS Code Editor...</div>
          </div>
        </div>
      )}
    </div>
  )
}
