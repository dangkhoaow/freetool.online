"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileType, Image, Zap, Sliders, Globe, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SettingsPanelProps {
  settings: any
  setSettings: (settings: any) => void
  onStartConversion: () => void
  disabled: boolean
  files: File[]
  setActiveTab: (tab: string) => void
}

export default function SettingsPanel({
  settings,
  setSettings,
  onStartConversion,
  disabled,
  files,
  setActiveTab,
}: SettingsPanelProps) {
  const updateSettings = (newSettings: any) => {
    setSettings({ ...settings, ...newSettings })
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Conversion Settings</h3>

      <Tabs defaultValue="format" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="format" className="flex items-center gap-2">
            <FileType className="h-4 w-4" />
            <span className="hidden sm:inline">Format</span>
          </TabsTrigger>
          <TabsTrigger value="size" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Size</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">AI Options</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Output Format</h4>
            <RadioGroup
              value={settings.outputFormat}
              onValueChange={(value) => updateSettings({ outputFormat: value })}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div>
                <RadioGroupItem value="jpg" id="jpg" className="peer sr-only" />
                <Label
                  htmlFor="jpg"
                  className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-green-600 font-medium">JPG</span>
                  </div>
                  <span className="font-medium">JPEG</span>
                  <span className="text-xs text-gray-500 mt-1">Best compatibility</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="png" id="png" className="peer sr-only" />
                <Label
                  htmlFor="png"
                  className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-purple-600 font-medium">PNG</span>
                  </div>
                  <span className="font-medium">PNG</span>
                  <span className="text-xs text-gray-500 mt-1">Lossless quality</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="webp" id="webp" className="peer sr-only" />
                <Label
                  htmlFor="webp"
                  className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-yellow-600 font-medium">WEBP</span>
                  </div>
                  <span className="font-medium">WEBP</span>
                  <span className="text-xs text-gray-500 mt-1">Smaller file size</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
                <Label
                  htmlFor="pdf"
                  className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-red-600 font-medium">PDF</span>
                  </div>
                  <span className="font-medium">PDF</span>
                  <span className="text-xs text-gray-500 mt-1">Document format</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {settings.outputFormat === "jpg" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="quality">JPEG Quality</Label>
                <span className="text-sm text-gray-500">{settings.quality}%</span>
              </div>
              <Slider
                id="quality"
                min={10}
                max={100}
                step={5}
                value={[settings.quality]}
                onValueChange={(value) => updateSettings({ quality: value[0] })}
              />
              <p className="text-xs text-gray-500">
                Higher quality results in larger file sizes. 85% is recommended for a good balance.
              </p>
            </div>
          )}

          {settings.outputFormat === "pdf" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pageSize" className="mb-2 block">
                  PDF Page Size
                </Label>
                <Select
                  value={settings.pdfOptions.pageSize}
                  onValueChange={(value) =>
                    updateSettings({
                      pdfOptions: { ...settings.pdfOptions, pageSize: value },
                    })
                  }
                >
                  <SelectTrigger id="pageSize">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="tabloid">Tabloid</SelectItem>
                    <SelectItem value="13x11">13x11 - Photo book</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orientation" className="mb-2 block">
                  Page Orientation
                </Label>
                <RadioGroup
                  value={settings.pdfOptions.orientation}
                  onValueChange={(value) =>
                    updateSettings({
                      pdfOptions: { ...settings.pdfOptions, orientation: value },
                    })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="portrait" id="portrait" />
                    <Label htmlFor="portrait">Portrait</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landscape" id="landscape" />
                    <Label htmlFor="landscape">Landscape</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="size" className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Image Size</h4>
            <RadioGroup
              value={settings.resizeOption}
              onValueChange={(value) => updateSettings({ resizeOption: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="original" id="original" />
                <Label htmlFor="original">Keep original size</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom dimensions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="max" id="max" />
                <Label htmlFor="max">Maximum dimension</Label>
              </div>
            </RadioGroup>
          </div>

          {settings.resizeOption === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={settings.customWidth}
                  onChange={(e) => updateSettings({ customWidth: Number.parseInt(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={settings.customHeight}
                  onChange={(e) => updateSettings({ customHeight: Number.parseInt(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Enter the exact dimensions for your output images.</p>
              </div>
            </div>
          )}

          {settings.resizeOption === "max" && (
            <div className="space-y-2">
              <Label htmlFor="maxDimension">Maximum dimension (px)</Label>
              <Input
                id="maxDimension"
                type="number"
                value={settings.customWidth}
                onChange={(e) => updateSettings({ customWidth: Number.parseInt(e.target.value) })}
                min={1}
              />
              <p className="text-xs text-gray-500">
                The image will be resized so that neither width nor height exceeds this value, maintaining the aspect
                ratio.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">AI Optimization</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-optimization">AI-powered optimization</Label>
                  <p className="text-sm text-gray-500">Automatically enhance image quality and reduce file size</p>
                </div>
                <Switch
                  id="ai-optimization"
                  checked={settings.aiOptimization}
                  onCheckedChange={(checked) => updateSettings({ aiOptimization: checked })}
                />
              </div>

              {settings.aiOptimization && (
                <>
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700">AI Features</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-blue-200 p-0.5 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-700"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span>Smart compression to reduce file size without visible quality loss</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-blue-200 p-0.5 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-700"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span>Automatic color correction and enhancement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="rounded-full bg-blue-200 p-0.5 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-700"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span>Noise reduction and sharpening where needed</span>
                      </li>
                    </ul>
                    <p className="text-xs text-blue-600">Note: AI processing may take a few extra seconds per image</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-intensity">AI Optimization Intensity</Label>
                    <Select
                      value={settings.aiIntensity}
                      onValueChange={(value) => updateSettings({ aiIntensity: value })}
                    >
                      <SelectTrigger id="ai-intensity">
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Subtle enhancements</SelectItem>
                        <SelectItem value="medium">Medium - Balanced optimization</SelectItem>
                        <SelectItem value="high">High - Maximum enhancement</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Higher intensity applies stronger enhancements but may alter the original look more significantly.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Conversion Mode</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer border-2 transition-all ${settings.conversionMode === 'browser' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                onClick={() => updateSettings({ conversionMode: 'browser' })}>
                <CardContent className="p-4 pt-4">
                  <div className="flex gap-3 items-start">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium">Browser-based</h5>
                      <p className="text-sm text-gray-500">Files stay on your device</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Private</span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Fast</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`cursor-pointer border-2 transition-all ${settings.conversionMode === 'server' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'} pointer-events-none opacity-50`}
                onClick={() => updateSettings({ conversionMode: 'server' })}>
                <CardContent className="p-4 pt-4">
                  <div className="flex gap-3 items-start">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h5 className="font-medium">Server-based</h5>
                      <p className="text-sm text-gray-500">Processed on our servers</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">High Quality</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Advanced Options</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <p className="text-xs text-gray-500">
              {settings.conversionMode === 'browser' 
                ? "Browser-based conversion keeps your files private - they never leave your device. Perfect for sensitive content." 
                : "Server-based conversion enables advanced AI features and higher quality output, but requires uploading files to our secure servers."}
            </p>
          </div>
          
          <div className="border-t pt-6">
            <div>
              <h4 className="text-lg font-medium mb-4">Advanced Options</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="preserve-exif">Preserve EXIF data</Label>
                    <p className="text-sm text-gray-500">Keep metadata like camera model, date, and location</p>
                  </div>
                  <Switch
                    id="preserve-exif"
                    checked={settings.preserveExif}
                    onCheckedChange={(checked) => updateSettings({ preserveExif: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="watermark">Add watermark</Label>
                      <p className="text-sm text-gray-500">Apply text watermark to converted images</p>
                    </div>
                    <Switch
                      id="watermark"
                      checked={settings.watermark.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          watermark: { ...settings.watermark, enabled: checked },
                        })
                      }
                    />
                  </div>

                  {settings.watermark.enabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-gray-100">
                      <div className="space-y-2">
                        <Label htmlFor="watermark-text">Watermark text</Label>
                        <Input
                          id="watermark-text"
                          value={settings.watermark.text}
                          onChange={(e) =>
                            updateSettings({
                              watermark: { ...settings.watermark, text: e.target.value },
                            })
                          }
                          placeholder="© Your Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="watermark-position">Position</Label>
                        <Select
                          value={settings.watermark.position}
                          onValueChange={(value) =>
                            updateSettings({
                              watermark: { ...settings.watermark, position: value },
                            })
                          }
                        >
                          <SelectTrigger id="watermark-position">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="watermark-opacity">Opacity</Label>
                          <span className="text-sm text-gray-500">{settings.watermark.opacity}%</span>
                        </div>
                        <Slider
                          id="watermark-opacity"
                          min={10}
                          max={100}
                          step={5}
                          value={[settings.watermark.opacity]}
                          onValueChange={(value) =>
                            updateSettings({
                              watermark: { ...settings.watermark, opacity: value[0] },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => setActiveTab("upload")}
        >
          Back to Files
        </Button>
        <Button 
          onClick={onStartConversion} 
          disabled={disabled || files.length === 0}
        >
          Start Conversion
        </Button>
      </div>
    </div>
  )
}
