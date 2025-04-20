import { useState, useCallback } from 'react';
import { GifBrowserProcessor, GifProcessingSettings, ProcessedFrame, ProcessingProgress } from '@/lib/gif-browser/gif-processor';

interface GifProcessorState {
  isProcessing: boolean;
  isComplete: boolean;
  progress: ProcessingProgress;
  error: string | null;
  processedFiles: Map<string, ProcessedFrame[]>;
}

export function useGifBrowserProcessor() {
  const [state, setState] = useState<GifProcessorState>({
    isProcessing: false,
    isComplete: false,
    progress: { current: 0, total: 100, percentage: 0 },
    error: null,
    processedFiles: new Map(),
  });

  // Process GIF files
  const processGifs = useCallback(async (files: File[], settings: GifProcessingSettings) => {
    if (files.length === 0) return;

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        isComplete: false,
        error: null,
        progress: { current: 0, total: 100, percentage: 0 }
      }));

      // Process multiple GIFs
      const results = await GifBrowserProcessor.processMultipleGifs(
        files,
        settings,
        // File progress callback
        (fileIndex, frames) => {
          setState(prev => {
            const updatedFiles = new Map(prev.processedFiles);
            updatedFiles.set(files[fileIndex].name, frames);
            return {
              ...prev,
              processedFiles: updatedFiles
            };
          });
        },
        // Overall progress callback
        (progress) => {
          setState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      setState(prev => ({
        ...prev,
        isProcessing: false,
        isComplete: true,
        processedFiles: results,
        progress: { current: 100, total: 100, percentage: 100 }
      }));

      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  }, []);

  // Create a ZIP file of all processed frames
  const createZip = useCallback(async () => {
    if (state.processedFiles.size === 0) return null;

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        progress: { current: 0, total: 100, percentage: 0 }
      }));

      const zipBlob = await GifBrowserProcessor.createDownloadableZip(
        state.processedFiles,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      setState(prev => ({
        ...prev,
        isProcessing: false
      }));

      return zipBlob;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to create ZIP file'
      }));
      return null;
    }
  }, [state.processedFiles]);

  // Create a ZIP file for a single GIF
  const createSingleFileZip = useCallback(async (fileName: string) => {
    const frames = state.processedFiles.get(fileName);
    
    if (!frames || frames.length === 0) return null;

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        progress: { current: 0, total: 100, percentage: 0 }
      }));

      const zipBlob = await GifBrowserProcessor.createSingleFileZip(
        frames,
        fileName,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      setState(prev => ({
        ...prev,
        isProcessing: false
      }));

      return zipBlob;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to create ZIP file'
      }));
      return null;
    }
  }, [state.processedFiles]);

  // Download a single frame
  const downloadFrame = useCallback((frame: ProcessedFrame) => {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(frame.blob);
      a.download = frame.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to download frame'
      }));
      return false;
    }
  }, []);

  // Download a ZIP file
  const downloadZip = useCallback((zipBlob: Blob, fileName: string = 'gif-frames.zip') => {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to download ZIP'
      }));
      return false;
    }
  }, []);

  // Reset the processor state
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      isComplete: false,
      progress: { current: 0, total: 100, percentage: 0 },
      error: null,
      processedFiles: new Map()
    });
  }, []);

  return {
    ...state,
    processGifs,
    createZip,
    createSingleFileZip,
    downloadFrame,
    downloadZip,
    reset
  };
} 