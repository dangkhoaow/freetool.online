"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { 
  Undo2, 
  Redo2, 
  Plus, 
  Save, 
  X, 
  FolderOpen, 
  Settings, 
  FileCode, 
  Command
} from 'lucide-react';
import { VSCodeLayout } from './vs-code-layout';
import { VSCodeFileExplorer } from './vs-code-file-explorer';
import { VSCodeEditorTabs } from './vs-code-editor-tabs';
import { VSCodeStatusBar } from './vs-code-status-bar';
import { VSCodeCommandPalette, VSCodeCommand, getStandardCommands } from './vs-code-command-palette';
import { FolderSelector } from './folder-selector';
import { VSCodeQuickPicker } from './vs-code-quick-picker';
import { VSCodeMenuBar } from './vs-code-menu-bar';
import { VSCodeFileBrowser } from './vs-code-file-browser';
import useVSCodeStore from '../store/vs-code-store';
import { nanoid } from 'nanoid';
import { saveCurrentFolderPath, getCurrentFolderPath, STORAGE_KEYS, logAllStorageKeys } from '../utils/storage-utils';
import { findNodeById, FileNode, getLanguageFromFilename } from '@/lib/services/vs-code-file-system';
import { Terminal, Brackets, Bug, Play, FileSearch, GitBranch, Database, Settings as SettingsIcon, Split, LayoutPanelLeft } from 'lucide-react';
import { default as useVSCodeStoreImport } from '@/app/code-editor/store/vs-code-store';

type ExtendedFileNode = ReturnType<typeof useVSCodeStoreImport.getState>['rootNode'] extends infer T ? 
  T extends { children?: infer C } ? 
    C extends (infer U)[] ? U : never
  : never
: never;

// Theme definition for the editor to match VS Code dark theme
const vsCodeDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'type', foreground: '4EC9B0' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editorCursor.foreground': '#AEAFAD',
    'editor.lineHighlightBackground': '#2B2B2B',
    'editorLineNumber.foreground': '#858585',
    'editor.selectionBackground': '#264F78',
    'editor.inactiveSelectionBackground': '#3A3D41',
  }
};

// VS Code light theme
const vsCodeLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '008000' },
    { token: 'keyword', foreground: '0000FF' },
    { token: 'string', foreground: 'A31515' },
    { token: 'number', foreground: '098658' },
    { token: 'operator', foreground: '000000' },
    { token: 'variable', foreground: '001080' },
    { token: 'function', foreground: '795E26' },
    { token: 'type', foreground: '267F99' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#000000',
    'editorCursor.foreground': '#000000',
    'editor.lineHighlightBackground': '#F3F3F3',
    'editorLineNumber.foreground': '#6E6E6E',
    'editor.selectionBackground': '#ADD6FF',
    'editor.inactiveSelectionBackground': '#E5EBF1',
  }
};

// Keyboard shortcuts
const SHORTCUTS = {
  COMMAND_PALETTE: ['Control', 'Shift', 'P'],
  QUICK_OPEN: ['Control', 'P'],
  SAVE: ['Control', 's'],
  TOGGLE_SIDEBAR: ['Control', 'b'],
  TOGGLE_PANEL: ['Control', 'j'],
  TOGGLE_COMMENT: ['Control', '/'],
  SPLIT_EDITOR: ['Control', '\\'],
  CLOSE_TAB: ['Control', 'w'],
  REOPEN_CLOSED_TAB: ['Control', 'Shift', 't'],
  FIND: ['Control', 'f'],
  RUN_CODE: ['Control', 'Enter'],
};

// Helper to check if a keyboard event matches a shortcut
const matchesShortcut = (e: KeyboardEvent, shortcut: string[]): boolean => {
  const key = e.key.toLowerCase();
  
  // Check if all modifier keys match
  const ctrlMatch = shortcut.includes('Control') === e.ctrlKey;
  const shiftMatch = shortcut.includes('Shift') === e.shiftKey;
  const altMatch = shortcut.includes('Alt') === e.altKey;
  
  // Find the non-modifier key
  const mainKey = shortcut.find(k => !['Control', 'Shift', 'Alt'].includes(k));
  
  // Check if the main key matches (case insensitive)
  const mainKeyMatch = mainKey?.toLowerCase() === key;
  
  return ctrlMatch && shiftMatch && altMatch && mainKeyMatch;
};

// Type for editor instances
type EditorInstance = {
  editor: monaco.editor.IStandaloneCodeEditor;
  model: monaco.editor.ITextModel;
  disposables?: monaco.IDisposable[];
};

export default function VSCodeEditor() {
  // Get store state and actions
  const {
  rootNode, 
  selectedNodeId, 
  openFiles, 
  activeFileId, 
  expandedFolders,
  
  // Actions
  createNewFile, 
  deleteFile, 
  renameFile, 
  saveFile, 
  openFile,
  closeFile: storeCloseFile, 
  setActiveFile, 
  toggleFolder, 
  setEditorContent,
  markFileAsDirty,
  markFileAsSaved,
  getRecentFiles,
  setCursorPosition,
  cursorPositions
} = useVSCodeStore();
  
  // Local state
  const [editorInstances, setEditorInstances] = useState<Record<string, EditorInstance>>({});
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState(false);
  const [commandsList, setCommandsList] = useState<VSCodeCommand[]>([]);
  const [cursorPosition, setLocalCursorPosition] = useState({ lineNumber: 1, column: 1 });
  const [lineCount, setLineCount] = useState(1);
  const [fontSize, setFontSize] = useState(14); // Default font size for editor
  
  // Track current folder path with persistence in localStorage using our storage utils
  const [currentFolderPath, setCurrentFolderPath] = useState(() => {
    // Log storage state for debugging
    console.log('VSCodeEditor: Initializing currentFolderPath');
    logAllStorageKeys();
    
    // Get path from storage utils
    const savedPath = getCurrentFolderPath();
    console.log('VSCodeEditor: Got folder path from storage utils:', savedPath);
    
    return savedPath;
  });
  
  // File browser state
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  
  // Local UI state (previously in store)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [secondaryFileId, setSecondaryFileId] = useState<string | null>(null);
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [editorLayout, setEditorLayout] = useState<'single' | 'split-horizontal' | 'split-vertical'>('single');
  
  // Track closed tabs for reopening
  const [closedTabs, setClosedTabs] = useState<string[]>([]);
  
  // Terminal state and functions
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<'terminal' | 'problems' | 'output'>('terminal');
  const appendToTerminal = (text: string) => {
    console.log('Terminal output:', text);
    setTerminalOutput(prev => [...prev, text]);
  };
  const clearTerminal = () => {
    console.log('Clearing terminal');
    setTerminalOutput([]);
  };
  
  // Local UI control functions
  const toggleSidebar = () => setIsSidebarVisible(prev => !prev);
  const togglePanel = () => setIsPanelVisible(prev => !prev);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  // Add detailed logging wrappers around file operations for better debugging
  const openFileById = (fileId: string) => {
    console.log(`VSCodeEditor: Opening file with ID: ${fileId}`);
    try {
      // Get the latest state from the store to ensure we have the most recent version of rootNode
      const latestStoreState = useVSCodeStore.getState();
      
      // Check if file exists in the latest rootNode from the store
      const fileNode = findNodeById(latestStoreState.rootNode, fileId);
      
      if (!fileNode) {
        console.error(`VSCodeEditor: File with ID ${fileId} not found in rootNode - will retry with delay`);
        
        // If not found, we might be in a race condition where the state update hasn't been applied yet
        // Use a small delay to retry after state updates have a chance to complete
        setTimeout(() => {
          const retryState = useVSCodeStore.getState();
          const retryFileNode = findNodeById(retryState.rootNode, fileId);
          
          if (retryFileNode) {
            console.log(`VSCodeEditor: File ${fileId} found after retry`);
            // Open the file via the store action directly
            retryState.openFile(fileId);
          } else {
            console.error(`VSCodeEditor: File ${fileId} still not found after retry - giving up`);
          }
        }, 10);
        return;
      }
      
      // Log file details for debugging
      console.log(`VSCodeEditor: Found file in rootNode:`, {
        id: fileNode.id,
        name: fileNode.name,
        type: fileNode.type,
        hasContent: Boolean(fileNode.content),
        contentLength: fileNode.content?.length || 0,
        realPath: (fileNode as ExtendedFileNode).realPath
      });
      
      // Open the file via the store action
      openFile(fileId);
      
      // Get the active file ID after opening
      const newActiveFileId = useVSCodeStore.getState().activeFileId;
      console.log(`VSCodeEditor: Active file ID after openFile: ${newActiveFileId}`);
      
      // Debug info about open files
      const openFilesAfter = useVSCodeStore.getState().openFiles;
      console.log(`VSCodeEditor: Open files after openFile: ${openFilesAfter.length} files`, openFilesAfter);
      
      console.log(`VSCodeEditor: Successfully opened file: ${fileId}`);
    } catch (error) {
      console.error(`VSCodeEditor: Error opening file ${fileId}:`, error);
    }
  };
  
  // Enhanced saveFile function with detailed logging
  const enhancedSaveFile = (fileId: string, content: string) => {
    console.log(`VSCodeEditor: Saving file with ID: ${fileId}, content length: ${content.length}`);
    const fileNode = findNodeById(rootNode, fileId);
    console.log(`VSCodeEditor: File details:`, {
      name: fileNode?.name,
      type: fileNode?.type,
      // Use type assertion to avoid TypeScript errors
      hasRealPath: Boolean((fileNode as any)?.realPath),
      realPath: (fileNode as any)?.realPath,
      isDirty: (fileNode as any)?.isDirty
    });
    
    try {
      // Call the actual saveFile function from the store
      saveFile(fileId, content);
      console.log(`VSCodeEditor: Save file request successfully sent to store for ${fileId}`);
    } catch (error) {
      console.error(`VSCodeEditor: Error saving file ${fileId}:`, error);
    }
  };
  const closeFileById = storeCloseFile;
  
  // Compatibility functions for cursor position
  const saveCursor = setCursorPosition;
  const getCursor = (fileId: string) => cursorPositions[fileId] || { lineNumber: 1, column: 1 };
  
  // Memoize frequently used values to prevent unnecessary recalculations
  const getOpenFileNodes = useCallback(() => {
    console.log('Getting open file nodes for:', openFiles);
    // Create a stable reference to openFiles to avoid cyclic re-renders
    const currentOpenFiles = [...openFiles];
    return currentOpenFiles
      .map(id => {
        const node = findNodeById(rootNode, id);
        if (!node) console.log('Warning: Node not found for ID:', id);
        return node;
      })
      .filter((file): file is FileNode => file !== null && file.type === 'file');
  }, [openFiles, rootNode]);
  
  // Memoize the result of getOpenFileNodes to prevent unnecessary re-renders
  const openFileNodes = useMemo(() => getOpenFileNodes(), [getOpenFileNodes]);
  
  // Additional compatibility functions for renamed or removed store methods
  const createNewFolder = (parentId: string, folderName: string) => {
    console.log('Creating new folder in parent', parentId, folderName);
    // This is a placeholder. Implement proper folder creation API call here.
  };
  
  const getRecentFilesWithLimit = (limit?: number) => {
    const files = getRecentFiles();
    return limit ? files.slice(0, limit) : files;
  };
  
  const selectNode = (nodeId: string | null) => {
    console.log('Selecting node', nodeId);
    if (nodeId && findNodeById(rootNode, nodeId)) {
      const node = findNodeById(rootNode, nodeId);
      if (node && node.type === 'file') {
        openFile(nodeId);
      }
    }
  };
  
  const markFileAsUnsaved = (fileId: string) => {
    setUnsavedFiles(prev => new Set([...prev, fileId]));
  };
  
  // Add a reopenClosedTab function for backwards compatibility
  const reopenClosedTab = () => {
    console.log('Attempting to reopen last closed tab');
    if (closedTabs.length > 0) {
      const lastTab = closedTabs[closedTabs.length - 1];
      openFile(lastTab);
      
      // Remove from closed tabs
      setClosedTabs(prev => prev.slice(0, -1));
    }
  };
  
  // Override the closeFile function to track closed tabs
  const originalCloseFile = storeCloseFile;
  const closeFile = (fileId: string) => {
    // Add to closed tabs before closing
    setClosedTabs(prev => [...prev, fileId]);
    originalCloseFile(fileId);
  };
  
  // Refs
  const monacoRef = useRef<typeof monaco | null>(null);
  const primaryEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const secondaryEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const commandsInitialized = useRef(false);
  
  console.log('Rendering VSCodeEditor with active file:', activeFileId);
  
  // Helper function to handle button clicks with proper event handling
  const handleButtonClick = useCallback((handler: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  }, []);
  
  // Listen for file open events from the explorer
  useEffect(() => {
    // Function to handle file open events from explorer
    const handleFileOpenEvent = (event: CustomEvent) => {
      console.log('Received open-file-in-editor event:', event.detail);
      const { fileId, name, content, language, realPath, path } = event.detail;
      
      if (!fileId || content === undefined) {
        console.error('Invalid file data received from open event - missing fileId or content is undefined');
        return;
      }
      
      // Allow empty content as it's valid for new files
      console.log(`Processing file open request: ${name}, content length: ${content.length}, fileId: ${fileId}`);
      
      // Use either realPath explicitly set or fall back to path if realPath is not defined
      const fileDiskPath = realPath || path;
      
      // Check if realPath is provided
      if (fileDiskPath) {
        console.log(`File has a real path: ${fileDiskPath}, will be able to save to disk`);
      } else {
        console.warn(`File does not have a real path, will only be saved in memory`);
      }
      
      try {
        // Create a new file node if it doesn't exist in the rootNode
        const existingNode = findNodeById(rootNode, fileId);
        if (!existingNode) {
          console.log(`Creating new file node for: ${name}`);
          
          // Create a new file node with realPath if available
          // Use ExtendedFileNode type to properly include realPath
          const newFile: ExtendedFileNode = {
            id: fileId,
            name: name,
            type: 'file',
            content: content,
            language: language || getLanguageFromFilename(name),
            parentId: rootNode.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          // Add realPath if provided
          if (fileDiskPath) {
            newFile.realPath = fileDiskPath;
            console.log(`Added realPath ${fileDiskPath} to file node ${fileId}`);
          }
          
          // Update the root node with the new file
          const updatedRootNode = { ...rootNode };
          updatedRootNode.children = [...(updatedRootNode.children || []), newFile];
          
          // Get the latest state from the store to avoid stale state issues
          const storeState = useVSCodeStore.getState();
          
          // Update the root node in the store
          useVSCodeStore.setState({
            ...storeState,
            rootNode: updatedRootNode
          });
          
          console.log(`Added new file node to root node, total children: ${updatedRootNode.children.length}`);
        } else {
          // If the node already exists but doesn't have realPath, add it now
          const existingFileNode = existingNode as ExtendedFileNode;
          
          // Check if we need to update the content
          let needsUpdate = false;
          if (fileDiskPath && !existingFileNode.realPath) {
            needsUpdate = true;
            console.log(`Adding missing realPath ${fileDiskPath} to existing file node ${fileId}`);
          }
          
          // Maybe the content has changed on disk, update it
          if (existingFileNode.content !== content) {
            needsUpdate = true;
            console.log(`Updating content for file ${fileId}, old length: ${existingFileNode.content?.length || 0}, new length: ${content.length}`);
          }
          
          if (needsUpdate) {
            // Create a deep copy of the root node to update
            const updatedRootNode = { ...rootNode };
            const updateNode = (node: ExtendedFileNode): ExtendedFileNode => {
              if (node.id === fileId) {
                return { 
                  ...node, 
                  content: content,
                  realPath: fileDiskPath || node.realPath,
                  updatedAt: Date.now()
                };
              }
              if (node.children) {
                return {
                  ...node,
                  children: node.children.map(child => updateNode(child as ExtendedFileNode))
                };
              }
              return node;
            };
            
            // Update the node in the tree
            const updatedRootNodeWithChanges = updateNode(updatedRootNode);
            
            // Get the latest state from the store
            const storeState = useVSCodeStore.getState();
            
            // Update the store
            useVSCodeStore.setState({
              ...storeState,
              rootNode: updatedRootNodeWithChanges
            });
            
            console.log(`Updated existing file node ${fileId} in the tree`);
          }
        }
        
        // Get the latest state from the store to ensure our rootNode is up to date
        const latestState = useVSCodeStore.getState();
        console.log(`Opening file ${fileId} in the editor after state update`);
        
        // Use a setTimeout to allow React state updates to complete
        setTimeout(() => {
          console.log(`Delayed openFile for ${fileId} to allow state updates to complete`);
          // Call openFile directly from the store instead of going through our wrapper
          // This ensures we're using the latest state from the store
          useVSCodeStore.getState().openFile(fileId);
        }, 0);
      } catch (error) {
        console.error(`Error processing file open event for ${name}:`, error);
      }
    };
    
    // Add event listeners for file open events on both document and window
    document.addEventListener('open-file-in-editor', handleFileOpenEvent as EventListener);
    window.addEventListener('open-file-in-editor', handleFileOpenEvent as EventListener);
    
    console.log('VSCodeEditor: Added event listeners for open-file-in-editor events');
    
    return () => {
      // Clean up both listeners
      document.removeEventListener('open-file-in-editor', handleFileOpenEvent as EventListener);
      window.removeEventListener('open-file-in-editor', handleFileOpenEvent as EventListener);
      console.log('VSCodeEditor: Removed event listeners for open-file-in-editor');
    };
  }, []);
  
  // Add event listeners for file interactions
  useEffect(() => {
    console.log('Setting up file interaction event listeners');
    
    // Handler for saving file content requested by the menu bar
    const handleSaveFileContent = (event: CustomEvent) => {
      console.log('VSCodeEditor: Received save-file-content event:', event.detail);
      const { fileId } = event.detail;
      
      if (!fileId) {
        console.error('VSCodeEditor: Invalid file ID received from save-file-content event');
        return;
      }
      
      console.log(`VSCodeEditor: Current active file ID: ${activeFileId}`);
      console.log(`VSCodeEditor: Editor instances available:`, Object.keys(editorInstances));
      
      // First try to get the editor instance for this file ID
      const instance = editorInstances[fileId];
      
      if (instance) {
        // If we have an instance, get content from it
        const currentContent = instance.model.getValue();
        console.log(`VSCodeEditor: Got current editor content from instance for ${fileId}, length: ${currentContent.length} characters`);
        
        // Save the file with the latest content
        try {
          enhancedSaveFile(fileId, currentContent);
          console.log(`VSCodeEditor: Successfully saved current content for file ID ${fileId}`);
        } catch (error) {
          console.error(`VSCodeEditor: Error saving content for file ID ${fileId}:`, error);
        }
      } else {
        // If we don't have an instance, try to get the content from the store
        console.log(`VSCodeEditor: No editor instance found for file ID ${fileId}, trying to get content from store`);
        const fileNode = findNodeById(rootNode, fileId) as FileNode;
        
        if (fileNode && fileNode.content !== undefined) {
          console.log(`VSCodeEditor: Found file node in store with content length: ${fileNode.content.length}`);
          try {
            enhancedSaveFile(fileId, fileNode.content);
            console.log(`VSCodeEditor: Successfully saved content from store for file ID ${fileId}`);
          } catch (error) {
            console.error(`VSCodeEditor: Error saving content from store for file ID ${fileId}:`, error);
          }
        } else {
          console.error(`VSCodeEditor: Could not find file content in store for file ID ${fileId}`);
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('save-file-content', handleSaveFileContent as EventListener);
    
    // Clean up event listeners
    return () => {
      console.log('Cleaning up save file content event listeners');
      document.removeEventListener('save-file-content', handleSaveFileContent as EventListener);
    };
  }, [editorInstances, activeFileId, rootNode, enhancedSaveFile]);
  
  // Effect to handle when active file changes
  useEffect(() => {
    // Skip if there's no active file
    if (!activeFileId) {
      console.log('No active file, skipping effect');
      return;
    }

    // Check if we have an editor instance for this file
    const instance = editorInstances[activeFileId];
    console.log(`Active file changed to ${activeFileId}, editor instance exists: ${Boolean(instance)}`);

    // Check if the file exists in the root node and log its content length
    const fileNode = findNodeById(rootNode, activeFileId);
    if (fileNode) {
      console.log(`Found node in rootNode for ${activeFileId}, content length: ${fileNode.content?.length || 0}`);
    } else {
      console.warn(`Node for ${activeFileId} not found in rootNode`);
    }
  }, [activeFileId, editorInstances, rootNode]);
  
  // Effect to cleanup editor instances when files are closed
  useEffect(() => {
    // Get the previous open files and current open files
    const previousOpenFiles = Object.keys(editorInstances);
    const currentOpenFiles = openFiles;
    
    // Find files that were previously open but are now closed
    const closedFiles = previousOpenFiles.filter(fileId => !currentOpenFiles.includes(fileId));
    
    if (closedFiles.length > 0) {
      console.log(`Detected ${closedFiles.length} closed files:`, closedFiles);
      
      // Cleanup the editor instances for closed files
      const updatedInstances = { ...editorInstances };
      closedFiles.forEach(fileId => {
        // Dispose of any listeners to prevent memory leaks
        if (updatedInstances[fileId] && updatedInstances[fileId].disposables) {
          updatedInstances[fileId].disposables.forEach((disposable: monaco.IDisposable) => disposable.dispose());
          console.log(`Disposed listeners for file ${fileId}`);
        }
        // Delete the instance
        delete updatedInstances[fileId];
        console.log(`Removed editor instance for file ${fileId}`);
      });
      
      // Update the editor instances state
      setEditorInstances(updatedInstances);
      console.log(`Updated editor instances after cleanup, remaining: ${Object.keys(updatedInstances).length}`);
    }
  }, [openFiles, editorInstances]);
  
  // Keep track of active file changes to ensure we have the correct editor instance
  useEffect(() => {
    if (activeFileId) {
      console.log(`VSCodeEditor: Active file changed to ${activeFileId}, checking if we have an editor instance`);
      
      if (!editorInstances[activeFileId]) {
        console.log(`VSCodeEditor: No editor instance found for ${activeFileId}, will be created when editor mounts`);
      } else {
        console.log(`VSCodeEditor: Found existing editor instance for ${activeFileId}`);
      }
      
      // When the active file changes, update the Monaco editor model with the latest content from the store
      const fileNode = findNodeById(rootNode, activeFileId) as FileNode;
      
      if (fileNode && fileNode.content !== undefined) {
        console.log(`VSCodeEditor: File content for ${activeFileId} from store, length: ${fileNode.content.length}`);
      }
    }
  }, [activeFileId, editorInstances, rootNode]);

  // Persist currentFolderPath to localStorage whenever it changes using storage-utils
  useEffect(() => {
    // Only try to save if path is not empty
    if (currentFolderPath) {
      console.log('VSCodeEditor: Detected currentFolderPath change, saving:', currentFolderPath);
      
      // Use our storage utils for consistent persistence
      const success = saveCurrentFolderPath(currentFolderPath);
      
      if (success) {
        // Since we have a valid folder path, ensure it's available to the explorer
        // by dispatching a refresh event
        if (document.readyState === 'complete') {
          console.log('VSCodeEditor: Document ready, dispatching initial refresh-explorer event');
          const refreshEvent = new CustomEvent('refresh-explorer', {
            detail: { path: currentFolderPath }
          });
          document.dispatchEvent(refreshEvent);
        }
      }
    } else {
      console.log('VSCodeEditor: Not saving empty path, current value:', currentFolderPath);
    }
  }, [currentFolderPath]);

  // Initialize commands with stable references
  useEffect(() => {
    if (commandsInitialized.current) return;
    
    console.log('Initializing VS Code commands');
    commandsInitialized.current = true;
    
    const commands: VSCodeCommand[] = [
      {
        id: 'workbench.action.quickOpen',
        title: 'Go to File...',
        keybinding: ['Control', 'P'],
        execute: () => {
          setIsQuickPickerOpen(true);
        }
      },
      {
        id: 'workbench.action.showCommands',
        title: 'Show All Commands',
        keybinding: ['Control', 'Shift', 'P'],
        execute: () => {
          setIsCommandPaletteOpen(true);
        }
      },
      {
        id: 'workbench.action.toggleSidebarVisibility',
        title: 'Toggle Sidebar Visibility',
        keybinding: ['Control', 'B'],
        execute: () => {
          toggleSidebar();
        }
      },
      {
        id: 'workbench.action.togglePanel',
        title: 'Toggle Panel',
        keybinding: ['Control', 'J'],
        execute: () => {
          togglePanel();
        }
      },
      {
        id: 'workbench.action.editor.changeLanguageMode',
        title: 'Change Language Mode',
        execute: () => {
          console.log('Change language mode command not implemented yet');
        }
      },
      {
        id: 'workbench.action.debug.run',
        title: 'Run Code',
        keybinding: ['Control', 'Enter'],
        execute: () => {
          if (activeFileId && primaryEditorRef.current) {
            const content = primaryEditorRef.current.getValue();
            const file = findNodeById(rootNode, activeFileId);
            
            if (file && file.type === 'file') {
              try {
                clearTerminal();
                appendToTerminal(`Running ${file.name}...`);
                
                // Store original console.log
                const originalConsoleLog = console.log;
                
                // Override console.log to capture output
                console.log = (...args) => {
                  originalConsoleLog(...args);
                  const output = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                  ).join(' ');
                  appendToTerminal(output);
                };
                
                // Execute the code
                const result = Function(`
                  "use strict";
                  try {
                    ${content}
                    return { success: true };
                  } catch (error) {
                    return { success: false, error: error.message };
                  }
                `)();
                
                // Restore original console.log
                console.log = originalConsoleLog;
                
                if (!result.success) {
                  appendToTerminal(`Error: ${result.error}`);
                } else {
                  appendToTerminal('Code execution completed successfully.');
                }
              } catch (error) {
                console.error('Error executing code:', error);
                appendToTerminal(`Error: ${error instanceof Error ? error.message : String(error)}`);
              }
            }
          }
        }
      },
    ];
    
    // Set commands only once
    setCommandsList(commands);
  }, []);
  
  // Register key bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input or textarea
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      // Command Palette (Ctrl+Shift+P)
      if (matchesShortcut(e, SHORTCUTS.COMMAND_PALETTE)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Quick Open (Ctrl+P)
      else if (matchesShortcut(e, SHORTCUTS.QUICK_OPEN)) {
        e.preventDefault();
        setIsQuickPickerOpen(true);
      }
      // Save (Ctrl+S)
      else if (matchesShortcut(e, SHORTCUTS.SAVE)) {
        e.preventDefault();
        if (activeFileId) {
          const instance = editorInstances[activeFileId];
          if (instance) {
            const content = instance.model.getValue();
            saveFile(activeFileId, content);
          }
        }
      }
      // Toggle Sidebar (Ctrl+B)
      else if (matchesShortcut(e, SHORTCUTS.TOGGLE_SIDEBAR)) {
        e.preventDefault();
        toggleSidebar();
      }
      // Toggle Panel (Ctrl+J)
      else if (matchesShortcut(e, SHORTCUTS.TOGGLE_PANEL)) {
        e.preventDefault();
        togglePanel();
      }
      // Split Editor (Ctrl+\)
      else if (matchesShortcut(e, SHORTCUTS.SPLIT_EDITOR)) {
        e.preventDefault();
        setEditorLayout(editorLayout === 'single' ? 'split-horizontal' : 'single');
      }
      // Close Tab (Ctrl+W)
      else if (matchesShortcut(e, SHORTCUTS.CLOSE_TAB)) {
        e.preventDefault();
        if (activeFileId) {
          closeFile(activeFileId);
        }
      }
      // Zoom In (Ctrl+=)
      else if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }
      // Zoom Out (Ctrl+-)
      else if (e.ctrlKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      }
      // Find (Ctrl+F)
      else if (matchesShortcut(e, SHORTCUTS.FIND)) {
        console.log('Find shortcut detected');
        // No need to prevent default, as we want the editor's find to work
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, editorInstances, editorLayout, fontSize, saveFile, closeFile, toggleSidebar, togglePanel]);

  // Handle zoom in (increase font size)
  const handleZoomIn = () => {
    console.log('Zoom in - increasing font size');
    const newSize = Math.min(fontSize + 2, 32); // Max font size 32px
    setFontSize(newSize);
    
    // Update all editor instances with the new font size
    Object.values(editorInstances).forEach(instance => {
      instance.editor.updateOptions({ fontSize: newSize });
    });
  };
  
  // Handle zoom out (decrease font size)
  const handleZoomOut = () => {
    console.log('Zoom out - decreasing font size');
    const newSize = Math.max(fontSize - 2, 8); // Min font size 8px
    setFontSize(newSize);
    
    // Update all editor instances with the new font size
    Object.values(editorInstances).forEach(instance => {
      instance.editor.updateOptions({ fontSize: newSize });
    });
  };

  // Handle editor initialization
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    console.log('Editor mounted for active file:', activeFileId);

    // Register the VS Code dark theme
    monaco.editor.defineTheme('vs-code-dark', vsCodeDarkTheme);
    monaco.editor.defineTheme('vs-code-light', vsCodeLightTheme);

    // Set the theme
    monaco.editor.setTheme(theme === 'dark' ? 'vs-code-dark' : 'vs-code-light');

    // Set the font size
    editor.updateOptions({ fontSize: fontSize });

    // Get the currently active file ID from the most up-to-date store
    const currentActiveFileId = useVSCodeStore.getState().activeFileId;
    console.log(`Current active file ID from store at editor mount time: ${currentActiveFileId}`);
    
    // The file ID to use for this editor instance - prioritize the current active file from the store
    const fileIdToUse = currentActiveFileId || activeFileId;
    
    if (!fileIdToUse) {
      console.error('No active file ID available when mounting editor');
      return;
    }

    // Listen for cursor position changes
    const cursorDisposable = editor.onDidChangeCursorPosition(e => {
      setLocalCursorPosition(e.position);

      if (fileIdToUse) {
        // Save cursor position to the store
        saveCursor(fileIdToUse, e.position.lineNumber, e.position.column);
        console.log(`Cursor position saved for file ${fileIdToUse}: ${e.position.lineNumber}:${e.position.column}`);
      }
    });

    // Listen for content changes to mark files as dirty
    const contentDisposable = editor.onDidChangeModelContent(() => {
      if (fileIdToUse) {
        markFileAsDirty(fileIdToUse);
        console.log(`Editor content changed for ${fileIdToUse}, marked as dirty`);
      }
    });

    // Get the model
    const model = editor.getModel();
    if (model) {
      // Update line count
      setLineCount(model.getLineCount());
      console.log(`Model has ${model.getLineCount()} lines`);
    }

    // Store the editor instance with the fileId and disposables for cleanup
    if (model) {
      console.log(`Storing editor instance for file ID: ${fileIdToUse}`);
      // Store the editor instance with the file ID
      setEditorInstances(prev => {
        const updated = {
          ...prev,
          [fileIdToUse]: { 
            editor, 
            model,
            disposables: [cursorDisposable, contentDisposable]
          }
        };
        console.log(`Editor instances now include ${Object.keys(updated).length} files:`, Object.keys(updated));
        return updated;
      });
    } else {
      console.error(`Model is null for file ID ${fileIdToUse}, cannot store editor instance`);
    }
  };



// Function to handle folder selection
const handleFolderSelection = (folderPath: string) => {
  console.log('Selected folder:', folderPath);
  
  if (folderPath && folderPath.trim() !== '') {
    // Save directly to storage utils for immediate persistence
    const success = saveCurrentFolderPath(folderPath);
    console.log('VSCodeEditor: Directly saved selected folder path:', folderPath, success ? '(success)' : '(failed)');
    
    // Log storage state for debugging
    logAllStorageKeys();
    
    // Update current folder path in our component state
    setCurrentFolderPath(folderPath);
    
    // Dispatch an immediate refresh event
    const refreshEvent = new CustomEvent('refresh-explorer', {
      detail: { path: folderPath }
    });
    document.dispatchEvent(refreshEvent);
    console.log('VSCodeEditor: Dispatched immediate refresh-explorer event');
  } else {
    console.log('VSCodeEditor: Ignoring empty folder path selection');
  }
  
  // Close the folder picker dialog
  setIsFolderPickerOpen(false);
  
  // Create a new root node with this folder path
  const newRootNode: FileNode = {
    id: 'root',
    name: folderPath.split('/').pop() || 'root',
    type: 'directory',
    children: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Reset the store with this new root node
  // Note: In a real application, we would scan the folder and create the full tree
  // Here we're just setting up the root node
  const storeState = useVSCodeStore.getState();
  // @ts-ignore - We know what we're doing
  useVSCodeStore.setState({
    ...storeState,
    rootNode: newRootNode,
    expandedFolders: ['root']
  });
  
  // Dispatch an event to refresh the explorer with the selected folder
  const refreshEvent = new CustomEvent('refresh-explorer', {
    detail: { path: folderPath }
  });
  document.dispatchEvent(refreshEvent);
  console.log('Dispatched refresh-explorer event with path:', folderPath);

  // Refresh explorer will be handled in the explorer component
};

// ... (rest of the code remains the same)

  // Render editor layout
  const renderEditorLayout = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Editor tabs */}
        <VSCodeEditorTabs
          openFiles={openFiles.map(id => findNodeById(rootNode, id)).filter(Boolean) as FileNode[]}
          activeFileId={activeFileId || ''}
          onSelectFile={openFileById}
          onCloseFile={closeFileById}
          unsavedFiles={unsavedFiles}
          onSaveFile={(fileId) => {
            const instance = editorInstances[fileId];
            if (instance) {
              const content = instance.model.getValue();
              console.log(`VSCodeEditor: Getting content from editor instance for file ${fileId}, content length: ${content.length}`);
              enhancedSaveFile(fileId, content);
            } else {
              console.warn(`VSCodeEditor: No editor instance found for file ${fileId}, trying to get content from node`);
              const fileNode = findNodeById(rootNode, fileId);
              if (fileNode) {
                enhancedSaveFile(fileId, fileNode.content || '');
              }
            }
          }}
        />
        
        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {editorLayout === 'single' ? (
            /* Single editor */
            <div className="h-full">
              {activeFileId ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* Create a stack of editors, with only the active one visible */}
                  {openFiles.map(fileId => {
                    // Find file node from the latest store state to ensure we have the most up-to-date data
                    const latestState = useVSCodeStore.getState();
                    const fileNode = findNodeById(latestState.rootNode, fileId);
                    const isActive = fileId === activeFileId;
                    
                    if (!fileNode) {
                      console.warn(`No file node found for ID: ${fileId}`);
                      return null;
                    }
                    
                    console.log(`Rendering editor for file: ${fileNode.name}, ID: ${fileId}, isActive: ${isActive}`);
                    
                    return (
                      <div 
                        key={`editor-container-${fileId}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: isActive ? 'block' : 'none' // Only show the active editor
                        }}
                      >
                        <MonacoEditor
                          key={`editor-${fileId}`} // Unique key for each file ensures proper re-mounting
                          height="100%"
                          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                          language={getLanguageFromFilename(fileNode.name) || 'javascript'}
                          value={fileNode.content || ''}
                          options={{
                            fontSize,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            folding: true,
                            automaticLayout: true,
                            tabSize: 2,
                          }}
                          onMount={handleEditorDidMount}
                          onChange={(value) => {
                            if (value !== undefined) {
                              // Log the content being edited
                              console.log(`Editor onChange for ${fileId}, content length: ${(value || '').length}`);
                              markFileAsDirty(fileId);
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[#cccccc] bg-[#1e1e1e]">
                  <div className="text-center text-xs">
                    <h2 className="text-xs font-light mb-4">VS Code Editor</h2>
                    <p className="mb-2 text-xs">Open a file from the explorer or create a new file to get started.</p>
                    <p className="text-xs">
                      <kbd className="px-2 py-1 bg-[#3c3c3c] rounded text-xs">Ctrl+P</kbd> to open files, 
                      <kbd className="px-2 py-1 bg-[#3c3c3c] rounded text-xs ml-1">Ctrl+Shift+P</kbd> to open command palette
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Split editor */
            <div className="flex h-full divide-x divide-[#3c3c3c]">
              <div className="w-1/2 h-full">
                {activeFileId && (
                  <MonacoEditor
                    height="100%"
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    language={getActiveFile()?.name.split('.').pop() || 'javascript'}
                    value={getActiveFile()?.content || ''}
                    options={{
                      fontSize,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      folding: true,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                    onMount={handleEditorDidMount}
                    onChange={(value) => {
                      if (value !== undefined && activeFileId) {
                        markFileAsDirty(activeFileId);
                      }
                    }}
                  />
                )}
              </div>
              <div className="w-1/2 h-full">
                {secondaryFileId ? (
                  <MonacoEditor
                    height="100%"
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    language={findNodeById(rootNode, secondaryFileId)?.name.split('.').pop() || 'javascript'}
                    value={findNodeById(rootNode, secondaryFileId)?.content || ''}
                    options={{
                      fontSize,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      folding: true,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                    onMount={handleEditorDidMount}
                    onChange={(value) => {
                      if (value !== undefined && secondaryFileId) {
                        markFileAsDirty(secondaryFileId);
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-[#cccccc] bg-[#1e1e1e]">
                    <div className="text-center text-xs">
                      <h3 className="text-xs font-light mb-2">Editor Panel</h3>
                      <p className="text-xs">Open a file to display it here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Status bar */}
        <VSCodeStatusBar
          lineCount={lineCount}
          currentLine={cursorPosition.lineNumber}
          currentColumn={cursorPosition.column}
          language={getActiveFile()?.name.split('.').pop() || 'plaintext'}
          isDarkMode={theme === 'dark'}
          onToggleTheme={toggleTheme}
          isConnected={true}
        />
      </div>
    );
  };
  
  // Get the active file node
  const getActiveFile = (): FileNode | null => {
    if (!activeFileId) return null;
    const file = findNodeById(rootNode, activeFileId);
    return file && file.type === 'file' ? file : null;
  };

  // Render menu bar
  const renderMenuBar = () => {
    const activeFile = getActiveFile();
    console.log('Rendering menu bar with current folder path:', currentFolderPath);
    
    return (
      <VSCodeMenuBar
        createNewFile={createNewFile}
        createNewFolder={createNewFolder}
        saveFile={enhancedSaveFile}
        saveAllFiles={() => {
          // Implementation for saving all files
          console.log('VSCodeEditor: Saving all unsaved files, count:', unsavedFiles.size);
          
          if (unsavedFiles.size === 0) {
            console.log('VSCodeEditor: No unsaved files to save');
            return;
          }
          
          try {
            Array.from(unsavedFiles).forEach(fileId => {
              const file = findNodeById(rootNode, fileId);
              
              if (!file) {
                console.warn(`VSCodeEditor: Cannot find file with ID ${fileId} to save`);
                return;
              }
              
              if (file.type !== 'file') {
                console.warn(`VSCodeEditor: Item with ID ${fileId} is not a file, it's a ${file.type}`);
                return;
              }
              
              if (file.content === undefined) {
                console.warn(`VSCodeEditor: File ${file.name} (${fileId}) has undefined content`);
                return;
              }
              
              console.log(`VSCodeEditor: Saving file ${file.name} (${fileId}), content length: ${file.content.length}`);
              enhancedSaveFile(fileId, file.content);
            });
            console.log('VSCodeEditor: All files save requests sent successfully');
          } catch (error) {
            console.error('VSCodeEditor: Error while saving all files:', error);
          }
        }}
        openFile={openFileById}
        rootNodeId={rootNode.id}
        onOpenFile={() => setIsFilePickerOpen(true)}
        onOpenFolder={() => setIsFolderPickerOpen(true)}
        activeFileId={activeFileId}
        editorContent={activeFile?.content || ''}
        refreshExplorer={() => {
          console.log('VSCodeEditor: refreshExplorer called, refreshing explorer view');
          
          // If we have a real folder path open, refresh by refetching from the filesystem
          if (currentFolderPath && currentFolderPath.trim()) {
            console.log('VSCodeEditor: Current folder path exists, refetching from filesystem:', currentFolderPath);
            
            // Use dispatchEvent to trigger a refresh in the ExplorerView component
            window.dispatchEvent(new CustomEvent('refresh-explorer', {
              detail: { path: currentFolderPath }
            }));
            
            console.log('VSCodeEditor: Dispatched refresh-explorer event with path:', currentFolderPath);
          } else {
            // Refresh in-memory explorer by reselecting the root node
            console.log('VSCodeEditor: No real folder path, refreshing in-memory explorer');
            selectNode(rootNode.id);
          }
        }}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        currentPath={currentFolderPath}
      />
    );
  };
  
  return (
    <div style={{ height: 'calc(100vh - 80px)' }} className="h-screen min-h-[600px] border border-gray-300 rounded-md overflow-hidden">
      <VSCodeLayout
        showSidebar={isSidebarVisible}
        showPanel={isPanelVisible}
        className="vs-code-editor-container h-full"
        menuBar={renderMenuBar()}
      >
        {renderEditorLayout()}
      </VSCodeLayout>
      
      {/* Command palette */}
      <VSCodeCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commandsList}
        onCommandExecute={(command) => {
          console.log(`Executing command: ${command.id}`);
          command.execute();
          setIsCommandPaletteOpen(false);
        }}
      />
      
      {/* Quick file picker */}
      <VSCodeQuickPicker
        isOpen={isQuickPickerOpen}
        onClose={() => setIsQuickPickerOpen(false)}
        files={openFileNodes}
        rootNode={rootNode}
        onSelectFile={(fileId) => {
          console.log(`Quick picker selected file: ${fileId}`);
          openFileById(fileId);
          setIsQuickPickerOpen(false);
        }}
        recentFiles={getRecentFilesWithLimit(5)}
      />
      
      {/* File browser dialog */}
      <VSCodeFileBrowser
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        onFileSelected={(fileObject) => {
          console.log(`File selected: ${fileObject.name}`);
          setIsFilePickerOpen(false);
          
          // Create a file reader to read the file content
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target) {
              const content = event.target.result as string;
              const fileName = fileObject.name;
              
              console.log(`File loaded: ${fileName} with size ${content.length} bytes`);
              
              // We'll use the store's createFile function directly to ensure the file is
              // properly added to the store and gets a proper ID
              try {
                // Create the file in the store
                const storeState = useVSCodeStore.getState();
                
                // Get the language from the filename
                const language = getLanguageFromFilename(fileName);
                console.log(`Detected language for ${fileName}: ${language}`);
                
                // Use the store's createNewFile function to ensure proper file creation and ID generation
                console.log(`Creating new file with name: ${fileName}, language: ${language}`);
                storeState.createNewFile(rootNode.id, fileName, content, language);
                
                // Get the latest state after the file was created
                const latestState = useVSCodeStore.getState();
                const latestRootNode = latestState.rootNode;
                
                // Find the newly created file by looking at the children of rootNode
                const newFile = latestRootNode.children?.find((child: FileNode) => 
                  child.name === fileName && child.type === 'file' && child.parentId === rootNode.id);
                
                if (newFile) {
                  console.log(`Successfully created file: ${fileName} with ID: ${newFile.id}`);
                  
                  // Wait a moment for the store to fully update before opening the file
                  setTimeout(() => {
                    console.log(`Opening imported file: ${fileName} with ID: ${newFile.id}`);
                    storeState.openFile(newFile.id);
                  }, 50);
                } else {
                  console.error(`Failed to find newly created file: ${fileName} in rootNode children`);
                }
              } catch (error) {
                console.error(`Error creating file ${fileName}:`, error);
              }
            }
          };
          
          // Read the file as text
          reader.readAsText(fileObject);
        }}
        title="Open File"
        acceptTypes="*.*"
      />
      
      {/* Folder selector dialog - using the same component as Explorer */}
      <FolderSelector
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        onFolderSelected={handleFolderSelection}
      />
    </div>
  );
}
