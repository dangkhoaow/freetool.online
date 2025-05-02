/**
 * Shared types and interfaces for export workers
 */

// Common export options interface used by all export formats
export interface ExportOptions {
  includeVector: boolean;
  includeRaster: boolean;
  includeText: boolean;
  quality: number;
  scale: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

// Helper interface for text attached to paths
export interface PathWithText {
  d: string;
  textId: string;
  path: any;
}

// Function to send progress updates from workers
export function sendProgress(percent: number, message: string): void {
  console.log(`[Export Worker] Progress: ${Math.round(percent * 100)}% - ${message}`);
  self.postMessage({
    type: 'progress',
    data: {
      percent,
      message
    }
  });
}

// Utility function to calculate path bounds
export function getPathBounds(path: any): { minX: number, minY: number, maxX: number, maxY: number } {
  const xValues = path.points.map((p: { x: number }) => p.x);
  const yValues = path.points.map((p: { y: number }) => p.y);
  return {
    minX: Math.min(...xValues),
    minY: Math.min(...yValues),
    maxX: Math.max(...xValues),
    maxY: Math.max(...yValues)
  };
}

// Utility for drawing paths to a canvas context
export function drawPathToCanvas(ctx: OffscreenCanvasRenderingContext2D, path: any): void {
  if (!path || !path.points || path.points.length === 0) {
    console.log('[Export Worker] Skipping invalid path');
    return;
  }
  
  // Set up path styling
  ctx.strokeStyle = path.strokeColor || '#000000';
  ctx.lineWidth = path.strokeWidth || 1;
  ctx.fillStyle = path.fillColor || 'transparent';
  
  // Start the path
  ctx.beginPath();
  
  if (path.type === 'path') {
    // Draw the path
    const firstPoint = path.points[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < path.points.length; i++) {
      const point = path.points[i];
      ctx.lineTo(point.x, point.y);
    }
    
    if (path.closed) {
      ctx.closePath();
    }
  } else if (path.type === 'circle' && path.points && path.points.length > 0) {
    const { minX, minY, maxX, maxY } = getPathBounds(path);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radius = (maxX - minX) / 2;
    
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
    const { minX, minY, maxX, maxY } = getPathBounds(path);
    ctx.rect(minX, minY, maxX - minX, maxY - minY);
  } else if (path.type === 'ellipse' && path.points && path.points.length > 0) {
    const { minX, minY, maxX, maxY } = getPathBounds(path);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;
    
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  }
  
  // Apply fill and stroke
  if (path.fillColor && path.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (path.strokeColor) {
    ctx.stroke();
  }
}

// Utility to find and prepare paths with text
export function findPathsWithText(textNodes: any[], vectorPaths: any[]): PathWithText[] {
  const pathsWithText: PathWithText[] = textNodes.reduce((result: PathWithText[], textNode: any) => {
    if (textNode.pathId) {
      const path = vectorPaths.find((p: any) => p.id === textNode.pathId);
      if (path) {
        // Create SVG path data from the path points
        let d = '';
        
        if (path.type === 'path') {
          // For regular paths, convert points to SVG path data
          const firstPoint = path.points[0];
          d = `M ${firstPoint.x} ${firstPoint.y}`;
          
          for (let i = 1; i < path.points.length; i++) {
            const point = path.points[i];
            d += ` L ${point.x} ${point.y}`;
          }
          
          if (path.closed) {
            d += ' Z';
          }
        } else if (path.type === 'circle' && path.points && path.points.length > 0) {
          const { minX, minY, maxX, maxY } = getPathBounds(path);
          
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const radius = (maxX - minX) / 2;
          
          // Create elliptical arc path for SVG
          d = `M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`;
        } else if (path.type === 'rect' && path.points && path.points.length >= 4) {
          const { minX, minY, maxX, maxY } = getPathBounds(path);
          
          const rectWidth = maxX - minX;
          const rectHeight = maxY - minY;
          
          d = `M ${minX} ${minY} H ${minX + rectWidth} V ${minY + rectHeight} H ${minX} Z`;
        } else if (path.type === 'ellipse' && path.points && path.points.length > 0) {
          const { minX, minY, maxX, maxY } = getPathBounds(path);
          
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const radiusX = (maxX - minX) / 2;
          const radiusY = (maxY - minY) / 2;
          
          // Create elliptical arc path for SVG
          d = `M ${centerX + radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 1 ${centerX - radiusX} ${centerY} A ${radiusX} ${radiusY} 0 1 1 ${centerX + radiusX} ${centerY}`;
        }
        
        result.push({ d, textId: textNode.id, path });
      } else {
        console.log(`[Export Worker] Warning: Path not found for text-on-path (pathId: ${textNode.pathId})`);
      }
    }
    return result;
  }, []);
  
  return pathsWithText;
}

// Create a map of text nodes by ID for quick lookup
export function createTextNodesMap(textNodes: any[]): Record<string, any> {
  return textNodes.reduce((map: Record<string, any>, textNode: any) => {
    map[textNode.id] = textNode;
    return map;
  }, {});
}

// Utility to draw text along a path on a canvas
export function drawTextAlongPath(
  ctx: OffscreenCanvasRenderingContext2D, 
  path: any, 
  text: string, 
  fontSize: number = 16, 
  fontFamily: string = 'Arial', 
  fontWeight: string = 'normal', 
  fontStyle: string = 'normal', 
  fill: string = '#000000'
): void {
  // Set text properties
  ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = fill;
  
  // Draw text along the path (simplified implementation)
  const pathStartX = path.points[0].x;
  const pathStartY = path.points[0].y;
  
  ctx.save();
  ctx.translate(pathStartX, pathStartY);
  
  // If it's a circle, we need to rotate and position differently
  if (path.type === 'circle') {
    const { minX, minY, maxX, maxY } = getPathBounds(path);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Draw text in arc around circle
    const radius = (maxX - minX) / 2;
    const textLength = text.length;
    
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
    // For non-circle paths, use a linear distribution of text
    let totalLength = 0;
    const points = path.points;
    const segments = [];
    
    // Calculate the total length of the path and its segments
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      const segLength = Math.sqrt(dx * dx + dy * dy);
      totalLength += segLength;
      segments.push({ 
        start: points[i-1], 
        end: points[i], 
        length: segLength,
        angle: Math.atan2(dy, dx)
      });
    }
    
    // Distribute text characters along the path
    const textLength = text.length;
    const charSpacing = totalLength / textLength;
    
    let segmentIndex = 0;
    
    for (let i = 0; i < textLength; i++) {
      const targetPos = i * charSpacing;
      
      // Find the right segment for this character
      let accumulatedLength = 0;
      while (segmentIndex < segments.length && 
            accumulatedLength + segments[segmentIndex].length < targetPos) {
        accumulatedLength += segments[segmentIndex].length;
        segmentIndex++;
      }
      
      if (segmentIndex >= segments.length) segmentIndex = segments.length - 1;
      
      // Calculate position along the current segment
      const segment = segments[segmentIndex];
      const segmentPos = (targetPos - accumulatedLength) / segment.length;
      
      // Linear interpolation to find exact x,y
      const x = segment.start.x + segmentPos * (segment.end.x - segment.start.x);
      const y = segment.start.y + segmentPos * (segment.end.y - segment.start.y);
      
      // Draw the character
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(segment.angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  }
  
  ctx.restore();
}
