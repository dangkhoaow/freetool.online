"use client"

/**
 * VS Code Editor main component
 * Serves as the entry point for the modular VS Code Editor
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { VSCodeLayout } from './layout';
import { VSCodeFileExplorer } from './file-explorer';
import { VSCodeEditorTabs } from './editor-tabs';
import { VSCodeStatusBar } from './status-bar';
import { VSCodeCommandPalette, VSCodeCommand, getStandardCommands } from './command-palette';
import { FolderSelector } from '../folder-selector';
import { VSCodeQuickPicker } from './quick-picker';
import { MenuBarAdapter } from './menu-bar-adapter';
import { VSCodeFileBrowser } from './file-browser';
import useVSCodeStore from '../../store/vs-code-store';
import { saveCurrentFolderPath, getCurrentFolderPath, logAllStorageKeys } from '../../utils/storage-utils';
import { findNodeById, getLanguageFromFilename } from '@/lib/services/vs-code-file-system';
import { FileNode, ExtendedFileNode } from './types';

// Import modules
import { EditorStatusBar, InvalidFolderState, EmptyEditorState } from './ui-components';
import { MainEditor, SecondaryEditor } from './main-editor';
import { SHORTCUTS, matchesShortcut } from './shortcuts';
import { EditorInstance } from './types';
import { cleanupMissingFiles, validateFolderPath, cleanupEditorInstances } from './folder-handler';
import { enhancedSaveFile, openFileById, closeFileById, createFileFromUpload } from './file-operations';
import * as BrowserFileSystem from '@/lib/services/browser-file-system-service';
import { 
  getRecentFilesWithLimit, 
  getEditorLanguage, 
  handleZoomIn,
  handleZoomOut,
  toggleWordWrap
} from './utils';

/**
 * Main VS Code Editor component
 * This is the entry point that integrates all modules
 */
export default function VSCodeEditor() {
  console.log('VSCodeEditor: Initializing VS Code Editor component');
  
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
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [commandsList, setCommandsList] = useState<VSCodeCommand[]>([]);
  const [cursorPosition, setLocalCursorPosition] = useState<monaco.Position>({ lineNumber: 1, column: 1 } as monaco.Position);
  const [lineCount, setLineCount] = useState(1);
  const [fontSize, setFontSize] = useState(12); // Default font size for editor (reduced from 14)
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [theme, setTheme] = useState<'vs-dark' | 'vs'>('vs-dark');
  
  // Track current folder path with persistence in localStorage
  const [currentFolderPath, setCurrentFolderPath] = useState(() => {
    // Log storage state for debugging
    console.log('VSCodeEditor: Initializing currentFolderPath');
    logAllStorageKeys();
    
    // Get path from storage utils with validation enabled
    return getCurrentFolderPath();
  });
  
  // UI visibility state
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  // Ref to track initialized status
  const initialized = useRef(false);
  
  // Toggle theme between dark and light
  const toggleTheme = useCallback(() => {
    console.log(`VSCodeEditor: Toggling theme from ${theme}`);
    setTheme(prevTheme => prevTheme === 'vs-dark' ? 'vs' : 'vs-dark');
  }, [theme]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(`VSCodeEditor: Key pressed: ${e.key}, ctrl: ${e.ctrlKey}, shift: ${e.shiftKey}`);
      
      // Command palette
      if (matchesShortcut(e, SHORTCUTS.COMMAND_PALETTE)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        console.log('VSCodeEditor: Command palette opened via shortcut');
      }
      
      // Quick file picker
      else if (matchesShortcut(e, SHORTCUTS.QUICK_OPEN)) {
        e.preventDefault();
        setIsQuickPickerOpen(true);
        console.log('VSCodeEditor: Quick picker opened via shortcut');
      }
      
      // Save file
      else if (matchesShortcut(e, SHORTCUTS.SAVE) && activeFileId) {
        e.preventDefault();
        enhancedSaveFile(activeFileId, undefined, editorInstances);
        console.log(`VSCodeEditor: Save shortcut triggered for file: ${activeFileId}`);
      }
      
      // Toggle sidebar
      else if (matchesShortcut(e, SHORTCUTS.TOGGLE_SIDEBAR)) {
        e.preventDefault();
        setIsSidebarVisible(prev => !prev);
        console.log(`VSCodeEditor: Sidebar visibility toggled to: ${!isSidebarVisible}`);
      }
      
      // Toggle panel
      else if (matchesShortcut(e, SHORTCUTS.TOGGLE_PANEL)) {
        e.preventDefault();
        setIsPanelVisible(prev => !prev);
        console.log(`VSCodeEditor: Panel visibility toggled to: ${!isPanelVisible}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFileId, editorInstances, isSidebarVisible, isPanelVisible]);

  // Listen for menu-triggered word wrap toggle events
  useEffect(() => {
    const onToggle = () => {
      console.log(`VSCodeEditor: Received toggle-word-wrap event, current wordWrap: ${wordWrap}`);
      toggleWordWrap(wordWrap, setWordWrap);
    };
    document.addEventListener('toggle-word-wrap', onToggle);
    return () => document.removeEventListener('toggle-word-wrap', onToggle);
  }, [wordWrap]);

  // Initialize commands
  useEffect(() => {
    console.log('VSCodeEditor: Initializing commands');
    
    const standardCommands = getStandardCommands({
      createNewFile: () => {
        const parentId = selectedNodeId || rootNode.id;
        createNewFile(parentId, 'Untitled.txt');
        console.log(`VSCodeEditor: Created new file under parent ${parentId}`);
      },
      saveFile: () => {
        if (activeFileId) {
          enhancedSaveFile(activeFileId, undefined, editorInstances);
          console.log(`VSCodeEditor: Saved file ${activeFileId}`);
        }
      },
      toggleSidebar: () => {
        setIsSidebarVisible(prev => !prev);
        console.log(`VSCodeEditor: Sidebar visibility toggled to ${!isSidebarVisible}`);
      },
      togglePanel: () => {
        setIsPanelVisible(prev => !prev);
        console.log(`VSCodeEditor: Panel visibility toggled to ${!isPanelVisible}`);
      },
      toggleTheme,
      selectFile: () => setIsQuickPickerOpen(true),
      openFolder: () => setIsFolderPickerOpen(true),
    });
    
    setCommandsList(standardCommands);
  }, [
    rootNode.id, 
    selectedNodeId, 
    activeFileId, 
    editorInstances, 
    isSidebarVisible, 
    isPanelVisible,
    toggleTheme,
    createNewFile
  ]);
  
  // Add event listener to handle refresh-explorer events for loading folder contents
  useEffect(() => {
    const handleRefreshExplorer = async (event: CustomEvent) => {
      console.log('VSCodeEditor: Received refresh-explorer event with detail:', event.detail);
      
      // Check if a custom rootNode is provided in the event detail (from File System Access API)
      if (event.detail && event.detail.rootNode) {
        console.log('VSCodeEditor: Custom rootNode provided in event, using it directly');
        const rootNode = event.detail.rootNode;
        const forceRefresh = event.detail.forceRefresh === true;
        
        // Use the provided rootNode directly to update the store
        console.log('VSCodeEditor: Updating store with provided rootNode:', rootNode);
        useVSCodeStore.setState(prev => ({
          ...prev,
          rootNode: rootNode
        }));
        
        console.log(`VSCodeEditor: Explorer view refreshed with custom rootNode${forceRefresh ? ' (forced)' : ''}`);
        return; // Exit early since we've handled the custom rootNode case
      }
      
      // If no custom rootNode provided, proceed with traditional path-based refresh
      if (event.detail && event.detail.path) {
        const folderPath = event.detail.path;
        const forceRefresh = event.detail.forceRefresh === true;
        console.log(`VSCodeEditor: Refreshing folder with path: ${folderPath}, forceRefresh: ${forceRefresh}`);

        const directoryHandle = BrowserFileSystem.getCurrentDirectoryHandle();
        if (directoryHandle) {
          try {
            const scannedRootNode = await BrowserFileSystem.scanDirectoryToFileNode(directoryHandle);
            if (scannedRootNode) {
              useVSCodeStore.setState((prev) => ({
                ...prev,
                rootNode: {
                  ...prev.rootNode,
                  ...scannedRootNode,
                },
              }));

              console.log(`VSCodeEditor: Explorer view refreshed from browser file system${forceRefresh ? ' (forced)' : ''}`);
            } else {
              console.warn('VSCodeEditor: Browser file system scan returned no root node');
            }
          } catch (error: any) {
            console.error('VSCodeEditor: Error refreshing browser file system:', error);
          }
        } else {
          console.log('VSCodeEditor: No browser directory handle available; keeping the current virtual workspace tree');
        }
      } else {
        console.log('VSCodeEditor: Neither rootNode nor path provided in refresh-explorer event');
      }
    };
    
    // Add the event listener - convert to unknown first to avoid TypeScript error
    document.addEventListener('refresh-explorer', handleRefreshExplorer as unknown as EventListener);
    
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('refresh-explorer', handleRefreshExplorer as unknown as EventListener);
    };
  }, []);

  // Process API response structure to convert to FileNode structure
  const processFileStructure = (structure: any[], basePath: string): FileNode[] => {
    console.log('Processing file structure from API:', structure);
    return structure.map(item => {
      // Handle both 'directory' and 'folder' type from API
      const isDir = item.type === 'directory' || item.type === 'folder';
      const nodeType = isDir ? 'directory' : 'file';
      
      const node: FileNode = {
        id: item.path || item.id || `${basePath}/${item.name}`,
        name: item.name,
        type: nodeType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Add realPath as custom property for file operations
      (node as any).realPath = item.path;
      console.log(`Processed node: ${node.name}, type: ${node.type}, isDir: ${isDir}`);
      
      // Process children recursively if it's a directory
      if (isDir && Array.isArray(item.children)) {
        console.log(`Processing children for directory: ${node.name}`);
        node.children = processFileStructure(item.children, `${basePath}/${item.name}`);
      }
      
      return node;
    });
  };

  // Initialize editor and validate folder path on mount
  useEffect(() => {
    // Only run once
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('VSCodeEditor: Running initial folder validation');
    
    const validateFolder = async () => {
      const folderPath = getCurrentFolderPath();
      console.log(`VSCodeEditor: Initial folder path: ${folderPath}`);
      
      if (folderPath) {
        const validation = await validateFolderPath(folderPath);
        
        if (!validation.valid) {
          console.error(`VSCodeEditor: Invalid folder path: ${folderPath}, reason: ${validation.error}`);
          // Clear the invalid path
          saveCurrentFolderPath('');
          setCurrentFolderPath('');
        } else {
          console.log(`VSCodeEditor: Folder path is valid: ${folderPath}`);
          setCurrentFolderPath(folderPath);
        }
      }
    };
    
    validateFolder();
  }, []);
  
  // Handle file open event from explorer
  const handleFileOpenEvent = useCallback((event: CustomEvent) => {
    console.log('VSCodeEditor: File open event received:', event.detail);
    
    const { fileId, filePath, content, language } = event.detail;
    
    if (!fileId) {
      console.error('VSCodeEditor: No fileId provided in file open event');
      return;
    }
    
    // Check if file is already open, if so just set it as active
    if (openFiles.includes(fileId)) {
      console.log(`VSCodeEditor: File ${fileId} already open, setting as active`);
      setActiveFile(fileId);
      return;
    }
    
    console.log(`VSCodeEditor: Opening file with ID: ${fileId}, path: ${filePath}`);
    
    // Use the enhanced open file function with retry
    // Pass editorInstances to preserve content when switching tabs
    openFileById(fileId, 5, 100, editorInstances);
  }, [openFiles, setActiveFile]);
  
  // Listen for file open events
  useEffect(() => {
    document.addEventListener('open-file', handleFileOpenEvent as EventListener);
    
    return () => {
      document.removeEventListener('open-file', handleFileOpenEvent as EventListener);
    };
  }, [handleFileOpenEvent]);
  
  // Handle folder selection
  const handleFolderSelection = async (folderPath: string) => {
    console.log('VSCodeEditor: Selected folder:', folderPath);
    try {
      // Validate folder path
      const validationResult = await validateFolderPath(folderPath);
      console.log(`VSCodeEditor: Folder validation result:`, validationResult);
      
      // Check if folder path is valid and exists
      if (validationResult.valid && validationResult.isDirectory) {
        // Save folder path to storage
        const saveResult = saveCurrentFolderPath(folderPath);
        console.log(`VSCodeEditor: Saved selected folder path: ${folderPath} (${saveResult ? 'success' : 'failure'})`);

        const directoryHandle = BrowserFileSystem.getCurrentDirectoryHandle();
        if (directoryHandle) {
          console.log('VSCodeEditor: Refreshing explorer from browser file system handle');
          try {
            const scannedRootNode = await BrowserFileSystem.scanDirectoryToFileNode(directoryHandle);
            if (scannedRootNode) {
              useVSCodeStore.setState((prev) => ({
                ...prev,
                rootNode: {
                  ...prev.rootNode,
                  ...scannedRootNode,
                },
              }));
            }
          } catch (scanError) {
            console.error('VSCodeEditor: Error scanning browser directory:', scanError);
          }
        } else {
          console.log('VSCodeEditor: No browser directory handle available; using the virtual workspace tree');
        }
        
        // Update current folder path in our component state
        setCurrentFolderPath(folderPath);
        
        // Get the current store state
        const storeState = useVSCodeStore.getState();
        
        // Check for dirty files before changing folders
        const rootFileNodes = storeState.rootNode?.children || [];
        let hasDirtyFiles = false;
        
        // Check all open file nodes to see if any are dirty
        if (storeState.openFiles && storeState.rootNode) {
          for (const fileId of storeState.openFiles) {
            const fileNode = findNodeById(storeState.rootNode, fileId) as FileNode;
            if (fileNode && fileNode.type === 'file' && fileNode.isDirty) {
              hasDirtyFiles = true;
              break;
            }
          }
        }
        
        if (hasDirtyFiles) {
          const confirmChange = window.confirm('You have unsaved changes. Are you sure you want to change folders? All unsaved changes will be lost.');
          if (!confirmChange) {
            console.log('VSCodeEditor: User cancelled folder change due to unsaved files');
            return;
          }
        }
        
        // Clean up editor instances
        cleanupEditorInstances(editorInstances, setEditorInstances);
        
        // Reset the store state for the new folder
        useVSCodeStore.setState({
          ...storeState,
          openFiles: [],
          activeFileId: null,
          cursorPositions: {},
          expandedFolders: ['root'] // Make sure the root folder is expanded
        });
        console.log(`VSCodeEditor: Reset editor state for new folder`);
        
        // Create a new root node with this folder path
        const newRootNode: FileNode = {
          id: 'root',
          name: folderPath.split('/').pop() || 'root',
          type: 'directory',
          children: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        // Update the root node
        useVSCodeStore.setState(prev => ({
          ...prev,
          rootNode: newRootNode,
          expandedFolders: ['root']
        }));
        
        // Dispatch events to refresh the explorer with the selected folder
        const refreshEvent = new CustomEvent('refresh-explorer', {
          detail: { path: folderPath, forceRefresh: true }
        });
        document.dispatchEvent(refreshEvent);
        console.log('VSCodeEditor: Dispatched immediate refresh-explorer event with force refresh');
        
        // Wait a bit to ensure proper initialization before refreshing the filesystem again
        setTimeout(() => {
          const refreshEvent = new CustomEvent('refresh-explorer', {
            detail: { path: folderPath, forceRefresh: true }
          });
          document.dispatchEvent(refreshEvent);
          console.log('VSCodeEditor: Dispatched delayed refresh-explorer event with force refresh');
        }, 500);
        
        // Explicitly trigger expanded state for root folder
        setTimeout(() => {
          if (!expandedFolders.includes('root')) {
            useVSCodeStore.setState({
              expandedFolders: [...expandedFolders, 'root']
            });
            console.log('VSCodeEditor: Explicitly expanded root folder');
          }
        }, 800);
      }
    } catch (error: any) {
      console.error(`VSCodeEditor: Error in folder validation:`, error);
      alert(`Error validating folder path: ${error?.message || 'Unknown error'}`);
    }
  };
  
  // Function to get the active file node
  const getActiveFile = (): FileNode | null => {
    if (!activeFileId || !rootNode) return null;
    return findNodeById(rootNode, activeFileId) as FileNode;
  };
  
  // Get open file nodes
  const openFileNodes = openFiles
    .map(id => findNodeById(rootNode, id))
    .filter(Boolean) as FileNode[];
    
  // Track unsaved files
  const unsavedFiles = new Set(
    openFileNodes.filter(file => file.isDirty).map(file => file.id)
  );
  
  // Create new folder function
  const createNewFolder = (parentId: string, folderName: string) => {
    console.log(`VSCodeEditor: Creating new folder ${folderName} in parent ${parentId}`);
    if (!rootNode) return;
    
    // Since there's no built-in createNewFolder in the store, we need to implement it here
    const parent = findNodeById(rootNode, parentId) as FileNode;
    if (!parent || parent.type !== 'directory') {
      console.error('VSCodeEditor: Cannot create folder - parent is not a directory');
      return;
    }
    
    // Create a new folder node
    const newFolderId = `folder-${Date.now()}`;
    const newFolder: FileNode = {
      id: newFolderId,
      name: folderName,
      type: 'directory',
      children: [],
      parentId: parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Update the store with the new folder
    const updatedRoot = {...rootNode};
    const updatedParent = findNodeById(updatedRoot, parentId) as FileNode;
    if (updatedParent && !updatedParent.children) {
      updatedParent.children = [];
    }
    
    if (updatedParent && updatedParent.children) {
      updatedParent.children.push(newFolder);
      useVSCodeStore.setState({
        rootNode: updatedRoot,
        expandedFolders: [...expandedFolders, parentId, newFolderId]
      });
      console.log(`VSCodeEditor: Created new folder ${folderName} with ID ${newFolderId}`);
    }
  };
  
  // Render the editor layout
  const renderEditor = () => {
    const validOpenFiles = openFiles.filter(fileId => findNodeById(rootNode, fileId));
    console.log('VSCodeEditor: Rendering editor with rootNode:', rootNode, 'validOpenFiles:', validOpenFiles);
    
    // If no valid files are open, show empty state
    if (validOpenFiles.length === 0) {
      return <EmptyEditorState theme={theme} />;
    }
    
    // Count files with unsaved changes
    const unsavedFiles = new Set<string>();
    if (rootNode.children) {
      const findUnsavedFiles = (node: FileNode) => {
        if (node.type === 'file' && node.isDirty) {
          unsavedFiles.add(node.id);
        }
        if (node.children) {
          node.children.forEach(findUnsavedFiles);
        }
      };
      rootNode.children.forEach(findUnsavedFiles);
    }
    
    console.log('VSCodeEditor: Rendering editor with rootNode:', rootNode);

    // Render editors for each open file
    return (
      <div className="flex flex-col h-full">
        {/* Editor tabs */}
        <VSCodeEditorTabs
          openFiles={openFileNodes}
          activeFileId={activeFileId || ''}
          onSelectFile={openFileById}
          onCloseFile={(fileId) => closeFileById(fileId, editorInstances, setEditorInstances)}
          unsavedFiles={unsavedFiles}
          onSaveFile={(fileId) => enhancedSaveFile(fileId, undefined, editorInstances)}
        />
        
        {/* Editor content */}
        <div className="flex-grow relative overflow-hidden">
          {validOpenFiles.map(fileId => {
            const fileNode = findNodeById(rootNode, fileId) as FileNode;
            if (!fileNode) {
              console.error(`VSCodeEditor: File node not found for ID: ${fileId}`);
              return null;
            }
            
            const language = getEditorLanguage(fileNode.name);
            const isActive = fileId === activeFileId;
            
            return (
              <MainEditor
                key={fileId}
                fileId={fileId}
                fileNode={fileNode}
                isActive={isActive}
                language={language}
                theme={theme}
                fontSize={fontSize}
                wordWrap={wordWrap}
                editorInstances={editorInstances}
                setEditorInstances={setEditorInstances}
                setLineCount={setLineCount}
                setLocalCursorPosition={setLocalCursorPosition}
                saveCursor={setCursorPosition}
                markFileAsDirty={markFileAsDirty}
                activeFileId={activeFileId}
              />
            );
          })}
        </div>
        
        {/* Status bar */}
        <EditorStatusBar
          lineCount={lineCount}
          cursorPosition={cursorPosition}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>
    );
  };
  
  // Render menu bar
  const renderMenuBar = () => {
    // Format file and folder names
    const activeFileName = activeFileId 
      ? (findNodeById(rootNode, activeFileId) as FileNode)?.name 
      : '';
    
    // Get current editor content if there's an active file
    const getEditorContent = () => {
      if (activeFileId && editorInstances[activeFileId]) {
        const content = editorInstances[activeFileId].editor.getValue();
        return content || '';
      }
      return '';
    };
    
    return (
      <MenuBarAdapter
        onNewFile={() => {
          const parentId = selectedNodeId || rootNode.id;
          createNewFile(parentId, 'Untitled.txt');
        }}
        onNewFolder={() => setIsFolderPickerOpen(true)}
        onSaveFile={() => {
          if (activeFileId) {
            enhancedSaveFile(activeFileId, undefined, editorInstances);
          }
        }}
        onSaveAllFiles={() => {
          openFiles.forEach(fileId => {
            enhancedSaveFile(fileId, undefined, editorInstances);
          });
        }}
        unsavedChanges={unsavedFiles.size > 0}
        onOpenFile={() => setIsFilePickerOpen(true)}
        onOpenFolder={() => setIsFolderPickerOpen(true)}
        currentFileName={activeFileName}
        currentFolderPath={currentFolderPath || 'No folder opened'}
        onRefreshExplorer={() => {
          const refreshEvent = new CustomEvent('refresh-explorer', {
            detail: { path: currentFolderPath, forceRefresh: true }
          });
          document.dispatchEvent(refreshEvent);
        }}
        activeFileId={activeFileId}
        rootNodeId={rootNode.id}
        getEditorContent={getEditorContent}
        createNewFile={createNewFile}
        createNewFolder={createNewFolder}
        saveFile={(fileId, content) => enhancedSaveFile(fileId, content, editorInstances)}
        openFile={(fileId) => openFileById(fileId, 5, 100, editorInstances)}
        onZoomIn={() => handleZoomIn(fontSize, setFontSize)}
        onZoomOut={() => handleZoomOut(fontSize, setFontSize)}
        currentPath={currentFolderPath}
      />
    );
  };
  
  // Render the file explorer for the sidebar
  const renderFileExplorer = () => {
    console.log('Rendering file explorer with rootNode:', rootNode);
    return (
      <VSCodeFileExplorer
        rootNode={rootNode}
        expandedFolders={expandedFolders}
        selectedNodeId={selectedNodeId}
        onSelectNode={(node) => {
          console.log(`Selected node: ${node.id} (${node.type})`);
          // Use the store actions instead of direct setter
          useVSCodeStore.setState({ selectedNodeId: node.id });
          if (node.type === 'file') {
            // Pass editorInstances to preserve content when switching tabs
            openFileById(node.id, 5, 100, editorInstances);
          }
        }}
        onToggleFolder={(folderId) => {
          console.log(`Toggling folder: ${folderId}`);
          // Use the toggleFolder action from the store
          useVSCodeStore.getState().toggleFolder(folderId);
        }}
        onCreateFile={(parentId, fileName) => {
          createNewFile(parentId, fileName);
        }}
        onCreateFolder={(parentId, folderName) => {
          createNewFolder(parentId, folderName);
        }}
        onDeleteNode={(nodeId) => {
          const node = findNodeById(rootNode, nodeId) as FileNode;
          if (!node) return;
          
          if (node.type === 'file') {
            closeFileById(nodeId, editorInstances, setEditorInstances);
          } else if (node.type === 'directory') {
            // Close all files in the directory
            const closeFilesInDir = (dirNode: FileNode) => {
              if (dirNode.children) {
                dirNode.children.forEach(child => {
                  if (child.type === 'file') {
                    closeFileById(child.id, editorInstances, setEditorInstances);
                  } else if (child.type === 'directory') {
                    closeFilesInDir(child);
                  }
                });
              }
            };
            
            closeFilesInDir(node);
          }
          
          // Delete the node from the API
          useVSCodeStore.getState().deleteFile(nodeId);

          const refreshEvent = new CustomEvent('refresh-explorer', {
            detail: { path: currentFolderPath, forceRefresh: true }
          });
          document.dispatchEvent(refreshEvent);
        }}
        onRenameNode={(nodeId, newName) => {
          const node = findNodeById(rootNode, nodeId) as FileNode;
          if (!node) return;
          
          useVSCodeStore.getState().renameFile(nodeId, newName);

          const refreshEvent = new CustomEvent('refresh-explorer', {
            detail: { path: currentFolderPath, forceRefresh: true }
          });
          document.dispatchEvent(refreshEvent);
        }}
        onExportFile={async (node) => {
          let content = node.content || '';

          if (!content && (node as any).handle) {
            try {
              content = await BrowserFileSystem.readFile((node as any).handle);
            } catch (error) {
              console.error('Error exporting browser file handle:', error);
            }
          }

          const element = document.createElement('a');
          const file = new Blob([content], { type: 'text/plain' });
          element.href = URL.createObjectURL(file);
          element.download = node.name;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }}
        onImportFile={(parentId, file) => {
          createFileFromUpload(file, parentId, createNewFile);
        }}
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
        sidebarContent={renderFileExplorer()}
        activeBarItem="explorer"
      >
        {renderEditor()}
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
          // Pass editorInstances to preserve content when switching tabs
          openFileById(fileId, 5, 100, editorInstances);
          setIsQuickPickerOpen(false);
        }}
        recentFiles={getRecentFilesWithLimit(5)}
      />
      
      {/* File browser dialog */}
      <VSCodeFileBrowser
        isOpen={isFilePickerOpen}
        onClose={() => setIsFilePickerOpen(false)}
        onFileSelected={async (fileObject) => {
          console.log(`File selected: ${fileObject.name}`);
          setIsFilePickerOpen(false);
          
          // Create file from upload
          const fileId = await createFileFromUpload(fileObject, rootNode.id, createNewFile);
          
          if (fileId) {
            // Open the file after creation
            setTimeout(() => {
              // Pass editorInstances to preserve content when switching tabs
              openFileById(fileId, 5, 100, editorInstances);
            }, 100);
          }
        }}
        title="Open File"
        acceptTypes="*.*"
      />
      
      {/* Folder selector dialog */}
      <FolderSelector
        isOpen={isFolderPickerOpen}
        onClose={() => setIsFolderPickerOpen(false)}
        onFolderSelected={handleFolderSelection}
      />
    </div>
  );
}
