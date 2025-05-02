/**
 * CSS Export Worker
 * Handles conversion of vector paths, raster images, and text to CSS format
 */

import { 
  ExportOptions, PathWithText, findPathsWithText, createTextNodesMap, 
  sendProgress, getPathBounds 
} from './types';

// CSS export function - creates CSS with the vector, raster, and text content
export async function exportCss(
  vectorPaths: any[],
  rasterLayers: any[],
  rasterImageData: ImageData | null,
  textNodes: any[],
  options: ExportOptions
): Promise<string> {
  try {
    console.log('[Export Worker] Starting CSS export...');
    console.log('[Export Worker] Options:', options);
    console.log('[Export Worker] includeVector:', options.includeVector);
    console.log('[Export Worker] includeRaster:', options.includeRaster);
    console.log('[Export Worker] includeText:', options.includeText);
    console.log('[Export Worker] Vector paths:', vectorPaths.length);
    console.log('[Export Worker] Raster layers:', rasterLayers.length);
    console.log('[Export Worker] Has raster image data:', !!rasterImageData);
    console.log('[Export Worker] Text nodes:', textNodes.length);
    
    sendProgress(0.1, 'Starting CSS export...');
    
    // Get dimensions from image data or set defaults
    const width = rasterImageData?.width || 800;
    const height = rasterImageData?.height || 600;
    
    let css = '';
    
    // Add CSS comments and header
    css += `/* Browser Design Studio Export - CSS */\n\n`;
    
    // Add container styles
    css += `/* Container for the design */\n`;
    css += `.design-container {\n`;
    css += `  position: relative;\n`;
    css += `  width: ${width}px;\n`;
    css += `  height: ${height}px;\n`;
    css += `  background-color: white;\n`;
    css += `}\n\n`;
    
    sendProgress(0.3, 'Processing vector shapes...');
    
    // Add vector paths if requested
    if (options.includeVector && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to CSS, count:', vectorPaths.length);
      
      css += `/* Vector Shapes */\n`;
      
      // Find paths with text (text-on-path)
      const pathsWithText: PathWithText[] = options.includeText ? findPathsWithText(textNodes, vectorPaths) : [];
      
      vectorPaths.forEach((path: any, index: number) => {
        if (!path || !path.points || path.points.length === 0) {
          return;
        }
        
        // Generate a class name for the path
        const className = path.id ? `path-${path.id}` : `path-${index + 1}`;
        
        css += `.${className} {\n`;
        css += `  position: absolute;\n`;
        
        // Calculate dimensions
        const { minX, minY, maxX, maxY } = getPathBounds(path);
        const width = maxX - minX;
        const height = maxY - minY;
        
        css += `  left: ${minX}px;\n`;
        css += `  top: ${minY}px;\n`;
        css += `  width: ${width}px;\n`;
        css += `  height: ${height}px;\n`;
        
        // Add path styling
        if (path.fillColor && path.fillColor !== 'transparent') {
          css += `  background-color: ${path.fillColor};\n`;
        } else {
          css += `  background-color: transparent;\n`;
        }
        
        if (path.strokeColor) {
          css += `  border: ${path.strokeWidth || 1}px solid ${path.strokeColor};\n`;
        }
        
        // Handle shapes more efficiently with CSS
        if (path.type === 'circle') {
          css += `  border-radius: 50%;\n`;
        } else if (path.type === 'rect') {
          // No additional styling needed for rectangles
        } else if (path.type === 'ellipse') {
          css += `  border-radius: 50%;\n`;
        } else if (path.type === 'path') {
          // For complex paths, we use clip-path if possible
          css += `  /* Complex path - SVG recommended for better rendering */\n`;
          
          // Generate polygon points for clip-path
          // This is a simplified approach that won't work for all paths
          if (path.points.length > 2) {
            const points = path.points.map((p: any) => {
              // Convert to relative coordinates within the element
              return `${p.x - minX}px ${p.y - minY}px`;
            }).join(', ');
            
            css += `  clip-path: polygon(${points});\n`;
          }
        }
        
        css += `}\n\n`;
      });
    }
    
    sendProgress(0.6, 'Processing text elements...');
    
    // Add text if requested
    if (options.includeText && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to CSS, count:', textNodes.length);
      
      // Find paths with text (text-on-path)
      const pathsWithText: PathWithText[] = findPathsWithText(textNodes, vectorPaths);
      
      css += `/* Text Elements */\n`;
      
      // Add standalone text elements
      textNodes.forEach((textNode: any, index: number) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
        if (isAttachedToPath) {
          return;
        }
        
        if (textNode.text) {
          const { text, fontSize = 16, fontFamily = 'Arial', fontWeight = 'normal', fontStyle = 'normal', fill = '#000000', x = 0, y = 0 } = textNode;
          
          // Generate a class name for the text
          const className = textNode.id ? `text-${textNode.id}` : `text-${index + 1}`;
          
          css += `.${className} {\n`;
          css += `  position: absolute;\n`;
          css += `  left: ${x}px;\n`;
          css += `  top: ${y}px;\n`;
          css += `  font-family: ${fontFamily};\n`;
          css += `  font-size: ${fontSize}px;\n`;
          css += `  font-weight: ${fontWeight};\n`;
          css += `  font-style: ${fontStyle};\n`;
          css += `  color: ${fill};\n`;
          css += `  white-space: nowrap;\n`;
          css += `}\n\n`;
        }
      });
      
      // Add a note about text-on-path
      if (pathsWithText.length > 0) {
        css += `/* Text on Paths (${pathsWithText.length}) */\n`;
        css += `/* Note: Text on path requires SVG for accurate representation */\n\n`;
        
        // For each text-on-path, create a placeholder
        pathsWithText.forEach(({ textId, path }, index) => {
          const textNode = textNodes.find(t => t.id === textId);
          if (textNode) {
            const { text, fontSize = 16, fontFamily = 'Arial', fontWeight = 'normal', fontStyle = 'normal', fill = '#000000' } = textNode;
            
            // Generate a class name for the text-on-path
            const className = `text-on-path-${index + 1}`;
            
            css += `/* Placeholder for text on path: "${text}" */\n`;
            css += `.${className} {\n`;
            css += `  font-family: ${fontFamily};\n`;
            css += `  font-size: ${fontSize}px;\n`;
            css += `  font-weight: ${fontWeight};\n`;
            css += `  font-style: ${fontStyle};\n`;
            css += `  color: ${fill};\n`;
            css += `}\n\n`;
          }
        });
      }
    }
    
    sendProgress(0.9, 'Finalizing CSS...');
    
    // Add note about raster content
    if (options.includeRaster && rasterImageData) {
      css += `/* Note: Raster content should be exported as an image and included via HTML */\n\n`;
    }
    
    // Add HTML usage example
    css += `/* Example HTML structure:\n<div class="design-container">\n`;
    
    if (options.includeVector && vectorPaths.length > 0) {
      vectorPaths.forEach((path: any, index: number) => {
        const className = path.id ? `path-${path.id}` : `path-${index + 1}`;
        css += `  <div class="${className}"></div>\n`;
      });
    }
    
    if (options.includeText && textNodes.length > 0) {
      // Find paths with text (text-on-path) for the HTML example
      const pathsWithTextForExample: PathWithText[] = options.includeText ? findPathsWithText(textNodes, vectorPaths) : [];
      
      // Add standalone text elements to example
      textNodes.forEach((textNode: any, index: number) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithTextForExample.some((item: PathWithText) => item.textId === textNode.id);
        if (!isAttachedToPath && textNode.text) {
          const className = textNode.id ? `text-${textNode.id}` : `text-${index + 1}`;
          css += `  <div class="${className}">${textNode.text}</div>\n`;
        }
      });
      
      // Add note about text-on-path
      if (pathsWithTextForExample.length > 0) {
        css += `  <!-- Text on path elements require SVG for accurate representation -->\n`;
      }
    }
    
    css += `</div>\n*/\n\n`;
    
    // Add final note about limitations
    css += `/* Note: Complex paths and text-on-path require SVG for accurate representation */\n`;
    
    sendProgress(1.0, 'CSS export complete');
    console.log('[Export Worker] CSS export complete');
    
    return css;
  } catch (error) {
    console.error('[Export Worker] Error in CSS export:', error);
    throw error;
  }
}
