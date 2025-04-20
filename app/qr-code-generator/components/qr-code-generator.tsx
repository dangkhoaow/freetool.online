"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  QrCode,
  Download,
  Trash2,
  Copy,
  RefreshCw,
  Clock,
  Link2,
  AlertTriangle,
  Info,
  ImageIcon,
  Upload,
  X,
  Loader2,
} from "lucide-react"
import {
  generateQRCode,
  generateQRCodeCanvas,
  downloadQRCode,
  saveQRCodeToHistory,
  getSavedQRCodes,
  deleteSavedQRCode,
  clearQRCodeHistory,
  validateQRCodeContent,
  validateLogoImage,
  resizeImage,
  type QRCodeOptions,
  type SavedQRCode,
} from "@/lib/services/qr-code-generator-service"
import { useToast } from "@/hooks/use-toast"

export default function QRCodeGenerator() {
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [savedCodes, setSavedCodes] = useState<SavedQRCode[]>([])
  const [activeTab, setActiveTab] = useState("generator")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Logo image state
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const [useLogoImage, setUseLogoImage] = useState(false)

  // QR Code options
  const [options, setOptions] = useState<QRCodeOptions>({
    width: 300,
    margin: 4,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
    logoWidth: 60,
    logoHeight: 60,
  })

  // Load saved QR codes on initial render
  useEffect(() => {
    setSavedCodes(getSavedQRCodes())
  }, [])

  // Generate QR code when content or options change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (content) {
        generateQRCodeFromContent()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [content, options, useLogoImage, logoImage])

  // Validate content as user types
  useEffect(() => {
    if (!content) {
      setValidationMessage(null)
      return
    }

    const { valid, message } = validateQRCodeContent(content)
    setValidationMessage(valid ? null : message || null)
  }, [content])

  const generateQRCodeFromContent = async () => {
    if (!content) return

    const { valid, message } = validateQRCodeContent(content)
    if (!valid) {
      setValidationMessage(message || "Invalid content")
      return
    }

    setIsGenerating(true)
    try {
      // Include logo if enabled
      const qrOptions = {
        ...options,
        logoImage: useLogoImage ? logoImage : null,
      }

      const dataUrl = await generateQRCode(content, qrOptions)
      setQrCodeDataUrl(dataUrl)

      // Also render to canvas for potential download
      if (canvasRef.current) {
        await generateQRCodeCanvas(content, canvasRef.current, qrOptions)
      }

      setValidationMessage(null)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLogoUploadError(null)
    setIsUploadingLogo(true)

    try {
      // Validate file
      const validation = validateLogoImage(file)
      if (!validation.valid) {
        setLogoUploadError(validation.message || "Invalid image")
        return
      }

      // Resize image
      const resizedImage = await resizeImage(file, 200, 200)
      setLogoImage(resizedImage)
      setLogoImageFile(file)
      setUseLogoImage(true)

      // Set error correction to high for better scanning with logo
      setOptions({
        ...options,
        errorCorrectionLevel: "H",
      })

      toast({
        title: "Image uploaded",
        description: "Your logo has been added to the QR code.",
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      setLogoUploadError("Failed to process image. Please try another one.")
    } finally {
      setIsUploadingLogo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeLogo = () => {
    setLogoImage(null)
    setLogoImageFile(null)
    setUseLogoImage(false)
    setLogoUploadError(null)
  }

  const handleDownload = () => {
    if (!qrCodeDataUrl) return

    // Create a filename based on content
    let filename = "qrcode.png"
    if (content) {
      // If content is a URL, use the domain as filename
      if (content.startsWith("http")) {
        try {
          const url = new URL(content)
          filename = `qrcode-${url.hostname}.png`
        } catch {
          filename = "qrcode-url.png"
        }
      } else {
        // For text, use first few characters
        const shortText = content.substring(0, 15).replace(/[^a-z0-9]/gi, "-")
        filename = `qrcode-${shortText}.png`
      }
    }

    downloadQRCode(qrCodeDataUrl, filename)

    // Save to history with options
    saveQRCodeToHistory(content, {
      ...options,
      logoImage: useLogoImage ? logoImage : null,
    })
    setSavedCodes(getSavedQRCodes())

    toast({
      title: "Success",
      description: "QR code downloaded successfully!",
    })
  }

  const handleCopyToClipboard = async () => {
    if (!qrCodeDataUrl) return

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])

      toast({
        title: "Copied!",
        description: "QR code image copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "Failed to copy QR code to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSavedCode = (id: string) => {
    deleteSavedQRCode(id)
    setSavedCodes((prevCodes) => prevCodes.filter((code) => code.id !== id))

    toast({
      title: "Deleted",
      description: "QR code removed from history",
    })
  }

  const handleClearHistory = () => {
    clearQRCodeHistory()
    setSavedCodes([])

    toast({
      title: "Cleared",
      description: "QR code history has been cleared",
    })
  }

  const loadSavedCode = (code: SavedQRCode) => {
    setContent(code.content)

    // Load saved options if available
    if (code.options) {
      setOptions(code.options)

      // Handle logo image if present
      if (code.options.logoImage) {
        setLogoImage(code.options.logoImage)
        setUseLogoImage(true)
      } else {
        setLogoImage(null)
        setUseLogoImage(false)
      }
    }

    setActiveTab("generator")

    toast({
      title: "Loaded",
      description: "QR code content loaded from history",
    })
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getContentPreview = (content: string, maxLength = 30) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  const isUrl = (text: string) => {
    try {
      new URL(text)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>Generate QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Recent QR Codes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="qr-content">Text or URL</Label>
                <Input
                  id="qr-content"
                  placeholder="Enter text or URL to generate QR code"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                {validationMessage && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{validationMessage}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="qr-size">Size</Label>
                    <span className="text-sm text-gray-500">{options.width}px</span>
                  </div>
                  <Slider
                    id="qr-size"
                    min={100}
                    max={800}
                    step={10}
                    value={[options.width || 300]}
                    onValueChange={(value) => setOptions({ ...options, width: value[0] })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="qr-margin">Margin</Label>
                    <span className="text-sm text-gray-500">{options.margin}</span>
                  </div>
                  <Slider
                    id="qr-margin"
                    min={0}
                    max={10}
                    step={1}
                    value={[options.margin || 4]}
                    onValueChange={(value) => setOptions({ ...options, margin: value[0] })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="error-correction">Error Correction</Label>
                  <Select
                    value={options.errorCorrectionLevel}
                    onValueChange={(value) =>
                      setOptions({
                        ...options,
                        errorCorrectionLevel: value as "L" | "M" | "Q" | "H",
                      })
                    }
                  >
                    <SelectTrigger id="error-correction">
                      <SelectValue placeholder="Select error correction level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Higher error correction allows QR codes to be readable even when partially damaged or obscured.
                    {useLogoImage && (
                      <span className="font-medium text-amber-600 block mt-1">
                        High error correction recommended when using a logo.
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foreground-color">Foreground Color</Label>
                    <div className="flex mt-2">
                      <Input
                        id="foreground-color"
                        type="color"
                        value={options.color?.dark || "#000000"}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            color: { ...options.color!, dark: e.target.value },
                          })
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={options.color?.dark || "#000000"}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            color: { ...options.color!, dark: e.target.value },
                          })
                        }
                        className="w-full ml-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex mt-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={options.color?.light || "#ffffff"}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            color: { ...options.color!, light: e.target.value },
                          })
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={options.color?.light || "#ffffff"}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            color: { ...options.color!, light: e.target.value },
                          })
                        }
                        className="w-full ml-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Image Section */}
                <div className="space-y-3 pt-2">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-logo" className="font-medium">
                      Add Logo Image
                    </Label>
                    <Switch
                      id="use-logo"
                      checked={useLogoImage}
                      onCheckedChange={(checked) => {
                        setUseLogoImage(checked)
                        if (checked && !logoImage) {
                          // Trigger file input click if logo is enabled but no image is selected
                          fileInputRef.current?.click()
                        }
                        // Set error correction to high when using logo
                        if (checked && options.errorCorrectionLevel !== "H") {
                          setOptions({
                            ...options,
                            errorCorrectionLevel: "H",
                          })
                        }
                      }}
                    />
                  </div>

                  {useLogoImage && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border">
                          {logoImage ? (
                            <>
                              <img
                                src={logoImage || "/placeholder.svg"}
                                alt="Logo"
                                className="max-w-full max-h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                                aria-label="Remove logo"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/svg+xml"
                            onChange={handleLogoUpload}
                            className="hidden"
                            aria-label="Upload logo image"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="w-full"
                          >
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : logoImage ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Change Logo
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {logoUploadError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{logoUploadError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="logo-size">Logo Size</Label>
                          <span className="text-sm text-gray-500">{options.logoWidth}px</span>
                        </div>
                        <Slider
                          id="logo-size"
                          min={20}
                          max={150}
                          step={5}
                          value={[options.logoWidth || 60]}
                          onValueChange={(value) =>
                            setOptions({
                              ...options,
                              logoWidth: value[0],
                              logoHeight: value[0],
                            })
                          }
                          disabled={!logoImage}
                        />
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Adding a logo may reduce QR code readability. Use high error correction and test scanning
                          before sharing.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-start space-y-6">
              <div className="relative">
                {isGenerating ? (
                  <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="relative">
                    <img
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="Generated QR Code"
                      className="rounded-lg shadow-md"
                      style={{ width: `${options.width}px`, maxWidth: "100%" }}
                    />
                    <canvas ref={canvasRef} className="hidden" width={options.width} height={options.width}></canvas>
                  </div>
                ) : (
                  <div className="w-[300px] h-[300px] flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                    <QrCode className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center px-6">Enter text or a URL above to generate your QR code</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleDownload}
                  disabled={!qrCodeDataUrl || isGenerating}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </Button>
                <Button
                  onClick={handleCopyToClipboard}
                  disabled={!qrCodeDataUrl || isGenerating}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setContent("")
                          setQrCodeDataUrl("")
                          setLogoImage(null)
                          setUseLogoImage(false)
                          setOptions({
                            width: 300,
                            margin: 4,
                            color: {
                              dark: "#000000",
                              light: "#ffffff",
                            },
                            errorCorrectionLevel: "M",
                            logoWidth: 60,
                            logoHeight: 60,
                          })
                        }}
                        disabled={!content || isGenerating}
                        variant="ghost"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear the current QR code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {content && qrCodeDataUrl && (
                <div className="w-full mt-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {isUrl(content) ? (
                        <>
                          This QR code contains a URL. When scanned, it will open{" "}
                          <a
                            href={content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {getContentPreview(content, 30)}
                          </a>{" "}
                          in a web browser.
                        </>
                      ) : (
                        <>This QR code contains text: "{getContentPreview(content, 50)}"</>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Recent QR Codes</h3>
              {savedCodes.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearHistory} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear History
                </Button>
              )}
            </div>

            {savedCodes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent QR Codes</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your recently generated QR codes will appear here. Generate a QR code and download it to save it to
                  your history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedCodes.map((code) => (
                  <Card key={code.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-stretch">
                        <div
                          className="w-full sm:w-24 h-24 bg-gray-100 flex items-center justify-center cursor-pointer"
                          onClick={() => loadSavedCode(code)}
                        >
                          <QrCode className="h-12 w-12 text-gray-700" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-medium line-clamp-1">
                                  {isUrl(code.content) ? (
                                    <div className="flex items-center">
                                      <Link2 className="h-4 w-4 mr-1 inline text-blue-600" />
                                      <span>{getContentPreview(code.content, 40)}</span>
                                    </div>
                                  ) : (
                                    getContentPreview(code.content, 40)
                                  )}
                                </h4>
                                <p className="text-xs text-gray-500">{formatTimestamp(code.timestamp)}</p>
                                {code.options?.logoImage && (
                                  <span className="inline-flex items-center text-xs text-blue-600">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    Custom logo
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSavedCode(code.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={() => loadSavedCode(code)}>
                              Load
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
