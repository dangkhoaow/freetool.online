"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ImageUploader() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file")
        setFile(null)
        setPreview(null)
        return
      }

      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit")
        setFile(null)
        setPreview(null)
        return
      }

      setFile(selectedFile)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("altText", altText)

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setIsOpen(false)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || "An error occurred while uploading the image")
      }
    } catch (error) {
      setError("An error occurred while uploading the image")
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Upload an image to the media library. Supported formats: JPG, PNG, GIF, WebP.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="image">Image</Label>
            <div className="flex items-center gap-2">
              <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {preview && (
            <div className="mt-4">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="max-h-[200px] rounded-md object-contain"
              />
            </div>
          )}

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="altText">Alt Text</Label>
            <Input
              id="altText"
              placeholder="Descriptive text for the image"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

