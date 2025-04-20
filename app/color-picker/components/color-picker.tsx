"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { hexToRgb, hexToHsl, rgbToHex, hslToRgb, saveColorHistory } from "@/lib/services/color-picker-service"
import ColorSliders from "./color-sliders"
import ColorValues from "./color-values"
import FavoriteColors from "./favorite-colors"
import { Palette, History, Heart } from "lucide-react"

export default function ColorPicker() {
  const [color, setColor] = useState("#4F46E5")
  const [rgb, setRgb] = useState({ r: 79, g: 70, b: 229 })
  const [hsl, setHsl] = useState({ h: 244, s: 77, l: 59 })
  const [activeTab, setActiveTab] = useState("picker")

  // Synchronize color values when hex changes
  useEffect(() => {
    const rgbValues = hexToRgb(color)
    if (rgbValues) {
      setRgb(rgbValues)
      const hslValues = hexToHsl(color)
      if (hslValues) {
        setHsl(hslValues)
      }
    }

    // Save to history
    saveColorHistory(color)
  }, [color])

  // Handle RGB change
  const handleRgbChange = (newRgb: { r: number; g: number; b: number }) => {
    setRgb(newRgb)
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setColor(newHex)
  }

  // Handle HSL change
  const handleHslChange = (newHsl: { h: number; s: number; l: number }) => {
    setHsl(newHsl)
    const rgbValues = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(rgbValues)
    const newHex = rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b)
    setColor(newHex)
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8">Color Picker Tool</h2>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Color Preview */}
          <div className="md:col-span-4 flex flex-col">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-lg font-medium mb-2">Color Preview</div>
                <div className="w-full aspect-square rounded-lg border shadow-sm" style={{ backgroundColor: color }} />

                <div className="mt-4">
                  <label htmlFor="color-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Color
                  </label>
                  <input
                    id="color-input"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-12 p-1 rounded border cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            <ColorValues color={color} rgb={rgb} hsl={hsl} />
          </div>

          {/* Color Controls */}
          <div className="md:col-span-8">
            <Tabs defaultValue="picker" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="picker" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Color Picker</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="picker">
                <Card>
                  <CardContent className="p-6">
                    <ColorSliders rgb={rgb} hsl={hsl} onRgbChange={handleRgbChange} onHslChange={handleHslChange} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="favorites">
                <FavoriteColors onSelectColor={setColor} />
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-lg font-medium mb-4">Recently Used Colors</div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {/* This will be populated from localStorage */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  )
}
