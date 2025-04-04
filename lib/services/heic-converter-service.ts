"use client";

import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';

// Helper to check if code is running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Define API endpoints
const API_BASE_URL = 'http://localhost:3001';
const HEIC_CONVERSION_ENDPOINT = `${API_BASE_URL}/api/heic-converter`;
const FILES_ENDPOINT = `${API_BASE_URL}/api/files`;
const JOB_STATUS_ENDPOINT = `${API_BASE_URL}/api/jobs/status`;

// Define conversion job type
export interface ConversionJob {
  jobId: string;
  userId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  files: {
    originalName: string;
    convertedName?: string;
    convertedPath?: string;
    size: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    url?: string;
    thumbnailUrl?: string;
  }[];
  outputFormat: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  zipUrl?: string;
  combinedPdfUrl?: string;
}

// Settings interface
export interface ConversionSettings {
  outputFormat: string;
  quality: number;
  aiOptimization: boolean;
  aiIntensity: string;
  preserveExif: boolean;
  resizeOption: string;
  customWidth: number;
  customHeight: number;
  watermark: {
    enabled: boolean;
    text: string;
    position: string;
    opacity: number;
  };
  pdfOptions: {
    pageSize: string;
    orientation: string;
  };
}

class HeicConverterService {
  private socket: Socket | null = null;
  private userId: string = '';

  constructor() {
    // Only access localStorage in browser environment
    if (isBrowser) {
      // Generate a unique user ID if not available
      this.userId = localStorage.getItem('userId') || uuidv4();
      localStorage.setItem('userId', this.userId);
    } else {
      // During SSR, assign a temporary ID
      this.userId = 'server-side';
    }
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket(onJobUpdate: (job: ConversionJob) => void): void {
    // Only connect WebSocket in browser environment
    if (!isBrowser) return;
    
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      query: { userId: this.userId }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('jobUpdate', (job: ConversionJob) => {
      onJobUpdate(job);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  // Disconnect WebSocket
  disconnectWebSocket(): void {
    // Only disconnect in browser environment
    if (!isBrowser) return;
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Create a conversion job
  async convertFiles(files: File[], settings: ConversionSettings): Promise<string> {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('This method can only be called in a browser environment');
    }
    // Create a FormData object to send files
    const formData = new FormData();
    
    // Add each file to the FormData
    files.forEach(file => {
      formData.append('files', file);
    });

    // Add conversion settings
    formData.append('outputFormat', settings.outputFormat);
    formData.append('quality', settings.quality.toString());
    formData.append('preserveExif', settings.preserveExif.toString());
    
    // Add PDF options if the output format is PDF
    if (settings.outputFormat === 'pdf') {
      formData.append('pdfOptions', JSON.stringify(settings.pdfOptions));
    }

    // Add priority (can be used for premium features later)
    formData.append('priority', '1');

    try {
      const response = await fetch(HEIC_CONVERSION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getUserToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start conversion');
      }

      const data = await response.json();
      return data.jobId;
    } catch (error) {
      console.error('Error starting conversion:', error);
      throw error;
    }
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<ConversionJob> {
    try {
      console.log('Fetching job status from:', `${JOB_STATUS_ENDPOINT}/${jobId}`);
      
      const response = await fetch(`${JOB_STATUS_ENDPOINT}/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.getUserToken()}`
        }
      });

      console.log('Job status response:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 404) {
          // If job not found, return a default job with 'not found' status
          console.warn('Job not found, creating placeholder job');
          return {
            jobId,
            status: 'failed',
            progress: 0,
            files: [],
            outputFormat: 'unknown',
            createdAt: new Date(),
            error: 'Job not found or expired'
          } as ConversionJob;
        }
        
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Failed to get job status');
        } catch (parseError) {
          throw new Error(`Failed to get job status: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Job status data:', data);
      return data;
    } catch (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
  }

  // Get file download URL
  getFileDownloadUrl(filePath: string): string {
    return `${FILES_ENDPOINT}/${filePath}`;
  }

  // Download a converted file
  async downloadFile(filePath: string, fileName: string): Promise<void> {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      throw new Error('This method can only be called in a browser environment');
    }

    console.log(`Downloading file with path: ${filePath}`);
    
    try {
      // If it's a full URL, use it directly
      if (filePath.startsWith('http')) {
        console.log('Direct download of URL:', filePath);
        
        // Fetch the file to force download rather than open in browser
        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        }, 100);
        
        return;
      }
      
      // Otherwise, try to download through the API
      const url = `${FILES_ENDPOINT}/${encodeURIComponent(filePath)}`;
      console.log('Using API endpoint for download:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getUserToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      // Get the blob and create a download link
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Download all files as a ZIP
  async downloadAllAsZip(jobId: string, outputFormat: string): Promise<void> {
    try {
      console.log('Downloading all files as ZIP for job:', jobId);
      
      // Get the job status to check if we have a combined PDF URL
      const job = await this.getJobStatus(jobId);
      
      // For PDF format with combined PDF available, use that instead
      if (outputFormat === 'pdf' && job.combinedPdfUrl) {
        console.log('Combined PDF available, downloading that instead of ZIP');
        return this.downloadFile(job.combinedPdfUrl, `combined-${jobId}.pdf`);
      }
      
      // Otherwise use ZIP download
      const url = `${FILES_ENDPOINT}/download-zip/${jobId}`;
      const filename = `heic-converted-${outputFormat}-${new Date().toISOString().split('T')[0]}.zip`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getUserToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download files');
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger click event
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading files:', error);
      throw error;
    }
  }

  // Get user token (for authentication)
  private getUserToken(): string {
    // In a real app, this might come from an auth system
    // For now, we're using a simple token with the userId
    return `user_${this.userId || 'anonymous'}`;
  }
}

// Lazy initialization of the service
let serviceInstance: HeicConverterService | null = null;

// Get the service instance (creates it on first access in browser environment)
export const getHeicConverterService = (): HeicConverterService => {
  if (isBrowser && !serviceInstance) {
    serviceInstance = new HeicConverterService();
  }
  
  // During SSR, we'll return a minimal instance that won't use browser APIs
  return serviceInstance || new HeicConverterService();
};

// Export a singleton instance for backward compatibility
// This will be initialized only when accessed
export const heicConverterService = isBrowser ? new HeicConverterService() : {} as HeicConverterService;
