"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileType, AlertCircle, X, ArrowLeft } from "lucide-react"
import { getHeicConverterService } from "@/lib/services/heic-converter-service"

interface UploadSectionProps {
  files: File[]
  setFiles: (files: File[]) => void
  onContinue: () => void
  disabled: boolean
  setActiveTab: (tab: string) => void
}

export default function UploadSection({ files, setFiles, onContinue, disabled, setActiveTab }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxFiles, setMaxFiles] = useState<number>(15) // Default value
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(100) // Default value
  const converterService = getHeicConverterService()

  // Fetch max files limit on component mount
  useEffect(() => {
    // Access the converter service
    converterService
      .getMaxFilesLimit()
      .then((limit) => {
        setMaxFiles(limit)
        console.log(`Max files limit set to: ${limit}`)
      })
      .catch((error) => {
        console.error("Failed to fetch max files limit:", error)
        // Keep default value if there's an error
        setMaxFiles(200) // Use a sensible default
      })

    // Fetch max file size from the API
    fetch(`${converterService.getApiBaseUrl()}/api/settings/max-file-size`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.maxFileSizeMB) {
          setMaxFileSizeMB(data.maxFileSizeMB)
          console.log(`Max file size set to: ${data.maxFileSizeMB}MB`)
        }
      })
      .catch((error) => {
        console.error("Failed to fetch max file size limit:", error)
        // Keep default value if there's an error
        setMaxFileSizeMB(100) // Use a sensible default of 100MB
      })
  }, [converterService])

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

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  const processFiles = (newFiles: File[]) => {
    setError(null)

    // Filter for HEIC files
    const heicFiles = newFiles.filter(
      (file) => file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic" || file.type === "image/heif",
    )

    if (heicFiles.length === 0) {
      setError("Please select HEIC or HEIF files only.")
      return
    }

    // Check file size (using maxFileSizeMB from settings)
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024
    const validFiles = heicFiles.filter((file) => file.size <= maxSizeBytes)

    if (validFiles.length < heicFiles.length) {
      setError(`Some files exceed the ${maxFileSizeMB}MB size limit and were removed.`)
    }

    // Check max files limit
    if (files.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. Please remove some files.`)
      // Add only as many files as we can without exceeding the limit
      const remainingSlots = maxFiles - files.length
      if (remainingSlots > 0) {
        setFiles([...files, ...validFiles.slice(0, remainingSlots)])
      }
      return
    }

    setFiles([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const clearAllFiles = () => {
    setFiles([])
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Upload HEIC Files</h3>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            <p className="text-lg font-medium">Drag & drop your HEIC files here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
          </div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".heic,.heif"
            multiple
            onChange={handleFileChange}
            disabled={disabled || files.length >= maxFiles}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              className="cursor-pointer"
              asChild
              disabled={disabled || files.length >= maxFiles}
            >
              <span>Browse Files</span>
            </Button>
          </label>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Maximum file size: {maxFileSizeMB}MB per file</p>
            <p>Supported formats: HEIC, HEIF</p>
            <p>Batch upload supported (up to {maxFiles} files)</p>
            {files.length > 0 && (
              <p className={files.length >= maxFiles ? "text-amber-500 font-medium" : ""}>
                {files.length} of {maxFiles} files selected
              </p>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">
              Selected Files ({files.length}/{maxFiles})
            </h3>
            <Button variant="ghost" size="sm" onClick={clearAllFiles} disabled={disabled}>
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileType className="h-4 w-4 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={disabled}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <Button variant="outline" onClick={() => setActiveTab("settings")} className="md:w-1/3" disabled={disabled}>
              Configure Settings
            </Button>
            <Button className="md:w-2/3" onClick={onContinue} disabled={disabled || files.length === 0}>
              Start Conversion
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
