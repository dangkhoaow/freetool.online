"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileType, ImageIcon, Zap, Sliders } from "lucide-react"

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
          <TabsTrigger value="frames" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Frames</span>
          </TabsTrigger>
          <TabsTrigger value="size" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Size</span>
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
              className="grid grid-cols-2 md:grid-cols-2 gap-4"
            >
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
                  <span className="text-xs text-gray-500 mt-1">Lossless quality with transparency</span>
                </Label>
              </div>

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
                  <span className="text-xs text-gray-500 mt-1">Smaller file size, no transparency</span>
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
                Higher quality results in larger file sizes. 90% is recommended for a good balance.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="frames" className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Frame Extraction</h4>
            <RadioGroup
              value={settings.extractionMode}
              onValueChange={(value) => updateSettings({ extractionMode: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Extract all frames</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interval" id="interval" />
                <Label htmlFor="interval">Extract frames at interval</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific">Extract specific frames</Label>
              </div>
            </RadioGroup>
          </div>

          {settings.extractionMode === "interval" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="frameInterval">Frame Interval</Label>
                <span className="text-sm text-gray-500">Every {settings.frameInterval} frames</span>
              </div>
              <Slider
                id="frameInterval"
                min={1}
                max={20}
                step={1}
                value={[settings.frameInterval]}
                onValueChange={(value) => updateSettings({ frameInterval: value[0] })}
              />
              <p className="text-xs text-gray-500">
                Extract every Nth frame. Higher values result in fewer output images.
              </p>
            </div>
          )}

          {settings.extractionMode === "specific" && (
            <div className="space-y-2">
              <Label htmlFor="specificFrames">Specific Frame Numbers</Label>
              <Input
                id="specificFrames"
                placeholder="e.g., 1, 5, 10, 15"
                value={settings.specificFrames}
                onChange={(e) => updateSettings({ specificFrames: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Enter frame numbers separated by commas. Frame numbering starts at 1.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="includeTimestamp">Include timestamp in filename</Label>
              <p className="text-sm text-gray-500">Add frame number or timestamp to each output file</p>
            </div>
            <Switch
              id="includeTimestamp"
              checked={settings.includeTimestamp}
              onCheckedChange={(checked) => updateSettings({ includeTimestamp: checked })}
            />
          </div>
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
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-4">Advanced Options</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="optimizeOutput">Optimize output images</Label>
                  <p className="text-sm text-gray-500">Apply optimization to reduce file size</p>
                </div>
                <Switch
                  id="optimizeOutput"
                  checked={settings.optimizeOutput}
                  onCheckedChange={(checked) => updateSettings({ optimizeOutput: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <Button
          onClick={() => {
            if (files.length > 0) {
              onStartConversion()
            } else {
              setActiveTab("upload")
            }
          }}
          disabled={disabled}
        >
          {files.length > 0 ? "Start Conversion" : "Upload Files"}
        </Button>
      </div>
    </div>
  )
}
