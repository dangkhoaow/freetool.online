/**
 * Export Worker
 * 
 * Web Worker for handling export operations without blocking the main thread
 * This allows for responsive UI during complex export operations
 */

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

// Worker context
const ctx: Worker = self as any

// Listen for messages from the main thread
ctx.addEventListener('message', (event) => {
  const msg = event.data
  
  if (msg.type === 'export') {
    handleExport(msg)
  }
})

// Handle export operation
async function handleExport(message: ExportMessage) {
  try {
    const { format, options, vectorPaths, rasterLayers, rasterImageData, textNodes } = message.data
    
    // More detailed logging
    console.log(`[Export Worker] Starting ${format.toUpperCase()} export...`);
    console.log(`[Export Worker] Options:`, options);
    console.log(`[Export Worker] includeVector:`, options.includeVector);
    console.log(`[Export Worker] includeRaster:`, options.includeRaster);
    console.log(`[Export Worker] includeText:`, options.includeText);
    console.log(`[Export Worker] Vector paths:`, vectorPaths ? vectorPaths.length : 0);
    console.log(`[Export Worker] Raster layers:`, rasterLayers ? rasterLayers.length : 0);
    console.log(`[Export Worker] Has raster image data:`, !!rasterImageData);
    console.log(`[Export Worker] Text nodes:`, textNodes ? textNodes.length : 0);
    
    // Report starting progress
    sendProgress(0.1, `Starting ${format.toUpperCase()} export...`)
    
    // Based on format, call appropriate export function
    let result
    switch (format.toLowerCase()) {
      case 'svg':
        result = await exportSvg(vectorPaths, textNodes, options, rasterImageData)
        break
      case 'png':
        result = await exportPng(vectorPaths, rasterLayers, rasterImageData, textNodes, options)
        break
      case 'jpg':
        result = await exportJpg(vectorPaths, rasterLayers, rasterImageData, textNodes, options)
        break
      case 'pdf':
        result = await exportPdf(vectorPaths, rasterLayers, rasterImageData, textNodes, options)
        break
      case 'ai':
        result = await exportAi(vectorPaths, rasterLayers, rasterImageData, textNodes, options)
        break
      case 'css':
        result = await exportCss(vectorPaths, textNodes, options)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
    
    // Report completion
    sendProgress(1.0, `${format.toUpperCase()} export complete`)
    console.log(`[Export Worker] ${format.toUpperCase()} export complete`);
    
    // Return the result
    ctx.postMessage({
      type: 'complete',
      data: {
        result
      }
    })
  } catch (error) {
    // Report error
    console.error('[Export Worker] Error:', error);
    ctx.postMessage({
      type: 'error',
      data: {
        message: (error instanceof Error) ? error.message : 'Unknown export error'
      }
    })
  }
}

// Helper function to send progress updates
function sendProgress(progress: number, status?: string) {
  console.log(`[Export Worker] Progress: ${Math.round(progress * 100)}% - ${status || ''}`);
  ctx.postMessage({
    type: 'progress',
    data: {
      progress,
      status
    }
  } as ProgressMessage)
}

// Export functions for each format
async function exportSvg(vectorPaths: any[], textNodes: any[], options: any, rasterImageData: ImageData | null): Promise<string> {
  sendProgress(0.3, 'Generating SVG structure...')
  console.log('[Export Worker] Generating SVG structure...');
  console.log('[Export Worker] Vector paths count:', vectorPaths ? vectorPaths.length : 0);
  console.log('[Export Worker] Include vector:', options.includeVector);
  console.log('[Export Worker] Include raster:', options.includeRaster);
  console.log('[Export Worker] Include text:', options.includeText);
  
  // Get dimensions from options or use defaults
  const width = options.width || 1200;
  const height = options.height || 800;
  
  // Start SVG document
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
`;
  
  // Add background if needed
  if (options.includeBackground) {
    svg += `  <rect width="${width}" height="${height}" fill="white" />\n`;
  }
  
  // Process and add vector paths
  if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
    sendProgress(0.5, 'Processing vector paths...')
    console.log('[Export Worker] Processing vector paths...');
    
    sendProgress(0.6, 'Adding vector paths...')
    console.log('[Export Worker] Adding vector paths...');
    
    for (let i = 0; i < vectorPaths.length; i++) {
      const path = vectorPaths[i];
      console.log(`[Export Worker] Processing path ${i+1}/${vectorPaths.length}:`, path);
      
      try {
        if (path.type === 'path') {
          // Generate SVG path data from points
          if (path.points && path.points.length > 0) {
            let d = `M ${path.points[0].x} ${path.points[0].y}`;
            
            for (let j = 1; j < path.points.length; j++) {
              d += ` L ${path.points[j].x} ${path.points[j].y}`;
            }
            
            if (path.closed) {
              d += ' Z';
            }
            
            svg += `  <path d="${d}" fill="${path.fill || 'transparent'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
          }
        } else if (path.type === 'rect') {
          // Handle rectangles - extract coordinates from points
          if (path.points && path.points.length >= 4) {
            const minX = Math.min(...path.points.map((p: { x: number; y: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { x: number; y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number; y: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { x: number; y: number }) => p.y));
            
            const rectWidth = maxX - minX;
            const rectHeight = maxY - minY;
            
            svg += `  <rect x="${minX}" y="${minY}" width="${rectWidth}" height="${rectHeight}" fill="${path.fill || 'rgba(255, 255, 255, 0.1)'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
          }
        }
        // Other vector types...
      } catch (error) {
        console.error(`[Export Worker] Error processing path ${i}:`, error);
      }
    }
  } else {
    console.log('[Export Worker] Skipping vector paths - includeVector is false or no paths');
  }

  // Process and add raster data if available and requested
  if (options.includeRaster && rasterImageData) {
    sendProgress(0.7, 'Processing raster content...')
    console.log('[Export Worker] Processing raster content...');
    
    try {
      // Create a temporary canvas
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the raster image data
        ctx.putImageData(rasterImageData, 0, 0);
        
        // Convert to a blob
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        
        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        // Add the raster content as an image in the SVG
        svg += `  <image x="0" y="0" width="${width}" height="${height}" href="${base64}" />\n`;
        console.log('[Export Worker] Added raster content as embedded image');
      } else {
        console.error('[Export Worker] Could not get 2D context for raster processing');
      }
    } catch (error) {
      console.error('[Export Worker] Error processing raster content:', error);
    }
  } else {
    console.log('[Export Worker] Skipping raster content - includeRaster is false or no raster data');
  }
  
  // Process and add text nodes
  if (options.includeText && textNodes && textNodes.length > 0) {
    sendProgress(0.8, 'Adding text elements...')
    console.log('[Export Worker] Adding text elements...');
    
    textNodes.forEach((textNode: any) => {
      try {
        const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
        svg += `  <text x="${x}" y="${y}" font-family="${fontFamily || 'Arial'}" font-size="${fontSize || 16}px" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || '#000'}">${text}</text>\n`;
      } catch (error) {
        console.error('[Export Worker] Error processing text node:', error);
      }
    });
  } else {
    console.log('[Export Worker] Skipping text elements - includeText is false or no text nodes');
  }
  
  // Close SVG document
  svg += `</svg>`;
  
  sendProgress(0.9, 'Finalizing SVG...')
  console.log('[Export Worker] SVG generation complete. Size:', svg.length, 'bytes');
  console.log('[Export Worker] SVG preview:', svg.substring(0, 200) + '...');
  
  return svg;
}

async function exportPng(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  sendProgress(0.3, 'Processing vector and raster data for PNG...')
  await simulateProcessing(300)
  
  sendProgress(0.5, 'Rendering layers...')
  await simulateProcessing(300)
  
  // In a real implementation, we would:
  // 1. Create an offscreen canvas
  // 2. Draw the raster data from rasterImageData if available
  // 3. Draw vector paths on top if needed
  // 4. Draw text elements
  // 5. Export as PNG
  
  sendProgress(0.8, 'Encoding PNG...')
  await simulateProcessing(300)
  
  // Return a placeholder binary array
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header + dummy data
}

async function exportJpg(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  sendProgress(0.3, 'Processing vector and raster data for JPG...')
  await simulateProcessing(300)
  
  sendProgress(0.5, 'Rendering layers with quality ' + options.quality + '%...')
  await simulateProcessing(300)
  
  // In a real implementation, we would:
  // 1. Create an offscreen canvas
  // 2. Draw the raster data from rasterImageData if available
  // 3. Draw vector paths on top if needed
  // 4. Draw text elements
  // 5. Export as JPG with the specified quality
  
  sendProgress(0.8, 'Encoding JPG...')
  await simulateProcessing(300)
  
  // Return a placeholder binary array
  return new Uint8Array([255, 216, 255, 224]); // JPG header + dummy data
}

async function exportPdf(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  sendProgress(0.3, 'Processing vector and raster data for PDF...')
  await simulateProcessing(400)
  
  sendProgress(0.5, 'Generating PDF structure...')
  await simulateProcessing(400)
  
  sendProgress(0.7, 'Adding vector and raster elements...')
  await simulateProcessing(400)
  
  sendProgress(0.9, 'Finalizing PDF...')
  await simulateProcessing(400)
  
  // Return a placeholder binary array for PDF
  return new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]); // PDF header + dummy data
}

async function exportAi(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  sendProgress(0.3, 'Processing vector and raster data for AI...')
  await simulateProcessing(500)
  
  sendProgress(0.5, 'Generating AI file structure...')
  await simulateProcessing(400)
  
  sendProgress(0.7, 'Adding vector and raster elements...')
  await simulateProcessing(400)
  
  sendProgress(0.9, 'Finalizing AI file...')
  await simulateProcessing(300)
  
  // Return a placeholder binary array for AI file
  return new Uint8Array([37, 33, 80, 83, 45, 65, 100, 111]); // AI header + dummy data
}

async function exportCss(vectorPaths: any[], textNodes: any[], options: any): Promise<string> {
  sendProgress(0.3, 'Analyzing design elements...')
  await simulateProcessing(400)
  
  sendProgress(0.6, 'Generating CSS...')
  await simulateProcessing(500)
  
  // Return a sample CSS for demo purposes
  return `/* Generated CSS from Browser Design Studio */

.design-container {
  position: relative;
  width: ${options.width || 1200}px;
  height: ${options.height || 800}px;
}

/* This would include CSS for vector shapes and text elements in a real implementation */
`
}

// Helper to simulate processing time for demonstration
function simulateProcessing(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
