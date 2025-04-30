export interface MediaDevice {
  deviceId: string;
  kind: string;
  label: string;
  groupId?: string;
}

export interface RecordingOptions {
  video: boolean;
  audio: boolean;
  screen: boolean;
  resolution?: {
    width: number;
    height: number;
  };
  frameRate?: number;
  mimeType?: string;
}

export interface RecordedMedia {
  id: string;
  blob: Blob;
  url: string;
  type: string;
  name: string;
  size: number;
  duration: number;
  timestamp: number;
}

export class MediaRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  
  // Callbacks
  private onDataAvailableCallback: ((blob: Blob) => void) | null = null;
  private onRecordingStateChangeCallback: ((state: 'recording' | 'paused' | 'stopped') => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  
  /**
   * Get a list of all available media input devices
   */
  public async getAvailableDevices(): Promise<{ 
    videoinput: MediaDevice[], 
    audioinput: MediaDevice[] 
  }> {
    try {
      // Request permission first to get accurate device labels
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .catch(() => {
          // Silent catch - we just want to trigger the permission dialog
        });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        videoinput: devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            kind: device.kind,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
            groupId: device.groupId
          })),
        audioinput: devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            kind: device.kind,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
            groupId: device.groupId
          }))
      };
    } catch (error) {
      throw new Error(`Failed to enumerate devices: ${error}`);
    }
  }
  
  /**
   * Test a specific media device by starting a preview stream
   */
  public async testDevice(deviceId: string, kind: 'videoinput' | 'audioinput'): Promise<MediaStream> {
    try {
      const constraints = kind === 'videoinput'
        ? { video: { deviceId: { exact: deviceId } }, audio: false }
        : { audio: { deviceId: { exact: deviceId } }, video: false };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      throw new Error(`Failed to test device: ${error}`);
    }
  }
  
  /**
   * Start capturing with the specified options
   */
  public async startCapture(
    options: RecordingOptions,
    selectedVideoDeviceId?: string,
    selectedAudioDeviceId?: string
  ): Promise<MediaStream> {
    try {
      this.stopCapture(); // Stop any existing capture
      
      // Configure constraints based on options
      const constraints: MediaStreamConstraints = {};
      
      if (options.screen) {
        // Request display media for screen capture
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            ...options.resolution && {
              width: { ideal: options.resolution.width },
              height: { ideal: options.resolution.height }
            },
            ...options.frameRate && { frameRate: { ideal: options.frameRate } }
          },
          audio: true // Allow system audio capture if supported
        });
        
        // Combine with microphone if specified
        if (options.audio && selectedAudioDeviceId) {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: selectedAudioDeviceId } }
          });
          
          // Combine the tracks from both streams
          const combinedStream = new MediaStream();
          displayStream.getTracks().forEach(track => combinedStream.addTrack(track));
          micStream.getTracks().forEach(track => combinedStream.addTrack(track));
          
          this.mediaStream = combinedStream;
        } else {
          this.mediaStream = displayStream;
        }
      } else {
        // Configure webcam/microphone constraints
        if (options.video) {
          constraints.video = {
            deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined,
            ...options.resolution && {
              width: { ideal: options.resolution.width },
              height: { ideal: options.resolution.height }
            },
            ...options.frameRate && { frameRate: { ideal: options.frameRate } }
          };
        }
        
        if (options.audio) {
          constraints.audio = selectedAudioDeviceId 
            ? { deviceId: { exact: selectedAudioDeviceId } }
            : true;
        }
        
        this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      return this.mediaStream;
    } catch (error) {
      throw new Error(`Failed to start capture: ${error}`);
    }
  }
  
  /**
   * Stop the current capture
   */
  public stopCapture(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}
