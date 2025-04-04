"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileType, AlertCircle, X, ArrowLeft } from "lucide-react"

interface UploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  settings: {
    outputFormat: string;
    fps: number;
  };
  onContinue: () => void;
  disabled: boolean;
  setActiveTab: (tab: string) => void;
}

export default function UploadSection({ 
  file, 
  setFile, 
  settings, 
  onContinue, 
  disabled, 
  setActiveTab 
}: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    processFile(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      processFile(selectedFile)
    }
  }

  const processFile = (newFile: File) => {
    setError(null)

    // Check file type
    const validTypes = ['image/gif', 'video/mp4', 'video/quicktime']
    const fileType = newFile.type.toLowerCase()
    
    // Also check file extension for better support
    const fileExt = newFile.name.split('.').pop()?.toLowerCase()
    const validExts = ['gif', 'mp4', 'mov']
    
    if (!validTypes.includes(fileType) && !validExts.some(ext => ext === fileExt)) {
      setError("Please select a GIF, MP4, or MOV file.")
      return
    }

    // Check file size (limit to 100MB)
    if (newFile.size > 100 * 1024 * 1024) {
      setError("File size exceeds the 100MB limit.")
      return
    }

    setFile(newFile)
  }

  const clearFile = () => {
    setFile(null)
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Upload Media File</h3>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Drag & drop your file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".gif,.mp4,.mov,image/gif,video/mp4,video/quicktime"
              onChange={handleFileChange}
              disabled={disabled}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild disabled={disabled}>
                <span>Browse Files</span>
              </Button>
            </label>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Maximum file size: 100MB</p>
              <p>Supported formats: GIF, MP4, MOV</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded">
                  <FileType className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Unknown format"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} disabled={disabled}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded border">
              <h4 className="font-medium mb-2">Selected Conversion Options:</h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-36">Output Format:</span>
                  <span className="font-medium">
                    {settings.outputFormat.toUpperCase()}
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-36">Frame Rate:</span>
                  <span className="font-medium">
                    {settings.fps} FPS
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-36">Estimated Frames:</span>
                  <span className="font-medium">
                    ~{Math.floor((file.size / 1024) * (settings.fps / 24))} frames
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("settings")} 
              className="md:w-1/3"
              disabled={disabled}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
            <Button 
              className="md:w-2/3" 
              onClick={onContinue} 
              disabled={disabled || !file}
            >
              Extract Frames
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
