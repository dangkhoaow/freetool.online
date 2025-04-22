"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Trash, Download } from "lucide-react"

// Import our WebLLM service instead of using the package directly
import { 
  isWebGPUSupported, 
  getAvailableModels, 
  getWebLLMService, 
  getRecommendedModels,
  WebLLMModel
} from "@/lib/services/webllm/webllm-service"
import { MessageRole } from "@/lib/services/webllm/types"

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

export default function AIChatTool() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-1",
      role: "system",
      content: "You are a helpful AI assistant helping users.",
      timestamp: Date.now(),
    },
  ])
  const [userInput, setUserInput] = useState("")
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState("")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState("")
  const [stats, setStats] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [models, setModels] = useState<WebLLMModel[]>([])
  const [webLLMSupported, setWebLLMSupported] = useState(false)
  const webLLMServiceRef = useRef<any>(null)

  // Initialize WebLLM and check WebGPU support
  useEffect(() => {
    const checkWebGPU = async () => {
      // Check if WebGPU is supported
      const gpuSupported = isWebGPUSupported()
      setWebLLMSupported(gpuSupported)
      
      if (gpuSupported) {
        try {
          // Get available models
          const availableModels = await getAvailableModels()
          setModels(availableModels)
          
          // Set a default model if available
          if (availableModels.length > 0) {
            // Pick the first recommended model or the first available model
            const recommended = getRecommendedModels()
            const defaultModel = recommended.length > 0 ? recommended[0].id : availableModels[0].id
            setSelectedModel(defaultModel)
          }
        } catch (error) {
          console.error("Error loading models:", error)
          setLoadingStatus("Error loading model list. Please try again.")
        }
      } else {
        setLoadingStatus("WebGPU is not supported in your browser. Please use Chrome 113+ or Edge 113+.")
      }
    }
    
    checkWebGPU()
  }, [])

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Initialize the WebLLM engine with the selected model
  const handleModelLoad = async () => {
    if (!selectedModel) return
    
    setIsLoading(true)
    try {
      setLoadingStatus("Loading model...")
      setLoadingProgress(0)
      
      const config = {
        temperature: 0.7,
        topP: 0.9,
        maxGenerateTokens: 2048
      }
      
      // Use our service to create and initialize WebLLM
      webLLMServiceRef.current = await getWebLLMService(
        selectedModel, 
        config,
        (progress, status, isFromCache) => {
          setLoadingProgress(progress)
          if (status) {
            setLoadingStatus(status)
          }
        }
      )
      
      // Initialize the model
      await webLLMServiceRef.current.initialize()
      
      // Update stats
      setStats(await webLLMServiceRef.current.getRuntimeStats())
      setIsModelLoaded(true)
    } catch (error) {
      console.error("Failed to load model:", error)
      setLoadingStatus(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Send a message and get a response
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim() === "" || !isModelLoaded || isGenerating) return
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    }
    
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setUserInput("")
    setIsGenerating(true)
    
    // Create the AI message placeholder
    const aiMessageId = `assistant-${Date.now()}`
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    }
    
    setMessages((prevMessages) => [...prevMessages, aiMessage])
    
    // Prepare messages for the API
    const apiMessages = messages
      .concat(userMessage)
      .map(msg => ({ role: msg.role, content: msg.content }))
    
    try {
      // Use the service to generate the response
      await webLLMServiceRef.current.generate(
        apiMessages,
        { 
          stream: true 
        },
        {
          onTokenCallback: (token: string, fullText: string) => {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: fullText }
                  : msg
              )
            )
          },
          onFinishCallback: async (response: any) => {
            setIsGenerating(false)
            setStats(await webLLMServiceRef.current.getRuntimeStats())
          },
          onErrorCallback: (error: Error) => {
            console.error("Generation error:", error)
            setIsGenerating(false)
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: "Error generating response. Please try again." }
                  : msg
              )
            )
          }
        }
      )
    } catch (error) {
      console.error("Error during generation:", error)
      setIsGenerating(false)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: "Error generating response. Please try again." }
            : msg
        )
      )
    }
  }

  // Clear the chat history
  const handleClearChat = () => {
    setMessages([
      {
        id: "system-1",
        role: "system",
        content: "You are a helpful AI assistant helping users.",
        timestamp: Date.now(),
      },
    ])
  }

  // Download chat history as JSON
  const handleExportChat = () => {
    const exportData = messages.filter(m => m.role !== "system")
    const jsonStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // UI rendering
  return (
    <div className="container mx-auto max-w-6xl py-6 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardTitle className="text-xl md:text-2xl text-center">Private AI Chat</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {!webLLMSupported ? (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold text-red-600 mb-4">WebGPU Not Supported</h3>
              <p className="mb-2">Your browser doesn't support WebGPU, which is required for browser-based AI models.</p>
              <p>Please use Chrome 113+ or Edge 113+ to access this feature.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model-selection">Select Model</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    disabled={isModelLoaded || isLoading}
                  >
                    <SelectTrigger id="model-selection" className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col py-1">
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              <div>{model.description}</div>
                              <div className="flex gap-2 mt-0.5">
                                <span className="font-medium">Size:</span> {model.size}
                                <span className="font-medium ml-2">Context:</span> {model.contextLength} tokens
                                {model.lowResourceRequired && (
                                  <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">Low Resource</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleModelLoad} 
                    disabled={isModelLoaded || isLoading || !selectedModel}
                    className="whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : isModelLoaded ? (
                      "Model Loaded"
                    ) : (
                      "Load Model"
                    )}
                  </Button>
                </div>
                {isLoading && (
                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-gray-600">{loadingStatus}</div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="border rounded-md h-96 overflow-y-auto p-4 space-y-4 bg-gray-50"
              >
                {messages.filter(m => m.role !== "system").map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {message.content || (isGenerating && message.role === "assistant" ? (
                        <span className="animate-pulse">Thinking...</span>
                      ) : "")}
                    </div>
                  </div>
                ))}
                {messages.length <= 1 && (
                  <div className="text-center text-gray-500 p-4">
                    Load a model and start a conversation to chat with the AI.
                  </div>
                )}
              </div>
              
              {/* Stats Display */}
              {stats && (
                <div className="text-xs font-mono text-gray-500 p-2 bg-gray-100 rounded overflow-x-auto">
                  {stats}
                </div>
              )}
              
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    !isModelLoaded
                      ? "Load a model first..."
                      : isGenerating
                      ? "Wait for response..."
                      : "Type your message..."
                  }
                  disabled={!isModelLoaded || isGenerating}
                  className="flex-grow"
                />
                <Button type="submit" disabled={!isModelLoaded || isGenerating || !userInput.trim()}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between bg-gray-50 px-6 py-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearChat}
            disabled={messages.length <= 1 || isGenerating}
          >
            <Trash className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportChat}
            disabled={messages.length <= 1}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Chat
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 