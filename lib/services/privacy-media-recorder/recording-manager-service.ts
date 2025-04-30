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
      
      this.mediaStream = mediaStream;
      this.recordedChunks = [];
      
      // Set mime type from options if provided
      if (options?.mimeType && MediaRecorder.isTypeSupported(options.mimeType)) {
        this.mimeType = options.mimeType;
      }
      
      // Create media recorder with settings
      this.mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: this.mimeType,
        videoBitsPerSecond: options?.resolution?.width ? options.resolution.width * options.resolution.height * 0.2 : undefined
      });
      
      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
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
        if (this.onErrorCallback && event instanceof Error) {
          this.onErrorCallback(event);
        } else if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Recording error occurred'));
        }
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Collect data in 1-second chunks
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
  public stopRecording(): RecordedMedia | null {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
      this.stopTimeMeasurement();
      
      // Create a single blob from all chunks
      if (this.recordedChunks.length) {
        const blob = new Blob(this.recordedChunks, { type: this.mimeType });
        const url = URL.createObjectURL(blob);
        const timestamp = Date.now();
        
        // Return the recorded media
        return {
          id: uuidv4(),
          blob,
          url,
          type: this.mimeType,
          name: `Recording_${new Date(timestamp).toISOString().replace(/[:.]/g, '-')}`,
          size: blob.size,
          duration: this.currentDuration,
          timestamp
        };
      }
    }
    
    return null;
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
}
