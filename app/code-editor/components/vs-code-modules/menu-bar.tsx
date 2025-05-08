"use client"

import React, { useRef, useState, useEffect } from 'react'
import { FileNode } from '@/lib/services/vs-code-file-system'
import { FileSystemAccessAdapter } from './file-system-access-adapter'
import * as BrowserFileSystem from '@/lib/services/browser-file-system-service'
import useVSCodeStore from '../../store/vs-code-store'
import { validateFolderPath, validateDirectoryHandle } from './folder-handler'
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
  // Check if File System Access API is supported
  const [fsApiSupported, setFsApiSupported] = useState<boolean>(false);
  const [hasDirectoryAccess, setHasDirectoryAccess] = useState<boolean>(false);
  
  // Check for File System Access API support on component mount
  useEffect(() => {
    const isSupported = BrowserFileSystem.isFileSystemAccessSupported();
    const hasAccess = BrowserFileSystem.hasDirectoryHandle();
    console.log('MenuBar: File System Access API supported:', isSupported);
    console.log('MenuBar: Has directory access:', hasAccess);
    setFsApiSupported(isSupported);
    setHasDirectoryAccess(hasAccess);
  }, []);
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
    // Reset the file name input field
    setNewFileName('');
    // Show the dialog to get the file name from the user
    setIsNewFileDialogOpen(true);
    
    // Focus the input field once the dialog is open
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.focus();
      }
    }, 50);
  }

  const handleNewFolder = () => {
    console.log('MenuBar: Opening new folder dialog');
    // Reset the folder name input field
    setNewFolderName('');
    // Show the dialog to get the folder name from the user
    setIsNewFolderDialogOpen(true);
    
    // Focus the input field once the dialog is open
    setTimeout(() => {
      if (folderInputRef.current) {
        folderInputRef.current.focus();
      }
    }, 50);
  }

  const handleCreateNewFile = async () => {
    console.log('MenuBar: handleCreateNewFile called with fileName:', newFileName);
    
    if (newFileName.trim()) {
      // Get parent folder ID from activeFileId if available and a directory, otherwise use rootNodeId
      const parentFolderId = rootNodeId;
      console.log(`MenuBar: Creating new file: ${newFileName} in parent folder: ${parentFolderId}`);
      
      try {
        // First create the file in the virtual file system
        createNewFile(parentFolderId, newFileName);
        console.log('MenuBar: File created in virtual file system');
        
        // If File System Access API is supported and we have directory access,
        // also create the file on disk
        if (fsApiSupported && hasDirectoryAccess) {
          console.log('MenuBar: Attempting to create file on disk');
          const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
          
          if (directoryHandle) {
            await BrowserFileSystem.createFile(directoryHandle, newFileName, '');
            console.log('MenuBar: File also created on disk');
          } else {
            console.warn('MenuBar: Could not get directory handle to create file on disk');
          }
        }
        
        // Refresh the explorer to show the new file
        console.log('MenuBar: Refreshing explorer to show new file');
        setTimeout(() => {
          refreshExplorer();
        }, 200); // Delay to ensure file is created before refreshing
        
        setIsNewFileDialogOpen(false);
      } catch (error) {
        console.error('MenuBar: Failed to create new file:', error);
        alert('Failed to create new file. Please try again.');
      }
    } else {
      console.log('MenuBar: File name is empty, not creating file');
      setIsNewFileDialogOpen(false);
    }
  }

  const handleCreateNewFolder = async () => {
    console.log('MenuBar: handleCreateNewFolder called with folderName:', newFolderName);
    
    if (newFolderName.trim()) {
      // Get parent folder ID from activeFileId if available and a directory, otherwise use rootNodeId
      const parentFolderId = rootNodeId;
      console.log(`MenuBar: Creating new folder: ${newFolderName} in parent folder: ${parentFolderId}`);
      
      try {
        // First create the folder in the virtual file system
        createNewFolder(parentFolderId, newFolderName);
        console.log('MenuBar: Folder created in virtual file system');
        
        // If File System Access API is supported and we have directory access,
        // also create the folder on disk
        if (fsApiSupported && hasDirectoryAccess) {
          console.log('MenuBar: Attempting to create folder on disk');
          const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
          
          if (directoryHandle) {
            await BrowserFileSystem.createFolder(directoryHandle, newFolderName);
            console.log('MenuBar: Folder also created on disk');
          } else {
            console.warn('MenuBar: Could not get directory handle to create folder on disk');
          }
        }
        
        // Refresh the explorer to show the new folder
        console.log('MenuBar: Refreshing explorer to show new folder');
        setTimeout(() => {
          refreshExplorer();
        }, 200); // Delay to ensure folder is created before refreshing
        
        setIsNewFolderDialogOpen(false);
      } catch (error) {
        console.error('MenuBar: Failed to create new folder:', error);
        alert('Failed to create new folder. Please try again.');
      }
    } else {
      console.log('MenuBar: Folder name is empty, not creating folder');
      setIsNewFolderDialogOpen(false);
    }
  }

  const handleSave = async () => {
    if (activeFileId) {
      console.log(`MenuBar: Attempting to save file with ID: ${activeFileId}`);
      
      try {
        // First save to the virtual file system
        saveFile(activeFileId, editorContent);
        console.log(`MenuBar: File saved in virtual filesystem with ID: ${activeFileId}`);
        
        // If File System Access API is supported and we have directory access,
        // also save to disk
        if (fsApiSupported && hasDirectoryAccess) {
          console.log('MenuBar: Attempting to save file on disk');
          
          // Get the file node from the store to get the file name
          const store = useVSCodeStore.getState();
          const fileNode = store.rootNode.children?.find((node: any) => 
            node.id === activeFileId || 
            (node.children && node.children.some((child: any) => child.id === activeFileId)));
          
          if (fileNode && fileNode.name) {
            const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
            if (directoryHandle) {
              await BrowserFileSystem.createFile(directoryHandle, fileNode.name, editorContent);
              console.log(`MenuBar: File also saved on disk: ${fileNode.name}`);
            }
          } else {
            console.warn('MenuBar: Could not find file node to save on disk');
          }
        }
      } catch (error) {
        console.error(`MenuBar: Error saving file: ${error}`);
        alert('Error saving file. Please try again.');
      }
    } else {
      console.log('MenuBar: No active file to save');
    }
  }

  const handleSaveAll = async () => {
    console.log('MenuBar: Save all files');
    
    try {
      // First save all files to the virtual file system
      saveAllFiles();
      console.log('MenuBar: All files saved in virtual filesystem');
      
      // If File System Access API is supported and we have directory access,
      // save all the files to disk using the project save function
      if (fsApiSupported && hasDirectoryAccess) {
        console.log('MenuBar: Attempting to save all files on disk');
        const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
        
        if (directoryHandle) {
          // Get the current rootNode from the store
          const store = useVSCodeStore.getState();
          const rootNode = store.rootNode;
          
          // Save the entire project to disk
          await BrowserFileSystem.saveProjectToDisk(directoryHandle, rootNode);
          console.log('MenuBar: All files also saved on disk');
        } else {
          console.warn('MenuBar: Could not get directory handle to save all files on disk');
        }
      }
    } catch (error) {
      console.error(`MenuBar: Error saving all files: ${error}`);
      alert('Error saving all files. Please try again.');
    }
  }

  return (
    <div className="flex items-center h-8 px-2 bg-[#3c3c3c] text-[#cccccc] text-xs border-b border-[#252525]">
      {/* Display save to disk button only if we already have directory access */}
      {fsApiSupported && hasDirectoryAccess && (
        <div className="ml-auto mr-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSaveAll}
            title="Save all files to disk"
            className="text-xs"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            Save to Disk
          </Button>
        </div>
      )}
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
            onClick={async () => {
              console.log('MenuBar: Open folder or connect to directory');
              // Check if File System Access API is supported
              if (fsApiSupported) {
                try {
                  // Request access to a directory using the File System Access API
                  const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
                  console.log('MenuBar: Directory handle received:', !!directoryHandle);
                  
                  if (directoryHandle) {
                    // Validate the directory handle
                    const validationResult = await validateDirectoryHandle(directoryHandle);
                    console.log('MenuBar: Directory validation result:', validationResult);
                    
                    if (validationResult.valid) {
                      setHasDirectoryAccess(true);
                      console.log('MenuBar: Directory access confirmed valid');
                      
                      // Get directory name to display in UI
                      const dirName = directoryHandle.name || 'Selected Directory';
                      console.log(`MenuBar: Connected to directory: ${dirName}`);
                      
                      // Scan the directory structure to build a FileNode tree
                      console.log('MenuBar: Scanning directory structure');
                      try {
                        // Start an async process to scan the directory
                        (async () => {
                          const scannedRootNode = await BrowserFileSystem.scanDirectoryToFileNode(directoryHandle);
                          
                          if (scannedRootNode) {
                            console.log('MenuBar: Successfully scanned directory structure', scannedRootNode);
                            
                            // Update the VS Code store with the new root node
                            console.log('MenuBar: Updating store with scanned root node');
                            useVSCodeStore.setState(state => ({
                              ...state,
                              currentPath: `/browser-fs/${dirName}`,
                              rootNode: scannedRootNode,
                            }));
                            
                            // Refresh the explorer with the new root node
                            console.log('MenuBar: Refreshing explorer with scanned root node');
                            document.dispatchEvent(new CustomEvent('refresh-explorer', { detail: { rootNode: scannedRootNode, path: `/browser-fs/${dirName}`, forceRefresh: true } }));
                          } else {
                            console.error('MenuBar: Failed to scan directory structure');
                            setHasDirectoryAccess(false);
                            alert('Failed to scan directory structure');
                          }
                        })();
                      } catch (error) {
                        console.error('MenuBar: Error scanning directory:', error);
                        alert(`Error scanning directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        setHasDirectoryAccess(false);
                      }
                    } else {
                      console.error('MenuBar: Directory validation failed:', validationResult.error);
                      alert(`Could not access directory: ${validationResult.error || 'Unknown error'}`);
                      setHasDirectoryAccess(false);
                    }
                  } else {
                    console.warn('MenuBar: No directory handle received');
                    setHasDirectoryAccess(false);
                  }
                } catch (error) {
                  console.error('MenuBar: Error accessing directory:', error);
                  alert(`Error accessing directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              } else {
                // Fall back to the original behavior if API is not supported
                console.log('MenuBar: File System Access API not supported, using fallback');
                onOpenFolder();
              }
            }}
            className="hover:bg-[#2a2d2e] hover:text-white"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {fsApiSupported ? 'Connect to Directory...' : 'Open Folder...'}
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
