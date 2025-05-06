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
import { VSCodeQuickPicker } from './vs-code-quick-picker';
import { VSCodeMenuBar } from './vs-code-menu-bar';
import { VSCodeFileBrowser } from './vs-code-file-browser';
import useVSCodeStore from '../store/vs-code-store';
import { v4 as uuidv4 } from 'uuid';
import { findNodeById, FileNode, getLanguageFromFilename } from '@/lib/services/vs-code-file-system';
import { Terminal, Brackets, Bug, Play, FileSearch, GitBranch, Database, Settings as SettingsIcon, Split, LayoutPanelLeft } from 'lucide-react';

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
  
  // Add local compatibility functions for renamed functions
  const openFileById = openFile;
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
        if (activeFileId && primaryEditorRef.current) {
          const content = primaryEditorRef.current.getValue();
          saveFile(activeFileId, content);
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
      // Split Editor (Ctrl+\\)
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
    };

    // Add keyboard listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clear on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFileId, editorLayout]); // Reduced dependencies to minimize re-renders
  
  // Listen for file open events from file explorer double-click
  useEffect(() => {
    console.log('Setting up file open event listener');
    
    const handleOpenFileEvent = (event: CustomEvent) => {
      console.log('Received open-file-in-editor event with data:', event.detail);
      
      const { fileId, path, name, content, language } = event.detail;
      
      try {
        // For files already in the store, just open them directly
        if (fileId && !path) {
          console.log('Opening existing file with ID:', fileId);
          openFile(fileId);
          return;
        }
        
        // For files from filesystem (not in store), create a new file in the store first
        if (!name) {
          console.error('Missing required file name in open-file-in-editor event');
          return;
        }
        
        console.log('Creating new file in store from filesystem:', name);
        
        // Use the last part of the path as the filename if no name is provided
        const fileName = name || path.split('/').pop() || 'untitled';
        
        // Store original file ID from external system if provided
        const externalFileId = fileId;
        
        // Create the file in our virtual file system at root level
        // The createNewFile function doesn't return anything, so we need to handle it this way
        createNewFile(
          rootNode.id, 
          fileName,
          content || '', 
          language || getLanguageFromFilename(fileName)
        );
        
        console.log('File created, waiting for next render cycle to open it');
        
        // Since we don't have the direct ID, we need to find the file by name in the root node
        // We'll do this after a slight delay to ensure state is updated
        setTimeout(() => {
          // Find the file we just created by name
          const createdFile = rootNode.children?.find(node => 
            node.type === 'file' && node.name === fileName
          );
          
          if (createdFile) {
            console.log('Found created file, opening:', createdFile.id);
            openFile(createdFile.id);
            
            // Focus the editor
            if (primaryEditorRef.current) {
              primaryEditorRef.current.focus();
            }
          } else {
            console.error('Unable to find newly created file by name:', fileName);
          }
        }, 100);
      } catch (error) {
        console.error('Error handling open file event:', error);
      }
    };
    
    // Add event listener for custom event
    window.addEventListener('open-file-in-editor', handleOpenFileEvent as EventListener);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('open-file-in-editor', handleOpenFileEvent as EventListener);
    };
  }, [rootNode, openFile, createNewFile]);
  
  // Create a file editor instance
  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor, 
    monacoInstance: typeof monaco,
    fileId: string
  ) => {
    console.log(`Editor mounted for file: ${fileId}`);
    
    // Save Monaco reference
    monacoRef.current = monacoInstance;
    
    // Define themes if they don't exist
    try {
      // Define our custom themes - no need to check current theme as it's safe to redefine
      console.log('Defining VS Code themes for Monaco Editor');
      monacoInstance.editor.defineTheme('vscode-dark', vsCodeDarkTheme);
      monacoInstance.editor.defineTheme('vscode-light', vsCodeLightTheme);
      
      // Set the theme based on current state
      console.log(`Setting Monaco Editor theme to: ${theme === 'dark' ? 'vscode-dark' : 'vscode-light'}`);
      monacoInstance.editor.setTheme(theme === 'dark' ? 'vscode-dark' : 'vscode-light');
    } catch (error) {
      console.error('Error setting Monaco editor theme:', error);
    }
    
    // Save the editor reference
    if (fileId === activeFileId) {
      primaryEditorRef.current = editor;
      console.log('Saved as primary editor instance');
    } else if (fileId === secondaryFileId) {
      secondaryEditorRef.current = editor;
      console.log('Saved as secondary editor instance');
    }
    
    // Create editor model
    const file = findNodeById(rootNode, fileId);
    if (!file || file.type !== 'file') {
      console.error(`Cannot find file with ID: ${fileId}`);
      return;
    }
    
    const content = file.content || '';
    const language = file.language || 'javascript';
    
    console.log(`Creating model for file: ${file.name}, language: ${language}, content length: ${content.length}`);
    
    // Create model
    const uri = monacoInstance.Uri.parse(`file:///${file.name}`);
    let model = monacoInstance.editor.getModel(uri);
    
    if (!model) {
      console.log(`Creating new model for ${file.name}`);
      model = monacoInstance.editor.createModel(content, language, uri);
    } else {
      console.log(`Updating existing model for ${file.name}`);
      model.setValue(content);
    }
    
    // Set the model to the editor
    editor.setModel(model);
    
    // Manually set value as a fallback to ensure content is displayed
    if (content.length > 0 && editor.getValue().length === 0) {
      console.log('Setting editor value manually');
      editor.setValue(content);
    }
    
    // Set line count
    setLineCount(model.getLineCount());
    
    // Restore cursor position if available
    const savedPosition = getCursor(fileId);
    if (savedPosition) {
      editor.setPosition(savedPosition);
      editor.revealPositionInCenter(savedPosition);
    }
    
    // Add to editor instances
    setEditorInstances(prev => ({
      ...prev,
      [fileId]: { editor, model }
    }));
    
    // Track changes
    model.onDidChangeContent(() => {
      markFileAsUnsaved(fileId);
      setLineCount(model.getLineCount());
    });
    
    // Track cursor position
    editor.onDidChangeCursorPosition(e => {
      const position = e.position;
      setLocalCursorPosition(position);
      setCursorPosition(fileId, position.lineNumber, position.column);
    });
    
    // Auto save timer (disabled for now - we'll use keyboard shortcut)
    // const autoSaveInterval = setInterval(() => {
    //   if (unsavedFiles.has(fileId)) {
    //     const currentContent = model.getValue();
    //     saveFile(fileId, currentContent);
    //   }
    // }, 30000); // Auto save every 30 seconds
    
    // // Clean up
    // return () => clearInterval(autoSaveInterval);
  };
  
  // Handle file opening from menu
  const handleOpenFile = () => {
    console.log('Opening file picker');
    setIsFilePickerOpen(true);
  };
  
  // Handle folder opening from menu
  const handleOpenFolder = () => {
    console.log('Opening folder picker');
    setIsFolderPickerOpen(true);
  };
  
  // Process selected file
  const handleFileSelected = useCallback((file: File) => {
    console.log(`Processing selected file: ${file.name}`);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          const content = e.target.result;
          const fileExtension = file.name.split('.').pop() || '';
          let language = 'plaintext';
          
          // Map common extensions to languages
          const extensionToLanguage: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown',
            'py': 'python',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'cs': 'csharp',
            'go': 'go',
            'php': 'php',
            'rb': 'ruby',
            'swift': 'swift'
          };
          
          if (fileExtension in extensionToLanguage) {
            language = extensionToLanguage[fileExtension];
          }
          
          // Create a new file in the virtual filesystem
          console.log(`Creating new file: ${file.name}, language: ${language}`);
          createNewFile(rootNode.id, file.name, content, language);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing selected file:', error);
    }
  }, [rootNode.id, createNewFile]);
  
  // Process selected folder
  const handleFolderSelected = (folder: File) => {
    console.log(`Processing selected folder: ${folder.name}`);
    // This is a placeholder for folder processing
    // In a real application, we would need to use a more advanced API to handle folder access
    // For now, we'll just create a dummy folder structure
    
    // Create a new folder in the root
    const folderName = folder.name || 'New Folder';
    createNewFolder(rootNode.id, folderName);
    console.log(`Created new folder: ${folderName}`);
    
    // Refresh the file explorer
    selectNode(rootNode.id);
  };
  
  // Get the active file node
  const getActiveFile = (): FileNode | null => {
    if (!activeFileId) return null;
    const file = findNodeById(rootNode, activeFileId);
    return file && file.type === 'file' ? file : null;
  };
  
  // Get the secondary file node
  const getSecondaryFile = (): FileNode | null => {
    if (!secondaryFileId) return null;
    const file = findNodeById(rootNode, secondaryFileId);
    return file && file.type === 'file' ? file : null;
  };
  
  // Handle file selection in quick picker
  const handleQuickPickerSelect = useCallback((fileId: string) => {
    console.log('Quick picker file selected:', fileId);
    setIsQuickPickerOpen(false);
    if (fileId) {
      openFileById(fileId);
    }
  }, []);
  
  // Render the activity bar icons with tooltips
  const renderActivityBarIcons = () => [
    { icon: <FileSearch className="h-5 w-5" />, name: 'Explorer', showNotification: false, activeIcon: 'explorer' },
    { icon: <Brackets className="h-5 w-5" />, name: 'Search', showNotification: false, activeIcon: 'search' },
    { icon: <GitBranch className="h-5 w-5" />, name: 'Source Control', showNotification: false, activeIcon: 'git' },
    { icon: <Bug className="h-5 w-5" />, name: 'Run and Debug', showNotification: false, activeIcon: 'debug' },
    { icon: <Database className="h-5 w-5" />, name: 'Extensions', showNotification: false, activeIcon: 'extensions' },
    { icon: <SettingsIcon className="h-5 w-5" />, name: 'Settings', showNotification: false, activeIcon: 'settings' },
  ];
  
  // Render the panel tabs
  const renderPanelTabs = () => [
    { icon: <Terminal className="h-4 w-4" />, name: 'Terminal', id: 'terminal' },
    { icon: <Bug className="h-4 w-4" />, name: 'Problems', id: 'problems' },
    { icon: <Play className="h-4 w-4" />, name: 'Output', id: 'output' },
  ];
  
  // Render the content based on the active panel
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'terminal':
        return (
          <div className="font-mono text-xs bg-[#1e1e1e] text-white p-2 overflow-auto h-full">
            {terminalOutput.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap mb-1">
                {line}
              </div>
            ))}
          </div>
        );
      case 'problems':
        return (
          <div className="text-sm p-2 text-[#cccccc]">
            No problems detected.
          </div>
        );
      case 'output':
        return (
          <div className="text-sm p-2 text-[#cccccc]">
            No output available.
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render the editor
  const renderEditor = (fileId: string | null, isSecondary = false) => {
    if (!fileId) return null;
    
    const file = findNodeById(rootNode, fileId);
    if (!file || file.type !== 'file') return null;
    
    const content = file.content || '';
    const language = file.language || 'javascript';
    
    console.log(`Rendering editor for file ${fileId} with language ${language}`);
    console.log(`Content length: ${content.length} characters`);
    
    return (
      <div className="h-full flex flex-col">
        <MonacoEditor
          height="100%"
          theme={theme === 'dark' ? 'vscode-dark' : 'vscode-light'}
          language={language}
          value={content}
          defaultValue={content} // Add defaultValue as a fallback
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            automaticLayout: true,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            wordWrap: 'on', // Enable word wrap for better readability
            rulers: [80, 120],
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
          onMount={(editor, monaco) => handleEditorMount(editor, monaco, fileId)}
          onChange={(value) => {
            console.log(`Content changed for file ${fileId}`);
            if (value !== undefined) {
              const instance = editorInstances[fileId];
              if (instance && instance.model) {
                // Update file content in the store - this is critical for typing to work
                markFileAsUnsaved(fileId);
                // We don't need to manually set the model value as Monaco handles that
              }
            }
          }}
        />
      </div>
    );
  };
  
  // Handle command execution
  const handleCommandExecute = (command: VSCodeCommand) => {
    console.log('Executing command:', command.id);
    command.execute();
  };
  
  // Render the editor layout
  const renderEditorLayout = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Editor tabs */}
        <VSCodeEditorTabs
          openFiles={openFileNodes}
          activeFileId={activeFileId || ''}
          onSelectFile={openFileById}
          onCloseFile={closeFileById}
          unsavedFiles={unsavedFiles}
          onSaveFile={(fileId) => {
            const instance = editorInstances[fileId];
            if (instance) {
              const content = instance.model.getValue();
              saveFile(fileId, content);
            }
          }}
        />
        
        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          {editorLayout === 'single' ? (
            /* Single editor */
            <div className="h-full">
              {activeFileId ? (
                renderEditor(activeFileId)
              ) : (
                <div className="h-full flex items-center justify-center text-[#cccccc] bg-[#1e1e1e]">
                  <div className="text-center">
                    <h2 className="text-2xl font-light mb-4">VS Code Editor</h2>
                    <p className="mb-2">Open a file from the explorer or create a new file to get started.</p>
                    <p>
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
                {renderEditor(activeFileId)}
              </div>
              <div className="w-1/2 h-full">
                {secondaryFileId ? (
                  renderEditor(secondaryFileId, true)
                ) : (
                  <div className="h-full flex items-center justify-center text-[#cccccc] bg-[#1e1e1e]">
                    <div className="text-center">
                      <h3 className="text-lg font-light mb-2">Editor Panel</h3>
                      <p>Open a file to display it here</p>
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
          language={getActiveFile()?.language || 'plaintext'}
          isDarkMode={theme === 'dark'}
          onToggleTheme={toggleTheme}
          isConnected={true}
        />
      </div>
    );
  };
  
  // Render menu bar
  const renderMenuBar = () => {
    const activeFile = getActiveFile();
    
    return (
      <VSCodeMenuBar
        createNewFile={createNewFile}
        createNewFolder={createNewFolder}
        saveFile={saveFile}
        saveAllFiles={() => {
          // Implementation for saving all files
          unsavedFiles.forEach(fileId => {
            const file = findNodeById(rootNode, fileId);
            if (file && file.type === 'file' && file.content) {
              saveFile(fileId, file.content);
            }
          });
        }}
        openFile={openFileById}
        rootNodeId={rootNode.id}
        onOpenFile={handleOpenFile}
        onOpenFolder={handleOpenFolder}
        activeFileId={activeFileId}
        editorContent={activeFile?.content || ''}
        refreshExplorer={() => {
          // Refresh explorer by reselecting the root node
          selectNode(rootNode.id);
        }}
      />
    );
  };
  
  return (
    <div className="h-screen min-h-[600px] border border-gray-300 rounded-md overflow-hidden">
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
        onCommandExecute={handleCommandExecute}
      />
      
      {/* Quick file picker */}
      <VSCodeQuickPicker
        isOpen={isQuickPickerOpen}
        onClose={() => setIsQuickPickerOpen(false)}
        files={openFileNodes}
        rootNode={rootNode}
        onSelectFile={handleQuickPickerSelect}
        recentFiles={getRecentFilesWithLimit(5)}
      />
      
      {/* File browser dialog */}
      <VSCodeFileBrowser
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        onFileSelected={handleFileSelected}
        title="Open File"
        acceptTypes="*.*"
      />
      
      {/* Folder browser dialog */}
      <VSCodeFileBrowser
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        onFileSelected={handleFolderSelected}
        title="Open Folder"
        isFolder={true}
      />
    </div>
  );
}
