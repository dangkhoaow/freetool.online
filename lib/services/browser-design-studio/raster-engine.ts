/**
 * Raster Engine
 * 
 * Provides pixel-based image manipulation and brush operations
 * Uses WebAssembly for complex filter processing
 */

import { RasterLayer } from './stores/raster-store'

export interface RasterEngineOptions {
  width?: number
  height?: number
}

export interface BrushStyle {
  size: number
  hardness: number
  opacity: number
  color: string
  blendMode: string
}

export class RasterEngine {
  private width: number = 1200
  private height: number = 800
  private layers: RasterLayer[] = []
  private isWasmLoaded: boolean = false
  private wasmModule: any = null
  
  // Keep track of brush presets
  private brushPresets: { [key: string]: BrushStyle } = {
    'basic': {
      size: 10,
      hardness: 0.8,
      opacity: 1,
      color: '#000000',
      blendMode: 'source-over'
    },
    'soft': {
      size: 20,
      hardness: 0.5,
      opacity: 0.7,
      color: '#000000',
      blendMode: 'source-over'
    },
    'watercolor': {
      size: 30,
      hardness: 0.3,
      opacity: 0.5,
      color: '#000000',
      blendMode: 'multiply'
    },
    'airbrush': {
      size: 25,
      hardness: 0.2,
      opacity: 0.3,
      color: '#000000',
      blendMode: 'source-over'
    },
    'eraser': {
      size: 15,
      hardness: 0.9,
      opacity: 1,
      color: '#ffffff',
      blendMode: 'destination-out'
    }
  }

  constructor(options?: RasterEngineOptions) {
    if (options) {
      this.width = options.width || this.width
      this.height = options.height || this.height
    }

    // Load WASM module for image processing
    this.loadWasmModule().catch(err => {
      console.error('Failed to load raster WASM module:', err)
      this.isWasmLoaded = false
    })
  }

  /**
   * Initializes the canvas with the specified dimensions
   */
  public initCanvas(width: number, height: number): void {
    this.width = width
    this.height = height

    // Add a default layer if none exists
    if (this.layers.length === 0) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        
        const imageData = ctx.getImageData(0, 0, width, height)
        
        this.layers.push({
          id: `layer-${Date.now()}`,
          name: 'Background',
          visible: true,
          opacity: 1,
          blendMode: 'normal',
          imageData
        })
      }
    }
  }

  /**
   * Loads the WebAssembly module for image processing
   */
  private async loadWasmModule(): Promise<void> {
    try {
      // In a real implementation, this would load an actual WASM module
      // For this demo, we're simulating the WASM module
      this.wasmModule = {
        applyFilter: (imageData: ImageData, filterType: string, options: any) => {
          console.log(`Applying ${filterType} filter to image data`)
          return imageData // Would return filtered image data
        },
        applyBrushStroke: (imageData: ImageData, x: number, y: number, brushOptions: BrushStyle) => {
          console.log(`Applying brush stroke at (${x}, ${y})`)
          return imageData // Would return modified image data
        }
      }
      
      this.isWasmLoaded = true
      console.log('Raster WASM module loaded successfully')
    } catch (error) {
      console.error('Error loading raster WASM module:', error)
      throw error
    }
  }

  /**
   * Applies a brush stroke to the active layer
   */
  public applyBrushStroke(
    x: number,
    y: number,
    options: BrushStyle,
    layerIndex: number = 0
  ): ImageData | null {
    if (!this.isWasmLoaded) {
      console.error('WASM module not loaded')
      return null
    }

    if (layerIndex >= this.layers.length || !this.layers[layerIndex].imageData) {
      console.error('Invalid layer or no image data')
      return null
    }

    try {
      const layer = this.layers[layerIndex]
      // This would use the WASM module in a real implementation
      const updatedImageData = this.wasmModule.applyBrushStroke(
        layer.imageData,
        x,
        y,
        options
      )
      
      // Update the layer with the new image data
      this.layers[layerIndex] = {
        ...layer,
        imageData: updatedImageData
      }
      
      return updatedImageData
    } catch (error) {
      console.error('Brush stroke application failed:', error)
      return null
    }
  }

  /**
   * Applies a filter to a layer
   */
  public applyFilter(
    filterType: string,
    options: any,
    layerIndex: number = 0
  ): ImageData | null {
    if (!this.isWasmLoaded) {
      console.error('WASM module not loaded')
      return null
    }

    if (layerIndex >= this.layers.length || !this.layers[layerIndex].imageData) {
      console.error('Invalid layer or no image data')
      return null
    }

    try {
      const layer = this.layers[layerIndex]
      // This would use the WASM module in a real implementation
      const filteredImageData = this.wasmModule.applyFilter(
        layer.imageData,
        filterType,
        options
      )
      
      // Update the layer with the filtered image data
      this.layers[layerIndex] = {
        ...layer,
        imageData: filteredImageData
      }
      
      return filteredImageData
    } catch (error) {
      console.error('Filter application failed:', error)
      return null
    }
  }

  /**
   * Creates a new layer
   */
  public createLayer(name: string = 'New Layer'): RasterLayer {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Failed to create canvas context')
    }
    
    // Create transparent layer
    const imageData = ctx.createImageData(this.width, this.height)
    
    const newLayer: RasterLayer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      imageData
    }
    
    this.layers.push(newLayer)
    return newLayer
  }

  /**
   * Gets all raster layers
   */
  public getLayers(): RasterLayer[] {
    return [...this.layers]
  }

  /**
   * Gets a brush preset by name
   */
  public getBrushPreset(name: string): BrushStyle | null {
    return this.brushPresets[name] || null
  }

  /**
   * Gets all available brush presets
   */
  public getBrushPresets(): { [key: string]: BrushStyle } {
    return { ...this.brushPresets }
  }

  /**
   * Adds a new brush preset
   */
  public addBrushPreset(name: string, style: BrushStyle): void {
    this.brushPresets[name] = { ...style }
  }

  /**
   * Saves the current state for undo/redo
   */
  public saveState(): any {
    return {
      layers: [...this.layers]
    }
  }

  /**
   * Restores a previous state
   */
  public restoreState(state: any): void {
    if (state && state.layers) {
      this.layers = [...state.layers]
    }
  }
}
