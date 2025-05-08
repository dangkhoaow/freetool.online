/**
 * Type definitions for VS Code editor components
 */
import * as monaco from 'monaco-editor';
import { FileNode as BaseFileNode } from '@/lib/services/vs-code-file-system';
import { default as useVSCodeStoreImport } from '@/app/code-editor/store/vs-code-store';

// Extend the base FileNode type with additional properties used by our editor
export type FileNode = BaseFileNode & {
  isDirty?: boolean;
  children?: FileNode[];
  parentId?: string;
  isExpanded?: boolean;
  path?: string;
};

/**
 * Type for editor instances that tracks additional metadata
 */
export type EditorInstance = {
  editor: monaco.editor.IStandaloneCodeEditor;
  model: monaco.editor.ITextModel;
  disposables?: monaco.IDisposable[];
};

/**
 * Extended FileNode type extracted from the store type
 */
export type ExtendedFileNode = FileNode;

/**
 * Type for the VSCode commands used in command palette
 */
export interface VSCodeCommandType {
  id: string;
  label: string;
  keybinding?: string[];
  description?: string;
  execute: () => void;
  icon?: React.ReactNode;
}

/**
 * Editor state interface
 */
export interface EditorState {
  fontSize: number;
  theme: 'vs-dark' | 'vs';
  wordWrap: 'on' | 'off';
  lineNumbers: 'on' | 'off';
  minimap: boolean;
  cursorPosition: monaco.Position;
  lineCount: number;
}

/**
 * Function to check if a node is a FileNode with the given type
 * @param node The node to check
 * @param type The node type to check for
 * @returns A type predicate indicating if the node is of the specified type
 */
export function isNodeOfType(node: any, type: 'file' | 'directory'): node is FileNode {
  console.log(`Checking if node ${node?.id} is of type ${type}`);
  return node && node.type === type;
}
