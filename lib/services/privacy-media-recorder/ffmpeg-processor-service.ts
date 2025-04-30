import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { RecordedMedia } from "./media-recorder-service";

export interface ProcessingOptions {
  format: 'mp4' | 'webm' | 'gif';
  trimStart?: number;
  trimEnd?: number;
  resolution?: {
    width: number;
    height: number;
  };
}

export type ProgressCallback = (progress: number) => void;
export type LogCallback = (message: string) => void;

export class FFmpegProcessorService {
  private ffmpeg: FFmpeg | null = null;
  private ffmpegLoaded = false;
  private onProgress: ProgressCallback;
  private onLog: LogCallback;
  
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
      
      // Load ffmpeg core from CDN (as per memory recommendation)
      await ffmpegInstance.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm'
      });
      
      this.ffmpeg = ffmpegInstance;
      this.ffmpegLoaded = true;
      this.onLog('FFmpeg loaded successfully');
    } catch (err) {
      this.onLog(`Error initializing FFmpeg: ${err}`);
      throw new Error(`Failed to load FFmpeg: ${err}`);
    }
  }
  
  /**
   * Process a recorded media file
   */
  public async processRecording(
    recording: RecordedMedia,
    options: ProcessingOptions
  ): Promise<RecordedMedia> {
    try {
      if (!this.ffmpeg || !this.ffmpegLoaded) {
        await this.initialize();
      }
      
      if (!this.ffmpeg) {
        throw new Error('FFmpeg not initialized');
      }
      
      const ffmpeg = this.ffmpeg;
      const inputFileName = 'input' + this.getFileExtension(recording.type);
      const outputFileName = 'output' + this.getOutputExtension(options.format);
      
      // Write input file to FFmpeg virtual file system
      ffmpeg.writeFile(inputFileName, await fetchFile(recording.blob));
      
      // Build FFmpeg command
      const command: string[] = [
        '-i', inputFileName,
      ];
      
      // Add trim options if specified
      if (options.trimStart !== undefined || options.trimEnd !== undefined) {
        const start = options.trimStart !== undefined ? options.trimStart : 0;
        
        if (options.trimStart !== undefined) {
          command.push('-ss', `${start}`);
        }
        
        if (options.trimEnd !== undefined) {
          const duration = options.trimEnd - (options.trimStart || 0);
          command.push('-t', `${duration}`);
        }
      }
      
      // Add resolution options if specified
      if (options.resolution) {
        command.push('-vf', `scale=${options.resolution.width}:${options.resolution.height}`);
      }
      
      // Add format-specific options
      switch (options.format) {
        case 'mp4':
          command.push(
            '-c:v', 'libx264', // H.264 codec
            '-preset', 'fast',
            '-crf', '23', // Constant Rate Factor (quality)
            '-c:a', 'aac', // AAC audio codec
            '-b:a', '128k', // Audio bitrate
          );
          break;
          
        case 'webm':
          command.push(
            '-c:v', 'libvpx-vp9', // VP9 codec
            '-crf', '30', // Constant Rate Factor (quality)
            '-b:v', '0', // Use CRF for bitrate control
            '-c:a', 'libopus', // Opus audio codec
            '-b:a', '128k', // Audio bitrate
          );
          break;
          
        case 'gif':
          command.push(
            '-vf', 'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
            '-loop', '0'
          );
          break;
      }
      
      // Add output file
      command.push('-y', outputFileName);
      
      // Run FFmpeg command
      await ffmpeg.exec(command);
      
      // Read output file
      const outputData = await ffmpeg.readFile(outputFileName);
      const outputBlob = new Blob([outputData], { type: this.getMimeType(options.format) });
      const outputUrl = URL.createObjectURL(outputBlob);
      
      // Return processed recording
      return {
        ...recording,
        id: recording.id + '_processed',
        blob: outputBlob,
        url: outputUrl,
        type: this.getMimeType(options.format),
        size: outputBlob.size,
      };
    } catch (error) {
      this.onLog(`Error processing recording: ${error}`);
      throw error;
    }
  }
  
  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    if (mimeType.includes('mp4')) return '.mp4';
    if (mimeType.includes('webm')) return '.webm';
    if (mimeType.includes('ogg')) return '.ogg';
    if (mimeType.includes('gif')) return '.gif';
    return '.mp4'; // Default
  }
  
  /**
   * Get output extension based on format
   */
  private getOutputExtension(format: string): string {
    switch (format) {
      case 'mp4': return '.mp4';
      case 'webm': return '.webm';
      case 'gif': return '.gif';
      default: return '.mp4';
    }
  }
  
  /**
   * Get MIME type based on format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      case 'gif': return 'image/gif';
      default: return 'video/mp4';
    }
  }
  
  /**
   * Extract a thumbnail from a recording
   */
  public async extractThumbnail(recording: RecordedMedia): Promise<string> {
    try {
      if (!this.ffmpeg || !this.ffmpegLoaded) {
        await this.initialize();
      }
      
      if (!this.ffmpeg) {
        throw new Error('FFmpeg not initialized');
      }
      
      const ffmpeg = this.ffmpeg;
      const inputFileName = 'input' + this.getFileExtension(recording.type);
      const outputFileName = 'thumbnail.jpg';
      
      // Write input file to FFmpeg virtual file system
      ffmpeg.writeFile(inputFileName, await fetchFile(recording.blob));
      
      // Extract frame from the middle of the video
      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', '00:00:01', // Take frame at 1 second
        '-vframes', '1',
        '-q:v', '2', // Quality factor (lower is better)
        '-y', outputFileName
      ]);
      
      // Read output file
      const thumbnailData = await ffmpeg.readFile(outputFileName);
      const thumbnailBlob = new Blob([thumbnailData], { type: 'image/jpeg' });
      
      // Create and return URL for thumbnail
      return URL.createObjectURL(thumbnailBlob);
    } catch (error) {
      this.onLog(`Error extracting thumbnail: ${error}`);
      throw error;
    }
  }
  
  /**
   * Cleanup FFmpeg instance
   */
  public destroy(): void {
    if (this.ffmpeg) {
      this.ffmpeg = null;
      this.ffmpegLoaded = false;
    }
  }
}
