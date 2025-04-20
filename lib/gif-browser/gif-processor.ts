import { parseGIF, decompressFrames } from 'gifuct-js';
import JSZip from 'jszip';

export interface GifProcessingSettings {
  outputFormat: 'png' | 'jpg';
  quality: number;
  extractionMode: 'all' | 'interval' | 'specific';
  frameInterval: number;
  specificFrames: string;
  resizeOption: 'original' | 'custom';
  customWidth: number;
  customHeight: number;
  includeTimestamp: boolean;
  optimizeOutput: boolean;
}

export interface ProcessedFrame {
  blob: Blob;
  filename: string;
  frameIndex: number;
  dataUrl: string;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  percentage: number;
}

export class GifBrowserProcessor {
  // Process a single GIF file
  static async processGif(
    file: File, 
    settings: GifProcessingSettings, 
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<ProcessedFrame[]> {
    try {
      // Parse the GIF file
      const arrayBuffer = await file.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas dimensions based on GIF or custom settings
      const originalWidth = frames[0]?.dims.width || 0;
      const originalHeight = frames[0]?.dims.height || 0;
      
      if (settings.resizeOption === 'custom') {
        canvas.width = settings.customWidth;
        canvas.height = settings.customHeight;
      } else {
        canvas.width = originalWidth;
        canvas.height = originalHeight;
      }
      
      // Determine which frames to extract
      const framesToExtract = this.getFramesToExtract(frames, settings);
      const totalFrames = framesToExtract.length;
      
      // Create image data object once
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      
      // Process each frame
      const outputFrames: ProcessedFrame[] = [];
      
      for (let i = 0; i < framesToExtract.length; i++) {
        const frameIndex = framesToExtract[i];
        const frame = frames[frameIndex];
        
        // Report progress
        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total: totalFrames,
            percentage: Math.round(((i + 1) / totalFrames) * 100)
          });
        }
        
        // Render frame to canvas
        await this.renderFrame(canvas, ctx, frame, imageData, originalWidth, originalHeight);
        
        // Generate filename with appropriate timestamp/index if needed
        const filename = this.generateFilename(file.name, frameIndex, settings);
        
        // Convert to desired format
        const blob = await this.canvasToBlob(canvas, settings.outputFormat, settings.quality);
        const dataUrl = await this.blobToDataUrl(blob);
        
        outputFrames.push({
          blob,
          filename,
          frameIndex,
          dataUrl
        });
      }
      
      return outputFrames;
    } catch (error) {
      console.error('Error processing GIF:', error);
      throw error;
    }
  }
  
  // Process multiple GIF files
  static async processMultipleGifs(
    files: File[], 
    settings: GifProcessingSettings,
    fileProgressCallback?: (fileIndex: number, frames: ProcessedFrame[]) => void,
    overallProgressCallback?: (progress: ProcessingProgress) => void
  ): Promise<Map<string, ProcessedFrame[]>> {
    const results = new Map<string, ProcessedFrame[]>();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Process each file with its own progress tracking
        const frames = await this.processGif(
          file, 
          settings, 
          (progress) => {
            if (overallProgressCallback) {
              const overallProgress = {
                current: (i * 100) + progress.percentage,
                total: files.length * 100,
                percentage: Math.round(((i * 100) + progress.percentage) / (files.length * 100) * 100)
              };
              overallProgressCallback(overallProgress);
            }
          }
        );
        
        // Store results
        results.set(file.name, frames);
        
        // Notify about processed file
        if (fileProgressCallback) {
          fileProgressCallback(i, frames);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Add empty array for failed files
        results.set(file.name, []);
      }
    }
    
    return results;
  }
  
  // Generate a downloadable ZIP of all frames
  static async createDownloadableZip(
    allFrames: Map<string, ProcessedFrame[]>,
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    const zip = new JSZip();
    
    // Count total frames for progress tracking
    let totalFrames = 0;
    let processedFrames = 0;
    
    allFrames.forEach((frames) => {
      totalFrames += frames.length;
    });
    
    // Group frames by original file
    allFrames.forEach((frames, filename) => {
      // Create a folder for each original file
      const folderName = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
      const folder = zip.folder(folderName);
      
      if (folder) {
        frames.forEach((frame) => {
          folder.file(frame.filename, frame.blob);
          
          // Update progress
          processedFrames++;
          if (progressCallback) {
            progressCallback({
              current: processedFrames,
              total: totalFrames,
              percentage: Math.round((processedFrames / totalFrames) * 100)
            });
          }
        });
      }
    });
    
    // Generate the ZIP file
    return await zip.generateAsync({ type: 'blob' });
  }
  
  // Create a downloadable ZIP of all frames from a single file
  static async createSingleFileZip(
    frames: ProcessedFrame[],
    originalFilename: string,
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    const zip = new JSZip();
    const folderName = originalFilename.replace(/\.[^/.]+$/, "");
    
    frames.forEach((frame, index) => {
      zip.file(frame.filename, frame.blob);
      
      if (progressCallback) {
        progressCallback({
          current: index + 1,
          total: frames.length,
          percentage: Math.round(((index + 1) / frames.length) * 100)
        });
      }
    });
    
    return await zip.generateAsync({ type: 'blob' });
  }
  
  // Helper: Determine which frames to extract
  private static getFramesToExtract(frames: any[], settings: GifProcessingSettings): number[] {
    const totalFrames = frames.length;
    
    switch(settings.extractionMode) {
      case 'all':
        return Array.from({ length: totalFrames }, (_, i) => i);
      
      case 'interval':
        return Array.from(
          { length: Math.ceil(totalFrames / settings.frameInterval) }, 
          (_, i) => i * settings.frameInterval
        ).filter(i => i < totalFrames);
      
      case 'specific':
        // Parse user input like "1, 5, 10, 15"
        return settings.specificFrames.split(',')
          .map(f => parseInt(f.trim(), 10) - 1) // Convert to 0-based index
          .filter(f => !isNaN(f) && f >= 0 && f < totalFrames);
        
      default:
        return Array.from({ length: totalFrames }, (_, i) => i);
    }
  }
  
  // Helper: Generate filename for a frame
  private static generateFilename(originalFilename: string, frameIndex: number, settings: GifProcessingSettings): string {
    const extension = settings.outputFormat === 'png' ? '.png' : '.jpg';
    const baseName = originalFilename.replace(/\.[^/.]+$/, ""); // Remove file extension
    
    if (settings.includeTimestamp) {
      // Add frame number to filename
      return `${baseName}_frame${frameIndex + 1}${extension}`;
    } else {
      return `${baseName}${extension}`;
    }
  }
  
  // Helper: Render a frame to canvas
  private static async renderFrame(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    frame: any,
    imageData: ImageData,
    originalWidth: number,
    originalHeight: number
  ): Promise<void> {
    // Get the frame's dimensions and positioning
    const { width, height, top, left } = frame.dims;
    
    // If we're not resizing, we can directly render the frame patch
    if (canvas.width === originalWidth && canvas.height === originalHeight) {
      // Clear canvas (for transparency)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Copy the pixel data to the image data
      const data = imageData.data;
      const frameData = frame.patch;
      let pixelCount = 0;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const j = ((top + y) * canvas.width + (left + x)) * 4;
          
          if (frameData[i + 3]) { // If not fully transparent
            data[j] = frameData[i];     // R
            data[j + 1] = frameData[i + 1]; // G
            data[j + 2] = frameData[i + 2]; // B
            data[j + 3] = frameData[i + 3]; // A
          }
        }
      }
      
      // Put the image data onto the canvas
      ctx.putImageData(imageData, 0, 0);
    } else {
      // For resized output, we need a different approach
      // Create a temporary canvas of original size
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      
      if (!tempCtx) {
        throw new Error('Failed to get temp canvas context');
      }
      
      tempCanvas.width = originalWidth;
      tempCanvas.height = originalHeight;
      
      // Clear the temp canvas
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Create temp image data
      const tempImageData = tempCtx.createImageData(originalWidth, originalHeight);
      const data = tempImageData.data;
      const frameData = frame.patch;
      
      // Copy the pixel data to the image data
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const j = ((top + y) * originalWidth + (left + x)) * 4;
          
          if (frameData[i + 3]) { // If not fully transparent
            data[j] = frameData[i];     // R
            data[j + 1] = frameData[i + 1]; // G
            data[j + 2] = frameData[i + 2]; // B
            data[j + 3] = frameData[i + 3]; // A
          }
        }
      }
      
      // Put the image data onto the temp canvas
      tempCtx.putImageData(tempImageData, 0, 0);
      
      // Scale to the target canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height);
    }
  }
  
  // Helper: Convert canvas to blob
  private static canvasToBlob(canvas: HTMLCanvasElement, format: 'png' | 'jpg', quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        format === 'png' ? undefined : quality / 100
      );
    });
  }
  
  // Helper: Convert blob to data URL for preview
  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
} 