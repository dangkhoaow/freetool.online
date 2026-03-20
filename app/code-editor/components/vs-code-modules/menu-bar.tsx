"use client"

import React, { useRef, useState, useEffect } from 'react'
import JSZip from 'jszip'
import { FileNode } from '@/lib/services/vs-code-file-system'
import { findNodeById } from '@/lib/services/vs-code-file-system'
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
import { STORAGE_KEYS, logAllStorageKeys } from '../../utils/storage-utils'

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
    console.log('MenuBar: Building zip archive for folder:', folderPath);

    const store = useVSCodeStore.getState();
    const rootNode = store.rootNode;
    const zipName = folderPath.split('/').pop() || rootNode.name || 'project';
    const zip = new JSZip();

    const addNodeToZip = (node: FileNode, zipFolder: JSZip) => {
      if (node.type === 'file') {
        zipFolder.file(node.name, node.content || '');
        return;
      }

      node.children?.forEach((child) => {
        if (child.type === 'directory') {
          const childFolder = zipFolder.folder(child.name);
          if (childFolder) {
            addNodeToZip(child, childFolder);
          }
          return;
        }

        zipFolder.file(child.name, child.content || '');
      });
    };

    const projectFolder = zip.folder(zipName);
    if (!projectFolder) {
      throw new Error('Unable to create zip archive');
    }

    if (rootNode.type === 'directory') {
      if (rootNode.children?.length) {
        rootNode.children.forEach((child) => {
          if (child.type === 'directory') {
            const childFolder = projectFolder.folder(child.name);
            if (childFolder) {
              addNodeToZip(child, childFolder);
            }
            return;
          }

          projectFolder.file(child.name, child.content || '');
        });
      }
    } else {
      projectFolder.file(rootNode.name, rootNode.content || '');
    }

    // Create a blob from the archive
    const blob = await zip.generateAsync({ type: 'blob' });
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipName}.zip`;
    
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
        if (fsApiSupported) {
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
        if (fsApiSupported) {
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
        
        // If File System Access API is supported,
        // also save to disk
        if (fsApiSupported) {
          console.log('MenuBar: Attempting to save file on disk');
          const rootHandle = BrowserFileSystem.getCurrentDirectoryHandle() || await BrowserFileSystem.requestDirectoryAccess();
          if (!rootHandle) {
            console.warn('MenuBar: No directory handle for saving');
          } else {
            const store = useVSCodeStore.getState();
            const fileNode = findNodeById(store.rootNode, activeFileId);
            if (fileNode) {
              const segments: string[] = [];
              let curr = fileNode;
              while (curr.parentId && curr.parentId !== rootNodeId) {
                const parent = findNodeById(store.rootNode, curr.parentId);
                if (!parent) break;
                segments.push(parent.name);
                curr = parent;
              }
              const fileName = fileNode.name;
              let targetHandle = rootHandle;
              for (const seg of segments.reverse()) {
                targetHandle = await targetHandle.getDirectoryHandle(seg, { create: false });
              }
              await BrowserFileSystem.createFile(targetHandle, fileName, editorContent);
              console.log(`MenuBar: File saved on disk: ${fileName}`);
            }
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
      
      // If File System Access API is supported,
      // save all the files to disk using the project save function
      if (fsApiSupported) {
        console.log('MenuBar: Attempting to save all files on disk');
        const rootHandle = BrowserFileSystem.getCurrentDirectoryHandle() || await BrowserFileSystem.requestDirectoryAccess();
        const directoryHandle = rootHandle;
        
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

      {/* File Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-2 py-1 hover:bg-[#505050] rounded">File</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] min-w-[200px]">
          <DropdownMenuItem 
            onClick={onOpenFile}
            className="text-xs hover:bg-[#2a2d2e] hover:text-white"
          >
            <File className="h-4 w-4 mr-2" />
            Open File... <span className="text-xs ml-auto opacity-60">Ctrl+O</span>
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
                          if (!scannedRootNode) {
                            console.error('MenuBar: Failed to scan directory structure');
                            setHasDirectoryAccess(false);
                            alert('Failed to scan directory structure');
                            return;
                          }
                          // Filter out hidden items
                          const filterHidden = (node: FileNode): FileNode => ({
                            ...node,
                            children: node.children
                              ?.filter(c => !c.name.startsWith('.'))
                              .map(filterHidden),
                          });
                          const filteredRootNode = filterHidden(scannedRootNode);
                          console.log('MenuBar: Filtered hidden items from scan', filteredRootNode);

                          // Update store and refresh explorer
                          console.log('MenuBar: Updating store with scanned root node');
                          useVSCodeStore.setState(state => ({
                            ...state,
                            currentPath: `/browser-fs/${dirName}`,
                            rootNode: filteredRootNode,
                          }));
                          console.log('MenuBar: Refreshing explorer with scanned root node');
                          document.dispatchEvent(new CustomEvent('refresh-explorer', { detail: { rootNode: filteredRootNode, path: `/browser-fs/${dirName}`, forceRefresh: true } }));
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
            className="text-xs hover:bg-[#2a2d2e] hover:text-white"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {fsApiSupported ? 'Connect to Directory...' : 'Open Folder...'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem 
            onClick={handleSave}
            className={`${activeFileId ? 'text-xs hover:bg-[#2a2d2e] hover:text-white' : 'text-xs opacity-50 cursor-not-allowed'}`}
            disabled={!activeFileId}
          >
            <Save className="h-4 w-4 mr-2" />
            Save <span className="text-xs ml-auto opacity-60">Ctrl+S</span>
          </DropdownMenuItem>
          {fsApiSupported && (
          <DropdownMenuItem 
            onClick={handleSaveAll}
            className="text-xs hover:bg-[#2a2d2e] hover:text-white"
          >
            <SaveAll className="h-4 w-4 mr-2" />
            Save All to Disk<span className="ml-auto opacity-60">Ctrl+Shift+S</span>
          </DropdownMenuItem>
          )}
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
            className="text-xs hover:bg-[#2a2d2e] hover:text-white"
          >
            <Code className="h-4 w-4 mr-2" />
            Toggle Word Wrap <span className="text-xs ml-auto opacity-60">Alt+Z</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#3c3c3c]" />
          
          <DropdownMenuItem
            onClick={() => {
              console.log('MenuBar: Zoom in action');
              onZoomIn();
            }}
            className="text-xs hover:bg-[#2a2d2e] hover:text-white"
          >
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom In <span className="text-xs ml-auto opacity-60">Ctrl++</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              console.log('MenuBar: Zoom out action');
              onZoomOut();
            }}
            className="text-xs hover:bg-[#2a2d2e] hover:text-white"
          >
            <ZoomOut className="h-4 w-4 mr-2" />
            Zoom Out <span className="text-xs ml-auto opacity-60">Ctrl+-</span>
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
