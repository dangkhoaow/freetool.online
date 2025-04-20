// Color conversion utilities

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, "")

  // Parse hex values
  let r, g, b
  if (hex.length === 3) {
    // Short notation (e.g. #F00)
    r = Number.parseInt(hex.charAt(0) + hex.charAt(0), 16)
    g = Number.parseInt(hex.charAt(1) + hex.charAt(1), 16)
    b = Number.parseInt(hex.charAt(2) + hex.charAt(2), 16)
  } else if (hex.length === 6) {
    // Full notation (e.g. #FF0000)
    r = Number.parseInt(hex.substring(0, 2), 16)
    g = Number.parseInt(hex.substring(2, 4), 16)
    b = Number.parseInt(hex.substring(4, 6), 16)
  } else {
    return null // Invalid hex
  }

  return { r, g, b }
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// Convert hex to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

// Calculate contrast ratio for accessibility
export function getContrastRatio(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  const blackContrast = (luminance + 0.05) / 0.05
  const whiteContrast = 1.05 / (luminance + 0.05)

  return Math.max(blackContrast, whiteContrast)
}

// Get color name (simplified version - would be expanded in a real implementation)
export function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FF00FF": "Magenta",
    "#00FFFF": "Cyan",
    "#000000": "Black",
    "#FFFFFF": "White",
    "#808080": "Gray",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#A52A2A": "Brown",
    "#FFC0CB": "Pink",
  }

  // Simple exact match
  if (colorMap[hex.toUpperCase()]) {
    return colorMap[hex.toUpperCase()]
  }

  // In a real implementation, we would calculate the closest color
  return "Custom Color"
}

// Generate complementary color
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#000000"

  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
}

// Generate analogous colors
export function getAnalogousColors(hex: string): string[] {
  const hsl = hexToHsl(hex)
  if (!hsl) return ["#000000", "#000000"]

  const h1 = (hsl.h + 30) % 360
  const h2 = (hsl.h + 330) % 360

  return [hslToHex(h1, hsl.s, hsl.l), hslToHex(h2, hsl.s, hsl.l)]
}

// Generate monochromatic colors
export function getMonochromaticColors(hex: string, count = 5): string[] {
  const hsl = hexToHsl(hex)
  if (!hsl) return Array(count).fill("#000000")

  const result: string[] = []
  const step = 100 / (count + 1)

  for (let i = 1; i <= count; i++) {
    const lightness = Math.min(Math.max(step * i, 10), 90)
    result.push(hslToHex(hsl.h, hsl.s, lightness))
  }

  return result
}

// Save favorite colors to localStorage
export function saveFavoriteColor(color: string, name = ""): void {
  try {
    const favorites = getFavoriteColors()
    const timestamp = new Date().toISOString()

    // Check if color already exists
    const existingIndex = favorites.findIndex((f) => f.color.toLowerCase() === color.toLowerCase())

    if (existingIndex >= 0) {
      // Update existing color
      favorites[existingIndex] = {
        ...favorites[existingIndex],
        name: name || favorites[existingIndex].name,
        updatedAt: timestamp,
      }
    } else {
      // Add new color
      favorites.push({
        id: Date.now().toString(),
        color,
        name: name || getColorName(color),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }

    localStorage.setItem("favoriteColors", JSON.stringify(favorites))
  } catch (error) {
    console.error("Error saving favorite color:", error)
  }
}

// Get favorite colors from localStorage
export function getFavoriteColors(): Array<{
  id: string
  color: string
  name: string
  createdAt: string
  updatedAt: string
}> {
  try {
    const favorites = localStorage.getItem("favoriteColors")
    return favorites ? JSON.parse(favorites) : []
  } catch (error) {
    console.error("Error getting favorite colors:", error)
    return []
  }
}

// Remove favorite color from localStorage
export function removeFavoriteColor(id: string): void {
  try {
    const favorites = getFavoriteColors()
    const updatedFavorites = favorites.filter((f) => f.id !== id)
    localStorage.setItem("favoriteColors", JSON.stringify(updatedFavorites))
  } catch (error) {
    console.error("Error removing favorite color:", error)
  }
}

// Save color history to localStorage
export function saveColorHistory(color: string): void {
  try {
    const history = getColorHistory()
    const timestamp = new Date().toISOString()

    // Check if color already exists
    const existingIndex = history.findIndex((h) => h.color.toLowerCase() === color.toLowerCase())

    if (existingIndex >= 0) {
      // Move to top and update timestamp
      const existing = history.splice(existingIndex, 1)[0]
      history.unshift({
        ...existing,
        updatedAt: timestamp,
      })
    } else {
      // Add new color to the beginning
      history.unshift({
        id: Date.now().toString(),
        color,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }

    // Limit history to 20 items
    const limitedHistory = history.slice(0, 20)

    localStorage.setItem("colorHistory", JSON.stringify(limitedHistory))
  } catch (error) {
    console.error("Error saving color history:", error)
  }
}

// Get color history from localStorage
export function getColorHistory(): Array<{
  id: string
  color: string
  createdAt: string
  updatedAt: string
}> {
  try {
    const history = localStorage.getItem("colorHistory")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Error getting color history:", error)
    return []
  }
}

// Clear color history
export function clearColorHistory(): void {
  try {
    localStorage.setItem("colorHistory", JSON.stringify([]))
  } catch (error) {
    console.error("Error clearing color history:", error)
  }
}
