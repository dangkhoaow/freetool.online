"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, X, Download } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { getPdfToolsService } from "@/lib/services/pdf-tools-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium")
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
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
    processFile(droppedFiles[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (newFile: File) => {
    setError(null)

    // Check if it's a PDF
    if (!newFile.name.toLowerCase().endsWith(".pdf") && newFile.type !== "application/pdf") {
      setError("Please select a PDF file only.")
      return
    }

    // Check file size (max 100MB)
    const maxSizeBytes = 100 * 1024 * 1024
    if (newFile.size > maxSizeBytes) {
      setError(`File exceeds the 100MB size limit.`)
      return
    }

    setFile(newFile)
    setOriginalSize(newFile.size)
  }

  const clearFile = () => {
    setFile(null)
    setCompressedPdfUrl(null)
    setOriginalSize(0)
    setCompressedSize(0)
  }

  const handleCompressPdf = async () => {
    if (!file) {
      setError("Please upload a PDF file to compress.")
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

      // Call the PDF service to compress PDF
      const result = await pdfService.compressPdf(file, compressionLevel, (progress) => {
        setProgress(progress)
      })

      clearInterval(progressInterval)
      setProgress(100)
      setCompressedPdfUrl(result.url)
      setCompressedSize(result.size)

      toast({
        title: "PDF Compressed Successfully",
        description: `File size reduced from ${formatFileSize(originalSize)} to ${formatFileSize(result.size)}.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to compress PDF file. Please try again.")
      toast({
        title: "Compression Failed",
        description: err.message || "An error occurred while compressing the PDF file.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!compressedPdfUrl) return

    const link = document.createElement("a")
    link.href = compressedPdfUrl
    link.download = `compressed-${file?.name || "document.pdf"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const calculateReduction = (): string => {
    if (originalSize === 0 || compressedSize === 0) return "0%"
    const reduction = ((originalSize - compressedSize) / originalSize) * 100
    return `${Math.round(reduction)}%`
  }

  return (
    <div className="container mx-auto max-w-md px-2 py-6 md:max-w-2xl md:px-8">
      <div className="text-center mb-8 pt-16 sm:pt-10 md:pt-0">
        <h3 className="text-2xl font-bold">Compress PDF File</h3>
        <p className="text-gray-600 mt-2">Reduce the file size of your PDF document</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && !compressedPdfUrl && (
        <>
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
                  <p className="text-lg font-medium">Drag & drop your PDF file here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Maximum file size: 100MB</p>
                  <p>Supported format: PDF</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Compression Level</h4>
                <RadioGroup
                  value={compressionLevel}
                  onValueChange={(value: "low" | "medium" | "high") => setCompressionLevel(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low (Better quality, less compression)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium (Balanced quality and size)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High (Maximum compression, lower quality)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleCompressPdf} className="w-full">
                Compress PDF
              </Button>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center text-gray-500 text-lg mb-4">Compressing your PDF file...</div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-center text-gray-500">{progress}% complete</div>
        </div>
      )}

      {compressedPdfUrl && !isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold">PDF Successfully Compressed!</h4>
            <p className="text-gray-600 mt-2">Your PDF file size has been reduced.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Original Size</p>
                <p className="font-bold text-lg">{formatFileSize(originalSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Compressed Size</p>
                <p className="font-bold text-lg">{formatFileSize(compressedSize)}</p>
              </div>
              <div className="col-span-2 text-center bg-green-50 dark:bg-green-900/30 p-2 rounded">
                <p className="text-sm text-gray-500 dark:text-gray-400">Size Reduction</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">{calculateReduction()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Compressed PDF
            </Button>
            <Button variant="outline" onClick={clearFile}>
              Compress Another PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
