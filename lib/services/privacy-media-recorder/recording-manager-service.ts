import { RecordedMedia, RecordingOptions } from './media-recorder-service';
import { v4 as uuidv4 } from 'uuid';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedChunks: Blob[];
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
  
  // Callbacks
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
    onDataAvailable?: (blob: Blob) => void
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;
    this.onDataAvailableCallback = onDataAvailable || null;
  }
  
  /**
   * Start recording the provided media stream
   */
  public startRecording(mediaStream: MediaStream, options?: RecordingOptions): void {
    try {
      if (this.isRecording) {
        this.stopRecording();
      }
      
      console.log("Starting recording with options:", options);
      
      this.mediaStream = mediaStream;
      this.recordedChunks = [];
      
      // Set mime type from options if provided
      if (options?.mimeType && MediaRecorder.isTypeSupported(options.mimeType)) {
        this.mimeType = options.mimeType;
        console.log(`Using mime type: ${this.mimeType}`);
      } else {
        console.log(`Using default mime type: ${this.mimeType}`);
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
        
        console.log(`Calculated video bitrate: ${videoBitsPerSecond} bps for ${options.resolution.width}x${options.resolution.height} at ${fps}fps`);
      }
      
      // Create media recorder with enhanced settings
      const recorderOptions = {
        mimeType: this.mimeType,
        videoBitsPerSecond: videoBitsPerSecond
      };
      
      console.log("Creating MediaRecorder with options:", recorderOptions);
      this.mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);
      
      // Check what the MediaRecorder actually used
      console.log("MediaRecorder created with:", {
        mimeType: this.mediaRecorder.mimeType,
        videoBitsPerSecond: this.mediaRecorder.videoBitsPerSecond || "browser default",
        audioBitsPerSecond: this.mediaRecorder.audioBitsPerSecond || "browser default"
      });
      
      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Data chunk received: ${(event.data.size / 1024).toFixed(2)} KB`);
          this.recordedChunks.push(event.data);
          
          if (this.onDataAvailableCallback) {
            this.onDataAvailableCallback(event.data);
          }
        }
      };
      
      // Handle recording stop event
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.isPaused = false;
        this.stopTimeMeasurement();
        
        const totalSize = this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
        console.log(`Recording stopped. Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB, Duration: ${this.currentDuration}s`);
        
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback({
            isRecording: false,
            isPaused: false,
            duration: this.currentDuration,
            recordedChunks: this.recordedChunks
          });
        }
      };
      
      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        if (this.onErrorCallback && event instanceof Error) {
          this.onErrorCallback(event);
        } else if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Recording error occurred'));
        }
      };
      
      // Start recording with smaller chunks for better quality
      // Use 500ms chunks for better quality and more frequent updates
      this.mediaRecorder.start(500);
      console.log("MediaRecorder started with 500ms time slices");
      
      this.isRecording = true;
      this.isPaused = false;
      this.startTimeMeasurement();
      
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback({
          isRecording: true,
          isPaused: false,
          duration: 0,
          recordedChunks: []
        });
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error instanceof Error && this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }
  
  /**
   * Pause the current recording
   */
  public pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pausedTime = Date.now();
      this.stopTimeMeasurement();
      
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback({
          isRecording: true,
          isPaused: true,
          duration: this.currentDuration,
          recordedChunks: this.recordedChunks
        });
      }
    }
  }
  
  /**
   * Resume a paused recording
   */
  public resumeRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.totalPausedDuration += Date.now() - this.pausedTime;
      this.startTimeMeasurement();
      
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback({
          isRecording: true,
          isPaused: false,
          duration: this.currentDuration,
          recordedChunks: this.recordedChunks
        });
      }
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
      console.log(`Combining ${this.recordedChunks.length} chunks with total size: ${this.getTotalSize(this.recordedChunks) / (1024 * 1024)} MB`);
      
      // Create a copy of all chunks to preserve the raw data
      const savedChunks = [...this.recordedChunks];
      
      // Create a blob from the recorded chunks
      const blob = new Blob(this.recordedChunks, { type: this.mimeType });
      console.log(`Created final blob with size: ${blob.size / (1024 * 1024)} MB`);
      
      // Calculate the duration of the recording
      const duration = (Date.now() - this.startTime) / 1000;
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a unique ID for the recording
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a name for the recording
      const name = `Recording_${new Date().toISOString().replace(/[:\.]/g, '-')}`;
      
      // Log the total size
      console.log(`Recording stopped. Total size: ${blob.size / (1024 * 1024)} MB, Duration: ${Math.round(duration)}s`);
      
      // Return the recorded media with chunks preserved
      const recordedMedia: RecordedMedia = {
        id,
        blob,
        url,
        type: this.mimeType,
        name,
        size: blob.size,
        duration,
        timestamp: Date.now(),
        chunks: savedChunks // Save the raw chunks
      };
      
      // Reset recording state
      this.isRecording = false;
      this.isPaused = false;
      this.recordedChunks = [];
      
      return recordedMedia;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }
  
  /**
   * Start measuring recording duration
   */
  private startTimeMeasurement(): void {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    
    this.recordingTimerId = setInterval(() => {
      const currentTime = Date.now();
      this.currentDuration = Math.floor((currentTime - this.startTime - this.totalPausedDuration) / 1000);
      
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback({
          isRecording: this.isRecording,
          isPaused: this.isPaused,
          duration: this.currentDuration,
          recordedChunks: this.recordedChunks
        });
      }
    }, 1000);
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
