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
import { useVectorStore } from "@/lib/services/browser-design-studio/stores/vector-store"

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
  const [isCreatingPathForText, setIsCreatingPathForText] = useState(false)
  const [pendingTextId, setPendingTextId] = useState<string | null>(null)

  // Text store for state management
  const { 
    textNodes, 
    addTextNode, 
    updateTextNode, 
    removeTextNode, 
    selectedNodeId, 
    setSelectedNodeId 
  } = useTextStore()

  // Get the vector store to access paths
  const { paths, selectedPathId } = useVectorStore()

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
      // Check if we're editing a selected node with path data
      const selectedNode = selectedNodeId ? textNodes.find(node => node.id === selectedNodeId) : null;
      
      if (selectedNode && selectedNode.pathData) {
        console.log("[TextPanel] Rendering preview with path data from selected node");
        if (selectedNode.pathData.type === 'custom' && selectedNode.pathData.points) {
          // Draw custom path text
          drawTextAlongPath(ctx, previewText, selectedNode.pathData.points);
        } else {
          // Draw arc text (fallback)
          drawTextAlongArc(
            ctx, 
            previewText, 
            canvas.width / 2, 
            canvas.height / 2, 
            selectedNode.pathData.radius || 100, 
            selectedNode.pathData.startAngle || 0, 
            selectedNode.pathData.endAngle || Math.PI
          );
        }
      } else {
        // Default arc if no path data
        drawTextAlongArc(ctx, previewText, canvas.width / 2, canvas.height / 2, 100, 0, Math.PI);
      }
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

  // Function to draw text along a custom path
  const drawTextAlongPath = (
    ctx: CanvasRenderingContext2D,
    text: string,
    points: { x: number, y: number }[]
  ) => {
    if (!points || points.length < 2) {
      console.error("[TextPanel] Cannot draw text on path: invalid path points");
      return;
    }

    console.log("[TextPanel] Drawing text along custom path with", points.length, "points");
    
    // Save context
    ctx.save();
    
    try {
      // Calculate the total path length
      let pathLength = 0;
      let pathSegments: number[] = [];
      
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        const segmentLength = Math.sqrt(dx*dx + dy*dy);
        pathLength += segmentLength;
        pathSegments.push(segmentLength);
      }
      
      // Calculate spacing for text
      const textLength = text.length;
      const spacingPerChar = pathLength / (textLength - 1);
      
      let currentPos = 0;
      let segmentIndex = 0;
      let segmentPos = 0;
      
      // Draw each character along the path
      for (let i = 0; i < textLength; i++) {
        // Find the segment for the current position
        while (segmentIndex < pathSegments.length && segmentPos + pathSegments[segmentIndex] < currentPos) {
          segmentPos += pathSegments[segmentIndex];
          segmentIndex++;
        }
        
        // If we're beyond the path, stop
        if (segmentIndex >= pathSegments.length) break;
        
        // Calculate position on the current segment
        const segmentFraction = (currentPos - segmentPos) / pathSegments[segmentIndex];
        const p1 = points[segmentIndex];
        const p2 = points[segmentIndex + 1];
        
        // Interpolate position
        const x = p1.x + (p2.x - p1.x) * segmentFraction;
        const y = p1.y + (p2.y - p1.y) * segmentFraction;
        
        // Calculate angle (perpendicular to path direction)
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI/2;
        
        // Save position
        ctx.save();
        
        // Translate and rotate to position
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Draw character
        ctx.fillText(text[i], 0, 0);
        
        // Restore position
        ctx.restore();
        
        // Move to next position
        currentPos += spacingPerChar;
      }
    } catch (error) {
      console.error("[TextPanel] Error drawing text on path:", error);
    }
    
    // Restore context
    ctx.restore();
  }

  // Add a debug effect to log the text nodes when they change
  useEffect(() => {
    console.log("[TextPanel] Text nodes changed:", textNodes.map(node => ({
      id: node.id, 
      text: node.text,
      onPath: node.onPath
    })));
  }, [textNodes]);

  // Add current text as a new text node
  const addText = () => {
    if (!currentText.trim()) return
    
    const newNodeId = `text-${Date.now()}`;
    console.log("[TextPanel] Adding new text node:", {
      id: newNodeId,
      text: currentText,
      onPath: textOnPath
    });
    
    addTextNode({
      id: newNodeId,
      text: currentText,
      style: { ...textStyle },
      position: { x: 100, y: 100 },
      onPath: textOnPath,
      pathData: textOnPath ? { type: "arc", radius: 100, startAngle: 0, endAngle: Math.PI } : undefined,
    })
    
    // Select the newly added node
    setSelectedNodeId(newNodeId);
    console.log("[TextPanel] New text node selected:", newNodeId);
    
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

  // Listen for events from other components
  useEffect(() => {
    // Listen for events to know when we're back from vector tab
    const handlePathCreatedForText = (event: CustomEvent) => {
      console.log("[TextPanel] Received path-created-for-text event:", event.detail);
      if (event.detail && event.detail.pathId && pendingTextId) {
        // Update the text node with the path data
        const pathData = paths.find(p => p.id === event.detail.pathId);
        if (pathData) {
          console.log("[TextPanel] Updating text node with path data:", pathData);
          
          // Create a deep copy of the points to avoid reference issues
          const pathPoints = pathData.points.map(point => ({ ...point }));
          
          // Update the text node with the path data
          updateTextNode(pendingTextId, {
            onPath: true,
            pathData: {
              type: 'custom',
              points: pathPoints
            }
          });
          
          // Force selection of this node to ensure it's visible in the UI
          setSelectedNodeId(pendingTextId);
          
          // Force render the preview with the new path data
          setTimeout(() => {
            console.log("[TextPanel] Force rendering text preview with new path data");
            renderTextPreview();
          }, 100);
        } else {
          console.error("[TextPanel] Path data not found for ID:", event.detail.pathId);
        }
        
        // Reset the pending states
        setIsCreatingPathForText(false);
        setPendingTextId(null);
      }
    };

    window.addEventListener('path-created-for-text', handlePathCreatedForText as EventListener);
    
    return () => {
      window.removeEventListener('path-created-for-text', handlePathCreatedForText as EventListener);
    };
  }, [pendingTextId, paths, updateTextNode, setSelectedNodeId]);

  // Re-render preview when selected node or textNodes changes
  useEffect(() => {
    console.log("[TextPanel] Text nodes or selection changed, updating preview");
    renderTextPreview();
  }, [selectedNodeId, textNodes]);

  // Handle edit path button click
  const handleEditPath = () => {
    console.log("[TextPanel] Edit Path button clicked");
    
    // Store the current text node for later use
    if (selectedNodeId) {
      const selectedNode = textNodes.find(node => node.id === selectedNodeId);
      console.log("[TextPanel] Setting pending text ID:", selectedNodeId, "Text content:", selectedNode?.text);
      
      setPendingTextId(selectedNodeId);
      setIsCreatingPathForText(true);
      setTextOnPath(true); // Ensure text-on-path is enabled
      
      // Update the node to ensure it's marked for path rendering
      updateTextNode(selectedNodeId, {
        onPath: true,
        // Initialize with default arc if no path data exists
        pathData: selectedNode?.pathData || { type: "arc", radius: 100, startAngle: 0, endAngle: Math.PI }
      });
      
      // Dispatch event to switch to vector tab and activate path tool
      // Use 'path' instead of 'pen' to ensure correct tool activation
      // Pass the text node ID so Vector tab can show the text while drawing
      const event = new CustomEvent('switch-to-vector-for-text', { 
        detail: { 
          activateTool: 'path',
          textId: selectedNodeId
        } 
      });
      console.log("[TextPanel] Dispatching switch-to-vector-for-text event with tool: path and textId:", selectedNodeId);
      window.dispatchEvent(event);
    } else {
      console.log("[TextPanel] No text node selected for path editing");
      // Show a message to select a text node first
      alert("Please select a text node first before editing its path.");
    }
  };

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
                      <Button size="sm" className="ml-2" onClick={handleEditPath}>
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
