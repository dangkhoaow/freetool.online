import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, MoreVertical, Plus, RefreshCw, Trash, Edit, Download, Upload } from 'lucide-react';
import { FileNode } from '@/lib/services/vs-code-file-system';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  return <FileText className="h-4 w-4 mr-1.5" style={{ stroke: color }} />;
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
  
  console.log('Rendering file explorer with root:', rootNode.name);

  // Create new file or folder
  const handleCreateItem = () => {
    console.log(`Creating ${newItemType}: ${newItemName} in ${newItemParentId}`);
    if (!newItemParentId || !newItemName.trim()) return;
    
    if (newItemType === 'file') {
      onCreateFile(newItemParentId, newItemName);
    } else {
      onCreateFolder(newItemParentId, newItemName);
    }
    
    // Reset state
    setNewItemName('');
    setIsDialogOpen(false);
  };

  // Open the create dialog
  const openCreateDialog = (parentId: string, type: 'file' | 'folder') => {
    console.log(`Opening create dialog for ${type} in ${parentId}`);
    setNewItemParentId(parentId);
    setNewItemType(type);
    setNewItemName(type === 'file' ? 'untitled.js' : 'New Folder');
    setIsDialogOpen(true);
  };

  // Handle rename
  const handleRename = () => {
    console.log(`Renaming node ${nodeToRename?.id} to ${newName}`);
    if (!nodeToRename || !newName.trim()) return;
    
    onRenameNode(nodeToRename.id, newName);
    
    // Reset state
    setNodeToRename(null);
    setNewName('');
    setIsRenameDialogOpen(false);
  };

  // Open rename dialog
  const openRenameDialog = (node: FileNode) => {
    console.log(`Opening rename dialog for ${node.name}`);
    setNodeToRename(node);
    setNewName(node.name);
    setIsRenameDialogOpen(true);
  };

  // Handle file import (upload)
  const handleFileImport = (parentId: string) => {
    console.log(`Triggering file import for ${parentId}`);
    fileInputRef.current?.click();
  };

  // Process the selected file
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !newItemParentId) return;
    
    console.log(`Importing file: ${files[0].name}`);
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
    
    return (
      <div key={node.id}>
        <div 
          className={`flex items-center py-1 cursor-pointer hover:bg-[#2a2d2e] group ${
            isSelected ? 'bg-[#04395e] text-white' : 'text-[#cccccc]'
          }`}
          style={{ paddingLeft: indentPadding }}
          onClick={() => onSelectNode(node)}
        >
          {/* Folder toggle or spacing for files */}
          {isFolder ? (
            <span 
              className="w-4 flex justify-center text-[#cccccc]"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFolder(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          ) : (
            <span className="w-4" />
          )}
          
          {/* Icon */}
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 mr-1.5 text-[#dcb67a]" />
            ) : (
              <Folder className="h-4 w-4 mr-1.5 text-[#dcb67a]" />
            )
          ) : (
            getFileIcon(node.name)
          )}
          
          {/* Name */}
          <span className="truncate">{node.name}</span>
          
          {/* Actions dropdown (only visible on hover) */}
          <div className="ml-auto mr-2 opacity-0 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <MoreVertical className="h-3 w-3 text-[#cccccc]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
                {isFolder && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => openCreateDialog(node.id, 'file')}
                      className="hover:bg-[#2a2d2e] hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New File
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openCreateDialog(node.id, 'folder')}
                      className="hover:bg-[#2a2d2e] hover:text-white"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      New Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFileImport(node.id)}
                      className="hover:bg-[#2a2d2e] hover:text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </DropdownMenuItem>
                  </>
                )}
                {!isFolder && (
                  <DropdownMenuItem 
                    onClick={() => onExportFile(node)}
                    className="hover:bg-[#2a2d2e] hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => openRenameDialog(node)}
                  className="hover:bg-[#2a2d2e] hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteNode(node.id)}
                  className="hover:bg-[#2a2d2e] hover:text-white text-red-400 hover:text-red-300"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Children (if folder and expanded) */}
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto bg-[#1e1e1e] text-sm">
      {/* Explorer header with actions */}
      <div className="flex items-center justify-between p-2 text-[#cccccc] border-b border-[#3c3c3c]">
        <span className="font-medium text-xs uppercase">Explorer</span>
        <TooltipProvider>
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-[#2a2d2e]"
                  onClick={() => openCreateDialog(rootNode.id, 'file')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                New File
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-[#2a2d2e]"
                  onClick={() => openCreateDialog(rootNode.id, 'folder')}
                >
                  <Folder className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                New Folder
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-[#2a2d2e]"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Refresh Explorer
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      {/* File tree */}
      <div className="py-1">
        {renderNode(rootNode)}
      </div>
      
      {/* New item dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#252526] text-[#cccccc] border-[#3c3c3c]">
          <DialogHeader>
            <DialogTitle>{newItemType === 'file' ? 'New File' : 'New Folder'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name" className="text-[#cccccc]">
              Name
            </Label>
            <Input
              id="name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              className="mt-2 bg-[#3c3c3c] border-[#6c6c6c] text-white"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateItem}
              className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-[#252526] text-[#cccccc] border-[#3c3c3c]">
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
              autoFocus
              className="mt-2 bg-[#3c3c3c] border-[#6c6c6c] text-white"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRenameDialogOpen(false)}
              className="bg-transparent border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file input for import */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
}
