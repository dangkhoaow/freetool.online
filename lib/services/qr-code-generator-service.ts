import QRCode from "qrcode"

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark: string
    light: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  logoImage?: string | null
  logoWidth?: number
  logoHeight?: number
}

export interface SavedQRCode {
  id: string
  content: string
  timestamp: number
  label?: string
  options?: QRCodeOptions
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 300,
  margin: 4,
  color: {
    dark: "#000000",
    light: "#ffffff",
  },
  errorCorrectionLevel: "M",
  logoImage: null,
  logoWidth: 60,
  logoHeight: 60,
}

export async function generateQRCode(text: string, options: QRCodeOptions = DEFAULT_OPTIONS): Promise<string> {
  try {
    // Generate basic QR code
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: options.width,
      margin: options.margin,
      color: options.color,
      errorCorrectionLevel: options.errorCorrectionLevel || "H", // Use high error correction when adding logo
    })

    // If no logo image, return the basic QR code
    if (!options.logoImage) {
      return qrCodeDataUrl
    }

    // Create canvas to combine QR code with logo
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Load QR code image
    const qrImage = new Image()
    qrImage.crossOrigin = "anonymous"
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve
      qrImage.onerror = reject
      qrImage.src = qrCodeDataUrl
    })

    // Set canvas size to match QR code
    canvas.width = qrImage.width
    canvas.height = qrImage.height

    // Draw QR code on canvas
    ctx.drawImage(qrImage, 0, 0, canvas.width, canvas.height)

    // Load and draw logo
    const logoImage = new Image()
    logoImage.crossOrigin = "anonymous"
    await new Promise((resolve, reject) => {
      logoImage.onload = resolve
      logoImage.onerror = reject
      logoImage.src = options.logoImage as string
    })

    // Calculate logo position (center)
    const logoWidth = options.logoWidth || canvas.width * 0.2
    const logoHeight = options.logoHeight || logoWidth
    const logoX = (canvas.width - logoWidth) / 2
    const logoY = (canvas.height - logoHeight) / 2

    // Create rounded rectangle for logo background
    ctx.save()
    ctx.fillStyle = "#FFFFFF"
    roundRect(ctx, logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10, 5)
    ctx.fill()
    ctx.restore()

    // Draw logo
    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)

    // Return combined image as data URL
    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

// Helper function to draw rounded rectangle
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export async function generateQRCodeCanvas(
  text: string,
  canvas: HTMLCanvasElement,
  options: QRCodeOptions = DEFAULT_OPTIONS,
): Promise<void> {
  try {
    // Generate QR code data URL first
    const dataUrl = await generateQRCode(text, options)

    // Draw the complete QR code (with logo if present) on the provided canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = dataUrl
    })

    // Clear canvas and draw the image
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
  } catch (error) {
    console.error("Error generating QR code on canvas:", error)
    throw new Error("Failed to generate QR code on canvas")
  }
}

export function downloadQRCode(dataUrl: string, fileName = "qrcode.png"): void {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function saveQRCodeToHistory(content: string, options?: QRCodeOptions, label?: string): void {
  try {
    const savedCodes = getSavedQRCodes()

    // Check if this content already exists
    const existingIndex = savedCodes.findIndex((code) => code.content === content)

    if (existingIndex !== -1) {
      // Update the existing entry
      savedCodes[existingIndex] = {
        ...savedCodes[existingIndex],
        timestamp: Date.now(),
        label: label || savedCodes[existingIndex].label,
        options: options || savedCodes[existingIndex].options,
      }
    } else {
      // Add new entry
      savedCodes.unshift({
        id: generateId(),
        content,
        timestamp: Date.now(),
        label,
        options,
      })
    }

    // Keep only the most recent 10 entries
    const trimmedCodes = savedCodes.slice(0, 10)

    localStorage.setItem("qrcode_history", JSON.stringify(trimmedCodes))
  } catch (error) {
    console.error("Error saving QR code to history:", error)
  }
}

export function getSavedQRCodes(): SavedQRCode[] {
  try {
    const savedCodes = localStorage.getItem("qrcode_history")
    return savedCodes ? JSON.parse(savedCodes) : []
  } catch (error) {
    console.error("Error getting saved QR codes:", error)
    return []
  }
}

export function deleteSavedQRCode(id: string): void {
  try {
    const savedCodes = getSavedQRCodes()
    const updatedCodes = savedCodes.filter((code) => code.id !== id)
    localStorage.setItem("qrcode_history", JSON.stringify(updatedCodes))
  } catch (error) {
    console.error("Error deleting saved QR code:", error)
  }
}

export function clearQRCodeHistory(): void {
  try {
    localStorage.removeItem("qrcode_history")
  } catch (error) {
    console.error("Error clearing QR code history:", error)
  }
}

export function validateQRCodeContent(content: string): { valid: boolean; message?: string } {
  if (!content) {
    return { valid: false, message: "Content cannot be empty" }
  }

  if (content.length > 2000) {
    return {
      valid: false,
      message: "Content is too long. QR codes with more than 2000 characters may be difficult to scan.",
    }
  }

  return { valid: true }
}

export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Create canvas and resize image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to data URL
        resolve(canvas.toDataURL("image/png"))
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export function validateLogoImage(file: File): { valid: boolean; message?: string } {
  // Check file type
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Invalid file type. Please upload a JPEG, PNG, GIF, or SVG image.",
    }
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      message: "File is too large. Maximum size is 2MB.",
    }
  }

  return { valid: true }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
