// Define interfaces for editor elements
export interface Layer {
  id: string
  name: string
  type: "image" | "text" | "shape" | "vector"
  visible: boolean
  locked: boolean
  opacity: number
  data: any
  position: { x: number; y: number }
  width: number
  height: number
  rotation: number
  filters: Adjustment[]
  blendMode: BlendMode
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"

export interface Adjustment {
  type: AdjustmentType
  value: number
}

export type AdjustmentType =
  | "brightness"
  | "contrast"
  | "saturation"
  | "hue"
  | "blur"
  | "sharpness"
  | "exposure"
  | "temperature"
  | "tint"

export interface Selection {
  path: Path2D
  x: number
  y: number
  width: number
  height: number
}

export interface FilterPreset {
  id: string
  name: string
  adjustments: Adjustment[]
  preview?: string
}

// Default adjustment values
export const DEFAULT_ADJUSTMENTS: Adjustment[] = [
  { type: "brightness", value: 0 },
  { type: "contrast", value: 0 },
  { type: "saturation", value: 0 },
  { type: "hue", value: 0 },
  { type: "blur", value: 0 },
  { type: "sharpness", value: 0 },
  { type: "exposure", value: 0 },
  { type: "temperature", value: 0 },
  { type: "tint", value: 0 },
]

// Default filter presets
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "vintage",
    name: "Vintage",
    adjustments: [
      { type: "saturation", value: -20 },
      { type: "temperature", value: 15 },
      { type: "contrast", value: 10 },
    ],
  },
  {
    id: "blackWhite",
    name: "Black & White",
    adjustments: [
      { type: "saturation", value: -100 },
      { type: "contrast", value: 20 },
    ],
  },
  {
    id: "warm",
    name: "Warm",
    adjustments: [
      { type: "temperature", value: 30 },
      { type: "saturation", value: 10 },
    ],
  },
  {
    id: "cool",
    name: "Cool",
    adjustments: [
      { type: "temperature", value: -30 },
      { type: "tint", value: 10 },
    ],
  },
  {
    id: "dramatic",
    name: "Dramatic",
    adjustments: [
      { type: "contrast", value: 40 },
      { type: "brightness", value: -10 },
      { type: "saturation", value: 10 },
    ],
  },
]

// Apply adjustments to canvas
export function applyAdjustments(
  context: CanvasRenderingContext2D,
  imageData: ImageData,
  adjustments: Adjustment[],
): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const newImageData = new ImageData(data, imageData.width, imageData.height)

  for (let i = 0; i < data.length; i += 4) {
    adjustments.forEach((adjustment) => {
      switch (adjustment.type) {
        case "brightness":
          data[i] = Math.min(255, Math.max(0, data[i] + adjustment.value * 2.55))
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment.value * 2.55))
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment.value * 2.55))
          break

        case "contrast":
          const factor = (259 * (adjustment.value + 255)) / (255 * (259 - adjustment.value))
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
          break

        case "saturation":
          const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          const satFactor = 1 + adjustment.value / 100
          data[i] = Math.min(255, Math.max(0, gray + satFactor * (data[i] - gray)))
          data[i + 1] = Math.min(255, Math.max(0, gray + satFactor * (data[i + 1] - gray)))
          data[i + 2] = Math.min(255, Math.max(0, gray + satFactor * (data[i + 2] - gray)))
          break

        // Additional adjustment types would be implemented here
      }
    })
  }

  return newImageData
}

// Convert image to base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Update the loadImage function to properly handle CORS
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (e) => {
      console.error("Error loading image:", e)
      reject(new Error("Failed to load image"))
    }
    img.src = src
  })
}

// Export canvas to various formats
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  format: "jpeg" | "png" | "webp" | "svg",
  quality = 0.92,
): Promise<string> {
  // Create a temporary canvas to handle the export with transparency
  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext("2d")

  if (!tempCtx) return ""

  // Clear the canvas to ensure transparency
  tempCtx.clearRect(0, 0, canvas.width, canvas.height)

  // Copy only the actual image data from the original canvas
  tempCtx.drawImage(canvas, 0, 0)

  if (format === "svg") {
    // SVG export would need to convert canvas content to SVG
    // This is a simplified implementation
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <image href="${tempCanvas.toDataURL("image/png")}" width="${canvas.width}" height="${canvas.height}" />
    </svg>`
    return "data:image/svg+xml;base64," + btoa(svgContent)
  } else if (format === "jpeg") {
    // JPEG doesn't support transparency, use white background
    const jpegCanvas = document.createElement("canvas")
    jpegCanvas.width = canvas.width
    jpegCanvas.height = canvas.height
    const jpegCtx = jpegCanvas.getContext("2d")

    if (!jpegCtx) return ""

    // Fill with white background
    jpegCtx.fillStyle = "#ffffff"
    jpegCtx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the image on top
    jpegCtx.drawImage(tempCanvas, 0, 0)

    return jpegCanvas.toDataURL(`image/jpeg`, quality)
  } else {
    // PNG and WebP support transparency
    return tempCanvas.toDataURL(`image/${format}`, quality)
  }
}

// Background removal using simple alpha thresholding
// Note: A real implementation would use more advanced ML techniques
export function removeBackground(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  tolerance = 30,
): ImageData {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Sample the corner pixels to guess background color
  const cornerSamples = [
    { x: 0, y: 0 },
    { x: canvas.width - 1, y: 0 },
    { x: 0, y: canvas.height - 1 },
    { x: canvas.width - 1, y: canvas.height - 1 },
  ]

  const averageColor = { r: 0, g: 0, b: 0 }

  cornerSamples.forEach((sample) => {
    const index = (sample.y * canvas.width + sample.x) * 4
    averageColor.r += data[index]
    averageColor.g += data[index + 1]
    averageColor.b += data[index + 2]
  })

  averageColor.r /= cornerSamples.length
  averageColor.g /= cornerSamples.length
  averageColor.b /= cornerSamples.length

  // Remove background based on color similarity
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const distance = Math.sqrt(
      Math.pow(r - averageColor.r, 2) + Math.pow(g - averageColor.g, 2) + Math.pow(b - averageColor.b, 2),
    )

    if (distance < tolerance) {
      data[i + 3] = 0 // Make transparent
    }
  }

  return imageData
}

// Magic selection based on color similarity
export function magicSelection(context: CanvasRenderingContext2D, x: number, y: number, tolerance = 30): Selection {
  const canvas = context.canvas
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height

  // Get the color of the clicked pixel
  const index = (y * width + x) * 4
  const targetColor = {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
  }

  // Create a mask for the selected pixels
  const mask = new Uint8Array(width * height)

  // Flood fill algorithm to find similar pixels
  const stack = [{ x, y }]
  const visited = new Set()
  const key = (x: number, y: number) => `${x},${y}`

  while (stack.length > 0) {
    const { x, y } = stack.pop()!
    const pixelKey = key(x, y)

    if (x < 0 || x >= width || y < 0 || y >= height || visited.has(pixelKey)) {
      continue
    }

    visited.add(pixelKey)

    const i = (y * width + x) * 4
    const currentColor = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    }

    const distance = Math.sqrt(
      Math.pow(currentColor.r - targetColor.r, 2) +
        Math.pow(currentColor.g - targetColor.g, 2) +
        Math.pow(currentColor.b - targetColor.b, 2),
    )

    if (distance <= tolerance) {
      mask[y * width + x] = 1

      // Add neighboring pixels to the stack
      stack.push({ x: x + 1, y })
      stack.push({ x: x - 1, y })
      stack.push({ x, y: y + 1 })
      stack.push({ x, y: y - 1 })
    }
  }

  // Create a Path2D from the mask
  const path = new Path2D()
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  // Find contours (simplified approach)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y

        // Check if this is a boundary pixel
        const neighbors = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ]

        for (const { dx, dy } of neighbors) {
          const nx = x + dx
          const ny = y + dy

          if (nx < 0 || nx >= width || ny < 0 || ny >= height || mask[ny * width + nx] === 0) {
            path.rect(x, y, 1, 1)
            break
          }
        }
      }
    }
  }

  return {
    path,
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

// Apply a filter preset
export function applyFilterPreset(
  context: CanvasRenderingContext2D,
  imageData: ImageData,
  presetId: string,
): ImageData {
  const preset = FILTER_PRESETS.find((p) => p.id === presetId)
  if (!preset) return imageData

  return applyAdjustments(context, imageData, preset.adjustments)
}

// Track user actions for undo/redo functionality
export interface EditorAction {
  type: string
  payload: any
  undo: () => void
  redo: () => void
}

export class HistoryManager {
  private undoStack: EditorAction[] = []
  private redoStack: EditorAction[] = []

  push(action: EditorAction) {
    this.undoStack.push(action)
    this.redoStack = [] // Clear redo stack
  }

  undo() {
    if (this.undoStack.length === 0) return

    const action = this.undoStack.pop()!
    action.undo()
    this.redoStack.push(action)
  }

  redo() {
    if (this.redoStack.length === 0) return

    const action = this.redoStack.pop()!
    action.redo()
    this.undoStack.push(action)
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }
}
