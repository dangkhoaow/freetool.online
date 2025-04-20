export interface CompressionFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "processing" | "completed" | "failed"
  originalPath?: string
  compressedPath?: string
  error?: string
}

export interface CompressionJob {
  id: string
  userId?: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  files: CompressionFile[]
  settings: {
    compressionLevel: number
    password: string
    format: "zip" | "7z" | "tar"
    splitSize: number | null
    includeSubfolders: boolean
  }
  result?: {
    downloadUrl: string
    size: number
    compressionRatio: number
  }
  createdAt: Date
  updatedAt: Date
  error?: string
}

type JobStatusCallback = (job: CompressionJob) => void

class ZipCompressorService {
  private static instance: ZipCompressorService
  private pollingInterval: NodeJS.Timeout | null = null
  private apiUrl: string

  private constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"
  }

  public static getInstance(): ZipCompressorService {
    if (!ZipCompressorService.instance) {
      ZipCompressorService.instance = new ZipCompressorService()
    }
    return ZipCompressorService.instance
  }

  // Create a new compression job
  public async createCompressionJob(files: File[], settings: CompressionJob["settings"]): Promise<CompressionJob> {
    try {
      // In a real implementation, this would upload files to a server
      // and create a compression job

      // For now, we'll simulate the API response
      const job: CompressionJob = {
        id: `job-${Date.now()}`,
        status: "pending",
        progress: 0,
        files: files.map((file, index) => ({
          id: `file-${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "pending",
        })),
        settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return job
    } catch (error) {
      console.error("Error creating compression job:", error)
      throw new Error("Failed to create compression job")
    }
  }

  // Start the compression process
  public async startCompression(jobId: string): Promise<void> {
    try {
      // In a real implementation, this would call an API endpoint
      // to start the compression process

      console.log(`Starting compression for job ${jobId}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error starting compression:", error)
      throw new Error("Failed to start compression")
    }
  }

  // Get the status of a compression job
  public async getJobStatus(jobId: string): Promise<CompressionJob> {
    try {
      // In a real implementation, this would call an API endpoint
      // to get the current status of the job

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Simulate a job status response
      const progress = Math.min(100, Math.floor(Math.random() * 20) + 10)

      const job: CompressionJob = {
        id: jobId,
        status: progress < 100 ? "processing" : "completed",
        progress,
        files: [
          {
            id: "file-1",
            name: "example.txt",
            size: 1024,
            type: "text/plain",
            status: progress < 100 ? "processing" : "completed",
          },
        ],
        settings: {
          compressionLevel: 5,
          password: "",
          format: "zip",
          splitSize: null,
          includeSubfolders: true,
        },
        result:
          progress === 100
            ? {
                downloadUrl: "https://example.com/download",
                size: 512,
                compressionRatio: 0.5,
              }
            : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return job
    } catch (error) {
      console.error("Error getting job status:", error)
      throw new Error("Failed to get job status")
    }
  }

  // Start polling for job status updates
  public startStatusPolling(jobId: string, callback: JobStatusCallback): void {
    this.stopStatusPolling() // Stop any existing polling

    // Poll for updates every 1 second
    this.pollingInterval = setInterval(async () => {
      try {
        const job = await this.getJobStatus(jobId)
        callback(job)

        // Stop polling if the job is completed or failed
        if (job.status === "completed" || job.status === "failed") {
          this.stopStatusPolling()
        }
      } catch (error) {
        console.error("Error polling job status:", error)
      }
    }, 1000)
  }

  // Stop polling for job status updates
  public stopStatusPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // Cancel a compression job
  public async cancelJob(jobId: string): Promise<void> {
    try {
      // In a real implementation, this would call an API endpoint
      // to cancel the compression job

      console.log(`Cancelling job ${jobId}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      this.stopStatusPolling()
    } catch (error) {
      console.error("Error cancelling job:", error)
      throw new Error("Failed to cancel job")
    }
  }

  // Download the compressed file
  public async downloadCompressedFile(jobId: string): Promise<string> {
    try {
      // In a real implementation, this would generate a download URL
      // or initiate a file download

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      return "https://example.com/download/archive.zip"
    } catch (error) {
      console.error("Error downloading file:", error)
      throw new Error("Failed to download file")
    }
  }
}

// Export a function to get the singleton instance
export function getZipCompressorService(): ZipCompressorService {
  return ZipCompressorService.getInstance()
}
