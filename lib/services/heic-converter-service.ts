"use client";

import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';

// Helper to check if code is running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Define API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
  warning?: string;
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
  startStatusPolling(jobId: string, onJobUpdate: (job: ConversionJob) => void): void;
  stopStatusPolling(): void;
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
  // Add a flag to track ongoing API requests
  private isPolling: boolean = false;
  private shouldContinuePolling: boolean = false;
  // Queue management variables
  private uploadQueue: Array<{file: File, masterJobId: string, settings: ConversionSettings, fileIndex: number, status: string}> = [];
  private activeUploads: number = 0;
  private maxConcurrentUploads: number = 2; // Limit to 2 concurrent uploads
  private isProcessingQueue: boolean = false;

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
        return 200; // Default to a sensible value
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
      return 200; // Default to a sensible value on error
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
      
      console.log(`Starting conversion of ${files.length} files with settings:`, settings);
      
      // Create a master job to track the batch
      const masterJobId = await this.createMasterJob(files.length, settings);
      console.log(`Created master job with ID: ${masterJobId}`);
      
      // Clear any existing queue (should not happen, but just in case)
      this.uploadQueue = [];
      
      // Add all files to the upload queue with "queued" status
      const queuedFiles = files.map((file, index) => ({
        file,
        masterJobId,
        settings,
        fileIndex: index,
        status: 'queued'
      }));
      this.uploadQueue = queuedFiles;
      
      console.log(`Added ${files.length} files to upload queue`);
      
      // Dispatch initial event with queue status
      this.dispatchQueueStatusUpdate(masterJobId, files);
      
      // Start processing the queue
      this.processUploadQueue();
      
      // Return the master job ID for tracking overall progress immediately
      return masterJobId;
    } catch (error) {
      console.error('Error starting conversion:', error);
      throw error;
    }
  }
  
  // Dispatch an event with the current status of uploading and queued files
  private dispatchQueueStatusUpdate(masterJobId: string, originalFiles: File[]) {
    if (typeof window === 'undefined') return;
    
    // Create arrays for files being uploaded and files in queue
    const uploadingFiles = [];
    const queuedFiles = [];
    
    // Track which files are currently being uploaded (first 4 files that were removed from queue)
    for (let i = 0; i < originalFiles.length; i++) {
      const file = originalFiles[i];
      const isQueued = this.uploadQueue.some(qf => qf.fileIndex === i);
      
      if (isQueued) {
        queuedFiles.push({
          name: file.name,
          originalName: file.name,
          status: 'queued',
          index: i
        });
      } else if (this.activeUploads > 0 && uploadingFiles.length < this.activeUploads) {
        // Files not in queue and within activeUploads count are being uploaded
        uploadingFiles.push({
          name: file.name,
          originalName: file.name,
          status: 'uploading',
          index: i
        });
      }
    }
    
    // Dispatch a custom event with the queue status
    const event = new CustomEvent('fileUploadStatusUpdate', {
      detail: {
        masterJobId,
        status: 'uploading',
        files: [...uploadingFiles, ...queuedFiles]
      }
    });
    
    window.dispatchEvent(event);
    console.log(`Dispatched fileUploadStatusUpdate event with ${uploadingFiles.length} uploading and ${queuedFiles.length} queued files`);
  }
  
  // Process files in the upload queue with a maximum of 4 concurrent uploads
  private async processUploadQueue() {
    // If already processing or no files in queue, do nothing
    if (this.isProcessingQueue || this.uploadQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Continue processing while there are files in the queue and we have capacity
      while (this.uploadQueue.length > 0 && this.activeUploads < this.maxConcurrentUploads) {
        const nextFile = this.uploadQueue.shift();
        if (!nextFile) break;
        
        this.activeUploads++;
        
        // Update queue status after starting a new upload
        const masterJobId = nextFile.masterJobId;
        
        // Process this file in the background (don't await)
        this.uploadSingleFile(nextFile.file, nextFile.masterJobId, nextFile.settings, nextFile.fileIndex)
          .then(() => {
            console.log(`File ${nextFile.file.name} (${nextFile.fileIndex + 1}) processed successfully`);
          })
          .catch(error => {
            console.error(`Error processing file ${nextFile.file.name}:`, error);
          })
          .finally(() => {
            // Decrease active upload count
            this.activeUploads--;
            
            
            // Continue processing queue if there are more files
            if (this.uploadQueue.length > 0) {
              this.processUploadQueue();
            }
          });
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Helper method to create a master job
  private async createMasterJob(fileCount: number, settings: ConversionSettings): Promise<string> {
    // Send request to create a master job with no files yet
    const response = await fetch(`${HEIC_CONVERSION_ENDPOINT}/create-master-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getUserToken()}`
      },
      body: JSON.stringify({
        fileCount,
        outputFormat: settings.outputFormat,
        quality: settings.quality,
        preserveExif: settings.preserveExif,
        pdfOptions: settings.outputFormat === 'pdf' ? settings.pdfOptions : undefined
      }),
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create master job');
    }
    
    const data = await response.json();
    return data.jobId;
  }

  // Helper method to upload and process a single file
  private async uploadSingleFile(file: File, masterJobId: string, settings: ConversionSettings, fileIndex: number): Promise<void> {
    console.log(`Starting upload for file ${fileIndex + 1}/${this.uploadQueue.length + this.activeUploads}: ${file.name}`);
    
    // Create a FormData object for this specific file
    const formData = new FormData();
    
    // Add the file to the FormData
    formData.append('file', file);
    
    // Add the master job ID for reference
    formData.append('masterJobId', masterJobId);
    
    // Add file index for ordered processing
    formData.append('fileIndex', fileIndex.toString());
    
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
    
    // Send the request to process this specific file
    const response = await fetch(`${HEIC_CONVERSION_ENDPOINT}/process-file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getUserToken()}`
      },
      body: formData,
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to process file ${file.name}`);
    }
    
    // Get the response data - this typically includes the masterJobId and singleFileJobId
    const responseData = await response.json();
    console.log(`File ${file.name} processed successfully:`, responseData);
    
    // Immediately fetch the job status after each file is processed to ensure we have the latest file state
    try {
      console.log(`Fetching latest job status after processing file ${file.name}`);
      const updatedJobStatus = await this.getJobStatus(masterJobId);
      
      // Dispatch a custom event with the updated job status
      if (typeof window !== 'undefined') {
        const fileProcessedEvent = new CustomEvent('fileProcessed', { 
          detail: { 
            masterJobId, 
            fileName: file.name,
            jobStatus: updatedJobStatus,
            fileIndex
          }
        });
        window.dispatchEvent(fileProcessedEvent);
        console.log(`File ${file.name} processed, dispatched fileProcessed event with updated job status`);
      }
    } catch (error) {
      console.error(`Error fetching job status after processing file ${file.name}:`, error);
      // Continue even if job status fetch fails - we don't want to stop the overall process
    }
    
    // Check if this is the first file, fire event for first file uploaded
    if (fileIndex === 0) {
      // Dispatch a custom event that can be listened to by any component
      if (typeof window !== 'undefined') {
        const firstFileUploadedEvent = new CustomEvent('firstFileUploaded', { 
          detail: { 
            masterJobId, 
            fileName: file.name 
          }
        });
        window.dispatchEvent(firstFileUploadedEvent);
        console.log(`First file ${file.name} uploaded successfully, dispatched firstFileUploaded event`);
      }
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
        },
        credentials: 'include',
        mode: 'cors'
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

  // Implement startStatusPolling to check job status periodically
  startStatusPolling(jobId: string, callback: (job: ConversionJob) => void, pollingInterval: number = 2000): void {
    // Clear any existing polling
    this.stopStatusPolling();

    console.log(`Starting status polling for job ${jobId} with interval ${pollingInterval}ms`);
    
    // Keep track of state changes for better debugging
    let previousStatus: string | null = null;
    let statusChangeCount = 0;
    let statusInconsistencies = 0;
    let lastProgressUpdate = Date.now();
    let jobStartTime = Date.now();
    
    // Set polling flags
    this.shouldContinuePolling = true;
    this.isPolling = false;
    
    // Define the polling function that will call itself after waiting
    const pollJobStatus = async () => {
      // If polling was stopped, don't continue
      if (!this.shouldContinuePolling) {
        console.log(`[HeicConverter] Polling stopped for job ${jobId}`);
        return;
      }
      
      // If already polling, wait for the next cycle
      if (this.isPolling) {
        console.log(`[HeicConverter] Skipping poll cycle - previous request still in progress`);
        setTimeout(pollJobStatus, pollingInterval);
        return;
      }
      
      try {
        // Set flag to indicate polling is in progress
        this.isPolling = true;
        
        // Get the current job status
        console.log(`[HeicConverter] Fetching status for job ${jobId}`);
        const jobStatus = await this.getJobStatus(jobId);
        
        // Reset polling flag after response is received
        this.isPolling = false;
        
        if (!jobStatus) {
          console.error(`[HeicConverter] Job ${jobId} not found`);
          this.stopStatusPolling();
          return;
        }
        
        // Check if no files have been uploaded yet
        if (!jobStatus.files || jobStatus.files.length === 0) {
          // If it's been less than 10 seconds since we started polling, use a longer interval for the next poll
          // This helps reduce backend load during the initial file upload phase
          const uploadPhaseTime = Date.now() - jobStartTime;
          const nextPollDelay = uploadPhaseTime < 10000 ? pollingInterval * 2 : pollingInterval;
          
          console.log(`[HeicConverter] No files uploaded yet for job ${jobId}, using longer polling interval (${nextPollDelay}ms)`);
          if (this.shouldContinuePolling) {
            setTimeout(pollJobStatus, nextPollDelay);
          }
          // Still update the UI with current status
          callback(jobStatus);
          return;
        }
        
        // Check for status changes
        if (previousStatus !== null && previousStatus !== jobStatus.status) {
          statusChangeCount++;
          console.log(`[HeicConverter] Job ${jobId} status changed from ${previousStatus} to ${jobStatus.status} (change #${statusChangeCount})`);
        }
        
        // Check for inconsistencies in job status vs. file statuses
        if (jobStatus.files && jobStatus.files.length > 0) {
          const completedFiles = jobStatus.files.filter(file => file.status === 'completed').length;
          const failedFiles = jobStatus.files.filter(file => file.status === 'failed').length;
          const pendingFiles = jobStatus.files.filter(file => file.status === 'pending' || file.status === 'processing').length;
          
          const hasStatusInconsistency = 
            (jobStatus.status === 'failed' && completedFiles === jobStatus.files.length) || 
            (jobStatus.status === 'failed' && completedFiles > 0 && pendingFiles === 0 && failedFiles === 0);
          
          if (hasStatusInconsistency) {
            statusInconsistencies++;
            console.warn(`[HeicConverter] Job ${jobId} has status inconsistency (incident #${statusInconsistencies})`);
            console.warn(`[HeicConverter] Job status is '${jobStatus.status}' but has ${completedFiles}/${jobStatus.files.length} completed files`);
          }
          
          // Log progress updates periodically (not on every check)
          const now = Date.now();
          if (now - lastProgressUpdate > 3000) { // Log every 3 seconds 
            console.log(`[HeicConverter] Job ${jobId} progress: ${jobStatus.progress}%, files: ${completedFiles}/${jobStatus.files.length} completed`);
            lastProgressUpdate = now;
          }
        }
        
        // Store previous status for change detection
        previousStatus = jobStatus.status;
        
        // Fire callback with the job status
        callback(jobStatus);
        
        // Check if job is actually complete before stopping polling
        // Don't stop polling just because status is failed - files may still be uploading
        const emptyFilesArray = !jobStatus.files || jobStatus.files.length === 0;
        const isLikelyStillUploading = emptyFilesArray && (Date.now() - jobStartTime < 300000); // 5 minutes

        if (jobStatus.status === 'completed') {
          // Job is complete - stop polling
          console.log(`[HeicConverter] Stopping status polling for completed job ${jobId}`);
          this.stopStatusPolling();
        } else if (jobStatus.status === 'failed' && !isLikelyStillUploading) {
          // Job failed and not likely still uploading - stop polling
          if (statusInconsistencies > 0) {
            console.log(`[HeicConverter] Job ${jobId} finished with ${statusInconsistencies} status inconsistencies detected`);
          }
          console.log(`[HeicConverter] Stopping status polling for failed job ${jobId}`);
          this.stopStatusPolling();
        } else if (jobStatus.status === 'failed' && isLikelyStillUploading) {
          console.log(`[HeicConverter] Job ${jobId} marked as failed but uploads may still be in progress - continuing to poll`);
          
          // Schedule next poll if we should continue
          if (this.shouldContinuePolling) {
            setTimeout(pollJobStatus, pollingInterval);
          }
        } else {
          // For all other cases, schedule next poll if we should continue
          if (this.shouldContinuePolling) {
            setTimeout(pollJobStatus, pollingInterval);
          }
        }
      } catch (error) {
        // Reset polling flag if there was an error
        this.isPolling = false;
        console.error(`[HeicConverter] Error polling job status: ${error}`);
        
        // Continue polling despite errors, unless stopped
        if (this.shouldContinuePolling) {
          setTimeout(pollJobStatus, pollingInterval);
        }
      }
    };
    
    // Start the polling process immediately
    pollJobStatus();
  }

  // Stop polling for job status
  stopStatusPolling(): void {
    // Only stop polling in browser environment
    if (!isBrowser) return;
    
    // Set flag to false to stop the polling cycle
    this.shouldContinuePolling = false;
    console.log('Stopped job status polling');
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