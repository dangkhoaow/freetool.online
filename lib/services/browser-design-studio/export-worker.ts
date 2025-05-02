/**
 * Export Worker
 * 
 * Web Worker for handling export operations without blocking the main thread
 * This allows for responsive UI during complex export operations
 */

// Import export functions from the modular workers
import {
  exportSvg,
  exportPng,
  exportJpg,
  exportPdf,
  exportAi,
  exportCss,
  sendProgress
} from './export-workers';

// Type definitions for messages between main thread and worker
interface ExportMessage {
  type: 'export'
  data: {
    format: string
    options: {
      width?: number
      height?: number
      quality?: number
      scale?: number
      includeVector?: boolean
      includeRaster?: boolean
      includeText?: boolean
      includeBackground?: boolean
      optimizeSize?: boolean
      [key: string]: any
    }
    vectorPaths: any[]
    rasterLayers: any[]
    rasterImageData: ImageData | null
    textNodes: any[]
  }
}

interface ProgressMessage {
  type: 'progress'
  data: {
    progress: number
    status?: string
  }
}

interface CompleteMessage {
  type: 'complete'
  data: {
    result: any
  }
}

interface ErrorMessage {
  type: 'error'
  data: {
    message: string
  }
}

// Set up self type for the web worker environment
const ctx: Worker = self as any;

// Handle messages from the main thread
ctx.addEventListener('message', async (event) => {
  try {
    const { type, data } = event.data;
    
    if (type === 'export') {
      await handleExport(data);
    }
  } catch (error) {
    console.error('[Export Worker] Error processing message:', error);
    
    // Send error back to main thread
    ctx.postMessage({
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

// Handle export operation
async function handleExport(data: any) {
  const { format, vectorPaths, rasterLayers, rasterImageData, textNodes, options } = data;
  
  console.log(`[Export Worker] Received export request for format: ${format}`);
  console.log('[Export Worker] Vector paths:', vectorPaths.length);
  console.log('[Export Worker] Raster layers:', rasterLayers.length);
  console.log('[Export Worker] Has raster image data:', !!rasterImageData);
  console.log('[Export Worker] Text nodes:', textNodes.length);
  console.log('[Export Worker] Options:', options);
  
  try {
    let result;
    
    // Handle each export format using the modular worker implementations
    switch (format) {
      case 'svg':
        result = await exportSvg(vectorPaths, rasterLayers, rasterImageData, textNodes, options);
        break;
        
      case 'png':
        result = await exportPng(vectorPaths, rasterLayers, rasterImageData, textNodes, options);
        break;
        
      case 'jpg':
        result = await exportJpg(vectorPaths, rasterLayers, rasterImageData, textNodes, options);
        break;
        
      case 'pdf':
        result = await exportPdf(vectorPaths, rasterLayers, rasterImageData, textNodes, options);
        break;
        
      case 'ai':
        result = await exportAi(vectorPaths, rasterLayers, rasterImageData, textNodes, options);
        break;
        
      case 'css':
        result = await exportCss(vectorPaths, rasterLayers, rasterImageData, textNodes, options);
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    // Send the result back to the main thread
    console.log(`[Export Worker] ${format.toUpperCase()} export complete`);
    ctx.postMessage({
      type: 'complete',
      data: {
        result: result
      }
    });
  } catch (error) {
    console.error(`[Export Worker] Error in ${format} export:`, error);
    throw error;
  }
}
