"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ColorSlidersProps {
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  onRgbChange: (rgb: { r: number; g: number; b: number }) => void
  onHslChange: (hsl: { h: number; s: number; l: number }) => void
}

export default function ColorSliders({ rgb, hsl, onRgbChange, onHslChange }: ColorSlidersProps) {
  const [activeTab, setActiveTab] = useState("rgb")

  // Handle RGB slider changes
  const handleRChange = (value: number) => {
    onRgbChange({ ...rgb, r: value })
  }

  const handleGChange = (value: number) => {
    onRgbChange({ ...rgb, g: value })
  }

  const handleBChange = (value: number) => {
    onRgbChange({ ...rgb, b: value })
  }

  // Handle HSL slider changes
  const handleHChange = (value: number) => {
    onHslChange({ ...hsl, h: value })
  }

  const handleSChange = (value: number) => {
    onHslChange({ ...hsl, s: value })
  }

  const handleLChange = (value: number) => {
    onHslChange({ ...hsl, l: value })
  }

  return (
    <div>
      <Tabs defaultValue="rgb" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="rgb">RGB</TabsTrigger>
          <TabsTrigger value="hsl">HSL</TabsTrigger>
        </TabsList>

        <TabsContent value="rgb">
          <div className="space-y-6">
            {/* Red Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="r-slider" className="text-sm font-medium text-gray-700">
                  Red (R)
                </label>
                <span className="text-sm text-gray-500">{rgb.r}</span>
              </div>
              <input
                id="r-slider"
                type="range"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div
                className="w-full h-2 mt-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`,
                }}
              />
            </div>

            {/* Green Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="g-slider" className="text-sm font-medium text-gray-700">
                  Green (G)
                </label>
                <span className="text-sm text-gray-500">{rgb.g}</span>
              </div>
              <input
                id="g-slider"
                type="range"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleGChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div
                className="w-full h-2 mt-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`,
                }}
              />
            </div>

            {/* Blue Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="b-slider" className="text-sm font-medium text-gray-700">
                  Blue (B)
                </label>
                <span className="text-sm text-gray-500">{rgb.b}</span>
              </div>
              <input
                id="b-slider"
                type="range"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleBChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div
                className="w-full h-2 mt-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`,
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hsl">
          <div className="space-y-6">
            {/* Hue Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="h-slider" className="text-sm font-medium text-gray-700">
                  Hue (H)
                </label>
                <span className="text-sm text-gray-500">{hsl.h}°</span>
              </div>
              <input
                id="h-slider"
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => handleHChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div
                className="w-full h-2 mt-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, ${hsl.s}%, ${hsl.l}%), 
                    hsl(60, ${hsl.s}%, ${hsl.l}%), 
                    hsl(120, ${hsl.s}%, ${hsl.l}%), 
                    hsl(180, ${hsl.s}%, ${hsl.l}%), 
                    hsl(240, ${hsl.s}%, ${hsl.l}%), 
                    hsl(300, ${hsl.s}%, ${hsl.l}%), 
                    hsl(360, ${hsl.s}%, ${hsl.l}%))`,
                }}
              />
            </div>

            {/* Saturation Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="s-slider" className="text-sm font-medium text-gray-700">
                  Saturation (S)
                </label>
                <span className="text-sm text-gray-500">{hsl.s}%</span>
              </div>
              <input
                id="s-slider"
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => handleSChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div
                className="w-full h-2 mt-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hsl.h}, 0%, ${hsl.l}%), 
                    hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                }}
              />
            </div>

            {/* Lightness Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="l-slider" className="text-sm font-medium text-gray-700">
                  Lightness (L)
                </label>
                <span className="text-sm text-gray-500">{hsl.l}%</span>
              </div>
              <input
                id="l-slider"
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => handleLChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div
                className="w-full h-2 mt-1 rounded-lg"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hsl.h}, ${hsl.s}%, 0%), 
                    hsl(${hsl.h}, ${hsl.s}%, 50%), 
                    hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
