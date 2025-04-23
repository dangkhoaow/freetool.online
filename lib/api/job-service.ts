// API service for job-related operations
"use client";

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API endpoints
const JOB_STATUS_ENDPOINT = `${API_BASE_URL}/api/jobs/status`;
const FIX_JOB_STATUS_ENDPOINT = `${API_BASE_URL}/api/jobs/fix-status`;
const FIX_ALL_JOBS_ENDPOINT = `${API_BASE_URL}/api/jobs/fix-all`;
const FIX_JOB_URLS_ENDPOINT = `${API_BASE_URL}/api/jobs/fix-urls`;

// Response interfaces
interface ApiResponse {
  success: boolean;
  message?: string;
}

interface FixAllJobsResponse extends ApiResponse {
  fixedCount?: number;
}

/**
 * Synchronizes the job status with the server
 * 
 * @param jobId The ID of the job to synchronize
 * @param userId The user ID associated with the job
 * @returns Promise with API response
 */
export async function syncJobStatus(jobId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${JOB_STATUS_ENDPOINT}/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing job status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Fixes the status of a specific job
 * 
 * @param jobId The ID of the job to fix
 * @param userId The user ID associated with the job
 * @returns Promise with API response
 */
export async function fixJobStatus(jobId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${FIX_JOB_STATUS_ENDPOINT}/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fixing job status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Fixes all failed jobs for a user
 * 
 * @param userId The user ID for which to fix all failed jobs
 * @returns Promise with API response
 */
export async function fixAllFailedJobs(userId: string): Promise<FixAllJobsResponse> {
  try {
    const response = await fetch(FIX_ALL_JOBS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fixing all failed jobs:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Fixes URLs for files in a job
 * 
 * @param jobId The ID of the job for which to fix file URLs
 * @param userId The user ID associated with the job
 * @returns Promise with API response
 */
export async function fixJobUrls(jobId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${FIX_JOB_URLS_ENDPOINT}/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fixing job URLs:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 