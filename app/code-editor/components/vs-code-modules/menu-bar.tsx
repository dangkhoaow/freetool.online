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
  Scissors,
  Folder
} from 'lucide-react'
import { getCurrentFolderPath, STORAGE_KEYS, logAllStorageKeys } from '../../utils/storage-utils'

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
    console.log('MenuBar: Requesting zip download for folder:', folderPath);
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
    
    console.log('MenuBar: Download completed successfully');
    return true;
  } catch (error) {
    console.error('MenuBar: Error downloading folder as zip:', error);
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
  
  console.log('MenuBar: Rendering menu bar, activeFileId:', activeFileId);
  console.log('MenuBar: Current folder path:', currentPath);

  // Handle file menu actions
  const handleNewFile = () => {
    console.log('MenuBar: Opening new file dialog');
    setNewFileName('')
    setIsNewFileDialogOpen(true)
  }

  const handleNewFolder = () => {
    console.log('MenuBar: Opening new folder dialog');
    setNewFolderName('')
    setIsNewFolderDialogOpen(true)
  }

  const handleCreateNewFile = () => {
    console.log('MenuBar: handleCreateNewFile called with fileName:', newFileName);
    
    if (newFileName.trim()) {
      console.log(`MenuBar: Creating new file: ${newFileName} in ${rootNodeId}`);
      
      // Call createNewFile with the parameters matching the props interface
      createNewFile(rootNodeId, newFileName);
      setIsNewFileDialogOpen(false);
    } else {
      console.log('MenuBar: File name is empty, not creating file');
      setIsNewFileDialogOpen(false);
    }
  }

  const handleCreateNewFolder = () => {
    console.log('MenuBar: handleCreateNewFolder called with folderName:', newFolderName);
    
    if (newFolderName.trim()) {
      console.log(`MenuBar: Creating new folder: ${newFolderName} in ${rootNodeId}`);
      
      // Call createNewFolder with the parameters matching the props interface
      createNewFolder(rootNodeId, newFolderName);
      setIsNewFolderDialogOpen(false);
    } else {
      console.log('MenuBar: Folder name is empty, not creating folder');
      setIsNewFolderDialogOpen(false);
    }
  }

  const handleSave = () => {
    if (activeFileId) {
      console.log(`MenuBar: Attempting to save file with ID: ${activeFileId}`);
      
      try {
        // Pass undefined as the second parameter to let enhancedSaveFile
        // retrieve the content directly from the editor instance
        // This matches how saveAllFiles works which is working correctly
        saveFile(activeFileId, undefined as any);
        console.log(`MenuBar: Save request sent for file: ${activeFileId}`);
      } catch (error) {
        console.error(`MenuBar: Error saving file ${activeFileId}:`, error);
      }
    } else {
      console.warn('MenuBar: Cannot save - No active file');
    }
  }

  const handleSaveAll = () => {
    console.log('MenuBar: Attempting to save all open files');
    
    try {
      saveAllFiles();
      console.log('MenuBar: Save all files request sent');
    } catch (error) {
      console.error('MenuBar: Error during save all files operation:', error);
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
            onClick={handleNewFile}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            New File <span className="ml-auto opacity-60">Ctrl+N</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleNewFolder}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <Folder className="h-4 w-4 mr-2" />
            New Folder
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem 
            onClick={onOpenFile}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <File className="h-4 w-4 mr-2" />
            Open File... <span className="ml-auto opacity-60">Ctrl+O</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={onOpenFolder}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Open Folder...
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem 
            onClick={handleSave}
            className={`${activeFileId ? 'hover:bg-[#2a2d2e] hover:text-white' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!activeFileId}
          >
            <Save className="h-4 w-4 mr-2" />
            Save <span className="ml-auto opacity-60">Ctrl+S</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSaveAll}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <SaveAll className="h-4 w-4 mr-2" />
            Save All <span className="ml-auto opacity-60">Ctrl+Shift+S</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem 
            onClick={async () => {
              if (currentPath) {
                console.log(`MenuBar: Downloading project folder: ${currentPath}`);
                await downloadProjectAsZip(currentPath);
              } else {
                console.warn('MenuBar: No current folder path to download');
              }
            }}
            className={`${currentPath ? 'hover:bg-[#2a2d2e] hover:text-white' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!currentPath}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Edit Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">Edit</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem 
            onClick={() => {
              console.log('MenuBar: Dispatching undo event');
              // Create a custom event
              const event = new CustomEvent('editor-undo');
              document.dispatchEvent(event);
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <Undo className="h-4 w-4 mr-2" />
            Undo <span className="ml-auto opacity-60">Ctrl+Z</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              console.log('MenuBar: Dispatching redo event');
              // Create a custom event
              const event = new CustomEvent('editor-redo');
              document.dispatchEvent(event);
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <Redo className="h-4 w-4 mr-2" />
            Redo <span className="ml-auto opacity-60">Ctrl+Y</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem 
            onClick={() => {
              console.log('MenuBar: Dispatching cut event');
              // Create a custom event
              const event = new CustomEvent('editor-cut');
              document.dispatchEvent(event);
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Cut <span className="ml-auto opacity-60">Ctrl+X</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              console.log('MenuBar: Dispatching copy event');
              // Create a custom event
              const event = new CustomEvent('editor-copy');
              document.dispatchEvent(event);
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy <span className="ml-auto opacity-60">Ctrl+C</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => {
              console.log('MenuBar: Dispatching paste event');
              // Create a custom event
              const event = new CustomEvent('editor-paste');
              document.dispatchEvent(event);
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Paste <span className="ml-auto opacity-60">Ctrl+V</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* View Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">View</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem 
            onClick={() => {
              console.log('MenuBar: Toggle word wrap action');
              const event = new CustomEvent('toggle-word-wrap');
              document.dispatchEvent(event);
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <Code className="h-4 w-4 mr-2" />
            Toggle Word Wrap <span className="ml-auto opacity-60">Alt+Z</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem
            onClick={() => {
              console.log('MenuBar: Zoom in action');
              onZoomIn();
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom In <span className="ml-auto opacity-60">Ctrl++</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              console.log('MenuBar: Zoom out action');
              onZoomOut();
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <ZoomOut className="h-4 w-4 mr-2" />
            Zoom Out <span className="ml-auto opacity-60">Ctrl+-</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem
            onClick={() => {
              console.log('MenuBar: Toggle sidebar action');
              document.dispatchEvent(new CustomEvent('toggle-sidebar'));
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Toggle Sidebar <span className="ml-auto opacity-60">Ctrl+B</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              console.log('MenuBar: Toggle panel action');
              document.dispatchEvent(new CustomEvent('toggle-panel'));
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <Terminal className="h-4 w-4 mr-2" />
            Toggle Panel <span className="ml-auto opacity-60">Ctrl+J</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* New Dialog for Files */}
      <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-sm">
          <DialogHeader>
            <DialogTitle>New File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="fileName" className="text-[#cccccc]">
              File Name
            </Label>
            <Input
              id="fileName"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="bg-[#3c3c3c] border-[#6b6b6b] text-[#cccccc] mt-2"
              autoFocus
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
              disabled={!newFileName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Dialog for Folders */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folderName" className="text-[#cccccc]">
              Folder Name
            </Label>
            <Input
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="bg-[#3c3c3c] border-[#6b6b6b] text-[#cccccc] mt-2"
              autoFocus
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
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
