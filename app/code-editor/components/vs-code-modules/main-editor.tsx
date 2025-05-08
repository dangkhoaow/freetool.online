/**
 * Main editor component that wraps Monaco Editor
 * Handles rendering and interactions with the Monaco editor
 */
import React, { useEffect } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { FileNode } from '@/lib/services/vs-code-file-system';
import { EditorInstance } from './types';
import { handleEditorDidMount } from './editor-instance-manager';
import { vsCodeDarkTheme, vsCodeLightTheme } from './themes';
import { EditorErrorBoundary } from './ui-components';

interface MainEditorProps {
  fileId: string;
  fileNode: FileNode;
  isActive: boolean;
  language?: string;
  theme: 'vs-dark' | 'vs';
  fontSize: number;
  wordWrap: 'on' | 'off';
  editorInstances: Record<string, EditorInstance>;
  setEditorInstances: React.Dispatch<React.SetStateAction<Record<string, EditorInstance>>>;
  setLineCount: React.Dispatch<React.SetStateAction<number>>;
  setLocalCursorPosition: React.Dispatch<React.SetStateAction<monaco.Position>>;
  saveCursor: (fileId: string, lineNumber: number, column: number) => void;
  markFileAsDirty: (fileId: string) => void;
  activeFileId: string | null;
}

export function MainEditor({
  fileId,
  fileNode,
  isActive,
  language,
  theme,
  fontSize,
  wordWrap,
  editorInstances,
  setEditorInstances,
  setLineCount,
  setLocalCursorPosition,
  saveCursor,
  markFileAsDirty,
  activeFileId
}: MainEditorProps) {
  console.log(`MainEditor: Rendering editor for file: ${fileNode.name}, ID: ${fileId}, active: ${isActive}`);
  
  // Register themes once when the client loads
  useEffect(() => {
    // Only register themes on the client side
    if (typeof window !== 'undefined' && typeof (window as any).monaco !== 'undefined') {
      console.log('Registering Monaco editor themes');
      (window as any).monaco.editor.defineTheme('vs-code-dark', vsCodeDarkTheme);
      (window as any).monaco.editor.defineTheme('vs-code-light', vsCodeLightTheme);
    }
  }, []);
  
  // Handle file content changes
  const handleEditorWillMount = (monaco: typeof window.monaco) => {
    console.log(`MainEditor: Editor will mount for file: ${fileNode.name}`);
    return monaco;
  };
  
  // Configure editor options
  const editorOptions = {
    fontSize,
    wordWrap,
    lineNumbers: 'on' as const,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderLineHighlight: 'all' as const,
    cursorBlinking: 'smooth' as const,
    cursorStyle: 'line' as const,
    cursorWidth: 2,
    folding: true,
    codeLens: true,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
    },
  };
  
  // Define unique key for the editor instance
  const editorKey = `${fileId}-${isActive ? 'active' : 'inactive'}`;
  
  return (
    <EditorErrorBoundary theme={theme}>
      <div 
        className={`h-full ${isActive ? 'block' : 'hidden'} relative`}
        data-file-id={fileId}
      >
        <MonacoEditor
          key={editorKey}
          height="100%"
          width="100%"
          language={language || 'plaintext'}
          theme={theme === 'vs-dark' ? 'vs-code-dark' : 'vs-code-light'}
          value={fileNode.content || ''}
          options={editorOptions}
          beforeMount={handleEditorWillMount}
          onMount={(editor, monaco) => 
            handleEditorDidMount(
              editor, 
              monaco,
              fileId,
              activeFileId,
              editorInstances,
              setEditorInstances,
              setLineCount,
              setLocalCursorPosition,
              saveCursor,
              markFileAsDirty
            )
          }
          onChange={(value) => {
            console.log(`MainEditor: Content changed for file: ${fileId}, value length: ${value?.length || 0}`);
            if (isActive) {
              markFileAsDirty(fileId);
            }
          }}
        />
      </div>
    </EditorErrorBoundary>
  );
}

/**
 * Component that renders the secondary editor for diff/split view
 */
export function SecondaryEditor({
  fileId,
  fileNode,
  isActive,
  language,
  theme,
  fontSize,
  editorInstances,
  setEditorInstances,
  setLineCount,
  setLocalCursorPosition,
  saveCursor,
  markFileAsDirty,
  activeFileId
}: MainEditorProps) {
  console.log(`SecondaryEditor: Rendering secondary editor for file: ${fileNode.name}, ID: ${fileId}`);
  
  return (
    <EditorErrorBoundary theme={theme}>
      <div className={`h-full ${isActive ? 'block' : 'hidden'}`}>
        <MonacoEditor
          key={`secondary-${fileId}`}
          height="100%"
          width="100%"
          language={language}
          theme={theme === 'vs-dark' ? 'vs-code-dark' : 'vs-code-light'}
          value={fileNode.content || ''}
          options={{
            fontSize,
            wordWrap: 'on',
            lineNumbers: 'on' as const,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: 'all' as const,
            cursorBlinking: 'smooth',
            cursorStyle: 'line' as const,
            cursorWidth: 2,
            folding: true,
            codeLens: true,
            scrollbar: {
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              vertical: 'auto' as const,
              horizontal: 'auto' as const,
            }
          }}
          onMount={(editor, monaco) => 
            handleEditorDidMount(
              editor, 
              monaco,
              fileId,
              activeFileId,
              editorInstances,
              setEditorInstances,
              setLineCount,
              setLocalCursorPosition,
              saveCursor,
              markFileAsDirty
            )
          }
          onChange={() => {
            if (isActive) {
              markFileAsDirty(fileId);
            }
          }}
        />
      </div>
    </EditorErrorBoundary>
  );
}
