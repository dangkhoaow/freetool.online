/**
 * Browser File System Access API Service
 * This service provides direct access to the client's file system using the File System Access API
 * It works alongside the virtual file system (localStorage) to provide a hybrid approach
 */
import { FileNode } from './vs-code-file-system';
import { v4 as uuidv4 } from 'uuid';

// For TypeScript compatibility, use 'any' types for File System Access API
// This is a pragmatic approach that works across different browsers
// without causing TypeScript errors due to conflicting interface declarations

// These types are for documentation purposes and to help with code completion
// They're not meant to be exhaustive or perfect definitions
type FileSystemDirectoryHandle = any;
type FileSystemFileHandle = any;
type FileSystemHandle = any;
type FileSystemWritableFileStream = any;

// Types for file system operations
export interface FileSystemHandleCache {
  rootDirectoryHandle?: FileSystemDirectoryHandle;
  fileHandles: Map<string, FileSystemFileHandle>;
  folderHandles: Map<string, FileSystemDirectoryHandle>;
  lastAccessed: number;
}

/**
 * Check if the File System Access API is supported in the current browser
 * @returns Boolean indicating support status
 */
export function isFileSystemAccessSupported(): boolean {
  console.log('BrowserFileSystem: Checking File System Access API support');
  // @ts-ignore - Ignore TypeScript error since we're checking if the property exists
  const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  console.log(`BrowserFileSystem: File System Access API supported: ${isSupported}`);
  return isSupported;
}

// Global handle cache to avoid requesting permissions repeatedly
let handleCache: FileSystemHandleCache = {
  fileHandles: new Map(),
  folderHandles: new Map(),
  lastAccessed: Date.now()
};

/**
 * Request access to a directory on the user's file system
 * @returns Promise resolving to a directory handle
 */
export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  console.log('BrowserFileSystem: Requesting directory access from user');
  
  try {
    if (!isFileSystemAccessSupported()) {
      console.warn('BrowserFileSystem: File System Access API not supported in this browser');
      return null;
    }

    // Show directory picker to get user permission
    // @ts-ignore - Ignore TypeScript error since we've already checked if the API exists
    const directoryHandle = await window.showDirectoryPicker({ 
      id: 'root-directory', 
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    // Cache the handle for future use
    if (directoryHandle) {
      handleCache.rootDirectoryHandle = directoryHandle;
      handleCache.lastAccessed = Date.now();
      
      console.log('BrowserFileSystem: Successfully obtained directory access', directoryHandle);
      return directoryHandle;
    }
    
    console.warn('BrowserFileSystem: Failed to get directory handle');
    return null;
  } catch (error) {
    console.error('BrowserFileSystem: Error requesting directory access:', error);
    return null;
  }
}

/**
 * Create a new file in the specified directory
 * @param directoryHandle Directory where file should be created
 * @param fileName Name of the file to create
 * @param content Content to write to the file
 * @returns Promise resolving to the file handle or null if failed
 */
export async function createFile(
  directoryHandle: FileSystemDirectoryHandle | null = handleCache.rootDirectoryHandle || null,
  fileName: string,
  content: string = ''
): Promise<FileSystemFileHandle | null> {
  console.log(`BrowserFileSystem: Creating file "${fileName}" in directory`);
  
  if (!directoryHandle) {
    console.error('BrowserFileSystem: No directory handle available, request access first');
    return null;
  }
  
  try {
    // Get a handle to the new file (creates it if it doesn't exist)
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    
    // Create a writable stream and write the content
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    
    // Cache the file handle
    handleCache.fileHandles.set(fileName, fileHandle);
    
    console.log(`BrowserFileSystem: File "${fileName}" created successfully`);
    return fileHandle;
  } catch (error) {
    console.error(`BrowserFileSystem: Error creating file "${fileName}":`, error);
    return null;
  }
}

/**
 * Create a new folder in the specified directory
 * @param directoryHandle Parent directory where folder should be created
 * @param folderName Name of the folder to create
 * @returns Promise resolving to the folder handle or null if failed
 */
export async function createFolder(
  directoryHandle: FileSystemDirectoryHandle | null = handleCache.rootDirectoryHandle || null,
  folderName: string
): Promise<FileSystemDirectoryHandle | null> {
  console.log(`BrowserFileSystem: Creating folder "${folderName}" in directory`);
  
  if (!directoryHandle) {
    console.error('BrowserFileSystem: No directory handle available, request access first');
    return null;
  }
  
  try {
    // Get a handle to the new directory (creates it if it doesn't exist)
    const folderHandle = await directoryHandle.getDirectoryHandle(folderName, { create: true });
    
    // Cache the folder handle
    handleCache.folderHandles.set(folderName, folderHandle);
    
    console.log(`BrowserFileSystem: Folder "${folderName}" created successfully`);
    return folderHandle;
  } catch (error) {
    console.error(`BrowserFileSystem: Error creating folder "${folderName}":`, error);
    return null;
  }
}

/**
 * Read a file from the user's file system
 * @param fileHandle Handle to the file to read
 * @returns Promise resolving to the file content
 */
export async function readFile(fileHandle: FileSystemFileHandle): Promise<string> {
  console.log('BrowserFileSystem: Reading file content');
  
  try {
    // Get a file object from the handle
    const file = await fileHandle.getFile();
    
    // Read the file as text
    const content = await file.text();
    
    console.log(`BrowserFileSystem: Successfully read file, size: ${content.length} bytes`);
    return content;
  } catch (error) {
    console.error('BrowserFileSystem: Error reading file:', error);
    throw error;
  }
}

/**
 * Write content to a file on the user's file system
 * @param fileHandle Handle to the file to write
 * @param content Content to write to the file
 * @returns Promise resolving once write is complete
 */
export async function writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
  console.log(`BrowserFileSystem: Writing to file, content size: ${content.length} bytes`);
  
  try {
    // Create a writable stream and write the content
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    
    console.log('BrowserFileSystem: Successfully wrote to file');
  } catch (error) {
    console.error('BrowserFileSystem: Error writing to file:', error);
    throw error;
  }
}

/**
 * Save the entire project structure to disk
 * @param directoryHandle Root directory handle
 * @param structure Project structure with files and folders
 * @returns Promise resolving once save is complete
 */
export async function saveProjectToDisk(
  directoryHandle: FileSystemDirectoryHandle,
  structure: any
): Promise<void> {
  console.log('BrowserFileSystem: Saving project structure to disk');
  
  try {
    // Process the structure and create files/folders recursively
    // This is a simplified implementation, would need to be expanded
    for (const item of structure.children || []) {
      if (item.type === 'file') {
        await createFile(directoryHandle, item.name, item.content || '');
      } else if (item.type === 'directory') {
        const folderHandle = await createFolder(directoryHandle, item.name);
        if (folderHandle && item.children && item.children.length > 0) {
          await saveProjectToDisk(folderHandle, item);
        }
      }
    }
    
    console.log('BrowserFileSystem: Project saved successfully');
  } catch (error) {
    console.error('BrowserFileSystem: Error saving project to disk:', error);
    throw error;
  }
}

/**
 * List files and folders in a directory
 * @param directoryHandle Handle to the directory to list
 * @returns Promise resolving to array of entries
 */
export async function listDirectory(directoryHandle: FileSystemDirectoryHandle): Promise<any[]> {
  console.log('BrowserFileSystem: Listing directory contents');
  
  try {
    const entries: any[] = [];
    
    // Verify entries method exists (TypeScript check)
    if (typeof directoryHandle.entries === 'function') {
      // Iterate through all entries in the directory
      for await (const [name, handle] of directoryHandle.entries()) {
        entries.push({
          name,
          type: handle.kind,
          handle
        });
      }
    } else {
      console.warn('BrowserFileSystem: Directory entries method not available in this browser');
    }
    
    console.log(`BrowserFileSystem: Listed ${entries.length} items in directory`);
    return entries;
  } catch (error) {
    console.error('BrowserFileSystem: Error listing directory:', error);
    return []; // Return empty array instead of throwing on error for better UX
  }
}

/**
 * Check if we have a valid directory handle 
 * @returns Boolean indicating if we have a valid directory handle
 */
export function hasDirectoryHandle(): boolean {
  return !!handleCache.rootDirectoryHandle;
}

/**
 * Get the current directory handle
 * @returns Current directory handle or null if none
 */
export function getCurrentDirectoryHandle(): FileSystemDirectoryHandle | null {
  return handleCache.rootDirectoryHandle || null;
}

/**
 * Scan a directory and build a FileNode tree structure from the actual file system
 * This function crawls the file system and builds a virtual representation
 * @param directoryHandle Root directory handle to scan
 * @param maxDepth Maximum depth to scan (to avoid infinite recursion)
 * @returns Promise resolving to a FileNode structure
 */
export async function scanDirectoryToFileNode(
  directoryHandle: FileSystemDirectoryHandle = handleCache.rootDirectoryHandle,
  maxDepth: number = 5
): Promise<FileNode | null> {
  console.log(`BrowserFileSystem: Scanning directory ${directoryHandle?.name || 'unknown'} to FileNode`);
  
  if (!directoryHandle) {
    console.error('BrowserFileSystem: No directory handle to scan');
    return null;
  }
  
  async function buildFileNode(handle: FileSystemHandle, depth: number = 0, parentId?: string): Promise<FileNode> {
    const name = handle.name;
    const isDirectory = handle.kind === 'directory';
    const timestamp = Date.now();
    // Generate a unique ID with a browser-fs prefix to identify that it comes from the File System Access API
    const id = `browser-fs-${uuidv4()}`;
    
    const node: FileNode = {
      id,
      name,
      type: isDirectory ? 'directory' : 'file',
      content: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      children: [],
      parentId
    };
    
    // Attach the handle for later content operations
    (node as any).handle = handle;
    
    // If this is a file, read its content immediately
    if (!isDirectory) {
      try {
        const fileHandle = handle as FileSystemFileHandle;
        const fileData = await fileHandle.getFile();
        node.content = await fileData.text();
        console.log(`BrowserFileSystem: Loaded content for ${name}, length: ${(node.content ?? '').length}`);
      } catch (err) {
        console.error(`BrowserFileSystem: Error loading file content for ${name}:`, err);
      }
      return node;
    }
    
    // If we've reached max depth, don't go deeper
    if (depth >= maxDepth) {
      console.log(`BrowserFileSystem: Max depth ${maxDepth} reached for ${name}, stopping recursion`);
      return node;
    }
    
    // For directories, recursively scan children
    try {
      // Cast to directory handle since we know it's a directory
      const dirHandle = handle as FileSystemDirectoryHandle;
      
      // Children array to store file nodes
      const children: FileNode[] = [];
      
      // Iterate through all entries in the directory
      for await (const entry of dirHandle.values()) {
        try {
          // Build node for this entry and add to children, passing the current node's ID as parent
          const childNode = await buildFileNode(entry, depth + 1, id);
          // Log each entry we find
          console.log(`BrowserFileSystem: Found entry in ${name}: ${entry.name} (${entry.kind})`);
          children.push(childNode);
        } catch (error) {
          console.error(`BrowserFileSystem: Error processing entry ${entry.name}:`, error);
          // Continue with other entries even if one fails
        }
      }
      
      // Sort children: directories first, then files, both alphabetically
      children.sort((a, b) => {
        // If types are different, directories come first
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        // Otherwise sort alphabetically by name
        return a.name.localeCompare(b.name);
      });
      
      // Update node with children
      node.children = children;
      return node;
    } catch (error) {
      console.error(`BrowserFileSystem: Error scanning directory ${name}:`, error);
      return node; // Return node without children in case of error
    }
  }
  
  try {
    // Start building from the root directory
    const rootNode = await buildFileNode(directoryHandle);
    console.log(`BrowserFileSystem: Successfully scanned directory to FileNode`, rootNode);
    return rootNode;
  } catch (error) {
    console.error('BrowserFileSystem: Error in scanDirectoryToFileNode:', error);
    return null;
  }
}

/**
 * Reset the handle cache
 */
export function resetHandleCache(): void {
  handleCache = {
    fileHandles: new Map(),
    folderHandles: new Map(),
    lastAccessed: Date.now()
  };
  console.log('BrowserFileSystem: Handle cache reset');
}
