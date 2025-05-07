"use client"

import React, { useRef, useState } from 'react'
import { FileNode } from '@/lib/services/vs-code-file-system'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  File, 
  FolderOpen, 
  Save, 
  SaveAll, 
  FilePlus, 
  FolderPlus,
  ClipboardCopy,
  ClipboardPaste,
  Scissors,
  Undo,
  Redo,
  Search,
  Settings
} from 'lucide-react'

interface VSCodeMenuBarProps {
  createNewFile: (parentId: string, fileName: string, content?: string, language?: string) => void
  createNewFolder: (parentId: string, folderName: string) => void
  saveFile: (fileId: string, content: string) => void
  saveAllFiles: () => void
  openFile: (fileId: string) => void
  rootNodeId: string
  onOpenFile: () => void
  onOpenFolder: () => void
  activeFileId: string | null
  editorContent: string
  refreshExplorer: () => void
}

// Utility function to download a folder as zip
const downloadProjectAsZip = async (folderPath: string) => {
  try {
    console.log('Requesting zip download for folder:', folderPath);
    const response = await fetch(`/api/download-folder?path=${encodeURIComponent(folderPath)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    // Create a blob from the response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${folderPath.split('/').pop() || 'project'}.zip`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log('Download completed successfully');
    return true;
  } catch (error) {
    console.error('Error downloading folder as zip:', error);
    return false;
  }
};

export function VSCodeMenuBar({
  createNewFile,
  createNewFolder,
  saveFile,
  saveAllFiles,
  openFile,
  rootNodeId,
  onOpenFile,
  onOpenFolder,
  activeFileId,
  editorContent,
  refreshExplorer
}: VSCodeMenuBarProps) {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Handle file menu actions
  const handleNewFile = () => {
    setNewFileName('')
    setIsNewFileDialogOpen(true)
  }

  const handleNewFolder = () => {
    setNewFolderName('')
    setIsNewFolderDialogOpen(true)
  }

  const handleCreateNewFile = () => {
    if (newFileName.trim()) {
      createNewFile(rootNodeId, newFileName)
      setIsNewFileDialogOpen(false)
      console.log(`Creating new file: ${newFileName} in ${rootNodeId}`)
    }
  }

  const handleCreateNewFolder = () => {
    if (newFolderName.trim()) {
      createNewFolder(rootNodeId, newFolderName)
      setIsNewFolderDialogOpen(false)
      console.log(`Creating new folder: ${newFolderName} in ${rootNodeId}`)
    }
  }

  const handleSave = () => {
    if (activeFileId && editorContent) {
      saveFile(activeFileId, editorContent)
      console.log(`Saving file: ${activeFileId}`)
    }
  }

  const handleSaveAll = () => {
    saveAllFiles()
    console.log('Saving all files')
  }

  return (
    <div className="flex items-center h-8 px-2 bg-[#3c3c3c] text-[#cccccc] text-xs border-b border-[#252525]">
      {/* File Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">File</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleNewFile}
          >
            <FilePlus className="h-4 w-4" />
            <span>New File</span>
            <span className="ml-auto opacity-60">Ctrl+N</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleNewFolder}
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={onOpenFile}
          >
            <File className="h-4 w-4" />
            <span>Open File...</span>
            <span className="ml-auto opacity-60">Ctrl+O</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={onOpenFolder}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Open Folder...</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
            <span className="ml-auto opacity-60">Ctrl+S</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleSaveAll}
          >
            <SaveAll className="h-4 w-4" />
            <span>Save All</span>
            <span className="ml-auto opacity-60">Ctrl+K S</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={refreshExplorer}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Refresh Explorer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">Edit</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <Undo className="h-4 w-4" />
            <span>Undo</span>
            <span className="ml-auto opacity-60">Ctrl+Z</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <Redo className="h-4 w-4" />
            <span>Redo</span>
            <span className="ml-auto opacity-60">Ctrl+Y</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <Scissors className="h-4 w-4" />
            <span>Cut</span>
            <span className="ml-auto opacity-60">Ctrl+X</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <ClipboardCopy className="h-4 w-4" />
            <span>Copy</span>
            <span className="ml-auto opacity-60">Ctrl+C</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <ClipboardPaste className="h-4 w-4" />
            <span>Paste</span>
            <span className="ml-auto opacity-60">Ctrl+V</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">View</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <span>Explorer</span>
            <span className="ml-auto opacity-60">Ctrl+Shift+E</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <span>Search</span>
            <span className="ml-auto opacity-60">Ctrl+Shift+F</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <span>Terminal</span>
            <span className="ml-auto opacity-60">Ctrl+`</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">Help</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <span>Welcome</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <span>Documentation</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer">
            <span>About</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* New File Dialog */}
      <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-md">
          <DialogHeader>
            <DialogTitle>New File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="filename" className="text-sm text-[#cccccc]">
              Filename
            </Label>
            <Input 
              id="filename" 
              value={newFileName} 
              onChange={(e) => setNewFileName(e.target.value)} 
              className="bg-[#3c3c3c] border-[#6b6b6b] text-[#cccccc] mt-2"
              placeholder="e.g., index.js"
              ref={fileInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNewFile();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewFileDialogOpen(false)}
              className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewFile}
              className="bg-[#007acc] text-white hover:bg-[#0062a3]"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-md">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="foldername" className="text-sm text-[#cccccc]">
              Folder Name
            </Label>
            <Input 
              id="foldername" 
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)} 
              className="bg-[#3c3c3c] border-[#6b6b6b] text-[#cccccc] mt-2"
              placeholder="e.g., src"
              ref={folderInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNewFolder();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewFolderDialogOpen(false)}
              className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewFolder}
              className="bg-[#007acc] text-white hover:bg-[#0062a3]"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
