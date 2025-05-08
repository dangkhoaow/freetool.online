/**
 * Folder operations for VS Code editor
 * Handles folder selection, validation, and management
 */
import { FileNode, findNodeById } from '@/lib/services/vs-code-file-system';
import { saveCurrentFolderPath, getCurrentFolderPath, logAllStorageKeys } from '../../utils/storage-utils';
import useVSCodeStore from '../../store/vs-code-store';
import { EditorInstance } from './types';

/**
 * Validates a folder path by checking if it exists using the validation API
 * @param folderPath Path to validate
 * @returns Promise resolving to validation result
 */
export async function validateFolderPath(folderPath: string): Promise<{
  valid: boolean;
  exists: boolean;
  isDirectory: boolean;
  error?: string;
}> {
  console.log(`FolderHandler: Validating folder path: ${folderPath}`);
  
  try {
    const response = await fetch(`/api/filesystem/validate?path=${encodeURIComponent(folderPath)}`);
    
    if (!response.ok) {
      console.error(`FolderHandler: Folder validation API error:`, response.status);
      return {
        valid: false,
        exists: false,
        isDirectory: false,
        error: `Server returned ${response.status}`
      };
    }
    
    const data = await response.json();
    console.log(`FolderHandler: Folder validation response:`, data);
    
    if (!data.exists) {
      console.error(`FolderHandler: Folder ${folderPath} does not exist`);
      return {
        valid: false,
        exists: false,
        isDirectory: false,
        error: `The folder "${folderPath}" does not exist`
      };
    }
    
    if (!data.isDirectory) {
      console.error(`FolderHandler: Path ${folderPath} is not a directory`);
      return {
        valid: false,
        exists: true,
        isDirectory: false,
        error: `The path "${folderPath}" is not a directory`
      };
    }
    
    return {
      valid: true,
      exists: true,
      isDirectory: true
    };
  } catch (error: any) {
    console.error(`FolderHandler: Error in folder validation:`, error);
    return {
      valid: false,
      exists: false,
      isDirectory: false,
      error: error?.message || 'Unknown error'
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
) {
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
