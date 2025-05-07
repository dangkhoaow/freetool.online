import { FileSystemItem, ToastMessage } from '../types';
import { create } from 'zustand';

// Import the VS Code store functions for proper integration
import useVSCodeStore from '@/app/code-editor/store/vs-code-store';

// Add detailed logging for debugging purposes

/**
 * Fetch the file system structure from the server
 * @param path The path to fetch
 * @param setFolderStructure Function to set folder structure
 * @param setIsLoading Function to set loading state
 * @param setCurrentPath Function to set current path
 * @param setError Function to set error
 * @param setFolderOpened Function to set folder opened state
 */
export const fetchFileSystem = async (
  path: string,
  setFolderStructure: (data: FileSystemItem[]) => void,
  setIsLoading: (loading: boolean) => void,
  setCurrentPath: (path: string) => void,
  setError: (error: string | null) => void,
  setFolderOpened: (opened: boolean) => void
) => {
  console.log('FileUtils: fetchFileSystem called with path:', path);
  setIsLoading(true);
  console.log('FileUtils: setIsLoading set to true');
  
  try {
    console.log('FileUtils: Making API request to /api/filesystem');
    // Fix the API endpoint URL to match the actual endpoint (filesystem instead of file-system)
    const response = await fetch(`/api/filesystem?path=${encodeURIComponent(path)}`);
    console.log('FileUtils: API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('FileUtils: API returned error:', errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('FileUtils: File system data received, item count:', data.items?.length || 0);
    
    setFolderStructure(data.items || []);
    console.log('FileUtils: Folder structure updated with', data.items?.length || 0, 'items');
    
    setCurrentPath(path);
    console.log('FileUtils: Current path set to:', path);
    
    setFolderOpened(true);
    console.log('FileUtils: Folder opened state set to true');
    
    setError(null);
    console.log('FileUtils: Error state cleared');
  } catch (error) {
    console.error('FileUtils: Error fetching file system:', error);
    const errorMessage = `Failed to load folder: ${error instanceof Error ? error.message : String(error)}`;
    console.log('FileUtils: Setting error message:', errorMessage);
    
    setError(errorMessage);
    setFolderStructure([]);
    console.log('FileUtils: Folder structure reset to empty array');
  } finally {
    setIsLoading(false);
    console.log('FileUtils: setIsLoading set to false');
  }
};

/**
 * Fetch file content from the server
 * @param item The file item to fetch content for
 * @param setOpenFileIds Function to set open file IDs
 */
export const fetchFileContent = async (
  item: FileSystemItem,
  setOpenFileIds: (callback: (prev: Record<string, string>) => Record<string, string>) => void,
) => {
  console.log('FileUtils: fetchFileContent called for item:', item.name, 'at path:', item.path);
  
  // Verify this is a file type
  if (item.type !== 'file') {
    console.error('FileUtils: Cannot fetch content for non-file item type:', item.type);
    return;
  }
  
  try {
    console.log('FileUtils: Making API request to /api/file-content');
    const response = await fetch(`/api/file-content?path=${encodeURIComponent(item.path)}`);
    console.log('FileUtils: API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('FileUtils: API returned error:', errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`FileUtils: File content loaded, first ${Math.min(100, data.content.length)} chars:`, 
      data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''));
    console.log('FileUtils: Content language detected as:', data.language);
    
    // Generate a unique file ID for this file
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log('FileUtils: Generated file ID:', fileId);
    
    // Store the file ID in our local state
    setOpenFileIds(prev => {
      const newState = {
        ...prev,
        [item.path]: fileId
      };
      console.log('FileUtils: Updated openFileIds mapping:', newState);
      return newState;
    });
    
    // Dispatch the event to open the file in the editor
    console.log('FileUtils: Dispatching open-file-in-editor event with details:', {
      fileId,
      path: item.path,
      name: item.name,
      contentLength: data.content.length,
      language: data.language,
      realPath: item.path // Log that we're including realPath
    });
    
    // Create the event detail with the file path explicitly set as the realPath
    const eventDetail = {
      fileId,
      path: item.path,
      name: item.name,
      content: data.content,
      language: data.language,
      realPath: item.path // Important: This is the real disk path for saving
    };
    
    // Dispatch the event using document instead of window for consistency
    document.dispatchEvent(new CustomEvent('open-file-in-editor', {
      detail: eventDetail
    }));
    
    console.log('FileUtils: Included realPath in event to ensure file can be saved to disk:', item.path);
    console.log('FileUtils: Full event detail:', eventDetail);
    
    console.log('FileUtils: Event dispatched successfully');
  } catch (error) {
    console.error('FileUtils: Error fetching file content:', error);
    const errorMessage = `Error opening file: ${error instanceof Error ? error.message : String(error)}`;
    console.log('FileUtils: Setting error toast with message:', errorMessage);
    
  }
};

/**
 * Create a new file
 * 
 * This version integrates with the VS Code store to create files in memory
 * while also supporting API-based file creation when a real path is provided
 * 
 * @param parentPath The parent folder path or parent node ID
 * @param fileName The file name
 * @param setToast Optional function to set toast message
 * @param refreshExplorerView Optional function to refresh explorer view
 * @param closeDialog Optional function to close the dialog
 */
export const createNewFile = async (
  parentPath: string,
  fileName: string,
  setToast?: (toast: ToastMessage | null) => void,
  refreshExplorerView?: () => void,
  closeDialog?: (open: boolean) => void
) => {
  console.log(`FileUtils: createNewFile called with fileName: ${fileName}, parentPath: ${parentPath}`);
  
  // Validate input
  if (!fileName.trim()) {
    console.log('FileUtils: File name is empty');
    if (setToast) {
      
    }
    return;
  }
  
  try {
    // First try to find the node in the VS Code store (it might be a node ID)
    const vscodeStore = useVSCodeStore.getState();
    const parentNode = vscodeStore.rootNode;
    
    console.log('FileUtils: Attempting to create file in VS Code store');
    
    // Use the VS Code store to create the file in memory
    vscodeStore.createNewFile(parentPath, fileName);
    console.log('FileUtils: File created in VS Code store memory');
    
    // If this is a real file system path, also create it via the API
    if (parentPath.startsWith('/') && setToast && refreshExplorerView) {
      console.log('FileUtils: Real path detected, creating via API as well');
      // Create a file in the real file system via API
      const fullPath = `${parentPath}/${fileName}`;
      console.log('FileUtils: Full file path:', fullPath);
      
      try {
        // Fix API endpoint to match the correct one (filesystem instead of file-operation)
        console.log('FileUtils: Using correct API endpoint: /api/filesystem');
        const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'createFile',
          path: fullPath
        })
      });
      
      console.log('FileUtils: API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('FileUtils: API returned error:', errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      // Don't try to parse JSON again - the response has already been consumed
      // Simply acknowledge successful response
      console.log('Create file API response success:', response.status);
      } catch (apiError) {
        console.error('FileUtils: API error creating file:', apiError);
        // Show error toast but don't prevent dialog from closing
        if (setToast) {
          const errorMessage = `Error creating file on disk: ${apiError instanceof Error ? apiError.message : String(apiError)}`;
          setToast({
            message: errorMessage,
            type: 'error',
            duration: 5000
          });
        }
        // Continue with the rest of the function - we'll still close the dialog
      }
    }
    
    // Handle UI updates if the callbacks are provided
    if (closeDialog) {
      console.log('FileUtils: Closing dialog');
      closeDialog(false);
    }
    
    if (refreshExplorerView) {
      console.log('FileUtils: Refreshing explorer view');
      refreshExplorerView();
    }
    
    // Show success toast if the callback is provided
    if (setToast) {
      const successMessage = `File "${fileName}" created successfully`;
      console.log('FileUtils: Showing success toast:', successMessage);
      setToast({
        message: successMessage,
        type: 'success',
        duration: 3000
      });
    }
    
    console.log('FileUtils: File created successfully');
    
  } catch (error) {
    console.error('FileUtils: Error creating file:', error);
    
    // Format error message and show toast if the callback is provided
    if (setToast) {
      const errorMessage = `Error creating file: ${error instanceof Error ? error.message : String(error)}`;
      console.log('FileUtils: Showing error toast:', errorMessage);
      setToast({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
    }
    
    // Make sure we still close the dialog even if there's an error
    if (closeDialog) {
      console.log('FileUtils: Closing dialog after error');
      closeDialog(false);
    }
  }
};

/**
 * Create a new folder
 * 
 * This version integrates with the VS Code store to create folders in memory
 * while also supporting API-based folder creation when a real path is provided
 * 
 * @param parentPath The parent folder path or parent node ID
 * @param folderName The folder name
 * @param setToast Optional function to set toast message
 * @param refreshExplorerView Optional function to refresh explorer view
 * @param closeDialog Optional function to close the dialog
 */
export const createNewFolder = async (
  parentPath: string,
  folderName: string,
  setToast?: (toast: ToastMessage | null) => void,
  refreshExplorerView?: () => void,
  closeDialog?: (open: boolean) => void
) => {
  console.log(`FileUtils: createNewFolder called with folderName: ${folderName}, parentPath: ${parentPath}`);
  
  // Validate input
  if (!folderName.trim()) {
    console.log('FileUtils: Folder name is empty');
    return;
  }
  
  try {
    // First try to find the node in the VS Code store (it might be a node ID)
    const vscodeStore = useVSCodeStore.getState();
    const parentNode = vscodeStore.rootNode;
    
    console.log('FileUtils: Attempting to create folder in VS Code store');
    
    // Use the VS Code store to create the folder in memory
    // Unfortunately, VS Code store doesn't have a native createNewFolder function, 
    // so we'll create a special file that represents a folder
    vscodeStore.createNewFile(parentPath, folderName, '', 'folder');
    console.log('FileUtils: Folder created in VS Code store memory');
    
    // If this is a real file system path, also create it via the API
    if (parentPath.startsWith('/') && setToast && refreshExplorerView) {
      console.log('FileUtils: Creating folder on disk via API');
      // Create folder on disk via API
      const fullPath = `${parentPath}/${folderName}`;
      console.log('FileUtils: Full folder path:', fullPath);
      
      try {
        // Fix API endpoint to match the correct one (filesystem instead of file-operation)
        console.log('FileUtils: Using correct API endpoint for folder creation: /api/filesystem');
        const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'createFolder',
          path: fullPath
        })
      });
      
      console.log('FileUtils: API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('FileUtils: API returned error:', errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      // Don't try to parse JSON again - the response has already been consumed
      // Simply acknowledge successful response
      console.log('Create folder API response success:', response.status);
      } catch (apiError) {
        console.error('FileUtils: API error creating folder:', apiError);
        // Show error toast but don't prevent dialog from closing
        if (setToast) {
          const errorMessage = `Error creating folder on disk: ${apiError instanceof Error ? apiError.message : String(apiError)}`;
          setToast({
            message: errorMessage,
            type: 'error',
            duration: 5000
          });
        }
        // Continue with the rest of the function - we'll still close the dialog
      }
    }
    
    // Handle UI updates if the callbacks are provided
    if (closeDialog) {
      console.log('FileUtils: Closing dialog');
      closeDialog(false);
    }
    
    if (refreshExplorerView) {
      console.log('FileUtils: Refreshing explorer view');
      refreshExplorerView();
    }
    
    // Show success toast if the callback is provided
    if (setToast) {
      const successMessage = `Folder "${folderName}" created successfully`;
      console.log('FileUtils: Showing success toast:', successMessage);
      setToast({
        message: successMessage,
        type: 'success',
        duration: 3000
      });
    }
    
    console.log('FileUtils: Folder created successfully');
    
  } catch (error) {
    console.error('FileUtils: Error creating folder:', error);
    
    // Format error message and show toast if the callback is provided
    if (setToast) {
      const errorMessage = `Error creating folder: ${error instanceof Error ? error.message : String(error)}`;
      console.log('FileUtils: Showing error toast:', errorMessage);
      setToast({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
    }
    
    // Make sure we still close the dialog even if there's an error
    if (closeDialog) {
      console.log('FileUtils: Closing dialog after error');
      closeDialog(false);
    }
  }
};
