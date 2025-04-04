"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SettingsPanel from "./settings-panel"
import UploadSection from "./upload-section"
import ProcessingSection from "./processing-section"
import FramesGallery from "./frames-gallery"

export default function FrameConverter() {
  // State for managing the conversion flow
  const [file, setFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("settings")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedFrames, setExtractedFrames] = useState<string[]>([])

  // Settings state
  const [settings, setSettings] = useState({
    outputFormat: "png",
    fps: 24,
  })

  // Handle starting the extraction process
  const handleStartExtraction = () => {
    if (!file) return;
    
    setIsProcessing(true)
    setActiveTab("processing")
    
    // Simulate frame extraction process
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 4
      setProgress(currentProgress)
      
      // Generate dummy frames based on FPS
      if (currentProgress >= 100) {
        clearInterval(interval)
        
        // Create simulated frames (in a real implementation, these would be actual extracted frames)
        const frameCount = Math.floor((file.size / 1024) * (settings.fps / 24)) 
        const frames = Array.from({ length: Math.min(frameCount, 30) }, (_, i) => 
          `https://placehold.co/800x600/${getRandomColor()}/white?text=Frame+${i+1}`
        );
        
        setExtractedFrames(frames)
        setIsProcessing(false)
        setIsComplete(true)
        setActiveTab("frames")
      }
    }, 150)
  }
  
  // Helper function to generate random colors for demo frames
  const getRandomColor = () => {
    const colors = ['3B82F6', '8B5CF6', 'EC4899', 'EF4444', '10B981', 'F59E0B', '6366F1'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Reset the tool to initial state
  const handleReset = () => {
    setFile(null)
    setActiveTab("settings")
    setIsProcessing(false)
    setIsComplete(false)
    setProgress(0)
    setExtractedFrames([])
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">GIF to Frames Converter</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="settings" disabled={isProcessing}>
              1. Settings
            </TabsTrigger>
            <TabsTrigger value="upload" disabled={isProcessing}>
              2. Upload File
            </TabsTrigger>
            <TabsTrigger value="frames" disabled={!isComplete}>
              3. Extracted Frames
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              file={file}
              setActiveTab={setActiveTab}
              disabled={isProcessing}
            />
          </TabsContent>

          <TabsContent value="upload">
            <UploadSection
              file={file}
              setFile={setFile}
              settings={settings}
              onContinue={handleStartExtraction}
              disabled={isProcessing}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="processing">
            <ProcessingSection
              file={file}
              settings={settings}
              progress={progress}
            />
          </TabsContent>

          <TabsContent value="frames">
            <FramesGallery
              frames={extractedFrames}
              settings={settings}
              fileName={file?.name || ""}
              onReset={handleReset}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
