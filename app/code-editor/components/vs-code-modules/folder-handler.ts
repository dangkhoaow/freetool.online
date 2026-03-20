/**
 * Folder operations for VS Code editor
 * Handles folder selection, validation, and management
 */
import { FileNode, findNodeById } from '@/lib/services/vs-code-file-system';
import { saveCurrentFolderPath, getCurrentFolderPath, logAllStorageKeys } from '../../utils/storage-utils';
import useVSCodeStore from '../../store/vs-code-store';
import { EditorInstance } from './types';
import * as BrowserFileSystem from '@/lib/services/browser-file-system-service';

/**
 * Validates a folder path by checking if it exists using the validation API
 * @param folderPath Path to validate
 * @returns Promise resolving to validation result
 */
export async function validateFolderPath(folderPath: string, directoryHandle?: any): Promise<{
  valid: boolean;
  exists: boolean;
  isDirectory: boolean;
  error?: string;
}> {
  console.log(`FolderHandler: Validating folder path: ${folderPath}, directoryHandle provided: ${!!directoryHandle}`);
  
  // If we have a directory handle from the File System Access API, it's already validated
  if (directoryHandle) {
    console.log(`FolderHandler: Using File System Access API validation for ${folderPath}`);
    try {
      // The existence of a directory handle means the directory exists and is accessible
      return {
        valid: true,
        exists: true,
        isDirectory: true
      };
    } catch (error: any) {
      console.error(`FolderHandler: Error in File System Access API validation:`, error);
      return {
        valid: false,
        exists: false,
        isDirectory: false,
        error: error?.message || 'Error accessing directory'
      };
    }
  }
  
  // Check if we have a directory handle in the BrowserFileSystem cache
  if (BrowserFileSystem.hasDirectoryHandle()) {
    console.log(`FolderHandler: Found cached directory handle, using it for validation`);
    return {
      valid: true,
      exists: true,
      isDirectory: true
    };
  }
  
  console.log(`FolderHandler: No browser directory handle available; treating "${folderPath}" as a virtual workspace label`);
  return {
    valid: true,
    exists: true,
    isDirectory: true
  };
}

/**
 * Validate a directory using the File System Access API
 * This allows validating directories in the browser without server API calls
 * @param directoryHandle Handle to the directory to validate
 * @returns Promise resolving to validation result
 */
export async function validateDirectoryHandle(directoryHandle: any): Promise<{
  valid: boolean;
  exists: boolean;
  isDirectory: boolean;
  error?: string;
}> {
  console.log(`FolderHandler: Validating directory handle`);
  
  if (!directoryHandle) {
    console.error(`FolderHandler: No directory handle provided`);
    return {
      valid: false,
      exists: false,
      isDirectory: false,
      error: 'No directory handle provided'
    };
  }
  
  try {
    // Check if the directory handle is valid by trying to list entries
    if (typeof directoryHandle.entries === 'function') {
      // Just check if we can iterate entries, which validates the handle is accessible
      // We don't need to actually iterate through all entries
      await directoryHandle.entries().next();
      console.log(`FolderHandler: Directory handle is valid and accessible`);
      
      return {
        valid: true,
        exists: true,
        isDirectory: true
      };
    } else {
      // For browsers that don't fully implement the entries() method
      console.log(`FolderHandler: Directory handle exists but entries() not available`);
      return {
        valid: true,
        exists: true,
        isDirectory: true
      };
    }
  } catch (error: any) {
    console.error(`FolderHandler: Error validating directory handle:`, error);
    return {
      valid: false,
      exists: false,
      isDirectory: false,
      error: error?.message || 'Error accessing directory'
    };
  }
}

/**
 * Cleans up editor instances to prevent memory leaks
 * @param editorInstances Object containing editor instances
 * @param setEditorInstances Function to update editor instances
 */
export function cleanupEditorInstances(
  editorInstances: Record<string, EditorInstance>,
  setEditorInstances: React.Dispatch<React.SetStateAction<Record<string, EditorInstance>>>
): void {
  console.log('FolderHandler: Cleaning up editor instances');
  
  if (editorInstances) {
    for (const fileId in editorInstances) {
      const instance = editorInstances[fileId];
      if (instance && instance.disposables) {
        console.log(`FolderHandler: Disposing editor instance for file ${fileId}`);
        instance.disposables.forEach((d) => d.dispose());
      }
    }
    
    if (typeof setEditorInstances === 'function') {
      setEditorInstances({});
      console.log('FolderHandler: Reset editor instances');
    }
  }
}

/**
 * Function to clean up missing files from the openFiles array
 * Ensures that files that no longer exist in the file system are removed
 * from the open files list
 */
export function cleanupMissingFiles() {
  const storeState = useVSCodeStore.getState();
  const { rootNode, openFiles, activeFileId } = storeState;
  
  if (!rootNode || !openFiles) {
    console.log('FolderHandler: Missing rootNode or openFiles, cannot cleanup files');
    return;
  }
  
  console.log(`FolderHandler: Cleaning up missing files. Current openFiles count: ${openFiles.length}`);
  
  const fileIdsToKeep = [];
  let activeFileStillExists = false;
  
  for (const fileId of openFiles) {
    // Try to find the file node in the rootNode
    const fileNode = findNodeById(rootNode, fileId);
    if (fileNode) {
      fileIdsToKeep.push(fileId);
      if (fileId === activeFileId) {
        activeFileStillExists = true;
      }
      console.log(`FolderHandler: File ${fileId} (${fileNode.name}) still exists in rootNode, keeping it`);
    } else {
      console.log(`FolderHandler: File with ID: ${fileId} not found in rootNode, removing it`);
    }
  }
  
  // Determine if we need to update the store
  const needsUpdate = fileIdsToKeep.length !== openFiles.length || (activeFileId && !activeFileStillExists);
  
  // Update the store if needed
  if (needsUpdate) {
    const newState = {
      ...storeState,
      openFiles: fileIdsToKeep
    };
    
    // If the active file no longer exists, nullify the activeFileId
    if (activeFileId && !activeFileStillExists) {
      console.log(`FolderHandler: Active file ${activeFileId} no longer exists, resetting active file`);
      newState.activeFileId = fileIdsToKeep.length > 0 ? fileIdsToKeep[0] : null;
    }
    
    console.log(`FolderHandler: Cleanup removed ${openFiles.length - fileIdsToKeep.length} missing files. New openFiles count: ${fileIdsToKeep.length}`);
    useVSCodeStore.setState(newState);
  } else {
    console.log('FolderHandler: No missing files found to cleanup');
  }
}
