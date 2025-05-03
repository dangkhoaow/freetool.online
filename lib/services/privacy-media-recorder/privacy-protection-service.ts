/**
 * Privacy protection service for media recorder
 * Handles face blurring and metadata stripping
 */

export interface PrivacyOptions {
  faceBlur: boolean;
  blurIntensity: number; // 1-10
  stripMetadata: boolean;
}

export class PrivacyProtectionService {
  private faceDetector: any | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  /**
   * Initialize the privacy protection service
   */
  public async initialize(): Promise<boolean> {
    try {
      // Check if face detection is supported
      if ('FaceDetector' in window) {
        this.faceDetector = new (window as any).FaceDetector({
          maxDetectedFaces: 10,
          fastMode: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Face detection not supported:', error);
      return false;
    }
  }
  
  /**
   * Apply face blur to a video frame
   * @param videoEl Source video element
   * @param intensity Blur intensity (1-10)
   * @returns Canvas with blurred faces
   */
  public async applyFaceBlur(
    videoEl: HTMLVideoElement, 
    intensity: number = 5
  ): Promise<HTMLCanvasElement> {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    
    if (!this.ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    const canvas = this.canvas;
    const ctx = this.ctx;
    
    // Set canvas dimensions to match video
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    // Draw the current video frame to the canvas
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    
    // Detect faces if supported
    if (this.faceDetector) {
      try {
        const faces = await this.faceDetector.detect(videoEl);
        
        // Apply blur to each detected face
        for (const face of faces) {
          const { boundingBox } = face;
          const { x, y, width, height } = boundingBox;
          
          // Calculate blur radius based on face size and intensity
          const blurRadius = Math.min(width, height) * (intensity / 20);
          
          // Save current state
          ctx.save();
          
          // Create a circular clipping path around the face
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height / 2, Math.max(width, height) / 1.5, 0, Math.PI * 2);
          ctx.clip();
          
          // Apply blur filter
          ctx.filter = `blur(${blurRadius}px)`;
          
          // Redraw the area with blur
          ctx.drawImage(
            videoEl, 
            x - blurRadius, y - blurRadius, 
            width + blurRadius * 2, height + blurRadius * 2,
            x - blurRadius, y - blurRadius, 
            width + blurRadius * 2, height + blurRadius * 2
          );
          
          // Restore context
          ctx.restore();
        }
      } catch (error) {
        console.error('Error detecting faces:', error);
      }
    }
    
    return canvas;
  }
  
  /**
   * Process a media stream by applying privacy protections
   * @param mediaStream Source media stream
   * @param options Privacy options
   * @returns Processed media stream
   */
  public async processMediaStream(
    mediaStream: MediaStream,
    options: PrivacyOptions
  ): Promise<MediaStream> {
    if (!options.faceBlur) {
      return mediaStream; // Return original stream if no processing needed
    }
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    
    // Get the video track settings
    const videoTrack = mediaStream.getVideoTracks()[0];
    if (!videoTrack) {
      return mediaStream;
    }
    
    const { width, height } = videoTrack.getSettings();
    if (!width || !height) {
      return mediaStream;
    }
    
    // Set canvas size
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Create a video element to process the stream
    const videoEl = document.createElement('video');
    videoEl.srcObject = mediaStream;
    videoEl.autoplay = true;
    videoEl.muted = true;
    
    // Create an output stream from the canvas
    const outputStream = this.canvas!.captureStream();
    
    // Add audio tracks from original stream
    const audioTracks = mediaStream.getAudioTracks();
    audioTracks.forEach(track => {
      outputStream.addTrack(track);
    });
    
    // Process frames on animation loop
    const processFrame = async () => {
      if (this.ctx && videoEl.readyState >= 2) {
        await this.applyFaceBlur(videoEl, options.blurIntensity);
      }
      requestAnimationFrame(processFrame);
    };
    
    processFrame();
    
    return outputStream;
  }
  
  /**
   * Helper method to safely check if a string starts with a prefix.
   * This prevents "Cannot read properties of undefined (reading 'startsWith')" errors.
   */
  private safeStartsWith(str: any, prefix: string): boolean {
    return typeof str === 'string' && str.startsWith(prefix);
  }

  /**
   * Strip metadata from a media file
   * @param blob Media blob to process
   * @returns Clean blob without metadata
   */
  public async stripMetadata(blob: Blob | null | undefined): Promise<Blob> {
    // Make sure blob and blob.type are valid before using startsWith
    if (!blob) {
      console.warn('No blob provided to stripMetadata');
      // Return an empty blob as fallback
      return new Blob([], { type: 'application/octet-stream' });
    }
    
    // Use safe type checking for blob.type
    const blobType = blob.type || '';
    console.log(`Stripping metadata from blob with type: ${blobType}`);
    
    // For video/audio: create a new MediaSource and transcode without metadata
    if (this.safeStartsWith(blobType, 'video/') || this.safeStartsWith(blobType, 'audio/')) {
      return this.stripVideoMetadata(blob);
    }
    
    // If it's an image, use canvas to strip EXIF data
    if (this.safeStartsWith(blobType, 'image/')) {
      return this.stripImageMetadata(blob);
    }
    
    // If we don't know how to handle this type, return original
    return blob;
  }
  
  /**
   * Strip metadata from a video file
   */
  private async stripVideoMetadata(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      // Create video element
      const videoEl = document.createElement('video');
      videoEl.autoplay = false;
      videoEl.muted = true;
      videoEl.src = URL.createObjectURL(blob);
      
      videoEl.onloadedmetadata = () => {
        // Create canvas matching video dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        
        // Set up MediaRecorder to capture canvas stream
        const stream = canvas.captureStream();
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: blob.type
        });
        
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          // Create new blob without metadata
          const cleanBlob = new Blob(chunks, { type: blob.type });
          resolve(cleanBlob);
          URL.revokeObjectURL(videoEl.src);
        };
        
        // Draw video frames to canvas
        mediaRecorder.start();
        videoEl.currentTime = 0;
        
        videoEl.onplaying = () => {
          const processFrame = () => {
            if (videoEl.currentTime < videoEl.duration) {
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              videoEl.currentTime += 1/30; // Process at 30fps
              setTimeout(processFrame, 0);
            } else {
              mediaRecorder.stop();
            }
          };
          processFrame();
        };
        
        videoEl.play();
      };
    });
  }
  
  /**
   * Strip metadata from an image file
   */
  private async stripImageMetadata(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas matching image dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas (strips EXIF data)
        ctx.drawImage(img, 0, 0);
        
        // Convert back to blob
        canvas.toBlob((cleanBlob) => {
          if (cleanBlob) {
            resolve(cleanBlob);
          } else {
            resolve(blob); // Fallback to original if conversion fails
          }
          URL.revokeObjectURL(img.src);
        }, blob.type);
      };
      
      img.src = URL.createObjectURL(blob);
    });
  }
}
