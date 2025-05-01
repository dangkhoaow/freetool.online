"use client"

import { useState, useEffect } from "react"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { UIBlock } from "./site-builder-tool"
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layout, 
  Type, 
  Palette, 
  Underline
} from "lucide-react"

interface StyleEditorProps {
  selectedBlock: UIBlock | null
  onStyleChange: (styles: Record<string, string>) => void
}

export default function StyleEditor({ selectedBlock, onStyleChange }: StyleEditorProps) {
  const [styles, setStyles] = useState<Record<string, string>>({})
  const [fontFamily, setFontFamily] = useState("Inter")
  const [fontSize, setFontSize] = useState("16")
  const [fontWeight, setFontWeight] = useState("normal")
  const [textAlign, setTextAlign] = useState("left")
  const [color, setColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [padding, setPadding] = useState("20")
  const [borderRadius, setBorderRadius] = useState("0")
  const [activeTab, setActiveTab] = useState("layout")

  // Update local state when selected block changes
  useEffect(() => {
    if (selectedBlock) {
      setStyles(selectedBlock.styles || {})
      setFontFamily(selectedBlock.styles.fontFamily || "Inter")
      setFontSize(selectedBlock.styles.fontSize?.replace("px", "") || "16")
      setFontWeight(selectedBlock.styles.fontWeight || "normal")
      setTextAlign(selectedBlock.styles.textAlign || "left")
      setColor(selectedBlock.styles.color || "#000000")
      setBackgroundColor(selectedBlock.styles.backgroundColor || "#ffffff")
      setPadding(selectedBlock.styles.padding?.replace("px", "") || "20")
      setBorderRadius(selectedBlock.styles.borderRadius?.replace("px", "") || "0")
    } else {
      // Reset values if no block is selected
      resetValues()
    }
  }, [selectedBlock])

  const resetValues = () => {
    setStyles({})
    setFontFamily("Inter")
    setFontSize("16")
    setFontWeight("normal")
    setTextAlign("left")
    setColor("#000000")
    setBackgroundColor("#ffffff")
    setPadding("20")
    setBorderRadius("0")
  }

  const applyStyles = () => {
    const updatedStyles = {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      textAlign,
      color,
      backgroundColor,
      padding: `${padding}px`,
      borderRadius: `${borderRadius}px`,
    }
    
    setStyles(updatedStyles)
    onStyleChange(updatedStyles)
  }

  return (
    <div className="h-full flex flex-col">
      {!selectedBlock ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <Layout className="h-10 w-10 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium mb-2 dark:text-white">No Block Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a block on the canvas to edit its styles.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-4 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded mr-3">
              <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium dark:text-white">
                Editing: {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ID: {selectedBlock.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="layout" className="text-xs">
                <Layout className="h-4 w-4 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="typography" className="text-xs">
                <Type className="h-4 w-4 mr-1" />
                Typography
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="h-4 w-4 mr-1" />
                Colors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-4">
              <Accordion type="single" collapsible defaultValue="padding">
                <AccordionItem value="padding">
                  <AccordionTrigger className="text-sm">Padding</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="padding-slider" className="text-xs">Padding: {padding}px</Label>
                        </div>
                        <Slider
                          id="padding-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[parseInt(padding)]}
                          onValueChange={(value) => setPadding(value[0].toString())}
                          className="mb-2"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="border-radius">
                  <AccordionTrigger className="text-sm">Border Radius</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="border-radius-slider" className="text-xs">
                            Border Radius: {borderRadius}px
                          </Label>
                        </div>
                        <Slider
                          id="border-radius-slider"
                          min={0}
                          max={50}
                          step={1}
                          value={[parseInt(borderRadius)]}
                          onValueChange={(value) => setBorderRadius(value[0].toString())}
                          className="mb-2"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <Accordion type="single" collapsible defaultValue="font">
                <AccordionItem value="font">
                  <AccordionTrigger className="text-sm">Font</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="font-family" className="text-xs mb-2 block">
                          Font Family
                        </Label>
                        <select
                          id="font-family"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="font-size-slider" className="text-xs">
                            Font Size: {fontSize}px
                          </Label>
                        </div>
                        <Slider
                          id="font-size-slider"
                          min={10}
                          max={72}
                          step={1}
                          value={[parseInt(fontSize)]}
                          onValueChange={(value) => setFontSize(value[0].toString())}
                          className="mb-2"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="text-style">
                  <AccordionTrigger className="text-sm">Text Style</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs mb-2 block">Font Weight</Label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={fontWeight === "normal" ? "default" : "outline"}
                            onClick={() => setFontWeight("normal")}
                          >
                            Normal
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={fontWeight === "bold" ? "default" : "outline"}
                            onClick={() => setFontWeight("bold")}
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={fontWeight === "italic" ? "default" : "outline"}
                            onClick={() => setFontWeight("italic")}
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs mb-2 block">Text Alignment</Label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={textAlign === "left" ? "default" : "outline"}
                            onClick={() => setTextAlign("left")}
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={textAlign === "center" ? "default" : "outline"}
                            onClick={() => setTextAlign("center")}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={textAlign === "right" ? "default" : "outline"}
                            onClick={() => setTextAlign("right")}
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Accordion type="single" collapsible defaultValue="text-color">
                <AccordionItem value="text-color">
                  <AccordionTrigger className="text-sm">Text Color</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="text-color" className="text-xs mb-2 block">
                          Color
                        </Label>
                        <div className="flex space-x-2">
                          <div 
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <Input
                            id="text-color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="background-color">
                  <AccordionTrigger className="text-sm">Background Color</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="background-color" className="text-xs mb-2 block">
                          Background
                        </Label>
                        <div className="flex space-x-2">
                          <div 
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor }}
                          />
                          <Input
                            id="background-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>

          <div className="mt-auto pt-4">
            <Button onClick={applyStyles} className="w-full">Apply Styles</Button>
          </div>
        </>
      )}
    </div>
  )
}
