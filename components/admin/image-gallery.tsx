"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, Copy, ExternalLink } from "lucide-react"

interface ImageGalleryProps {
  images: any[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [altText, setAltText] = useState("")

  const handleEdit = async () => {
    if (!selectedImage) return

    try {
      const response = await fetch(`/api/images/${selectedImage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          altText,
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        router.refresh()
      } else {
        console.error("Failed to update image")
      }
    } catch (error) {
      console.error("Error updating image:", error)
    }
  }

  const handleDelete = async () => {
    if (!selectedImage) return

    try {
      const response = await fetch(`/api/images/${selectedImage.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        router.refresh()
      } else {
        console.error("Failed to delete image")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Could show a toast notification here
        console.log("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length > 0 ? (
          images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.path || "/placeholder.svg"}
                  alt={image.altText || image.originalFilename}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate" title={image.originalFilename}>
                  {image.originalFilename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(image.uploadedAt), { addSuffix: true })}
                </p>
              </CardContent>
              <CardFooter className="p-2 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedImage(image)
                    setIsDetailsDialogOpen(true)
                  }}
                >
                  Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedImage(image)
                        setAltText(image.altText || "")
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(image.path)}>
                      <Copy className="mr-2 h-4 w-4" /> Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={image.path} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setSelectedImage(image)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No images found.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update the image metadata.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="editAltText">Alt Text</Label>
              <Input
                id="editAltText"
                placeholder="Descriptive text for the image"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden">
                <img
                  src={selectedImage.path || "/placeholder.svg"}
                  alt={selectedImage.altText || selectedImage.originalFilename}
                  className="max-h-[300px] w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Filename</div>
                <div>{selectedImage.originalFilename}</div>

                <div className="font-medium">Path</div>
                <div className="truncate">{selectedImage.path}</div>

                <div className="font-medium">Size</div>
                <div>{Math.round(selectedImage.size / 1024)} KB</div>

                <div className="font-medium">Type</div>
                <div>{selectedImage.mimeType}</div>

                <div className="font-medium">Alt Text</div>
                <div>{selectedImage.altText || "-"}</div>

                <div className="font-medium">Uploaded By</div>
                <div>{selectedImage.uploadedBy?.name || "-"}</div>

                <div className="font-medium">Upload Date</div>
                <div>{format(new Date(selectedImage.uploadedAt), "PPP")}</div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedImage.path)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAltText(selectedImage.altText || "")
                    setIsDetailsDialogOpen(false)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
