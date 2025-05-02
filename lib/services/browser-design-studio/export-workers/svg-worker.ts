/**
 * SVG Export Worker
 * Handles conversion of vector paths, raster images, and text to SVG format
 */

import { ExportOptions, PathWithText, findPathsWithText, createTextNodesMap, sendProgress } from './types';

// SVG export function - creates an SVG with the vector, raster, and text content
export async function exportSvg(
  vectorPaths: any[],
  rasterLayers: any[],
  rasterImageData: ImageData | null,
  textNodes: any[],
  options: ExportOptions
): Promise<string> {
  try {
    console.log('[Export Worker] Starting SVG export...');
    console.log('[Export Worker] Options:', options);
    console.log('[Export Worker] includeVector:', options.includeVector);
    console.log('[Export Worker] includeRaster:', options.includeRaster);
    console.log('[Export Worker] includeText:', options.includeText);
    console.log('[Export Worker] Vector paths:', vectorPaths.length);
    console.log('[Export Worker] Raster layers:', rasterLayers.length);
    console.log('[Export Worker] Has raster image data:', !!rasterImageData);
    console.log('[Export Worker] Text nodes:', textNodes.length);
    
    sendProgress(0.1, 'Starting SVG export...');
    
    // Get dimensions from image data or set defaults
    const width = rasterImageData?.width || 800;
    const height = rasterImageData?.height || 600;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
    
    // Add a white background rect
    svg += `  <rect width="${width}" height="${height}" fill="white" />\n`;
    
    sendProgress(0.3, 'Adding raster data...');
    
    // Add raster data if available and requested
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to SVG');
      
      // Create a canvas to convert ImageData to base64
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.putImageData(rasterImageData, 0, 0);
        const blob = await canvas.convertToBlob();
        const reader = new FileReader();
        
        // Convert blob to base64
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        });
        
        const base64 = await base64Promise;
        
        // Add the image to the SVG
        svg += `  <image width="${width}" height="${height}" href="${base64}" />\n`;
      }
    }
    
    sendProgress(0.5, 'Processing vector paths...');
    
    // Find paths with text (text-on-path)
    const pathsWithText: PathWithText[] = options.includeText ? findPathsWithText(textNodes, vectorPaths) : [];
    console.log('[Export Worker] Paths with text for SVG:', pathsWithText.length);
    
    // Add vector paths if requested
    if (options.includeVector && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to SVG, count:', vectorPaths.length);
      
      // First add the defs section with paths that will be referenced by textPath elements
      if (pathsWithText.length > 0) {
        svg += `  <defs>\n`;
        
        // Add each path that has text attached to it
        pathsWithText.forEach(({ d, textId, path }, index) => {
          const pathId = `text-path-${index}`;
          svg += `    <path id="${pathId}" d="${d}" />\n`;
        });
        
        svg += `  </defs>\n`;
      }
      
      // Add regular vector paths (excluding those with text, which are in defs)
      vectorPaths.forEach((path: any) => {
        // Skip invalid paths
        if (!path || !path.points || path.points.length === 0) {
          console.log('[Export Worker] Skipping invalid path in SVG');
          return;
        }
        
        // Skip paths that have text attached - they're already in defs
        const hasTextAttached = pathsWithText.some(p => p.path.id === path.id);
        if (hasTextAttached) {
          // We still draw these paths if they have a stroke
          if (!path.strokeColor || path.strokeColor === 'transparent') {
            return;
          }
        }
        
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
            d = `M ${centerX + radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
          } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
            // For rectangles, use the points to define a path
            const xValues = path.points.map((p: { x: number }) => p.x);
            const yValues = path.points.map((p: { y: number }) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            
            const width = maxX - minX;
            const height = maxY - minY;
            
            d = `M ${minX} ${minY} H ${minX + width} V ${minY + height} H ${minX} Z`;
          } else if (path.type === 'ellipse' && path.points && path.points.length > 0) {
            // For ellipses, calculate center and radii
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
            
            d = `M ${centerX + radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
          }
          
          // Skip empty paths
          if (!d) {
            console.log('[Export Worker] Skipping empty path in SVG');
            return;
          }
          
          // Add the path with proper styling
          svg += `  <path d="${d}" fill="${path.fillColor || 'none'}" stroke="${path.strokeColor || 'none'}" stroke-width="${path.strokeWidth || 1}" />\n`;
        } catch (error) {
          console.error('[Export Worker] Error creating SVG path:', error);
        }
      });
    }
    
    sendProgress(0.7, 'Processing text...');
    
    // Add text if requested
    if (options.includeText && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to SVG, count:', textNodes.length);
      
      // Create a map of text nodes by ID
      const textNodesMap = createTextNodesMap(textNodes);
      
      // Add text-on-path elements
      if (pathsWithText.length > 0) {
        pathsWithText.forEach(({ d, textId, path }, index) => {
          const textNode = textNodesMap[textId];
          if (textNode) {
            const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
            const pathId = `text-path-${index}`;
            
            svg += `  <text font-size="${fontSize || 16}" font-family="${fontFamily || 'Arial'}" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || '#000000'}">
    <textPath href="#${pathId}" startOffset="0%">${text}</textPath>
  </text>\n`;
          }
        });
      }
      
      // Add standalone text elements (not attached to paths)
      textNodes.forEach((textNode: any) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some(item => item.textId === textNode.id);
        if (isAttachedToPath) {
          return;
        }
        
        if (textNode.text) {
          const { text, fontSize, fontFamily, fontWeight, fontStyle, fill, x, y } = textNode;
          svg += `  <text x="${x || 0}" y="${y || 0}" font-size="${fontSize || 16}" font-family="${fontFamily || 'Arial'}" font-weight="${fontWeight || 'normal'}" font-style="${fontStyle || 'normal'}" fill="${fill || '#000000'}">${text}</text>\n`;
        }
      });
    }
    
    // Close the SVG
    svg += `</svg>`;
    
    sendProgress(1.0, 'SVG export complete');
    console.log('[Export Worker] SVG export complete');
    
    return svg;
  } catch (error) {
    console.error('[Export Worker] Error in SVG export:', error);
    throw error;
  }
}
