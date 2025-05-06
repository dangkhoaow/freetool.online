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
const EDITOR_STATE_KEY = 'vs-code-editor-state';

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
// Get the file system state from localStorage
export function getFileSystemState(): FileSystemState {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_STATE;
  
  try {
    const stored = localStorage.getItem(FILE_SYSTEM_KEY);
    if (!stored) {
      console.log('No file system found in localStorage, using default');
      return DEFAULT_EDITOR_STATE;
    }
    
    const parsed = JSON.parse(stored) as FileSystemState;
    console.log('Loaded file system from localStorage');
    return parsed;
  } catch (error) {
    console.error('Error loading file system from localStorage:', error);
    return DEFAULT_EDITOR_STATE;
  }
}

// Save the file system state to localStorage
export function saveFileSystemState(state: FileSystemState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(FILE_SYSTEM_KEY, JSON.stringify(state));
    console.log('Saved file system to localStorage');
  } catch (error) {
    console.error('Error saving file system to localStorage:', error);
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
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
}

// Open a file
export function openFile(state: FileSystemState, fileId: string): FileSystemState {
  const newState = { ...state };
  const file = findNodeById(newState.rootNode, fileId);
  
  if (!file || file.type !== 'file') {
    console.error('File not found or not a file');
    return state;
  }
  
  // Add to open files if not already open
  if (!newState.openFiles.includes(fileId)) {
    newState.openFiles = [...newState.openFiles, fileId];
  }
  
  // Set as active file
  newState.activeFileId = fileId;
  
  // Save and return
  saveFileSystemState(newState);
  return newState;
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
