/**
 * UI components for VS Code editor
 * Smaller, reusable UI components specific to the editor
 */
import React from 'react';
import { FileNode } from '@/lib/services/vs-code-file-system';
import { Undo2, Redo2, Plus, Save, X, FolderOpen, Settings, FileCode, Command } from 'lucide-react';
import * as BrowserFileSystem from '@/lib/services/browser-file-system-service';
import { validateDirectoryHandle } from './folder-handler';
import useVSCodeStore from '../../store/vs-code-store';

/**
 * Status bar component to show line and column information
 */
export function EditorStatusBar({ lineCount, cursorPosition, theme, toggleTheme }: {
  lineCount: number;
  cursorPosition: { lineNumber: number; column: number };
  theme: 'vs-dark' | 'vs';
  toggleTheme: () => void;
}) {
  console.log(`UIComponents: Rendering status bar. Line: ${cursorPosition.lineNumber}, Col: ${cursorPosition.column}, Total: ${lineCount}`);
  
  return (
    <div className={`flex w-full justify-between items-center text-xs px-2 py-1 ${
      theme === 'vs-dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-200 text-gray-700'
    }`}>
      <div className="flex gap-4">
        <span>Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}</span>
        <span>Lines: {lineCount}</span>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={toggleTheme}
          className="hover:bg-gray-700 hover:text-white px-2 py-0.5 rounded"
        >
          {theme === 'vs-dark' ? 'Light Theme' : 'Dark Theme'}
        </button>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

/**
 * Editor tab for a single file
 */
export function EditorTab({ 
  file, 
  isActive, 
  onSelect, 
  onClose, 
  isDirty,
  onSave,
  theme
}: {
  file: FileNode;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  isDirty?: boolean;
  onSave?: () => void;
  theme: 'vs-dark' | 'vs';
}) {
  console.log(`UIComponents: Rendering tab for file: ${file.name}, Active: ${isActive}, Dirty: ${isDirty}`);
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) onSave();
  };
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  
  return (
    <div 
      className={`flex items-center px-2 py-1 border-r ${
        isActive 
          ? theme === 'vs-dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900'
          : theme === 'vs-dark'
            ? 'bg-gray-900 text-gray-400 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } cursor-pointer transition-colors`}
      onClick={onSelect}
    >
      <FileCode size={14} className="mr-1" />
      <span className="truncate max-w-32">{file.name}</span>
      {isDirty && <span className="ml-1 text-xs">●</span>}
      
      <div className="flex gap-1 ml-2">
        {isDirty && (
          <button 
            onClick={handleSave}
            className="text-xs hover:bg-gray-600 p-0.5 rounded"
            title="Save"
          >
            <Save size={12} />
          </button>
        )}
        <button
          onClick={handleClose}
          className="text-xs hover:bg-gray-600 p-0.5 rounded"
          title="Close"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

/**
 * Empty editor state when no file is open
 */
export function EmptyEditorState({ theme }: { theme: 'vs-dark' | 'vs' }) {
  console.log(`UIComponents: Rendering empty editor state with theme: ${theme}`);
  
  return (
    <div className={`flex flex-col items-center justify-center h-full ${
      theme === 'vs-dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'
    }`}>
      <div className="text-center max-w-lg p-8">
        <FileCode size={48} className="mb-6 mx-auto text-blue-500 opacity-80" />
        <h2 className="text-2xl font-semibold mb-3">No File Opened</h2>
        <p className="text-sm mb-6">
          Select a file from the Explorer panel to start editing. You can also create a new file 
          or use keyboard shortcuts to navigate your workspace.
        </p>
        <div className="flex flex-col space-y-4">
          <button 
            className={`px-4 py-2 rounded flex items-center mx-auto ${
              theme === 'vs-dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'
            } text-white`}
          >
            <FileCode size={16} className="mr-2" />
            New File
          </button>
          
          <div className="text-sm mt-4">
            <p className="mb-2 font-medium">Keyboard shortcuts:</p>
            <ul className="space-y-1 text-left mx-auto w-fit">
              <li className="flex items-center">
                <kbd className={`px-1.5 py-0.5 rounded text-xs mr-2 ${
                  theme === 'vs-dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>Ctrl+P</kbd> 
                <span>Quick file search</span>
              </li>
              <li className="flex items-center">
                <kbd className={`px-1.5 py-0.5 rounded text-xs mr-2 ${
                  theme === 'vs-dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>Ctrl+Shift+P</kbd> 
                <span>Command palette</span>
              </li>
              <li className="flex items-center">
                <kbd className={`px-1.5 py-0.5 rounded text-xs mr-2 ${
                  theme === 'vs-dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>Ctrl+S</kbd> 
                <span>Save current file</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component to show when folder path is invalid or not set
 */
export function InvalidFolderState({ 
  onOpenFolder, 
  theme, 
  errorMessage 
}: { 
  onOpenFolder: () => void; 
  theme: 'vs-dark' | 'vs';
  errorMessage?: string;
}) {
  console.log(`UIComponents: Rendering invalid folder state with theme: ${theme}`);
  
  return (
    <div className={`flex flex-col items-center justify-center h-full ${
      theme === 'vs-dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'
    }`}>
      <div className="text-center max-w-lg p-8">
        <FolderOpen size={48} className="mb-6 mx-auto text-blue-500 opacity-80" />
        <h2 className="text-2xl font-semibold mb-3">No Folder Opened</h2>
        {errorMessage && <p className="text-sm text-red-400 mb-4">{errorMessage}</p>}
        <p className="text-sm mb-6">
          Open a folder to start working with files. The VS Code editor requires a workspace
          folder to properly display and edit your files.
        </p>
        <button
          onClick={async () => {
            console.log('InvalidFolderState: Open folder or connect to directory');
            const fsApiSupported = BrowserFileSystem.isFileSystemAccessSupported();
            if (fsApiSupported) {
              try {
                const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
                console.log('InvalidFolderState: Directory handle received:', !!directoryHandle);
                if (directoryHandle) {
                  const validationResult = await validateDirectoryHandle(directoryHandle);
                  console.log('InvalidFolderState: Directory validation result:', validationResult);
                  if (validationResult.valid) {
                    const dirName = directoryHandle.name || 'Selected Directory';
                    console.log(`InvalidFolderState: Connected to directory: ${dirName}`);
                    console.log('InvalidFolderState: Scanning directory structure');
                    const scannedRootNode = await BrowserFileSystem.scanDirectoryToFileNode(directoryHandle);
                    if (!scannedRootNode) {
                      console.error('InvalidFolderState: Failed to scan directory structure');
                      alert('Failed to scan directory structure');
                      return;
                    }
                    const filterHidden = (node: FileNode): FileNode => ({
                      ...node,
                      children: node.children
                        ?.filter(c => !c.name.startsWith('.'))
                        .map(filterHidden),
                    });
                    const filteredRootNode = filterHidden(scannedRootNode);
                    console.log('InvalidFolderState: Filtered hidden items from scan', filteredRootNode);
                    console.log('InvalidFolderState: Updating store with scanned root node');
                    useVSCodeStore.setState(state => ({
                      ...state,
                      currentPath: `/browser-fs/${dirName}`,
                      rootNode: filteredRootNode,
                    }));
                    console.log('InvalidFolderState: Refreshing explorer with scanned root node');
                    document.dispatchEvent(new CustomEvent('refresh-explorer', { detail: { rootNode: filteredRootNode, path: `/browser-fs/${dirName}`, forceRefresh: true } }));
                  } else {
                    console.error('InvalidFolderState: Directory validation failed:', validationResult.error);
                    alert(`Could not access directory: ${validationResult.error || 'Unknown error'}`);
                  }
                } else {
                  console.warn('InvalidFolderState: No directory handle received');
                }
              } catch (error) {
                console.error('InvalidFolderState: Error accessing directory:', error);
                alert(`Error accessing directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            } else {
              onOpenFolder();
            }
          }}
           className={`px-4 py-2 rounded flex items-center mx-auto ${
             theme === 'vs-dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'
           } text-white`}
         >
          <FolderOpen size={16} className="mr-2" />
          {BrowserFileSystem.isFileSystemAccessSupported() ? 'Connect to Directory' : 'Open Folder'}
        </button>
      </div>
    </div>
  );
}

/**
 * Error boundary for editor component to catch and display errors
 */
export class EditorErrorBoundary extends React.Component<
  { children: React.ReactNode; theme: 'vs-dark' | 'vs' },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; theme: 'vs-dark' | 'vs' }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UIComponents: Editor error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`flex flex-col items-center justify-center h-full p-4 ${
          this.props.theme === 'vs-dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 w-full max-w-lg">
            <h3 className="font-bold text-lg mb-2">Something went wrong</h3>
            <p className="mb-3">{this.state.error?.message || 'An unknown error occurred'}</p>
            <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-64">
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-400 text-white"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
