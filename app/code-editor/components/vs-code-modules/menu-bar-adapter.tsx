"use client"

/**
 * Menu Bar Adapter Component
 * Adapts between our modular VSCodeEditor props and the original VSCodeMenuBar props
 */

import React from 'react';
import { VSCodeMenuBar } from './menu-bar';
import { FileNode } from './types';

// Props for our modular component
interface MenuBarAdapterProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onSaveFile: () => void;
  onSaveAllFiles: () => void;
  unsavedChanges: boolean;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  currentFileName: string;
  currentFolderPath: string;
  onRefreshExplorer: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  currentPath: string;
  activeFileId: string | null;
  rootNodeId: string;
  getEditorContent: () => string;
  createNewFile: (parentId: string, fileName: string, content?: string, language?: string) => void;
  createNewFolder: (parentId: string, folderName: string) => void;
  saveFile: (fileId: string, content: string) => void;
  openFile: (fileId: string) => void;
}

/**
 * Adapter component to bridge between our modular structure and the original VSCodeMenuBar
 */
export function MenuBarAdapter({
  onNewFile,
  onNewFolder,
  onSaveFile,
  onSaveAllFiles,
  unsavedChanges,
  onOpenFile,
  onOpenFolder,
  currentFileName,
  currentFolderPath,
  onRefreshExplorer,
  onZoomIn,
  onZoomOut,
  currentPath,
  activeFileId,
  rootNodeId,
  getEditorContent,
  createNewFile,
  createNewFolder,
  saveFile,
  openFile
}: MenuBarAdapterProps) {
  // Get the current editor content
  const editorContent = getEditorContent();
  
  console.log('MenuBarAdapter: Rendering menu bar adapter');
  
  return (
    <VSCodeMenuBar
      createNewFile={createNewFile}
      createNewFolder={createNewFolder}
      saveFile={saveFile}
      saveAllFiles={onSaveAllFiles}
      openFile={openFile}
      rootNodeId={rootNodeId}
      onOpenFile={onOpenFile}
      onOpenFolder={onOpenFolder}
      activeFileId={activeFileId}
      editorContent={editorContent}
      refreshExplorer={onRefreshExplorer}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      currentPath={currentPath}
    />
  );
}
