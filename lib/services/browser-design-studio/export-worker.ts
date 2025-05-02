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
    const { format, options, vectorPaths, rasterLayers, textNodes } = message.data
    
    // Report starting progress
    sendProgress(0.1, `Starting ${format.toUpperCase()} export...`)
    
    // Based on format, call appropriate export function
    let result
    switch (format.toLowerCase()) {
      case 'svg':
        result = await exportSvg(vectorPaths, textNodes, options)
        break
      case 'png':
        result = await exportPng(vectorPaths, rasterLayers, textNodes, options)
        break
      case 'jpg':
        result = await exportJpg(vectorPaths, rasterLayers, textNodes, options)
        break
      case 'pdf':
        result = await exportPdf(vectorPaths, rasterLayers, textNodes, options)
        break
      case 'ai':
        result = await exportAi(vectorPaths, rasterLayers, textNodes, options)
        break
      case 'css':
        result = await exportCss(vectorPaths, textNodes, options)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
    
    // Report completion
    sendProgress(1.0, `${format.toUpperCase()} export complete`)
    
    // Return the result
    ctx.postMessage({
      type: 'complete',
      data: {
        result
      }
    })
  } catch (error) {
    // Report error
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
  ctx.postMessage({
    type: 'progress',
    data: {
      progress,
      status
    }
  } as ProgressMessage)
}

// Export functions for each format
// These would contain the actual export logic in a real implementation
// For this demo, they're simplified placeholders

async function exportSvg(vectorPaths: any[], textNodes: any[], options: any): Promise<string> {
  sendProgress(0.3, 'Generating SVG structure...')
  await simulateProcessing(300)
  
  // Get dimensions from options or use defaults
  const width = options.width || 1200;
  const height = options.height || 800;
  
  // Start SVG document
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
`
  
  // Add background if needed
  if (options.includeBackground) {
    svg += `  <rect width="${width}" height="${height}" fill="white" />\n`
  }
  
  sendProgress(0.5, 'Processing vector paths...')
  await simulateProcessing(300)
  
  // Process and add vector paths
  if (vectorPaths && vectorPaths.length > 0) {
    sendProgress(0.6, 'Adding vector paths...')
    
    vectorPaths.forEach(path => {
      if (path.type === 'path') {
        // Generate SVG path data from points
        if (path.points && path.points.length > 0) {
          let d = `M ${path.points[0].x} ${path.points[0].y}`;
          
          for (let i = 1; i < path.points.length; i++) {
            d += ` L ${path.points[i].x} ${path.points[i].y}`;
          }
          
          if (path.closed) {
            d += ' Z';
          }
          
          svg += `  <path d="${d}" fill="${path.fill || 'none'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
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
          
          svg += `  <rect x="${minX}" y="${minY}" width="${rectWidth}" height="${rectHeight}" fill="${path.fill || 'none'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
        }
      } else if (path.type === 'circle') {
        // Handle circles/ellipses - calculate center and radius from points
        if (path.points && path.points.length > 2) {
          // Find bounding box
          const minX = Math.min(...path.points.map((p: { x: number; y: number }) => p.x));
          const minY = Math.min(...path.points.map((p: { x: number; y: number }) => p.y));
          const maxX = Math.max(...path.points.map((p: { x: number; y: number }) => p.x));
          const maxY = Math.max(...path.points.map((p: { x: number; y: number }) => p.y));
          
          // Calculate center and radius
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          const rx = (maxX - minX) / 2;
          const ry = (maxY - minY) / 2;
          
          svg += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${path.fill || 'none'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
        }
      } else if (path.type === 'polyline' && path.points) {
        // Handle polylines
        const pointsStr = path.points.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
        svg += `  <polyline points="${pointsStr}" fill="${path.fill || 'none'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
      } else if (path.type === 'polygon' && path.points) {
        // Handle polygons
        const pointsStr = path.points.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
        svg += `  <polygon points="${pointsStr}" fill="${path.fill || 'none'}" stroke="${path.strokeColor || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />\n`;
      }
    });
  }
  
  sendProgress(0.8, 'Adding text elements...')
  await simulateProcessing(200)
  
  // Add text elements
  if (textNodes && textNodes.length > 0) {
    textNodes.forEach(node => {
      svg += `  <text x="${node.x || 0}" y="${node.y || 0}" font-family="${node.fontFamily || 'Arial'}" font-size="${node.fontSize || 16}px" fill="${node.fill || '#000'}" ${node.opacity !== undefined ? `opacity="${node.opacity}"` : ''} ${node.fontWeight ? `font-weight="${node.fontWeight}"` : ''} ${node.fontStyle ? `font-style="${node.fontStyle}"` : ''}>${node.text || ''}</text>\n`
    });
  }
  
  // Close SVG tag
  svg += `</svg>`
  
  sendProgress(0.9, 'Finalizing SVG...')
  await simulateProcessing(200)
  
  // Return the SVG as a string
  return svg
}

async function exportPng(vectorPaths: any[], rasterLayers: any[], textNodes: any[], options: any): Promise<Uint8Array> {
  sendProgress(0.3, 'Rendering to canvas...')
  await simulateProcessing(600)
  
  sendProgress(0.7, 'Encoding PNG...')
  await simulateProcessing(400)
  
  // Return a dummy array for demo purposes
  return new Uint8Array(100)
}

async function exportJpg(vectorPaths: any[], rasterLayers: any[], textNodes: any[], options: any): Promise<Uint8Array> {
  sendProgress(0.3, 'Rendering to canvas...')
  await simulateProcessing(500)
  
  sendProgress(0.7, 'Encoding JPG...')
  await simulateProcessing(400)
  
  // Return a dummy array for demo purposes
  return new Uint8Array(100)
}

async function exportPdf(vectorPaths: any[], rasterLayers: any[], textNodes: any[], options: any): Promise<Uint8Array> {
  sendProgress(0.3, 'Creating PDF structure...')
  await simulateProcessing(600)
  
  sendProgress(0.5, 'Processing vector elements...')
  await simulateProcessing(400)
  
  sendProgress(0.7, 'Processing raster elements...')
  await simulateProcessing(400)
  
  sendProgress(0.9, 'Finalizing PDF...')
  await simulateProcessing(300)
  
  // Return a dummy array for demo purposes
  return new Uint8Array(100)
}

async function exportAi(vectorPaths: any[], rasterLayers: any[], textNodes: any[], options: any): Promise<Uint8Array> {
  sendProgress(0.3, 'Creating AI structure...')
  await simulateProcessing(600)
  
  sendProgress(0.5, 'Processing vector elements...')
  await simulateProcessing(400)
  
  sendProgress(0.7, 'Processing raster elements...')
  await simulateProcessing(400)
  
  sendProgress(0.9, 'Finalizing AI file...')
  await simulateProcessing(300)
  
  // Return a dummy array for demo purposes
  return new Uint8Array(100)
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
