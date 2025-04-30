/**
 * Text Engine
 * 
 * Provides text manipulation, font management, and text-on-path capabilities
 * Uses OpenType.js for font parsing and glyph management
 */

import { TextNode, TextStyle } from './stores/text-store'

export interface TextEngineOptions {
  width?: number
  height?: number
}

interface FontData {
  name: string
  family: string
  font: any // Would be an OpenType.js Font instance in real implementation
  url?: string
  isCustom: boolean
}

export class TextEngine {
  private width: number = 1200
  private height: number = 800
  private textNodes: TextNode[] = []
  private fonts: Map<string, FontData> = new Map()
  private isLibraryLoaded: boolean = false
  private openTypeLibrary: any = null

  constructor(options?: TextEngineOptions) {
    if (options) {
      this.width = options.width || this.width
      this.height = options.height || this.height
    }

    // Load OpenType.js library
    this.loadOpenTypeLibrary().catch(err => {
      console.error('Failed to load OpenType library:', err)
      this.isLibraryLoaded = false
    })

    // Initialize with system fonts
    this.initializeSystemFonts()
  }

  /**
   * Initializes the canvas with the specified dimensions
   */
  public initCanvas(width: number, height: number): void {
    this.width = width
    this.height = height
  }

  /**
   * Loads the OpenType.js library
   */
  private async loadOpenTypeLibrary(): Promise<void> {
    try {
      // In a real implementation, this would load actual OpenType.js
      this.openTypeLibrary = {
        parse: (buffer: ArrayBuffer) => {
          console.log('Parsing font data')
          return { 
            // Simulated font object
            familyName: 'Sample Font',
            styleName: 'Regular',
            getPath: (text: string, x: number, y: number, fontSize: number) => {
              console.log(`Generating path for "${text}" at (${x}, ${y})`)
              return { /* path data */ }
            }
          }
        },
        load: (url: string) => {
          console.log(`Loading font from URL: ${url}`)
          return Promise.resolve({
            // Simulated font object
            familyName: 'Remote Font',
            styleName: 'Regular',
          })
        }
      }
      
      this.isLibraryLoaded = true
      console.log('OpenType library loaded successfully')
    } catch (error) {
      console.error('Error loading OpenType library:', error)
      throw error
    }
  }

  /**
   * Initializes the system font list
   */
  private initializeSystemFonts(): void {
    // In a real implementation, we'd detect available system fonts
    // For this demo, we're adding a few common system fonts
    const systemFonts = [
      { name: 'Arial', family: 'Arial, sans-serif' },
      { name: 'Helvetica', family: 'Helvetica, sans-serif' },
      { name: 'Times New Roman', family: 'Times New Roman, serif' },
      { name: 'Georgia', family: 'Georgia, serif' },
      { name: 'Courier New', family: 'Courier New, monospace' },
      { name: 'Verdana', family: 'Verdana, sans-serif' }
    ]
    
    systemFonts.forEach(font => {
      this.fonts.set(font.name, {
        name: font.name,
        family: font.family,
        font: null, // System fonts don't need OpenType.js font instances
        isCustom: false
      })
    })
  }

  /**
   * Loads a custom font from file data
   */
  public async loadFont(name: string, arrayBuffer: ArrayBuffer): Promise<FontData | null> {
    if (!this.isLibraryLoaded) {
      console.error('OpenType library not loaded')
      return null
    }

    try {
      // Parse the font using OpenType.js
      const font = this.openTypeLibrary.parse(arrayBuffer)
      
      // Create a FontFace and add it to the document
      const fontFace = new FontFace(name, arrayBuffer)
      await fontFace.load()
      document.fonts.add(fontFace)
      
      // Store font in our collection
      const fontData: FontData = {
        name,
        family: name,
        font, // The parsed OpenType.js font instance
        isCustom: true
      }
      
      this.fonts.set(name, fontData)
      return fontData
    } catch (error) {
      console.error('Font loading failed:', error)
      return null
    }
  }

  /**
   * Loads a font from a URL
   */
  public async loadFontFromUrl(name: string, url: string): Promise<FontData | null> {
    if (!this.isLibraryLoaded) {
      console.error('OpenType library not loaded')
      return null
    }

    try {
      // Load the font using OpenType.js
      const font = await this.openTypeLibrary.load(url)
      
      // Create a FontFace and add it to the document
      const fontFace = new FontFace(name, `url(${url})`)
      await fontFace.load()
      document.fonts.add(fontFace)
      
      // Store font in our collection
      const fontData: FontData = {
        name,
        family: name,
        font, // The parsed OpenType.js font instance
        url,
        isCustom: true
      }
      
      this.fonts.set(name, fontData)
      return fontData
    } catch (error) {
      console.error('Font loading from URL failed:', error)
      return null
    }
  }

  /**
   * Creates a new text node
   */
  public createTextNode(
    text: string,
    style: TextStyle,
    x: number = 100,
    y: number = 100,
    onPath: boolean = false
  ): TextNode {
    const textNode: TextNode = {
      id: `text-${Date.now()}`,
      text,
      style,
      position: { x, y },
      onPath: onPath,
      pathData: onPath ? {
        type: 'arc',
        radius: 100,
        startAngle: 0,
        endAngle: Math.PI
      } : undefined
    }
    
    this.textNodes.push(textNode)
    return textNode
  }

  /**
   * Updates an existing text node
   */
  public updateTextNode(id: string, updatedNode: Partial<TextNode>): boolean {
    const index = this.textNodes.findIndex(node => node.id === id)
    if (index === -1) return false
    
    this.textNodes[index] = {
      ...this.textNodes[index],
      ...updatedNode
    }
    
    return true
  }

  /**
   * Renders text along a path
   */
  public renderTextOnPath(
    ctx: CanvasRenderingContext2D,
    textNode: TextNode
  ): void {
    if (!textNode.pathData || !textNode.onPath) {
      console.error('No path data or text is not on path')
      return
    }

    const { text, style, pathData, position } = textNode
    
    if (pathData.type === 'arc') {
      // Handle arc text
      const { radius = 100, startAngle = 0, endAngle = Math.PI } = pathData
      
      // Calculate angle per character
      const anglePerChar = (endAngle - startAngle) / text.length
      
      // Set font
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
      ctx.fillStyle = style.color
      
      // Render each character along the arc
      for (let i = 0; i < text.length; i++) {
        const angle = startAngle + anglePerChar * i
        
        // Calculate position
        const x = position.x + radius * Math.cos(angle)
        const y = position.y + radius * Math.sin(angle)
        
        // Save context
        ctx.save()
        
        // Translate and rotate
        ctx.translate(x, y)
        ctx.rotate(angle + Math.PI / 2) // Rotate perpendicular to radius
        
        // Draw character
        ctx.fillText(text[i], 0, 0)
        
        // Restore context
        ctx.restore()
      }
    } else if (pathData.type === 'line' || pathData.type === 'custom') {
      // Handle line or custom path
      // Logic for custom paths would go here...
      console.log('Custom path text rendering not implemented in this demo')
    }
  }

  /**
   * Gets all available fonts
   */
  public getFonts(): FontData[] {
    return Array.from(this.fonts.values())
  }

  /**
   * Gets a specific font by name
   */
  public getFont(name: string): FontData | undefined {
    return this.fonts.get(name)
  }

  /**
   * Gets all text nodes
   */
  public getLayers(): TextNode[] {
    return [...this.textNodes]
  }

  /**
   * Saves the current state for undo/redo
   */
  public saveState(): any {
    return {
      textNodes: [...this.textNodes]
    }
  }

  /**
   * Restores a previous state
   */
  public restoreState(state: any): void {
    if (state && state.textNodes) {
      this.textNodes = [...state.textNodes]
    }
  }
}
