"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Italic, 
  Bold, 
  Underline, 
  Baseline, 
  PenTool 
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTextStore } from "@/lib/services/browser-design-studio/stores/text-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FontOption {
  name: string
  family: string
  category: string
}

const SYSTEM_FONTS: FontOption[] = [
  { name: "Arial", family: "Arial, sans-serif", category: "sans-serif" },
  { name: "Helvetica", family: "Helvetica, sans-serif", category: "sans-serif" },
  { name: "Times New Roman", family: "Times New Roman, serif", category: "serif" },
  { name: "Courier New", family: "Courier New, monospace", category: "monospace" },
  { name: "Georgia", family: "Georgia, serif", category: "serif" },
  { name: "Verdana", family: "Verdana, sans-serif", category: "sans-serif" },
  { name: "Roboto", family: "Roboto, sans-serif", category: "sans-serif" },
  { name: "Open Sans", family: "Open Sans, sans-serif", category: "sans-serif" },
  { name: "Lato", family: "Lato, sans-serif", category: "sans-serif" },
  { name: "Montserrat", family: "Montserrat, sans-serif", category: "sans-serif" },
]

interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  textDecoration: string
  color: string
  lineHeight: number
  letterSpacing: number
  textAlign: string
}

export default function TextPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentText, setCurrentText] = useState("")
  const [activeTab, setActiveTab] = useState("edit")
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontFamily: "Arial, sans-serif",
    fontSize: 24,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#000000",
    lineHeight: 1.2,
    letterSpacing: 0,
    textAlign: "left",
  })
  const [textOnPath, setTextOnPath] = useState(false)
  const [customFonts, setCustomFonts] = useState<FontOption[]>([])
  const [previewText, setPreviewText] = useState<string>("The quick brown fox jumps over the lazy dog")
  
  // Text store for state management
  const { 
    textNodes, 
    addTextNode, 
    updateTextNode, 
    removeTextNode, 
    selectedNodeId, 
    setSelectedNodeId 
  } = useTextStore()

  // Initialize canvas after component mount
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    
    if (!canvas || !ctx) return
    
    // Set canvas size
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
    
    // Draw background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Render text preview
    renderTextPreview()
  }, [textStyle, previewText])

  // Render text preview on canvas
  const renderTextPreview = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    
    if (!canvas || !ctx) return
    
    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set text styles
    ctx.font = `${textStyle.fontStyle} ${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamily}`
    ctx.fillStyle = textStyle.color
    ctx.textAlign = textStyle.textAlign as CanvasTextAlign
    
    // Calculate text position
    let textX = 20
    if (textStyle.textAlign === "center") {
      textX = canvas.width / 2
    } else if (textStyle.textAlign === "right") {
      textX = canvas.width - 20
    }
    
    // Draw text
    const textY = canvas.height / 2
    
    if (textOnPath) {
      // Draw text on curved path
      drawTextAlongArc(ctx, previewText, canvas.width / 2, canvas.height / 2, 100, 0, Math.PI)
    } else {
      // Draw normal text
      ctx.fillText(previewText, textX, textY)
      
      // Draw underline if needed
      if (textStyle.textDecoration === "underline") {
        const textWidth = ctx.measureText(previewText).width
        let underlineY = textY + 3
        
        // Calculate underline position based on alignment
        let startX = textX
        if (textStyle.textAlign === "center") {
          startX = textX - textWidth / 2
        } else if (textStyle.textAlign === "right") {
          startX = textX - textWidth
        }
        
        ctx.beginPath()
        ctx.moveTo(startX, underlineY)
        ctx.lineTo(startX + textWidth, underlineY)
        ctx.strokeStyle = textStyle.color
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }

  // Function to draw text along an arc
  const drawTextAlongArc = (
    ctx: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    // Save context
    ctx.save()
    
    // Calculate angle per character
    const anglePerChar = (endAngle - startAngle) / text.length
    
    // Start at the beginning
    let angle = startAngle
    
    // Draw each character
    for (let i = 0; i < text.length; i++) {
      ctx.save()
      
      // Calculate position
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      // Rotate to position
      ctx.translate(x, y)
      ctx.rotate(angle + Math.PI / 2) // Rotate perpendicular to radius
      
      // Draw character
      ctx.fillText(text[i], 0, 0)
      
      // Restore and increment angle
      ctx.restore()
      angle += anglePerChar
    }
    
    // Restore context
    ctx.restore()
  }

  // Add current text as a new text node
  const addText = () => {
    if (!currentText.trim()) return
    
    addTextNode({
      id: `text-${Date.now()}`,
      text: currentText,
      style: { ...textStyle },
      position: { x: 100, y: 100 },
      onPath: textOnPath,
      pathData: textOnPath ? { type: "arc", radius: 100, startAngle: 0, endAngle: Math.PI } : undefined,
    })
    
    setCurrentText("")
  }

  // Load custom font from file
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    
    try {
      // Create a FontFace instance
      const fontName = file.name.split(".")[0]
      const fontUrl = URL.createObjectURL(file)
      const fontFace = new FontFace(fontName, `url(${fontUrl})`)
      
      // Load the font
      const loadedFont = await fontFace.load()
      
      // Add to document fonts
      document.fonts.add(loadedFont)
      
      // Add to custom fonts list
      setCustomFonts([...customFonts, {
        name: fontName,
        family: fontName,
        category: "custom",
      }])
      
      // Use the new font
      setTextStyle({
        ...textStyle,
        fontFamily: fontName,
      })
    } catch (error) {
      console.error("Error loading font:", error)
    }
  }

  // Handle font family change
  const handleFontFamilyChange = (value: string) => {
    setTextStyle({
      ...textStyle,
      fontFamily: value,
    })
  }

  // Toggle bold text
  const toggleBold = () => {
    setTextStyle({
      ...textStyle,
      fontWeight: textStyle.fontWeight === "bold" ? "normal" : "bold",
    })
  }

  // Toggle italic text
  const toggleItalic = () => {
    setTextStyle({
      ...textStyle,
      fontStyle: textStyle.fontStyle === "italic" ? "normal" : "italic",
    })
  }

  // Toggle underline text
  const toggleUnderline = () => {
    setTextStyle({
      ...textStyle,
      textDecoration: textStyle.textDecoration === "underline" ? "none" : "underline",
    })
  }

  // Set text alignment
  const setTextAlign = (align: string) => {
    setTextStyle({
      ...textStyle,
      textAlign: align,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="edit">Edit Text</TabsTrigger>
          <TabsTrigger value="manage">Manage Fonts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="flex-1 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Text Content</h3>
                <Textarea
                  placeholder="Enter your text here..."
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  className="h-32"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Text Style</h3>
                <div className="space-y-2">
                  <Select 
                    value={textStyle.fontFamily.split(",")[0].trim()}
                    onValueChange={handleFontFamilyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font Family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                      <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                      {customFonts.map((font) => (
                        <SelectItem key={font.name} value={font.family}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={8}
                      max={200}
                      value={textStyle.fontSize}
                      onChange={(e) => setTextStyle({
                        ...textStyle,
                        fontSize: parseInt(e.target.value) || 24
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">px</span>
                    
                    <div className="flex ml-4 border rounded overflow-hidden">
                      <Button
                        type="button"
                        variant={textStyle.fontWeight === "bold" ? "default" : "ghost"}
                        onClick={toggleBold}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={textStyle.fontStyle === "italic" ? "default" : "ghost"}
                        onClick={toggleItalic}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={textStyle.textDecoration === "underline" ? "default" : "ghost"}
                        onClick={toggleUnderline}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textStyle.color}
                      onChange={(e) => setTextStyle({
                        ...textStyle,
                        color: e.target.value
                      })}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    
                    <div className="flex ml-4 border rounded overflow-hidden">
                      <Button
                        type="button"
                        variant={textStyle.textAlign === "left" ? "default" : "ghost"}
                        onClick={() => setTextAlign("left")}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={textStyle.textAlign === "center" ? "default" : "ghost"}
                        onClick={() => setTextAlign("center")}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={textStyle.textAlign === "right" ? "default" : "ghost"}
                        onClick={() => setTextAlign("right")}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={textOnPath}
                        onChange={(e) => setTextOnPath(e.target.checked)}
                      />
                      Text on Path
                    </label>
                    
                    {textOnPath && (
                      <Button size="sm" className="ml-2">
                        <PenTool className="h-4 w-4 mr-1" />
                        Edit Path
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <Button onClick={addText} disabled={!currentText.trim()}>
                <Type className="h-4 w-4 mr-2" />
                Add Text
              </Button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <Card className="overflow-hidden h-64">
                <CardContent className="p-0 h-full">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full" 
                  />
                </CardContent>
              </Card>
              
              <div className="mt-4">
                <Input
                  placeholder="Preview text..."
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {textNodes.length > 0 && (
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium mb-2">Text Nodes</h3>
              <div className="space-y-2">
                {textNodes.map((node) => (
                  <div 
                    key={node.id} 
                    className={`
                      p-2 rounded border cursor-pointer
                      ${selectedNodeId === node.id ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}
                    `}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        <span className="font-medium text-sm truncate max-w-xs">
                          {node.text}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTextNode(node.id)
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manage" className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Upload Custom Font</h3>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontUpload}
              />
              <Button type="button">Upload</Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: .ttf, .otf, .woff, .woff2
            </p>
          </div>
          
          {customFonts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Your Custom Fonts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customFonts.map((font) => (
                  <Card key={font.name} className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ fontFamily: font.family }}>
                          {font.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Custom Font
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setTextStyle({
                          ...textStyle,
                          fontFamily: font.family,
                        })}
                      >
                        Use
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-2">System Fonts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {SYSTEM_FONTS.map((font) => (
                <Card key={font.name} className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ fontFamily: font.family }}>
                        {font.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {font.category}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setTextStyle({
                        ...textStyle,
                        fontFamily: font.family,
                      })}
                    >
                      Use
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
