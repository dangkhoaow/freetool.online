"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"
import { saveCurrentFolderPath, logAllStorageKeys } from "../utils/storage-utils"

interface FolderSelectorProps {
  isOpen: boolean
  onClose: () => void
  onFolderSelected: (folderPath: string) => void
}

export function FolderSelector({ isOpen, onClose, onFolderSelected }: FolderSelectorProps) {
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [selectedPath, setSelectedPath] = useState<string>("")
  const [folderNameFromInput, setFolderNameFromInput] = useState<string>("")
  const [manualPath, setManualPath] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  console.log("FolderSelector rendering, isOpen:", isOpen)

  const handleFolderButtonClick = () => {
    console.log("Folder button clicked")
    folderInputRef.current?.click()
  }

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    console.log("Folder input change event received")
    
    if (e.target.files && e.target.files.length > 0) {
      try {
        console.log("Files selected:", e.target.files.length)
        
        // Since we're using webkitdirectory, we're getting all files in the folder
        // We need to extract the common parent directory
        const files = Array.from(e.target.files)
        
        if (files.length === 0) {
          setError("No files found in selected folder")
          return
        }
        
        // The webkitRelativePath gives us something like "folder/subfolder/file.txt"
        const firstFilePath = files[0].webkitRelativePath
        
        if (!firstFilePath) {
          setError("Could not determine folder path")
          return
        }
        
        // Get the selected folder name (first part of the relative path)
        const folderName = firstFilePath.split('/')[0]
        console.log("Extracted folder name:", folderName)
        
        // Store the folder name for constructing the path later
        setFolderNameFromInput(folderName)
        
        // Set a default path suggestion
        setManualPath(`/Users/ktran/Documents/Code/NewCode/${folderName}`)
      } catch (error) {
        console.error("Error processing folder:", error)
        setError((error as Error).message || "Failed to process folder")
      }
    }
  }
  
  const handleManualPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualPath(e.target.value)
    console.log("Manual path changed to:", e.target.value)
  }

  const handleConfirm = () => {
    console.log("FolderSelector: Confirming folder selection with path:", manualPath);
    
    if (!manualPath) {
      console.log("FolderSelector: Empty path provided");
      setError("Please provide a valid folder path");
      return;
    }
    
    // Validate that the path looks reasonable
    if (!manualPath.includes('/')) {
      console.log("FolderSelector: Invalid path format, missing /");
      setError("Please enter a valid absolute path starting with /");
      return;
    }
    
    // Save to storage immediately - this ensures it's persisted even if the VSCodeEditor
    // component doesn't handle it properly
    const saved = saveCurrentFolderPath(manualPath);
    console.log(`FolderSelector: Saved folder path to storage: ${manualPath}, success: ${saved}`);
    
    // Log storage state for debugging
    logAllStorageKeys();
    
    // Call the parent component's handler
    console.log("FolderSelector: Calling onFolderSelected with path:", manualPath);
    onFolderSelected(manualPath);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
        <DialogHeader>
          <DialogTitle>Open Folder</DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <div className="flex flex-col gap-4">
            <div className="text-sm">Select a folder to open in the explorer</div>
            
            <Button
              onClick={handleFolderButtonClick}
              variant="outline"
              className="gap-2 w-full text-black"
            >
              <FolderOpen size={16} />
              Browse for Folder
            </Button>
            
            {/* This is intentionally causing a hydration error with Math.random() */}
            <input
              key={typeof window === 'undefined' ? 'server-key' : `client-key-${Math.random()}`}
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              multiple
              className="hidden"
              onChange={handleFolderChange}
              {...{ directory: "" } as any}
            />
            
            {folderNameFromInput && (
              <div className="text-sm">
                <label className="block mb-2">Full path to folder:</label>
                <input 
                  type="text"
                  value={manualPath}
                  onChange={handleManualPathChange}
                  className="w-full p-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc]"
                  placeholder="Enter full path to folder"
                />
                <div className="mt-1 text-xs text-[#9cdcfe]">
                  Selected folder: {folderNameFromInput}
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button className="text-black" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!manualPath}>
            Open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
