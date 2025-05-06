"use client"

import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileNode } from '@/lib/services/vs-code-file-system'

interface VSCodeFileBrowserProps {
  isOpen: boolean
  onClose: () => void
  onFileSelected: (file: File) => void
  title: string
  acceptTypes?: string
  isFolder?: boolean
}

export function VSCodeFileBrowser({
  isOpen,
  onClose,
  onFileSelected,
  title,
  acceptTypes = "",
  isFolder = false
}: VSCodeFileBrowserProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(`File selected: ${e.target.files[0].name}`)
      setSelectedFile(e.target.files[0])
    }
  }

  const handleOpenClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelected(selectedFile)
      setSelectedFile(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-[#6b6b6b] rounded-md text-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept={acceptTypes}
              {...(isFolder ? { directory: "", webkitdirectory: "", mozdirectory: "" } : {})}
            />
            <Button 
              onClick={handleOpenClick}
              className="bg-[#007acc] text-white hover:bg-[#0062a3]"
            >
              Browse {isFolder ? 'Folder' : 'File'}
            </Button>
            <p className="text-sm text-[#cccccc]">
              {selectedFile ? selectedFile.name : `Select a ${isFolder ? 'folder' : 'file'} to open`}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-[#007acc] text-white hover:bg-[#0062a3]"
            disabled={!selectedFile}
          >
            Open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
