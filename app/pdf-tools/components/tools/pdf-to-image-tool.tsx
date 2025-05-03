"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, X, Download, ImageIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { getPdfToolsService } from "@/lib/services/pdf-tools-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export default function PdfToImageTool() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageFormat, setImageFormat] = useState<"png" | "jpg">("jpg")
  const [quality, setQuality] = useState<number>(90)
  const [pageRange, setPageRange] = useState<string>("all")
  const [totalPages, setTotalPages] = useState<number>(0)
  const [convertedImages, setConvertedImages] = useState<{ url: string; name: string }[]>([])
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

  const processFile = async (newFile: File) => {
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

    // Get page count
    try {
      const pageCount = await pdfService.getPdfPageCount(newFile)
      setTotalPages(pageCount)
    } catch (err: any) {
      setError("Could not read PDF file. The file might be corrupted or password protected.")
    }
  }

  const clearFile = () => {
    setFile(null)
    setConvertedImages([])
    setTotalPages(0)
  }

  const handleConvertPdf = async () => {
    if (!file) {
      setError("Please upload a PDF file to convert.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setConvertedImages([])

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      // Call the PDF service to convert PDF to images
      const result = await pdfService.convertPdfToImages(
        file,
        {
          format: imageFormat,
          quality,
          pageRange,
        },
        (progress) => {
          setProgress(progress)
        },
      )

      clearInterval(progressInterval)
      setProgress(100)
      setConvertedImages(result.images)

      toast({
        title: "PDF Converted Successfully",
        description: `Your PDF has been converted to ${result.images.length} ${imageFormat.toUpperCase()} images.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to convert PDF file. Please try again.")
      toast({
        title: "Conversion Failed",
        description: err.message || "An error occurred while converting the PDF file.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (url: string, name: string) => {
    if (!url) return

    const link = document.createElement("a")
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    if (convertedImages.length === 0) return

    // Create a zip file with all images
    toast({
      title: "Download Started",
      description: "Preparing ZIP file with all images...",
    })

    // In a real implementation, we would create a ZIP file here
    // For now, just download each file individually
    convertedImages.forEach((image, index) => {
      setTimeout(() => {
        handleDownload(image.url, image.name)
      }, index * 500)
    })
  }

  return (
    <div className="container mx-auto max-w-md px-2 py-6 md:max-w-2xl md:px-8">
      <div className="text-center mb-8 pt-16 sm:pt-10 md:pt-0">
        <h3 className="text-2xl font-bold">PDF to Image Converter</h3>
        <p className="text-gray-600 mt-2">Convert PDF pages to high-quality images</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && convertedImages.length === 0 && (
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
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} pages
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Conversion Options</h4>

                <div className="space-y-2">
                  <Label>Image Format</Label>
                  <RadioGroup
                    value={imageFormat}
                    onValueChange={(value: "png" | "jpg") => setImageFormat(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jpg" id="jpg" />
                      <Label htmlFor="jpg">JPG (smaller file size)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="png" id="png" />
                      <Label htmlFor="png">PNG (better quality)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {imageFormat === "jpg" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="quality">Image Quality</Label>
                      <span className="text-sm text-gray-500">{quality}%</span>
                    </div>
                    <Slider
                      id="quality"
                      min={10}
                      max={100}
                      step={5}
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Higher quality results in larger file sizes. 90% is recommended for a good balance.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="page-range">Pages to Convert</Label>
                  <Input
                    id="page-range"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g., 1-5 or 1,3,5 or all"
                  />
                  <p className="text-xs text-gray-500">
                    Enter "all" to convert all pages, a range like "1-5", or specific pages like "1,3,5"
                  </p>
                </div>
              </div>

              <Button onClick={handleConvertPdf} className="w-full">
                Convert to {imageFormat.toUpperCase()}
              </Button>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center text-gray-500 text-lg mb-4">Converting PDF to images...</div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-center text-gray-500">{progress}% complete</div>
        </div>
      )}

      {convertedImages.length > 0 && !isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <ImageIcon className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold">PDF Successfully Converted!</h4>
            <p className="text-gray-600 mt-2">
              Your PDF has been converted to {convertedImages.length} {imageFormat.toUpperCase()} images.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {convertedImages.map((image, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{image.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1"
                    onClick={() => handleDownload(image.url, image.name)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button onClick={handleDownloadAll} className="gap-2">
              <Download className="h-4 w-4" />
              Download All Images
            </Button>
            <Button variant="outline" onClick={clearFile}>
              Convert Another PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
