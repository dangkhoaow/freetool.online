// Define the types for the conversion job and related entities
export interface ConversionFile {
  id?: string
  originalName: string
  convertedName?: string
  status: "pending" | "processing" | "completed" | "failed"
  size?: number
  convertedPath?: string
  thumbnailUrl?: string
  error?: string
}

export interface ConversionJob {
  jobId: string
  userId?: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  files?: ConversionFile[]
  createdAt?: string
  updatedAt?: string
  error?: string
}

// Singleton instance
let instance: GifConverterService | null = null

export class GifConverterService {
  private pollingInterval: NodeJS.Timeout | null = null
  private apiBaseUrl: string
  private userId: string

  constructor() {
    // Use environment variable for API URL if available, otherwise default
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

    // Generate or retrieve a user ID for tracking conversions
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

  // Get maximum files limit
  public async getMaxFilesLimit(): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/settings/max-files`)
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }
      const data = await response.json()
      return data.maxFiles || 15
    } catch (error) {
      console.error("Failed to fetch max files limit:", error)
      return 15 // Default value
    }
  }

  // Convert GIF files to frames in the specified format
  public async convertFiles(files: File[], settings: any): Promise<string> {
    try {
      // Create a master job ID for this batch
      const masterJobId = await this.createConversionJob(files.length)

      // Upload each file and start conversion
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await this.uploadAndConvertFile(file, masterJobId, settings, i === 0)
      }

      return masterJobId
    } catch (error) {
      console.error("Error in convertFiles:", error)
      throw new Error("Failed to start conversion process")
    }
  }

  // Create a new conversion job
  private async createConversionJob(fileCount: number): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/gif-conversion/create-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: this.userId,
          fileCount,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      return data.jobId
    } catch (error) {
      console.error("Error creating conversion job:", error)
      throw new Error("Failed to create conversion job")
    }
  }

  // Upload and convert a single file
  private async uploadAndConvertFile(
    file: File,
    masterJobId: string,
    settings: any,
    isFirstFile: boolean,
  ): Promise<void> {
    try {
      // Create form data for the file upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("jobId", masterJobId)
      formData.append("userId", this.userId)
      formData.append("settings", JSON.stringify(settings))

      // Upload the file
      const response = await fetch(`${this.apiBaseUrl}/api/gif-conversion/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()

      // Dispatch event for first file uploaded
      if (isFirstFile) {
        this.dispatchFirstFileUploadedEvent(masterJobId, file.name)
      }

      // Dispatch event for file processed
      this.dispatchFileProcessedEvent(masterJobId, file.name, data)

      return data
    } catch (error) {
      console.error("Error uploading and converting file:", error)
      throw new Error("Failed to upload and convert file")
    }
  }

  // Start polling for job status updates
  public startStatusPolling(jobId: string, callback: (job: ConversionJob) => void, interval = 2000): void {
    // Clear any existing polling
    this.stopStatusPolling()

    // Start new polling
    this.pollingInterval = setInterval(async () => {
      try {
        const job = await this.getJobStatus(jobId)
        callback(job)

        // Stop polling if job is completed or failed
        if (job.status === "completed" || job.status === "failed") {
          this.stopStatusPolling()
        }
      } catch (error) {
        console.error("Error polling job status:", error)
      }
    }, interval)
  }

  // Stop polling for job status updates
  public stopStatusPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // Get the status of a conversion job
  public async getJobStatus(jobId: string): Promise<ConversionJob> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/gif-conversion/job-status/${jobId}?userId=${this.userId}`)

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting job status:", error)
      throw new Error("Failed to get job status")
    }
  }

  // Dispatch event when the first file is uploaded
  private dispatchFirstFileUploadedEvent(masterJobId: string, fileName: string): void {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("firstFileUploaded", {
        detail: {
          masterJobId,
          fileName,
        },
      })
      window.dispatchEvent(event)
    }
  }

  // Dispatch event when a file is processed
  private dispatchFileProcessedEvent(masterJobId: string, fileName: string, jobStatus: any): void {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("fileProcessed", {
        detail: {
          masterJobId,
          fileName,
          jobStatus,
        },
      })
      window.dispatchEvent(event)
    }
  }
}

// Get or create the GifConverterService instance
export function getGifConverterService(): GifConverterService {
  if (!instance) {
    instance = new GifConverterService()
  }
  return instance
}
