/**
 * Adobe Illustrator (AI) Export Worker
 * Handles conversion of vector paths, raster images, and text to AI format
 */

import { 
  ExportOptions, PathWithText, findPathsWithText, createTextNodesMap, 
  sendProgress, drawPathToCanvas, drawTextAlongPath, getPathBounds 
} from './types';
import { exportSvg } from './svg-worker';

// AI export function - creates an AI file with the vector, raster, and text content
export async function exportAi(
  vectorPaths: any[],
  rasterLayers: any[],
  rasterImageData: ImageData | null,
  textNodes: any[],
  options: ExportOptions
): Promise<Uint8Array> {
  try {
    console.log('[Export Worker] Starting AI export...');
    console.log('[Export Worker] Options:', options);
    console.log('[Export Worker] includeVector:', options.includeVector);
    console.log('[Export Worker] includeRaster:', options.includeRaster);
    console.log('[Export Worker] includeText:', options.includeText);
    console.log('[Export Worker] Vector paths:', vectorPaths.length);
    console.log('[Export Worker] Raster layers:', rasterLayers.length);
    console.log('[Export Worker] Has raster image data:', !!rasterImageData);
    console.log('[Export Worker] Text nodes:', textNodes.length);
    
    sendProgress(0.1, 'Starting AI export...');
    
    // Get dimensions from image data or set defaults
    const width = rasterImageData?.width || 800;
    const height = rasterImageData?.height || 600;
    
    sendProgress(0.3, 'Creating AI file structure...');
    
    // First create an SVG to embed in the AI file
    console.log('[Export Worker] Generating SVG for AI export...');
    const svgContent = await exportSvg(
      vectorPaths, 
      rasterLayers, 
      rasterImageData, 
      textNodes, 
      options
    );
    
    sendProgress(0.5, 'Generating AI content...');
    
    // Generate PostScript-like paths data for AI
    let aiPathsData = '';
    let aiTextData = '';
    
    // Add vector paths data in PostScript-like format
    if (options.includeVector && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to AI, count:', vectorPaths.length);
      
      aiPathsData += '% Vector Paths\n';
      
      vectorPaths.forEach((path: any, index: number) => {
        if (!path || !path.points || path.points.length === 0) {
          return;
        }
        
        // Create PostScript path
        aiPathsData += `% Path ${index + 1}\n`;
        aiPathsData += 'newpath\n';
        
        if (path.type === 'path') {
          // Start the path
          const firstPoint = path.points[0];
          aiPathsData += `${firstPoint.x} ${firstPoint.y} moveto\n`;
          
          // Add line segments
          for (let i = 1; i < path.points.length; i++) {
            const point = path.points[i];
            aiPathsData += `${point.x} ${point.y} lineto\n`;
          }
          
          if (path.closed) {
            aiPathsData += 'closepath\n';
          }
        } else if (path.type === 'circle') {
          const { minX, minY, maxX, maxY } = getPathBounds(path);
          
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const radius = (maxX - minX) / 2;
          
          aiPathsData += `${centerX} ${centerY} ${radius} 0 360 arc\n`;
          aiPathsData += 'closepath\n';
        } else if (path.type === 'rect') {
          const { minX, minY, maxX, maxY } = getPathBounds(path);
          const width = maxX - minX;
          const height = maxY - minY;
          
          aiPathsData += `${minX} ${minY} moveto\n`;
          aiPathsData += `${minX + width} ${minY} lineto\n`;
          aiPathsData += `${minX + width} ${minY + height} lineto\n`;
          aiPathsData += `${minX} ${minY + height} lineto\n`;
          aiPathsData += 'closepath\n';
        } else if (path.type === 'ellipse') {
          const { minX, minY, maxX, maxY } = getPathBounds(path);
          
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const radiusX = (maxX - minX) / 2;
          const radiusY = (maxY - minY) / 2;
          
          // Approximation of ellipse in PostScript
          aiPathsData += `matrix currentmatrix\n`;
          aiPathsData += `${centerX} ${centerY} translate\n`;
          aiPathsData += `${radiusX} ${radiusY} scale\n`;
          aiPathsData += `0 0 1 0 360 arc\n`;
          aiPathsData += `closepath\n`;
          aiPathsData += `setmatrix\n`;
        }
        
        // Apply fill and stroke
        if (path.fillColor && path.fillColor !== 'transparent') {
          const rgb = hexToRgb(path.fillColor);
          if (rgb) {
            aiPathsData += `${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} setrgbcolor\n`;
            aiPathsData += 'fill\n';
          }
        }
        
        if (path.strokeColor) {
          const rgb = hexToRgb(path.strokeColor);
          if (rgb) {
            aiPathsData += `${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} setrgbcolor\n`;
            aiPathsData += `${path.strokeWidth || 1} setlinewidth\n`;
            aiPathsData += 'stroke\n';
          }
        }
        
        aiPathsData += '\n';
      });
    }
    
    // Add text data in PostScript-like format
    if (options.includeText && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to AI, count:', textNodes.length);
      
      // Find paths with text (text-on-path)
      const pathsWithText = findPathsWithText(textNodes, vectorPaths);
      
      // Create a map of text nodes by ID
      const textNodesMap = createTextNodesMap(textNodes);
      
      aiTextData += '% Text Elements\n';
      
      // Add standalone text elements
      textNodes.forEach((textNode: any, index: number) => {
        const isAttachedToPath = pathsWithText.some(item => item.textId === textNode.id);
        if (isAttachedToPath) {
          return;
        }
        
        if (textNode.text) {
          const { text, fontSize = 16, fontFamily = 'Arial', x = 0, y = 0, fill = '#000000' } = textNode;
          
          aiTextData += `% Text ${index + 1}\n`;
          aiTextData += `/${fontFamily} findfont\n`;
          aiTextData += `${fontSize} scalefont\n`;
          aiTextData += `setfont\n`;
          
          const rgb = hexToRgb(fill);
          if (rgb) {
            aiTextData += `${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} setrgbcolor\n`;
          }
          
          // In PostScript, text origin is at baseline, not top-left
          aiTextData += `${x} ${y + fontSize * 0.8} moveto\n`;
          aiTextData += `(${text}) show\n\n`;
        }
      });
      
      // Add text-on-path elements
      if (pathsWithText.length > 0) {
        aiTextData += '% Text on Paths\n';
        
        pathsWithText.forEach(({ d, textId, path }, index) => {
          const textNode = textNodesMap[textId];
          if (textNode) {
            const { text, fontSize = 16, fontFamily = 'Arial', fill = '#000000' } = textNode;
            
            aiTextData += `% Text-on-path ${index + 1}\n`;
            aiTextData += `/${fontFamily} findfont\n`;
            aiTextData += `${fontSize} scalefont\n`;
            aiTextData += `setfont\n`;
            
            const rgb = hexToRgb(fill);
            if (rgb) {
              aiTextData += `${rgb.r / 255} ${rgb.g / 255} ${rgb.b / 255} setrgbcolor\n`;
            }
            
            // For simplicity, we just place the text at the start of the path
            // Real text-on-path in AI would require a more complex implementation
            const firstPoint = path.points[0];
            aiTextData += `${firstPoint.x} ${firstPoint.y + fontSize * 0.8} moveto\n`;
            aiTextData += `(${text} [on path]) show\n\n`;
          }
        });
      }
    }
    
    sendProgress(0.7, 'Creating raster preview...');
    
    // For the raster preview, we'll use the same approach as for PNG
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get 2D context for AI preview canvas');
    }
    
    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Add raster data if available and requested
    if (options.includeRaster && rasterImageData) {
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    // Add vector paths if requested
    if (options.includeVector && vectorPaths.length > 0) {
      vectorPaths.forEach((path: any) => {
        drawPathToCanvas(ctx, path);
      });
    }
    
    // Add text if requested
    if (options.includeText && textNodes.length > 0) {
      // Find paths with text
      const pathsWithText = findPathsWithText(textNodes, vectorPaths);
      const textNodesMap = createTextNodesMap(textNodes);
      
      // First, render standalone text
      textNodes.forEach((textNode: any) => {
        const isAttachedToPath = pathsWithText.some(item => item.textId === textNode.id);
        if (isAttachedToPath) return;
        
        if (textNode.text) {
          const { text, fontSize = 16, fontFamily = 'Arial', fontWeight = 'normal', fontStyle = 'normal', fill = '#000000', x = 0, y = 0 } = textNode;
          
          ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = fill;
          ctx.textBaseline = 'top';
          ctx.fillText(text, x, y);
        }
      });
      
      // Then, render text along paths
      if (pathsWithText.length > 0) {
        for (const { d, textId, path } of pathsWithText) {
          const textNode = textNodesMap[textId];
          
          if (textNode) {
            const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
            
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
          }
        }
      }
    }
    
    // Convert canvas to PNG for embedding
    const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
    const pngArrayBuffer = await pngBlob.arrayBuffer();
    const pngBase64 = arrayBufferToBase64(pngArrayBuffer);
    
    sendProgress(0.9, 'Finalizing AI file...');
    
    // Create the AI file structure
    const aiTemplate = `%!PS-Adobe-3.0
%%Creator: Browser Design Studio
%%Title: Vector Export
%%DocumentData: Clean7Bit
%%Origin: 0 0
%%BoundingBox: 0 0 ${width} ${height}
%%LanguageLevel: 2
%%Pages: 1
%%Page: 1 1

% Browser Design Studio Export
% This is a simplified AI file that embeds both PostScript and SVG

${aiPathsData}
${aiTextData}

% SVG data for compatibility with modern editors
% <svg data>
${svgContent}
% </svg data>

%%EOF
`;

    // Combine all content into the final AI file
    const aiFileContent = new TextEncoder().encode(aiTemplate);
    
    sendProgress(1.0, 'AI export complete');
    console.log('[Export Worker] AI export complete, size:', aiFileContent.length, 'bytes');
    
    return aiFileContent;
  } catch (error) {
    console.error('[Export Worker] Error in AI export:', error);
    throw error;
  }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
