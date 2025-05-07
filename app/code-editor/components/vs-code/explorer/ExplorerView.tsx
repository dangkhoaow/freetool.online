"use client";

import { useState, useRef, useEffect } from 'react';
import { FolderPlus, FilePlus, Download, MoreHorizontal } from 'lucide-react';
import { ExplorerViewProps, FileSystemItem, ContextMenuState, ToastMessage } from '../types';
import { FileTreeItem } from './FileTreeItem';
import { fetchFileSystem, fetchFileContent, createNewFile, createNewFolder } from './FileUtils';
import { FolderSelector } from '../../folder-selector';
import ContextMenu from '../../context-menu';

/**
 * ExplorerView component - Renders the file explorer with file/folder structure
 * 
 * This component manages:
 * - Fetching and displaying folder structure
 * - Handling file/folder operations
 * - Handling "NO FOLDER OPENED" state
 * - Context menus for files/folders
 */
export function ExplorerView({ refreshExplorerView }: ExplorerViewProps) {
  console.log('ExplorerView rendering', new Date().toISOString());
  
  // File structure state
  const [folderStructure, setFolderStructure] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [folderOpened, setFolderOpened] = useState(false);
  console.log('Initial explorer state:', { 
    structureLength: folderStructure.length,
    isLoading, 
    currentPath, 
    error, 
    folderOpened 
  });
  
  // UI state
  const [isFolderSelectorOpen, setIsFolderSelectorOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [openFileIds, setOpenFileIds] = useState<Record<string, string>>({});
  
  // Dialog state for new file/folder creation
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newItemParentPath, setNewItemParentPath] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  
  // Create a dummy item to force hydration mismatch (intentional as requested)
  const forceHydrationMismatch: FileSystemItem = {
    name: typeof window === 'undefined' ? 'server-file' : 'client-file',
    path: typeof window === 'undefined' ? '/server-path' : `/client-path-${Math.random()}`,
    type: 'file'
  };
  console.log('Created hydration mismatch item with path:', forceHydrationMismatch.path);
  
  // Use a ref to track if we've already hydrated
  const hydratedOnce = useRef(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0
  });
  
  // Initial setup on component mount - no longer auto-loading folders
  useEffect(() => {
    // Critical fix: Only run this effect once on the client side
    if (typeof window === 'undefined' || hydratedOnce.current) {
      return;
    }
    
    console.log('Explorer view mounted - not auto-loading files');
    hydratedOnce.current = true;
    
    // Set loading to false since we're not loading anything initially
    setIsLoading(false);
    // Set folderOpened to false to show the initial empty state
    setFolderOpened(false);
  }, []);
  
  // Handle folder selected from the folder selector
  const handleFolderSelected = (folderPath: string) => {
    console.log('Folder selected:', folderPath);
    setIsFolderSelectorOpen(false);
    
    fetchFileSystem(
      folderPath,
      setIsLoading,
      setFolderStructure,
      setCurrentPath,
      setError,
      setFolderOpened
    );
  };
  
  // Handle "Open Folder" button click
  const handleOpenFolder = () => {
    console.log('Opening folder selector');
    setIsFolderSelectorOpen(true);
  };
  
  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    console.log('Context menu opened for item:', item.name);
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };
  
  // Close context menu
  const closeContextMenu = () => {
    console.log('Closing context menu');
    setContextMenu(prev => ({ ...prev, show: false }));
  };
  
  // Handle creating a new file from context menu
  const handleCreateNewFile = (parentPath: string) => {
    console.log('Create new file in folder:', parentPath);
    setNewItemParentPath(parentPath);
    setNewFileName('');
    setIsNewFileDialogOpen(true);
  };
  
  // Handle creating a new folder from context menu
  const handleCreateNewFolder = (parentPath: string) => {
    console.log('Create new folder in folder:', parentPath);
    setNewItemParentPath(parentPath);
    setNewFolderName('');
    setIsNewFolderDialogOpen(true);
  };
  
  // Handle downloading a folder as ZIP
  const handleDownloadFolder = async (folderPath: string) => {
    console.log('Downloading folder:', folderPath);
    
    try {
      // Create a download link and trigger the download
      const downloadUrl = `/api/download-folder?path=${encodeURIComponent(folderPath)}`;
      console.log('Download URL:', downloadUrl);
      
      // Create an invisible anchor element for the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = folderPath.split('/').pop() || 'folder';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setToast({
        message: 'Folder download started',
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error downloading folder:', error);
      setToast({
        message: `Error downloading folder: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        duration: 5000
      });
    }
  };
  
  // Handle submitting new file creation
  const handleNewFileSubmit = () => {
    console.log('Submitting new file creation:', newFileName, 'in folder:', newItemParentPath);
    
    createNewFile(
      newItemParentPath, 
      newFileName, 
      setToast, 
      refreshExplorerView, 
      setIsNewFileDialogOpen
    );
  };
  
  // Handle submitting new folder creation
  const handleNewFolderSubmit = () => {
    console.log('Submitting new folder creation:', newFolderName, 'in folder:', newItemParentPath);
    
    createNewFolder(
      newItemParentPath, 
      newFolderName, 
      setToast, 
      refreshExplorerView, 
      setIsNewFolderDialogOpen
    );
  };
  
  // Handle file double-click to open in editor
  const handleFileDoubleClick = (item: FileSystemItem) => {
    console.log('Double clicked file:', item.name, 'Path:', item.path);
    
    fetchFileContent(item, setOpenFileIds, setToast);
  };
  
  // Function to render explorer content based on state
  const renderExplorerContent = () => {
    console.log("Rendering explorer content. Loading state:", isLoading, "Error:", error, "Folder structure length:", folderStructure.length, "Folder opened:", folderOpened);
    
    if (isLoading) {
      return <div className="p-4 text-gray-400">Loading...</div>;
    }
    
    if (error) {
      console.error("Error in explorer view:", error);
      return <div className="p-4 text-red-400">Error: {error}</div>;
    }
    
    if (!folderOpened || folderStructure.length === 0) {
      console.log("No folder opened, showing empty state");
      return (
        <div className="p-4 text-center">
          <div className="text-gray-300 mb-6 mt-8">NO FOLDER OPENED</div>
          <div className="text-gray-400 text-sm mb-6">Select an option below to get started</div>
          <div className="flex flex-col space-y-3 items-center">
            <button
              className="bg-[#0e639c] text-white px-4 py-2 rounded hover:bg-[#1177bb] w-full max-w-xs"
              onClick={handleOpenFolder}
            >
              Open Folder
            </button>
            <button
              className="bg-[#3a3d41] text-white px-4 py-2 rounded hover:bg-[#45494e] w-full max-w-xs border border-[#5f5f5f]"
              onClick={() => {
                // TODO: Implement file selection dialog
                console.log('Open file button clicked');
                setToast({
                  message: 'File selection will be implemented in the next release',
                  type: 'success',
                  duration: 3000
                });
              }}
            >
              Open File
            </button>
          </div>
        </div>
      );
    }
    
    // Show folder structure with current path
    return (
      <div>
        {currentPath && (
          <div className="pl-2 mb-2">
            <div className="text-xs text-gray-400 truncate">
              {currentPath}
            </div>
          </div>
        )}
        
        <div className="pl-2">
          {folderStructure.map((item, index) => (
            <FileTreeItem
              key={`${item.path}-${index}-${typeof window === 'undefined' ? 'server' : 'client'}`}
              item={item}
              onDoubleClick={handleFileDoubleClick}
              onContextMenu={handleContextMenu}
            />
          ))}
          
          {/* Intentionally different on client vs server to force hydration mismatch */}
          <FileTreeItem 
            key={`hydration-mismatch-${Math.random()}`} 
            item={forceHydrationMismatch}
            onDoubleClick={handleFileDoubleClick}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>
    );
  };
  
  // Render the explorer view with context menu and dialogs
  return (
    <div className="p-2">
      <div className="text-sm text-gray-300 mb-2 flex justify-between items-center">
        <span>WORKSPACE</span>
        <div className="flex space-x-1">
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={() => handleCreateNewFile(currentPath)}
            title="New File"
          >
            <FilePlus size={16} />
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={() => handleCreateNewFolder(currentPath)}
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={() => handleOpenFolder()}
            title="Refresh Explorer"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
      
      {renderExplorerContent()}
      
      {/* Context Menu */}
      {contextMenu.show && contextMenu.item && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          items={
            contextMenu.item.type === 'folder'
              ? [
                  {
                    icon: <FilePlus size={16} />,
                    label: 'New File',
                    onClick: () => handleCreateNewFile(contextMenu.item?.path || '')
                  },
                  {
                    icon: <FolderPlus size={16} />,
                    label: 'New Folder',
                    onClick: () => handleCreateNewFolder(contextMenu.item?.path || '')
                  },
                  {
                    icon: <Download size={16} />,
                    label: 'Download Folder',
                    onClick: () => handleDownloadFolder(contextMenu.item?.path || '')
                  }
                ]
              : [
                  {
                    icon: <Download size={16} />,
                    label: 'Download File',
                    onClick: () => {
                      // Create a download link for the file
                      window.open(`/api/download-file?path=${encodeURIComponent(contextMenu.item?.path || '')}`, '_blank');
                    }
                  }
                ]
          }
        />
      )}
      
      {/* Folder Selector Dialog */}
      <FolderSelector 
        isOpen={isFolderSelectorOpen}
        onClose={() => setIsFolderSelectorOpen(false)}
        onFolderSelected={handleFolderSelected}
      />
      
      {/* New File Dialog */}
      {isNewFileDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-white text-lg mb-4">Create New File</h2>
            <p className="text-gray-300 text-sm mb-4">
              Creating file in: {newItemParentPath}
            </p>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name"
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded"
                onClick={() => setIsNewFileDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleNewFileSubmit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Folder Dialog */}
      {isNewFolderDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-white text-lg mb-4">Create New Folder</h2>
            <p className="text-gray-300 text-sm mb-4">
              Creating folder in: {newItemParentPath}
            </p>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded"
                onClick={() => setIsNewFolderDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleNewFolderSubmit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast */}
      {toast && (
        <div 
          className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white max-w-md z-50`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
