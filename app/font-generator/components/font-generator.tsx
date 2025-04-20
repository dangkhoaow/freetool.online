"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  defaultFontSettings,
  fontFamilies,
  fontWeights,
  fontStyles,
  textAlignOptions,
  saveFontSettings,
  loadFontSettings,
  savePreset,
  loadPresets,
  deletePreset,
  generateTextImage,
  exportImage,
  type FontSettings,
} from "@/lib/services/font-generator-service"
import { Download, Save, Trash2, RefreshCw, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function FontGenerator() {
  const [settings, setSettings] = useState<FontSettings>(defaultFontSettings)
  const [presets, setPresets] = useState<Record<string, FontSettings>>({})
  const [presetName, setPresetName] = useState("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = loadFontSettings()
    if (savedSettings) {
      setSettings(savedSettings)
    }

    const savedPresets = loadPresets()
    setPresets(savedPresets)
  }, [])

  // Generate preview when settings change
  useEffect(() => {
    if (canvasRef.current) {
      const url = generateTextImage(canvasRef.current, settings)
      setImageUrl(url)

      // Save settings to localStorage
      saveFontSettings(settings)
    }
  }, [settings])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings({ ...settings, text: e.target.value })
  }

  const handleSettingChange = (key: keyof FontSettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleExport = () => {
    if (imageUrl) {
      exportImage(imageUrl)
      toast({
        title: "Image exported",
        description: "Your text image has been downloaded successfully.",
      })
    }
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your preset.",
        variant: "destructive",
      })
      return
    }

    savePreset(presetName, settings)
    setPresets({ ...presets, [presetName]: settings })
    setPresetName("")

    toast({
      title: "Preset saved",
      description: `Your preset "${presetName}" has been saved.`,
    })
  }

  const handleLoadPreset = (name: string) => {
    const preset = presets[name]
    if (preset) {
      setSettings(preset)
      toast({
        title: "Preset loaded",
        description: `Preset "${name}" has been loaded.`,
      })
    }
  }

  const handleDeletePreset = (name: string) => {
    deletePreset(name)
    const newPresets = { ...presets }
    delete newPresets[name]
    setPresets(newPresets)

    toast({
      title: "Preset deleted",
      description: `Preset "${name}" has been deleted.`,
    })
  }

  const handleReset = () => {
    setSettings(defaultFontSettings)
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    })
  }

  const handleCopyImage = async () => {
    try {
      if (imageUrl) {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])

        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Image copied",
          description: "Your text image has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Failed to copy image:", error)
      toast({
        title: "Copy failed",
        description: "Failed to copy image to clipboard. Try exporting instead.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Font Generator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Preview Section */}
        <Card className="lg:col-span-7 overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Preview</h3>
              <p className="text-sm text-gray-500 mb-4">This is how your text will look with the current settings</p>
            </div>

            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="p-4 flex justify-center">
                <div className="relative">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Text preview"
                    className="max-w-full h-auto border border-gray-200 rounded shadow-sm"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleExport} className="gap-2">
                <Download size={16} />
                Export as PNG
              </Button>

              <Button variant="outline" onClick={handleCopyImage} className="gap-2">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>

              <Button variant="outline" onClick={handleReset} className="gap-2 ml-auto">
                <RefreshCw size={16} />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card className="lg:col-span-5">
          <CardContent className="p-6">
            <Tabs defaultValue="text">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="font">Font</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="text-input">Your Text</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter your text here..."
                    value={settings.text}
                    onChange={handleTextChange}
                    className="min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="text-align">Text Alignment</Label>
                  <Select value={settings.textAlign} onValueChange={(value) => handleSettingChange("textAlign", value)}>
                    <SelectTrigger id="text-align">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {textAlignOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="padding-slider">Padding</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="padding-slider"
                      min={0}
                      max={100}
                      step={1}
                      value={[settings.padding]}
                      onValueChange={(value) => handleSettingChange("padding", value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{settings.padding}px</span>
                  </div>
                </div>
              </TabsContent>

              {/* Font Tab */}
              <TabsContent value="font" className="space-y-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={settings.fontFamily}
                    onValueChange={(value) => handleSettingChange("fontFamily", value)}
                  >
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size-slider">Font Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="font-size-slider"
                      min={8}
                      max={200}
                      step={1}
                      value={[settings.fontSize]}
                      onValueChange={(value) => handleSettingChange("fontSize", value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{settings.fontSize}px</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="font-weight">Font Weight</Label>
                  <Select
                    value={settings.fontWeight.toString()}
                    onValueChange={(value) => handleSettingChange("fontWeight", Number.parseInt(value))}
                  >
                    <SelectTrigger id="font-weight">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeights.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value.toString()}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-style">Font Style</Label>
                  <Select value={settings.fontStyle} onValueChange={(value) => handleSettingChange("fontStyle", value)}>
                    <SelectTrigger id="font-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="letter-spacing-slider">Letter Spacing</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="letter-spacing-slider"
                      min={-5}
                      max={20}
                      step={0.5}
                      value={[settings.letterSpacing]}
                      onValueChange={(value) => handleSettingChange("letterSpacing", value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{settings.letterSpacing}px</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="line-height-slider">Line Height</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="line-height-slider"
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={[settings.lineHeight]}
                      onValueChange={(value) => handleSettingChange("lineHeight", value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{settings.lineHeight}x</span>
                  </div>
                </div>
              </TabsContent>

              {/* Style Tab */}
              <TabsContent value="style" className="space-y-4">
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="text-color"
                        type="text"
                        value={settings.color}
                        onChange={(e) => handleSettingChange("color", e.target.value)}
                        className="pl-10"
                      />
                      <div
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: settings.color }}
                      />
                    </div>
                    <Input
                      type="color"
                      value={settings.color}
                      onChange={(e) => handleSettingChange("color", e.target.value)}
                      className="w-12 p-1 h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="bg-color"
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => handleSettingChange("backgroundColor", e.target.value)}
                        className="pl-10"
                      />
                      <div
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: settings.backgroundColor }}
                      />
                    </div>
                    <Input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => handleSettingChange("backgroundColor", e.target.value)}
                      className="w-12 p-1 h-10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="text-shadow-toggle">Text Shadow</Label>
                  <Switch
                    id="text-shadow-toggle"
                    checked={settings.textShadow}
                    onCheckedChange={(checked) => handleSettingChange("textShadow", checked)}
                  />
                </div>

                {settings.textShadow && (
                  <>
                    <div>
                      <Label htmlFor="shadow-color">Shadow Color</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="shadow-color"
                            type="text"
                            value={settings.textShadowColor}
                            onChange={(e) => handleSettingChange("textShadowColor", e.target.value)}
                            className="pl-10"
                          />
                          <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: settings.textShadowColor }}
                          />
                        </div>
                        <Input
                          type="color"
                          value={settings.textShadowColor}
                          onChange={(e) => handleSettingChange("textShadowColor", e.target.value)}
                          className="w-12 p-1 h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shadow-blur-slider">Shadow Blur</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="shadow-blur-slider"
                          min={0}
                          max={20}
                          step={1}
                          value={[settings.textShadowBlur]}
                          onValueChange={(value) => handleSettingChange("textShadowBlur", value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{settings.textShadowBlur}px</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shadow-offset-x-slider">Shadow Offset X</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="shadow-offset-x-slider"
                          min={-20}
                          max={20}
                          step={1}
                          value={[settings.textShadowOffsetX]}
                          onValueChange={(value) => handleSettingChange("textShadowOffsetX", value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{settings.textShadowOffsetX}px</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shadow-offset-y-slider">Shadow Offset Y</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="shadow-offset-y-slider"
                          min={-20}
                          max={20}
                          step={1}
                          value={[settings.textShadowOffsetY]}
                          onValueChange={(value) => handleSettingChange("textShadowOffsetY", value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{settings.textShadowOffsetY}px</span>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Presets Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Saved Presets</h3>

              <div className="flex gap-2 mb-4">
                <Input placeholder="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
                <Button onClick={handleSavePreset} className="gap-2 whitespace-nowrap">
                  <Save size={16} />
                  Save
                </Button>
              </div>

              {Object.keys(presets).length > 0 ? (
                <div className="space-y-2">
                  {Object.keys(presets).map((name) => (
                    <div key={name} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="font-medium truncate flex-1">{name}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleLoadPreset(name)} className="h-8 px-2">
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePreset(name)}
                          className="h-8 px-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No presets saved yet. Save your current settings to create a preset.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
