"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { 
  getWebLLMService, 
  WebLLMService, 
  getAvailableModels, 
  WebLLMModel,
  DEFAULT_MODEL_ID,
  isWebGPUSupported
} from "./webllm-service"

interface WebLLMContextType {
  llmService: WebLLMService | null
  isModelLoaded: boolean
  isModelLoading: boolean
  loadingProgress: number
  loadingState: string
  availableModels: WebLLMModel[]
  selectedModelId: string
  setSelectedModelId: (modelId: string) => void
  loadModel: (modelId: string, progressCallback?: (progress: number, state?: string) => void) => Promise<void>
  supportsWebGPU: boolean
  error: string | null
  logs: string[]
}

const WebLLMContext = createContext<WebLLMContextType | undefined>(undefined)

export function WebLLMProvider({ children }: { children: ReactNode }) {
  const [llmService, setLLMService] = useState<WebLLMService | null>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingState, setLoadingState] = useState("")
  const [selectedModelId, setSelectedModelId] = useState("")
  const [availableModels, setAvailableModels] = useState<WebLLMModel[]>([])
  const [supportsWebGPU, setSupportsWebGPU] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Helper to push log
  const pushLog = (msg: string) => {
    setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`])
    console.log(`[WebLLMProvider] ${msg}`)
  }

  // Debug: log all state on each render
  useEffect(() => {
    console.log('[WebLLMProvider State]', {
      llmService,
      isModelLoaded,
      isModelLoading,
      loadingProgress,
      loadingState,
      selectedModelId,
      availableModels,
      supportsWebGPU,
      error,
      logs,
    })
  })

  // Check WebGPU support on mount
  useEffect(() => {
    const webgpuSupported = isWebGPUSupported()
    setSupportsWebGPU(webgpuSupported)
    pushLog('Checking WebGPU support: ' + webgpuSupported)
    // Load available models
    const loadModels = async () => {
      try {
        pushLog('Fetching available models...')
        const models = await getAvailableModels()
        setAvailableModels(models)
        
        // Set a default model ID only if models are available
        if (models.length > 0 && !selectedModelId) {
          setSelectedModelId(models[0].id)
          pushLog('Set default model to: ' + models[0].id)
        }
        
        pushLog('availableModels after fetch: ' + JSON.stringify(models))
        if (models.length === 0) {
          pushLog('No models found!')
        } else {
          pushLog('Models loaded: ' + models.map(m => m.id).join(', '))
        }
      } catch (err) {
        pushLog('Failed to load available models: ' + (err instanceof Error ? err.message : String(err)))
        setError("Failed to load available AI models. Please refresh and try again.")
      }
    }
    loadModels().then(() => {
      console.log('[WebLLMProvider] Finished loading models. State:', {
        availableModels,
        supportsWebGPU,
        llmService,
        error,
      })
    })
  }, [])

  // Load model function
  const loadModel = async (
    modelId: string,
    progressCallback?: (progress: number, state?: string) => void
  ) => {
    if (!supportsWebGPU) {
      setError("WebGPU is not supported in your browser. Please try a newer browser like Chrome or Edge.")
      return
    }

    setIsModelLoading(true)
    setLoadingProgress(0)
    setLoadingState("Starting model loading...")
    setError(null)
    pushLog('Loading model: ' + modelId)
    
    try {
      setSelectedModelId(modelId)
      
      // Define progress handler with isFromCache and modelCdnUrl optional params
      const handleProgress = (
        progress: number, 
        state?: string, 
        isFromCache?: boolean,
        modelCdnUrl?: string
      ) => {
        setLoadingProgress(progress * 100)
        if (state) {
          setLoadingState(state)
        }
        pushLog(`Model loading progress: ${Math.round(progress*100)}% - ${state || ""}`)
        if (progressCallback) {
          progressCallback(progress, state)
        }
      }
      const service = await getWebLLMService(
        modelId,
        {},
        handleProgress
      )
      // Set LLM service instance
      setLLMService(service)
      setIsModelLoaded(true)
      setIsModelLoading(false)
      setLoadingProgress(100)
      setLoadingState("Model loaded.")
      pushLog('Model loaded and llmService set: ' + modelId)
      console.log('[WebLLMProvider] llmService set:', service)
      console.log('[WebLLMProvider] State after model load:', {
        llmService: service,
        isModelLoaded: true,
        isModelLoading: false,
        loadingProgress: 100,
        loadingState: "Model loaded.",
        selectedModelId: modelId,
      })
    } catch (err) {
      setIsModelLoading(false)
      setIsModelLoaded(false)
      setLoadingProgress(0)
      setLoadingState("")
      setLLMService(null)
      pushLog('Error loading model: ' + (err instanceof Error ? err.message : String(err)))
      setError("Failed to load the selected AI model. Please try another model or refresh.")
      console.log('[WebLLMProvider] Error loading model:', err)
    }
  }

  const value = {
    llmService,
    isModelLoaded,
    isModelLoading,
    loadingProgress,
    loadingState,
    availableModels,
    selectedModelId,
    setSelectedModelId,
    loadModel,
    supportsWebGPU,
    error,
    logs // Expose logs for UI
  }

  return (
    <WebLLMContext.Provider value={value}>
      {children}
    </WebLLMContext.Provider>
  )
}

export function useWebLLM() {
  const context = useContext(WebLLMContext)
  if (context === undefined) {
    throw new Error("useWebLLM must be used within a WebLLMProvider")
  }
  return context
}
