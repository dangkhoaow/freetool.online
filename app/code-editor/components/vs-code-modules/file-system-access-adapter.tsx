"use client"

/**
 * File System Access API Adapter Component
 * 
 * This component bridges the gap between the virtual file system (localStorage) and the
 * actual file system on the user's machine using the File System Access API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, FolderOpen, Download, AlertTriangle } from 'lucide-react';
import { FileNode } from '@/lib/services/vs-code-file-system';
import useVSCodeStore from '../../store/vs-code-store';
import * as BrowserFileSystem from '@/lib/services/browser-file-system-service';
import { validateDirectoryHandle } from './folder-handler';

interface FileSystemAccessAdapterProps {
  rootNodeId: string;
  refreshExplorer: () => void;
  onDirectoryAccessChange?: (hasAccess: boolean) => void;
}

export function FileSystemAccessAdapter({ rootNodeId, refreshExplorer, onDirectoryAccessChange }: FileSystemAccessAdapterProps) {
  // Get the root node from the store using the ID
  const rootNode = useVSCodeStore(state => state.rootNode);
  console.log('FileSystemAccessAdapter: Got root node from store', rootNode);
  // State for tracking API support and UI elements
  const [isApiSupported, setIsApiSupported] = useState<boolean>(false);
  const [showDirDialog, setShowDirDialog] = useState<boolean>(false);
  const [hasDirectoryAccess, setHasDirectoryAccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hasSavingError, setHasSavingError] = useState<boolean>(false);

  // Check if File System Access API is supported
  useEffect(() => {
    console.log('FileSystemAccessAdapter: Checking for File System Access API support');
    const apiSupported = BrowserFileSystem.isFileSystemAccessSupported();
    setIsApiSupported(apiSupported);
    console.log(`FileSystemAccessAdapter: File System Access API support: ${apiSupported}`);
    
    // Check if we already have directory access
    const hasHandle = BrowserFileSystem.hasDirectoryHandle();
    setHasDirectoryAccess(hasHandle);
    console.log(`FileSystemAccessAdapter: Already has directory handle: ${hasHandle}`);
  }, []);

  // Handle requesting access to a directory
  const handleRequestDirectoryAccess = useCallback(async () => {
    console.log('FileSystemAccessAdapter: Requesting directory access');
    try {
      // Request the directory handle
      const directoryHandle = await BrowserFileSystem.requestDirectoryAccess();
      console.log('FileSystemAccessAdapter: Directory handle received', !!directoryHandle);
      
      // Validate the directory handle to ensure it's accessible
      if (directoryHandle) {
        console.log('FileSystemAccessAdapter: Validating directory handle');
        const validationResult = await validateDirectoryHandle(directoryHandle);
        console.log('FileSystemAccessAdapter: Directory validation result:', validationResult);
        
        // Update state based on validation results
        const hasAccess = validationResult.valid;
        setHasDirectoryAccess(hasAccess);
        setShowDirDialog(false);
        
        // Notify parent component about directory access change
        if (onDirectoryAccessChange) {
          console.log('FileSystemAccessAdapter: Notifying parent about directory access change:', hasAccess);
          onDirectoryAccessChange(hasAccess);
        }
        
        if (hasAccess) {
          // Get directory name for user feedback
          const dirName = directoryHandle.name || 'Selected Directory';
          console.log(`FileSystemAccessAdapter: Successfully validated directory access for "${dirName}"`);
          setStatusMessage(`Successfully connected to "${dirName}"`);
          
          // Set directory info in store for tracking
          useVSCodeStore.setState(state => ({
            ...state,
            currentDirectoryName: dirName
          }));
          
          // Clear status message after delay
          setTimeout(() => setStatusMessage(''), 3000);
        } else {
          console.error('FileSystemAccessAdapter: Directory validation failed:', validationResult.error);
          setStatusMessage(`Failed to validate directory: ${validationResult.error || 'Unknown error'}`);
          setTimeout(() => setStatusMessage(''), 3000);
        }
      } else {
        console.log('FileSystemAccessAdapter: No directory handle received (user cancelled)');
        setHasDirectoryAccess(false);
        setStatusMessage('Directory selection cancelled');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (error) {
      console.error('FileSystemAccessAdapter: Error requesting directory access:', error);
      setStatusMessage(`Error accessing directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  }, [onDirectoryAccessChange]);

  // Save the entire project structure to disk
  const handleSaveProjectToDisk = useCallback(async () => {
    console.log('FileSystemAccessAdapter: Saving project to disk');
    setIsSaving(true);
    setHasSavingError(false);
    
    try {
      // Check if we already have directory access
      if (!BrowserFileSystem.hasDirectoryHandle()) {
        console.log('FileSystemAccessAdapter: No directory handle, requesting access first');
        await handleRequestDirectoryAccess();
        
        // Verify we have a valid directory handle after requesting access
        if (!BrowserFileSystem.hasDirectoryHandle()) {
          console.error('FileSystemAccessAdapter: Failed to get directory access for saving');
          setHasSavingError(true);
          setStatusMessage('Failed to get directory access');
          setIsSaving(false);
          return;
        }
      }
      
      // Reuse existing handle if available, otherwise prompt
      const directoryHandle = BrowserFileSystem.hasDirectoryHandle()
        ? BrowserFileSystem.getCurrentDirectoryHandle()
        : await BrowserFileSystem.requestDirectoryAccess();
      console.log('FileSystemAccessAdapter: Got directory handle for saving:', !!directoryHandle);
      
      if (!directoryHandle) {
        console.error('FileSystemAccessAdapter: No valid directory handle for saving');
        setHasSavingError(true);
        setStatusMessage('No valid directory selected');
        setIsSaving(false);
        return;
      }
      
      // Validate directory handle before saving
      const validationResult = await validateDirectoryHandle(directoryHandle);
      console.log('FileSystemAccessAdapter: Directory validation for saving:', validationResult);
      
      if (!validationResult.valid) {
        console.error('FileSystemAccessAdapter: Directory validation failed for saving:', validationResult.error);
        setHasSavingError(true);
        setStatusMessage(`Invalid directory: ${validationResult.error || 'Unknown error'}`);
        setIsSaving(false);
        return;
      }
      
      // If we have a valid root node, proceed with saving
      if (!rootNode) {
        console.error('FileSystemAccessAdapter: No root node available for saving');
        setHasSavingError(true);
        setStatusMessage('No project structure to save');
        setIsSaving(false);
        return;
      }
      
      console.log('FileSystemAccessAdapter: Starting to save project structure to disk');
      
      // Save the project structure to disk
      await BrowserFileSystem.saveProjectToDisk(directoryHandle, rootNode);
      console.log('FileSystemAccessAdapter: Project structure saved to disk successfully');
      
      setStatusMessage('Project saved successfully to disk');
      
      // Refresh the explorer to reflect any changes
      refreshExplorer();
      
    } catch (error) {
      console.error('FileSystemAccessAdapter: Error saving project to disk:', error);
      setHasSavingError(true);
      setStatusMessage(`Error saving: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  }, [rootNode, refreshExplorer, handleRequestDirectoryAccess]);

  // If the API is not supported, return a minimal UI with a download button
  if (!isApiSupported) {
    console.log('FileSystemAccessAdapter: API not supported, showing fallback UI');
    return (
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.alert('Your browser doesn\'t support direct file system access. Use the File > Export option to download your project.')}
          title="Your browser doesn't support direct file system access"
          className="text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Export Files
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {hasDirectoryAccess ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSaveProjectToDisk}
            disabled={isSaving}
            title="Save project to disk using File System Access API"
            className="text-xs"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            Save to Disk
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDirDialog(true)}
            title="Connect to a directory on your local disk"
            className="text-xs"
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1" />
            Connect to Directory
          </Button>
        )}
        
        {statusMessage && (
          <span className={`text-xs ${hasSavingError ? 'text-red-500' : 'text-green-500'}`}>
            {statusMessage}
          </span>
        )}
      </div>

      {/* Directory Selection Dialog */}
      <Dialog open={showDirDialog} onOpenChange={setShowDirDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Directory</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Select a directory on your computer where you want to save files. 
              This will allow you to directly edit files on your disk.
            </p>
            
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                You'll need to grant permission to access files in the directory you select.
                Files will be created and modified directly on your disk.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDirDialog(false)}>Cancel</Button>
            <Button onClick={handleRequestDirectoryAccess}>Select Directory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
