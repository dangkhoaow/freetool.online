// API functions for job status management

// Function to sync job status
export async function syncJobStatus(jobId: string, userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const response = await fetch(`${apiUrl}/api/conversion/sync-job-status/${jobId}?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error syncing job status:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Function to fix all failed jobs
export async function fixAllFailedJobs(userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const response = await fetch(`${apiUrl}/api/conversion/fix-all-failed-jobs?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fixing all failed jobs:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Function to fix job status
export async function fixJobStatus(jobId: string, userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const response = await fetch(`${apiUrl}/api/conversion/fix-job-status/${jobId}?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fixing job status:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Function to fix job URLs
export async function fixJobUrls(jobId: string, userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const response = await fetch(`${apiUrl}/api/conversion/fix-job-urls/${jobId}?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fixing job URLs:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}
