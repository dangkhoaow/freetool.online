"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Copy } from "lucide-react"
import { getContrastRatio, saveFavoriteColor } from "@/lib/services/color-picker-service"

interface ColorValuesProps {
  color: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

export default function ColorValues({ color, rgb, hsl }: ColorValuesProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const contrastRatio = getContrastRatio(color)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleSaveFavorite = () => {
    saveFavoriteColor(color)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-4">Color Values</div>

        <div className="space-y-4">
          {/* HEX Value */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">HEX</div>
            <div className="flex">
              <div className="flex-1 bg-gray-100 rounded-l-md p-2 font-mono">{color.toUpperCase()}</div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-l-none"
                onClick={() => copyToClipboard(color.toUpperCase(), "hex")}
              >
                {copied === "hex" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* RGB Value */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">RGB</div>
            <div className="flex">
              <div className="flex-1 bg-gray-100 rounded-l-md p-2 font-mono">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-l-none"
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "rgb")}
              >
                {copied === "rgb" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* HSL Value */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">HSL</div>
            <div className="flex">
              <div className="flex-1 bg-gray-100 rounded-l-md p-2 font-mono">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-l-none"
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "hsl")}
              >
                {copied === "hsl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Contrast Ratio */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Contrast Ratio</div>
            <div className="bg-gray-100 rounded-md p-2">
              <div className="flex justify-between">
                <span>With White: {contrastRatio.toFixed(2)}:1</span>
                <span className={contrastRatio >= 4.5 ? "text-green-600" : "text-red-600"}>
                  {contrastRatio >= 4.5 ? "AA Pass" : "AA Fail"}
                </span>
              </div>
            </div>
          </div>

          {/* Save to Favorites */}
          <Button variant="outline" className="w-full mt-4" onClick={handleSaveFavorite}>
            Save to Favorites
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
