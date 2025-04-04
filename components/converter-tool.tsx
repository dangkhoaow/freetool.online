"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UploadSection from "@/components/upload-section"
import SettingsPanel from "@/components/settings-panel"
import ProcessingSection from "@/components/processing-section"
import OutputGallery from "@/components/output-gallery"

export default function ConverterTool() {
  // State for managing the conversion flow
  const [files, setFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("settings")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)

  // Settings state
  const [settings, setSettings] = useState({
    outputFormat: "jpg",
    quality: 85,
    aiOptimization: true,
    aiIntensity: "medium",
    preserveExif: true,
    resizeOption: "original",
    customWidth: 1920,
    customHeight: 1080,
    watermark: {
      enabled: false,
      text: "© Copyright",
      position: "bottom-right",
      opacity: 30,
    },
    pdfOptions: {
      pageSize: "a4",
      orientation: "portrait",
    },
  })

  // Handle starting the conversion process
  const handleStartConversion = () => {
    setIsProcessing(true)
    setActiveTab("processing")

    // Simulate conversion process
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setIsProcessing(false)
        setIsComplete(true)
        setActiveTab("output")
      }
    }, 300)
  }

  // Reset the tool to initial state
  const handleReset = () => {
    setFiles([])
    setActiveTab("settings")
    setIsProcessing(false)
    setIsComplete(false)
    setProgress(0)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">HEIC Converter Tool</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="settings" disabled={isProcessing}>
              1. Settings
            </TabsTrigger>
            <TabsTrigger value="upload" disabled={isProcessing}>
              2. Upload Files
            </TabsTrigger>
            <TabsTrigger value="output" disabled={!isComplete}>
              3. Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadSection
              files={files}
              setFiles={setFiles}
              onContinue={() => handleStartConversion()}
              disabled={isProcessing}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              onStartConversion={handleStartConversion}
              disabled={isProcessing}
              files={files}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="processing">
            <ProcessingSection files={files} settings={settings} progress={progress} />
          </TabsContent>

          <TabsContent value="output">
            <OutputGallery files={files} settings={settings} onReset={handleReset} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

