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

interface EditorInstance {
  editor: monaco.editor.IStandaloneCodeEditor;
  model: monaco.editor.ITextModel;
}

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
      openFile(fileId);
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
        
        // Update the root node in the store
        const storeState = useVSCodeStore.getState();
        // @ts-ignore - We know what we're doing
        useVSCodeStore.setState({
          ...storeState,
          rootNode: updatedRootNode
        });
      } else {
        // If the node already exists but doesn't have realPath, add it now
        const existingFileNode = existingNode as ExtendedFileNode;
        if (fileDiskPath && !existingFileNode.realPath) {
          console.log(`Adding missing realPath ${fileDiskPath} to existing file node ${fileId}`);
          
          // Create a deep copy of the root node to update
          const updatedRootNode = { ...rootNode };
          const updateNodeWithRealPath = (node: ExtendedFileNode): ExtendedFileNode => {
            if (node.id === fileId) {
              return { ...node, realPath: fileDiskPath };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map(child => updateNodeWithRealPath(child as ExtendedFileNode))
              };
            }
            return node;
          };
          
          // Update the node in the tree
          const updatedRootNodeWithPath = updateNodeWithRealPath(updatedRootNode);
          
          // Update the store
          const storeState = useVSCodeStore.getState();
          useVSCodeStore.setState({
            ...storeState,
            rootNode: updatedRootNodeWithPath
          });
        }
      }
      
      // Open the file in the editor
      openFileById(fileId);
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

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition(e => {
      setLocalCursorPosition(e.position);

      if (activeFileId) {
        // Save cursor position to the store
        saveCursor(activeFileId, e.position.lineNumber, e.position.column);
      }
    });

    // Listen for content changes to mark files as dirty
    editor.onDidChangeModelContent(() => {
      if (activeFileId) {
        markFileAsDirty(activeFileId);
        console.log(`Editor content changed for ${activeFileId}, marked as dirty`);
      }
    });

    // Get the model
    const model = editor.getModel();
    if (model) {
      // Update line count
      setLineCount(model.getLineCount());
      console.log(`Model has ${model.getLineCount()} lines`);
    }

    // Always ensure we have the active file ID when mounting the editor
    if (activeFileId) {
      console.log(`Storing editor instance for file ID: ${activeFileId}`);
      if (model) {
        // Store the editor instance with the active file ID
        setEditorInstances(prev => {
          const updated = {
            ...prev,
            [activeFileId]: { editor, model }
          };
          console.log(`Editor instances now include ${Object.keys(updated).length} files:`, Object.keys(updated));
          return updated;
        });
      } else {
        console.error(`Model is null for active file ID ${activeFileId}, cannot store editor instance`);
      }
    } else {
      console.warn('No active file ID when mounting editor, cannot store editor instance');
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
              enhancedSaveFile(fileId, content);
            }
          }}
        />
        
        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {editorLayout === 'single' ? (
            /* Single editor */
            <div className="h-full">
              {activeFileId ? (
                <MonacoEditor
                  key={`editor-${activeFileId}`} // Add key to ensure re-mount when file changes
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
                      // Log the content being edited
                      console.log(`Editor onChange for ${activeFileId}, content length: ${(value || '').length}`);
                      markFileAsDirty(activeFileId);
                    }
                  }}
                />
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
              
              // Create a new file ID
              const newFileId = `file-${Date.now()}`;
              
              // Create a new file node with the file content
              const newFile: FileNode = {
                id: newFileId,
                name: fileObject.name,
                type: 'file',
                content: content,
                parentId: rootNode.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              
              console.log(`Creating new file node: ${newFile.name} with size ${content.length} bytes`);
              
              // Instead of directly setting the root node, we'll add the file to the store
              // This approach uses the existing createNewFile function
              console.log('Adding file to the store:', newFile.name);
              createNewFile(rootNode.id, newFile.name, content, '');
              
              // Open the new file
              openFileById(newFileId);
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
