"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText, BarChart, Upload, Download, LoaderIcon, Shield, AlertCircle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWebLLM } from "@/lib/services/webllm/webllm-provider"
import { WebLLMModel } from "@/lib/services/webllm/config"
import Chart from 'chart.js/auto'
import { DataProcessor } from "@/lib/services/data-visualization/data-processor"
import { FileDropzone } from "@/components/ui/file-dropzone"
import { Progress } from "@/components/ui/progress"
import { StorageService } from "@/lib/storage"

// Chart types and their configurations
const CHART_TYPES = [
  { id: "bar", name: "Bar Chart", icon: "📊" },
  { id: "line", name: "Line Chart", icon: "📈" },
  { id: "pie", name: "Pie Chart", icon: "🥧" },
  { id: "doughnut", name: "Doughnut Chart", icon: "🍩" },
  { id: "polarArea", name: "Polar Area", icon: "⭕" },
  { id: "radar", name: "Radar Chart", icon: "🔄" },
  { id: "scatter", name: "Scatter Plot", icon: "⚫" },
  { id: "bubble", name: "Bubble Chart", icon: "🫧" },
  { id: "stackedBar", name: "Stacked Bar", icon: "🧱" },
];

// Sample data templates
const SAMPLE_DATA_TEMPLATES = [
  { 
    id: "salesData", 
    name: "Monthly Sales", 
    data: "Month,Sales\nJan,1200\nFeb,1900\nMar,1500\nApr,2100\nMay,2400\nJun,1800\nJul,2300\nAug,2100\nSep,1900\nOct,2500\nNov,2200\nDec,2800" 
  },
  { 
    id: "compareProducts", 
    name: "Product Comparison", 
    data: "Product,Units Sold,Revenue\nProduct A,250,12500\nProduct B,150,7500\nProduct C,350,17500\nProduct D,200,10000\nProduct E,300,15000" 
  },
  { 
    id: "expenses", 
    name: "Expense Categories", 
    data: "Category,Amount\nHousing,1200\nFood,600\nTransportation,300\nHealthcare,400\nEntertainment,200\nUtilities,250\nOther,150" 
  },
];

// Storage keys
const STORAGE_KEYS = {
  RECENT_CHARTS: "ai_data_visualization_recent_charts",
  USER_DATA: "ai_data_visualization_user_data",
  CHART_SETTINGS: "ai_data_visualization_settings",
};

interface VisualizationData {
  id: string;
  name: string;
  chartType: string;
  data: string;
  chartConfig: any;
  timestamp: number;
}

function groupVisualizationsByDate(visualizations: VisualizationData[]) {
  const groupedVisualizations: { [date: string]: VisualizationData[] } = {};
  visualizations.forEach((visualization) => {
    const date = new Date(visualization.timestamp).toLocaleDateString();
    if (!groupedVisualizations[date]) {
      groupedVisualizations[date] = [];
    }
    groupedVisualizations[date].push(visualization);
  });
  return groupedVisualizations;
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

export default function DataVisualizationTool() {
  // State for data input
  const [inputData, setInputData] = useState<string>("")
  const [chartType, setChartType] = useState<string>("bar")
  const [chartTitle, setChartTitle] = useState<string>("My Chart")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [loadingState, setLoadingState] = useState<string>("")
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [recentVisualizations, setRecentVisualizations] = useState<VisualizationData[]>([])
  const [currentTab, setCurrentTab] = useState<string>("input")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [pendingChartConfig, setPendingChartConfig] = useState<any | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [chartRenderError, setChartRenderError] = useState<string | null>(null);
  const pushDebugLog = (msg: string) => {
    setDebugLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    console.log('[Visualization Debug]', msg);
  };
  
  // Chart refs
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [chartReady, setChartReady] = useState(false)
  
  // Callback ref to track when canvas is mounted
  const setChartRef = useCallback((node: HTMLCanvasElement | null) => {
    chartRef.current = node
    if (node) {
      setChartReady(true)
    }
  }, [])
  
  // Services
  const { toast } = useToast()
  const {
    loadModel,
    isModelLoaded,
    loadingProgress: modelLoadingProgress,
    loadingState: providerLoadingState,
    availableModels: providerAvailableModels,
    error: providerError,
    logs,
    supportsWebGPU,
    llmService,
    selectedModelId,
  } = useWebLLM()
  const dataProcessor = useRef<DataProcessor | null>(null)
  const storageService = useRef<StorageService | null>(null)
  
  // --- MODEL SELECTION AND LOADING (WebLLM Provider Pattern) ---
  // Use providerAvailableModels for dropdown
  // Use loadModel(modelId, progressCallback) for loading/init
  // Use isModelLoaded, isModelLoading, loadingProgress, loadingState, error from provider for UI state

  // Only set modelId if not already set and providerAvailableModels is available
  useEffect(() => {
    if (!selectedModelId && providerAvailableModels.length > 0) {
      // If the provider does not have a selected model, pick the first
      loadModel(providerAvailableModels[0].id)
    }
  }, [providerAvailableModels, selectedModelId, loadModel])

  // Load the model when selectedModelId changes (using provider's loadModel)
  useEffect(() => {
    if (!selectedModelId || !loadModel) return
    // Prevent infinite loop: only load if not loaded
    if (isModelLoaded) return
    setLoadingState('Loading AI model...')
    loadModel(selectedModelId, (progress: number, state?: string) => {
      setLoadingProgress(progress)
      if (state) {
        setLoadingState(state)
      }
    })
      .then(() => {
        toast({
          title: "AI Model Loaded",
          description: "The AI model is ready to analyze your data.",
        })
      })
      .catch((e) => {
        console.error("Failed to load AI model:", e)
        setError("Failed to load AI model. Please try again or choose a different model.")
        toast({
          variant: "destructive",
          title: "Model Loading Failed",
          description: "Could not load the AI model. Please try again.",
        })
      })
  }, [selectedModelId, loadModel, isModelLoaded])

  // Always derive modelLoadingComplete from provider state
  const modelLoadingComplete = isModelLoaded

  // Debug logging for dropdown state
  useEffect(() => {
    console.log('[AI Model Dropdown Debug]', {
      providerAvailableModels,
      supportsWebGPU,
      providerLoadingState,
      selectedModelId,
      isModelLoaded,
      loadingProgress,
      error,
      llmService,
    });
  }, [providerAvailableModels, supportsWebGPU, providerLoadingState, selectedModelId, isModelLoaded, loadingProgress, error, llmService])

  // --- GENERATE VISUALIZATION (LLM USAGE) ---
  const generateVisualization = async () => {
    if (!inputData.trim()) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please input some data first.",
      })
      return
    }
    if (!isModelLoaded || !llmService) {
      toast({
        variant: "destructive",
        title: "AI Model Not Ready",
        description: "Please wait for the AI model to load completely.",
      })
      return
    }
    setIsProcessing(true)
    setProcessingStatus("Analyzing data...")
    setError(null)
    try {
      if (!dataProcessor.current) return
      setProcessingStatus("AI analyzing data structure...")
      pushDebugLog(`Prompt sent to AI (llmService): ${JSON.stringify({ inputData, chartType })}`)
      // Pass llmService to processor so it can call the model
      const structuredData = await dataProcessor.current.processDataWithLLM(
        inputData,
        chartType,
        llmService
      )
      pushDebugLog(`AI response (structuredData): ${JSON.stringify(structuredData)}`)
      setProcessingStatus("Generating chart configuration...")
      const chartConfig = await dataProcessor.current.generateChartConfig(
        structuredData,
        chartType,
        chartTitle
      )
      pushDebugLog(`Chart config before rendering: ${JSON.stringify(chartConfig)}`)
      setCurrentTab("chart");
      setPendingChartConfig(chartConfig);
      const newVisualization: VisualizationData = {
        id: Date.now().toString(),
        name: chartTitle,
        chartType,
        data: inputData,
        chartConfig,
        timestamp: Date.now()
      }
      const updatedVisualizations = [newVisualization, ...recentVisualizations].slice(0, 10)
      setRecentVisualizations(updatedVisualizations)
      storageService.current?.save(STORAGE_KEYS.RECENT_CHARTS.replace('ai_data_visualization_', ''), updatedVisualizations)
      const settings = storageService.current?.load<{
        chartType?: string
      }>(STORAGE_KEYS.CHART_SETTINGS.replace('ai_data_visualization_', ''), {})
      if (settings) {
        settings.chartType = chartType
        storageService.current?.save(STORAGE_KEYS.CHART_SETTINGS.replace('ai_data_visualization_', ''), settings)
      }
      toast({
        title: "Visualization Created",
        description: "Your data has been visualized successfully.",
      })
    } catch (e) {
      pushDebugLog(`Error generating visualization: ${e instanceof Error ? e.stack : JSON.stringify(e)}`)
      console.error("Error generating visualization:", e)
      setError("Failed to generate visualization. Please check your data format and try again.")
      toast({
        variant: "destructive",
        title: "Visualization Failed",
        description: "Could not generate the visualization. Please check your data.",
      })
    } finally {
      setIsProcessing(false)
    }
  }
  // --- END GENERATE VISUALIZATION ---

  // Initialize services
  useEffect(() => {
    // Initialize data processor
    dataProcessor.current = new DataProcessor()
    
    // Initialize storage service
    storageService.current = new StorageService("ai_data_visualization")
    
    // Load saved charts
    try {
      const savedCharts = storageService.current.load<VisualizationData[]>(
        STORAGE_KEYS.RECENT_CHARTS.replace('ai_data_visualization_', ''), 
        []
      )
      if (savedCharts && savedCharts.length > 0) {
        setRecentVisualizations(savedCharts)
      }
      
      // Load saved settings
      const savedSettings = storageService.current.load<{
        chartType?: string
      }>(STORAGE_KEYS.CHART_SETTINGS.replace('ai_data_visualization_', ''), {})
      
      if (savedSettings.chartType) setChartType(savedSettings.chartType)
    } catch (e) {
      console.error("Failed to load saved settings:", e)
    }
    
    return () => {
      // Cleanup chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [])

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0]
    setIsProcessing(true)
    setProcessingStatus("Reading file...")
    
    try {
      // Process based on file type
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const text = await file.text()
        setInputData(text)
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
        file.name.endsWith(".xlsx") ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xls")
      ) {
        if (!dataProcessor.current) return
        
        setProcessingStatus("Processing Excel file...")
        const data = await dataProcessor.current.processExcelFile(file)
        setInputData(data)
      } else {
        // Try to parse as plain text
        const text = await file.text()
        setInputData(text)
      }
      
      setIsProcessing(false)
      toast({
        title: "File Loaded",
        description: "Your data has been loaded successfully.",
      })
    } catch (e) {
      console.error("Error processing file:", e)
      setError("Failed to process the file. Please check the format and try again.")
      setIsProcessing(false)
      
      toast({
        variant: "destructive",
        title: "File Processing Failed",
        description: "Could not process the uploaded file. Please check its format.",
      })
    }
  }
  
  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = SAMPLE_DATA_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setInputData(template.data)
      setSelectedTemplate(templateId)
      
      toast({
        title: "Template Applied",
        description: `Using the ${template.name} data template.`,
      })
    }
  }
  
  // Export the chart as PNG
  const exportChart = () => {
    if (!chartRef.current) return
    
    const link = document.createElement('a')
    link.download = `${chartTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`
    link.href = chartRef.current.toDataURL('image/png')
    link.click()
    
    toast({
      title: "Chart Exported",
      description: "Your chart has been downloaded as a PNG file.",
    })
  }
  
  // Load a saved visualization
  const loadVisualization = (visualization: VisualizationData) => {
    // Set the input data and configuration
    setInputData(visualization.data)
    setChartType(visualization.chartType)
    setChartTitle(visualization.name)
    
    // Destroy any existing chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }
    
    // Set the pending chart config to trigger our chart rendering flow
    setPendingChartConfig(visualization.chartConfig)
    
    // Switch to the chart view
    setCurrentTab("chart")
    
    toast({
      title: "Visualization Loaded",
      description: `Loaded visualization: ${visualization.name}`,
    })
  }
  
  // Delete a saved visualization
  const deleteVisualization = (id: string, e: React.MouseEvent) => {
    // Stop event from bubbling and triggering the card click
    e.stopPropagation();
    
    // Remove the chart from recent visualizations
    const updatedVisualizations = recentVisualizations.filter(viz => viz.id !== id);
    setRecentVisualizations(updatedVisualizations);
    
    // Update localStorage
    storageService.current?.save(STORAGE_KEYS.RECENT_CHARTS.replace('ai_data_visualization_', ''), updatedVisualizations);
    
    toast({
      title: "Chart Deleted",
      description: "The chart has been removed from your saved items.",
    });
  }
  
  // Chart rendering effect render counter
  const chartRenderCount = useRef(0);
  
  useEffect(() => {
    chartRenderCount.current++;
    
    // Only log on first render of this configuration
    if (chartRenderCount.current === 1) {
      console.log('[Chart Render] useEffect triggered. currentTab=' + currentTab + 
        ", pendingChartConfig=" + (pendingChartConfig ? 'present' : 'null') + 
        ", chartReady=" + chartReady);
    }
    
    if (currentTab === "chart" && pendingChartConfig && chartReady) {
      console.log(`[Chart Render] Starting chart render process...`);
      
      // Ensure we're using a clean canvas each time to prevent Chart.js issues
      // Destroy any existing chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
        console.log(`[Chart Render] Destroyed previous chart instance.`);
      }
      
      // Use requestAnimationFrame to ensure the DOM has updated before rendering the chart
      window.requestAnimationFrame(() => {
        const canvas = chartRef.current;
        if (!canvas) {
          console.log(`[Chart Render] ERROR: Canvas ref is null despite chartReady being true`);
          return;
        }
        
        console.log(`[Chart Render] Canvas element: width=${canvas.width}, height=${canvas.height}`);
        // Force canvas dimensions to ensure visibility
        canvas.width = canvas.offsetWidth || 800;
        canvas.height = canvas.offsetHeight || 400;
        
        const ctx = canvas.getContext('2d');
        console.log(`[Chart Render] CanvasRenderingContext2D type: ${ctx && ctx.constructor && ctx.constructor.name}`);
        if (!ctx) {
          console.log(`[Chart Render] CRITICAL: Canvas context is null. Chart cannot be rendered.`);
          return;
        }
        
        try {
          console.log(`[Chart Render] Chart.js version: ${Chart.version}`);
          console.log(`[Chart Render] Full chart config: ${JSON.stringify(pendingChartConfig)}`);
          
          // Check for empty data
          const datasets = pendingChartConfig?.data?.datasets || [];
          const labels = pendingChartConfig?.data?.labels || [];
          if (!datasets.length || !labels.length) {
            console.log('[Chart Render] Warning: Chart config has empty datasets or labels. Chart will be blank.');
          }
          
          // Additional logs for dataset structure and types
          console.log(`[Chart Render] Datasets type: ${Array.isArray(datasets) ? 'array' : typeof datasets}`);
          console.log(`[Chart Render] Labels type: ${Array.isArray(labels) ? 'array' : typeof labels}`);
          console.log(`[Chart Render] Datasets: ${JSON.stringify(datasets)}`);
          console.log(`[Chart Render] Labels: ${JSON.stringify(labels)}`);
          
          // Check if dataset.data matches labels length
          if (datasets.length > 0 && datasets[0].data && datasets[0].data.length !== labels.length) {
            console.log(`[Chart Render] ERROR: dataset.data length (${datasets[0].data.length}) does not match labels length (${labels.length}).`);
          }
          
          // Check for canvas visibility
          const computedStyle = window.getComputedStyle(canvas);
          console.log(`[Chart Render] Canvas display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity}`);
          
          // Check parent container size
          if (canvas.parentElement) {
            const parentRect = canvas.parentElement.getBoundingClientRect();
            console.log(`[Chart Render] Canvas parent size: width=${parentRect.width}, height=${parentRect.height}`);
          }
          
          // Create a fresh chart instance with explicit animation setting
          console.log(`[Chart Render] Creating Chart.js instance...`);
          
          // Create the chart with enhanced error handling
          chartInstance.current = new Chart(ctx, pendingChartConfig);
          console.log(`[Chart Render] Chart instance created. Type: ${chartInstance.current?.constructor?.name}`);
          console.log(`[Chart Render] Chart instance config: ${JSON.stringify(chartInstance.current?.config?.data)}`);
          
          // Force an immediate update
          chartInstance.current.update();
          console.log('[Chart Render] Called chartInstance.current.update().');
          
          // Re-enable animations after initial render
          setTimeout(() => {
            if (chartInstance.current) {
              chartInstance.current.options.animation = {
                duration: 1000
              };
              console.log('[Chart Render] Re-enabled animations after initial render');
            }
          }, 100);
          
          // Check canvas state after rendering
          try {
            const dataUrl = canvas.toDataURL();
            console.log(`[Chart Render] Canvas toDataURL length: ${dataUrl.length}`);
          } catch (err) {
            console.log(`[Chart Render] Error reading canvas toDataURL: ${err instanceof Error ? err.stack : JSON.stringify(err)}`);
          }
          
          // Clear the pending config since we've processed it
          setPendingChartConfig(null);
        } catch (err) {
          console.log(`[Chart Render] Chart.js error: ${err instanceof Error ? err.stack : JSON.stringify(err)}`);
          setChartRenderError(`Failed to render chart: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
    }
    
    // Cleanup function - only destroy if we're changing tabs or configurations
    return () => {
      // Only destroy the chart instance if we're unmounting or changing tabs
      // This prevents the chart from being destroyed by React StrictMode's double invocation
      const isTabChange = currentTab !== "chart";
      
      // Only consider it a new config if we have a NEW pending config that's different
      // from what we just processed (we've already set pendingChartConfig to null above)
      const isNewConfigComing = pendingChartConfig !== null && pendingChartConfig !== undefined;
      
      if (chartInstance.current && isTabChange) {
        chartInstance.current.destroy();
        console.log('[Chart Render] Cleanup: Chart instance destroyed by effect cleanup. Reason: Tab change');
      }
    };
  }, [currentTab, pendingChartConfig, chartReady]);

  // Suggest disabling React Strict Mode if double invocation is detected
  useEffect(() => {
    if (debugLogs.filter(log => log.includes('Cleanup: Chart instance destroyed by effect cleanup')).length > 1) {
      console.log('[Chart Render] NOTICE: Detected multiple effect cleanups. You may be running in React Strict Mode, which can cause charts to disappear in development. Try disabling StrictMode in _app.tsx or root layout for testing.');
    }
  }, [debugLogs]);

  useEffect(() => {
    if (debugLogs.some(log => log.includes('Chart.js error'))) {
      setChartRenderError('Chart.js failed to render your chart. Please check your data or try a different chart type.');
    } else if (debugLogs.some(log => log.includes('Warning: Chart config has empty datasets or labels'))) {
      setChartRenderError('The chart data is empty. Please check your input or try another dataset.');
    } else {
      setChartRenderError(null);
    }
  }, [debugLogs]);

  return (
    <Card className="w-full bg-white dark:bg-gray-900 shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">AI Data Visualization Tool</CardTitle>
            <CardDescription>
              Transform your data into beautiful charts with 100% local AI processing
            </CardDescription>
          </div>
          <div className="flex items-center bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-full">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              100% Private - Data Never Leaves Your Device
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Model Loading Progress */}
        {!modelLoadingComplete && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center mb-2">
              <LoaderIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin mr-2" />
              <h3 className="font-medium text-blue-700 dark:text-blue-300">
                {loadingState || providerLoadingState || "Loading..."}
              </h3>
            </div>
            <Progress value={loadingProgress || modelLoadingProgress} className="h-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading the AI model locally for private data analysis. This may take a moment depending on your device.
            </p>
            {/* Show provider errors */}
            {providerError && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                {providerError}
              </div>
            )}
            {/* Show if no models found or WebGPU not supported */}
            {!supportsWebGPU && (
              <div className="mt-2 text-sm text-red-700 dark:text-red-400 font-semibold">
                WebGPU is not supported in your browser/device. Please use a compatible browser (latest Chrome, Edge, or Safari with WebGPU enabled).
              </div>
            )}
            {Array.isArray(providerAvailableModels) && providerAvailableModels.length === 0 && (
              <div className="mt-2 text-sm text-red-700 dark:text-red-400 font-semibold">
                No AI models found. Please check your configuration or refresh the page.
              </div>
            )}
            {/* Log area */}
            <details className="mt-4 bg-gray-100 dark:bg-gray-900 rounded p-2 text-xs max-h-40 overflow-y-auto" open>
              <summary className="cursor-pointer text-blue-700 dark:text-blue-300 font-semibold">Debug Logs</summary>
              <div className="whitespace-pre-line">
                {logs && logs.length > 0 ? logs.map((log, i) => <div key={i}>{log}</div>) : <div>No logs yet.</div>}
              </div>
            </details>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="input">Data Input</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="recent">Recent Charts</TabsTrigger>
          </TabsList>
          
          {/* Data Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Data Input Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-data">Enter Your Data (CSV, Text, or JSON)</Label>
                  <Textarea
                    id="input-data"
                    placeholder="Paste your data here, e.g., CSV with headers or JSON..."
                    className="min-h-[200px] font-mono"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="pt-4">
                  <Label className="mb-2 block">Or Upload a File</Label>
                  <FileDropzone
                    onDrop={handleFileUpload}
                    accept={{
                      'text/csv': ['.csv'],
                      'application/vnd.ms-excel': ['.xls'],
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                      'text/plain': ['.txt'],
                      'application/json': ['.json']
                    }}
                    disabled={isProcessing}
                    className="mt-4"
                  />
                </div>
                
                <div className="pt-4">
                  <Label className="mb-2 block">Or Use a Template</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_DATA_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        className={`justify-start ${
                          selectedTemplate === template.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                        disabled={isProcessing}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Chart Settings Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chart-title">Chart Title</Label>
                  <Input
                    id="chart-title"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Enter chart title"
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chart-type">Chart Type</Label>
                  <Select value={chartType} onValueChange={setChartType} disabled={isProcessing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <span className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            {type.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Ai Model</Label>
                  <div className="mb-4">
                    <Select
                      value={selectedModelId}
                      onValueChange={value => loadModel(value)}
                      disabled={!supportsWebGPU || !providerAvailableModels || providerAvailableModels.length === 0 || providerLoadingState === 'loading'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        {providerAvailableModels && providerAvailableModels.length > 0 && (
                          providerAvailableModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name || model.id}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {(!providerAvailableModels || providerAvailableModels.length === 0) && (
                      <div className="text-xs text-red-600 dark:text-red-400 mb-2">No models found. Please check your setup.</div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      All analysis is performed locally on your device
                    </p>
                  </div>
                </div>
                
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={generateVisualization}
                  disabled={isProcessing || !inputData.trim() || !modelLoadingComplete}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {processingStatus}
                    </>
                  ) : (
                    <>
                      <BarChart className="h-4 w-4 mr-2" />
                      Generate Visualization
                    </>
                  )}
                </Button>
                {(providerLoadingState || loadingState) && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {logs && logs.length > 0 && logs[logs.length - 1]}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Chart View Tab */}
          <TabsContent value="chart" className="space-y-6">
            <div className="w-full min-h-[400px] flex flex-col items-center justify-center border rounded-lg bg-white dark:bg-gray-900 p-4" id="chart-container-debug" style={{overflow: 'visible', position: 'relative'}}>
              <canvas
                ref={setChartRef}
                width={800}
                height={400}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 400, 
                  background: '#fff', 
                  border: '1px solid #e5e7eb', 
                  display: 'block',
                  position: 'relative',
                  zIndex: 5 
                }}
              />
              {/* Fallback message if chart is not rendered */}
              {(!pendingChartConfig && !chartInstance.current) && (
                <div className="text-gray-400 text-center mt-8">No chart to display yet. Generate a visualization to see the chart here.</div>
              )}
              {/* Chart render error message */}
              {chartRenderError && (
                <div className="text-red-600 text-xs text-center mt-4">{chartRenderError}</div>
              )}
            </div>
          </TabsContent>
          
          {/* Recent Visualizations Tab */}
          <TabsContent value="recent" className="space-y-4">
            {recentVisualizations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium">No saved visualizations yet</h3>
                <p>Your recent charts will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group visualizations by date */}
                {Object.entries(groupVisualizationsByDate(recentVisualizations)).map(([date, visualizations]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-1">{date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visualizations.map((viz) => (
                        <Card 
                          key={viz.id} 
                          className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                          onClick={() => loadVisualization(viz)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base mr-2">{viz.name}</CardTitle>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full" 
                                onClick={(e) => deleteVisualization(viz.id, e)}
                              >
                                <span className="sr-only">Delete</span>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>
                              {CHART_TYPES.find((t) => t.id === viz.chartType)?.name || viz.chartType}
                              {" • "}{formatTime(viz.timestamp)}
                            </CardDescription>
                          </CardHeader>
                          <div className="h-32 bg-gray-50 dark:bg-gray-800 px-4 flex items-center justify-center border-t">
                            <div className="text-3xl">
                              {CHART_TYPES.find((t) => t.id === viz.chartType)?.icon || "📊"}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
