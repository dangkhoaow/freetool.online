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
const SETTINGS_ENDPOINT = `${API_BASE_URL}/api/settings/max-files`;

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

// Define the service interface
export interface HeicConverterService {
  convertFiles(files: File[], settings: ConversionSettings): Promise<string>;
  getJobStatus(jobId: string): Promise<ConversionJob>;
  downloadFile(filePath: string, fileName: string): Promise<void>;
  downloadAllAsZip(jobId: string, outputFormat: string): Promise<void>;
  connectWebSocket(onJobUpdate: (job: ConversionJob) => void): void;
  disconnectWebSocket(): void;
  getUserToken(): string;
  getMaxFilesLimit(): Promise<number>;
  getApiBaseUrl(): string;
}

// Implementation
class _HeicConverterService implements HeicConverterService {
  private socket: Socket | null = null;
  private userId: string = '';
  private maxFiles: number = 15; // Default limit
  private apiBaseUrl: string = API_BASE_URL;

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
    this.getMaxFilesLimit(); // Fetch max files setting on initialization
  }

  // Fetch max files setting from the server
  public async getMaxFilesLimit(): Promise<number> {
    try {
      if (!isBrowser) return this.maxFiles;
      
      const response = await fetch(`${this.apiBaseUrl}/api/settings/max-files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch max files setting:', response.statusText);
        return 200; // Default value
      }

      const data = await response.json();
      if (data.maxFiles) {
        this.maxFiles = data.maxFiles;
        console.log(`Max files per job set to: ${this.maxFiles}`);
      } else {
        console.log(`Max files not found in settings, using default: ${this.maxFiles}`);
      }
    } catch (error) {
      console.error('Error fetching max files setting:', error);
    }
    
    return this.maxFiles;
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
    try {
      // Ensure we're in a browser environment
      if (!isBrowser) {
        throw new Error('This method can only be called in a browser environment');
      }
      
      // Check if there are too many files
      if (files.length > this.maxFiles) {
        throw new Error(`Too many files. Maximum allowed is ${this.maxFiles}.`);
      }
      
      // Create a FormData object to send files
      const formData = new FormData();
      
      // Clear the FormData first to ensure no stale data
      
      // Add each file to the FormData one by one
      for (let i = 0; i <files.length; i++) {
        formData.append('files', files[i]);
        console.log(`Adding file ${i+1}/${files.length}: ${files[i].name} (${files[i].size} bytes)`);
      }

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

      // Log the body formdata for debugging
      console.log('Sending request with FormData:', Array.from(formData.entries()).map(entry => {
        // Don't log the file content, just name and size
        if (entry[1] instanceof File) {
          return [`${entry[0]}`, `File: ${(entry[1] as File).name} (${(entry[1] as File).size} bytes)`];
        }
        return entry;
      }));

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
      
      const token = this.getUserToken();
      console.log('Using auth token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${JOB_STATUS_ENDPOINT}/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Job status API error:', response.status, response.statusText, errorData);
        throw new Error(errorData.error || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      // Check if the response has a job property (from the [jobId] endpoint)
      if (data && data.job) {
        console.log('Received job status with job wrapper:', data);
        return data.job;
      } 
      // Check if the response is the job itself (direct from queue manager)
      else if (data && data.jobId) {
        console.log('Received direct job status:', data);
        return data;
      } 
      else {
        console.error('Invalid job status response format:', data);
        throw new Error('Invalid job status response from server');
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
      throw error;
    }
  }

  // Download a file
  async downloadFile(filePath: string, fileName: string): Promise<void> {
    try {
      // Ensure we're in a browser environment
      if (!isBrowser) {
        throw new Error('This method can only be called in a browser environment');
      }
      
      const response = await fetch(FILES_ENDPOINT + filePath, {
        headers: {
          'Authorization': `Bearer ${this.getUserToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download file');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Download all files as a zip
  async downloadAllAsZip(jobId: string, outputFormat: string): Promise<void> {
    try {
      // Ensure we're in a browser environment
      if (!isBrowser) {
        throw new Error('This method can only be called in a browser environment');
      }
      
      const response = await fetch(`${FILES_ENDPOINT}/zip/${jobId}?outputFormat=${outputFormat}`, {
        headers: {
          'Authorization': `Bearer ${this.getUserToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download zip');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `job-${jobId}-${outputFormat.toUpperCase()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading zip:', error);
      throw error;
    }
  }

  // Get user token
  getUserToken(): string {
    // Ensure we're in a browser environment
    if (!isBrowser) {
      return ''; // Return empty string during SSR
    }
    
    // Get existing token or generate new one
    let token = localStorage.getItem('userToken');
    
    // If no token exists, create one using the userId
    if (!token) {
      token = `user_${this.userId}`;
      localStorage.setItem('userToken', token);
    }
    
    return token;
  }

  // Get API base URL
  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }
}

export default _HeicConverterService;

// Singleton instance
let _instance: _HeicConverterService | null = null;

// Function to get singleton instance
export function getHeicConverterService(): _HeicConverterService {
  if (!_instance) {
    _instance = new _HeicConverterService();
  }
  return _instance;
}