export interface FontSettings {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: string
  textAlign: string
  color: string
  backgroundColor: string
  letterSpacing: number
  lineHeight: number
  textShadow: boolean
  textShadowColor: string
  textShadowBlur: number
  textShadowOffsetX: number
  textShadowOffsetY: number
  padding: number
}

export const defaultFontSettings: FontSettings = {
  text: "Your Custom Text",
  fontFamily: "Arial",
  fontSize: 48,
  fontWeight: 400,
  fontStyle: "normal",
  textAlign: "center",
  color: "#000000",
  backgroundColor: "#ffffff",
  letterSpacing: 0,
  lineHeight: 1.2,
  textShadow: false,
  textShadowColor: "#000000",
  textShadowBlur: 4,
  textShadowOffsetX: 2,
  textShadowOffsetY: 2,
  padding: 20,
}

export const fontFamilies = [
  "Arial",
  "Verdana",
  "Helvetica",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
  "Impact",
  "Comic Sans MS",
  "Lucida Console",
  "Palatino",
  "Bookman",
  "Arial Black",
  "Lucida Sans",
]

export const fontWeights = [
  { value: 100, label: "Thin (100)" },
  { value: 200, label: "Extra Light (200)" },
  { value: 300, label: "Light (300)" },
  { value: 400, label: "Regular (400)" },
  { value: 500, label: "Medium (500)" },
  { value: 600, label: "Semi Bold (600)" },
  { value: 700, label: "Bold (700)" },
  { value: 800, label: "Extra Bold (800)" },
  { value: 900, label: "Black (900)" },
]

export const fontStyles = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
  { value: "oblique", label: "Oblique" },
]

export const textAlignOptions = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
]

export function saveFontSettings(settings: FontSettings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("fontGeneratorSettings", JSON.stringify(settings))
  }
}

export function loadFontSettings(): FontSettings | null {
  if (typeof window !== "undefined") {
    const savedSettings = localStorage.getItem("fontGeneratorSettings")
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch (e) {
        console.error("Error parsing saved font settings:", e)
      }
    }
  }
  return null
}

export function savePreset(name: string, settings: FontSettings): void {
  if (typeof window !== "undefined") {
    const presets = loadPresets()
    presets[name] = settings
    localStorage.setItem("fontGeneratorPresets", JSON.stringify(presets))
  }
}

export function loadPresets(): Record<string, FontSettings> {
  if (typeof window !== "undefined") {
    const savedPresets = localStorage.getItem("fontGeneratorPresets")
    if (savedPresets) {
      try {
        return JSON.parse(savedPresets)
      } catch (e) {
        console.error("Error parsing saved font presets:", e)
      }
    }
  }
  return {}
}

export function deletePreset(name: string): void {
  if (typeof window !== "undefined") {
    const presets = loadPresets()
    if (presets[name]) {
      delete presets[name]
      localStorage.setItem("fontGeneratorPresets", JSON.stringify(presets))
    }
  }
}

export function generateTextImage(canvas: HTMLCanvasElement, settings: FontSettings): string {
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  // Calculate text dimensions
  ctx.font = `${settings.fontStyle} ${settings.fontWeight} ${settings.fontSize}px ${settings.fontFamily}`

  // Split text into lines
  const lines = settings.text.split("\n")
  const lineHeight = settings.fontSize * settings.lineHeight

  // Calculate the width of the longest line
  let maxWidth = 0
  for (const line of lines) {
    const metrics = ctx.measureText(line)
    const lineWidth = metrics.width + settings.letterSpacing * (line.length - 1)
    maxWidth = Math.max(maxWidth, lineWidth)
  }

  // Set canvas dimensions with padding
  const padding = settings.padding * 2
  const width = maxWidth + padding
  const height = lines.length * lineHeight + padding

  canvas.width = width
  canvas.height = height

  // Clear canvas and set background
  ctx.fillStyle = settings.backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Set text properties
  ctx.font = `${settings.fontStyle} ${settings.fontWeight} ${settings.fontSize}px ${settings.fontFamily}`
  ctx.fillStyle = settings.color
  ctx.textBaseline = "top"

  // Set text alignment
  ctx.textAlign = settings.textAlign as CanvasTextAlign

  // Calculate x position based on alignment
  let x = settings.padding
  if (settings.textAlign === "center") {
    x = width / 2
  } else if (settings.textAlign === "right") {
    x = width - settings.padding
  }

  // Add text shadow if enabled
  if (settings.textShadow) {
    ctx.shadowColor = settings.textShadowColor
    ctx.shadowBlur = settings.textShadowBlur
    ctx.shadowOffsetX = settings.textShadowOffsetX
    ctx.shadowOffsetY = settings.textShadowOffsetY
  } else {
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // Draw each line of text
  let y = settings.padding
  for (const line of lines) {
    // Handle letter spacing
    if (settings.letterSpacing !== 0) {
      // Draw each character with spacing
      const chars = line.split("")
      let currentX = x

      // Adjust starting position for letter spacing based on alignment
      if (settings.textAlign === "center") {
        const totalWidth = ctx.measureText(line).width + settings.letterSpacing * (chars.length - 1)
        currentX = x - totalWidth / 2
      } else if (settings.textAlign === "right") {
        const totalWidth = ctx.measureText(line).width + settings.letterSpacing * (chars.length - 1)
        currentX = x - totalWidth
      }

      for (const char of chars) {
        ctx.fillText(char, currentX, y)
        currentX += ctx.measureText(char).width + settings.letterSpacing
      }
    } else {
      // Draw the whole line at once
      ctx.fillText(line, x, y)
    }

    y += lineHeight
  }

  return canvas.toDataURL("image/png")
}

export function exportImage(dataUrl: string, filename = "font-generator"): void {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
