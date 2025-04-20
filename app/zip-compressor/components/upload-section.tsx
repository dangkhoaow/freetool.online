"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, FolderUp, FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatBytes } from "@/lib/utils"

interface UploadSectionProps {
  onFilesSelected: (files: File[]) => void
}

export default function UploadSection({ onFilesSelected }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploadComplete, setIsUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Use useEffect to notify parent about selected files after upload is complete
  useEffect(() => {
    if (isUploadComplete && selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
      setIsUploadComplete(false) // Reset for future uploads
    }
  }, [isUploadComplete, selectedFiles, onFilesSelected])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    setSelectedFiles(files)
    simulateUpload(files)
  }

  const simulateUpload = (files: File[]) => {
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsUploadComplete(true) // Mark upload as complete, triggering useEffect
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
    
    if (newFiles.length === 0) {
      setUploadProgress(0)
    } else if (uploadProgress === 100) {
      // If already at 100%, trigger the effect to notify parent
      setIsUploadComplete(true)
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFolderButtonClick = () => {
    folderInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">Drag and drop files or folders here</h3>
          <p className="text-sm text-muted-foreground">Support for single or multiple files and folders</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={handleFileButtonClick} variant="outline" className="gap-2">
              <FileIcon size={16} />
              Select Files
            </Button>
            <Button onClick={handleFolderButtonClick} variant="outline" className="gap-2">
              <FolderUp size={16} />
              Select Folder
            </Button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              multiple
              className="hidden"
              onChange={handleFileChange}
              {...{ directory: "" } as any}
            />
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>

          {uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">Uploading files... {uploadProgress}%</p>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border rounded-md">
            <ul className="divide-y">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <FileIcon size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-8 w-8">
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
