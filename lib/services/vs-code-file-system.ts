// File system service for VS Code-like editor
// This service handles virtual file system operations using localStorage

import { v4 as uuidv4 } from 'uuid';

// Types for file system
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FileSystemState {
  rootNode: FileNode;
  selectedNodeId: string | null;
  openFiles: string[]; // Array of file IDs
  activeFileId: string | null;
  expandedFolders: string[]; // Array of folder IDs
}

// Storage keys
const FILE_SYSTEM_KEY = 'vs-code-file-system';
const FILE_SYSTEM_META_KEY = 'vs-code-file-system-meta';
const FILE_CONTENT_PREFIX = 'vs-code-file-content-';
const EDITOR_STATE_KEY = 'vs-code-editor-state';
const VS_CODE_RECENT_FILES_KEY = 'vs-code-recent-files';
const READ_ONLY_MODE_KEY = 'vs-code-read-only-mode';

// Initialize constants
const MAX_INLINE_CONTENT_SIZE = 4 * 1024; // 4KB - content larger than this will be stored separately
const MAX_CLEANUP_ATTEMPTS = 5;  // Maximum number of cleanup attempts before entering read-only mode
const MAX_OPEN_FILES = 8;       // Maximum number of open files to keep in state
const MAX_RECENT_FILES = 5;

// Counter to track recursive cleanup attempts
let cleanupAttempts = 0;

// Flag to track if storage is full
let isStorageFull = false;

// Flag to track if we're in read-only mode
let isReadOnlyMode = false;

// Initialize read-only mode flag from localStorage if available
try {
  if (typeof window !== 'undefined') {
    const readOnlyMode = localStorage.getItem(READ_ONLY_MODE_KEY);
    isReadOnlyMode = readOnlyMode === 'true';
    console.log(`VS Code File System initialized in ${isReadOnlyMode ? 'read-only' : 'read-write'} mode`);
  }
} catch (e) {
  console.error('Error initializing read-only mode:', e);
}

// Default root node
const DEFAULT_ROOT: FileNode = {
  id: 'root',
  name: 'workspace',
  type: 'directory',
  children: [
    {
      id: 'welcome',
      name: 'welcome.md',
      type: 'file',
      content: `# Welcome to VS Code Editor

This is a full-featured VS Code-like editor running in your browser.

## Features

- File Explorer with create, rename, and delete capabilities
- Multiple language support
- Syntax highlighting
- Command palette (Ctrl+Shift+P)
- Quick file opening (Ctrl+P)
- And much more!

Try creating a new file or folder to get started.`,
      language: 'markdown',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'sample-js',
      name: 'example.js',
      type: 'file',
      content: `// Sample JavaScript file

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try running this code
console.log(greet('Developer'));

// Or try using some ES6 features
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);`,
      language: 'javascript',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Default editor state
const DEFAULT_EDITOR_STATE: FileSystemState = {
  rootNode: DEFAULT_ROOT,
  selectedNodeId: null,
  openFiles: ['welcome'],
  activeFileId: 'welcome',
  expandedFolders: ['root']
};

// Helper function to find a node by ID
export function findNodeById(node: FileNode, id: string): FileNode | null {
  if (node.id === id) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
}

// Helper to find a node's parent
export function findParentNode(root: FileNode, nodeId: string): FileNode | null {
  if (!root.children) return null;
  
  for (const child of root.children) {
    if (child.id === nodeId) return root;
    
    if (child.type === 'directory') {
      const parent = findParentNode(child, nodeId);
      if (parent) return parent;
    }
  }
  
  return null;
}

// Get the file extension from a filename
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

// Map file extension to language
export function getLanguageFromFilename(filename: string): string {
  const ext = getFileExtension(filename);
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'sh': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'svg': 'xml',
    'txt': 'plaintext'
  };
  
  return languageMap[ext] || 'plaintext';
}

// Validate a filename
export function isValidFilename(name: string): boolean {
  // Disallow empty names and names with invalid characters
  return name.length > 0 && 
    !name.includes('/') && 
    !name.includes('\\') && 
    !name.includes(':') && 
    !name.includes('*') && 
    !name.includes('?') && 
    !name.includes('"') && 
    !name.includes('<') && 
    !name.includes('>') && 
    !name.includes('|');
}

// File System Operations
// Get the file system state from localStorage with chunked file contents
export function getFileSystemState(): FileSystemState {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_STATE;
  
  try {
    // Get the main file system structure
    const stored = localStorage.getItem(FILE_SYSTEM_KEY);
    if (!stored) {
      console.log('No file system found in localStorage, using default');
      return DEFAULT_EDITOR_STATE;
    }
    
    const parsed = JSON.parse(stored) as FileSystemState;
    console.log('Loaded file system structure from localStorage');
    
    // If we have chunked file contents, we need to load them
    const metaData = localStorage.getItem(FILE_SYSTEM_META_KEY);
    if (metaData) {
      const contentMeta = JSON.parse(metaData);
      if (contentMeta.chunkedFiles && Array.isArray(contentMeta.chunkedFiles)) {
        console.log(`Loading ${contentMeta.chunkedFiles.length} chunked file contents`);
        // Reconstruct file nodes with their chunked contents
        loadChunkedFileContents(parsed.rootNode, contentMeta.chunkedFiles);
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading file system from localStorage:', error);
    return DEFAULT_EDITOR_STATE;
  }
}

// Helper function to load chunked file contents and restore them to file nodes
function loadChunkedFileContents(rootNode: FileNode, chunkedFileIds: string[]): void {
  const processNode = (node: FileNode) => {
    // If this is a file with chunked content, load it
    if (node.type === 'file' && chunkedFileIds.includes(node.id)) {
      try {
        const content = localStorage.getItem(FILE_CONTENT_PREFIX + node.id);
        if (content) {
          node.content = content;
        }
      } catch (error) {
        console.error(`Error loading chunked content for file ${node.id}:`, error);
      }
    }
    
    // Process children recursively
    if (node.children) {
      node.children.forEach(processNode);
    }
  };
  
  processNode(rootNode);
}

// Safe deep clone function that handles non-serializable data
function safeDeepClone<T>(obj: T): T {
  // If obj is primitive or null, return it directly
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => safeDeepClone(item)) as unknown as T;
  }

  // Handle regular objects by creating a clean copy without non-serializable properties
  const result: Record<string, any> = {};
  for (const key in obj) {
    // Skip functions or any other non-serializable properties
    const value = (obj as Record<string, any>)[key];
    if (typeof value !== 'function' && key !== '__proto__') {
      result[key] = safeDeepClone(value);
    }
  }

  return result as T;
}

// Save the file system state to localStorage with content chunking and memory management
export function saveFileSystemState(state: FileSystemState): void {
  if (typeof window === 'undefined') return;
  
  // If we're in read-only mode, don't attempt to save state
  if (isReadOnlyMode) {
    console.log('In read-only mode, skipping file system state save');
    return;
  }
  
  // Check if we've reached the maximum number of cleanup attempts
  if (cleanupAttempts >= MAX_CLEANUP_ATTEMPTS) {
    console.log(`Maximum cleanup attempts (${MAX_CLEANUP_ATTEMPTS}) reached, entering read-only mode`);
    enterReadOnlyMode();
    return;
  }
  
  try {
    // If we've been marked as storage full, be aggressive about content reduction
    if (isStorageFull) {
      state = reduceStateSize(state);
    }
    
    // First make a safe deep clone that omits functions and other non-serializable data
    const clonedState = safeDeepClone(state);
    const chunkedFileIds: string[] = [];
    
    // Process the root node to extract large contents
    extractLargeFileContents(clonedState.rootNode, chunkedFileIds);
    
    // Try-catch specifically for the setItem operation since it's most likely to fail
    try {
      // Save the main structure (without large contents)
      localStorage.setItem(FILE_SYSTEM_KEY, JSON.stringify(clonedState));
      
      // Save metadata about chunked files
      localStorage.setItem(FILE_SYSTEM_META_KEY, JSON.stringify({
        chunkedFiles: chunkedFileIds,
        timestamp: Date.now()
      }));
      
      console.log(`Saved file system to localStorage with ${chunkedFileIds.length} chunked files`);
      isStorageFull = false;    // Reset flag if we succeeded
      cleanupAttempts = 0;      // Reset cleanup attempts counter
    } catch (storageError: any) {
      // Handle storage-specific errors
      if (storageError.name === 'QuotaExceededError') {
        console.log(`Quota exceeded (attempt ${cleanupAttempts + 1}/${MAX_CLEANUP_ATTEMPTS}), trying to clear space...`);
        cleanupAttempts++; // Increment the cleanup attempts counter
        
        const freedSpace = tryToFreeStorageSpace();
        
        if (freedSpace && cleanupAttempts < MAX_CLEANUP_ATTEMPTS) {
          // Try again with the cleaned state
          console.log('Successfully freed space, trying save operation once more with reduced state...');
          const furtherReducedState = reduceStateSize(state, true); // Aggressive reduction
          saveFileSystemState(furtherReducedState); // Try again with further reduced state
        } else {
          console.error('Failed to free enough space or maximum attempts reached, entering read-only mode');
          enterReadOnlyMode();
        }
      } else {
        // Other storage errors
        console.error('Storage error:', storageError);
      }
    }
  } catch (error: any) {
    console.error('Error in saveFileSystemState:', error);
    
    // Handle DataCloneError
    if (error && error.name === 'DataCloneError') {
      console.error('DataCloneError: Found non-serializable data in the state. Attempting a JSON round-trip clone.');
      try {
        // This is a simple but effective way to strip out non-serializable data
        const jsonSafeState = JSON.parse(JSON.stringify(state));
        cleanupAttempts++; // Count this as a cleanup attempt
        if (cleanupAttempts < MAX_CLEANUP_ATTEMPTS) {
          saveFileSystemState(jsonSafeState); // Recursive call with cleaned data
        } else {
          console.error('Maximum cleanup attempts reached during JSON cleanup, entering read-only mode');
          enterReadOnlyMode();
        }
      } catch (jsonError) {
        console.error('Failed to perform JSON round-trip clone, entering read-only mode:', jsonError);
        enterReadOnlyMode();
      }
    }
  }
}

// Enter read-only mode for the file system
function enterReadOnlyMode(): void {
  isReadOnlyMode = true;
  isStorageFull = true;
  cleanupAttempts = 0; // Reset counter
  
  // Save read-only mode flag to localStorage
  try {
    localStorage.setItem(READ_ONLY_MODE_KEY, 'true');
    console.log('Entered read-only mode for file system. Saving disabled.');
    
    // Optionally show a notification to the user
    if (typeof window !== 'undefined') {
      window.alert('Storage limit reached. Editor is now in read-only mode. You can view files but changes will not be saved.');
    }
  } catch (e) {
    console.error('Error saving read-only mode flag:', e);
  }
}

// Exit read-only mode and try to resume normal operations
export function exitReadOnlyMode(): boolean {
  try {
    // Clear the read-only flag
    localStorage.removeItem(READ_ONLY_MODE_KEY);
    
    // Reset state
    isReadOnlyMode = false;
    isStorageFull = false;
    cleanupAttempts = 0;
    
    console.log('Exited read-only mode, normal file operations resumed');
    return true;
  } catch (e) {
    console.error('Failed to exit read-only mode:', e);
    return false;
  }
}

// Reduce the state size by limiting open files, history, etc.
function reduceStateSize(state: FileSystemState, aggressive: boolean = false): FileSystemState {
  console.log(`Reducing state size due to storage constraints (aggressive: ${aggressive})...`);
  
  // Make a copy to avoid mutating the original
  const reducedState = { ...state };
  
  // Limit open files to a reasonable number, or even fewer in aggressive mode
  const maxOpenFiles = aggressive ? Math.floor(MAX_OPEN_FILES / 3) : MAX_OPEN_FILES;
  if (reducedState.openFiles && reducedState.openFiles.length > maxOpenFiles) {
    // Keep the most recently used files
    reducedState.openFiles = reducedState.openFiles.slice(-maxOpenFiles);
    console.log(`Reduced open files from ${state.openFiles.length} to ${reducedState.openFiles.length}`);
  }
  
  // Set the active file to the first open file if we have open files
  if (reducedState.openFiles && reducedState.openFiles.length > 0) {
    reducedState.activeFileId = reducedState.openFiles[0];
  }
  
  // Clear any extra state that might be unnecessary
  (reducedState as any).recentSearches = [];
  (reducedState as any).history = [];
  
  // Keep only the root folder expanded
  reducedState.expandedFolders = ['root'];
  
  // In aggressive mode, keep only the essential properties and truncate file contents
  if (aggressive) {
    // Keep only essential properties
    const essentialState: FileSystemState = {
      rootNode: reducedState.rootNode,
      selectedNodeId: reducedState.selectedNodeId,
      activeFileId: reducedState.activeFileId,
      openFiles: reducedState.openFiles || [],
      expandedFolders: ['root']
    };
    
    // Trim file contents more aggressively
    if (essentialState.rootNode) {
      trimFileContents(essentialState.rootNode, 200); // Much smaller threshold in aggressive mode
    }
    
    return essentialState;
  }
  
  return reducedState;
}

// Helper function to trim file contents to a maximum size
function trimFileContents(node: FileNode, maxSize: number): void {
  if (node.type === 'file' && node.content && node.content.length > maxSize) {
    // Store just the first part of the content
    node.content = node.content.substring(0, maxSize) + '\n[Content truncated due to storage constraints]';
    console.log(`Truncated content for file ${node.name} to ${maxSize} characters`);
  }
  
  // Process children recursively
  if (node.children) {
    node.children.forEach(child => trimFileContents(child, maxSize));
  }
}

// Extract large file contents from nodes and store them separately
function extractLargeFileContents(node: FileNode, chunkedFileIds: string[]): void {
  // If this is a file with large content, extract it
  if (node.type === 'file' && node.content && node.content.length > MAX_INLINE_CONTENT_SIZE) {
    try {
      // Special handling for XML files to ensure proper storage
      let contentToStore = node.content;
      const isXmlFile = node.name.toLowerCase().endsWith('.xml');
      
      // For XML files, ensure proper encoding to avoid storage issues
      if (isXmlFile) {
        console.log(`Special XML file handling for ${node.name}`);
        contentToStore = contentToStore.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
      }
      
      // Store the content separately
      localStorage.setItem(FILE_CONTENT_PREFIX + node.id, contentToStore);
      chunkedFileIds.push(node.id);
      
      // Replace the content with a placeholder in the main structure
      node.content = `[Content stored separately]`;
      
      console.log(`Extracted large content for file ${node.id}, size: ${contentToStore.length} chars`);
    } catch (error) {
      console.error(`Error extracting content for file ${node.id}:`, error);
    }
  }
  
  // Process children recursively
  if (node.children) {
    node.children.forEach(child => extractLargeFileContents(child, chunkedFileIds));
  }
}

// Try to free up storage space by removing old items
function tryToFreeStorageSpace(): boolean {
  try {
    console.log('Attempting to free storage space...');
    let freedSpace = false;
    
    // 1. First try to remove recent files data (least critical)
    try {
      localStorage.removeItem(VS_CODE_RECENT_FILES_KEY);
      console.log('Removed recent files data to save space');
      freedSpace = true;
    } catch (e) {
      console.error('Error removing recent files:', e);
    }
    
    // 2. Try to optimize localStorage by removing old or redundant items
    try {
      // Remove any temporary keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('temp') || key.includes('_tmp'))) {
          localStorage.removeItem(key);
          console.log(`Removed temporary item: ${key}`);
          freedSpace = true;
        }
      }
    } catch (e) {
      console.error('Error cleaning temporary items:', e);
    }
    
    // If that wasn't enough, proceed with more aggressive cleanup
    if (!freedSpace) {
      // 3. Find and remove chunked file contents
      const keysToRemove: string[] = [];
      const activeFileIds = new Set<string>(); // Track currently open file IDs
      
      // Get the current file system state to check active files
      try {
        const stateJson = localStorage.getItem(FILE_SYSTEM_KEY);
        if (stateJson) {
          const state = JSON.parse(stateJson);
          if (state.openFiles && Array.isArray(state.openFiles)) {
            state.openFiles.forEach((id: string) => activeFileIds.add(id));
          }
        }
      } catch (e) {
        console.error('Error parsing file system state:', e);
      }
      
      // Collect chunked file contents, prioritizing non-active files
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(FILE_CONTENT_PREFIX)) {
          const fileId = key.substring(FILE_CONTENT_PREFIX.length);
          // Prioritize removing content of files that aren't currently open
          if (!activeFileIds.has(fileId)) {
            keysToRemove.unshift(key); // Add to beginning (higher priority to remove)
          } else {
            keysToRemove.push(key); // Add to end (lower priority to remove)
          }
        }
      }
      
      // 4. Remove at least 70% of chunked files to free up more space
      const numToRemove = Math.max(10, Math.ceil(keysToRemove.length * 0.7));
      console.log(`Removing ${numToRemove} chunked files out of ${keysToRemove.length}`);
      
      keysToRemove.slice(0, numToRemove).forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed item from localStorage: ${key}`);
        freedSpace = true;
      });
      
      // 5. Clear the metadata about chunked files since we've removed some
      if (freedSpace) {
        localStorage.removeItem(FILE_SYSTEM_META_KEY);
      }
    }
    
    // If still not enough, try to clear the entire file system and start fresh
    if (!freedSpace) {
      console.log('All cleanup strategies failed. Clearing entire file system as last resort.');
      clearAllFileSystemData();
      freedSpace = true;
      isStorageFull = true; // Mark that we're in a storage-constrained environment
    }
    
    return freedSpace;
  } catch (error) {
    console.error('Error trying to free storage space:', error);
    return false;
  }
}

// Clear all file system related data from localStorage
function clearAllFileSystemData(): void {
  try {
    // Find all VS Code related keys and remove them
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('vs-code-') || key === FILE_SYSTEM_KEY)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared storage item: ${key}`);
    });
  } catch (error) {
    console.error('Error clearing file system data:', error);
  }
}

// Create a new file
export function createFile(
  state: FileSystemState, 
  parentId: string, 
  filename: string, 
  content: string = '', 
  language: string = 'plaintext'
): FileSystemState {
  console.log(`Creating file ${filename} in ${parentId}`);
  const newState = { ...state };
  const parent = findNodeById(newState.rootNode, parentId);
  
  if (!parent || parent.type !== 'directory') {
    console.error('Parent not found or not a directory');
    return state;
  }
  
  // Create the file node
  const fileId = uuidv4();
  const newFile: FileNode = {
    id: fileId,
    name: filename,
    type: 'file',
    content,
    language: language || getLanguageFromFilename(filename),
    parentId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Add to parent's children
  if (!parent.children) parent.children = [];
  parent.children.push(newFile);
  parent.updatedAt = Date.now();
  
  // Open the new file
  newState.openFiles = [...newState.openFiles, fileId];
  newState.activeFileId = fileId;
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Create a new folder
export function createFolder(
  state: FileSystemState, 
  parentId: string, 
  folderName: string
): FileSystemState {
  console.log(`Creating folder ${folderName} in ${parentId}`);
  const newState = { ...state };
  const parent = findNodeById(newState.rootNode, parentId);
  
  if (!parent || parent.type !== 'directory') {
    console.error('Parent not found or not a directory');
    return state;
  }
  
  // Create the folder node
  const folderId = uuidv4();
  const newFolder: FileNode = {
    id: folderId,
    name: folderName,
    type: 'directory',
    children: [],
    parentId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Add to parent's children
  if (!parent.children) parent.children = [];
  parent.children.push(newFolder);
  parent.updatedAt = Date.now();
  
  // Expand the parent folder
  if (!newState.expandedFolders.includes(parentId)) {
    newState.expandedFolders = [...newState.expandedFolders, parentId];
  }
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Delete a file or folder
export function deleteFileOrFolder(state: FileSystemState, nodeId: string): FileSystemState {
  console.log(`Deleting node ${nodeId}`);
  const newState = { ...state };
  
  // Find the parent
  const parent = findParentNode(newState.rootNode, nodeId);
  if (!parent || !parent.children) {
    console.error('Parent not found or has no children');
    return state;
  }
  
  // Remove from parent's children
  parent.children = parent.children.filter(child => child.id !== nodeId);
  parent.updatedAt = Date.now();
  
  // If the file is open, close it
  if (newState.openFiles.includes(nodeId)) {
    newState.openFiles = newState.openFiles.filter(id => id !== nodeId);
    
    // If it's the active file, set a new active file
    if (newState.activeFileId === nodeId) {
      newState.activeFileId = newState.openFiles.length > 0 ? newState.openFiles[0] : null;
    }
  }
  
  // Remove from expanded folders if it's a folder
  if (newState.expandedFolders.includes(nodeId)) {
    newState.expandedFolders = newState.expandedFolders.filter(id => id !== nodeId);
  }
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Rename a file or folder
export function renameFileOrFolder(
  state: FileSystemState, 
  nodeId: string, 
  newName: string
): FileSystemState {
  console.log(`Renaming node ${nodeId} to ${newName}`);
  const newState = { ...state };
  const node = findNodeById(newState.rootNode, nodeId);
  
  if (!node) {
    console.error('Node not found');
    return state;
  }
  
  // Update the name
  node.name = newName;
  node.updatedAt = Date.now();
  
  // If it's a file, update the language based on extension
  if (node.type === 'file') {
    node.language = getLanguageFromFilename(newName);
  }
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Save file content
export function saveFileContent(
  state: FileSystemState, 
  fileId: string, 
  content: string
): FileSystemState {
  const newState = { ...state };
  const file = findNodeById(newState.rootNode, fileId);
  
  if (!file || file.type !== 'file') {
    console.error('File not found or not a file');
    return state;
  }
  
  // Update the content
  file.content = content;
  file.updatedAt = Date.now();
  
}

// Open a file
export function openFile(state: FileSystemState, fileId: string): FileSystemState {
console.log(`Opening file: ${fileId}`);

// Find the file node
const fileNode = findNodeById(state.rootNode, fileId) as FileNode | null;
if (!fileNode || fileNode.type !== 'file') {
console.error(`File node not found for id: ${fileId}`);
return state;
}

// Update state
const updatedState = {
...state,
activeFileId: fileId,
openFiles: state.openFiles?.includes(fileId)
? state.openFiles
: [...(state.openFiles || []), fileId]
};

// Save the updated state if not in read-only mode
if (!isReadOnlyMode) {
try {
saveFileSystemState(updatedState);
} catch (error) {
console.error('Error saving state after opening file:', error);
// Continue with opening the file even if saving fails
}
} else {
console.log('Read-only mode: Skipped saving file system state after opening file');
}

return updatedState;
}

// Close a file
export function closeFile(state: FileSystemState, fileId: string): FileSystemState {
  const newState = { ...state };
  
  // Remove from open files
  newState.openFiles = newState.openFiles.filter(id => id !== fileId);
  
  // If it's the active file, set a new active file
  if (newState.activeFileId === fileId) {
    newState.activeFileId = newState.openFiles.length > 0 ? newState.openFiles[0] : null;
  }
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Toggle folder expansion
export function toggleFolderExpansion(state: FileSystemState, folderId: string): FileSystemState {
  const newState = { ...state };
  const folder = findNodeById(newState.rootNode, folderId);
  
  if (!folder || folder.type !== 'directory') {
    console.error('Folder not found or not a directory');
    return state;
  }
  
  // Toggle expansion
  if (newState.expandedFolders.includes(folderId)) {
    newState.expandedFolders = newState.expandedFolders.filter(id => id !== folderId);
  } else {
    newState.expandedFolders = [...newState.expandedFolders, folderId];
  }
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Get a file by its ID
export function getFileById(state: FileSystemState, fileId: string): FileNode | null {
  return findNodeById(state.rootNode, fileId);
}

// Get recently modified files
export function getRecentFiles(state: FileSystemState, limit: number = 5): FileNode[] {
  const files: FileNode[] = [];
  
  // Helper function to collect all files in a node
  const collectFiles = (node: FileNode) => {
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      node.children.forEach(collectFiles);
    }
  };
  
  // Collect all files
  collectFiles(state.rootNode);
  
  // Sort by updatedAt (most recent first) and limit
  return files
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

// Search for files by name (for quick open)
export function searchFiles(state: FileSystemState, query: string): FileNode[] {
  if (!query) return [];
  
  const files: FileNode[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Helper function to collect matching files
  const collectMatchingFiles = (node: FileNode) => {
    if (node.type === 'file' && node.name.toLowerCase().includes(lowerQuery)) {
      files.push(node);
    }
    
    if (node.children) {
      node.children.forEach(collectMatchingFiles);
    }
  };
  
  // Collect all matching files
  collectMatchingFiles(state.rootNode);
  
  // Sort by relevance (exact match first, then startsWith, then includes)
  return files.sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    
    // Exact match gets highest priority
    if (aLower === lowerQuery) return -1;
    if (bLower === lowerQuery) return 1;
    
    // Then startsWith
    if (aLower.startsWith(lowerQuery) && !bLower.startsWith(lowerQuery)) return -1;
    if (!aLower.startsWith(lowerQuery) && bLower.startsWith(lowerQuery)) return 1;
    
    // Finally alphabetical
    return aLower.localeCompare(bLower);
  });
}

// Export files to disk (download)
export function exportFile(fileNode: FileNode): void {
  if (!fileNode || fileNode.type !== 'file' || !fileNode.content) {
    console.error('Invalid file node for export');
    return;
  }
  
  const blob = new Blob([fileNode.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileNode.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import file from disk (upload)
export function importFile(
  state: FileSystemState,
  parentId: string,
  file: File
): Promise<FileSystemState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const updatedState = createFile(
          state,
          parentId,
          file.name,
          content,
          getLanguageFromFilename(file.name)
        );
        resolve(updatedState);
      } catch (error) {
        console.error('Error importing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
}

// Enhanced file system state with tab history
interface TabHistoryEntry {
  fileId: string;
  position?: { lineNumber: number; column: number };
}

// Tab history for reopening closed tabs
export interface TabHistory {
  closed: TabHistoryEntry[];
  positions: Record<string, { lineNumber: number; column: number }>;
}

const TAB_HISTORY_KEY = 'vs-code-tab-history';

// Get tab history
export function getTabHistory(): TabHistory {
  if (typeof window === 'undefined') {
    return { closed: [], positions: {} };
  }
  
  try {
    const stored = localStorage.getItem(TAB_HISTORY_KEY);
    if (!stored) return { closed: [], positions: {} };
    
    return JSON.parse(stored) as TabHistory;
  } catch (error) {
    console.error('Error loading tab history:', error);
    return { closed: [], positions: {} };
  }
}

// Save tab history
export function saveTabHistory(history: TabHistory): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TAB_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving tab history:', error);
  }
}

// Add closed tab to history
export function addToClosedTabs(
  fileId: string, 
  position?: { lineNumber: number; column: number }
): void {
  const history = getTabHistory();
  
  // Add to closed tabs (limit to 10)
  history.closed = [{ fileId, position }, ...history.closed.slice(0, 9)];
  
  // Save cursor position
  if (position) {
    history.positions[fileId] = position;
  }
  
  saveTabHistory(history);
}

// Reopen last closed tab
export function reopenLastClosedTab(state: FileSystemState): { 
  state: FileSystemState; 
  position?: { lineNumber: number; column: number } 
} | null {
  const history = getTabHistory();
  
  if (history.closed.length === 0) {
    return null;
  }
  
  // Get the last closed tab
  const lastClosed = history.closed[0];
  
  // Check if the file still exists
  const file = findNodeById(state.rootNode, lastClosed.fileId);
  if (!file || file.type !== 'file') {
    // File doesn't exist anymore, remove from history and try the next one
    history.closed.shift();
    saveTabHistory(history);
    return reopenLastClosedTab(state);
  }
  
  // Remove from closed tabs
  history.closed.shift();
  saveTabHistory(history);
  
  // Open the file
  const newState = openFile(state, lastClosed.fileId);
  
  // Return the state and position
  return { 
    state: newState, 
    position: lastClosed.position || history.positions[lastClosed.fileId] 
  };
}

// Save cursor position for a file
export function saveCursorPosition(
  fileId: string, 
  position: { lineNumber: number; column: number }
): void {
  const history = getTabHistory();
  history.positions[fileId] = position;
  saveTabHistory(history);
}

// Get cursor position for a file
export function getCursorPosition(
  fileId: string
): { lineNumber: number; column: number } | undefined {
  const history = getTabHistory();
  return history.positions[fileId];
}

// Export a function to reset the file system (for testing and development)
export function resetFileSystem(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(FILE_SYSTEM_KEY);
  localStorage.removeItem(EDITOR_STATE_KEY);
  localStorage.removeItem(TAB_HISTORY_KEY);
  
  console.log('File system reset to default');
}
