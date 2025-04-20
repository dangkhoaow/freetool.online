"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UploadSection from "./upload-section"
import SettingsPanel from "./settings-panel"
import ProcessingSection from "./processing-section"
import OutputSection from "./output-section"
import { zip, AsyncZippable } from "fflate" // Import AsyncZippable type

export type CompressionSettings = {
  compressionLevel: number
  password: string
  format: "zip" | "7z" | "tar"
  splitSize: number | null
  includeSubfolders: boolean
}

export type CompressionJob = {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  files: File[]
  settings: CompressionSettings
  result?: {
    downloadUrl: string
    size: number
    compressionRatio: number
  }
  error?: string
}

export default function CompressorTool() {
  const [files, setFiles] = useState<File[]>([])
  const [settings, setSettings] = useState<CompressionSettings>({
    compressionLevel: 5,
    password: "",
    format: "zip",
    splitSize: null,
    includeSubfolders: true,
  })
  const [job, setJob] = useState<CompressionJob | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    if (selectedFiles.length > 0) {
      setActiveTab("settings")
    }
  }

  const handleSettingsChange = (newSettings: Partial<CompressionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const getRelativePath = (file: File): string => {
    // Extract the relative path from the webkitRelativePath or use just the filename
    let path = '';
    
    // @ts-ignore - webkitRelativePath may not be in the File type definition
    if (file.webkitRelativePath && settings.includeSubfolders) {
      // @ts-ignore
      path = file.webkitRelativePath;
    } else {
      path = file.name;
    }
    
    return path;
  };

  const handleStartCompression = async () => {
    if (files.length === 0) return

    // Create a new job
    const newJob: CompressionJob = {
      id: `job-${Date.now()}`,
      status: "processing",
      progress: 0,
      files: files,
      settings: settings,
    }

    setJob(newJob)
    setActiveTab("processing")

    try {
      // Prepare files for fflate zip format
      const zipFiles: AsyncZippable = {}
      
      // Set up progress tracking
      let totalSize = files.reduce((acc, file) => acc + file.size, 0)
      let processedSize = 0
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Get proper path to preserve folder structure
        const filePath = getRelativePath(file)
        
        // Add to zip files object
        zipFiles[filePath] = [uint8Array, {
          level: settings.compressionLevel as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        }]
        
        // Update progress based on files processed
        processedSize += file.size
        const progress = Math.min(50, Math.floor((processedSize / totalSize) * 50))
        setJob(prev => prev ? { ...prev, progress } : null)
      }

      // Use fflate to compress files in browser
      zip(zipFiles, {
        // Global compression options
        level: settings.compressionLevel as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        // TODO: Password implementation would go here
      }, (err, data) => {
        if (err) {
          // Handle compression error
          setJob(prev => prev ? { ...prev, status: "failed", error: err.message } : null)
          return
        }
        
        // Create download URL
        const blob = new Blob([data], { type: 'application/zip' })
        const downloadUrl = URL.createObjectURL(blob)
        
        // Calculate size and ratio
        const originalSize = files.reduce((acc, file) => acc + file.size, 0)
        const compressedSize = data.length
        const compressionRatio = compressedSize / originalSize
        
        // Update job with success result
        setJob(prev => prev ? {
          ...prev,
          status: "completed",
          progress: 100,
          result: {
            downloadUrl,
            size: compressedSize,
            compressionRatio,
          }
        } : null)
      })
      
      // Simulate progress for compression phase (50-90%)
      const interval = setInterval(() => {
        setJob((prev) => {
          if (!prev || prev.status !== "processing" || prev.progress >= 90) {
            clearInterval(interval)
            return prev
          }

          return { ...prev, progress: prev.progress + 2 }
        })
      }, 300)
      
    } catch (error) {
      setJob(prev => prev ? {
        ...prev,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      } : null)
    }
  }

  const handleReset = () => {
    if (job?.result?.downloadUrl) {
      URL.revokeObjectURL(job.result.downloadUrl)
    }
    setFiles([])
    setJob(null)
    setActiveTab("upload")
  }

  return (
    <Card className="p-6 mb-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="settings" disabled={files.length === 0}>
            Compression Settings
          </TabsTrigger>
          <TabsTrigger value="processing" disabled={!job}>
            Compression Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <UploadSection onFilesSelected={handleFilesSelected} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onStartCompression={handleStartCompression}
            files={files}
          />
        </TabsContent>

        <TabsContent value="processing">
          {job && job.status === "completed" ? (
            <OutputSection job={job} onReset={handleReset} />
          ) : (
            <ProcessingSection job={job} />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
