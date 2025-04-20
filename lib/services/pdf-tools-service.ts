// Define the types for PDF operations
export interface PdfMergeResult {
  url: string
  size: number
}

export interface PdfSplitResult {
  urls: string[]
}

export interface PdfCompressResult {
  url: string
  size: number
}

export interface PdfToImageResult {
  images: { url: string; name: string }[]
}

export interface ImageToPdfResult {
  url: string
}

export interface PdfToImageOptions {
  format: "jpg" | "png"
  quality: number
  pageRange: string
}

export interface ImageToPdfOptions {
  pageSize: string
  orientation: "portrait" | "landscape"
  margin: "none" | "small" | "medium" | "large"
}

// Singleton instance
let instance: PdfToolsService | null = null

export class PdfToolsService {
  private apiBaseUrl: string
  private userId: string

  constructor() {
    // Use environment variable for API URL if available, otherwise default
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

    // Generate or retrieve a user ID for tracking operations
    this.userId = this.getUserId()
  }

  // Get or create a user ID
  private getUserId(): string {
    if (typeof window !== "undefined") {
      let userId = localStorage.getItem("userId")
      if (!userId) {
        userId = "user_" + Math.random().toString(36).substring(2, 15)
        localStorage.setItem("userId", userId)
      }
      return userId
    }
    return "anonymous"
  }

  // Get API base URL
  public getApiBaseUrl(): string {
    return this.apiBaseUrl
  }

  // Get PDF page count
  public async getPdfPageCount(file: File): Promise<number> {
    // In a real implementation, this would extract the page count from the PDF
    // For now, we'll simulate it
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate page count based on file size (1 page per 50KB)
        const pageCount = Math.max(1, Math.ceil(file.size / 50000))
        resolve(pageCount)
      }, 500)
    })
  }

  // Merge multiple PDF files
  public async mergePdfs(files: File[], progressCallback?: (progress: number) => void): Promise<PdfMergeResult> {
    // Simulate API call and processing
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progressCallback) progressCallback(Math.min(progress, 100))
        if (progress >= 100) {
          clearInterval(interval)

          // Simulate result
          resolve({
            url: URL.createObjectURL(
              new Blob(
                [
                  /* PDF data would go here */
                ],
                { type: "application/pdf" },
              ),
            ),
            size: files.reduce((total, file) => total + file.size, 0) * 0.95, // Slightly smaller than original
          })
        }
      }, 500)
    })
  }

  // Split PDF into multiple files
  public async splitPdfAllPages(file: File, progressCallback?: (progress: number) => void): Promise<PdfSplitResult> {
    // Get page count
    const pageCount = await this.getPdfPageCount(file)

    // Simulate API call and processing
    return this.simulatePdfSplitting(file, pageCount, progressCallback)
  }

  // Split PDF by page range
  public async splitPdfByRange(
    file: File,
    pageRange: string,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfSplitResult> {
    // Parse page range (e.g., "1-5")
    const [start, end] = pageRange.split("-").map(Number)
    const pageCount = end - start + 1

    // Simulate API call and processing
    return this.simulatePdfSplitting(file, pageCount, progressCallback)
  }

  // Split PDF by specific pages
  public async splitPdfByPages(
    file: File,
    pageList: string,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfSplitResult> {
    // Parse page list (e.g., "1,3,5,7")
    const pages = pageList.split(",").map(Number)
    const pageCount = pages.length

    // Simulate API call and processing
    return this.simulatePdfSplitting(file, pageCount, progressCallback)
  }

  // Helper method to simulate PDF splitting
  private simulatePdfSplitting(
    file: File,
    pageCount: number,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfSplitResult> {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progressCallback) progressCallback(Math.min(progress, 100))
        if (progress >= 100) {
          clearInterval(interval)

          // Simulate result with multiple PDF URLs
          const urls = Array.from({ length: pageCount }, (_, i) =>
            URL.createObjectURL(
              new Blob(
                [
                  /* PDF data would go here */
                ],
                { type: "application/pdf" },
              ),
            ),
          )

          resolve({ urls })
        }
      }, 500)
    })
  }

  // Compress PDF
  public async compressPdf(
    file: File,
    compressionLevel: "low" | "medium" | "high",
    progressCallback?: (progress: number) => void,
  ): Promise<PdfCompressResult> {
    // Simulate API call and processing
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progressCallback) progressCallback(Math.min(progress, 100))
        if (progress >= 100) {
          clearInterval(interval)

          // Calculate compressed size based on compression level
          let compressionRatio
          switch (compressionLevel) {
            case "low":
              compressionRatio = 0.8
              break
            case "medium":
              compressionRatio = 0.6
              break
            case "high":
              compressionRatio = 0.4
              break
            default:
              compressionRatio = 0.6
          }

          // Simulate result
          resolve({
            url: URL.createObjectURL(
              new Blob(
                [
                  /* PDF data would go here */
                ],
                { type: "application/pdf" },
              ),
            ),
            size: Math.floor(file.size * compressionRatio),
          })
        }
      }, 500)
    })
  }

  // Convert PDF to images
  public async convertPdfToImages(
    file: File,
    options: PdfToImageOptions,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfToImageResult> {
    // Get page count or parse page range
    let pageCount
    if (options.pageRange === "all") {
      pageCount = await this.getPdfPageCount(file)
    } else if (options.pageRange.includes("-")) {
      const [start, end] = options.pageRange.split("-").map(Number)
      pageCount = end - start + 1
    } else if (options.pageRange.includes(",")) {
      pageCount = options.pageRange.split(",").length
    } else {
      pageCount = 1
    }

    // Simulate API call and processing
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progressCallback) progressCallback(Math.min(progress, 100))
        if (progress >= 100) {
          clearInterval(interval)

          // Simulate result with image URLs
          const images = Array.from({ length: pageCount }, (_, i) => ({
            url: URL.createObjectURL(
              new Blob(
                [
                  /* Image data would go here */
                ],
                { type: options.format === "jpg" ? "image/jpeg" : "image/png" },
              ),
            ),
            name: `page-${i + 1}.${options.format}`,
          }))

          resolve({ images })
        }
      }, 500)
    })
  }

  // Create PDF from images
  public async createPdfFromImages(
    files: File[],
    options: ImageToPdfOptions,
    progressCallback?: (progress: number) => void,
  ): Promise<ImageToPdfResult> {
    // Simulate API call and processing
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progressCallback) progressCallback(Math.min(progress, 100))
        if (progress >= 100) {
          clearInterval(interval)

          // Simulate result
          resolve({
            url: URL.createObjectURL(
              new Blob(
                [
                  /* PDF data would go here */
                ],
                { type: "application/pdf" },
              ),
            ),
          })
        }
      }, 500)
    })
  }
}

// Import the browser-based implementation
import { getBrowserPdfToolsService } from "./browser-pdf-tools-service"

// Return the browser-based implementation instead of the server one
export function getPdfToolsService(): PdfToolsService {
  // Use the browser implementation for client-side processing
  if (typeof window !== "undefined") {
    return getBrowserPdfToolsService() as unknown as PdfToolsService;
  }
  
  // Fallback to the server implementation if needed (SSR context)
  if (!instance) {
    instance = new PdfToolsService()
  }
  return instance
}
