// Import API_BASE_URL correctly
import { HeicConverterService } from '../services/heic-converter-service';

// Use the API_BASE_URL constant
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Sync a job's status with its child jobs
 * @param jobId The job ID to sync
 * @param userId The user ID (for authorization)
 */
export const syncJobStatus = async (jobId: string, userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/sync-status/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: errorData?.error || `Failed with status: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('Error syncing job status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Fix all failed jobs that actually have converted files
 * @param userId The user ID (for authorization)
 */
export const fixAllFailedJobs = async (userId: string): Promise<{success: boolean, message?: string, fixedCount?: number}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/fix-all-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: errorData?.error || `Failed with status: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('Error fixing all failed jobs:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Directly fix a job's status based on its files
 * @param jobId The job ID to fix
 * @param userId The user ID (for authorization)
 */
export const fixJobStatus = async (jobId: string, userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/fix-job/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: errorData?.error || `Failed with status: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('Error fixing job status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Fix URLs in job files to use the correct format
 * @param jobId 
 * @param userId 
 */
export const fixJobUrls = async (jobId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/fix-urls/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error fixing job URLs:', data);
      return { 
        success: false, 
        message: data.error || 'Failed to fix job URLs'
      };
    }

    return { 
      success: true, 
      message: data.message || 'Job URLs fixed successfully',
      job: data.job 
    };
  } catch (error) {
    console.error('Error fixing job URLs:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while fixing job URLs'
    };
  }
}; 