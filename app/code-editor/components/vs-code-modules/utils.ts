/**
 * Utility functions for VS Code editor components
 */
import { FileNode, getLanguageFromFilename } from '@/lib/services/vs-code-file-system';
import { getCurrentFolderPath } from '../../utils/storage-utils';
import useVSCodeStore from '../../store/vs-code-store';

/**
 * Get recent files with a limit on the number returned
 * @param limit Maximum number of files to return
 * @returns Array of recent file nodes
 */
export function getRecentFilesWithLimit(limit: number = 5): FileNode[] {
  console.log(`Utils: Getting recent files with limit: ${limit}`);
  
  try {
    const store = useVSCodeStore.getState();
    const recentFiles = store.getRecentFiles();
    
    console.log(`Utils: Found ${recentFiles.length} recent files, returning up to ${limit}`);
    return recentFiles.slice(0, limit);
  } catch (error) {
    console.error('Utils: Error getting recent files:', error);
    return [];
  }
}

/**
 * Converts file path to display path
 * @param path Full file path
 * @returns Formatted display path
 */
export function formatDisplayPath(path: string): string {
  console.log(`Utils: Formatting display path: ${path}`);
  
  // Get current folder path
  const currentFolder = getCurrentFolderPath();
  
  if (path.startsWith(currentFolder)) {
    // Remove the current folder prefix
    const relativePath = path.substring(currentFolder.length);
    console.log(`Utils: Formatted relative path: ${relativePath}`);
    return relativePath;
  }
  
  console.log(`Utils: Using full path: ${path}`);
  return path;
}

/**
 * Gets the appropriate language for a filename
 * @param fileName File name to get language for
 * @returns Monaco editor language identifier
 */
export function getEditorLanguage(fileName: string): string {
  console.log(`Utils: Getting language for file: ${fileName}`);
  
  // Use the built-in language detection
  const language = getLanguageFromFilename(fileName);
  console.log(`Utils: Detected language: ${language || 'plaintext'}`);
  
  return language || 'plaintext';
}

/**
 * Creates file nodes from uploaded files
 * @param files Array of File objects
 * @param rootNode Root node to add files to
 * @param createNewFile Function to create files
 * @returns Promise resolving to array of created file IDs
 */
export async function processUploadedFiles(
  files: File[],
  rootNode: FileNode,
  createNewFile: (parentId: string, fileName: string, content: string, language: string) => void
): Promise<string[]> {
  console.log(`Utils: Processing ${files.length} uploaded files`);
  
  const fileIds: string[] = [];
  
  for (const file of files) {
    const reader = new FileReader();
    
    await new Promise<void>((resolve) => {
      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result as string;
          const language = getLanguageFromFilename(file.name);
          
          console.log(`Utils: Loaded file ${file.name}, size: ${content.length} bytes, language: ${language}`);
          
          createNewFile(rootNode.id, file.name, content, language);
          
          setTimeout(() => {
            // Find the created file node
            const storeState = useVSCodeStore.getState();
            const newFile = storeState.rootNode.children?.find(
              (child) => child.name === file.name && child.type === 'file'
            );
            
            if (newFile) {
              console.log(`Utils: Created file with ID: ${newFile.id}`);
              fileIds.push(newFile.id);
            }
            
            resolve();
          }, 50);
        } else {
          console.error(`Utils: Failed to read file: ${file.name}`);
          resolve();
        }
      };
      
      reader.onerror = () => {
        console.error(`Utils: Error reading file: ${file.name}`);
        resolve();
      };
      
      reader.readAsText(file);
    });
  }
  
  console.log(`Utils: Processed ${fileIds.length} files with IDs: ${fileIds.join(', ')}`);
  return fileIds;
}

/**
 * Zoom in by increasing font size
 * @param fontSize Current font size
 * @param setFontSize Function to update font size
 */
export function handleZoomIn(
  fontSize: number,
  setFontSize: React.Dispatch<React.SetStateAction<number>>
) {
  console.log(`Utils: Zooming in, current font size: ${fontSize}`);
  
  if (fontSize < 32) {
    setFontSize(fontSize + 1);
    console.log(`Utils: Increased font size to ${fontSize + 1}`);
  } else {
    console.log(`Utils: Already at maximum font size: ${fontSize}`);
  }
}

/**
 * Zoom out by decreasing font size
 * @param fontSize Current font size
 * @param setFontSize Function to update font size
 */
export function handleZoomOut(
  fontSize: number,
  setFontSize: React.Dispatch<React.SetStateAction<number>>
) {
  console.log(`Utils: Zooming out, current font size: ${fontSize}`);
  
  if (fontSize > 8) {
    setFontSize(fontSize - 1);
    console.log(`Utils: Decreased font size to ${fontSize - 1}`);
  } else {
    console.log(`Utils: Already at minimum font size: ${fontSize}`);
  }
}

/**
 * Toggle word wrap setting
 * @param wordWrap Current word wrap setting
 * @param setWordWrap Function to update word wrap
 */
export function toggleWordWrap(
  wordWrap: 'on' | 'off',
  setWordWrap: React.Dispatch<React.SetStateAction<'on' | 'off'>>
) {
  console.log(`Utils: Toggling word wrap, current: ${wordWrap}`);
  
  const newWordWrap = wordWrap === 'on' ? 'off' : 'on';
  setWordWrap(newWordWrap);
  console.log(`Utils: Word wrap set to: ${newWordWrap}`);
}
