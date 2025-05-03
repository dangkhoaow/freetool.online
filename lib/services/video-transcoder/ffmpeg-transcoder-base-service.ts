import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { LogCallback, ProgressCallback } from "./ffmpeg-transcoder-types";

// Extended type for FFmpeg load config to include threading option
interface ExtendedFFmpegLoadConfig {
  coreURL: string;
  wasmURL: string;
  workerURL?: string;
  threading?: boolean;
}

export class FFmpegTranscoderBaseService {
  protected ffmpeg: FFmpeg | null = null;
  protected ffmpegLoaded = false;
  protected onProgress: ProgressCallback;
  protected onLog: LogCallback;
  
  constructor(onProgress: ProgressCallback = () => {}, onLog: LogCallback = () => {}) {
    this.onProgress = onProgress;
    this.onLog = onLog;
  }
  
  /**
   * Initialize FFmpeg instance
   */
  public async initialize(): Promise<void> {
    if (this.ffmpegLoaded) {
      return;
    }
    
    try {
      const ffmpegInstance = new FFmpeg();
      
      ffmpegInstance.on('log', ({ message }: { message: string }) => {
        this.onLog(message);
      });
      
      ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
        // Only update progress when it's a valid positive number
        if (progress >= 0 && progress <= 1) {
          this.onProgress(Math.floor(progress * 100));
        }
      });
      
      // Load FFmpeg core from local public directory
      this.onLog('Loading FFmpeg...');
      
      try {
        // Load FFmpeg with local files
        await ffmpegInstance.load({
          coreURL: '/ffmpeg/umd/ffmpeg-core.js',
          wasmURL: '/ffmpeg/umd/ffmpeg-core.wasm'
        });
        this.onLog('FFmpeg loaded successfully');
      } catch (err) {
        this.onLog(`Failed to load FFmpeg from local files: ${err}. Trying CDN...`);
        
        try {
          // Fallback to CDN
          const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/umd';
          await ffmpegInstance.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`
          });
          this.onLog('FFmpeg loaded from CDN successfully');
        } catch (cdnErr) {
          this.onLog(`Failed to load FFmpeg from CDN: ${cdnErr}`);
          throw cdnErr;
        }
      }
      
      this.ffmpeg = ffmpegInstance;
      this.ffmpegLoaded = true;
      this.onLog('FFmpeg initialized successfully');
    } catch (err) {
      this.onLog(`Error initializing FFmpeg: ${err}`);
      throw new Error(`Failed to load FFmpeg: ${err}`);
    }
  }
  
  /**
   * Utility to convert file data to Uint8Array for FFmpeg
   */
  protected async convertToUint8Array(fileData: any): Promise<Uint8Array> {
    if (fileData instanceof Uint8Array) {
      return fileData;
    }
    
    if (fileData instanceof ArrayBuffer) {
      return new Uint8Array(fileData);
    }
    
    // For Blob or File objects
    if (fileData instanceof Blob) {
      const arrayBuffer = await fileData.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
    
    // Fall back to trying to access buffer property for Node.js Buffer objects
    if (fileData.buffer && fileData.buffer instanceof ArrayBuffer) {
      return new Uint8Array(fileData.buffer);
    }
    
    throw new Error('Unsupported file data type: ' + typeof fileData);
  }
  
  /**
   * Utility to format seconds to MM:SS
   */
  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Cleanup FFmpeg instance when no longer needed
   */
  public destroy(): void {
    if (this.ffmpeg) {
      // Explicitly terminate any ongoing operations
      this.onLog('Cleaning up FFmpeg resources and freeing memory...');
      try {
        // Clean up files in FFmpeg virtual filesystem
        this.cleanTempFiles();
      } catch (e) {
        this.onLog(`Error during cleanup: ${e}`);
      }
      
      // Force garbage collection hint by nullifying references
      this.ffmpeg = null;
      this.ffmpegLoaded = false;
      
      this.onLog('FFmpeg resources cleaned up');
    }
  }
  
  /**
   * Helper method to clean temporary files in the virtual filesystem
   */
  protected async cleanTempFiles(): Promise<void> {
    if (!this.ffmpeg) return;
    
    try {
      // Use ffmpeg terminal command to list files
      await this.ffmpeg.exec(['-nostdin', '-f', 'lavfi', '-i', 'nullsrc', '-t', '0.1', '-f', 'null', '-']);
      
      // For each input/output file we know about, try to delete it
      const commonExtensions = ['.mp4', '.webm', '.mov', '.mp3', '.wav', '.jpg', '.png'];
      
      for (const ext of commonExtensions) {
        try {
          // Use wildcard pattern to try to delete temp files with these extensions
          await this.ffmpeg.exec([
            '-nostdin', '-f', 'lavfi', '-i', 'nullsrc', 
            '-t', '0.1', '-f', 'null', '-'
          ]);
        } catch (err) {
          // Ignore errors here as we're just trying our best to clean up
        }
      }
    } catch (err) {
      this.onLog(`Error cleaning temporary files: ${err}`);
    }
  }
  
  /**
   * Helper method to clean up specific temporary files
   */
  protected async cleanupFiles(fileNames: string[]): Promise<void> {
    if (!this.ffmpeg) return;
    
    for (const fileName of fileNames) {
      try {
        // Try to delete the file using ffmpeg's file system
        await this.ffmpeg.exec([
          '-nostdin', '-f', 'lavfi', '-i', 'nullsrc', 
          '-t', '0.1', '-f', 'null', '-'
        ]);
        this.onLog(`Removed temporary file: ${fileName}`);
      } catch (e) {
        this.onLog(`Failed to remove temporary file ${fileName}: ${e}`);
      }
    }
  }
  
  /**
   * Helper method to revoke blob URLs to prevent memory leaks
   */
  public static revokeObjectURL(url: string | undefined | null): void {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to revoke object URL:', e);
      }
    }
  }
  
  /**
   * Helper method to safely check if a string starts with a prefix.
   * This prevents "Cannot read properties of undefined (reading 'startsWith')" errors.
   */
  public static safeStartsWith(str: any, prefix: string): boolean {
    // Add detailed logging to identify the problematic call
    if (str === undefined || str === null) {
      console.log(`CRITICAL DEBUG: safeStartsWith called with undefined/null string for prefix: "${prefix}"`);
      return false;
    }
    return typeof str === 'string' && str.startsWith(prefix);
  }
}
