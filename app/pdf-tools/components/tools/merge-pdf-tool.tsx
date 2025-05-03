"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, X, ArrowUp, ArrowDown, Download } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { getPdfToolsService } from "@/lib/services/pdf-tools-service"

export default function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const pdfService = getPdfToolsService()

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

    // Filter for PDF files
    const pdfFiles = newFiles.filter(
      (file) => file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf",
    )

    if (pdfFiles.length === 0) {
      setError("Please select PDF files only.")
      return
    }

    // Check file size (max 100MB per file)
    const maxSizeBytes = 100 * 1024 * 1024
    const validFiles = pdfFiles.filter((file) => file.size <= maxSizeBytes)

    if (validFiles.length < pdfFiles.length) {
      setError(`Some files exceed the 100MB size limit and were removed.`)
    }

    setFiles([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const moveFileUp = (index: number) => {
    if (index === 0) return
    const newFiles = [...files]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index - 1]
    newFiles[index - 1] = temp
    setFiles(newFiles)
  }

  const moveFileDown = (index: number) => {
    if (index === files.length - 1) return
    const newFiles = [...files]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index + 1]
    newFiles[index + 1] = temp
    setFiles(newFiles)
  }

  const clearAllFiles = () => {
    setFiles([])
    setMergedPdfUrl(null)
  }

  const handleMergePdfs = async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      // Call the PDF service to merge PDFs
      const result = await pdfService.mergePdfs(files, (progress) => {
        setProgress(progress)
      })

      clearInterval(progressInterval)
      setProgress(100)
      setMergedPdfUrl(result.url)

      toast({
        title: "PDFs Merged Successfully",
        description: `${files.length} PDF files have been merged into one document.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to merge PDF files. Please try again.")
      toast({
        title: "Merge Failed",
        description: err.message || "An error occurred while merging the PDF files.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!mergedPdfUrl) return

    const link = document.createElement("a")
    link.href = mergedPdfUrl
    link.download = "merged-document.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto max-w-md px-2 py-6 md:max-w-2xl md:px-8">
      <div className="text-center mb-8 pt-16 sm:pt-10 md:pt-0">
        <h3 className="text-2xl font-bold">Merge PDF Files</h3>
        <p className="text-gray-600 mt-2">Combine multiple PDF files into a single document</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && !mergedPdfUrl && (
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
              <p className="text-lg font-medium">Drag & drop your PDF files here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Maximum file size: 100MB per file</p>
              <p>Supported format: PDF</p>
              <p>You can upload multiple files to merge them in order</p>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center text-gray-500 text-lg mb-4">Merging your PDF files...</div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-center text-gray-500">{progress}% complete</div>
        </div>
      )}

      {mergedPdfUrl && !isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold">PDF Files Successfully Merged!</h4>
            <p className="text-gray-600 mt-2">Your files have been combined into a single PDF document.</p>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Merged PDF
            </Button>
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" onClick={clearAllFiles}>
              Merge More PDFs
            </Button>
          </div>
        </div>
      )}

      {files.length > 0 && !isProcessing && !mergedPdfUrl && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <Button variant="ghost" size="sm" onClick={clearAllFiles}>
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => moveFileUp(index)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveFileDown(index)}
                    disabled={index === files.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={handleMergePdfs} disabled={files.length < 2} className="w-full">
              Merge {files.length} PDF Files
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Files will be merged in the order shown above. Use the arrows to reorder if needed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
