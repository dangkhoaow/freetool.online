/**
 * Export Service
 * 
 * Handles exporting the design to various formats including SVG, PNG, PDF, AI, and CSS
 * Uses Web Workers for performance and WASM modules for specific format generation
 */

import { PathData } from './stores/vector-store'
import { RasterLayer } from './stores/raster-store'
import { TextNode } from './stores/text-store'

export interface ExportOptions {
  width?: number
  height?: number
  includeVector?: boolean
  includeRaster?: boolean
  includeText?: boolean
  quality?: number
  scale?: number
  includeBackground?: boolean
  optimizeSize?: boolean
}

type ProgressCallback = (progress: number, status?: string) => void

export class ExportService {
  private isWasmLoaded: boolean = false
  private exportWasmModule: any = null
  
  constructor() {
    // Load WASM modules for export operations
    this.loadWasmModule().catch(err => {
      console.error('Failed to load export WASM module:', err)
      this.isWasmLoaded = false
    })
  }
  
  /**
   * Loads the WebAssembly module for export operations
   */
  private async loadWasmModule(): Promise<void> {
    try {
      // In a real implementation, this would load an actual WASM module
      // For this demo, we're simulating the WASM module
      this.exportWasmModule = {
        generateAI: (vectors: any[], raster: any[], text: any[]) => {
          console.log('Generating Adobe Illustrator file')
          return new Uint8Array(100) // Dummy binary data
        },
        generatePDF: (vectors: any[], raster: any[], text: any[]) => {
          console.log('Generating PDF file')
          return new Uint8Array(100) // Dummy binary data
        },
        optimizeSVG: (svgString: string) => {
          console.log('Optimizing SVG')
          return svgString // Would return optimized SVG
        }
      }
      
      this.isWasmLoaded = true
      console.log('Export WASM module loaded successfully')
    } catch (error) {
      console.error('Error loading export WASM module:', error)
      throw error
    }
  }
  
  /**
   * Exports the design to SVG format
   */
  public async exportToSVG(
    vectorPaths: PathData[],
    textNodes: TextNode[],
    options: ExportOptions = {},
    onProgress?: ProgressCallback
  ): Promise<string> {
    try {
      if (onProgress) onProgress(0.1, 'Preparing SVG export...')
      
      // Default options
      const {
        width = 1200,
        height = 800,
        includeVector = true,
        includeText = true,
        includeBackground = true,
        optimizeSize = true
      } = options
      
      if (onProgress) onProgress(0.3, 'Generating SVG elements...')
      
      // Start SVG document
      let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
`
      
      // Add background if needed
      if (includeBackground) {
        svg += `  <rect width="${width}" height="${height}" fill="white" />
`
      }
      
      // Add vector paths if needed
      if (includeVector && vectorPaths.length > 0) {
        if (onProgress) onProgress(0.5, 'Processing vector elements...')
        
        // Iterate through vector paths
        vectorPaths.forEach(path => {
          if (!path) return
          
          if (path.type === 'path' && path.d) {
            svg += `  <path d="${path.d}" fill="${path.fill || 'none'}" stroke="${path.stroke || '#000'}" stroke-width="${path.strokeWidth || 1}" ${path.opacity !== undefined ? `opacity="${path.opacity}"` : ''} />
`
          } else if (path.type === 'rect') {
            svg += `  <rect x="${path.x || 0}" y="${path.y || 0}" width="${path.width}" height="${path.height}" fill="${path.fill || 'none'}" stroke="${path.stroke || '#000'}" stroke-width="${path.strokeWidth || 1}" />
`
          } else if (path.type === 'circle') {
            svg += `  <circle cx="${path.cx || 0}" cy="${path.cy || 0}" r="${path.r}" fill="${path.fill || 'none'}" stroke="${path.stroke || '#000'}" stroke-width="${path.strokeWidth || 1}" />
`
          } 
        })
      }
      
      // Add text nodes if needed
      if (includeText && textNodes.length > 0) {
        if (onProgress) onProgress(0.7, 'Processing text elements...')
        
        // Iterate through text nodes
        textNodes.forEach(node => {
          if (!node) return
          
          svg += `  <text x="${node.x || 0}" y="${node.y || 0}" font-family="${node.fontFamily || 'Arial'}" font-size="${node.fontSize || 16}px" fill="${node.fill || '#000'}">${node.text || ''}</text>
`
        })
      }
      
      // Close SVG document
      svg += `</svg>`
      
      if (optimizeSize && this.isWasmLoaded) {
        if (onProgress) onProgress(0.9, 'Optimizing SVG...')
        svg = this.exportWasmModule.optimizeSVG(svg)
      }
      
      if (onProgress) onProgress(1.0, 'SVG export complete')
      
      return svg
    } catch (error) {
      console.error('Error exporting to SVG:', error)
      throw error
    }
  }
  
  /**
   * Exports the design to PNG format
   */
  public async exportToPNG(
    vectorPaths: PathData[],
    rasterLayers: RasterLayer[],
    textNodes: TextNode[],
    options: ExportOptions = {},
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    try {
      if (onProgress) onProgress(0.1, 'Preparing PNG export...')
      
      // Default options
      const {
        width = 1200,
        height = 800,
        includeVector = true,
        includeRaster = true,
        includeText = true,
        quality = 0.9,
        scale = 1,
        includeBackground = true
      } = options
      
      // Create a canvas for rendering
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Failed to create canvas context')
      }
      
      // Scale for high resolution
      ctx.scale(scale, scale)
      
      // Fill background if needed
      if (includeBackground) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)
      }
      
      // Draw raster layers
      if (includeRaster && rasterLayers.length > 0) {
        if (onProgress) onProgress(0.3, 'Drawing raster layers...')
        
        for (const layer of rasterLayers) {
          if (!layer.visible || !layer.imageData) continue
          
          // Set opacity and blend mode
          ctx.globalAlpha = layer.opacity
          ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation
          
          // Draw layer image data
          ctx.putImageData(layer.imageData, 0, 0)
        }
        
        // Reset composite operation and alpha
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
      
      // Draw vector paths
      if (includeVector && vectorPaths.length > 0) {
        if (onProgress) onProgress(0.5, 'Drawing vector paths...')
        
        for (const path of vectorPaths) {
          if (path.points.length < 2) continue
          
          // Begin path
          ctx.beginPath()
          ctx.moveTo(path.points[0].x, path.points[0].y)
          
          // Draw path segments
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y)
          }
          
          // Close path if needed
          if (path.closed) {
            ctx.closePath()
          }
          
          // Apply styles
          ctx.strokeStyle = path.strokeColor
          ctx.lineWidth = path.strokeWidth
          ctx.fillStyle = path.fill
          
          // Draw stroke and fill
          if (path.fill !== 'none' && path.fill !== 'transparent') {
            ctx.fill()
          }
          ctx.stroke()
        }
      }
      
      // Draw text
      if (includeText && textNodes.length > 0) {
        if (onProgress) onProgress(0.7, 'Drawing text elements...')
        
        for (const node of textNodes) {
          if (!node.text.trim()) continue
          
          // Apply text styles
          ctx.font = `${node.style.fontStyle} ${node.style.fontWeight} ${node.style.fontSize}px ${node.style.fontFamily}`
          ctx.fillStyle = node.style.color
          ctx.textAlign = node.style.textAlign as CanvasTextAlign
          
          if (node.onPath && node.pathData) {
            // Handle text on path with custom rendering
            // This is a simplified implementation
            if (node.pathData.type === 'arc') {
              const { radius = 100, startAngle = 0, endAngle = Math.PI } = node.pathData
              
              // Calculate angle per character
              const anglePerChar = (endAngle - startAngle) / node.text.length
              
              // Draw each character along the arc
              for (let i = 0; i < node.text.length; i++) {
                const angle = startAngle + anglePerChar * i
                
                // Calculate position
                const x = node.position.x + radius * Math.cos(angle)
                const y = node.position.y + radius * Math.sin(angle)
                
                // Save context
                ctx.save()
                
                // Translate and rotate
                ctx.translate(x, y)
                ctx.rotate(angle + Math.PI / 2) // Rotate perpendicular to radius
                
                // Draw character
                ctx.fillText(node.text[i], 0, 0)
                
                // Restore context
                ctx.restore()
              }
            }
          } else {
            // Normal text
            ctx.fillText(node.text, node.position.x, node.position.y)
            
            // Add underline if needed
            if (node.style.textDecoration === 'underline') {
              const textWidth = ctx.measureText(node.text).width
              const underlineY = node.position.y + 3
              
              // Calculate underline position based on alignment
              let startX = node.position.x
              if (node.style.textAlign === 'center') {
                startX = node.position.x - textWidth / 2
              } else if (node.style.textAlign === 'right') {
                startX = node.position.x - textWidth
              }
              
              ctx.beginPath()
              ctx.moveTo(startX, underlineY)
              ctx.lineTo(startX + textWidth, underlineY)
              ctx.strokeStyle = node.style.color
              ctx.lineWidth = 1
              ctx.stroke()
            }
          }
        }
      }
      
      // Convert canvas to PNG blob
      if (onProgress) onProgress(0.9, 'Converting to PNG...')
      
      // Create blob from canvas
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (onProgress) onProgress(1.0, 'PNG export complete')
              resolve(blob)
            } else {
              reject(new Error('Failed to create PNG blob'))
            }
          },
          'image/png',
          quality
        )
      })
    } catch (error) {
      console.error('PNG export failed:', error)
      throw error
    }
  }
  
  /**
   * Exports the design to JPG format
   */
  public async exportToJPG(
    vectorPaths: PathData[],
    rasterLayers: RasterLayer[],
    textNodes: TextNode[],
    options: ExportOptions = {},
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    try {
      // JPG export is similar to PNG but with different image format
      if (onProgress) onProgress(0.1, 'Preparing JPG export...')
      
      // Use the same canvas rendering approach as PNG
      // but with different toBlob parameters
      
      // The rest of the implementation would be identical to exportToPNG
      // so we're reusing that code but changing the final blob format
      const pngBlob = await this.exportToPNG(
        vectorPaths,
        rasterLayers,
        textNodes,
        {
          ...options,
          includeBackground: true // JPG always needs background
        },
        (progress, status) => {
          // Remap progress to leave room for conversion
          if (onProgress) onProgress(progress * 0.9, status)
        }
      )
      
      // Convert the canvas to JPG blob
      if (onProgress) onProgress(0.95, 'Converting to JPG...')
      
      // Create a new canvas to convert PNG to JPG
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Failed to create canvas context')
      }
      
      // Default options
      const {
        width = 1200,
        height = 800,
        scale = 1,
        quality = 0.9
      } = options
      
      canvas.width = width * scale
      canvas.height = height * scale
      
      // Draw the PNG to canvas
      const img = new Image()
      img.src = URL.createObjectURL(pngBlob)
      
      return new Promise<Blob>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(img.src)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (onProgress) onProgress(1.0, 'JPG export complete')
                resolve(blob)
              } else {
                reject(new Error('Failed to create JPG blob'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          reject(new Error('Failed to load PNG for conversion to JPG'))
        }
      })
    } catch (error) {
      console.error('JPG export failed:', error)
      throw error
    }
  }
  
  /**
   * Exports the design to PDF format
   */
  public async exportToPDF(
    vectorPaths: PathData[],
    rasterLayers: RasterLayer[],
    textNodes: TextNode[],
    options: ExportOptions = {},
    onProgress?: ProgressCallback
  ): Promise<Uint8Array> {
    try {
      if (!this.isWasmLoaded) {
        throw new Error('WASM module not loaded')
      }
      
      if (onProgress) onProgress(0.1, 'Preparing PDF export...')
      
      // Default options
      const {
        includeVector = true,
        includeRaster = true,
        includeText = true
      } = options
      
      // Prepare data for the WASM module
      if (onProgress) onProgress(0.3, 'Preparing vector data...')
      
      // Filter data based on options
      const vectorData = includeVector ? vectorPaths : []
      const rasterData = includeRaster ? rasterLayers : []
      const textData = includeText ? textNodes : []
      
      // Use WASM module to generate PDF
      if (onProgress) onProgress(0.5, 'Generating PDF...')
      const pdfData = this.exportWasmModule.generatePDF(vectorData, rasterData, textData)
      
      if (onProgress) onProgress(1.0, 'PDF export complete')
      return pdfData
    } catch (error) {
      console.error('PDF export failed:', error)
      throw error
    }
  }
  
  /**
   * Exports the design to Adobe Illustrator format
   */
  public async exportToAI(
    vectorPaths: PathData[],
    rasterLayers: RasterLayer[],
    textNodes: TextNode[],
    options: ExportOptions = {},
    onProgress?: ProgressCallback
  ): Promise<Uint8Array> {
    try {
      if (!this.isWasmLoaded) {
        throw new Error('WASM module not loaded')
      }
      
      if (onProgress) onProgress(0.1, 'Preparing AI export...')
      
      // Default options
      const {
        includeVector = true,
        includeRaster = true,
        includeText = true
      } = options
      
      // Prepare data for the WASM module
      if (onProgress) onProgress(0.3, 'Preparing vector data...')
      
      // Filter data based on options
      const vectorData = includeVector ? vectorPaths : []
      const rasterData = includeRaster ? rasterLayers : []
      const textData = includeText ? textNodes : []
      
      // Use WASM module to generate AI file
      if (onProgress) onProgress(0.5, 'Generating AI file...')
      const aiData = this.exportWasmModule.generateAI(vectorData, rasterData, textData)
      
      if (onProgress) onProgress(1.0, 'AI export complete')
      return aiData
    } catch (error) {
      console.error('AI export failed:', error)
      throw error
    }
  }
  
  /**
   * Exports the design to CSS
   */
  public async exportToCSS(
    vectorPaths: PathData[],
    textNodes: TextNode[],
    options: ExportOptions = {},
    onProgress?: ProgressCallback
  ): Promise<string> {
    try {
      if (onProgress) onProgress(0.1, 'Preparing CSS export...')
      
      // Generate CSS
      let css = '/* Generated CSS from Browser Design Studio */\n\n'
      
      // Add container styles
      css += `.design-container {\n  position: relative;\n  width: ${options.width || 1200}px;\n  height: ${options.height || 800}px;\n}\n\n`
      
      // Add vector shapes as CSS
      if (vectorPaths.length > 0) {
        if (onProgress) onProgress(0.3, 'Converting vector shapes to CSS...')
        
        vectorPaths.forEach((path, index) => {
          // For simple paths, convert to CSS shapes
          if (path.closed && path.points.length <= 4) {
            // Rectangle
            const points = path.points
            const minX = Math.min(...points.map(p => p.x))
            const minY = Math.min(...points.map(p => p.y))
            const maxX = Math.max(...points.map(p => p.x))
            const maxY = Math.max(...points.map(p => p.y))
            const width = maxX - minX
            const height = maxY - minY
            
            css += `.shape-${index} {\n  position: absolute;\n  left: ${minX}px;\n  top: ${minY}px;\n  width: ${width}px;\n  height: ${height}px;\n  background-color: ${path.fill === 'none' ? 'transparent' : path.fill};\n  border: ${path.strokeWidth}px solid ${path.strokeColor};\n}\n\n`
          } else {
            // Complex shapes as clip-path or SVG background
            css += `.shape-${index} {\n  position: absolute;\n  /* Complex shape - use SVG or clip-path in actual implementation */\n}\n\n`
          }
        })
      }
      
      // Add text styles
      if (textNodes.length > 0) {
        if (onProgress) onProgress(0.6, 'Converting text to CSS...')
        
        textNodes.forEach((node, index) => {
          css += `.text-${index} {\n  position: absolute;\n  left: ${node.position.x}px;\n  top: ${node.position.y}px;\n  font-family: ${node.style.fontFamily};\n  font-size: ${node.style.fontSize}px;\n  font-weight: ${node.style.fontWeight};\n  font-style: ${node.style.fontStyle};\n  color: ${node.style.color};\n  text-decoration: ${node.style.textDecoration};\n  text-align: ${node.style.textAlign};\n}\n\n`
        })
      }
      
      // Generate HTML example
      css += '/* Example HTML structure */\n/*\n<div class="design-container">\n'
      
      vectorPaths.forEach((_, index) => {
        css += `  <div class="shape-${index}"></div>\n`
      })
      
      textNodes.forEach((node, index) => {
        css += `  <div class="text-${index}">${node.text}</div>\n`
      })
      
      css += '</div>\n*/\n'
      
      if (onProgress) onProgress(1.0, 'CSS export complete')
      return css
    } catch (error) {
      console.error('CSS export failed:', error)
      throw error
    }
  }
}
