"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, X, Download, Archive } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { getPdfToolsService } from "@/lib/services/pdf-tools-service"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import JSZip from "jszip"

export default function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [splitMode, setSplitMode] = useState<"all" | "range" | "custom">("all")
  const [pageRange, setPageRange] = useState<string>("1-5")
  const [customPages, setCustomPages] = useState<string>("1,3,5,7")
  const [totalPages, setTotalPages] = useState<number>(0)
  const [splitPdfUrls, setSplitPdfUrls] = useState<string[]>([])
  const [isCreatingZip, setIsCreatingZip] = useState(false)
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
    setSplitPdfUrls([])
    setTotalPages(0)
  }

  const handleSplitPdf = async () => {
    if (!file) {
      setError("Please upload a PDF file to split.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setSplitPdfUrls([])

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      // Call the PDF service to split PDF
      let result
      if (splitMode === "all") {
        result = await pdfService.splitPdfAllPages(file, (progress) => {
          setProgress(progress)
        })
      } else if (splitMode === "range") {
        result = await pdfService.splitPdfByRange(file, pageRange, (progress) => {
          setProgress(progress)
        })
      } else {
        result = await pdfService.splitPdfByPages(file, customPages, (progress) => {
          setProgress(progress)
        })
      }

      clearInterval(progressInterval)
      setProgress(100)
      setSplitPdfUrls(result.urls)

      toast({
        title: "PDF Split Successfully",
        description: `Your PDF has been split into ${result.urls.length} files.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to split PDF file. Please try again.")
      toast({
        title: "Split Failed",
        description: err.message || "An error occurred while splitting the PDF file.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (url: string, index: number) => {
    if (!url) return

    const link = document.createElement("a")
    link.href = url
    link.download = `split-${file?.name || "document"}-${index + 1}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = async () => {
    if (splitPdfUrls.length === 0) return

    setIsCreatingZip(true)
    
    try {
      toast({
        title: "Creating ZIP File",
        description: "Preparing ZIP archive with all split PDFs...",
      })

      const zip = new JSZip()
      
      // Add each PDF to the zip file
      for (let i = 0; i < splitPdfUrls.length; i++) {
        const url = splitPdfUrls[i]
        const response = await fetch(url)
        const blob = await response.blob()
        const fileName = `split-${file?.name || "document"}-${i + 1}.pdf`
        zip.file(fileName, blob)
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" })
      
      // Create a download link for the zip file
      const downloadUrl = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `split-${file?.name || "document"}-all.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Revoke the URL to free memory
      URL.revokeObjectURL(downloadUrl)
      
      toast({
        title: "ZIP File Created",
        description: "All split PDFs have been combined into a ZIP file.",
      })
    } catch (error) {
      console.error("Error creating ZIP file:", error)
      toast({
        title: "Error Creating ZIP",
        description: "Failed to create ZIP file. Please download files individually.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingZip(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold">Split PDF File</h3>
        <p className="text-gray-600 mt-2">Extract pages or split a PDF into multiple documents</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && splitPdfUrls.length === 0 && (
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
                <h4 className="font-medium">Split Options</h4>
                <RadioGroup
                  value={splitMode}
                  onValueChange={(value: "all" | "range" | "custom") => setSplitMode(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">Split into individual pages</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="range" />
                    <Label htmlFor="range">Extract page range</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Extract specific pages</Label>
                  </div>
                </RadioGroup>

                {splitMode === "range" && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="page-range">Page Range (e.g., 1-5)</Label>
                    <Input
                      id="page-range"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1-5"
                    />
                    <p className="text-xs text-gray-500">
                      Enter the range of pages to extract (e.g., 1-5 will extract pages 1 through 5)
                    </p>
                  </div>
                )}

                {splitMode === "custom" && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="custom-pages">Specific Pages (e.g., 1,3,5,7)</Label>
                    <Input
                      id="custom-pages"
                      value={customPages}
                      onChange={(e) => setCustomPages(e.target.value)}
                      placeholder="e.g., 1,3,5,7"
                    />
                    <p className="text-xs text-gray-500">
                      Enter page numbers separated by commas (e.g., 1,3,5,7 will extract pages 1, 3, 5, and 7)
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={handleSplitPdf} className="w-full">
                Split PDF
              </Button>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center text-gray-500 text-lg mb-4">Splitting your PDF file...</div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-center text-gray-500">{progress}% complete</div>
        </div>
      )}

      {!isProcessing && splitPdfUrls.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold">PDF Split Successfully!</h4>
            <p className="text-gray-600 mt-2">
              Your PDF has been split into {splitPdfUrls.length} separate {splitPdfUrls.length === 1 ? "file" : "files"}.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleDownloadAll} disabled={isCreatingZip} className="gap-2">
              {isCreatingZip ? (
                <span>Creating ZIP...</span>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Download All as ZIP
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearFile}>
              Split Another PDF
            </Button>
          </div>

          <div className="mt-6">
            <h5 className="font-medium mb-3">Individual PDF Files</h5>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {splitPdfUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">
                      {splitMode === "all"
                        ? `Page ${index + 1}`
                        : splitMode === "range"
                        ? `Page ${parseInt(pageRange.split("-")[0]) + index}`
                        : `Page ${customPages.split(",")[index]}`}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(url, index)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
