/**
 * Raster Export Worker
 * Handles conversion of vector paths, raster images, and text to PNG and JPG formats
 */

import { 
  ExportOptions, PathWithText, findPathsWithText, createTextNodesMap, 
  sendProgress, drawPathToCanvas, drawTextAlongPath 
} from './types';

// PNG export function - creates a PNG with the vector, raster, and text content
export async function exportPng(
  vectorPaths: any[],
  rasterLayers: any[],
  rasterImageData: ImageData | null,
  textNodes: any[],
  options: ExportOptions
): Promise<Uint8Array> {
  try {
    console.log('[Export Worker] Starting PNG export...');
    console.log('[Export Worker] Options:', options);
    console.log('[Export Worker] includeVector:', options.includeVector);
    console.log('[Export Worker] includeRaster:', options.includeRaster);
    console.log('[Export Worker] includeText:', options.includeText);
    console.log('[Export Worker] Vector paths:', vectorPaths.length);
    console.log('[Export Worker] Raster layers:', rasterLayers.length);
    console.log('[Export Worker] Has raster image data:', !!rasterImageData);
    console.log('[Export Worker] Text nodes:', textNodes.length);
    
    sendProgress(0.1, 'Starting PNG export...');
    
    // Get dimensions from image data or set defaults
    const width = rasterImageData?.width || 800;
    const height = rasterImageData?.height || 600;
    
    // Create a canvas to draw on
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get 2D context for PNG canvas');
    }
    
    // Fill with transparent background (PNG supports transparency)
    ctx.clearRect(0, 0, width, height);
    
    sendProgress(0.3, 'Adding raster data...');
    
    // Add raster data if available and requested
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to PNG');
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    sendProgress(0.5, 'Adding vector paths...');
    
    // Add vector paths if requested
    if (options.includeVector && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to PNG, count:', vectorPaths.length);
      
      vectorPaths.forEach((path: any) => {
        drawPathToCanvas(ctx, path);
      });
    }
    
    sendProgress(0.7, 'Adding text...');
    
    // Add text if requested
    if (options.includeText && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to PNG, count:', textNodes.length);
      
      // Find paths with text (text-on-path)
      const pathsWithText: PathWithText[] = findPathsWithText(textNodes, vectorPaths);
      console.log('[Export Worker] Paths with text for PNG:', pathsWithText.length);
      
      // Create a map of text nodes by ID
      const textNodesMap = createTextNodesMap(textNodes);
      
      // First, render standalone text (not attached to paths)
      textNodes.forEach((textNode: any) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some(item => item.textId === textNode.id);
        if (isAttachedToPath) {
          return;
        }
        
        if (textNode.text) {
          try {
            const { text, fontSize = 16, fontFamily = 'Arial', fontWeight = 'normal', fontStyle = 'normal', fill = '#000000', x = 0, y = 0 } = textNode;
            
            // Set text properties
            ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = fill;
            ctx.textBaseline = 'top';
            
            // Draw the text
            ctx.fillText(text, x, y);
            console.log(`[Export Worker] Added standalone text to PNG: '${text}' at (${x}, ${y})`);
          } catch (error) {
            console.error('[Export Worker] Error rendering standalone text in PNG:', error);
          }
        }
      });
      
      // Then, render text along paths
      if (pathsWithText.length > 0) {
        console.log('[Export Worker] Adding text-on-path elements to PNG, count:', pathsWithText.length);
        
        for (const { d, textId, path } of pathsWithText) {
          const textNode = textNodesMap[textId];
          
          if (textNode) {
            try {
              const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
              console.log(`[Export Worker] Processing text-on-path for PNG: '${text}' on path type ${path.type}`);
              
              drawTextAlongPath(
                ctx, 
                path, 
                text, 
                fontSize || 16, 
                fontFamily || 'Arial',
                fontWeight || 'normal',
                fontStyle || 'normal',
                fill || path.strokeColor || '#000'
              );
            } catch (error) {
              console.error('[Export Worker] Error rendering text-on-path for PNG:', error);
            }
          }
        }
      }
    }
    
    sendProgress(0.9, 'Finalizing PNG...');
    
    // Convert canvas to PNG
    try {
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const buffer = await blob.arrayBuffer();
      const pngData = new Uint8Array(buffer);
      
      sendProgress(1.0, 'PNG export complete');
      console.log('[Export Worker] PNG export complete, size:', pngData.length, 'bytes');
      
      return pngData;
    } catch (error) {
      console.error('[Export Worker] Error converting canvas to PNG:', error);
      throw error;
    }
  } catch (error) {
    console.error('[Export Worker] Error in PNG export:', error);
    throw error;
  }
}

// JPG export function - creates a JPG with the vector, raster, and text content
export async function exportJpg(
  vectorPaths: any[],
  rasterLayers: any[],
  rasterImageData: ImageData | null,
  textNodes: any[],
  options: ExportOptions
): Promise<Uint8Array> {
  try {
    console.log('[Export Worker] Starting JPG export...');
    console.log('[Export Worker] Options:', options);
    console.log('[Export Worker] includeVector:', options.includeVector);
    console.log('[Export Worker] includeRaster:', options.includeRaster);
    console.log('[Export Worker] includeText:', options.includeText);
    console.log('[Export Worker] Vector paths:', vectorPaths.length);
    console.log('[Export Worker] Raster layers:', rasterLayers.length);
    console.log('[Export Worker] Has raster image data:', !!rasterImageData);
    console.log('[Export Worker] Text nodes:', textNodes.length);
    
    sendProgress(0.1, 'Starting JPG export...');
    
    // JPG quality from options
    const quality = options.quality / 100;
    console.log('[Export Worker] JPG quality:', quality);
    
    // Get dimensions from image data or set defaults
    const width = rasterImageData?.width || 800;
    const height = rasterImageData?.height || 600;
    
    // Create a canvas to draw on (with alpha disabled for JPG)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      throw new Error('Could not get 2D context for JPG canvas');
    }
    
    // Fill with white background for JPG
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    sendProgress(0.3, 'Adding raster data...');
    
    // Add raster data if available and requested
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to JPG');
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    sendProgress(0.5, 'Adding vector paths...');
    
    // Add vector paths if requested
    if (options.includeVector && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to JPG, count:', vectorPaths.length);
      
      vectorPaths.forEach((path: any) => {
        drawPathToCanvas(ctx, path);
      });
    }
    
    sendProgress(0.7, 'Adding text...');
    
    // Add text if requested
    if (options.includeText && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to JPG, count:', textNodes.length);
      
      // Find paths with text (text-on-path)
      const pathsWithText: PathWithText[] = findPathsWithText(textNodes, vectorPaths);
      console.log('[Export Worker] Paths with text for JPG:', pathsWithText.length);
      
      // Create a map of text nodes by ID
      const textNodesMap = createTextNodesMap(textNodes);
      
      // First, render standalone text (not attached to paths)
      textNodes.forEach((textNode: any) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some(item => item.textId === textNode.id);
        if (isAttachedToPath) {
          return;
        }
        
        if (textNode.text) {
          try {
            const { text, fontSize = 16, fontFamily = 'Arial', fontWeight = 'normal', fontStyle = 'normal', fill = '#000000', x = 0, y = 0 } = textNode;
            
            // Set text properties
            ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = fill;
            ctx.textBaseline = 'top';
            
            // Draw the text
            ctx.fillText(text, x, y);
            console.log(`[Export Worker] Added standalone text to JPG: '${text}' at (${x}, ${y})`);
          } catch (error) {
            console.error('[Export Worker] Error rendering standalone text in JPG:', error);
          }
        }
      });
      
      // Then, render text along paths
      if (pathsWithText.length > 0) {
        console.log('[Export Worker] Adding text-on-path elements to JPG, count:', pathsWithText.length);
        
        for (const { d, textId, path } of pathsWithText) {
          const textNode = textNodesMap[textId];
          
          if (textNode) {
            try {
              const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
              console.log(`[Export Worker] Processing text-on-path for JPG: '${text}' on path type ${path.type}`);
              
              drawTextAlongPath(
                ctx, 
                path, 
                text, 
                fontSize || 16, 
                fontFamily || 'Arial',
                fontWeight || 'normal',
                fontStyle || 'normal',
                fill || path.strokeColor || '#000'
              );
            } catch (error) {
              console.error('[Export Worker] Error rendering text-on-path for JPG:', error);
            }
          }
        }
      }
    }
    
    sendProgress(0.9, 'Finalizing JPG...');
    
    // Convert canvas to JPG with specified quality
    try {
      const blob = await canvas.convertToBlob({ 
        type: 'image/jpeg', 
        quality: quality 
      });
      const buffer = await blob.arrayBuffer();
      const jpgData = new Uint8Array(buffer);
      
      sendProgress(1.0, 'JPG export complete');
      console.log('[Export Worker] JPG export complete, size:', jpgData.length, 'bytes');
      
      return jpgData;
    } catch (error) {
      console.error('[Export Worker] Error converting canvas to JPG:', error);
      throw error;
    }
  } catch (error) {
    console.error('[Export Worker] Error in JPG export:', error);
    throw error;
  }
}
