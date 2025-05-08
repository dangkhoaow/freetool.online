"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * NewFileDialog - Dialog for creating a new file
 * 
 * This component provides a modal dialog for users to create a new file
 * with name validation and submission handling.
 */
export function NewFileDialog({
  isOpen,
  onClose,
  onSubmit,
  parentPath,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileName: string, content: string) => Promise<void>;
  parentPath: string;
}) {
  console.log('NewFileDialog rendering for parent path:', parentPath);
  
  const [fileName, setFileName] = useState('');
  console.log('Initial fileName state:', fileName);
  
  const [content, setContent] = useState('');
  console.log('Initial content state:', content);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log('Initial isSubmitting state:', isSubmitting);
  
  const [error, setError] = useState<string | null>(null);
  console.log('Initial error state:', error);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    console.log('Dialog open state changed to:', open);
    
    if (!open) {
      onClose();
    }
    
    // Reset form state when dialog opens
    if (open) {
      setFileName('');
      setContent('');
      setError(null);
      setIsSubmitting(false);
      console.log('Reset form state');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting new file form with name:', fileName);
    
    // Validate file name
    if (!fileName.trim()) {
      setError('File name cannot be empty');
      console.error('Validation error: File name cannot be empty');
      return;
    }
    
    // Check if file name contains invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(fileName)) {
      setError('File name contains invalid characters');
      console.error('Validation error: File name contains invalid characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Setting isSubmitting to true');
      
      await onSubmit(fileName, content);
      console.log('File creation successful');
      
      onClose();
      console.log('Dialog closed after successful submission');
    } catch (err) {
      console.error('Error creating file:', err);
      setError(err instanceof Error ? err.message : 'Failed to create file');
    } finally {
      setIsSubmitting(false);
      console.log('Setting isSubmitting to false');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#252526] text-white border-[#3c3c3c]">
        <DialogHeader>
          <DialogTitle className="text-white">Create New File</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Parent folder: {parentPath}</p>
            
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                console.log('File name changed to:', e.target.value);
                
                // Clear error when user types
                if (error) {
                  setError(null);
                  console.log('Cleared error state');
                }
              }}
              placeholder="File name (with extension)"
              className="bg-[#3c3c3c] border-[#555] text-white"
              autoFocus
            />
            
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                console.log('File content changed, new length:', e.target.value.length);
              }}
              placeholder="File content (optional)"
              className="w-full h-24 p-2 text-sm bg-[#3c3c3c] border border-[#555] rounded text-white"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
