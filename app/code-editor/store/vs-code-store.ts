import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FileNode,
  FileSystemState,
  createFile,
  deleteFileOrFolder,
  renameFileOrFolder,
  saveFileContent,
  toggleFolderExpansion,
  openFile as openFileInSystem,
  closeFile as closeFileInSystem,
  getRecentFiles as getRecentFilesFromSystem,
  findNodeById,
  getLanguageFromFilename,
  getCursorPosition
} from '@/lib/services/vs-code-file-system';

// Extend the imported FileNode interface to add realPath
interface ExtendedFileNode extends Omit<FileNode, 'type'> {
  type: 'file' | 'directory'; // Keep the types compatible with FileNode
  realPath?: string; // Add realPath to track the real filesystem path
  isDirty?: boolean;
  children?: ExtendedFileNode[]; // Ensure children are also ExtendedFileNode
  createdAt: number;  // Keep the same type as FileNode
  updatedAt: number;  // Keep the same type as FileNode
}

// Modify the store state to use our extended interface
interface VSCodeStore extends Omit<FileSystemState, 'rootNode'> {
  rootNode: ExtendedFileNode;
  selectedNodeId: string | null;
  openFiles: string[];
  activeFileId: string | null;
  expandedFolders: string[];
  
  // File system operations
  createNewFile: (
    parentId: string,
    fileName: string,
    content?: string,
    language?: string
  ) => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  saveFile: (fileId: string, content: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  toggleFolder: (folderId: string) => void;
  setEditorContent: (fileId: string, content: string) => void;
  markFileAsDirty: (fileId: string) => void;
  markFileAsSaved: (fileId: string) => void;
  
  // Cursor position tracking
  cursorPositions: Record<string, { lineNumber: number; column: number }>;
  setCursorPosition: (
    fileId: string,
    lineNumber: number,
    column: number
  ) => void;
  
  // UI state operations
  getRecentFiles: () => ExtendedFileNode[];
}

// Create the store
// Persist only minimal UI state, excluding large rootNode tree
const useVSCodeStore = create<VSCodeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      rootNode: {
        id: 'root',
        name: 'root',
        type: 'directory',
        children: [],
        expanded: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as ExtendedFileNode,
      selectedNodeId: null,
      openFiles: [],
      activeFileId: null,
      expandedFolders: ['root'],
      cursorPositions: {},
      
      // File system operations
      createNewFile: (parentId, fileName, content = '', language) => {
        console.log(`Creating new file: ${fileName} in parent: ${parentId}`);
        const newState = createFile(
          get(),
          parentId,
          fileName,
          content,
          language
        );
        set({ rootNode: newState.rootNode as ExtendedFileNode });
      },
      
      deleteFile: (fileId) => {
        console.log(`Deleting file: ${fileId}`);
        const newState = deleteFileOrFolder(get(), fileId);
        set({ rootNode: newState.rootNode as ExtendedFileNode });
        
        // Remove from open files if needed
        const openFiles = get().openFiles.filter((id) => id !== fileId);
        set({ openFiles });
        
        // Update active file if needed
        if (get().activeFileId === fileId) {
          set({ activeFileId: openFiles.length > 0 ? openFiles[0] : null });
        }
      },
      
      renameFile: (fileId, newName) => {
        console.log(`Renaming file: ${fileId} to ${newName}`);
        const newState = renameFileOrFolder(get(), fileId, newName);
        set({ rootNode: newState.rootNode as ExtendedFileNode });
      },
      
      // Save a file
      saveFile: (fileId, content) => {
        console.log(`Saving file with ID: ${fileId}`);
        
        const file = findNodeById(get().rootNode, fileId) as ExtendedFileNode | null;
        if (!file) {
          console.error(`File with ID ${fileId} not found`);
          return;
        }
        
        // Save to server if file has a real path
        if (file.realPath) {
          console.log(`File has real path: ${file.realPath}, saving to disk`);
          // Save to server using the correct API endpoint
          fetch('/api/filesystem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'saveFile',
              path: file.realPath,
              content: content
            }),
          })
          .then(response => {
            console.log('Save file API response status:', response.status);
            return response.json();
          })
          .then(data => {
            if (data.success) {
              console.log(`File saved successfully to disk: ${file.realPath}`);
              // Mark file as saved in the UI
              const rootNodeCopy = { ...get().rootNode };
              const updateFileState = (node: ExtendedFileNode): ExtendedFileNode => {
                if (node.id === fileId) {
                  return { ...node, isDirty: false, updatedAt: Date.now() };
                }
                if (node.children) {
                  return {
                    ...node,
                    children: node.children.map(child => updateFileState(child as ExtendedFileNode))
                  };
                }
                return node;
              };
              const updatedRootNode = updateFileState(rootNodeCopy);
              set({ rootNode: updatedRootNode });
            } else {
              console.error(`Error saving file to disk: ${data.error || 'Unknown error'}`);
            }
          })
          .catch(error => {
            console.error('Error saving file to disk:', error);
          });
        } else {
          console.log(`File does not have a real path, saving to cache storage`);
          
          // Save to cache storage for client-side files
          if (typeof window !== 'undefined' && 'caches' in window) {
            caches.open('vs-code-files').then(cache => {
              const fileURL = `/virtual/${fileId}`;
              const response = new Response(content);
              cache.put(fileURL, response);
              console.log(`Saved file to cache storage: ${fileURL}`);
            });
          }
        }
        
        // Update the file in the state tree
        const rootNodeCopy = { ...get().rootNode };
        const updateFileContent = (node: ExtendedFileNode): ExtendedFileNode => {
          if (node.id === fileId) {
            return { ...node, content, isDirty: false };
          }
          
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => 
                updateFileContent(child as ExtendedFileNode)
              )
            };
          }
          
          return node;
        };
        
        const updatedRootNode = updateFileContent(rootNodeCopy);
        set({ rootNode: updatedRootNode });
      },
      
      // Open a file
      openFile: (fileId) => {
        console.log(`Opening file: ${fileId}`);
        const file = findNodeById(get().rootNode, fileId) as ExtendedFileNode | null;
        
        if (!file) {
          console.error(`File not found with ID: ${fileId}`);
          return;
        }
        
        // If the file has a real path, attempt to load the content from disk
        if (file.realPath && file.type === 'file') {
          console.log(`File has real path: ${file.realPath}, loading from disk`);
          
          // Fetch content from disk using API
          fetch('/api/filesystem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'readFile',
              path: file.realPath
            }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log(`File loaded successfully from disk: ${file.realPath}, size: ${data.content.length} chars`);
              
              // Update file content in the state
              const rootNodeCopy = { ...get().rootNode };
              const updateFileWithContent = (node: ExtendedFileNode): ExtendedFileNode => {
                if (node.id === fileId) {
                  return { ...node, content: data.content, isDirty: false, updatedAt: Date.now() };
                }
                if (node.children) {
                  return {
                    ...node,
                    children: node.children.map(child => updateFileWithContent(child as ExtendedFileNode))
                  };
                }
                return node;
              };
              
              const updatedRootNode = updateFileWithContent(rootNodeCopy);
              set({ rootNode: updatedRootNode });
            } else {
              console.error(`Error loading file from disk: ${data.error || 'Unknown error'}`);
              // Fallback to local storage version
              console.log('Falling back to localStorage version');
            }
          })
          .catch(error => {
            console.error('Error loading file from disk:', error);
            // Fallback to local storage version
            console.log('Falling back to localStorage version due to error');
          });
        } else {
          console.log(`File does not have a real path or is not a file, using cached version`);
        }
        
        // Continue with opening the file in the editor regardless of disk load
        const newState = openFileInSystem(get(), fileId);
        set({ 
          openFiles: newState.openFiles,
          activeFileId: newState.activeFileId
        });
      },
      
      // Close a file
      closeFile: (fileId) => {
        console.log(`Closing file: ${fileId}`);
        const prevOpen = get().openFiles;
        const prevActive = get().activeFileId;
        const idx = prevOpen.indexOf(fileId);
        // Remove the closed file
        const newOpenFiles = prevOpen.filter(id => id !== fileId);
        // Determine new active file
        let newActive: string | null = prevActive === fileId ? null : prevActive;
        if (prevActive === fileId && newOpenFiles.length > 0) {
          const neighborIdx = idx < newOpenFiles.length ? idx : newOpenFiles.length - 1;
          newActive = newOpenFiles[neighborIdx];
        }
        set({ openFiles: newOpenFiles, activeFileId: newActive });
      },
      
      // Set active file
      setActiveFile: (fileId) => {
        console.log(`Setting active file: ${fileId}`);
        set({ activeFileId: fileId });
      },
      
      // Toggle folder expanded/collapsed
      toggleFolder: (folderId) => {
        console.log(`Toggling folder: ${folderId}`);
        const newState = toggleFolderExpansion(get(), folderId);
        set({ 
          rootNode: newState.rootNode as ExtendedFileNode,
          expandedFolders: newState.expandedFolders
        });
      },
      
      // Set editor content
      setEditorContent: (fileId, content) => {
        console.log(`Setting editor content for: ${fileId}`);
        
        // Mark file as dirty
        get().markFileAsDirty(fileId);
        
        // Update content in the file system
        const rootNodeCopy = { ...get().rootNode };
        const updateContent = (node: ExtendedFileNode): ExtendedFileNode => {
          if (node.id === fileId) {
            return { ...node, content, isDirty: true };
          }
          
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => 
                updateContent(child as ExtendedFileNode)
              )
            };
          }
          
          return node;
        };
        
        const updatedRootNode = updateContent(rootNodeCopy);
        set({ rootNode: updatedRootNode });
      },
      
      // Mark file as dirty
      markFileAsDirty: (fileId) => {
        console.log(`Marking file as dirty: ${fileId}`);
        
        const rootNodeCopy = { ...get().rootNode };
        const markDirty = (node: ExtendedFileNode): ExtendedFileNode => {
          if (node.id === fileId) {
            return { ...node, isDirty: true };
          }
          
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => 
                markDirty(child as ExtendedFileNode)
              )
            };
          }
          
          return node;
        };
        
        const updatedRootNode = markDirty(rootNodeCopy);
        set({ rootNode: updatedRootNode });
      },
      
      // Mark file as saved
      markFileAsSaved: (fileId) => {
        console.log(`Marking file as saved: ${fileId}`);
        
        const rootNodeCopy = { ...get().rootNode };
        const markSaved = (node: ExtendedFileNode): ExtendedFileNode => {
          if (node.id === fileId) {
            return { ...node, isDirty: false };
          }
          
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => 
                markSaved(child as ExtendedFileNode)
              )
            };
          }
          
          return node;
        };
        
        const updatedRootNode = markSaved(rootNodeCopy);
        set({ rootNode: updatedRootNode });
      },
      
      // Get recent files
      getRecentFiles: () => {
        // Get files from open files
        const files = getRecentFilesFromSystem(get(), 10);
        return files as ExtendedFileNode[];
      },
      
      // Cursor position tracking
      setCursorPosition: (fileId, lineNumber, column) => {
        set({
          cursorPositions: {
            ...get().cursorPositions,
            [fileId]: { lineNumber, column }
          }
        });
      }
    }),
    {
      name: 'vs-code',
      partialize: (state) => ({
        selectedNodeId: state.selectedNodeId,
        openFiles: state.openFiles,
        activeFileId: state.activeFileId,
        expandedFolders: state.expandedFolders,
        cursorPositions: state.cursorPositions,
      }),
    }
  )
);

export default useVSCodeStore;
