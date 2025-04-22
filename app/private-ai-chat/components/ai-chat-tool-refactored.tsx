"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isWebGPUSupported, getAvailableModels, getWebLLMService, getRecommendedModels, WebLLMModel, isEmbeddingModel } from "@/lib/services/webllm/webllm-service"
import { ChatSidebar } from "./chat-components/ChatSidebar"
import { ModelSelector } from "./chat-components/ModelSelector"
import { ChatContainer } from "./chat-components/ChatContainer"
import { ChatInput } from "./chat-components/ChatInput"
import { ChatFooter } from "./chat-components/ChatFooter"
import { formatMessageContent } from "./chat-components/MessageFormatter"
import { TokenLimitDialog } from "./chat-components/TokenLimitDialog"
import { AlertCircle, Info } from "lucide-react"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Loader2, Database, Check, ChevronsUpDown } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

interface ChatSession {
  id: string
  title: string
  modelId: string
  messages: ChatMessage[]
  lastUpdated: number
  createdAt: number
  isModelLoaded: boolean
  isLoading: boolean
  loadingStatus?: string
  loadingProgress?: number
}

// Add TokenManager component to display token count and warnings
const TokenManager = ({ 
  tokenCount, 
  maxTokens, 
  handleTrimConversation 
}: { 
  tokenCount: number, 
  maxTokens: number,
  handleTrimConversation: () => void
}) => {
  // Calculate percentage of tokens used
  const percentUsed = Math.min((tokenCount / maxTokens) * 100, 100);
  let colorClass = "bg-green-500";
  
  // Change color based on token usage
  if (percentUsed > 85) {
    colorClass = "bg-red-500";
  } else if (percentUsed > 70) {
    colorClass = "bg-yellow-500";
  }

  return (
    <div className="flex items-center gap-2 text-xs mb-2">
      <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-300`} 
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      <div className="whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                {percentUsed > 85 ? <AlertCircle className="h-3 w-3 text-red-500" /> : <Info className="h-3 w-3 text-gray-500" />}
                <span className={percentUsed > 85 ? "text-red-500 font-medium" : "text-gray-500"}>
                  {tokenCount}/{maxTokens} tokens
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This shows the estimated token count for your conversation.</p>
              <p className="mt-1">The AI has a limited context window and can't process conversations that exceed this limit.</p>
              {percentUsed > 85 && (
                <div className="mt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-xs text-red-500 underline">
                        Trim older messages
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Trim conversation history?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove some older messages to make room for new ones. 
                          The system message and recent conversation will be preserved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleTrimConversation}>
                          Trim Conversation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

// Update the stats display component to hide NaN values
const StatsDisplay = ({ stats }: { stats: string }) => {
  // Check if stats contains NaN
  if (!stats || stats.includes('NaN')) {
    return null;
  }
  
  return (
    <div className="text-xs font-mono text-gray-500 p-2 bg-gray-50 rounded overflow-x-auto flex-shrink-0">
      {stats}
    </div>
  );
};

export default function AIChatTool() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [userInput, setUserInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [stats, setStats] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [models, setModels] = useState<WebLLMModel[]>([])
  const [webLLMSupported, setWebLLMSupported] = useState(false)
  const webLLMServiceRef = useRef<any>(null)
  const [open, setOpen] = useState(false)
  const [cachedModels, setCachedModels] = useState<string[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [tokenCount, setTokenCount] = useState(0)
  const [maxContextTokens, setMaxContextTokens] = useState(4096) // Default max tokens
  const [isTokenLimitDialogOpen, setIsTokenLimitDialogOpen] = useState(false)

  // Get active chat
  const activeChat = chatSessions.find(chat => chat.id === activeChatId) || null
  const messages = activeChat?.messages || []
  
  // Getting model loading state from the active chat
  const isModelLoaded = activeChat?.isModelLoaded || false
  const isLoading = activeChat?.isLoading || false
  const loadingStatus = activeChat?.loadingStatus || ""
  const loadingProgress = activeChat?.loadingProgress || 0

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
          
          // Load saved chat sessions
          loadChatSessions()
          
          // Get previously selected model from localStorage if available
          if (typeof window !== 'undefined') {
            const lastSelectedModel = localStorage.getItem('webllm-last-model')
            
            // Only set a selected model if we have a previously used one
            if (lastSelectedModel && availableModels.some(m => m.id === lastSelectedModel)) {
              setSelectedModel(lastSelectedModel)
            }
          }
          
          // Check for cached models via IndexedDB
          if (window.indexedDB) {
            try {
              // Try to detect cached models
              detectCachedModels()
            } catch (err) {
              console.log('Cache detection not available')
            }
          }
        } catch (error) {
          console.error("Error loading models:", error)
          updateActiveChatLoadingState(false, false, "Error loading model list. Please try again.", 0)
        }
      } else {
        updateActiveChatLoadingState(false, false, "WebGPU is not supported in your browser. Please use Chrome 113+ or Edge 113+.", 0)
      }
    }
    
    checkWebGPU()
  }, [])
  
  // Cleanup WebLLM service on component unmount
  useEffect(() => {
    return () => {
      // Safely dispose of the WebLLM service when component unmounts
      if (webLLMServiceRef.current) {
        try {
          if (typeof webLLMServiceRef.current.dispose === 'function') {
            webLLMServiceRef.current.dispose().catch((err: Error) => {
              console.error('Error during WebLLM service disposal:', err);
            });
          } else if (typeof webLLMServiceRef.current.unload === 'function') {
            webLLMServiceRef.current.unload().catch((err: Error) => {
              console.error('Error during WebLLM service unload:', err);
            });
          }
          webLLMServiceRef.current = null;
        } catch (err: unknown) {
          console.error('Error disposing WebLLM service on unmount:', err);
        }
      }
    };
  }, []);
  
  // Load chat sessions from localStorage
  const loadChatSessions = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedSessions = localStorage.getItem('webllm-chat-sessions')
        if (savedSessions) {
          let sessions = JSON.parse(savedSessions) as ChatSession[]
          
          // Migrate old sessions without model loading state if needed
          sessions = sessions.map(session => ({
            ...session,
            isModelLoaded: session.isModelLoaded ?? false,
            isLoading: session.isLoading ?? false,
            loadingStatus: session.loadingStatus ?? "",
            loadingProgress: session.loadingProgress ?? 0
          }))
          
          setChatSessions(sessions)
          
          // Set active chat to the most recently updated one
          if (sessions.length > 0) {
            const mostRecent = sessions.sort((a, b) => b.lastUpdated - a.lastUpdated)[0]
            setActiveChatId(mostRecent.id)
            
            // If the active chat has a model, select it
            if (mostRecent.modelId) {
              setSelectedModel(mostRecent.modelId)
            }
          }
        }
      } catch (error) {
        console.error("Error loading chat sessions:", error)
      }
    }
  }
  
  // Save chat sessions to localStorage
  const saveChatSessions = (sessions: ChatSession[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('webllm-chat-sessions', JSON.stringify(sessions))
      } catch (error) {
        console.error("Error saving chat sessions:", error)
      }
    }
  }
  
  // Create a new chat session
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      modelId: selectedModel,
      messages: [
        {
          id: "system-1",
          role: "system" as const,
          content: "You are a helpful AI assistant helping users. When answering complex questions or solving problems, you can show your thinking process using <think>Your reasoning steps here</think> tags. This helps users understand your approach and learn from your problem-solving methods.",
          timestamp: Date.now(),
        }
      ],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      isModelLoaded: false,
      isLoading: false,
      loadingStatus: "",
      loadingProgress: 0
    }
    
    const updatedSessions = [...chatSessions, newChat]
    setChatSessions(updatedSessions)
    setActiveChatId(newChatId)
    saveChatSessions(updatedSessions)
  }
  
  // Update chat title
  const updateActiveChatTitle = (title: string) => {
    if (!activeChatId) return
    
    const updatedSessions = chatSessions.map(chat => 
      chat.id === activeChatId ? { ...chat, title } : chat
    )
    
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
  }
  
  // Update loading state for active chat
  const updateActiveChatLoadingState = (
    isModelLoaded: boolean, 
    isLoading: boolean, 
    loadingStatus?: string, 
    loadingProgress?: number
  ) => {
    if (!activeChatId) return
    
    const updatedSessions = chatSessions.map(chat => 
      chat.id === activeChatId ? { 
        ...chat, 
        isModelLoaded, 
        isLoading,
        loadingStatus: loadingStatus !== undefined ? loadingStatus : chat.loadingStatus,
        loadingProgress: loadingProgress !== undefined ? loadingProgress : chat.loadingProgress
      } : chat
    )
    
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
  }
  
  // Set active chat
  const setActiveChat = (chatId: string) => {
    setActiveChatId(chatId)
    
    // Set the model for this chat
    const chat = chatSessions.find(c => c.id === chatId)
    if (chat?.modelId) {
      setSelectedModel(chat.modelId)
      
      // If the chat has isModelLoaded true but we don't have a service,
      // we may need to reinitialize
      if (chat.isModelLoaded && !webLLMServiceRef.current) {
        console.log("Chat marked as having loaded model, but service not available");
        // We'll lazy-load it when needed in handleSendMessage
      }
    }
  }
  
  // Delete a chat session
  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the set active chat
    
    const updatedSessions = chatSessions.filter(chat => chat.id !== chatId)
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
    
    // If the active chat was deleted
    if (activeChatId === chatId) {
      if (updatedSessions.length > 0) {
        // Set active chat to the first remaining chat
        setActiveChatId(updatedSessions[0].id)
      } else {
        // No chats left, clear active chat ID first
        setActiveChatId(null)
        
        // Create a new chat after a brief delay to ensure state updates are processed
        setTimeout(() => {
          // Generate a new chat ID now
          const newChatId = `chat-${Date.now()}`
          const newChat: ChatSession = {
            id: newChatId,
            title: 'New Chat',
            modelId: selectedModel,
            messages: [
              {
                id: "system-1",
                role: "system" as const,
                content: "You are a helpful AI assistant helping users. When answering complex questions or solving problems, you can show your thinking process using <think>Your reasoning steps here</think> tags. This helps users understand your approach and learn from your problem-solving methods.",
                timestamp: Date.now(),
              }
            ],
            lastUpdated: Date.now(),
            createdAt: Date.now(),
            isModelLoaded: false,
            isLoading: false,
            loadingStatus: "",
            loadingProgress: 0
          }
          
          // Update state with the new chat
          setChatSessions([newChat])
          setActiveChatId(newChatId)
          saveChatSessions([newChat])
        }, 50)
      }
    }
  }
  
  // Update active chat with new messages
  const updateActiveChat = (newMessages: ChatMessage[]) => {
    if (!activeChatId) return
    
    const updatedSessions = chatSessions.map(chat => {
      if (chat.id === activeChatId) {
        // Update title if it's just "New Chat" and we have a user message
        let title = chat.title
        if (title === 'New Chat' && newMessages.some(m => m.role === 'user')) {
          const firstUserMsg = newMessages.find(m => m.role === 'user')
          if (firstUserMsg) {
            title = firstUserMsg.content.length > 30 
              ? firstUserMsg.content.substring(0, 30) + '...' 
              : firstUserMsg.content
          }
        }
        
        return { 
          ...chat, 
          messages: newMessages,
          lastUpdated: Date.now(),
          title,
          modelId: selectedModel // Update the model ID with currently selected model
        }
      }
      return chat
    })
    
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
  }
  
  // Try to detect which models may be cached
  const detectCachedModels = async () => {
    try {
      const webllm = await import('@mlc-ai/web-llm')
      
      // Use IndexedDB directly to check cache
      if (window.indexedDB) {
        try {
          const dbName = "webllm_cache"
          const request = window.indexedDB.open(dbName)
          
          request.onerror = () => {
            console.log("IndexedDB access error")
          }
          
          request.onsuccess = () => {
            try {
              // Set some default values - the actual cached models will be
              // detected during loading
              console.log("Cache detection will happen during model load")
            } catch (err) {
              console.error("Error accessing IndexedDB:", err)
            }
          }
        } catch (err) {
          console.log('Using fallback cache detection mechanism')
        }
      }
    } catch (error) {
      console.error("Error checking cached models:", error)
    }
  }
  
  // Clear the WebLLM model cache
  const clearModelCache = async () => {
    try {
      // First dispose of any existing service to avoid conflicts
      if (webLLMServiceRef.current) {
        try {
          if (typeof webLLMServiceRef.current.dispose === 'function') {
            await webLLMServiceRef.current.dispose();
          } else if (typeof webLLMServiceRef.current.unload === 'function') {
            await webLLMServiceRef.current.unload();
          }
          webLLMServiceRef.current = null;
        } catch (error) {
          console.log("Error disposing service before cache clear:", error);
        }
      }

      // Import WebLLM to access cache methods
      const webllm = await import('@mlc-ai/web-llm');
      
      // Create a temporary engine to access the cache
      const engine = new webllm.MLCEngine();
      
      try {
        // Clear the cache (thorough=true means it will attempt to delete all cached files)
        await (engine as any).clearCache(true);
        
        // Reset the cached models list
        setCachedModels([]);
        
        // Update loading state
        updateActiveChatLoadingState(false, false, "Cache cleared. Please reload your model.", 0);
        
        // Clean up the temporary engine
        await engine.unload();
        
        return true;
      } catch (error) {
        console.error("Error clearing cache:", error);
        updateActiveChatLoadingState(false, false, `Error clearing cache: ${error}`, 0);
        return false;
      }
    } catch (error) {
      console.error("Error creating engine for cache clear:", error);
      updateActiveChatLoadingState(false, false, "Failed to clear cache - browser API error", 0);
      return false;
    }
  };

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Initialize the WebLLM engine with the selected model
  const handleModelLoad = async () => {
    if (!selectedModel || !activeChatId) return
    
    // First check if this is an embedding model - these won't work for chat
    if (isEmbeddingModel(selectedModel)) {
      // Show error message about embedding models
      updateActiveChatLoadingState(
        false, 
        false, 
        "Error: Embedding models like this one can't be used for chat. Please select a chat/instruction model instead.", 
        0
      );
      return;
    }
    
    // Save the selected model to localStorage for future use
    if (typeof window !== 'undefined') {
      localStorage.setItem('webllm-last-model', selectedModel)
    }
    
    // Update the active chat with the selected model
    if (activeChatId) {
      const updatedSessions = chatSessions.map(chat => 
        chat.id === activeChatId ? { ...chat, modelId: selectedModel } : chat
      )
      setChatSessions(updatedSessions)
      saveChatSessions(updatedSessions)
    }
    
    // If we already have an engine reference, release it to prevent conflicts
    if (webLLMServiceRef.current) {
      try {
        // Only call dispose if it exists as a function
        if (typeof webLLMServiceRef.current.dispose === 'function') {
          await webLLMServiceRef.current.dispose();
        } else if (typeof webLLMServiceRef.current.unload === 'function') {
          // Try the unload method as a fallback if dispose doesn't exist
          await webLLMServiceRef.current.unload();
        }
        webLLMServiceRef.current = null;
      } catch (error) {
        console.log("Error disposing previous model, continuing with new load", error);
      }
    }
    
    // Set loading state for this specific chat IMMEDIATELY
    // This ensures the loading indicator shows right away
    updateActiveChatLoadingState(false, true, "Initializing model loader...", 1)
    
    try {
      // Get the model's context window size
      const model = models.find(m => m.id === selectedModel);
      const contextSize = model?.contextLength || 4096;
      
      // Check if this is an embedding model
      const modelIsForEmbedding = isEmbeddingModel(selectedModel);
      
      // Enhanced config with sliding window support for non-embedding models
      const config: any = {
        temperature: 0.7,
        topP: 0.9,
        maxGenerateTokens: 2048,
      };
      
      // Only apply sliding window settings for non-embedding models
      if (!modelIsForEmbedding) {
        // Choose to use sliding window rather than fixed context size
        // WebLLM requires only one of these to be positive
        config.context_window_size = -1; // Disable fixed context window
        // Use sliding window that's about 75% of the model's context size
        config.sliding_window_size = Math.floor(contextSize * 0.75);
      } else {
        // For embedding models, just set the context window size
        config.context_window_size = contextSize;
      }
      
      // Update the state with the model's context size
      setMaxContextTokens(contextSize);
      
      // Show "preparing to download" even before the service is created
      updateActiveChatLoadingState(false, true, "Preparing to download model...", 5)
      
      // Use our service to create and initialize WebLLM
      webLLMServiceRef.current = await getWebLLMService(
        selectedModel, 
        config,
        (progress, status, isFromCache) => {
          // Always update the loading state, even for cached models
          updateActiveChatLoadingState(false, true, status || "Loading model...", progress)
          
          // Update cached models if loaded from cache
          if (isFromCache && !cachedModels.includes(selectedModel)) {
            setCachedModels(prev => [...prev, selectedModel])
          }
        }
      )
      
      // Initialize the model - this must complete before getting runtime stats
      await webLLMServiceRef.current.initialize()
      
      // Mark the model as loaded only AFTER successfully initializing
      updateActiveChatLoadingState(true, false)
      
      // Set a small delay before attempting to get runtime stats
      // This gives the model time to fully initialize internal state
      setTimeout(async () => {
        try {
          if (webLLMServiceRef.current) {
            const runtimeStats = await webLLMServiceRef.current.getRuntimeStats();
            if (runtimeStats && !runtimeStats.includes('NaN')) {
              setStats(runtimeStats);
            } else {
              setStats("");
            }
          }
        } catch (error) {
          console.error("Error getting runtime stats, proceeding without stats", error);
          setStats("");
        }
      }, 500);
      
      // Update cached models since this model is now cached
      if (!cachedModels.includes(selectedModel)) {
        setCachedModels(prev => [...prev, selectedModel])
      }
    } catch (error) {
      console.error("Failed to load model:", error)
      updateActiveChatLoadingState(false, false, `Error: ${error}`, 0)
      webLLMServiceRef.current = null;
    }
  }
  
  // Handle copying message content
  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  // Estimate token count for a message
  const estimateTokenCount = (text: string): number => {
    // Simple approximation: most models use ~4 chars per token on average
    // This is just an estimation - actual tokenization varies by model
    return Math.ceil(text.length / 4);
  }

  // Estimate total tokens in the conversation
  const calculateConversationTokens = (messages: ChatMessage[]): number => {
    return messages.reduce((total, msg) => {
      return total + estimateTokenCount(msg.content);
    }, 0);
  }

  // Update token count when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const count = calculateConversationTokens(messages);
      setTokenCount(count);
    } else {
      setTokenCount(0);
    }
  }, [messages]);

  // Update max tokens when model changes
  useEffect(() => {
    if (selectedModel) {
      const model = models.find(m => m.id === selectedModel);
      if (model && model.contextLength) {
        setMaxContextTokens(model.contextLength);
      }
    }
  }, [selectedModel, models]);

  // Handle conversation trimming
  const handleTrimConversation = () => {
    if (!activeChatId || messages.length < 3) return;
    
    // Keep system message and the most recent 3 message pairs (user + assistant)
    const systemMessages = messages.filter(msg => msg.role === "system");
    
    // Get non-system messages
    const nonSystemMessages = messages.filter(msg => msg.role !== "system");
    
    // Keep only the most recent messages
    const messagesToKeep = nonSystemMessages.slice(-6); // Last 3 user-assistant pairs
    
    // Create updated message list with system messages + recent messages
    const updatedMessages = [...systemMessages, ...messagesToKeep];
    
    // Update the chat
    updateActiveChat(updatedMessages);
    
    // Add a system notification about trimming
    const notificationMessage: ChatMessage = {
      id: `system-notice-${Date.now()}`,
      role: "system" as const,
      content: "⚠️ Older messages were removed to stay within the model's context limit. The AI may have forgotten earlier parts of the conversation.",
      timestamp: Date.now(),
    };
    
    updateActiveChat([...updatedMessages, notificationMessage]);
  }

  // Handle context window exceeded error
  const handleContextWindowExceeded = async (e: Error) => {
    console.error("Context window exceeded:", e);
    
    if (activeChat && messages.length > 0) {
      // Add a system message explaining the error
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant" as const,
        content: "⚠️ This conversation exceeds the model's context limit. Please trim some older messages or start a new conversation.",
        timestamp: Date.now(),
      };
      
      // Add error message to the chat
      const updatedMessages = [...messages.filter(m => m.content !== errorMessage.content), errorMessage];
      updateActiveChat(updatedMessages);
      
      // Show the token limit dialog
      setIsTokenLimitDialogOpen(true);
    }
    
    setIsGenerating(false);
  }

  // Send a message and get a response
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim() === "" || !isModelLoaded || isGenerating) return
    
    // Prevent sending messages with embedding models
    if (selectedModel && isEmbeddingModel(selectedModel)) {
      // Show error message in chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant" as const,
        content: "⚠️ Embedding models can't generate text responses. Please load a chat or instruction model to have a conversation.",
        timestamp: Date.now(),
      };
      
      if (activeChat) {
        const updatedMessages = [...messages, errorMessage];
        updateActiveChat(updatedMessages);
      }
      
      return;
    }
    
    // Stop if we're very close to the token limit
    if (tokenCount > maxContextTokens * 0.95) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant" as const,
        content: "⚠️ This conversation is too long for the model to process. Please trim some older messages using the token manager above, or start a new conversation.",
        timestamp: Date.now(),
      };
      
      if (activeChat) {
        // Add error message to the chat
        const updatedMessages = [...messages.filter(m => m.content !== errorMessage.content), errorMessage];
        updateActiveChat(updatedMessages);
      }
      
      return;
    }
    
    // Create a new chat if none is active
    if (!activeChatId) {
      createNewChat()
    }
    
    // Check if WebLLM service is available, if not try to reload it
    if (!webLLMServiceRef.current && isModelLoaded && selectedModel) {
      try {
        updateActiveChatLoadingState(false, true, "Reloading model...", 0);
        
        // Get the model's context window size
        const model = models.find(m => m.id === selectedModel);
        const contextSize = model?.contextLength || 4096;
        
        // Check if this is an embedding model
        const modelIsForEmbedding = isEmbeddingModel(selectedModel);
        
        // Enhanced config with sliding window support for non-embedding models
        const config: any = {
          temperature: 0.7,
          topP: 0.9,
          maxGenerateTokens: 2048,
        };
        
        // Only apply sliding window settings for non-embedding models
        if (!modelIsForEmbedding) {
          // Choose to use sliding window rather than fixed context size
          // WebLLM requires only one of these to be positive
          config.context_window_size = -1; // Disable fixed context window
          // Use sliding window that's about 75% of the model's context size
          config.sliding_window_size = Math.floor(contextSize * 0.75);
        } else {
          // For embedding models, just set the context window size
          config.context_window_size = contextSize;
        }
        
        webLLMServiceRef.current = await getWebLLMService(
          selectedModel, 
          config,
          (progress, status, isFromCache) => {
            updateActiveChatLoadingState(false, true, status, progress);
          }
        );
        
        await webLLMServiceRef.current.initialize();
        updateActiveChatLoadingState(true, false);
      } catch (error) {
        console.error("Failed to reload model:", error);
        updateActiveChatLoadingState(false, false, `Error reloading model: ${error}`, 0);
        return; // Exit if we couldn't reload the model
      }
    }
    
    // Double check we have a service before proceeding
    if (!webLLMServiceRef.current) {
      console.error("WebLLM service is not available");
      updateActiveChatLoadingState(false, false, "Error: AI service not available. Please try reloading the model.", 0);
      return;
    }
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    }
    
    // Get existing messages or start with system message if none
    const currentMessages = activeChat?.messages || [
      {
        id: "system-1",
        role: "system" as const,
        content: "You are a helpful AI assistant helping users. When answering complex questions or solving problems, you can show your thinking process using <think>Your reasoning steps here</think> tags. This helps users understand your approach and learn from your problem-solving methods.",
        timestamp: Date.now(),
      }
    ]
    
    const updatedMessages = [...currentMessages, userMessage]
    updateActiveChat(updatedMessages)
    
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
    
    const messagesWithAIPlaceholder = [...updatedMessages, aiMessage]
    updateActiveChat(messagesWithAIPlaceholder)
    
    // Prepare messages for the API
    const apiMessages = updatedMessages
      .map(msg => {
        // For the last user message, encourage the model to show reasoning
        if (msg.role === "user" && msg.id === userMessage.id) {
          // For math or complex questions, add a hint to encourage showing reasoning
          if (msg.content.includes("calculate") || 
              msg.content.includes("solve") || 
              msg.content.includes("explain") || 
              msg.content.includes("why") || 
              msg.content.match(/[0-9+\-*/^()=%]/) ||
              msg.content.length > 50) {
            return {
              role: msg.role,
              content: `${msg.content}\n\nPlease show your thinking process using <think>...</think> tags where appropriate.`
            }
          }
        }
        // Return the original message otherwise
        return { role: msg.role, content: msg.content }
      })
    
    try {
      // Use the service to generate the response
      await webLLMServiceRef.current.generate(
        apiMessages,
        { 
          stream: true 
        },
        {
          onTokenCallback: (token: string, fullText: string) => {
            const updatedMessagesWithAIResponse = messagesWithAIPlaceholder.map(msg => 
              msg.id === aiMessageId ? { ...msg, content: fullText } : msg
            )
            updateActiveChat(updatedMessagesWithAIResponse)
          },
          onFinishCallback: async (response: any) => {
            setIsGenerating(false)
            
            // Try to safely update stats
            try {
              const runtimeStats = await webLLMServiceRef.current.getRuntimeStats();
              if (runtimeStats && !runtimeStats.includes('NaN')) {
                setStats(runtimeStats);
              }
            } catch (error) {
              console.error("Error getting runtime stats after generation", error);
            }
          },
          onErrorCallback: (error: Error) => {
            console.error("Generation error:", error)
            setIsGenerating(false)
            
            // Check if it's a context window exceeded error
            if (error.message && error.message.includes('exceed context window size')) {
              handleContextWindowExceeded(error);
              return;
            }
            
            const errorMessages = messagesWithAIPlaceholder.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: "Error generating response. Please try again." } 
                : msg
            )
            updateActiveChat(errorMessages)
          }
        }
      )
    } catch (error: any) {
      console.error("Error during generation:", error)
      setIsGenerating(false)
      
      // Check if it's a context window exceeded error
      if (error.message && error.message.includes('exceed context window size')) {
        handleContextWindowExceeded(error);
        return;
      }
      
      const errorMessages = messagesWithAIPlaceholder.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: "Error generating response. Please try again." } 
          : msg
      )
      updateActiveChat(errorMessages)
    }
  }

  // Clear the chat history
  const handleClearChat = () => {
    if (!activeChatId) return
    
    const clearedMessages = [
      {
        id: "system-1",
        role: "system" as const,
        content: "You are a helpful AI assistant helping users. When answering complex questions or solving problems, you can show your thinking process using <think>Your reasoning steps here</think> tags. This helps users understand your approach and learn from your problem-solving methods.",
        timestamp: Date.now(),
      }
    ]
    
    updateActiveChat(clearedMessages)
  }

  // Download chat history as JSON
  const handleExportChat = () => {
    if (!activeChat) return
    
    const exportData = activeChat.messages.filter(m => m.role !== "system")
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
    <div className="flex h-[calc(100vh-10rem)] border-y relative">
      <ChatSidebar
        chatSessions={chatSessions}
        models={models}
        activeChatId={activeChatId}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        createNewChat={createNewChat}
        setActiveChat={setActiveChat}
        deleteChat={deleteChat}
      />
      
      {/* Token Limit Dialog */}
      <TokenLimitDialog
        open={isTokenLimitDialogOpen}
        setOpen={setIsTokenLimitDialogOpen}
        onTrimConversation={handleTrimConversation}
        onExportChat={handleExportChat}
        onNewChat={createNewChat}
      />
      
      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <Card className="flex flex-col h-full border-0 rounded-none shadow-none">
          <CardHeader className="bg-white border-b py-3 px-4 flex-shrink-0">
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Private AI Chat</span>
              {activeChat && (
                <div className="text-sm font-normal flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  {models.find(m => m.id === selectedModel)?.name || selectedModel}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 flex-grow overflow-hidden flex flex-col min-h-0">
            {!webLLMSupported ? (
              <div className="text-center py-10">
                <h3 className="text-xl font-semibold text-red-600 mb-4">WebGPU Not Supported</h3>
                <p className="mb-2">Your browser doesn't support WebGPU, which is required for browser-based AI models.</p>
                <p>Please use Chrome 113+ or Edge 113+ to access this feature.</p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full min-h-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="model-selection">Select Model</Label>
                    {!isModelLoaded && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearModelCache} 
                        disabled={isLoading}
                        className="text-xs h-7 px-2"
                      >
                        Clear Cache
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="model-selection"
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                          disabled={isModelLoaded || isLoading}
                        >
                          {selectedModel ? (
                            <div className="flex items-center">
                              <span className="truncate mr-2">
                                {models.find(m => m.id === selectedModel)?.name || selectedModel}
                              </span>
                              {models.find(m => m.id === selectedModel)?.lowResourceRequired && (
                                <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded ml-auto mr-1">
                                  Low
                                </span>
                              )}
                              {cachedModels.includes(selectedModel) && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded flex items-center ml-auto">
                                  <Database className="h-3 w-3 mr-1" /> Cached
                                </span>
                              )}
                            </div>
                          ) : (
                            "Select model"
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command className="w-full">
                          <CommandInput placeholder="Search models..." className="w-full" />
                          <CommandEmpty>No models found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-[300px]">
                              {models.map((model) => (
                                <CommandItem
                                  key={model.id}
                                  value={model.id}
                                  onSelect={(currentValue: string) => {
                                    setSelectedModel(currentValue)
                                    // Save selection to localStorage
                                    if (typeof window !== 'undefined') {
                                      localStorage.setItem('webllm-last-model', currentValue)
                                    }
                                    setOpen(false)
                                  }}
                                  className="flex flex-col items-start py-2 text-left w-full px-3"
                                >
                                  <div className="flex w-full items-center justify-between">
                                    <span className="font-medium mr-2">{model.name}</span>
                                    <div className="flex items-center gap-1 ml-auto">
                                      {cachedModels.includes(model.id) && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded flex items-center">
                                          <Database className="h-3 w-3 mr-1" /> Cached
                                        </span>
                                      )}
                                      {model.id === selectedModel && <Check className="h-4 w-4" />}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 w-full text-left">
                                    <div>{model.description}</div>
                                    <div className="flex flex-wrap gap-2 mt-0.5">
                                      <span className="font-medium">Size:</span> {model.size}
                                      <span className="font-medium ml-2">Context:</span> {model.contextLength} tokens
                                      {model.lowResourceRequired && (
                                        <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                                          Low Resource
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button 
                      onClick={handleModelLoad} 
                      disabled={isModelLoaded || isLoading || !selectedModel}
                      className={cn("whitespace-nowrap min-w-[110px]", isLoading && "bg-blue-600 hover:bg-blue-700")}
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
                      <div className="text-xs text-gray-600">{loadingStatus || "Loading model..."}</div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${loadingProgress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {isModelLoaded && messages.length > 0 && (
                  <TokenManager 
                    tokenCount={tokenCount}
                    maxTokens={maxContextTokens}
                    handleTrimConversation={handleTrimConversation}
                  />
                )}
                
                <ChatContainer
                  messages={messages}
                  isModelLoaded={isModelLoaded}
                  isGenerating={isGenerating}
                  copiedMessageId={copiedMessageId}
                  handleCopyMessage={handleCopyMessage}
                  formatMessageContent={formatMessageContent}
                  chatContainerRef={chatContainerRef}
                />
                
                {/* Stats Display */}
                <StatsDisplay stats={stats} />
                
                <ChatInput
                  userInput={userInput}
                  setUserInput={setUserInput}
                  isModelLoaded={isModelLoaded}
                  isGenerating={isGenerating}
                  handleSendMessage={handleSendMessage}
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex-shrink-0">
            <ChatFooter
              activeChat={activeChat}
              isGenerating={isGenerating}
              handleClearChat={handleClearChat}
              handleExportChat={handleExportChat}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 