/**
 * PDF Export Worker
 * Handles conversion of vector paths, raster images, and text to PDF format
 */

import { 
  ExportOptions, PathWithText, findPathsWithText, createTextNodesMap, 
  sendProgress, drawPathToCanvas, drawTextAlongPath 
} from './types';

// PDF export function - creates a PDF with the vector, raster, and text content
export async function exportPdf(
  vectorPaths: any[],
  rasterLayers: any[],
  rasterImageData: ImageData | null,
  textNodes: any[],
  options: ExportOptions
): Promise<Uint8Array> {
  try {
    console.log('[Export Worker] Starting PDF export...');
    console.log('[Export Worker] Options:', options);
    console.log('[Export Worker] includeVector:', options.includeVector);
    console.log('[Export Worker] includeRaster:', options.includeRaster);
    console.log('[Export Worker] includeText:', options.includeText);
    console.log('[Export Worker] Vector paths:', vectorPaths.length);
    console.log('[Export Worker] Raster layers:', rasterLayers.length);
    console.log('[Export Worker] Has raster image data:', !!rasterImageData);
    console.log('[Export Worker] Text nodes:', textNodes.length);
    
    sendProgress(0.1, 'Starting PDF export...');
    
    // Get dimensions from image data or set defaults
    const width = rasterImageData?.width || 800;
    const height = rasterImageData?.height || 600;
    
    sendProgress(0.3, 'Processing vector and raster data for PDF...');
    
    // First, we'll create a canvas with all elements (vector, raster, text) rendered
    // This will be our base image for the PDF
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      throw new Error('Could not get 2D context for PDF canvas');
    }
    
    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    sendProgress(0.5, 'Creating PDF with embedded image...');
    console.log('[Export Worker] Preparing canvas for PDF with dimensions:', width, 'x', height);
    
    // Add raster layers if available and requested
    if (options.includeRaster && rasterImageData) {
      console.log('[Export Worker] Adding raster data to PDF');
      ctx.putImageData(rasterImageData, 0, 0);
    }
    
    // Add vector paths if requested
    if (options.includeVector && vectorPaths.length > 0) {
      console.log('[Export Worker] Adding vector paths to PDF, count:', vectorPaths.length);
      
      vectorPaths.forEach((path: any) => {
        drawPathToCanvas(ctx, path);
      });
    }
    
    // Add texts if requested
    if (options.includeText && textNodes.length > 0) {
      console.log('[Export Worker] Adding text elements to PDF, count:', textNodes.length);
      
      // Find paths with text (text-on-path)
      const pathsWithText: PathWithText[] = findPathsWithText(textNodes, vectorPaths);
      console.log('[Export Worker] Paths with text for PDF:', pathsWithText.length);
      
      // Create a map of text nodes by ID for quick lookup
      const textNodesMap = createTextNodesMap(textNodes);
      console.log('[Export Worker] Text nodes map created:', Object.keys(textNodesMap));
      
      // Process standalone text (not attached to paths)
      textNodes.forEach((textNode: any) => {
        // Skip text nodes that are attached to paths
        const isAttachedToPath = pathsWithText.some((item: PathWithText) => item.textId === textNode.id);
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
            console.log(`[Export Worker] Added standalone text to PDF: '${text}' at (${x}, ${y})`);
          } catch (error) {
            console.error('[Export Worker] Error rendering standalone text in PDF:', error);
          }
        }
      });
      
      // Process text-on-path
      if (pathsWithText.length > 0) {
        console.log('[Export Worker] Adding text-on-path elements to PDF, count:', pathsWithText.length);
        
        for (const { d, textId, path } of pathsWithText) {
          const textNode = textNodesMap[textId];
          
          if (textNode) {
            try {
              const { text, fontSize, fontFamily, fontWeight, fontStyle, fill } = textNode;
              console.log(`[Export Worker] Processing text-on-path for PDF: '${text}' on path type ${path.type}`);
              
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
              console.error('[Export Worker] Error rendering text-on-path for PDF:', error);
            }
          }
        }
      }
    }
    
    // Convert canvas to JPEG and create PDF with embedded image
    sendProgress(0.9, 'Finalizing PDF...')
    console.log('[Export Worker] Creating PDF with directly embedded image');
    
    // Convert canvas to JPEG for smaller size
    const pngBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
    const pngArrayBuffer = await pngBlob.arrayBuffer();
    const pngBytes = new Uint8Array(pngArrayBuffer);
    
    console.log('[Export Worker] Image data for PDF has been generated, size:', pngBytes.length);
    
    // Create a simple PDF structure that directly embeds the image
    const pdfHeader = `%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R 
   /Resources << 
      /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]
      /XObject << /Im1 5 0 R >>
   >> 
>>
endobj
4 0 obj
<</Length 51>>
stream
q
${width} 0 0 ${height} 0 0 cm
/Im1 Do
Q
endstream
endobj
5 0 obj
<</Type /XObject /Subtype /Image /Width ${width} /Height ${height} /BitsPerComponent 8 
  /ColorSpace /DeviceRGB /Filter /DCTDecode /Length ${pngBytes.length}>>
stream
`;

    // PDF footer
    const pdfFooter = `
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000056 00000 n
0000000111 00000 n
0000000290 00000 n
0000000392 00000 n
trailer
<</Size 6 /Root 1 0 R>>
startxref
${pdfHeader.length + pngBytes.length + 600}
%%EOF`;

    // Convert strings to bytes
    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(pdfHeader);
    const footerBytes = encoder.encode(pdfFooter);
    
    // Combine all parts into the final PDF
    const pdfData = new Uint8Array(headerBytes.length + pngBytes.length + footerBytes.length);
    pdfData.set(headerBytes, 0);
    pdfData.set(pngBytes, headerBytes.length);
    pdfData.set(footerBytes, headerBytes.length + pngBytes.length);
    
    console.log('[Export Worker] PDF generation complete. Size:', pdfData.length, 'bytes');
    sendProgress(1.0, 'PDF export complete');
    
    return pdfData;
  } catch (error) {
    console.error('[Export Worker] Error in PDF export:', error);
    throw error;
  }
}
