"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Save, Trash2, RefreshCw, Undo, Redo, Download, Upload, Copy, AlertCircle } from "lucide-react"
import {
  type CodeSnippet,
  getSnippets,
  saveSnippet,
  deleteSnippet,
  getDefaultSnippet,
  executeCode,
  validateSyntax,
  generateId,
} from "@/lib/services/code-editor-service"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CodeEditor() {
  // State
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [snippetName, setSnippetName] = useState("")
  const [activeTab, setActiveTab] = useState("editor")

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Refs
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Load snippets on mount
  useEffect(() => {
    const loadedSnippets = getSnippets()
    setSnippets(loadedSnippets)

    // Load default snippet if no snippets exist
    if (loadedSnippets.length === 0) {
      const defaultSnippet = getDefaultSnippet()
      setCode(defaultSnippet.code)
      setCurrentSnippet(defaultSnippet)
      // Initialize history with default code
      setHistory([defaultSnippet.code])
      setHistoryIndex(0)
    } else {
      // Load the most recently updated snippet
      const mostRecent = [...loadedSnippets].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      setCode(mostRecent.code)
      setCurrentSnippet(mostRecent)
      // Initialize history with loaded code
      setHistory([mostRecent.code])
      setHistoryIndex(0)
    }
  }, [])

  // Add to history when code changes
  useEffect(() => {
    // Debounce to avoid adding every keystroke to history
    const timeoutId = setTimeout(() => {
      if (code && (history.length === 0 || code !== history[historyIndex])) {
        // Truncate history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1)
        setHistory([...newHistory, code])
        setHistoryIndex(newHistory.length)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [code, history, historyIndex])

  // Functions
  const runCode = () => {
    setIsRunning(true)
    setOutput("")

    // Validate syntax first
    const validation = validateSyntax(code)
    if (!validation.valid) {
      setOutput(`Syntax Error: ${validation.error}`)
      setHasError(true)
      setIsRunning(false)
      return
    }

    // Execute the code
    setTimeout(() => {
      const result = executeCode(code)
      setOutput(result.result)
      setHasError(result.error)
      setIsRunning(false)

      // Scroll to bottom of output
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
    }, 100)
  }

  const handleSaveClick = () => {
    setSnippetName(currentSnippet?.name || "Untitled Snippet")
    setSaveDialogOpen(true)
  }

  const saveCurrentSnippet = () => {
    if (!snippetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your snippet",
        variant: "destructive",
      })
      return
    }

    const snippetToSave: CodeSnippet = {
      id: currentSnippet?.id || generateId(),
      name: snippetName,
      code,
      language: "javascript",
      createdAt: currentSnippet?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    saveSnippet(snippetToSave)
    setCurrentSnippet(snippetToSave)

    // Update snippets list
    setSnippets(getSnippets())
    setSaveDialogOpen(false)

    toast({
      title: "Success",
      description: "Your code snippet has been saved",
    })
  }

  const createNewSnippet = () => {
    const defaultSnippet = getDefaultSnippet()
    setCode(defaultSnippet.code)
    setCurrentSnippet({
      ...defaultSnippet,
      id: generateId(),
    })
    setOutput("")
    setHasError(false)

    // Reset history
    setHistory([defaultSnippet.code])
    setHistoryIndex(0)

    toast({
      title: "New Snippet Created",
      description: "Started a new code snippet",
    })
  }

  const loadSnippet = (snippet: CodeSnippet) => {
    setCode(snippet.code)
    setCurrentSnippet(snippet)
    setOutput("")
    setHasError(false)

    // Reset history with loaded code
    setHistory([snippet.code])
    setHistoryIndex(0)

    // Switch to editor tab
    setActiveTab("editor")
  }

  const handleDeleteSnippet = (id: string) => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      deleteSnippet(id)

      // Update snippets list
      const updatedSnippets = getSnippets()
      setSnippets(updatedSnippets)

      // If we deleted the current snippet, load another one
      if (currentSnippet?.id === id) {
        if (updatedSnippets.length > 0) {
          loadSnippet(updatedSnippets[0])
        } else {
          createNewSnippet()
        }
      }

      toast({
        title: "Snippet Deleted",
        description: "The code snippet has been deleted",
      })
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCode(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCode(history[historyIndex + 1])
    }
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output)
    toast({
      title: "Copied",
      description: "Output copied to clipboard",
    })
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/javascript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentSnippet?.name || "code-snippet"}.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCode(content)

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1)
      setHistory([...newHistory, content])
      setHistoryIndex(newHistory.length)

      // Update current snippet
      setCurrentSnippet({
        ...currentSnippet!,
        name: file.name.replace(/\.[^/.]+$/, ""),
        code: content,
        updatedAt: Date.now(),
      })
    }
    reader.readAsText(file)

    // Reset file input
    event.target.value = ""
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Editor Header */}
      <div className="bg-gray-800 text-white p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold mr-4">{currentSnippet?.name || "Untitled Snippet"}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={createNewSnippet}
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            New
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveClick}
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>

          <label className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
            <input id="file-upload" type="file" accept=".js,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-gray-100 rounded-none border-b">
          <TabsTrigger value="editor" className="data-[state=active]:bg-white">
            Editor
          </TabsTrigger>
          <TabsTrigger value="snippets" className="data-[state=active]:bg-white">
            Saved Snippets ({snippets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="p-0 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t">
            {/* Code Editor */}
            <div className="border-r">
              <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
                <h3 className="font-medium">JavaScript</h3>
                <Button onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </div>

              <div className="relative">
                <textarea
                  ref={codeEditorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[500px] p-4 font-mono text-sm resize-none focus:outline-none"
                  spellCheck="false"
                  placeholder="// Write your JavaScript code here"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">{code.split("\n").length} lines</div>
              </div>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between bg-gray-100 px-4 py-2">
                <h3 className="font-medium flex items-center">
                  Output
                  {hasError && (
                    <span className="ml-2 text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Error
                    </span>
                  )}
                </h3>
                <Button variant="outline" size="sm" onClick={handleCopyOutput} disabled={!output}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>

              <div
                ref={outputRef}
                className={`w-full h-[500px] p-4 font-mono text-sm overflow-auto whitespace-pre-wrap ${hasError ? "text-red-600" : ""}`}
              >
                {isRunning ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : output ? (
                  output
                ) : (
                  <div className="text-gray-400 h-full flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-8 w-8 mx-auto mb-2" />
                      <p>Click "Run" to execute your code and see the output here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="snippets" className="p-0 m-0">
          <div className="p-4">
            {snippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snippets.map((snippet) => (
                  <div key={snippet.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                      <h3 className="font-medium truncate" title={snippet.name}>
                        {snippet.name}
                      </h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => loadSnippet(snippet)} className="h-8 w-8 p-0">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSnippet(snippet.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 h-32 overflow-hidden">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-hidden">
                        {snippet.code.substring(0, 200)}
                        {snippet.code.length > 200 && "..."}
                      </pre>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500">
                      Last updated: {new Date(snippet.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                  <Save className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No saved snippets</h3>
                <p className="text-gray-500 mb-4">Save your code snippets to access them later</p>
                <Button onClick={createNewSnippet}>Create New Snippet</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Code Snippet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="snippet-name">Snippet Name</Label>
            <Input
              id="snippet-name"
              value={snippetName}
              onChange={(e) => setSnippetName(e.target.value)}
              placeholder="Enter a name for your snippet"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCurrentSnippet}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
