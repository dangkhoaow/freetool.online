"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, X, Download, RotateCw, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { getPdfToolsService } from "@/lib/services/pdf-tools-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null)
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90)
  const [pageRange, setPageRange] = useState("all")

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
    processFile(e.dataTransfer.files[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (uploadedFile: File) => {
    setError(null)
    
    // Check if it's a PDF
    if (uploadedFile.type !== "application/pdf" && !uploadedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.")
      return
    }
    
    // Check file size (max 50MB)
    const maxSizeBytes = 50 * 1024 * 1024
    if (uploadedFile.size > maxSizeBytes) {
      setError("File size exceeds the 50MB limit.")
      return
    }
    
    setFile(uploadedFile)
    setRotatedPdfUrl(null)
  }

  const handleRotatePdf = async () => {
    if (!file) {
      setError("Please upload a PDF file.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Call the PDF service to rotate PDF pages
      const result = await pdfService.rotatePdfPages(
        file,
        pageRange,
        rotationDegrees,
        (progress) => {
          setProgress(progress)
        },
      )

      setProgress(100)
      setRotatedPdfUrl(result.url)

      toast({
        title: "PDF Rotated Successfully",
        description: `PDF pages have been rotated by ${rotationDegrees} degrees.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to rotate PDF. Please try again.")
      toast({
        title: "Rotation Failed",
        description: err.message || "An error occurred while rotating the PDF.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!rotatedPdfUrl) return

    const link = document.createElement("a")
    link.href = rotatedPdfUrl
    link.download = `rotated-${file?.name || "document.pdf"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFile = () => {
    setFile(null)
    setRotatedPdfUrl(null)
  }

  const validatePageRange = (value: string) => {
    // Allow "all", single numbers, ranges (e.g. "1-5"), or comma-separated page numbers
    if (value === "all") return true
    if (/^\d+$/.test(value)) return true
    if (/^\d+-\d+$/.test(value)) {
      const [start, end] = value.split("-").map(Number)
      return start <= end
    }
    if (/^(\d+,)*\d+$/.test(value)) return true
    return false
  }

  const handlePageRangeChange = (value: string) => {
    if (value === "" || validatePageRange(value)) {
      setPageRange(value || "all")
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold">PDF Rotation Tool</h3>
        <p className="text-gray-600 mt-2">Rotate pages in your PDF document</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && !rotatedPdfUrl && (
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
                <div className="text-xs text-gray-500">
                  <p>Maximum file size: 50MB</p>
                  <p>Supported format: PDF</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="page-range">Page Range</Label>
                  <div className="flex gap-2">
                    <Input
                      id="page-range"
                      placeholder="e.g. all, 1-5, 1,3,5"
                      value={pageRange}
                      onChange={(e) => handlePageRangeChange(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter "all" for all pages, a range like "1-5", or specific pages like "1,3,5"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Rotation Angle</Label>
                  <RadioGroup
                    value={rotationDegrees.toString()}
                    onValueChange={(value) => setRotationDegrees(parseInt(value) as 90 | 180 | 270)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="90" id="rotate-90" />
                      <Label htmlFor="rotate-90" className="flex items-center gap-1">
                        <RotateCw className="h-4 w-4" /> 90° Clockwise
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="180" id="rotate-180" />
                      <Label htmlFor="rotate-180" className="flex items-center gap-1">
                        <RotateCw className="h-4 w-4" /> 180°
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="270" id="rotate-270" />
                      <Label htmlFor="rotate-270" className="flex items-center gap-1">
                        <RotateCcw className="h-4 w-4" /> 90° Counter-clockwise
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button onClick={handleRotatePdf} className="gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotate PDF
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center text-gray-500 text-lg mb-4">Rotating your PDF...</div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-center text-gray-500">{progress}% complete</div>
        </div>
      )}

      {rotatedPdfUrl && !isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold">PDF Rotated Successfully!</h4>
            <p className="text-gray-600 mt-2">Your PDF has been rotated and is ready to download.</p>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Rotated PDF
            </Button>
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" onClick={clearFile}>
              Rotate Another PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 