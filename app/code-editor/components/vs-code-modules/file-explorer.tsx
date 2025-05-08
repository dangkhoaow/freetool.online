import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, MoreVertical, Plus, RefreshCw, Trash, Edit, Download, Upload } from 'lucide-react';
import * as BrowserFileSystem from '@/lib/services/browser-file-system-service';
import { FileNode } from '@/lib/services/vs-code-file-system';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// File icon mapping based on file extension
const getFileIcon = (fileName: string): React.ReactNode => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Map extensions to colors
  const extensionColorMap: Record<string, string> = {
    js: '#f1c40f',   // JavaScript - yellow
    ts: '#3498db',   // TypeScript - blue
    jsx: '#f1c40f',  // React JS - yellow
    tsx: '#3498db',  // React TS - blue
    html: '#e74c3c', // HTML - red
    css: '#9b59b6',  // CSS - purple
    json: '#27ae60', // JSON - green
    md: '#7f8c8d',   // Markdown - gray
    py: '#2ecc71',   // Python - green
    java: '#e67e22', // Java - orange
    // Add more as needed
  };
  
  const color = extensionColorMap[extension] || '#95a5a6'; // Default gray
  console.log(`FileExplorer: File icon for ${fileName} using color ${color}`);
  // Using fixed width/height to ensure consistency with all icons
  return (
    <div className="flex items-center justify-center w-5 h-5 mr-1">
      <FileText size={16} style={{ stroke: color }} />
    </div>
  );
};

interface FileExplorerProps {
  rootNode: FileNode;
  expandedFolders: string[];
  selectedNodeId: string | null;
  onSelectNode: (node: FileNode) => void;
  onToggleFolder: (folderId: string) => void;
  onCreateFile: (parentId: string, fileName: string) => void;
  onCreateFolder: (parentId: string, folderName: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onExportFile: (node: FileNode) => void;
  onImportFile: (parentId: string, file: File) => void;
}

export function VSCodeFileExplorer({
  rootNode,
  expandedFolders,
  selectedNodeId,
  onSelectNode,
  onToggleFolder,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  onRenameNode,
  onExportFile,
  onImportFile
}: FileExplorerProps) {
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [newItemName, setNewItemName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nodeToRename, setNodeToRename] = useState<FileNode | null>(null);
  const [newName, setNewName] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  console.log('FileExplorer: Rendering file explorer with root:', rootNode.name);
  console.log('FileExplorer: Number of expanded folders:', expandedFolders.length);
  console.log('FileExplorer: Selected node ID:', selectedNodeId);

  // Helper to find node by ID
  const findNodeById = (node: FileNode, id: string): FileNode | null => {
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  // Create new file or folder
  const handleCreateItem = async () => {
    setErrorMessage(null);
    if (!newItemParentId || !newItemName.trim()) return;
    console.log(`FileExplorer: Creating ${newItemType}: ${newItemName} in ${newItemParentId}`);
    
    // Derive disk directory handle for FS operations
    let dirHandle: FileSystemDirectoryHandle | null = null;
    if (BrowserFileSystem.isFileSystemAccessSupported() && BrowserFileSystem.hasDirectoryHandle()) {
      const rootHandle = BrowserFileSystem.getCurrentDirectoryHandle();
      console.log('FileExplorer: Deriving disk dir handle, root:', !!rootHandle);
      if (rootHandle) {
        dirHandle = rootHandle;
        // Traverse to parent folder
        const segments: string[] = [];
        let curr: FileNode | null = findNodeById(rootNode, newItemParentId);
        while (curr && curr.id !== rootNode.id && curr.parentId) {
          segments.unshift(curr.name);
          curr = findNodeById(rootNode, curr.parentId)!;
        }
        for (const seg of segments) {
          try { dirHandle = await dirHandle.getDirectoryHandle(seg, { create: false }); }
          catch { console.log(`FileExplorer: Couldn't descend into ${seg}`); dirHandle = null; break; }
        }
      }
    }
    // For folder creation, verify it does not already exist on disk
    if (newItemType === 'folder' && dirHandle) {
      try { await dirHandle.getDirectoryHandle(newItemName, { create: false }); setErrorMessage(`Folder "${newItemName}" exists on disk.`); return; }
      catch { console.log('FileExplorer: Folder not on disk, proceeding to create'); }
    }

    // Create in virtual FS
    if (newItemType === 'file') onCreateFile(newItemParentId, newItemName);
    else onCreateFolder(newItemParentId, newItemName);

    // Create on disk if handle available
    if (dirHandle) {
      try {
        if (newItemType === 'file') await BrowserFileSystem.createFile(dirHandle, newItemName, '');
        else await BrowserFileSystem.createFolder(dirHandle, newItemName);
      } catch (err) { console.error('FileExplorer: Error creating on disk:', err); }
    }

    document.dispatchEvent(new CustomEvent('refresh-explorer'));
    setNewItemName(''); setIsDialogOpen(false);
  };

  // Open the create dialog with unique default name
  const openCreateDialog = (parentId: string, type: 'file' | 'folder') => {
    console.log(`FileExplorer: Opening create dialog for ${type} in ${parentId}`);
    setNewItemParentId(parentId);
    setNewItemType(type);
    // Derive a unique default name based on existing children
    const parentNode = findNodeById(rootNode, parentId);
    let defaultName = '';
    if (type === 'file') {
      const ext = 'js';
      const base = 'untitled';
      let idx = 0;
      let name = `${base}.${ext}`;
      while (parentNode?.children?.some(c => c.name === name)) {
        idx++;
        name = `${base}${idx}.${ext}`;
      }
      defaultName = name;
    } else {
      const base = 'New Folder';
      let idx = 0;
      let name = base;
      while (parentNode?.children?.some(c => c.name === name)) {
        idx++;
        name = `${base} ${idx}`;
      }
      defaultName = name;
    }
    setNewItemName(defaultName);
    setIsDialogOpen(true);
    setErrorMessage(null);
  };

  // Handle rename
  const handleRename = () => {
    console.log(`FileExplorer: Renaming node ${nodeToRename?.id} to ${newName}`);
    if (!nodeToRename || !newName.trim()) return;
    
    onRenameNode(nodeToRename.id, newName);
    console.log(`FileExplorer: Node renamed from ${nodeToRename.name} to ${newName}`);
    
    // Reset state
    setNodeToRename(null);
    setNewName('');
    setIsRenameDialogOpen(false);
  };

  // Open rename dialog
  const openRenameDialog = (node: FileNode) => {
    console.log(`FileExplorer: Opening rename dialog for ${node.name}`);
    setNodeToRename(node);
    setNewName(node.name);
    setIsRenameDialogOpen(true);
  };

  // Handle file import (upload)
  const handleFileImport = (parentId: string) => {
    console.log(`FileExplorer: Triggering file import for ${parentId}`);
    setNewItemParentId(parentId);
    fileInputRef.current?.click();
  };

  // Process the selected file
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !newItemParentId) return;
    
    console.log(`FileExplorer: Importing file: ${files[0].name}`);
    onImportFile(newItemParentId, files[0]);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Recursive function to render a node and its children
  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isFolder = node.type === 'directory';
    const isExpanded = expandedFolders.includes(node.id);
    const isSelected = selectedNodeId === node.id;
    const indentPadding = `${depth * 16}px`;
    
    console.log(`FileExplorer: Rendering node ${node.name}, type: ${node.type}, depth: ${depth}`);
    
    return (
      <div key={node.id}>
        <div 
          className={`text-xs flex items-center py-1 cursor-pointer hover:bg-[#2a2d2e] group ${
            isSelected ? 'bg-[#04395e] text-white' : 'text-[#cccccc]'
          }`}
          style={{ paddingLeft: indentPadding }}
          onClick={() => {
            console.log(`FileExplorer: Node selected: ${node.name}`);
            onSelectNode(node);
          }}
        >
          {/* Node tree structure with proper alignment */}
          <div className="flex items-center">
            {/* Chevron for folders or placeholder for files to maintain alignment */}
            <div className="flex items-center justify-center w-5 h-5">
              {isFolder ? (
                <div
                  className="flex items-center justify-center w-full h-full text-[#cccccc] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`FileExplorer: Toggling folder expansion: ${node.name}`);
                    onToggleFolder(node.id);
                  }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              ) : null /* Files have empty chevron space for alignment */}
            </div>
            
            {/* Icon container with fixed dimensions for consistency */}
            <div className="flex items-center justify-center w-5 h-5 mr-1">
              {isFolder ? (
                isExpanded ? (
                  <FolderOpen size={16} className="text-[#dcb67a]" />
                ) : (
                  <Folder size={16} className="text-[#dcb67a]" />
                )
              ) : (
                getFileIcon(node.name)
              )}
            </div>
          </div>
          
          {/* Name */}
          <span className="truncate">{node.name}</span>
          
          {/* Actions dropdown (only visible on hover) */}
          <div className="ml-auto mr-2 opacity-0 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical size={14} className="text-[#cccccc]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
                {isFolder && (
                  <>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`FileExplorer: Create file action for folder: ${node.name}`);
                        openCreateDialog(node.id, 'file');
                      }}
                      className="text-xs hover:bg-[#2a2d2e] hover:text-white"
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-2"><FileText size={16} /></div>
                      New File
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`FileExplorer: Create folder action for folder: ${node.name}`);
                        openCreateDialog(node.id, 'folder');
                      }}
                      className="text-xs hover:bg-[#2a2d2e] hover:text-white"
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-2"><Folder size={16} /></div>
                      New Folder
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => {
                        console.log(`FileExplorer: Import file action for folder: ${node.name}`);
                        handleFileImport(node.id);
                      }}
                      className="text-xs hover:bg-[#2a2d2e] hover:text-white"
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-2"><Upload size={16} /></div>
                      Import File
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#3c3c3c]" />
                  </>
                )}
                
                <DropdownMenuItem 
                  onClick={() => {
                    console.log(`FileExplorer: Rename action for: ${node.name}`);
                    openRenameDialog(node);
                  }}
                  className="text-xs hover:bg-[#2a2d2e] hover:text-white"
                >
                  <div className="flex items-center justify-center w-5 h-5 mr-2"><Edit size={16} /></div>
                  Rename
                </DropdownMenuItem>
                
                {!isFolder && (
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log(`FileExplorer: Export file action for: ${node.name}`);
                      onExportFile(node);
                    }}
                    className="text-xs hover:bg-[#2a2d2e] hover:text-white"
                  >
                    <div className="flex items-center justify-center w-5 h-5 mr-2"><Download size={16} /></div>
                    Export
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={() => {
                    console.log(`FileExplorer: Delete action for: ${node.name}`);
                    onDeleteNode(node.id);
                  }}
                  className="text-xs hover:bg-[#2a2d2e] hover:text-white text-red-400"
                >
                  <div className="flex items-center justify-center w-5 h-5 mr-2"><Trash size={16} /></div>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Render children if folder is expanded */}
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-[#1e1e1e] text-[#cccccc] text-sm overflow-auto">
      {/* Explorer header */}
      <div className="flex justify-between items-center p-2 uppercase text-xs font-semibold text-[#6c6c6c]">
        <span>Explorer</span>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 hover:bg-[#2a2d2e]"
            onClick={() => {
              console.log('FileExplorer: Creating new file in root');
              openCreateDialog(rootNode.id, 'file');
            }}
            title="New File"
          >
            <Plus size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 hover:bg-[#2a2d2e]"
            onClick={() => {
              console.log('FileExplorer: Refreshing explorer');
              // Dispatch a custom event that the parent can listen for
              document.dispatchEvent(new CustomEvent('refresh-explorer'));
            }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>
      
      {/* File tree */}
      <div className="p-1">
        {renderNode(rootNode)}
      </div>
      
      {/* Hidden file input for imports */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelected}
      />
      
      {/* Create item dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-sm">
          <DialogHeader>
            <DialogTitle>{newItemType === 'file' ? 'New File' : 'New Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="itemName" className="text-[#cccccc]">
              {newItemType === 'file' ? 'File Name' : 'Folder Name'}
            </Label>
            <Input
              id="itemName"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="bg-[#3c3c3c] border-[#6b6b6b] text-[#cccccc] mt-2"
              autoFocus
            />
            {errorMessage && <p className="text-red-400 text-sm mt-1">{errorMessage}</p>}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateItem}
              className="bg-[#007acc] text-white hover:bg-[#0062a3]"
              disabled={!newItemName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc] max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename {nodeToRename?.type === 'directory' ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newName" className="text-[#cccccc]">
              New Name
            </Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-[#3c3c3c] border-[#6b6b6b] text-[#cccccc] mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRenameDialogOpen(false)}
              className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              className="bg-[#007acc] text-white hover:bg-[#0062a3]"
              disabled={!newName.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
