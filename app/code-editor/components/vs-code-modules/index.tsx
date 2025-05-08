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
  const [fontSize, setFontSize] = useState(14); // Default font size for editor
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
        
        // Show loading state
        // Manual fetch instead of using a helper function for clarity
        try {
          console.log('VSCodeEditor: Making API request to /api/filesystem');
          
          // Add cache-busting parameter if forceRefresh is true
          const cacheBuster = forceRefresh ? `&_=${Date.now()}` : '';
          const response = await fetch(`/api/filesystem?path=${encodeURIComponent(folderPath)}${cacheBuster}`);
          
          console.log('VSCodeEditor: API response status:', response.status);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('VSCodeEditor: File system data received:', data);
          console.log('VSCodeEditor: Item count:', data.structure?.length || 0);
          
          if (data.success && Array.isArray(data.structure)) {
            // Process the structure to ensure all items have proper paths
            // Create a mapping of the file structure to our FileNode structure
            const processedStructure = processFileStructure(data.structure, folderPath);
            console.log('VSCodeEditor: Processed structure:', processedStructure);
            
            // Update the rootNode with the children from the API
            useVSCodeStore.setState(prev => {
              const updatedRootNode = { 
                ...prev.rootNode,
                children: processedStructure,
                name: folderPath.split('/').pop() || 'root'
              };
              return { rootNode: updatedRootNode };
            });
            
            console.log(`VSCodeEditor: Explorer view refreshed successfully${forceRefresh ? ' (forced from disk)' : ''}`);
          } else {
            console.error('VSCodeEditor: API returned unexpected data format:', data);
            // Show error in UI if needed
          }
        } catch (error: any) {
          console.error('VSCodeEditor: Error refreshing folder:', error);
          const errorMessage = `Failed to refresh folder: ${error.message || String(error)}`;
          console.error(errorMessage);
          // Show error in UI if needed
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
        
        // Directly call the API to load folder contents
        console.log('VSCodeEditor: Directly calling filesystem API to load folder contents');
        try {
          const response = await fetch(`/api/filesystem?path=${encodeURIComponent(folderPath)}`);
          console.log('VSCodeEditor: API response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('VSCodeEditor: Direct API call - file system data received:', data);
          console.log('VSCodeEditor: Direct API call - item count:', data.structure?.length || 0);
          
          if (data.success && Array.isArray(data.structure)) {
            // Process the structure and update the store
            const processedStructure = processFileStructure(data.structure, folderPath);
            console.log('VSCodeEditor: Direct API call - processed structure:', processedStructure);
            
            // Update the rootNode with the children from the API
            useVSCodeStore.setState(prev => {
              const updatedRootNode = { 
                ...prev.rootNode,
                children: processedStructure,
                name: folderPath.split('/').pop() || 'root'
              };
              return { rootNode: updatedRootNode };
            });
            
            console.log('VSCodeEditor: Direct API call - Explorer view updated successfully');
          }
        } catch (apiError: any) {
          console.error('VSCodeEditor: Error in direct API call:', apiError);
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
    // If no folder is selected, show a prompt to select one
    if (!currentFolderPath) {
      return (
        <InvalidFolderState 
          onOpenFolder={() => setIsFolderPickerOpen(true)}
          theme={theme}
          errorMessage="No folder is currently open. Please open a folder to continue."
        />
      );
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

    // If no files are open, show empty state
    if (openFiles.length === 0) {
      return <EmptyEditorState theme={theme} />;
    }
    
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
        <div className="flex-grow relative overflow-hidden bg-[#252526]">
          {openFiles.map(fileId => {
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
          // Use custom attributes to handle file path
          const nodePath = (node as any).realPath || '';
          fetch(`/api/filesystem/delete?path=${encodeURIComponent(nodePath)}`, {
            method: 'DELETE',
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                // Refresh explorer
                const refreshEvent = new CustomEvent('refresh-explorer', {
                  detail: { path: currentFolderPath, forceRefresh: true }
                });
                document.dispatchEvent(refreshEvent);
              } else {
                console.error('Error deleting node:', data.error);
              }
            })
            .catch(error => {
              console.error('Error deleting node:', error);
            });
        }}
        onRenameNode={(nodeId, newName) => {
          const node = findNodeById(rootNode, nodeId) as FileNode;
          if (!node) return;
          
          // Use custom attributes to handle file path
          const oldPath = (node as any).realPath || '';
          if (!oldPath) return;
          
          const dirPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1);
          const newPath = dirPath + newName;
          
          fetch(`/api/filesystem/rename?oldPath=${encodeURIComponent(oldPath)}&newPath=${encodeURIComponent(newPath)}`, {
            method: 'POST',
          })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                // If it's an open file, update in the store
                if (node.type === 'file' && openFiles.includes(nodeId)) {
                  // Use the store's renameFile method if available
                  if (useVSCodeStore.getState().renameFile) {
                    useVSCodeStore.getState().renameFile(nodeId, newName);
                  }
                }
                
                // Refresh explorer
                const refreshEvent = new CustomEvent('refresh-explorer', {
                  detail: { path: currentFolderPath, forceRefresh: true }
                });
                document.dispatchEvent(refreshEvent);
              } else {
                console.error('Error renaming node:', data.error);
              }
            })
            .catch(error => {
              console.error('Error renaming node:', error);
            });
        }}
        onExportFile={(node) => {
          // Use custom attributes to handle file path
          const nodePath = (node as any).realPath || '';
          if (!nodePath) return;
          
          fetch(`/api/filesystem/read?path=${encodeURIComponent(nodePath)}`, {
            method: 'GET',
          })
            .then(response => response.text())
            .then(content => {
              // Create a download link
              const element = document.createElement('a');
              const file = new Blob([content], { type: 'text/plain' });
              element.href = URL.createObjectURL(file);
              element.download = node.name;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            })
            .catch(error => {
              console.error('Error exporting file:', error);
            });
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
