"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  ImageIcon,
  Upload,
  Download,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Lock,
  Save,
} from "lucide-react"
import {
  encodeTextInImage,
  encodeFileInImage,
  decodeTextFromImage,
  decodeFileFromImage,
  calculateMaxTextLength,
  calculateMaxDataSize,
  formatFileSize,
  saveImageToLocalStorage,
  getSavedImagesFromLocalStorage,
  deleteImageFromLocalStorage,
  clearSavedImagesFromLocalStorage,
} from "@/lib/services/steganography-service"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import AesEncryption from "@/lib/services/aes-encryption"

interface EncryptionOptions {
  algorithm: "aes-256-ctr"
  key: string
}

const aes = new AesEncryption()
aes.setSecretKey("some-default-secret-key") // needs to be 256 bit

const encryptText = (text: string, encryptionOptions: EncryptionOptions): string => {
  aes.setSecretKey(encryptionOptions.key)
  return aes.encrypt(text)
}

const decryptText = (encryptedText: string, encryptionOptions: EncryptionOptions): string => {
  aes.setSecretKey(encryptionOptions.key)
  return aes.decrypt(encryptedText)
}

export default function SteganographyTool() {
  const { toast } = useToast()
  // Tabs state
  const [activeTab, setActiveTab] = useState("encode")

  // Encode tab states
  const [encodeImage, setEncodeImage] = useState<File | null>(null)
  const [encodeImagePreview, setEncodeImagePreview] = useState<string | null>(null)
  const [encodeText, setEncodeText] = useState("")
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null)
  const [encodeError, setEncodeError] = useState<string | null>(null)
  const [encodeSuccess, setEncodeSuccess] = useState<string | null>(null)
  const [encodeLoading, setEncodeLoading] = useState(false)
  const [maxTextLength, setMaxTextLength] = useState(0)

  // Decode tab states
  const [decodeImage, setDecodeImage] = useState<File | null>(null)
  const [decodeImagePreview, setDecodeImagePreview] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState("")
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [decodeSuccess, setDecodeSuccess] = useState<string | null>(null)
  const [decodeLoading, setDecodeLoading] = useState(false)

  // Saved images tab states
  const [savedImages, setSavedImages] = useState<
    Record<
      string,
      {
        dataUrl: string
        metadata: {
          originalName: string
          encodedText?: string
          encodedFile?: { fileName: string; mimeType: string; size: number }
          timestamp: number
        }
      }
    >
  >({})
  const [selectedSavedImage, setSelectedSavedImage] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  // Refs
  const encodeFileInputRef = useRef<HTMLInputElement>(null)
  const decodeFileInputRef = useRef<HTMLInputElement>(null)
  const encodedCanvasRef = useRef<HTMLCanvasElement>(null)

  // File encode states
  const [fileToHide, setFileToHide] = useState<File | null>(null)
  const [maxFileSize, setMaxFileSize] = useState(0)
  const [hideMode, setHideMode] = useState<"text" | "file">("text")

  // File decode states
  const [decodedFile, setDecodedFile] = useState<{
    data: ArrayBuffer
    fileName: string
    mimeType: string
  } | null>(null)

  const MAX_SAVED_IMAGES = 10

  // Encryption options
  const [encryptionOptions, setEncryptionOptions] = useState<EncryptionOptions>({
    algorithm: "aes-256-ctr",
    key: "some-default-secret-key",
  })

  // Load saved images on component mount
  useEffect(() => {
    const images = getSavedImagesFromLocalStorage()
    setSavedImages(images)
  }, [])

  // Handle encode image upload
  const handleEncodeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEncodeError(null)
    setEncodeSuccess(null)
    setEncodedImageUrl(null)
    setFileToHide(null)

    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setEncodeError("Please upload a valid image file.")
      return
    }

    setEncodeImage(file)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      setEncodeImagePreview(preview)

      // Calculate max text length and file size
      const img = new Image()
      img.onload = () => {
        const maxLength = calculateMaxTextLength(img.width, img.height)
        const maxSize = calculateMaxDataSize(img.width, img.height)
        setMaxTextLength(maxLength)
        setMaxFileSize(maxSize)
      }
      img.src = preview
    }
    reader.readAsDataURL(file)
  }

  // Handle file upload for hiding
  const handleFileToHideUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEncodeError(null)
    setEncodeSuccess(null)

    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxFileSize) {
      setEncodeError(`File is too large. Maximum size for this image is ${formatFileSize(maxFileSize)}.`)
      return
    }

    setFileToHide(file)
  }

  // Handle text encoding
  const handleEncode = async () => {
    setEncodeError(null)
    setEncodeSuccess(null)
    setEncodedImageUrl(null)

    if (!encodeImage) {
      setEncodeError("Please upload an image first.")
      return
    }

    if (!encodeText.trim()) {
      setEncodeError("Please enter some text to hide.")
      return
    }

    if (encodeText.length > maxTextLength) {
      setEncodeError(`Text is too long. Maximum length for this image is ${maxTextLength} characters.`)
      return
    }

    setEncodeLoading(true)

    try {
      // Encrypt the text
      const encryptedText = encryptText(encodeText, encryptionOptions)

      // Create a canvas to work with the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context.")
      }

      // Load the image onto the canvas
      const img = new Image()
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0)

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        try {
          // Encode the text into the image
          const encodedImageData = encodeTextInImage(imageData, encryptedText)

          // Put the encoded image data back on the canvas
          ctx.putImageData(encodedImageData, 0, 0)

          // Convert the canvas to a data URL
          const dataUrl = canvas.toDataURL("image/png")
          setEncodedImageUrl(dataUrl)

          // Save to localStorage
          const key = `steg-${Date.now()}`
          try {
            const savedImagesCount = Object.keys(getSavedImagesFromLocalStorage()).length
            if (savedImagesCount >= MAX_SAVED_IMAGES) {
              setStorageWarning(
                "Local storage is full. Please clear some images from the 'Saved Images' tab to continue.",
              )
            } else {
              saveImageToLocalStorage(key, dataUrl, {
                originalName: encodeImage.name,
                encodedText: encodeText,
                timestamp: Date.now(),
              })

              // Update saved images
              setSavedImages(getSavedImagesFromLocalStorage())
              setStorageWarning(null)
            }
          } catch (e: any) {
            setStorageWarning(e.message)
          }

          setEncodeSuccess("Text successfully hidden in the image!")
        } catch (error) {
          setEncodeError((error as Error).message)
        }

        setEncodeLoading(false)
      }

      img.onerror = () => {
        setEncodeError("Failed to load the image.")
        setEncodeLoading(false)
      }

      img.src = encodeImagePreview as string
    } catch (error) {
      setEncodeError("An error occurred while encoding the image.")
      setEncodeLoading(false)
    }
  }

  // Handle file encoding
  const handleEncodeFile = async () => {
    setEncodeError(null)
    setEncodeSuccess(null)
    setEncodedImageUrl(null)

    if (!encodeImage) {
      setEncodeError("Please upload an image first.")
      return
    }

    if (!fileToHide) {
      setEncodeError("Please select a file to hide.")
      return
    }

    if (fileToHide.size > maxFileSize) {
      setEncodeError(`File is too large. Maximum size for this image is ${formatFileSize(maxFileSize)}.`)
      return
    }

    setEncodeLoading(true)

    try {
      // Create a canvas to work with the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context.")
      }

      // Load the image onto the canvas
      const img = new Image()
      img.onload = async () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0)

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        try {
          // Read the file as ArrayBuffer
          const fileData = await fileToHide.arrayBuffer()

          // Encode the file into the image
          const encodedImageData = encodeFileInImage(imageData, fileData, fileToHide.name, fileToHide.type)

          // Put the encoded image data back on the canvas
          ctx.putImageData(encodedImageData, 0, 0)

          // Convert the canvas to a data URL
          const dataUrl = canvas.toDataURL("image/png")
          setEncodedImageUrl(dataUrl)

          // Save to localStorage
          const key = `steg-${Date.now()}`
          try {
            const savedImagesCount = Object.keys(getSavedImagesFromLocalStorage()).length
            if (savedImagesCount >= MAX_SAVED_IMAGES) {
              setStorageWarning(
                "Local storage is full. Please clear some images from the 'Saved Images' tab to continue.",
              )
            } else {
              saveImageToLocalStorage(key, dataUrl, {
                originalName: encodeImage.name,
                encodedFile: {
                  fileName: fileToHide.name,
                  mimeType: fileToHide.type,
                  size: fileToHide.size,
                },
                timestamp: Date.now(),
              })

              // Update saved images
              setSavedImages(getSavedImagesFromLocalStorage())
              setStorageWarning(null)
            }
          } catch (e: any) {
            setStorageWarning(e.message)
          }

          setEncodeSuccess(`File "${fileToHide.name}" successfully hidden in the image!`)
        } catch (error) {
          setEncodeError((error as Error).message)
        }

        setEncodeLoading(false)
      }

      img.onerror = () => {
        setEncodeError("Failed to load the image.")
        setEncodeLoading(false)
      }

      img.src = encodeImagePreview as string
    } catch (error) {
      setEncodeError("An error occurred while encoding the image.")
      setEncodeLoading(false)
    }
  }

  // Handle decode image upload
  const handleDecodeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDecodeError(null)
    setDecodeSuccess(null)
    setDecodedText("")
    setDecodedFile(null)

    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setDecodeError("Please upload a valid image file.")
      return
    }

    setDecodeImage(file)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      setDecodeImagePreview(preview)
    }
    reader.readAsDataURL(file)
  }

  // Handle decode button click
  const handleDecode = async () => {
    setDecodeError(null)
    setDecodeSuccess(null)
    setDecodedText("")
    setDecodedFile(null)

    if (!decodeImage && !selectedSavedImage) {
      setDecodeError("Please upload or select an image first.")
      return
    }

    setDecodeLoading(true)

    try {
      // Create a canvas to work with the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context.")
      }

      // Load the image onto the canvas
      const img = new Image()
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0)

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        try {
          // Try to decode as text first
          try {
            let text = decodeTextFromImage(imageData)
            try {
              text = decryptText(text, encryptionOptions)
              setDecodedText(text)
              setDecodeSuccess("Hidden text successfully extracted!")
            } catch (e) {
              setDecodeError("Incorrect decryption key")
            }
          } catch (textError) {
            // If text decoding fails, try file decoding
            try {
              const file = decodeFileFromImage(imageData)
              setDecodedFile(file)
              setDecodeSuccess(`Hidden file "${file.fileName}" successfully extracted!`)
            } catch (fileError) {
              // If both fail, throw the original text error
              throw textError
            }
          }
        } catch (error) {
          setDecodeError((error as Error).message)
        }

        setDecodeLoading(false)
      }

      img.onerror = () => {
        setDecodeError("Failed to load the image.")
        setDecodeLoading(false)
      }

      // Use either the uploaded image or the selected saved image
      if (selectedSavedImage) {
        img.src = savedImages[selectedSavedImage].dataUrl
      } else {
        img.src = decodeImagePreview as string
      }
    } catch (error) {
      setDecodeError("An error occurred while decoding the image.")
      setDecodeLoading(false)
    }
  }

  // Handle download decoded file
  const handleDownloadDecodedFile = () => {
    if (!decodedFile) return

    const blob = new Blob([decodedFile.data], { type: decodedFile.mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = decodedFile.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // Handle download button click
  const handleDownload = () => {
    if (!encodedImageUrl) return

    const link = document.createElement("a")
    link.href = encodedImageUrl
    link.download = `steg-${encodeImage?.name || "image.png"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle delete saved image
  const handleDeleteSavedImage = (key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteImageFromLocalStorage(key)
    setSavedImages(getSavedImagesFromLocalStorage())

    if (selectedSavedImage === key) {
      setSelectedSavedImage(null)
    }
  }

  // Handle clear all images
  const handleClearAllImages = () => {
    clearSavedImagesFromLocalStorage()
    setSavedImages({})
    setSelectedSavedImage(null)
    setStorageWarning(null)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Reset states when switching tabs
    setEncodeError(null)
    setEncodeSuccess(null)
    setDecodeError(null)
    setDecodeSuccess(null)

    // Update saved images when switching to the saved tab
    if (value === "saved") {
      setSavedImages(getSavedImagesFromLocalStorage())
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Steganography Tool</CardTitle>
        <CardDescription>
          Hide secret text messages or files within images or extract hidden content from images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="encode" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="encode">Hide Content</TabsTrigger>
            <TabsTrigger value="decode">Extract Content</TabsTrigger>
            <TabsTrigger value="saved">Saved Images</TabsTrigger>
          </TabsList>

          {/* Encode Tab */}
          <TabsContent value="encode" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encode-image">Upload Image</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors",
                      encodeError ? "border-red-300" : "border-gray-300",
                    )}
                    onClick={() => encodeFileInputRef.current?.click()}
                  >
                    <input
                      ref={encodeFileInputRef}
                      id="encode-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEncodeImageUpload}
                    />
                    {encodeImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={encodeImagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload an image or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {encodeImagePreview && (
                  <>
                    <div className="space-y-2">
                      <Label>What would you like to hide?</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={hideMode === "text" ? "default" : "outline"}
                          onClick={() => setHideMode("text")}
                          className="flex-1"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Text
                        </Button>
                        <Button
                          type="button"
                          variant={hideMode === "file" ? "default" : "outline"}
                          onClick={() => setHideMode("file")}
                          className="flex-1"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          File
                        </Button>
                      </div>
                    </div>

                    {hideMode === "text" && (
                      <div className="space-y-2">
                        <Label htmlFor="encode-text">Text to Hide</Label>
                        <Textarea
                          id="encode-text"
                          placeholder="Enter the secret text you want to hide in the image..."
                          value={encodeText}
                          onChange={(e) => setEncodeText(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500">
                          {encodeText.length} / {maxTextLength} characters
                        </p>
                      </div>
                    )}

                    {/* Encryption Options */}
                    <div className="space-y-2">
                      <Label htmlFor="encryption-key">Encryption Key</Label>
                      <Input
                        id="encryption-key"
                        type="password"
                        placeholder="Enter encryption key"
                        value={encryptionOptions.key}
                        onChange={(e) => setEncryptionOptions({ ...encryptionOptions, key: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">
                        Enter a key to encrypt the hidden text. Keep this key safe, as it will be needed to decrypt the
                        message.
                      </p>
                    </div>

                    {hideMode === "file" && (
                      <div className="space-y-2">
                        <Label htmlFor="file-to-hide">File to Hide</Label>
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors",
                            encodeError ? "border-red-300" : "border-gray-300",
                          )}
                          onClick={() => document.getElementById("file-to-hide")?.click()}
                        >
                          <input id="file-to-hide" type="file" className="hidden" onChange={handleFileToHideUpload} />
                          {fileToHide ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <FileText className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium">{fileToHide.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(fileToHide.size)}</p>
                              <p className="text-xs text-gray-500">Click to change file</p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Click to select a file to hide</p>
                              <p className="text-xs text-gray-400 mt-1">Maximum size: {formatFileSize(maxFileSize)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {encodeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{encodeError}</AlertDescription>
                  </Alert>
                )}

                {encodeSuccess && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{encodeSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={hideMode === "text" ? handleEncode : handleEncodeFile}
                  disabled={
                    !encodeImagePreview || (hideMode === "text" ? !encodeText.trim() : !fileToHide) || encodeLoading
                  }
                  className="w-full"
                >
                  {encodeLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      {hideMode === "text" ? "Hiding Text..." : "Hiding File..."}
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      {hideMode === "text" ? "Hide Text in Image" : "Hide File in Image"}
                    </>
                  )}
                </Button>
              </div>

              {/* Right Column - Result */}
              <div className="space-y-4">
                {encodedImageUrl ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-2">Encoded Image</h3>
                      <img
                        src={encodedImageUrl || "/placeholder.svg"}
                        alt="Encoded"
                        className="max-h-48 mx-auto object-contain"
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        The image now contains your hidden {hideMode === "text" ? "message" : "file"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <AlertTitle>Privacy Note</AlertTitle>
                      <AlertDescription>
                        Your image has been processed entirely in your browser. Nothing was uploaded to any server.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-gray-50 rounded-lg w-full">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-700">Encoded Image Preview</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Upload an image and {hideMode === "text" ? "enter text" : "select a file"} to hide, then click
                        the "{hideMode === "text" ? "Hide Text in Image" : "Hide File in Image"}" button.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Decode Tab */}
          <TabsContent value="decode" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decode-image">Upload Image with Hidden Content</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors",
                      decodeError ? "border-red-300" : "border-gray-300",
                    )}
                    onClick={() => decodeFileInputRef.current?.click()}
                  >
                    <input
                      ref={decodeFileInputRef}
                      id="decode-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDecodeImageUpload}
                    />
                    {decodeImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={decodeImagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload an image or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Encryption Options */}
                <div className="space-y-2">
                  <Label htmlFor="encryption-key">Encryption Key</Label>
                  <Input
                    id="encryption-key"
                    type="password"
                    placeholder="Enter encryption key"
                    value={encryptionOptions.key}
                    onChange={(e) => setEncryptionOptions({ ...encryptionOptions, key: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Enter the key used to encrypt the hidden text.</p>
                </div>

                {decodeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{decodeError}</AlertDescription>
                  </Alert>
                )}

                {decodeSuccess && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{decodeSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleDecode}
                  disabled={(!decodeImagePreview && !selectedSavedImage) || decodeLoading}
                  className="w-full"
                >
                  {decodeLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Extracting Content...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Extract Hidden Content
                    </>
                  )}
                </Button>
              </div>

              {/* Right Column - Result */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4 h-full">
                  <h3 className="text-sm font-medium mb-2">Extracted Content</h3>
                  {decodedText ? (
                    <div className="bg-gray-50 p-4 rounded-md min-h-[200px] max-h-[300px] overflow-y-auto">
                      <p className="whitespace-pre-wrap">{decodedText}</p>
                    </div>
                  ) : decodedFile ? (
                    <div className="bg-gray-50 p-4 rounded-md min-h-[200px] flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-2" />
                      <h4 className="font-medium">{decodedFile.fileName}</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        {formatFileSize(decodedFile.data.byteLength)} • {decodedFile.mimeType}
                      </p>
                      <Button onClick={handleDownloadDecodedFile}>
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-md">
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Upload an image with hidden content and click "Extract Hidden Content"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {(decodedText || decodedFile) && (
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Privacy Note</AlertTitle>
                    <AlertDescription>
                      Your image has been processed entirely in your browser. Nothing was uploaded to any server.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Saved Images Tab */}
          <TabsContent value="saved" className="space-y-4">
            {Object.keys(savedImages).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Saved Images */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Your Saved Images</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(savedImages)
                      .sort(([, a], [, b]) => b.metadata.timestamp - a.metadata.timestamp)
                      .map(([key, { dataUrl, metadata }]) => (
                        <div
                          key={key}
                          className={cn(
                            "border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors",
                            selectedSavedImage === key && "border-blue-500 bg-blue-50",
                          )}
                          onClick={() => setSelectedSavedImage(key)}
                        >
                          <img
                            src={dataUrl || "/placeholder.svg"}
                            alt={metadata.originalName}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{metadata.originalName}</p>
                            <p className="text-xs text-gray-500">{new Date(metadata.timestamp).toLocaleString()}</p>
                            {metadata.encodedText && (
                              <p className="text-xs text-gray-500 truncate">
                                Contains hidden text ({metadata.encodedText.length} chars)
                              </p>
                            )}
                            {metadata.encodedFile && (
                              <p className="text-xs text-gray-500 truncate">
                                Contains hidden file: {metadata.encodedFile.fileName} (
                                {formatFileSize(metadata.encodedFile.size)})
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500"
                            onClick={(e) => handleDeleteSavedImage(key, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  {storageWarning && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Storage Full</AlertTitle>
                      <AlertDescription>{storageWarning}</AlertDescription>
                    </Alert>
                  )}
                  <Button variant="outline" size="sm" onClick={handleClearAllImages}>
                    Clear All Images
                  </Button>
                </div>

                {/* Right Column - Selected Image */}
                <div className="space-y-4">
                  {selectedSavedImage ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Selected Image</h3>
                        <img
                          src={savedImages[selectedSavedImage].dataUrl || "/placeholder.svg"}
                          alt="Selected"
                          className="max-h-48 mx-auto object-contain"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setActiveTab("decode")
                            setDecodeImagePreview(null)
                            setDecodeImage(null)
                            // The decode function will use the selectedSavedImage
                          }}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Extract Content
                        </Button>

                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = savedImages[selectedSavedImage].dataUrl
                            link.download = `steg-${savedImages[selectedSavedImage].metadata.originalName}`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6 bg-gray-50 rounded-lg w-full">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-700">No Image Selected</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Select an image from the list to view details and options.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Save className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-700">No Saved Images</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Images with hidden content will be saved here automatically.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("encode")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Hide Content in an Image
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
