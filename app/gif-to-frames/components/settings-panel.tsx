"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, Film, FileType } from "lucide-react"

interface SettingsPanelProps {
  settings: {
    outputFormat: string;
    fps: number;
  }
  setSettings: (settings: any) => void;
  file: File | null;
  setActiveTab: (tab: string) => void;
  disabled: boolean;
}

export default function SettingsPanel({ settings, setSettings, file, setActiveTab, disabled }: SettingsPanelProps) {
  const updateSettings = (newSettings: any) => {
    setSettings({ ...settings, ...newSettings })
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Conversion Settings</h3>
      
      <div className="space-y-8">
        {/* Output Format */}
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
                  <FileType className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-medium">PNG</span>
                <span className="text-xs text-gray-500 mt-1">Higher quality, supports transparency</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="jpg" id="jpg" className="peer sr-only" />
              <Label
                htmlFor="jpg"
                className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <FileType className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium">JPG</span>
                <span className="text-xs text-gray-500 mt-1">Smaller file size, no transparency</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* FPS Selection */}
        <div>
          <h4 className="text-lg font-medium mb-4">Frames Per Second (FPS)</h4>
          <RadioGroup
            value={settings.fps.toString()}
            onValueChange={(value) => updateSettings({ fps: parseInt(value) })}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="10" id="fps-10" className="peer sr-only" />
              <Label
                htmlFor="fps-10"
                className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Film className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">10 FPS</span>
                <span className="text-xs text-gray-500 mt-1">Fewer frames, basic animation</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="24" id="fps-24" className="peer sr-only" />
              <Label
                htmlFor="fps-24"
                className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Film className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">24 FPS</span>
                <span className="text-xs text-gray-500 mt-1">Standard for film/animation</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="60" id="fps-60" className="peer sr-only" />
              <Label
                htmlFor="fps-60"
                className="flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Film className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">60 FPS</span>
                <span className="text-xs text-gray-500 mt-1">Detailed, high frame rate</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
          <h5 className="font-semibold mb-1">Output Format & FPS Tips:</h5>
          <p className="mb-2">
            • <strong>PNG</strong> is ideal for animation work that requires transparency.
          </p>
          <p className="mb-2">  
            • <strong>JPG</strong> creates smaller files which is better for sharing or when storage space is limited.
          </p>
          <p className="mb-2">
            • Higher FPS values extract more frames but create larger output files.
          </p>
          <p>
            • Choose the FPS value that matches your source material for best results.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <Button 
          onClick={() => setActiveTab("upload")} 
          className="w-full" 
          disabled={disabled}
        >
          Continue to Upload
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
