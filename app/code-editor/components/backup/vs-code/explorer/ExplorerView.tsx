"use client";

import { useState, useRef, useEffect } from 'react';
import { FolderPlus, FilePlus, Download, MoreHorizontal } from 'lucide-react';
import { ExplorerViewProps, FileSystemItem, ContextMenuState, ToastMessage } from '../types';
import { FileTreeItem } from './FileTreeItem';
import { fetchFileSystem, fetchFileContent, createNewFile, createNewFolder } from './FileUtils';
import { FolderSelector } from '../../folder-selector';
import { VSCodeFileBrowser } from '../../vs-code-file-browser';
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
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
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
  
  // Helper function to ensure all items in the file structure have proper paths
  const processStructureWithPaths = (items: any, basePath: string): FileSystemItem[] => {
    // Validate that items is an array
    if (!items) {
      console.error('ExplorerView: processStructureWithPaths received null or undefined items');
      return [];
    }
    
    if (!Array.isArray(items)) {
      console.error('ExplorerView: processStructureWithPaths expected an array but received:', typeof items);
      console.log('Value received:', items);
      
      // If it's an object with properties that look like a file structure item, try to convert it
      if (items && typeof items === 'object' && ('name' in items || 'type' in items)) {
        console.log('ExplorerView: Attempting to convert single item to array');
        items = [items];
      } else {
        // Otherwise return an empty array
        return [];
      }
    }
    
    // Now we can safely map over the array
    return items.map((item: any) => {
      if (!item || typeof item !== 'object') {
        console.error('ExplorerView: Invalid item in file structure:', item);
        return null;
      }
      
      // Ensure every item has a path property
      const fullPath = item.path ? item.path : `${basePath}/${item.name || 'unnamed'}`;
      console.log(`ExplorerView: Processing item ${item.name || 'unnamed'}, setting path to ${fullPath}`);
      
      const processedItem: FileSystemItem = {
        ...item,
        path: fullPath,
        // Ensure required properties exist
        name: item.name || 'unnamed',
        type: item.type || 'file'
      };
      
      // Process children recursively if this is a folder
      if (item.type === 'folder' && item.children) {
        processedItem.children = processStructureWithPaths(item.children, fullPath);
      }
      
      return processedItem;
    }).filter(Boolean); // Filter out any null items
  };
  
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
    
    // Add event listener for the refresh-explorer event
    const handleRefreshExplorer = (event: CustomEvent) => {
      console.log('ExplorerView: Received refresh-explorer event with detail:', event.detail);
      
      // Check if a path is provided in the event detail
      if (event.detail && event.detail.path) {
        const folderPath = event.detail.path;
        const forceRefresh = event.detail.forceRefresh === true;
        console.log(`ExplorerView: Refreshing folder with path: ${folderPath}, forceRefresh: ${forceRefresh}`);
        
        // Manual fetch instead of using fetchFileSystem to avoid type issues
        console.log('ExplorerView: Making API request to /api/filesystem');
        setIsLoading(true);
        
        // Use the same API call as fetchFileSystem but with proper typing
        // Add cache-busting parameter if forceRefresh is true
        const cacheBuster = forceRefresh ? `&_=${Date.now()}` : '';
        // Fix the API endpoint URL to match the actual endpoint (filesystem instead of file-system)
        console.log('ExplorerView: Using correct API endpoint: /api/filesystem');
        fetch(`/api/filesystem?path=${encodeURIComponent(folderPath)}${cacheBuster}`)
          .then(response => {
            console.log('ExplorerView: API response status:', response.status);
            if (!response.ok) {
              return response.json().then(errorData => {
                throw new Error(errorData.error || `API error: ${response.status}`);
              });
            }
            return response.json();
          })
          .then(data => {
            // The API returns structure instead of items
            console.log('ExplorerView: File system data received:', data);
            console.log('ExplorerView: Item count:', data.structure?.length || 0);
            
            if (forceRefresh) {
              console.log('ExplorerView: Force refresh requested, clearing any cached data');
              // Could add store reset logic here if needed
            }
            
            if (data.success && Array.isArray(data.structure)) {
              // Process the structure to ensure all items have proper paths
              const processedStructure = processStructureWithPaths(data.structure, folderPath);
              console.log('ExplorerView: Processed file structure with proper paths, count:', processedStructure.length);
              
              setFolderStructure(processedStructure);
              setCurrentPath(folderPath);
              setFolderOpened(true);
              setError(null);
              console.log(`ExplorerView: Explorer view refreshed successfully${forceRefresh ? ' (forced from disk)' : ''}`);
            } else {
              console.error('ExplorerView: API returned unexpected data format:', data);
              setError('Failed to refresh folder: Unexpected data format from API');
              setFolderStructure([]);
            }
          })
          .catch(error => {
            console.error('ExplorerView: Error refreshing folder:', error);
            const errorMessage = `Failed to refresh folder: ${error.message || String(error)}`;
            setError(errorMessage);
            setFolderStructure([]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        console.log('ExplorerView: No path provided in refresh-explorer event');
      }
    };
    
    // Add the event listener - use document instead of window to match how the event is dispatched
    document.addEventListener('refresh-explorer', handleRefreshExplorer as EventListener);
    
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('refresh-explorer', handleRefreshExplorer as EventListener);
    };
  }, []);
  
  // Handle folder selected from the folder selector
  const handleFolderSelected = (folderPath: string) => {
    console.log('Folder selected:', folderPath);
    setIsFolderSelectorOpen(false);
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    // Call fetchFileSystem with all required parameters
    fetchFileSystem(
      folderPath,
      (data: FileSystemItem[]) => {
        // Process the structure to ensure all items have proper paths
        const processedStructure = processStructureWithPaths(data, folderPath);
        console.log('ExplorerView: Processed file structure with proper paths, count:', processedStructure.length);
        setFolderStructure(processedStructure);
      },
      (loading: boolean) => setIsLoading(loading),
      (path: string) => setCurrentPath(path),
      (err: string | null) => setError(err),
      (opened: boolean) => setFolderOpened(opened)
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
  
  // Handle file selected from file browser
  const handleFileSelected = (file: File) => {
    console.log(`File selected from browser: ${file.name}`);
    setIsFilePickerOpen(false);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          const content = e.target.result;
          const fileName = file.name;
          
          // Extract file extension for language detection
          const fileExtension = fileName.split('.').pop() || '';
          
          // Map common extensions to languages (similar to file-content API)
          const languageMap: Record<string, string> = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
            py: 'python',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            cs: 'csharp',
            go: 'go',
            php: 'php',
            rb: 'ruby',
            rs: 'rust',
            swift: 'swift',
            txt: 'plaintext',
            // Add more language mappings as needed
          };
          
          // Generate a unique file ID for this file
          const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          console.log('Generated file ID for browser-selected file:', fileId);
          
          // Store the file ID in our local state
          setOpenFileIds(prev => ({
            ...prev,
            [fileName]: fileId
          }));
          
          // Dispatch the same event used when opening files from folder view
          window.dispatchEvent(new CustomEvent('open-file-in-editor', {
            detail: {
              fileId,
              path: fileName, // Not a real path, just using filename as identifier
              name: fileName,
              content: content,
              language: languageMap[fileExtension] || 'plaintext'
            }
          }));
          
          console.log(`File content loaded and dispatched to editor: ${content.substring(0, 100)}...`);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing selected file:', error);
      setToast({
        message: `Error opening file: ${error}`,
        type: 'error',
        duration: 3000
      });
    }
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
    
    // Close dialog immediately to prevent UI from getting stuck
    setIsNewFileDialogOpen(false);
    
    createNewFile(
      newItemParentPath, 
      newFileName, 
      setToast, 
      refreshExplorerView, 
      // We're still passing this for compatibility, but we've already closed the dialog above
      setIsNewFileDialogOpen
    );
  };
  
  // Handle submitting new folder creation
  const handleNewFolderSubmit = () => {
    console.log('Submitting new folder creation:', newFolderName, 'in folder:', newItemParentPath);
    
    // Close dialog immediately to prevent UI from getting stuck
    setIsNewFolderDialogOpen(false);
    
    createNewFolder(
      newItemParentPath, 
      newFolderName, 
      setToast, 
      refreshExplorerView, 
      // We're still passing this for compatibility, but we've already closed the dialog above
      setIsNewFolderDialogOpen
    );
  };
  
  // Handle file double-click to open in editor
  const handleFileDoubleClick = (item: FileSystemItem) => {
    console.log('Double clicked file:', item.name, 'Path:', item.path);
    
    // Make sure the item has a proper path before fetching content
    if (!item.path && currentPath) {
      console.log('File item missing path, setting path to:', `${currentPath}/${item.name}`);
      item.path = `${currentPath}/${item.name}`;
    }
    
    // Log the path to ensure it's correctly set
    console.log('Fetching file content with path:', item.path);
    
    // Call fetchFileContent with the correct number of parameters
    fetchFileContent(item, setOpenFileIds);
    
    // If there's an error, we'll handle it separately
    // We can add error toast handling here if needed
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
        <div className="p-3 text-center">
          <div className="text-gray-300 text-xs mb-4 mt-6">NO FOLDER OPENED</div>
          <div className="text-gray-400 text-xs mb-4">Select an option below to get started</div>
          <div className="flex flex-col space-y-2 items-center">
            <button
              className="bg-[#0e639c] text-white px-3 py-1.5 rounded hover:bg-[#1177bb] w-full max-w-[200px] text-xs"
              onClick={handleOpenFolder}
            >
              Open Folder
            </button>
            <button
              className="bg-[#3a3d41] text-white px-3 py-1.5 rounded hover:bg-[#45494e] w-full max-w-[200px] border border-[#5f5f5f] text-xs"
              onClick={() => {
                console.log('Open file button clicked');
                setIsFilePickerOpen(true);
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
      <div className="text-xs text-gray-300 mb-2 flex justify-between items-center">
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
      
      {/* File Browser Dialog */}
      <VSCodeFileBrowser
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        onFileSelected={handleFileSelected}
        title="Open File"
        acceptTypes="*.*"
      />

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
