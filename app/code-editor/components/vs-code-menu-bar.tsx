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
  ChevronDown, 
  RefreshCcw, 
  FileText, 
  File, 
  FilePlus, 
  FolderPlus,
  Save, 
  SaveAll,
  FolderOpen, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Undo,
  Redo,
  Trash,
  Code,
  Search,
  Terminal,
  RefreshCw,
  ClipboardCopy,
  ClipboardPaste,
  Scissors
} from 'lucide-react'
import { getCurrentFolderPath, STORAGE_KEYS, logAllStorageKeys } from '../utils/storage-utils'

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
  onZoomIn?: () => void
  onZoomOut?: () => void
  currentPath?: string
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
  refreshExplorer,
  onZoomIn = () => {},
  onZoomOut = () => {},
  currentPath = ''
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
    console.log('VSCodeMenuBar: handleCreateNewFile called with fileName:', newFileName);
    
    if (newFileName.trim()) {
      console.log(`VSCodeMenuBar: Creating new file: ${newFileName} in ${rootNodeId}`);
      
      // Call createNewFile with the parameters matching the props interface
      createNewFile(rootNodeId, newFileName);
      setIsNewFileDialogOpen(false);
    } else {
      console.log('VSCodeMenuBar: File name is empty, not creating file');
      setIsNewFileDialogOpen(false);
    }
  }

  const handleCreateNewFolder = () => {
    console.log('VSCodeMenuBar: handleCreateNewFolder called with folderName:', newFolderName);
    
    if (newFolderName.trim()) {
      console.log(`VSCodeMenuBar: Creating new folder: ${newFolderName} in ${rootNodeId}`);
      
      // Call createNewFolder with the parameters matching the props interface
      createNewFolder(rootNodeId, newFolderName);
      setIsNewFolderDialogOpen(false);
    } else {
      console.log('VSCodeMenuBar: Folder name is empty, not creating folder');
      setIsNewFolderDialogOpen(false);
    }
  }

  const handleSave = () => {
    if (activeFileId) {
      console.log(`VSCodeMenuBar: Attempting to save file with ID: ${activeFileId}`);
      
      // Get the content directly from the editor instance
      // This ensures we always have the latest content that might not be synced to props yet
      // Create a custom event to request the latest content for the active file
      console.log(`VSCodeMenuBar: Dispatching get-editor-content event for saving file: ${activeFileId}`);
      
      // Instead of using editorContent, dispatch a save event and let the editor component handle it
      const saveEvent = new CustomEvent('save-file-content', {
        detail: {
          fileId: activeFileId
        }
      });
      
      // Dispatch the event to the editor component to handle the saving with current content
      document.dispatchEvent(saveEvent);
      console.log(`VSCodeMenuBar: Save request event dispatched for fileId: ${activeFileId}`);
    } else {
      console.warn('VSCodeMenuBar: Cannot save - No active file');
    }
  }

  const handleSaveAll = () => {
    console.log('VSCodeMenuBar: Attempting to save all open files');
    
    try {
      saveAllFiles();
      console.log('VSCodeMenuBar: Save all files request sent');
    } catch (error) {
      console.error('VSCodeMenuBar: Error during save all files operation:', error);
    }
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
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleNewFile}
          >
            <FilePlus className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">New File</span>
            <span className="ml-auto opacity-60 text-gray-300">Ctrl+N</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleNewFolder}
          >
            <FolderPlus className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">New Folder</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={onOpenFolder}
          >
            <FolderOpen className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">Open Folder...</span>
            <span className="ml-auto opacity-60 text-gray-300">Ctrl+K Ctrl+O</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={onOpenFile}
          >
            <File className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">Open File...</span>
            <span className="ml-auto opacity-60 text-gray-300">Ctrl+O</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">Save</span>
            <span className="ml-auto opacity-60 text-gray-300">Ctrl+S</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={() => {
              // Get folder path from props or from our storage utils as fallback
              let folderPath = currentPath;
              
              // If no current path from props, use our storage utils
              if (!folderPath || folderPath.trim() === '') {
                console.log('VSCodeMenuBar: No currentPath in props, checking storage...');
                folderPath = getCurrentFolderPath();
                console.log('VSCodeMenuBar: Got folder path from storage utils:', folderPath);
                
                // Log all storage keys for debugging
                logAllStorageKeys();
              }
              
              console.log('VSCodeMenuBar: Refreshing folder from disk:', folderPath);
              if (folderPath && folderPath.trim() !== '') {
                // Force a complete refresh from disk by triggering the refresh explorer event
                const refreshEvent = new CustomEvent('refresh-explorer', {
                  detail: { path: folderPath, forceRefresh: true }
                });
                document.dispatchEvent(refreshEvent);
                console.log('VSCodeMenuBar: Dispatched refresh-explorer event with forceRefresh true for path:', folderPath);
              } else {
                console.log('VSCodeMenuBar: No valid folder path available from any source');
                alert('Please open a folder first');
              }
            }}
          >
            <RefreshCw className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">Refresh From Disk</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">View</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={() => {
              console.log('Zoom in clicked');
              onZoomIn();
            }}
          >
            <ZoomIn className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">Zoom In</span>
            <span className="ml-auto opacity-60 text-gray-300">Ctrl++</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-xs flex items-center gap-2 px-3 py-1.5 hover:bg-[#094771] focus:bg-[#094771] cursor-pointer"
            onClick={() => {
              console.log('Zoom out clicked');
              onZoomOut();
            }}
          >
            <ZoomOut className="h-4 w-4 text-gray-300" />
            <span className="text-gray-300">Zoom Out</span>
            <span className="ml-auto opacity-60 text-gray-300">Ctrl+-</span>
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
