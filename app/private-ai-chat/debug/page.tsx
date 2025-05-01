// Add type declarations for WebGPU and performance.memory at the top of the file
declare global {
  interface Navigator {
    gpu?: {
      requestAdapter: () => Promise<GPUAdapter | null>;
    };
  }
  
  interface GPUAdapter {
    // @ts-ignore - Overriding WebGPU typings for debugging purposes
    features: Set<string>;
    // @ts-ignore - Overriding WebGPU typings for debugging purposes
    limits: Record<string, number>;
    // @ts-ignore - Overriding WebGPU typings for debugging purposes
    requestAdapterInfo: () => Promise<{
      vendor: string;
      architecture: string;
      device: string;
      description: string;
    }>;
  }
  
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
}

"use client"

import { useState, useEffect, useRef } from 'react'
import { webLLMModels } from './models'
import { getWebLLMService } from './utils'

export default function DebugPage() {
  const [gpuInfo, setGpuInfo] = useState<any>(null)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [phase, setPhase] = useState<string>('initial')
  const [progress, setProgress] = useState<number>(0)
  const [modelLoadTime, setModelLoadTime] = useState<number | null>(null)
  const [memoryStats, setMemoryStats] = useState<any>(null)
  const logRef = useRef<HTMLDivElement>(null)
  
  // Original console methods
  const originalConsoleLog = useRef<typeof console.log>(console.log)
  const originalConsoleError = useRef<typeof console.error>(console.error)
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
    setTimeout(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight
      }
    }, 100)
  }
  
  useEffect(() => {
    // Override console.log to show in UI
    console.log = (...args) => {
      originalConsoleLog.current(...args)
      addLog(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '))
    }
    
    // Override console.error to show in UI
    console.error = (...args) => {
      originalConsoleError.current(...args)
      addLog(`ERROR: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')}`)
    }
    
    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsoleLog.current
      console.error = originalConsoleError.current
    }
  }, [])
  
  useEffect(() => {
    checkWebGPU()
    getGPUInfo()
    loadModels()
    
    // Get previously selected model from localStorage
    const savedModel = localStorage.getItem('selectedModel')
    if (savedModel) {
      setSelectedModel(savedModel)
      addLog(`Found previously selected model: ${savedModel}`)
    }
    
    addLog('Cache detection will happen during model load')
    getMemoryStats()
  }, [])
  
  const getMemoryStats = () => {
    try {
      if (performance && 'memory' in performance && performance.memory) {
        const memory = performance.memory;
        setMemoryStats({
          jsHeapSizeLimit: formatBytes(memory.jsHeapSizeLimit),
          totalJSHeapSize: formatBytes(memory.totalJSHeapSize),
          usedJSHeapSize: formatBytes(memory.usedJSHeapSize)
        });
        addLog(`Memory stats: ${JSON.stringify({
          jsHeapSizeLimit: formatBytes(memory.jsHeapSizeLimit),
          totalJSHeapSize: formatBytes(memory.totalJSHeapSize),
          usedJSHeapSize: formatBytes(memory.usedJSHeapSize)
        })}`);
      } else {
        setMemoryStats({ info: 'Memory API not available in this browser' });
        addLog('Memory API not available in this browser');
      }
    } catch (e) {
      addLog(`Error getting memory stats: ${e}`);
      setMemoryStats({ error: String(e) });
    }
  }
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const checkWebGPU = () => {
    if (!navigator.gpu) {
      addLog('WebGPU is not supported in this browser')
      return false
    }
    addLog('WebGPU is supported in this browser')
    return true
  }
  
  const getGPUInfo = async () => {
    try {
      if (!navigator.gpu) {
        setGpuInfo({ error: 'WebGPU not supported' })
        return
      }
      
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        setGpuInfo({ error: 'Could not request GPU adapter' })
        addLog('Could not request GPU adapter')
        return
      }
      
      const info = await adapter.requestAdapterInfo()
      setGpuInfo(info)
      addLog(`GPU Info: ${JSON.stringify(info)}`)
      
      // Get adapter features
      const features = []
      for (const feature of adapter.features.values()) {
        features.push(feature)
      }
      addLog(`GPU Features: ${JSON.stringify(features)}`)
      
      // Get limits
      const limits = {}
      for (const [key, value] of Object.entries(adapter.limits)) {
        // @ts-ignore
        limits[key] = value
      }
      addLog(`GPU Limits: ${JSON.stringify(limits)}`)
      
    } catch (e) {
      setGpuInfo({ error: String(e) })
      addLog(`Error getting GPU info: ${e}`)
    }
  }
  
  const loadModels = () => {
    addLog('Loading available models...')
    try {
      const models = webLLMModels
      addLog(`Found ${models.length} models`)
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0].id)
      }
    } catch (e) {
      addLog(`Error loading models: ${e}`)
    }
  }
  
  const handleModelLoad = async () => {
    setLoading(true)
    setError('')
    setLogs([])
    setPhase('starting')
    setProgress(0)
    const startTime = performance.now()
    
    try {
      addLog(`Starting to load model: ${selectedModel}`)
      localStorage.setItem('selectedModel', selectedModel)
      
      addLog('Checking for cached version...')
      setPhase('cache-check')
      
      // First test if we can access indexedDB
      try {
        const testDBRequest = indexedDB.open('webllm-test', 1)
        testDBRequest.onerror = (event) => {
          addLog(`IndexedDB access error: ${JSON.stringify(event)}`)
        }
        testDBRequest.onsuccess = () => {
          addLog('IndexedDB access successful')
          testDBRequest.result.close()
        }
      } catch (e) {
        addLog(`IndexedDB test error: ${e}`)
      }
      
      setPhase('initialization')
      addLog('Initializing WebLLM service...')
      
      try {
        const webLLM = await getWebLLMService({
          model: selectedModel,
          onProgress: (current: number, total: number) => {
            const percentage = Math.round((current / total) * 100)
            setProgress(percentage)
            setPhase('downloading')
            addLog(`Download progress: ${current}/${total} bytes (${percentage}%)`)
          },
          onInitProgress: (phase: string, percent: number) => {
            addLog(`Init phase: ${phase}, progress: ${percent}%`)
            setPhase(`initializing-${phase}`)
            setProgress(percent)
          }
        })
        
        setPhase('loaded')
        const endTime = performance.now()
        const loadTimeSeconds = ((endTime - startTime) / 1000).toFixed(2)
        setModelLoadTime(parseFloat(loadTimeSeconds))
        addLog(`✅ Model loaded successfully in ${loadTimeSeconds} seconds!`)
        
        // Test a simple completion to verify the model works
        setPhase('testing')
        addLog('Testing model with a simple prompt...')
        const testResult = await webLLM.generate('Hello, can you hear me?', {
          max_tokens: 20,
          temperature: 0.7,
        })
        addLog(`Test result: ${JSON.stringify(testResult)}`)
        setPhase('complete')
        
      } catch (error) {
        // Break down error handling into specific phases for better diagnostics
        if (String(error).includes('fetch')) {
          addLog(`Error during fetch: ${error}`)
          setPhase('error-fetch')
        } else if (String(error).includes('memory') || String(error).includes('allocation')) {
          addLog(`Memory error: ${error}`)
          setPhase('error-memory')
        } else if (String(error).includes('timeout')) {
          addLog(`Timeout error: ${error}`)
          setPhase('error-timeout')
        } else if (String(error).includes('WebGPU')) {
          addLog(`WebGPU error: ${error}`)
          setPhase('error-webgpu')
        } else {
          addLog(`Unknown error during initialization: ${error}`)
          setPhase('error-unknown')
        }
        throw error
      }
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      addLog(`❌ Error loading model: ${errorMessage}`)
      addLog(`Stack trace: ${e instanceof Error ? e.stack : 'No stack trace available'}`)
      setError(errorMessage)
    } finally {
      getMemoryStats()
      setLoading(false)
    }
  }
  
  const clearCache = async () => {
    try {
      addLog('Attempting to clear IndexedDB cache...')
      
      // List all databases
      const databases = await indexedDB.databases()
      addLog(`Found databases: ${JSON.stringify(databases)}`)
      
      // Delete webllm-related databases
      const deletePromises = databases
        .filter(db => db.name && (db.name.includes('webllm') || db.name.includes('mlc')))
        .map(db => {
          return new Promise((resolve, reject) => {
            addLog(`Deleting database: ${db.name}`)
            const request = indexedDB.deleteDatabase(db.name!)
            request.onsuccess = () => {
              addLog(`Successfully deleted database: ${db.name}`)
              resolve(true)
            }
            request.onerror = (event) => {
              addLog(`Error deleting database ${db.name}: ${JSON.stringify(event)}`)
              reject(event)
            }
          })
        })
      
      await Promise.all(deletePromises)
      addLog('Cache clearing complete!')
      
      // Also clear localStorage items related to WebLLM
      const webllmKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('webllm') || key.includes('mlc'))) {
          webllmKeys.push(key)
        }
      }
      
      webllmKeys.forEach(key => {
        localStorage.removeItem(key)
        addLog(`Removed localStorage item: ${key}`)
      })
      
    } catch (e) {
      addLog(`Error clearing cache: ${e}`)
    }
  }
  
  return (
    <div className="container mx-auto p-4 mt-16 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">WebLLM Debug Tools</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">WebGPU Status</h2>
        <div className="mb-2">
          <span className="font-medium">WebGPU Support:</span> 
          <span className={`ml-2 ${navigator.gpu ? 'text-green-600' : 'text-red-600'}`}>
            {navigator.gpu ? '✅ Supported' : '❌ Not Supported'}
          </span>
        </div>
        
        {gpuInfo && !gpuInfo.error && (
          <div className="mb-2">
            <p><span className="font-medium">GPU Vendor:</span> {gpuInfo.vendor}</p>
            <p><span className="font-medium">GPU Architecture:</span> {gpuInfo.architecture}</p>
            <p><span className="font-medium">Device:</span> {gpuInfo.device}</p>
            <p><span className="font-medium">Description:</span> {gpuInfo.description}</p>
          </div>
        )}
        
        {gpuInfo && gpuInfo.error && (
          <div className="text-red-600 mb-2">
            Error retrieving GPU info: {gpuInfo.error}
          </div>
        )}
        
        {memoryStats && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-1">Memory Stats</h3>
            {memoryStats.error ? (
              <p className="text-red-600">{memoryStats.error}</p>
            ) : memoryStats.info ? (
              <p>{memoryStats.info}</p>
            ) : (
              <div>
                <p><span className="font-medium">JS Heap Size Limit:</span> {memoryStats.jsHeapSizeLimit}</p>
                <p><span className="font-medium">Total JS Heap Size:</span> {memoryStats.totalJSHeapSize}</p>
                <p><span className="font-medium">Used JS Heap Size:</span> {memoryStats.usedJSHeapSize}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Model Loading</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Model</label>
          <select 
            className="border rounded px-2 py-1 w-full"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading}
          >
            {webLLMModels.map((model: any) => (
              <option key={model.id} value={model.id}>
                {model.name} ({(model.size / 1024 / 1024).toFixed(0)}MB)
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            className={`px-4 py-2 rounded ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            onClick={handleModelLoad}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load Model'}
          </button>
          
          <button 
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            onClick={clearCache}
            disabled={loading}
          >
            Clear Cache
          </button>
        </div>
        
        {loading && (
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm">{progress}%</span>
            </div>
            <p className="text-sm text-gray-600">Current phase: {phase}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded mb-4">
            {error}
          </div>
        )}
        
        {modelLoadTime !== null && (
          <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded mb-4">
            Model loaded successfully in {modelLoadTime} seconds!
          </div>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Debug Logs</h2>
        <div 
          ref={logRef}
          className="bg-black text-green-400 p-3 rounded h-96 overflow-y-auto font-mono text-sm"
        >
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500 italic">No logs yet</div>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-8">
        <p>This debug page helps diagnose WebLLM issues in production environments.</p>
        <p className="mt-2">
          <a href="/private-ai-chat" className="text-blue-500 hover:underline">
            Back to AI Chat
          </a>
        </p>
      </div>
    </div>
  )
} 