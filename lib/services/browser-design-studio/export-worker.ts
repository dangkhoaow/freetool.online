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
  
  // Define interface for path-text relationship
  interface PathWithText {
    pathId: string;
    textId: string;
    path: any;
    d: string;
  }
  
  // Store paths that have associated text for later reference
  const pathsWithText: PathWithText[] = [];
  
  // Process and add vector paths
  if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
    sendProgress(0.5, 'Processing vector paths...')
    console.log('[Export Worker] Processing vector paths...');
    
    sendProgress(0.6, 'Adding vector paths...')
    console.log('[Export Worker] Adding vector paths...');
    
    // Add a defs section to store paths for text-on-path
    svg += `  <defs>\n`;
    
    // Process all paths first to identify those with text
    for (let i = 0; i < vectorPaths.length; i++) {
      const path = vectorPaths[i];
      console.log(`[Export Worker] Pre-processing path ${i}/${vectorPaths.length}:`, path);
      console.log(`[Export Worker] Path type: ${path.type}, has textId: ${!!path.textId}, id: ${path.id}`);
      
      if (path.textId) {
        try {
          const pathId = `path-${i}`;
          let d = '';
          
          if (path.type === 'path' && path.points && path.points.length > 0) {
            d = `M ${path.points[0].x} ${path.points[0].y}`;
            
            for (let j = 1; j < path.points.length; j++) {
              d += ` L ${path.points[j].x} ${path.points[j].y}`;
            }
            
            if (path.closed) {
              d += ' Z';
            }
          } else if (path.type === 'circle' && path.points && path.points.length > 0) {
            // For circles, calculate center and radius from points
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radiusX = (maxX - minX) / 2;
            const radiusY = (maxY - minY) / 2;
            
            // Use elliptical arc for circle path definition
            d = `M ${centerX + radiusX} ${centerY} `;
            d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} `;
            d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
          } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
            // For rectangles, use the points to define a path
            const minX = Math.min(...path.points.map((p: { x: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { y: number }) => p.y));
            
            d = `M ${minX} ${minY} L ${maxX} ${minY} L ${maxX} ${maxY} L ${minX} ${maxY} Z`;
          } else if (path.type === 'ellipse' && path.points && path.points.length > 0) {
            // For ellipses, calculate center and radius from points
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radiusX = (maxX - minX) / 2;
            const radiusY = (maxY - minY) / 2;
            
            // Use elliptical arc for ellipse path definition
            d = `M ${centerX + radiusX} ${centerY} `;
            d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} `;
            d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
          } else if (path.points && path.points.length > 0) {
            // For any other shape with points, create a path
            d = `M ${path.points[0].x} ${path.points[0].y}`;
            
            for (let j = 1; j < path.points.length; j++) {
              d += ` L ${path.points[j].x} ${path.points[j].y}`;
            }
            
            if (path.closed) {
              d += ' Z';
            }
          }
          
          if (d) {
            // Only add to defs if we were able to create a valid path
            console.log(`[Export Worker] Adding path to defs with id: ${pathId}`);
            svg += `    <path id="${pathId}" d="${d}" />\n`;
            
            pathsWithText.push({
              pathId,
              textId: path.textId,
              path,
              d
            });
          } else {
            console.error(`[Export Worker] Could not generate path data for path ${i} with textId ${path.textId}`);
          }
        } catch (error) {
          console.error(`[Export Worker] Error processing path ${i} for text:`, error);
        }
      }
    }
    
    // Close defs section after adding all path definitions
    svg += `  </defs>\n`;
    
    // Now add the visible paths
    for (let i = 0; i < vectorPaths.length; i++) {
      const path = vectorPaths[i];
      console.log(`[Export Worker] Rendering visible path ${i+1}/${vectorPaths.length}:`, path);
      
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
            
            // Always add the visible path element (whether it has text or not)
            svg += `  <path d="${d}" fill="${path.fill || 'transparent'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
          }
        } else if (path.type === 'circle') {
          // Handle circles - extract coordinates from points
          if (path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radiusX = (maxX - minX) / 2;
            const radiusY = (maxY - minY) / 2;
            
            svg += `  <circle cx="${centerX}" cy="${centerY}" r="${radiusX}" fill="${path.fill || 'rgba(255, 255, 255, 0.1)'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
          }
        } else if (path.type === 'rect') {
          // Handle rectangles - extract coordinates from points
          if (path.points && path.points.length >= 4) {
            const minX = Math.min(...path.points.map((p: { x: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { y: number }) => p.y));
            
            const rectWidth = maxX - minX;
            const rectHeight = maxY - minY;
            
            svg += `  <rect x="${minX}" y="${minY}" width="${rectWidth}" height="${rectHeight}" fill="${path.fill || 'rgba(255, 255, 255, 0.1)'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
          }
        } else if (path.type === 'ellipse') {
          // Handle ellipses - extract coordinates from points
          if (path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radiusX = (maxX - minX) / 2;
            const radiusY = (maxY - minY) / 2;
            
            svg += `  <ellipse cx="${centerX}" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" fill="${path.fill || 'rgba(255, 255, 255, 0.1)'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
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
    
    // First, create a map of text nodes by id for easier lookup
    const textNodesMap = textNodes.reduce((map: Record<string, any>, node: any) => {
      if (node.id) {
        map[node.id] = node;
      }
      return map;
    }, {});
    
    console.log('[Export Worker] Text nodes map created:', Object.keys(textNodesMap));
    
    // Add text paths (text attached to paths)
    if (pathsWithText.length > 0) {
      console.log('[Export Worker] Adding text-on-path elements. Count:', pathsWithText.length);
      
      pathsWithText.forEach(({ pathId, textId, path, d }: PathWithText) => {
        const textNode = textNodesMap[textId];
        
        if (textNode) {
          console.log(`[Export Worker] Adding text-on-path for textId: ${textId}, pathId: ${pathId}`);
          const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
          
          // Calculate text properties based on path length
          // This is important for distributing text properly along the path
          const letterSpacing = path.letterSpacing || 'normal';
          
          svg += `  <text font-family="${fontFamily || 'Arial'}" font-size="${fontSize || 16}px" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || path.strokeColor || '#000'}" letter-spacing="${letterSpacing}">\n`;
          
          // Adjust startOffset and method based on path type
          let startOffset = '0%';
          if (path.type === 'circle') {
            // For circles, we often want to start at the top
            startOffset = '25%';
          }
          
          // Add textPath with the correct reference and text content
          svg += `    <textPath href="#${pathId}" startOffset="${startOffset}" method="align" spacing="auto">${text}</textPath>\n`;
          svg += `  </text>\n`;
          
          console.log(`[Export Worker] Added textPath with text: ${text}`);
        } else {
          console.error(`[Export Worker] Could not find text node with id: ${textId}`);
        }
      });
    } else {
      console.log('[Export Worker] No text-on-path elements to add');
    }
    
    // Add standalone text nodes (not attached to paths)
    textNodes.forEach((textNode: any) => {
      // Skip text nodes that are already attached to paths
      const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
      
      if (!isAttachedToPath) {
        try {
          const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill, id } = textNode;
          console.log(`[Export Worker] Adding standalone text node: ${id}`);
          svg += `  <text x="${x}" y="${y}" font-family="${fontFamily || 'Arial'}" font-size="${fontSize || 16}px" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || '#000'}">${text}</text>\n`;
        } catch (error) {
          console.error('[Export Worker] Error processing standalone text node:', error);
        }
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
  console.log('[Export Worker] Starting PNG generation with options:', options);
  sendProgress(0.3, 'Processing vector and raster data for PNG...')
  
  // Get dimensions from options or use defaults
  const width = options.width || 1200;
  const height = options.height || 800;
  
  try {
    // Create an offscreen canvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    
    // Clear canvas with white background if required
    if (options.includeBackground) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Make transparent by clearing
      ctx.clearRect(0, 0, width, height);
    }
    
    sendProgress(0.4, 'Adding raster layers...')
    // Add raster layers if available
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to PNG export');
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    // Define interface for path-text relationship
    interface PathWithText {
      d: string;
      textId: string;
      path: any;
    }
    
    // Store paths with text for later processing
    const pathsWithText: PathWithText[] = [];
    
    sendProgress(0.5, 'Rendering vector paths...')
    // Add vector paths if specified
    if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to PNG export, count:', vectorPaths.length);
      
      // First, prepare paths for text rendering
      for (let i = 0; i < vectorPaths.length; i++) {
        const path = vectorPaths[i];
        
        if (path.textId) {
          try {
            let d = '';
            
            if (path.type === 'path' && path.points && path.points.length > 0) {
              d = `M ${path.points[0].x} ${path.points[0].y}`;
              
              for (let j = 1; j < path.points.length; j++) {
                d += ` L ${path.points[j].x} ${path.points[j].y}`;
              }
              
              if (path.closed) {
                d += ' Z';
              }
            } else if (path.type === 'circle' && path.points && path.points.length > 0) {
              // For circles, calculate center and radius
              const xValues = path.points.map((p: { x: number }) => p.x);
              const yValues = path.points.map((p: { y: number }) => p.y);
              const minX = Math.min(...xValues);
              const maxX = Math.max(...xValues);
              const minY = Math.min(...yValues);
              const maxY = Math.max(...yValues);
              
              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;
              const radiusX = (maxX - minX) / 2;
              const radiusY = (maxY - minY) / 2;
              
              // Use arc for circle path definition
              d = `M ${centerX + radiusX} ${centerY} `;
              d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} `;
              d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
            } else if (path.points && path.points.length > 0) {
              // For any other shape with points
              d = `M ${path.points[0].x} ${path.points[0].y}`;
              
              for (let j = 1; j < path.points.length; j++) {
                d += ` L ${path.points[j].x} ${path.points[j].y}`;
              }
              
              if (path.closed) {
                d += ' Z';
              }
            }
            
            if (d) {
              pathsWithText.push({
                d,
                textId: path.textId,
                path
              });
              console.log(`[Export Worker] Identified path with text for PNG: path ${i}, textId: ${path.textId}`);
            }
          } catch (error) {
            console.error(`[Export Worker] Error processing path ${i} for text in PNG:`, error);
          }
        }
        
        // Draw all vector paths
        try {
          ctx.beginPath();
          
          if (path.type === 'path' && path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            
            if (path.closed) {
              ctx.closePath();
            }
          } else if (path.type === 'circle' && path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radius = (maxX - minX) / 2;
            
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
            const minX = Math.min(...path.points.map((p: { x: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { y: number }) => p.y));
            
            const rectWidth = maxX - minX;
            const rectHeight = maxY - minY;
            
            ctx.rect(minX, minY, rectWidth, rectHeight);
          } else if (path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            
            if (path.closed) {
              ctx.closePath();
            }
          }
          
          // Apply stroke and fill styles
          if (path.fill && path.fill !== 'transparent') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }
          
          ctx.strokeStyle = path.strokeColor || '#000';
          ctx.lineWidth = path.strokeWidth || 1;
          if (path.opacity !== undefined) {
            ctx.globalAlpha = path.opacity;
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0; // Reset alpha
          
        } catch (error) {
          console.error(`[Export Worker] Error rendering path ${i} for PNG:`, error);
        }
      }
    }
    
    sendProgress(0.7, 'Adding text elements...')
    // Add text elements if specified
    if (options.includeText && textNodes && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to PNG export, count:', textNodes.length);
      
      // First, create a map of text nodes by id for easier lookup
      const textNodesMap = textNodes.reduce((map: Record<string, any>, node: any) => {
        if (node.id) {
          map[node.id] = node;
        }
        return map;
      }, {});
      
      // First, render standalone text not attached to paths
      textNodes.forEach((textNode: any, index: number) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
        
        if (!isAttachedToPath) {
          try {
            const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
            
            // Set text properties
            ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
            ctx.fillStyle = fill || '#000';
            ctx.textBaseline = 'top';
            
            // Draw text
            ctx.fillText(text, x, y);
            console.log(`[Export Worker] Added standalone text to PNG: ${text}`);
          } catch (error) {
            console.error(`[Export Worker] Error rendering text node ${index} for PNG:`, error);
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
              
              // Create a Path2D object for the path
              const pathObj = new Path2D(d);
              
              // Set text properties
              ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
              ctx.fillStyle = fill || path.strokeColor || '#000';
              
              // Draw text along the path (basic implementation)
              // For a complex implementation, we'd need to actually calculate positions along the path
              // For now, just place the text at the start of the path
              const pathStartX = path.points[0].x;
              const pathStartY = path.points[0].y;
              
              // Draw the text - this is a simplified version
              // In a real implementation, we'd calculate positions along the curve
              ctx.save();
              ctx.translate(pathStartX, pathStartY);
              
              // If it's a circle, we need to rotate and position differently
              if (path.type === 'circle') {
                const xValues = path.points.map((p: { x: number }) => p.x);
                const yValues = path.points.map((p: { y: number }) => p.y);
                const minX = Math.min(...xValues);
                const maxX = Math.max(...xValues);
                const minY = Math.min(...yValues);
                const maxY = Math.max(...yValues);
                
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                
                // Draw text in arc around circle
                const radius = (maxX - minX) / 2;
                const circumference = 2 * Math.PI * radius;
                const textLength = text.length;
                const charSpacing = circumference / (textLength * 2); // Space out the characters
                
                for (let i = 0; i < textLength; i++) {
                  const angle = (i / textLength) * Math.PI * 2;
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.rotate(angle + Math.PI / 2); // Rotate 90 degrees + angle
                  ctx.fillText(text[i], 0, 0);
                  ctx.restore();
                }
              } else {
                // For other path types, just draw along the starting point
                ctx.fillText(text, 0, 0);
              }
              
              ctx.restore();
              console.log(`[Export Worker] Added text-on-path to PNG: ${text}`);
              
            } catch (error) {
              console.error(`[Export Worker] Error rendering text-on-path for PNG:`, error);
            }
          }
        }
      }
    }
    
    sendProgress(0.8, 'Encoding PNG...')
    console.log('[Export Worker] Finalizing PNG');
    
    // Convert to PNG
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const buffer = await blob.arrayBuffer();
    
    console.log('[Export Worker] PNG generation complete. Size:', buffer.byteLength, 'bytes');
    return new Uint8Array(buffer);
    
  } catch (error) {
    console.error('[Export Worker] Error generating PNG:', error);
    throw error;
  }
}

async function exportJpg(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  console.log('[Export Worker] Starting JPG generation with options:', options);
  sendProgress(0.3, 'Processing vector and raster data for JPG...')
  
  // Get dimensions from options or use defaults
  const width = options.width || 1200;
  const height = options.height || 800;
  const quality = options.quality !== undefined ? options.quality / 100 : 0.9;
  
  try {
    // Create an offscreen canvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: false }); // Use non-alpha context for JPG
    
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    
    // Ensure white background by filling the entire canvas
    console.log('[Export Worker] Setting white background for JPG export');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    sendProgress(0.4, 'Adding raster layers...')
    // Add raster layers if available
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to JPG export');
      
      // Create a temporary canvas for the raster data to ensure alpha compositing
      const tempCanvas = new OffscreenCanvas(width, height);
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Fill with white first (JPG background)
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, width, height);
        
        // Then add the raster data
        tempCtx.putImageData(rasterImageData, 0, 0);
        
        // Draw the temp canvas to our main canvas
        ctx.drawImage(tempCanvas, 0, 0);
      } else {
        // Fallback to direct putImageData if temp context fails
        ctx.putImageData(rasterImageData, 0, 0);
      }
    }
    
    // Define interface for path-text relationship
    interface PathWithText {
      d: string;
      textId: string;
      path: any;
    }
    
    // Store paths with text for later processing
    const pathsWithText: PathWithText[] = [];
    
    sendProgress(0.5, 'Rendering vector paths...')
    // Add vector paths if specified
    if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to JPG export, count:', vectorPaths.length);
      
      // First, prepare paths for text rendering
      for (let i = 0; i < vectorPaths.length; i++) {
        const path = vectorPaths[i];
        
        if (path.textId) {
          try {
            let d = '';
            
            if (path.type === 'path' && path.points && path.points.length > 0) {
              d = `M ${path.points[0].x} ${path.points[0].y}`;
              
              for (let j = 1; j < path.points.length; j++) {
                d += ` L ${path.points[j].x} ${path.points[j].y}`;
              }
              
              if (path.closed) {
                d += ' Z';
              }
            } else if (path.type === 'circle' && path.points && path.points.length > 0) {
              // For circles, calculate center and radius
              const xValues = path.points.map((p: { x: number }) => p.x);
              const yValues = path.points.map((p: { y: number }) => p.y);
              const minX = Math.min(...xValues);
              const maxX = Math.max(...xValues);
              const minY = Math.min(...yValues);
              const maxY = Math.max(...yValues);
              
              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;
              const radiusX = (maxX - minX) / 2;
              const radiusY = (maxY - minY) / 2;
              
              // Use arc for circle path definition
              d = `M ${centerX + radiusX} ${centerY} `;
              d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} `;
              d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
            } else if (path.points && path.points.length > 0) {
              // For any other shape with points
              d = `M ${path.points[0].x} ${path.points[0].y}`;
              
              for (let j = 1; j < path.points.length; j++) {
                d += ` L ${path.points[j].x} ${path.points[j].y}`;
              }
              
              if (path.closed) {
                d += ' Z';
              }
            }
            
            if (d) {
              pathsWithText.push({
                d,
                textId: path.textId,
                path
              });
              console.log(`[Export Worker] Identified path with text for JPG: path ${i}, textId: ${path.textId}`);
            }
          } catch (error) {
            console.error(`[Export Worker] Error processing path ${i} for text in JPG:`, error);
          }
        }
        
        // Draw all vector paths
        try {
          ctx.beginPath();
          
          if (path.type === 'path' && path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            
            if (path.closed) {
              ctx.closePath();
            }
          } else if (path.type === 'circle' && path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radius = (maxX - minX) / 2;
            
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
            const minX = Math.min(...path.points.map((p: { x: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { y: number }) => p.y));
            
            const rectWidth = maxX - minX;
            const rectHeight = maxY - minY;
            
            ctx.rect(minX, minY, rectWidth, rectHeight);
          } else if (path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            
            if (path.closed) {
              ctx.closePath();
            }
          }
          
          // Apply stroke and fill styles
          if (path.fill && path.fill !== 'transparent') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }
          
          ctx.strokeStyle = path.strokeColor || '#000';
          ctx.lineWidth = path.strokeWidth || 1;
          if (path.opacity !== undefined) {
            ctx.globalAlpha = path.opacity;
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0; // Reset alpha
          
        } catch (error) {
          console.error(`[Export Worker] Error rendering path ${i} for JPG:`, error);
        }
      }
    }
    
    sendProgress(0.7, 'Adding text elements...')
    // Add text elements if specified - using the same logic as PNG
    if (options.includeText && textNodes && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to JPG export, count:', textNodes.length);
      
      // First, create a map of text nodes by id for easier lookup
      const textNodesMap = textNodes.reduce((map: Record<string, any>, node: any) => {
        if (node.id) {
          map[node.id] = node;
        }
        return map;
      }, {});
      
      // First, render standalone text not attached to paths
      textNodes.forEach((textNode: any, index: number) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
        
        if (!isAttachedToPath) {
          try {
            const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
            
            // Set text properties
            ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
            ctx.fillStyle = fill || '#000';
            ctx.textBaseline = 'top';
            
            // Draw text
            ctx.fillText(text, x, y);
            console.log(`[Export Worker] Added standalone text to JPG: ${text}`);
          } catch (error) {
            console.error(`[Export Worker] Error rendering text node ${index} for JPG:`, error);
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
              
              // Create a Path2D object for the path
              const pathObj = new Path2D(d);
              
              // Set text properties
              ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
              ctx.fillStyle = fill || path.strokeColor || '#000';
              
              // Draw text along the path (simplified implementation)
              const pathStartX = path.points[0].x;
              const pathStartY = path.points[0].y;
              
              ctx.save();
              ctx.translate(pathStartX, pathStartY);
              
              if (path.type === 'circle') {
                const xValues = path.points.map((p: { x: number }) => p.x);
                const yValues = path.points.map((p: { y: number }) => p.y);
                const minX = Math.min(...xValues);
                const maxX = Math.max(...xValues);
                const minY = Math.min(...yValues);
                const maxY = Math.max(...yValues);
                
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                
                // Draw text in arc around circle
                const radius = (maxX - minX) / 2;
                const circumference = 2 * Math.PI * radius;
                const textLength = text.length;
                const charSpacing = circumference / (textLength * 2);
                
                for (let i = 0; i < textLength; i++) {
                  const angle = (i / textLength) * Math.PI * 2;
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.rotate(angle + Math.PI / 2);
                  ctx.fillText(text[i], 0, 0);
                  ctx.restore();
                }
              } else {
                // For other path types, just draw along the starting point
                ctx.fillText(text, 0, 0);
              }
              
              ctx.restore();
              console.log(`[Export Worker] Added text-on-path to JPG: ${text}`);
              
            } catch (error) {
              console.error(`[Export Worker] Error rendering text-on-path for JPG:`, error);
            }
          }
        }
      }
    }
    
    sendProgress(0.8, 'Encoding JPG...')
    console.log('[Export Worker] Finalizing JPG with quality', quality);
    
    // Convert to JPG with specified quality
    const blob = await canvas.convertToBlob({ 
      type: 'image/jpeg',
      quality: quality
    });
    const buffer = await blob.arrayBuffer();
    
    console.log('[Export Worker] JPG generation complete. Size:', buffer.byteLength, 'bytes');
    return new Uint8Array(buffer);
    
  } catch (error) {
    console.error('[Export Worker] Error generating JPG:', error);
    throw error;
  }
}

async function exportPdf(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  console.log('[Export Worker] Starting PDF generation with options:', options);
  sendProgress(0.3, 'Processing vector and raster data for PDF...')
  
  // Get dimensions from options or use defaults
  const width = options.width || 1200;
  const height = options.height || 800;
  
  try {
    sendProgress(0.5, 'Generating PDF structure...')
    console.log('[Export Worker] Generating PDF structure');
    
    // Strategy: Generate a PNG image of the design and embed it in a PDF
    // First, render everything to a canvas (same as PNG export)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    
    // Clear canvas with white background if required
    if (options.includeBackground) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Make transparent by clearing
      ctx.clearRect(0, 0, width, height);
    }
    
    // Add raster layers if available
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to PDF');
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    // Define interface for path-text relationship
    interface PathWithText {
      d: string;
      textId: string;
      path: any;
    }
    
    // Store paths with text for later processing
    const pathsWithText: PathWithText[] = [];
    
    sendProgress(0.7, 'Adding vector and raster elements...')
    // Add vector paths if specified
    if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to PDF, count:', vectorPaths.length);
      
      // First, prepare paths for text rendering
      for (let i = 0; i < vectorPaths.length; i++) {
        const path = vectorPaths[i];
        
        if (path.textId) {
          try {
            let d = '';
            
            if (path.type === 'path' && path.points && path.points.length > 0) {
              d = `M ${path.points[0].x} ${path.points[0].y}`;
              
              for (let j = 1; j < path.points.length; j++) {
                d += ` L ${path.points[j].x} ${path.points[j].y}`;
              }
              
              if (path.closed) {
                d += ' Z';
              }
            } else if (path.type === 'circle' && path.points && path.points.length > 0) {
              // For circles, calculate center and radius
              const xValues = path.points.map((p: { x: number }) => p.x);
              const yValues = path.points.map((p: { y: number }) => p.y);
              const minX = Math.min(...xValues);
              const maxX = Math.max(...xValues);
              const minY = Math.min(...yValues);
              const maxY = Math.max(...yValues);
              
              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;
              const radiusX = (maxX - minX) / 2;
              const radiusY = (maxY - minY) / 2;
              
              // Use arc for circle path definition
              d = `M ${centerX + radiusX} ${centerY} `;
              d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} `;
              d += `A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
            } else if (path.points && path.points.length > 0) {
              // For any other shape with points
              d = `M ${path.points[0].x} ${path.points[0].y}`;
              
              for (let j = 1; j < path.points.length; j++) {
                d += ` L ${path.points[j].x} ${path.points[j].y}`;
              }
              
              if (path.closed) {
                d += ' Z';
              }
            }
            
            if (d) {
              pathsWithText.push({
                d,
                textId: path.textId,
                path
              });
              console.log(`[Export Worker] Identified path with text for PDF: path ${i}, textId: ${path.textId}`);
            }
          } catch (error) {
            console.error(`[Export Worker] Error processing path ${i} for text in PDF:`, error);
          }
        }
        
        // Draw all vector paths
        try {
          ctx.beginPath();
          
          if (path.type === 'path' && path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            
            if (path.closed) {
              ctx.closePath();
            }
          } else if (path.type === 'circle' && path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radius = (maxX - minX) / 2;
            
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
            const minX = Math.min(...path.points.map((p: { x: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { y: number }) => p.y));
            
            const rectWidth = maxX - minX;
            const rectHeight = maxY - minY;
            
            ctx.rect(minX, minY, rectWidth, rectHeight);
          } else if (path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            
            if (path.closed) {
              ctx.closePath();
            }
          }
          
          // Apply stroke and fill styles
          if (path.fill && path.fill !== 'transparent') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }
          
          ctx.strokeStyle = path.strokeColor || '#000';
          ctx.lineWidth = path.strokeWidth || 1;
          if (path.opacity !== undefined) {
            ctx.globalAlpha = path.opacity;
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0; // Reset alpha
          
        } catch (error) {
          console.error(`[Export Worker] Error rendering path ${i} for PDF:`, error);
        }
      }
    }
    
    // Add text elements if specified
    if (options.includeText && textNodes && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to PDF, count:', textNodes.length);
      
      // First, create a map of text nodes by id for easier lookup
      const textNodesMap = textNodes.reduce((map: Record<string, any>, node: any) => {
        if (node.id) {
          map[node.id] = node;
        }
        return map;
      }, {});
      
      // Render standalone text (not attached to paths)
      textNodes.forEach((textNode: any, index: number) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
        
        if (!isAttachedToPath) {
          try {
            const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
            
            // Set text properties
            ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
            ctx.fillStyle = fill || '#000';
            ctx.textBaseline = 'top';
            
            // Draw text
            ctx.fillText(text, x, y);
            console.log(`[Export Worker] Added standalone text to PDF: ${text}`);
          } catch (error) {
            console.error(`[Export Worker] Error rendering text node ${index} for PDF:`, error);
          }
        }
      });
      
      // Render text along paths
      if (pathsWithText.length > 0) {
        console.log('[Export Worker] Adding text-on-path elements to PDF, count:', pathsWithText.length);
        
        for (const { d, textId, path } of pathsWithText) {
          const textNode = textNodesMap[textId];
          
          if (textNode) {
            try {
              const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
              console.log(`[Export Worker] Processing text-on-path for PDF: '${text}' on path type ${path.type}`);
              
              // Set text properties
              ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
              ctx.fillStyle = fill || path.strokeColor || '#000';
              
              // Draw text along the path (simplified implementation)
              const pathStartX = path.points[0].x;
              const pathStartY = path.points[0].y;
              
              ctx.save();
              ctx.translate(pathStartX, pathStartY);
              
              if (path.type === 'circle') {
                const xValues = path.points.map((p: { x: number }) => p.x);
                const yValues = path.points.map((p: { y: number }) => p.y);
                const minX = Math.min(...xValues);
                const maxX = Math.max(...xValues);
                const minY = Math.min(...yValues);
                const maxY = Math.max(...yValues);
                
                const centerX = (minX + maxX) / 2 - pathStartX;
                const centerY = (minY + maxY) / 2 - pathStartY;
                
                // Draw text in arc around circle
                const radius = (maxX - minX) / 2;
                const circumference = 2 * Math.PI * radius;
                const textLength = text.length;
                const charSpacing = circumference / (textLength * 2);
                
                for (let i = 0; i < textLength; i++) {
                  const angle = (i / textLength) * Math.PI * 2;
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.rotate(angle + Math.PI / 2);
                  ctx.fillText(text[i], 0, 0);
                  ctx.restore();
                }
              } else {
                // For other path types, just draw along the starting point
                ctx.fillText(text, 0, 0);
              }
              
              ctx.restore();
              console.log(`[Export Worker] Added text-on-path to PDF: ${text}`);
              
            } catch (error) {
              console.error(`[Export Worker] Error rendering text-on-path for PDF:`, error);
            }
          }
        }
      }
    }
    
    // Convert canvas to PNG for embedding in PDF
    const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
    const pngArrayBuffer = await pngBlob.arrayBuffer();
    const pngBase64 = btoa(
      Array.from(new Uint8Array(pngArrayBuffer))
        .map(b => String.fromCharCode(b))
        .join('')
    );
    
    sendProgress(0.9, 'Finalizing PDF...')
    console.log('[Export Worker] Creating PDF with embedded PNG');
    
    // Create a simple PDF document with the embedded image
    // This is a simplified PDF structure - a production implementation would use a proper PDF library
    const pdfTemplate = `
%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj

2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj

3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /XObject <<
      /Img1 4 0 R
    >>
  >>
  /MediaBox [0 0 ${width} ${height}]
  /Contents 5 0 R
>>
endobj

4 0 obj
<<
  /Type /XObject
  /Subtype /Image
  /Width ${width}
  /Height ${height}
  /ColorSpace /DeviceRGB
  /BitsPerComponent 8
  /Filter /DCTDecode
  /Length ${pngArrayBuffer.byteLength}
>>
stream
${pngBase64}
endstream
endobj

5 0 obj
<<
  /Length 44
>>
stream
q
${width} 0 0 ${height} 0 0 cm
/Img1 Do
Q
endstream
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000058 00000 n
0000000115 00000 n
0000000263 00000 n
0000000495 00000 n
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
591
%%EOF
`;
    
    // Convert the PDF string to a Uint8Array
    const pdfBytes = new TextEncoder().encode(pdfTemplate);
    
    console.log('[Export Worker] PDF generation complete. Size:', pdfBytes.length, 'bytes');
    return pdfBytes;
    
  } catch (error) {
    console.error('[Export Worker] Error generating PDF:', error);
    throw error;
  }
}

async function exportAi(
  vectorPaths: any[], 
  rasterLayers: any[], 
  rasterImageData: ImageData | null,
  textNodes: any[], 
  options: any
): Promise<Uint8Array> {
  console.log('[Export Worker] Starting AI export with options:', options);
  sendProgress(0.3, 'Processing vector and raster data for AI...')
  
  // Get dimensions from options or use defaults
  const width = options.width || 1200;
  const height = options.height || 800;
  
  try {
    sendProgress(0.5, 'Generating AI file structure...')
    console.log('[Export Worker] Generating AI file structure');
    
    // AI files are based on the PDF format, with additional metadata
    // First, render the design to a canvas as we did for PDF
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    
    // Clear canvas with white background if required
    if (options.includeBackground) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
    
    // Add raster layers if available
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to AI file');
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    // Define interface for path-text relationship
    interface PathWithText {
      d: string;
      textId: string;
      path: any;
    }
    
    // Store paths with text for later processing
    const pathsWithText: PathWithText[] = [];
    
    // Process vector paths
    let aiPathsData = '';
    let svgPathsData = '';
    
    sendProgress(0.7, 'Adding vector and raster elements...')
    // Add vector paths if specified
    if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to AI file, count:', vectorPaths.length);
      
      // First, generate SVG data for all paths
      for (let i = 0; i < vectorPaths.length; i++) {
        const path = vectorPaths[i];
        
        try {
          // Draw all vector paths on canvas
          ctx.beginPath();
          
          let pathData = '';
          
          if (path.type === 'path' && path.points && path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            pathData = `M ${path.points[0].x} ${path.points[0].y}`;
            
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
              pathData += ` L ${path.points[j].x} ${path.points[j].y}`;
            }
            
            if (path.closed) {
              ctx.closePath();
              pathData += ' Z';
            }
          } else if (path.type === 'circle' && path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radius = (maxX - minX) / 2;
            
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            
            // Create elliptical arc path for SVG
            pathData = `M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`;
          } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
            const minX = Math.min(...path.points.map((p: { x: number }) => p.x));
            const minY = Math.min(...path.points.map((p: { y: number }) => p.y));
            const maxX = Math.max(...path.points.map((p: { x: number }) => p.x));
            const maxY = Math.max(...path.points.map((p: { y: number }) => p.y));
            
            const rectWidth = maxX - minX;
            const rectHeight = maxY - minY;
            
            ctx.rect(minX, minY, rectWidth, rectHeight);
            
            // Create rect path for SVG
            pathData = `M ${minX} ${minY} L ${maxX} ${minY} L ${maxX} ${maxY} L ${minX} ${maxY} Z`;
          }
          
          // Apply stroke and fill styles
          if (path.fill && path.fill !== 'transparent') {
            ctx.fillStyle = path.fill;
            ctx.fill();
          }
          
          ctx.strokeStyle = path.strokeColor || '#000';
          ctx.lineWidth = path.strokeWidth || 1;
          if (path.opacity !== undefined) {
            ctx.globalAlpha = path.opacity;
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0; // Reset alpha
          
          // Add to SVG data
          if (pathData) {
            svgPathsData += `<path d="${pathData}" fill="${path.fill || 'none'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
            
            // Add to AI paths data
            aiPathsData += `%AI5_Path: ${i}\n`;
            aiPathsData += `${pathData}\n`;
            aiPathsData += `${path.fill ? 'f' : 'n'} ${path.strokeColor ? 'S' : 'n'}\n`;
            
            // If this path has text, save it for later text processing
            if (path.textId) {
              pathsWithText.push({
                d: pathData,
                textId: path.textId,
                path
              });
              console.log(`[Export Worker] Identified path with text for AI: path ${i}, textId: ${path.textId}`);
            }
          }
        } catch (error) {
          console.error(`[Export Worker] Error processing path ${i} for AI:`, error);
        }
      }
    }
    
    // Process text nodes
    let aiTextData = '';
    let svgTextData = '';
    
    if (options.includeText && textNodes && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to AI file, count:', textNodes.length);
      
      // Create a map of text nodes by id for easier lookup
      const textNodesMap = textNodes.reduce((map: Record<string, any>, node: any) => {
        if (node.id) {
          map[node.id] = node;
        }
        return map;
      }, {});
      
      // Process standalone text (not attached to paths)
      textNodes.forEach((textNode: any, index: number) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
        
        if (!isAttachedToPath) {
          try {
            const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
            
            // Draw text on canvas
            ctx.font = `${fontWeight || 'normal'} ${fontStyle || 'normal'} ${fontSize || 16}px ${fontFamily || 'Arial'}`;
            ctx.fillStyle = fill || '#000';
            ctx.textBaseline = 'top';
            ctx.fillText(text, x, y);
            
            // Add to SVG text data
            svgTextData += `<text x="${x}" y="${y}" font-family="${fontFamily || 'Arial'}" font-size="${fontSize || 16}" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || '#000'}">${text}</text>\n`;
            
            // Add to AI text data
            aiTextData += `%AI5_Text: ${index}\n`;
            aiTextData += `(${text}) ${x} ${y} T\n`;
            aiTextData += `(${fontFamily || 'Arial'}) ${fontSize || 16} F\n`;
            
            console.log(`[Export Worker] Added standalone text to AI: ${text}`);
          } catch (error) {
            console.error(`[Export Worker] Error rendering text node ${index} for AI:`, error);
          }
        }
      });
      
      // Process text-on-path (more complex in AI format)
      if (pathsWithText.length > 0) {
        console.log('[Export Worker] Adding text-on-path elements to AI, count:', pathsWithText.length);
        
        pathsWithText.forEach(({ d, textId, path }, index) => {
          const textNode = textNodesMap[textId];
          
          if (textNode) {
            try {
              const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
              
              // Add to SVG data (simplified for now)
              svgTextData += `<text font-family="${fontFamily || 'Arial'}" font-size="${fontSize || 16}" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || path.strokeColor || '#000'}">\n`;
              svgTextData += `  <textPath href="#path-${index}">${text}</textPath>\n`;
              svgTextData += `</text>\n`;
              
              // Add to AI text data (simplified)
              aiTextData += `%AI5_TextOnPath: ${index}\n`;
              aiTextData += `(${text}) Path:${index} T\n`;
              aiTextData += `(${fontFamily || 'Arial'}) ${fontSize || 16} F\n`;
              
              console.log(`[Export Worker] Added text-on-path to AI: ${text}`);
            } catch (error) {
              console.error(`[Export Worker] Error processing text-on-path for AI:`, error);
            }
          }
        });
      }
    }
    
    // Create SVG content for embedding in AI file
    const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
${options.includeBackground ? `<rect width="${width}" height="${height}" fill="white" />` : ''}
${svgPathsData}
${svgTextData}
</svg>`;
    
    // Convert canvas to PNG for AI preview
    const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
    const pngArrayBuffer = await pngBlob.arrayBuffer();
    
    sendProgress(0.9, 'Finalizing AI file...')
    console.log('[Export Worker] Creating AI file with SVG and canvas content');
    
    // Create a simplified AI file format
    // This is a very simplified version - a real AI file is much more complex
    const aiTemplate = `%!PS-Adobe-3.0
%%Creator: Browser Design Studio
%%Title: Design Export
%%DocumentData: Clean7Bit
%%Origin: 0 0
%%BoundingBox: 0 0 ${width} ${height}
%%Pages: 1
%%PageOrder: Ascend
%%Orientation: Portrait
%%EndComments

%%BeginProlog
%AI5_BeginProlog
%AI5_EndProlog
%%EndProlog

%%BeginSetup
%AI5_BeginSetup
%AI5_EndSetup
%%EndSetup

%%Page: 1 1
%%BeginPageSetup
%%EndPageSetup

${aiPathsData}
${aiTextData}

%%Trailer
%%EOF
`;
    
    // Combine the AI template with the SVG content and PNG preview
    // In a real implementation, these would be properly embedded in the AI file structure
    const aiFileContent = new TextEncoder().encode(aiTemplate + '\n' + svgContent);
    
    console.log('[Export Worker] AI file generation complete. Size:', aiFileContent.length, 'bytes');
    return aiFileContent;
    
  } catch (error) {
    console.error('[Export Worker] Error generating AI file:', error);
    throw error;
  }
}

async function exportCss(vectorPaths: any[], textNodes: any[], options: any): Promise<string> {
  console.log('[Export Worker] Starting CSS generation with options:', options);
  sendProgress(0.3, 'Analyzing design elements...')
  
  try {
    // Generate CSS classes based on the design elements
    let css = `/* Generated CSS from Browser Design Studio */\n\n`;
    css += `.design-container {\n`;
    css += `  position: relative;\n`;
    css += `  width: ${options.width || 1200}px;\n`;
    css += `  height: ${options.height || 800}px;\n`;
    if (options.includeBackground) {
      css += `  background-color: white;\n`;
    }
    css += `}\n\n`;
    
    // Process vector paths
    if (options.includeVector && vectorPaths && vectorPaths.length > 0) {
      sendProgress(0.6, 'Generating CSS...')
      console.log('[Export Worker] Generating CSS for vector paths, count:', vectorPaths.length);
      
      css += `/* Vector Shapes */\n`;
      
      vectorPaths.forEach((path, index) => {
        try {
          const className = `shape-${index + 1}`;
          css += `.${className} {\n`;
          css += `  position: absolute;\n`;
          
          // Determine position and dimensions based on path type and points
          if (path.type === 'rect' && path.points && path.points.length >= 4) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const minY = Math.min(...yValues);
            const maxX = Math.max(...xValues);
            const maxY = Math.max(...yValues);
            
            const width = maxX - minX;
            const height = maxY - minY;
            
            css += `  left: ${minX}px;\n`;
            css += `  top: ${minY}px;\n`;
            css += `  width: ${width}px;\n`;
            css += `  height: ${height}px;\n`;
            
            if (path.fill && path.fill !== 'transparent') {
              css += `  background-color: ${path.fill};\n`;
            }
            
            if (path.strokeColor) {
              css += `  border: ${path.strokeWidth || 1}px solid ${path.strokeColor};\n`;
            }
            
          } else if (path.type === 'circle' && path.points && path.points.length > 0) {
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const diameter = maxX - minX;
            
            css += `  left: ${centerX - diameter/2}px;\n`;
            css += `  top: ${centerY - diameter/2}px;\n`;
            css += `  width: ${diameter}px;\n`;
            css += `  height: ${diameter}px;\n`;
            css += `  border-radius: 50%;\n`;
            
            if (path.fill && path.fill !== 'transparent') {
              css += `  background-color: ${path.fill};\n`;
            }
            
            if (path.strokeColor) {
              css += `  border: ${path.strokeWidth || 1}px solid ${path.strokeColor};\n`;
            }
            
          } else if (path.type === 'path' && path.points && path.points.length > 0) {
            // For paths, we'll use CSS clip-path when possible
            // This is a simplification - complex paths would need SVG in a real implementation
            css += `  /* Complex path - requires SVG for accurate representation */\n`;
            css += `  /* A simplified version using CSS: */\n`;
            
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const width = maxX - minX;
            const height = maxY - minY;
            
            css += `  left: ${minX}px;\n`;
            css += `  top: ${minY}px;\n`;
            css += `  width: ${width}px;\n`;
            css += `  height: ${height}px;\n`;
            
            // Generate a polygon for clip-path
            if (path.points.length > 2) {
              let clipPath = 'polygon(';
              for (let i = 0; i < path.points.length; i++) {
                const point = path.points[i];
                const xPercent = ((point.x - minX) / width) * 100;
                const yPercent = ((point.y - minY) / height) * 100;
                clipPath += `${xPercent}% ${yPercent}%${i < path.points.length - 1 ? ', ' : ''}`;
              }
              clipPath += ')';
              css += `  clip-path: ${clipPath};\n`;
            }
            
            if (path.fill && path.fill !== 'transparent') {
              css += `  background-color: ${path.fill};\n`;
            }
            
            if (path.strokeColor) {
              css += `  border: ${path.strokeWidth || 1}px solid ${path.strokeColor};\n`;
            }
          }
          
          if (path.opacity !== undefined) {
            css += `  opacity: ${path.opacity};\n`;
          }
          
          css += `}\n\n`;
          
        } catch (error) {
          console.error(`[Export Worker] Error generating CSS for path ${index}:`, error);
        }
      });
    }
    
    // Process text nodes
    if (options.includeText && textNodes && textNodes.length > 0) {
      console.log('[Export Worker] Generating CSS for text nodes, count:', textNodes.length);
      
      css += `/* Text Elements */\n`;
      
      textNodes.forEach((textNode, index) => {
        try {
          const { x, y, text, fontSize, fontFamily, fontWeight, fontStyle, fill, id } = textNode;
          const className = `text-${index + 1}`;
          
          css += `.${className} {\n`;
          css += `  position: absolute;\n`;
          css += `  left: ${x}px;\n`;
          css += `  top: ${y}px;\n`;
          
          if (fontSize) css += `  font-size: ${fontSize}px;\n`;
          if (fontFamily) css += `  font-family: ${fontFamily}, sans-serif;\n`;
          if (fontWeight) css += `  font-weight: ${fontWeight};\n`;
          if (fontStyle) css += `  font-style: ${fontStyle};\n`;
          if (fill) css += `  color: ${fill};\n`;
          
          // Check if this text is on a path
          const attachedToPath = vectorPaths.find(path => path.textId === id);
          if (attachedToPath) {
            css += `  /* This text follows a path - requires SVG for proper display */\n`;
          }
          
          css += `}\n\n`;
          
        } catch (error) {
          console.error(`[Export Worker] Error generating CSS for text node ${index}:`, error);
        }
      });
    }
    
    // Add HTML example usage
    css += `/* Example HTML structure:
<div class="design-container">
  <!-- Vector Shapes -->
  ${vectorPaths.map((_, i) => `<div class="shape-${i + 1}"></div>`).join('\n  ')}
  
  <!-- Text Elements -->
  ${textNodes.map((node, i) => `<div class="text-${i + 1}">${node.text}</div>`).join('\n  ')}
</div>
*/\n\n`;
    
    css += `/* Note: Complex paths and text-on-path require SVG for accurate representation */\n`;
    
    console.log('[Export Worker] CSS generation complete. Size:', css.length, 'bytes');
    return css;
    
  } catch (error) {
    console.error('[Export Worker] Error generating CSS:', error);
    throw error;
  }
}
