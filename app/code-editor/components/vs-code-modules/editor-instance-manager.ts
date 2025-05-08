/**
 * Editor instance management
 * Handles the creation, tracking, and cleanup of Monaco editor instances
 */
import * as monaco from 'monaco-editor';
import { EditorInstance } from './types';
import useVSCodeStore from '../../store/vs-code-store';

/**
 * Handles the mounting of an editor instance
 * Creates and stores editor instances with necessary event listeners
 * 
 * @param editor The monaco editor instance
 * @param monaco The monaco instance
 * @param fileId The ID of the file being edited
 * @param editorInstances Current record of editor instances
 * @param setEditorInstances Function to update editor instances
 * @param setLineCount Function to update line count state
 * @param setLocalCursorPosition Function to update cursor position state
 */
export function handleEditorDidMount(
  editor: monaco.editor.IStandaloneCodeEditor,
  monaco: typeof window.monaco,
  fileId: string | null,
  activeFileId: string | null,
  editorInstances: Record<string, EditorInstance>,
  setEditorInstances: React.Dispatch<React.SetStateAction<Record<string, EditorInstance>>>,
  setLineCount: React.Dispatch<React.SetStateAction<number>>,
  setLocalCursorPosition: React.Dispatch<React.SetStateAction<monaco.Position>>,
  saveCursor: (fileId: string, lineNumber: number, column: number) => void,
  markFileAsDirty: (fileId: string) => void
) {
  console.log(`EditorManager: Editor mounted for file ID: ${fileId || 'unknown'}`);
  
  // Use active file ID if current file ID is not provided
  const fileIdToUse = fileId || activeFileId;
  
  if (!fileIdToUse) {
    console.error('EditorManager: No active file ID available when mounting editor');
    return;
  }

  // Listen for cursor position changes
  const cursorDisposable = editor.onDidChangeCursorPosition(e => {
    setLocalCursorPosition(e.position);
    console.log(`EditorManager: Cursor position changed to ${e.position.lineNumber}:${e.position.column}`);

    if (fileIdToUse) {
      // Save cursor position to the store
      saveCursor(fileIdToUse, e.position.lineNumber, e.position.column);
      console.log(`EditorManager: Cursor position saved for file ${fileIdToUse}: ${e.position.lineNumber}:${e.position.column}`);
    }
  });

  // Listen for content changes to mark files as dirty
  const contentDisposable = editor.onDidChangeModelContent(() => {
    if (fileIdToUse) {
      markFileAsDirty(fileIdToUse);
      console.log(`EditorManager: Content changed for ${fileIdToUse}, marked as dirty`);
    }
  });

  // Get the model
  const model = editor.getModel();
  if (model) {
    // Update line count
    setLineCount(model.getLineCount());
    console.log(`EditorManager: Model has ${model.getLineCount()} lines`);
  }

  // Store the editor instance with the fileId and disposables for cleanup
  if (model) {
    console.log(`EditorManager: Storing editor instance for file ID: ${fileIdToUse}`);
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
      console.log(`EditorManager: Editor instances now include ${Object.keys(updated).length} files:`, Object.keys(updated));
      return updated;
    });
  } else {
    console.error(`EditorManager: Model is null for file ID ${fileIdToUse}, cannot store editor instance`);
  }
}

/**
 * Gets content from an editor instance or falls back to store content
 * @param fileId ID of the file to get content for
 * @param editorInstances Record of current editor instances
 * @returns Content of the file as a string
 */
export function getEditorContent(fileId: string, editorInstances: Record<string, EditorInstance>): string | null {
  console.log(`EditorManager: Getting content for file ${fileId}`);
  
  // Try to get from editor instance first
  const instance = editorInstances[fileId];
  if (instance && instance.model) {
    const content = instance.model.getValue();
    console.log(`EditorManager: Retrieved content from editor instance, length: ${content.length} characters`);
    return content;
  }
  
  // Fall back to store
  console.log(`EditorManager: No editor instance found for ${fileId}, falling back to store`);
  const storeState = useVSCodeStore.getState();
  const fileNode = storeState.rootNode ? findNodeById(storeState.rootNode, fileId) : null;
  
  if (fileNode && fileNode.type === 'file') {
    console.log(`EditorManager: Retrieved content from store, length: ${fileNode.content?.length || 0} characters`);
    return fileNode.content || '';
  }
  
  console.error(`EditorManager: Could not find content for file ${fileId}`);
  return null;
}

/**
 * Cleans up resources for a specific file
 * @param fileId ID of the file to clean up
 * @param editorInstances Current editor instances
 * @param setEditorInstances Function to update editor instances
 */
export function cleanupEditorInstance(
  fileId: string,
  editorInstances: Record<string, EditorInstance>,
  setEditorInstances: React.Dispatch<React.SetStateAction<Record<string, EditorInstance>>>
) {
  console.log(`EditorManager: Cleaning up editor instance for file ${fileId}`);
  
  const instance = editorInstances[fileId];
  if (instance && instance.disposables) {
    instance.disposables.forEach(d => {
      d.dispose();
      console.log(`EditorManager: Disposed of a listener for file ${fileId}`);
    });
    
    setEditorInstances(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      console.log(`EditorManager: Removed instance for file ${fileId}, remaining: ${Object.keys(updated).length}`);
      return updated;
    });
  }
}

/**
 * Find a node by ID in the file tree
 * @param rootNode Root node of the file tree
 * @param id ID to search for
 * @returns The found node or null
 */
function findNodeById(rootNode: any, id: string): any {
  console.log(`EditorManager: Searching for node with ID: ${id}`);
  
  if (!rootNode) {
    console.log('EditorManager: Root node is null, cannot search');
    return null;
  }
  
  if (rootNode.id === id) {
    console.log(`EditorManager: Found node with ID: ${id}`);
    return rootNode;
  }
  
  if (rootNode.children) {
    for (const child of rootNode.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
}
