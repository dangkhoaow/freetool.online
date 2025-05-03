import { RecordedMedia, RecordingOptions } from './media-recorder-service';
import { v4 as uuidv4 } from 'uuid';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedChunks: Blob[];
}

// Define a segment to track flipped/unflipped recording parts
interface RecordingSegment {
  id: string;
  startTime: number;
  isFlipped: boolean; 
  chunks: Blob[];
}

export class RecordingManagerService {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  private recordingTimerId: any = null;
  private currentDuration: number = 0;
  private mimeType: string = 'video/webm;codecs=vp9,opus';
  private isRestart: boolean = false;
  private previousDuration: number = 0;
  
  // Track recording segments for handling flips
  private recordingSegments: RecordingSegment[] = [];
  private currentSegmentId: string | null = null;
  private isFlipped: boolean = false;
  
  private onStateChangeCallback: ((state: RecordingState) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onDataAvailableCallback: ((blob: Blob) => void) | null = null;
  
  constructor() {
    // Check supported mime types
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      this.mimeType = 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      this.mimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      this.mimeType = 'video/webm';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      this.mimeType = 'video/mp4';
    }
  }

  /**
   * Set up event listeners for recording events
   */
  public setCallbacks(
    onStateChange: (state: RecordingState) => void,
    onError: (error: Error) => void,
    onDataAvailable: ((blob: Blob) => void) | null = null
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;
    this.onDataAvailableCallback = onDataAvailable;
  }

  /**
   * Start recording the provided media stream
   */
  public startRecording(mediaStream: MediaStream, options?: RecordingOptions, preserveTiming: boolean = false, isFlipped: boolean = false): void {
    try {
      // If we're preserving timing, store the current duration
      if (preserveTiming && this.isRecording) {
        this.isRestart = true;
        this.previousDuration = this.currentDuration;
        console.log(`[RECORDING_MANAGER] Preserving timing information, current duration: ${this.previousDuration}s`);
      }
      
      // Track flipped state 
      this.isFlipped = isFlipped;
      console.log(`[RECORDING_MANAGER] Setting flip state: ${this.isFlipped}`);
      
      if (this.isRecording) {
        // This will be handled in a better way, not stopping fully
        console.log(`[RECORDING_MANAGER] Recording already in progress, finalizing current segment`);
        this.finalizeCurrentSegment();
      } else {
        // Reset segments if starting fresh
        this.recordingSegments = [];
      }
      
      console.log(`[RECORDING_MANAGER] Starting recording with options:`, options, preserveTiming ? "(preserving timing)" : "");
      
      this.mediaStream = mediaStream;
      this.recordedChunks = [];
      
      // Set mime type from options if provided
      if (options?.mimeType && MediaRecorder.isTypeSupported(options.mimeType)) {
        this.mimeType = options.mimeType;
        console.log(`[RECORDING_MANAGER] Using mime type: ${this.mimeType}`);
      } else {
        console.log(`[RECORDING_MANAGER] Using default mime type: ${this.mimeType}`);
      }
      
      // Calculate optimal bitrate based on resolution and frame rate
      // Higher frame rates need higher bitrates for quality
      let videoBitsPerSecond = undefined;
      if (options?.resolution?.width) {
        const pixelCount = options.resolution.width * options.resolution.height;
        const fps = options?.frameRate || 30;
        
        // Scale bitrate with resolution and fps (more fps = higher bitrate needed)
        // 720p at 30fps = ~5Mbps, 1080p at 60fps = ~12Mbps
        videoBitsPerSecond = Math.floor((pixelCount / (1280 * 720)) * fps * 170000);
        
        console.log(`[RECORDING_MANAGER] Calculated video bitrate: ${videoBitsPerSecond} bps for ${options.resolution.width}x${options.resolution.height} at ${fps}fps`);
      }
      
      // Create media recorder with enhanced settings
      const recorderOptions = {
        mimeType: this.mimeType,
        videoBitsPerSecond: videoBitsPerSecond
      };
      
      console.log("[RECORDING_MANAGER] Creating MediaRecorder with options:", recorderOptions);
      this.mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);
      
      // Check what the MediaRecorder actually used
      console.log("[RECORDING_MANAGER] MediaRecorder created with:", {
        mimeType: this.mediaRecorder.mimeType,
        videoBitsPerSecond: this.mediaRecorder.videoBitsPerSecond || "browser default",
        audioBitsPerSecond: this.mediaRecorder.audioBitsPerSecond || "browser default"
      });
      
      // Create a new segment
      this.startNewSegment();
      
      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`[RECORDING_MANAGER] Data chunk received: ${(event.data.size / 1024).toFixed(2)} KB`);
          
          // Add to main chunks array
          this.recordedChunks.push(event.data);
          
          // Also add to current segment if we have one
          this.addChunkToCurrentSegment(event.data);
          
          // Notify via callback
          if (this.onDataAvailableCallback) {
            this.onDataAvailableCallback(event.data);
          }
          
          // Update state
          this.updateState();
        }
      };
      
      // Handle recording stop
      this.mediaRecorder.onstop = this.onstop.bind(this);
      
      // Handle errors
      this.mediaRecorder.onerror = this.onerror.bind(this);
      
      // Set recording flags
      this.isRecording = true;
      this.isPaused = false;
      
      // Set start time for duration tracking
      if (!this.isRestart) {
        this.startTime = Date.now();
        this.totalPausedDuration = 0;
      } else {
        // If restarting, adjust the start time to account for the previous duration
        const now = Date.now();
        this.startTime = now - (this.previousDuration * 1000);
        console.log(`[RECORDING_MANAGER] Restarting timer with previous duration: ${this.previousDuration}s`);
      }
      
      // Start measuring duration
      this.startTimeMeasurement();
      
      // Start the MediaRecorder with regular time slices
      this.mediaRecorder.start(500); // 500ms time slices
      console.log(`[RECORDING_MANAGER] MediaRecorder started with 500ms time slices`);
      
      // Update initial state
      this.updateState();
    } catch (error) {
      console.error(`[RECORDING_MANAGER] Failed to start recording: ${error}`);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }
  
  /**
   * Start a new recording segment
   */
  private startNewSegment(): void {
    const segmentId = Date.now().toString();
    const newSegment: RecordingSegment = {
      id: segmentId,
      startTime: Date.now(),
      isFlipped: this.isFlipped,
      chunks: []
    };
    
    this.recordingSegments.push(newSegment);
    this.currentSegmentId = segmentId;
    
    console.log(`[RECORDING_MANAGER] Started new segment ${segmentId} with flip=${this.isFlipped}`);
    console.log(`[RECORDING_MANAGER] Total segments: ${this.recordingSegments.length}`);
  }
  
  /**
   * Add a chunk to the current segment
   */
  private addChunkToCurrentSegment(chunk: Blob): void {
    if (!this.currentSegmentId) {
      console.log(`[RECORDING_MANAGER] Warning: No current segment to add chunk to`);
      return;
    }
    
    // Find current segment and add chunk
    const segmentIndex = this.recordingSegments.findIndex(s => s.id === this.currentSegmentId);
    if (segmentIndex !== -1) {
      this.recordingSegments[segmentIndex].chunks.push(chunk);
      const chunkCount = this.recordingSegments[segmentIndex].chunks.length;
      console.log(`[RECORDING_MANAGER] Added chunk to segment ${this.currentSegmentId}, now has ${chunkCount} chunks`);
    } else {
      console.error(`[RECORDING_MANAGER] Could not find segment with id ${this.currentSegmentId}`);
    }
  }
  
  /**
   * Finalize the current segment
   */
  private finalizeCurrentSegment(): void {
    if (!this.currentSegmentId) {
      console.log(`[RECORDING_MANAGER] No current segment to finalize`);
      return;
    }
    
    // Log details about the finalized segment
    const segmentIndex = this.recordingSegments.findIndex(s => s.id === this.currentSegmentId);
    if (segmentIndex !== -1) {
      const segment = this.recordingSegments[segmentIndex];
      console.log(`[RECORDING_MANAGER] Finalized segment ${segment.id}: chunks=${segment.chunks.length}, flipped=${segment.isFlipped}`);
    }
    
    // Clear current segment
    this.currentSegmentId = null;
  }
  
  /**
   * Handle data available event
   */
  private ondataavailable(event: BlobEvent): void {
    if (event.data && event.data.size > 0) {
      this.recordedChunks.push(event.data);
      
      if (this.onDataAvailableCallback) {
        this.onDataAvailableCallback(event.data);
      }
      
      this.updateState();
    }
  }
  
  /**
   * Handle recording stop event
   */
  private onstop(event: Event): void {
    console.log(`[RECORDING_MANAGER] MediaRecorder onstop event triggered`);
    
    // Update state when recording is stopped
    this.isRecording = false;
    this.isPaused = false;
    
    // Stop duration measurement
    this.stopTimeMeasurement();
    
    // Update state with final values
    this.updateState();
  }
  
  /**
   * Handle errors from MediaRecorder
   */
  private onerror(event: Event): void {
    console.error(`[RECORDING_MANAGER] MediaRecorder error event:`, event);
    
    // Forward error to callback if provided
    if (this.onErrorCallback) {
      if (event instanceof Error) {
        this.onErrorCallback(event);
      } else {
        this.onErrorCallback(new Error('Unknown MediaRecorder error'));
      }
    }
  }
  
  /**
   * Pause the current recording
   */
  public pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      console.log(`[RECORDING_MANAGER] Pausing recording`);
      
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pausedTime = Date.now();
      
      // Stop time measurement during pause
      this.stopTimeMeasurement();
      
      // Update state to reflect pause
      this.updateState();
    }
  }
  
  /**
   * Resume a paused recording
   */
  public resumeRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      console.log(`[RECORDING_MANAGER] Resuming recording`);
      
      this.mediaRecorder.resume();
      this.isPaused = false;
      
      // Calculate time that was paused
      this.totalPausedDuration += Date.now() - this.pausedTime;
      
      // Restart time measurement
      this.startTimeMeasurement();
      
      // Update state to reflect resume
      this.updateState();
    }
  }
  
  /**
   * Stop the current recording and return the recorded data
   */
  public async stopRecording(): Promise<RecordedMedia> {
    if (!this.mediaRecorder || !this.isRecording) {
      throw new Error('Recording not in progress');
    }
    
    try {
      // Finalize the current segment
      this.finalizeCurrentSegment();
      
      // Log segments information
      console.log(`[RECORDING_MANAGER] Stopping recording with ${this.recordingSegments.length} segments:`);
      this.recordingSegments.forEach((segment, index) => {
        console.log(`[RECORDING_MANAGER] Segment #${index + 1}: id=${segment.id}, chunks=${segment.chunks.length}, flipped=${segment.isFlipped}`);
      });
      
      // Stop the MediaRecorder
      this.mediaRecorder.stop();
      
      // Wait for the final dataavailable event
      await new Promise<void>(resolve => {
        const originalOnStop = this.mediaRecorder!.onstop;
        this.mediaRecorder!.onstop = (event: Event) => {
          if (originalOnStop && this.mediaRecorder) {
            originalOnStop.call(this.mediaRecorder, event);
          }
          resolve();
        };
      });
      
      // Make sure we have recorded chunks
      if (this.recordedChunks.length === 0) {
        throw new Error('No data recorded');
      }
      
      // Log the individual chunks
      console.log(`[RECORDING_MANAGER] Total chunks count: ${this.recordedChunks.length}`);
      const totalSizeMB = (this.getTotalSize(this.recordedChunks) / (1024 * 1024)).toFixed(2);
      console.log(`[RECORDING_MANAGER] Combining ${this.recordedChunks.length} chunks with total size: ${totalSizeMB} MB`);
      
      // Create a blob based on recording segments
      let finalBlob: Blob;
      
      if (this.recordingSegments.length > 1) {
        console.log(`[RECORDING_MANAGER] Multiple segments detected (${this.recordingSegments.length}), combining properly`);
        
        // For WebM format, we need to be careful about how we combine segments
        // Each segment has its own header and metadata, so just concatenating the chunks won't work correctly
        
        // The simplest safe approach is to use the most recent segment's data
        // This ensures we have proper WebM formatting and headers
        const lastSegment = this.recordingSegments[this.recordingSegments.length - 1];
        
        // Log what we're doing
        console.log(`[RECORDING_MANAGER] Using the most recent segment (id=${lastSegment.id}) with ${lastSegment.chunks.length} chunks for reliable WebM output`);
        
        // Create a blob from the last segment's chunks
        finalBlob = new Blob(lastSegment.chunks, { type: this.mimeType });
        const blobSizeMB = (finalBlob.size / (1024 * 1024)).toFixed(2);
        console.log(`[RECORDING_MANAGER] Created final blob from last segment: ${blobSizeMB} MB`);
      } else {
        // Just use all recorded chunks for a single segment
        finalBlob = new Blob(this.recordedChunks, { type: this.mimeType });
        const singleBlobSizeMB = (finalBlob.size / (1024 * 1024)).toFixed(2);
        console.log(`[RECORDING_MANAGER] Created final blob: ${singleBlobSizeMB} MB`);
      }
      
      // Calculate the duration of the recording
      const duration = this.currentDuration;
      
      // Create a URL for the blob
      const url = URL.createObjectURL(finalBlob);
      
      // Create a unique ID for the recording
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Clear recording data
      this.isRecording = false;
      this.isPaused = false;
      this.updateState();
      
      // Stop measuring the duration
      this.stopTimeMeasurement();
      
      // Log recording details
      const finalSizeMB = (finalBlob.size / (1024 * 1024)).toFixed(2);
      console.log(`[RECORDING_MANAGER] Recording stopped. Total size: ${finalSizeMB} MB, Duration: ${Math.round(duration)}s`);
      
      return {
        id,
        blob: finalBlob,
        url,
        type: this.mimeType,
        name: `Recording-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        size: finalBlob.size,
        duration: Math.round(duration),
        timestamp: Date.now(),
        chunks: this.recordedChunks
      };
    } catch (error) {
      console.error(`[RECORDING_MANAGER] Error stopping recording: ${error}`);
      throw error;
    }
  }
  
  /**
   * Update the current recording state and notify via callback
   */
  private updateState(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isRecording: this.isRecording,
        isPaused: this.isPaused,
        duration: this.currentDuration,
        recordedChunks: [...this.recordedChunks] // Send a copy to avoid external modifications
      });
    }
  }
  
  /**
   * Start measuring recording duration
   */
  private startTimeMeasurement(): void {
    if (this.isRestart) {
      console.log(`[RECORDING_MANAGER] Restarting timer with previous duration: ${this.previousDuration}s`);
      this.currentDuration = this.previousDuration;
      this.isRestart = false;
    } else if (!this.startTime) {
      this.startTime = Date.now();
      this.currentDuration = 0;
    }
    
    this.recordingTimerId = setInterval(() => {
      if (!this.isPaused) {
        const now = Date.now();
        const elapsed = (now - this.startTime - this.totalPausedDuration) / 1000;
        this.currentDuration = this.isRestart ? this.previousDuration + elapsed : elapsed;
        
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback({
            isRecording: this.isRecording,
            isPaused: this.isPaused,
            duration: Math.round(this.currentDuration),
            recordedChunks: this.recordedChunks
          });
        }
      }
    }, 500);
  }
  
  /**
   * Stop measuring recording duration
   */
  private stopTimeMeasurement(): void {
    if (this.recordingTimerId) {
      clearInterval(this.recordingTimerId);
      this.recordingTimerId = null;
    }
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopRecording();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
  
  private getTotalSize(chunks: Blob[]): number {
    return chunks.reduce((total, chunk) => total + chunk.size, 0);
  }
}
