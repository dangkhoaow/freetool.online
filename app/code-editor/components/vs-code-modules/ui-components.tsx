/**
 * UI components for VS Code editor
 * Smaller, reusable UI components specific to the editor
 */
import React from 'react';
import { FileNode } from '@/lib/services/vs-code-file-system';
import { Undo2, Redo2, Plus, Save, X, FolderOpen, Settings, FileCode, Command } from 'lucide-react';

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
      theme === 'vs-dark' ? 'bg-[#1e1e1e] text-gray-300' : 'bg-white text-gray-700'
    }`}>
      <div className="text-center p-8 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Welcome to VS Code Editor</h2>
        <div className="mb-6 text-sm">
          <p className="mb-2">
            Get started by opening a file from the Explorer on the left.
          </p>
          <p className="mb-2">
            You can also use the following keyboard shortcuts:
          </p>
          <ul className="list-disc list-inside text-left ml-4 mt-2 space-y-1">
            <li><kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+P</kbd> Quick file search</li>
            <li><kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+Shift+P</kbd> Command palette</li>
            <li><kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+S</kbd> Save current file</li>
            <li><kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+B</kbd> Toggle sidebar</li>
          </ul>
        </div>
        <button className={`px-3 py-1.5 rounded flex items-center ${
          theme === 'vs-dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-200'
        }`}>
          <Plus size={16} className="mr-2" />
          New File
        </button>
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
      theme === 'vs-dark' ? 'bg-[#1e1e1e] text-gray-300' : 'bg-white text-gray-700'
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
          onClick={onOpenFolder}
          className={`px-4 py-2 rounded flex items-center mx-auto ${
            theme === 'vs-dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'
          } text-white`}
        >
          <FolderOpen size={16} className="mr-2" />
          Open Folder
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
