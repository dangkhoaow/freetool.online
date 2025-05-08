/**
 * File operations for VS Code editor
 * Handles file opening, saving, creation, and deletion
 */
import { FileNode, getLanguageFromFilename, findNodeById } from '@/lib/services/vs-code-file-system';
import { readFile as readBrowserFile } from '@/lib/services/browser-file-system-service';
import useVSCodeStore from '../../store/vs-code-store';
import { EditorInstance } from './types';

/**
 * Enhanced function to save a file with content from editor
 * Falls back to content in store if editor instance is not available
 * 
 * @param fileId ID of the file to save
 * @param editorInstances Current editor instances
 * @returns Boolean indicating success
 */
export function enhancedSaveFile(
  fileId: string, 
  content?: string,
  editorInstances?: Record<string, EditorInstance>
): boolean {
  console.log(`FileOperations: Saving file ${fileId}`);
  
  const storeState = useVSCodeStore.getState();
  
  try {
    // If content is provided directly, use it
    if (content !== undefined) {
      console.log(`FileOperations: Using provided content to save file, length: ${content.length} characters`);
      storeState.saveFile(fileId, content);
      console.log(`FileOperations: File ${fileId} saved successfully with provided content`);
      return true;
    }
    
    // Try to get content from editor instance
    if (editorInstances) {
      const instance = editorInstances[fileId];
      if (instance && instance.model) {
        const editorContent = instance.model.getValue();
        console.log(`FileOperations: Using editor content to save file, length: ${editorContent.length} characters`);
        storeState.saveFile(fileId, editorContent);
        console.log(`FileOperations: File ${fileId} saved successfully with editor content`);
        return true;
      }
    }
    
    // Fall back to content in store if available
    const fileNode = findNodeById(storeState.rootNode, fileId);
    if (fileNode && fileNode.type === 'file') {
      const nodeContent = fileNode.content || '';
      console.log(`FileOperations: Using node content to save file, length: ${nodeContent.length} characters`);
      storeState.saveFile(fileId, nodeContent);
      console.log(`FileOperations: File ${fileId} saved successfully with node content`);
      return true;
    }
    
    console.error(`FileOperations: No content available for file ${fileId}, save failed`);
    return false;
  } catch (error) {
    console.error('FileOperations: Error saving file:', error);
    return false;
  }
}

/**
 * Opens a file by ID with retry mechanism
 * Handles cases where file node might not be immediately available
 * 
 * @param fileId ID of the file to open
 * @param maxRetries Maximum number of retries
 * @param delay Delay between retries in ms
 */
export function openFileById(fileId: string, maxRetries = 5, delay = 100, editorInstances?: Record<string, EditorInstance>) {
  console.log(`FileOperations: Opening file with ID: ${fileId}`);
  
  const openFileWithRetry = (retriesLeft: number) => {
    const store = useVSCodeStore.getState();
    const { rootNode, activeFileId } = store;
    console.log(`FileOperations: Current root node:`, rootNode);
    console.log(`FileOperations: Current expandedFolders:`, store.expandedFolders);
    
    // Before switching tabs, save the current active file's content to preserve unsaved changes
    if (activeFileId && activeFileId !== fileId && editorInstances) {
      console.log(`FileOperations: Preserving unsaved changes for current active file: ${activeFileId} before switching tabs`);
      const activeEditorInstance = editorInstances[activeFileId];
      if (activeEditorInstance && activeEditorInstance.model) {
        const currentContent = activeEditorInstance.model.getValue();
        console.log(`FileOperations: Getting content from active editor instance, length: ${currentContent.length} characters`);
        
        // Save the content to the file node
        const activeFileNode = findNodeById(rootNode, activeFileId);
        if (activeFileNode && activeFileNode.type === 'file') {
          console.log(`FileOperations: Saving content for file ${activeFileId} to node state`);
          store.setEditorContent(activeFileId, currentContent);
          
          // Mark the file as dirty if it has unsaved changes
          const originalFileNode = findNodeById(rootNode, activeFileId);
          if (originalFileNode && originalFileNode.type === 'file' && originalFileNode.content !== currentContent) {
            console.log(`FileOperations: Marking file ${activeFileId} as dirty`); 
            store.markFileAsDirty(activeFileId);
          }
        }
      }
    }
    
    // Find the file node to open
    const fileNode = findNodeById(rootNode, fileId);
    
    if (fileNode) {
      console.log(`FileOperations: Found file node:`, fileNode);
      
      // Check if file has handle for loading via browser FS API
      const handle = (fileNode as any).handle;
      if (handle) {
        console.log(`FileOperations: Loading file via browser-file-system-service`, handle);
        readBrowserFile(handle)
          .then((dataContent: string) => {
            console.log(`FileOperations: File loaded via FS API, size: ${dataContent.length} chars`);
            store.setEditorContent(fileId, dataContent);
            store.markFileAsSaved(fileId);
          })
          .catch((error: unknown) => console.error('FileOperations: Error reading file via FS API:', error));
      } else {
        // Check if file has realPath for loading from disk
        const realPath = (fileNode as any).realPath;
        if (realPath) {
          console.log(`FileOperations: File has real path: ${realPath}, will load from disk`);
          
          // First, make sure parent folders are expanded
          if (fileNode.parentId) {
            console.log(`FileOperations: Ensuring parent folder ${fileNode.parentId} is expanded`);
            if (!store.expandedFolders.includes(fileNode.parentId)) {
              store.toggleFolder(fileNode.parentId);
              console.log(`FileOperations: Expanded parent folder ${fileNode.parentId}`);
            }
          }
          
          // Try to load content from disk directly via fetch API
          console.log(`FileOperations: Loading file content from disk: ${realPath}`);
          fetch('/api/filesystem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'readFile',
              path: realPath
            })
          })
          .then(response => response.json())
          .then((data: { success: boolean; content?: string; error?: string }) => {
            if (data.success) {
              const fileContent = data.content ?? '';
              console.log(`FileOperations: File loaded successfully from disk: ${realPath}, size: ${fileContent.length} chars`);
              
              // Update file content directly in the file system state
              const updatedFileNode = findNodeById(store.rootNode, fileId);
              if (updatedFileNode && updatedFileNode.type === 'file') {
                console.log(`FileOperations: Updating file content in the state for ${fileId}`);
                // Create a new file node with the content
                updatedFileNode.content = fileContent;
                // Update the file node in the store
                store.setEditorContent(fileId, fileContent);
                console.log(`FileOperations: Updated content for ${fileId}`);
                
                // Mark file as saved
                store.markFileAsSaved(fileId);
              }
            } else {
              console.error(`FileOperations: Error loading file from disk: ${data.error || 'Unknown error'}`);
            }
          })
          .catch((error: unknown) => {
            console.error('FileOperations: Error loading file from disk:', error);
          });
        } else {
          console.log(`FileOperations: File does not have a real path or handle, loading from cache if available`);
        }
      }
      
      // Make sure parent folders are expanded
      if (fileNode.parentId) {
        console.log(`FileOperations: Ensuring parent folder ${fileNode.parentId} is expanded`);
        if (!store.expandedFolders.includes(fileNode.parentId)) {
          store.toggleFolder(fileNode.parentId);
          console.log(`FileOperations: Expanded parent folder ${fileNode.parentId}`);
        }
      }
      
      // Open the file in the store
      store.openFile(fileId);
      // Set it as active
      store.setActiveFile(fileId);
      console.log(`FileOperations: File ${fileId} opened successfully and set as active`);
      return true;
    } else if (retriesLeft > 0) {
      console.log(`FileOperations: File node not found, retrying in ${delay}ms. Retries left: ${retriesLeft}`);
      setTimeout(() => openFileWithRetry(retriesLeft - 1), delay);
      return false;
    } else {
      console.error(`FileOperations: Failed to find file node with ID: ${fileId} after ${maxRetries} retries`);
      return false;
    }
  };
  
  return openFileWithRetry(maxRetries);
}

/**
 * Closes a file by ID
 * @param fileId ID of the file to close
 * @param editorInstances Current editor instances
 * @param setEditorInstances Function to update editor instances
 */
export function closeFileById(
  fileId: string,
  editorInstances: Record<string, EditorInstance>,
  setEditorInstances: React.Dispatch<React.SetStateAction<Record<string, EditorInstance>>>
) {
  console.log(`FileOperations: Closing file with ID: ${fileId}`);
  
  try {
    // Clean up editor instance
    const instance = editorInstances[fileId];
    if (instance && instance.disposables) {
      console.log(`FileOperations: Cleaning up editor instance for file ${fileId}`);
      instance.disposables.forEach(d => d.dispose());
      
      setEditorInstances(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        console.log(`FileOperations: Removed editor instance for file ${fileId}`);
        return updated;
      });
    }
    
    // Close the file in the store
    const store = useVSCodeStore.getState();
    store.closeFile(fileId);
    console.log(`FileOperations: File ${fileId} closed in store`);
    
    return true;
  } catch (error) {
    console.error(`FileOperations: Error closing file ${fileId}:`, error);
    return false;
  }
}

/**
 * Creates a new file from uploaded file
 * @param fileObject File object from file input
 * @param rootNodeId ID of the root node to create file in
 * @param createNewFile Function to create new file
 * @returns Promise resolving to the created file ID or null
 */
export function createFileFromUpload(
  fileObject: File,
  rootNodeId: string,
  createNewFile: (parentId: string, fileName: string, content: string, language: string) => void
): Promise<string | null> {
  console.log(`FileOperations: Creating file from upload: ${fileObject.name}`);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target) {
        const content = event.target.result as string;
        const fileName = fileObject.name;
        
        console.log(`FileOperations: File loaded: ${fileName} with size ${content.length} bytes`);
        
        try {
          // Get the language from the filename
          const language = getLanguageFromFilename(fileName);
          console.log(`FileOperations: Detected language for ${fileName}: ${language}`);
          
          // Create the file
          createNewFile(rootNodeId, fileName, content, language);
          console.log(`FileOperations: File creation initiated for ${fileName}`);
          
          // Get the latest state to find the created file
          setTimeout(() => {
            const latestState = useVSCodeStore.getState();
            const latestRootNode = latestState.rootNode;
            
            // Find the newly created file
            const newFile = latestRootNode.children?.find((child: FileNode) => 
              child.name === fileName && child.type === 'file' && child.parentId === rootNodeId);
            
            if (newFile) {
              console.log(`FileOperations: Successfully created file: ${fileName} with ID: ${newFile.id}`);
              resolve(newFile.id);
            } else {
              console.error(`FileOperations: Failed to find newly created file: ${fileName}`);
              resolve(null);
            }
          }, 50);
        } catch (error) {
          console.error(`FileOperations: Error creating file ${fileName}:`, error);
          resolve(null);
        }
      } else {
        console.error('FileOperations: FileReader event target is null');
        resolve(null);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileOperations: Error reading file:', error);
      resolve(null);
    };
    
    reader.readAsText(fileObject);
  });
}
