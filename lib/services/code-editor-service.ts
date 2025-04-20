// Types
export interface CodeSnippet {
  id: string
  name: string
  code: string
  language: string
  createdAt: number
  updatedAt: number
}

// Constants
const SNIPPETS_STORAGE_KEY = "code-editor-snippets"
const DEFAULT_SNIPPET: CodeSnippet = {
  id: "default",
  name: "Untitled Snippet",
  code: '// Write your JavaScript code here\n\nconsole.log("Hello, world!");\n\n// You can use multiple console.log statements\nconsole.log("Welcome to the code editor!");\n\n// Try using variables\nconst name = "Coder";\nconsole.log(`Hello, ${name}!`);\n\n// Or even functions\nfunction greet(person) {\n  return `Good day, ${person}!`;\n}\n\nconsole.log(greet("Developer"));',
  language: "javascript",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Service functions
export function getSnippets(): CodeSnippet[] {
  if (typeof window === "undefined") return []

  const storedSnippets = localStorage.getItem(SNIPPETS_STORAGE_KEY)
  if (!storedSnippets) return []

  try {
    return JSON.parse(storedSnippets)
  } catch (error) {
    console.error("Failed to parse snippets from localStorage", error)
    return []
  }
}

export function saveSnippet(snippet: CodeSnippet): void {
  if (typeof window === "undefined") return

  const snippets = getSnippets()
  const existingIndex = snippets.findIndex((s) => s.id === snippet.id)

  if (existingIndex >= 0) {
    snippets[existingIndex] = {
      ...snippet,
      updatedAt: Date.now(),
    }
  } else {
    snippets.push({
      ...snippet,
      id: snippet.id || generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets))
}

export function deleteSnippet(id: string): void {
  if (typeof window === "undefined") return

  const snippets = getSnippets().filter((s) => s.id !== id)
  localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets))
}

export function getDefaultSnippet(): CodeSnippet {
  return { ...DEFAULT_SNIPPET }
}

export function executeCode(code: string): { result: string; error: boolean } {
  try {
    // Create a safe execution environment
    const originalConsoleLog = console.log
    const logs: string[] = []

    // Override console.log to capture output
    console.log = (...args) => {
      logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "))
    }

    // Execute the code in a try-catch block
    try {
      // Create a function from the code to avoid global scope pollution
      const executionFunction = new Function(code)
      executionFunction()
    } finally {
      // Restore the original console.log
      console.log = originalConsoleLog
    }

    return {
      result: logs.join("\n"),
      error: false,
    }
  } catch (error) {
    return {
      result: `Error: ${error.message}`,
      error: true,
    }
  }
}

export function validateSyntax(code: string): { valid: boolean; error?: string } {
  try {
    // Try to parse the code without executing it
    new Function(code)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    }
  }
}
