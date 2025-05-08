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

// Extend window interface to include our editor content cache
declare global {
  interface Window {
    editorContentCache?: Record<string, string>;
  }
}

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
  
  // The key should be stable across active/inactive state changes to preserve editor content
  // Using just fileId ensures the same editor instance is reused, not recreated on tab switching
  const editorKey = `${fileId}`;

  // Effect to preserve content when switching away from this tab
  useEffect(() => {
    // Only run when this editor becomes inactive
    if (!isActive && editorInstances[fileId]) {
      console.log(`MainEditor: Tab ${fileId} is being deactivated, preserving content`);
      const instance = editorInstances[fileId];
      if (instance && instance.model) {
        const currentContent = instance.model.getValue();
        console.log(`MainEditor: Preserving content for ${fileId}, length: ${currentContent.length}`);
        // This ensures the content is saved to the file node state when switching away
        if (currentContent && currentContent !== fileNode.content) {
          markFileAsDirty(fileId);
        }
      }
    }
  }, [isActive, fileId, editorInstances, fileNode.content, markFileAsDirty]);
  
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
          onMount={(editor, monaco) => {
            console.log(`MainEditor: Editor mounted for file: ${fileId}, content length: ${fileNode.content?.length || 0}`);
            
            // Store the current content in a model value that persists
            if (!window.editorContentCache) {
              window.editorContentCache = {};
            }
            
            // If we have cached content for this file, use it instead of the node content
            // This preserves unsaved changes when switching tabs
            if (window.editorContentCache[fileId]) {
              console.log(`MainEditor: Using cached content for ${fileId}, length: ${window.editorContentCache[fileId].length}`);
              const model = editor.getModel();
              if (model) {
                model.setValue(window.editorContentCache[fileId]);
              }
            }
            
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
            );
          }}
          onChange={(value) => {
            console.log(`MainEditor: Content changed for file: ${fileId}, value length: ${value?.length || 0}`);
            if (isActive) {
              // Store content in our global cache
              if (value) {
                if (!window.editorContentCache) {
                  window.editorContentCache = {};
                }
                window.editorContentCache[fileId] = value;
                console.log(`MainEditor: Updated cache for ${fileId}, new length: ${value.length}`);
              }
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
