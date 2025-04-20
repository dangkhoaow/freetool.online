"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import UploadSection from "./upload-section"
import SettingsPanel from "./settings-panel"
import BrowserProcessingSection from "./browser-processing-section"
import BrowserOutputGallery from "./browser-output-gallery"
import { useGifBrowserProcessor } from "@/hooks/use-gif-browser-processor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { GifProcessingSettings } from "@/lib/gif-browser/gif-processor"

export default function BrowserConverterTool() {
  // State for managing the conversion flow
  const [files, setFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("settings")
  const { toast } = useToast()

  // Settings state
  const [settings, setSettings] = useState<GifProcessingSettings>({
    outputFormat: "png",
    quality: 90,
    extractionMode: "all",
    frameInterval: 5,
    specificFrames: "",
    resizeOption: "original",
    customWidth: 1920,
    customHeight: 1080,
    includeTimestamp: true,
    optimizeOutput: true,
  })

  // Use the browser processor hook
  const {
    isProcessing,
    isComplete,
    progress,
    error,
    processedFiles,
    processGifs,
    reset
  } = useGifBrowserProcessor()

  // Start the conversion process
  const handleStartConversion = async () => {
    setActiveTab("processing")
    
    try {
      await processGifs(files, settings);
      
      // Move to output tab when done
      setActiveTab("output")
      
      // Display toast message
      const fileCount = files.length;
      const completedCount = Array.from(processedFiles.values()).filter(frames => frames.length > 0).length;
      
      if (completedCount === fileCount) {
        toast({
          title: "Conversion Complete",
          description: `${fileCount} GIF${fileCount !== 1 ? 's' : ''} successfully converted to frames.`,
          variant: "default",
        })
      } else if (completedCount > 0) {
        toast({
          title: "Partial Conversion",
          description: `${completedCount} of ${fileCount} GIFs successfully converted.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Conversion Failed",
          description: "Failed to convert any GIFs. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Conversion Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Reset the converter
  const handleReset = () => {
    setFiles([])
    setActiveTab("settings")
    reset()
  }

  return (
    <div className="grid gap-8">
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">GIF to Frames Converter <span className="text-sm font-normal text-green-600 ml-2">(Browser-based)</span></h2>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p>
              <strong>Browser-based processing:</strong> All conversion happens in your browser - no files are sent to a server. 
              This enhances privacy but may be slower for large GIFs.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="settings" disabled={isProcessing}>Settings</TabsTrigger>
              <TabsTrigger value="upload" disabled={isProcessing}>Upload</TabsTrigger>
              <TabsTrigger value="processing" disabled={!isProcessing}>Processing</TabsTrigger>
              <TabsTrigger value="output" disabled={!isComplete}>Output</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-8">
              <SettingsPanel
                settings={settings}
                setSettings={setSettings}
                onStartConversion={() => setActiveTab("upload")}
                disabled={isProcessing}
                files={files}
                setActiveTab={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-8">
              <UploadSection
                files={files}
                setFiles={setFiles}
                onContinue={handleStartConversion}
                disabled={isProcessing}
                setActiveTab={setActiveTab}
              />
            </TabsContent>
            
            <TabsContent value="processing">
              <BrowserProcessingSection 
                progress={progress.percentage} 
                currentFile={files.length > 0 ? files[Math.min(Math.floor(progress.current / 100), files.length - 1)].name : ""}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="output">
              <BrowserOutputGallery
                files={files}
                settings={settings}
                onReset={handleReset}
                processedFiles={processedFiles}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 