"use client";

import { FileSystemItem, ToastMessage } from '../types';

/**
 * FileUtils - Handles file operations for the explorer component
 * 
 * This module contains utilities for fetching files, creating new files,
 * downloading folders, and other file system operations.
 */

/**
 * Fetch folder structure from the API
 * 
 * @param path - Path to fetch structure for
 * @param setIsLoading - State setter for loading state
 * @param setFolderStructure - State setter for folder structure
 * @param setCurrentPath - State setter for current path
 * @param setError - State setter for error state
 * @param setFolderOpened - State setter for folder opened state
 * @returns Promise<boolean> - Success status
 */
export async function fetchFileSystem(
  path: string = '',
  setIsLoading: (loading: boolean) => void,
  setFolderStructure: (structure: FileSystemItem[]) => void,
  setCurrentPath: (path: string) => void,
  setError: (error: string | null) => void,
  setFolderOpened: (opened: boolean) => void,
): Promise<boolean> {
  console.log('Fetching filesystem from API with path:', path);
  setIsLoading(true);
  
  try {
    // If path doesn't start with /, add it
    let pathToFetch = path;
    if (!pathToFetch.startsWith('/')) {
      pathToFetch = `${process.cwd()}/${pathToFetch}`;
      console.log('Path was relative, converted to absolute path:', pathToFetch);
    }
    
    console.log('Using project path:', pathToFetch);
    
    const response = await fetch(`/api/filesystem?path=${encodeURIComponent(pathToFetch)}&maxDepth=10`);
    console.log('Filesystem API response received with status:', response.status);
    
    if (!response.ok) {
      console.error('Error response from filesystem API:', response.status);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Filesystem data parsed, success:', data.success);
    
    if (data.success) {
      console.log(`Setting folder structure with ${data.structure.length} root items`);
      console.log('Current path set to:', data.path);
      setFolderStructure(data.structure);
      setCurrentPath(data.path);
      setError(null);
      // Mark that a folder has been successfully opened
      setFolderOpened(true);
      console.log('Folder successfully opened, updating folderOpened state to true');
      return true; // Successfully loaded files
    } else {
      console.error('API returned error:', data.error);
      setError(data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error fetching filesystem:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
    return false;
  } finally {
    console.log('Fetch complete, setting loading to false');
    setIsLoading(false);
  }
}

/**
 * Fetch file content from the API
 * 
 * @param item - File item to fetch content for
 * @param setOpenFileIds - State setter for open file IDs
 * @param setToast - State setter for toast messages
 * @returns Promise<void>
 */
export async function fetchFileContent(
  item: FileSystemItem,
  setOpenFileIds: (setter: (prev: Record<string, string>) => Record<string, string>) => void,
  setToast: (toast: ToastMessage | null) => void,
): Promise<void> {
  console.log('Fetching file content from API for:', item.name, 'Path:', item.path);
  
  try {
    const response = await fetch(`/api/file-content?path=${encodeURIComponent(item.path)}`);
    
    if (!response.ok) {
      console.error('Error response from file content API:', response.status);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('File content API response parsed, success:', data.success);
    
    if (data.success) {
      console.log('File content loaded, dispatching event to editor');
      
      // Generate a unique ID for this file
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log('Generated file ID:', fileId);
      
      // Store the file ID for this path
      setOpenFileIds(prev => ({
        ...prev,
        [item.path]: fileId
      }));
      
      // Dispatch an event to notify the editor to open this file
      window.dispatchEvent(new CustomEvent('open-file-in-editor', {
        detail: {
          fileId,
          path: item.path,
          name: item.name || data.name,
          content: data.content,
          language: data.language
        }
      }));
    } else {
      console.error('API returned unsuccessful status:', data.error);
      throw new Error(data.error || 'Unknown error fetching file');
    }
  } catch (error) {
    console.error('Error opening file:', error);
    // Show error in UI
    setToast({
      message: `Error opening file: ${error instanceof Error ? error.message : String(error)}`,
      type: 'error',
      duration: 5000
    });
  }
}

/**
 * Create a new file
 * 
 * @param parentPath - Parent folder path
 * @param fileName - Name of new file
 * @param setToast - State setter for toast messages
 * @param refreshExplorerView - Function to refresh explorer view
 * @param setIsNewFileDialogOpen - State setter for new file dialog
 * @returns Promise<void>
 */
export async function createNewFile(
  parentPath: string,
  fileName: string,
  setToast: (toast: ToastMessage | null) => void,
  refreshExplorerView: () => void,
  setIsNewFileDialogOpen: (open: boolean) => void,
): Promise<void> {
  console.log('Creating new file:', fileName, 'in folder:', parentPath);
  
  if (!fileName) {
    console.error('Cannot create file: No file name provided');
    setToast({
      message: 'Please enter a file name',
      type: 'error',
      duration: 3000
    });
    return;
  }
  
  try {
    const filePath = `${parentPath}/${fileName}`;
    console.log('Full file path:', filePath);
    
    const response = await fetch('/api/create-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: filePath,
        content: ''
      }),
    });
    
    const data = await response.json();
    console.log('Create file API response:', data);
    
    if (data.success) {
      setIsNewFileDialogOpen(false);
      refreshExplorerView();
      console.log('File created successfully');
      
      setToast({
        message: `File ${fileName} created successfully`,
        type: 'success',
        duration: 3000
      });
    } else {
      throw new Error(data.error || 'Unknown error creating file');
    }
  } catch (error) {
    console.error('Error creating file:', error);
    setToast({
      message: `Error creating file: ${error instanceof Error ? error.message : String(error)}`,
      type: 'error',
      duration: 5000
    });
  }
}

/**
 * Create a new folder
 * 
 * @param parentPath - Parent folder path
 * @param folderName - Name of new folder
 * @param setToast - State setter for toast messages
 * @param refreshExplorerView - Function to refresh explorer view
 * @param setIsNewFolderDialogOpen - State setter for new folder dialog
 * @returns Promise<void>
 */
export async function createNewFolder(
  parentPath: string,
  folderName: string,
  setToast: (toast: ToastMessage | null) => void,
  refreshExplorerView: () => void,
  setIsNewFolderDialogOpen: (open: boolean) => void,
): Promise<void> {
  console.log('Creating new folder:', folderName, 'in folder:', parentPath);
  
  if (!folderName) {
    console.error('Cannot create folder: No folder name provided');
    setToast({
      message: 'Please enter a folder name',
      type: 'error',
      duration: 3000
    });
    return;
  }
  
  try {
    const folderPath = `${parentPath}/${folderName}`;
    console.log('Full folder path:', folderPath);
    
    const response = await fetch('/api/create-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: folderPath,
      }),
    });
    
    const data = await response.json();
    console.log('Create folder API response:', data);
    
    if (data.success) {
      setIsNewFolderDialogOpen(false);
      refreshExplorerView();
      console.log('Folder created successfully');
      
      setToast({
        message: `Folder ${folderName} created successfully`,
        type: 'success',
        duration: 3000
      });
    } else {
      throw new Error(data.error || 'Unknown error creating folder');
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    setToast({
      message: `Error creating folder: ${error instanceof Error ? error.message : String(error)}`,
      type: 'error',
      duration: 5000
    });
  }
}
