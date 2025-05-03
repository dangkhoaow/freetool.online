"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, X, Download, ImageIcon, ArrowUp, ArrowDown, Settings } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { getPdfToolsService } from "@/lib/services/pdf-tools-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [settings, setSettings] = useState({
    pageSize: "a4",
    orientation: "portrait" as "portrait" | "landscape",
    margin: "medium" as "none" | "small" | "medium" | "large",
    fitToPage: true,
    quality: 90,
    compression: "medium" as "low" | "medium" | "high",
    autoRotate: true,
    addPageNumbers: false,
    centered: true,
    createBookmarks: true,
  })
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const pdfService = getPdfToolsService()

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings({ ...settings, ...newSettings });
  };

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

    // Check for and filter out HEIC files
    const heicFiles = newFiles.filter(file => 
      file.type === 'image/heic' || 
      file.name.toLowerCase().endsWith('.heic') || 
      file.name.toLowerCase().endsWith('.heif')
    );
    
    if (heicFiles.length > 0) {
      setError("HEIC files are not supported. Please convert them to JPG or PNG first.");
      return;
    }

    // Filter for supported image files (only JPEG and PNG)
    const imageFiles = newFiles.filter(
      file => 
        (file.type === 'image/jpeg' || 
         file.type === 'image/jpg' || 
         file.type === 'image/png' ||
         file.name.toLowerCase().endsWith('.jpg') || 
         file.name.toLowerCase().endsWith('.jpeg') || 
         file.name.toLowerCase().endsWith('.png'))
    );

    if (imageFiles.length === 0) {
      setError("Please select only JPG or PNG image files.");
      return;
    }

    // Check file size (max 10MB per file)
    const maxSizeBytes = 10 * 1024 * 1024;
    const validFiles = imageFiles.filter((file) => file.size <= maxSizeBytes);

    if (validFiles.length < imageFiles.length) {
      setError(`Some files exceed the 10MB size limit and were removed.`);
    }

    setFiles([...files, ...validFiles]);
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
    setConvertedPdfUrl(null)
  }

  const handleCreatePdf = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image file.")
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

      // Call the PDF service to create PDF from images with all settings
      const result = await pdfService.createPdfFromImages(
        files,
        {
          // Basic settings
          pageSize: settings.pageSize,
          orientation: settings.orientation,
          margin: settings.margin,
          // Advanced settings
          fitToPage: settings.fitToPage,
          quality: settings.quality,
          compression: settings.compression,
          autoRotate: settings.autoRotate,
          addPageNumbers: settings.addPageNumbers,
          centered: settings.centered,
          createBookmarks: settings.createBookmarks
        },
        (progress) => {
          setProgress(progress)
        },
      )

      clearInterval(progressInterval)
      setProgress(100)
      setConvertedPdfUrl(result.url)

      toast({
        title: "PDF Created Successfully",
        description: `${files.length} images have been converted to a PDF document.`,
      })
    } catch (err: any) {
      setError(err.message || "Failed to create PDF file. Please try again.")
      toast({
        title: "Conversion Failed",
        description: err.message || "An error occurred while creating the PDF file.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!convertedPdfUrl) return

    const link = document.createElement("a")
    link.href = convertedPdfUrl
    link.download = "images-to-pdf.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto max-w-md px-2 py-6 md:max-w-2xl md:px-8">
      <div className="text-center mb-8 pt-16 sm:pt-10 md:pt-0">
        <h3 className="text-2xl font-bold">Image to PDF Converter</h3>
        <p className="text-gray-600 mt-2">Convert your images to a PDF document</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isProcessing && !convertedPdfUrl && (
        <>
          {files.length === 0 ? (
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
                  <p className="text-lg font-medium">Drag & drop your image files here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Maximum file size: 10MB per image</p>
                  <p>Supported formats: JPG, PNG</p>
                  <p>You can upload multiple images to create a multi-page PDF</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="files" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Files</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>PDF Settings</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="files" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Selected Files ({files.length})</h4>
                    <Button variant="ghost" size="sm" onClick={clearAllFiles}>
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 bg-primary/10 rounded flex-shrink-0">
                            <ImageIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveFileUp(index)}
                            disabled={index === 0}
                            className="h-8 w-8"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveFileDown(index)}
                            disabled={index === files.length - 1}
                            className="h-8 w-8"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="page-size">Page Size</Label>
                      <Select value={settings.pageSize} onValueChange={(value) => updateSettings({ pageSize: value })}>
                        <SelectTrigger id="page-size">
                          <SelectValue placeholder="Select page size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="tabloid">Tabloid</SelectItem>
                          <SelectItem value="a3">A3</SelectItem>
                          <SelectItem value="a5">A5</SelectItem>
                          <SelectItem value="13x11">13x11 - Photo book</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Orientation</Label>
                      <RadioGroup
                        value={settings.orientation}
                        onValueChange={(value: "portrait" | "landscape") => updateSettings({ orientation: value })}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="portrait" id="portrait" />
                          <Label htmlFor="portrait">Portrait</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="landscape" id="landscape" />
                          <Label htmlFor="landscape">Landscape</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="margin">Margin Size</Label>
                      <Select 
                        value={settings.margin} 
                        onValueChange={(value: "none" | "small" | "medium" | "large") => updateSettings({ margin: value })}
                      >
                        <SelectTrigger id="margin">
                          <SelectValue placeholder="Select margin size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="compression">PDF Compression</Label>
                      <Select 
                        value={settings.compression} 
                        onValueChange={(value: "low" | "medium" | "high") => updateSettings({ compression: value })}
                      >
                        <SelectTrigger id="compression">
                          <SelectValue placeholder="Select compression level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Better Quality)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="high">High (Smaller Size)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-options">
                      <AccordionTrigger className="text-sm font-medium">Advanced Options</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="fit-to-page">Fit Images to Page</Label>
                              <p className="text-xs text-gray-500">Resize images to fit the page size</p>
                            </div>
                            <Switch 
                              id="fit-to-page" 
                              checked={settings.fitToPage}
                              onCheckedChange={(checked) => updateSettings({ fitToPage: checked })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="auto-rotate">Auto-rotate Images</Label>
                              <p className="text-xs text-gray-500">Automatically orient images for best fit</p>
                            </div>
                            <Switch 
                              id="auto-rotate" 
                              checked={settings.autoRotate}
                              onCheckedChange={(checked) => updateSettings({ autoRotate: checked })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="centered">Center Images on Page</Label>
                              <p className="text-xs text-gray-500">Place images in the center of each page</p>
                            </div>
                            <Switch 
                              id="centered" 
                              checked={settings.centered}
                              onCheckedChange={(checked) => updateSettings({ centered: checked })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="add-page-numbers">Add Page Numbers</Label>
                              <p className="text-xs text-gray-500">Include page numbers at the bottom of each page</p>
                            </div>
                            <Switch 
                              id="add-page-numbers" 
                              checked={settings.addPageNumbers}
                              onCheckedChange={(checked) => updateSettings({ addPageNumbers: checked })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="create-bookmarks">Create Bookmarks</Label>
                              <p className="text-xs text-gray-500">Generate PDF bookmarks from filenames</p>
                            </div>
                            <Switch 
                              id="create-bookmarks" 
                              checked={settings.createBookmarks}
                              onCheckedChange={(checked) => updateSettings({ createBookmarks: checked })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="quality">Image Quality</Label>
                              <span className="text-sm text-gray-500">{settings.quality}%</span>
                            </div>
                            <Slider
                              id="quality"
                              min={10}
                              max={100}
                              step={5}
                              value={[settings.quality]}
                              onValueChange={(value) => updateSettings({ quality: value[0] })}
                            />
                            <p className="text-xs text-gray-500">
                              Higher quality results in larger file sizes. 90% is recommended for a good balance.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>

              <div className="flex justify-center mt-6">
                <Button onClick={handleCreatePdf} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Create PDF
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center text-gray-500 text-lg mb-4">Creating your PDF...</div>
          <Progress value={progress} className="w-full h-2" />
          <div className="text-center text-gray-500">{progress}% complete</div>
        </div>
      )}

      {convertedPdfUrl && !isProcessing && (
        <div className="space-y-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold">PDF Created Successfully!</h4>
            <p className="text-gray-600 mt-2">Your images have been converted into a PDF document.</p>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" onClick={clearAllFiles}>
              Create Another PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
