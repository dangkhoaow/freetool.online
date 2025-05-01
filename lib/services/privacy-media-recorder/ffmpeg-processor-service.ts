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
  frameRate?: number;
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
      
      this.onLog(`[FFMPEG] Processing started for ${recording.name} (${recording.duration}s)`);
      this.onLog(`[INPUT] Type=${recording.type}, Size=${recording.size} bytes, Duration=${recording.duration}s`);
      
      const ffmpeg = this.ffmpeg;
      
      // SPECIAL HANDLING FOR WEBM -> WEBM (NO CONVERSION)
      // For WebM source when target is also WebM, use a special approach that preserves duration
      if (recording.type.includes('webm') && options.format === 'webm' && 
          !options.resolution && !options.frameRate && 
          options.trimStart === undefined && options.trimEnd === undefined) {
        
        this.onLog(`[STRATEGY] Using WebM direct copy strategy to preserve duration`);
        
        // Simply return the original recording with a new ID to preserve all properties
        // This completely avoids FFmpeg duration issues with WebM
        const processedCopy: RecordedMedia = {
          ...recording,
          id: recording.id + '_processed',
          name: recording.name.includes('_processed') 
            ? recording.name
            : recording.name + '_processed',
        };
        
        this.onLog(`[COMPLETE] WebM direct copy completed: ${processedCopy.duration}s`);
        return processedCopy;
      }
      
      // For MP4 output or when edits are requested, we need to process through FFmpeg
      const inputFileName = 'input.webm'; // Force WebM extension for browser recordings
      const outputFileName = 'output' + this.getOutputExtension(options.format);
      
      // Write input file to FFmpeg virtual file system
      const inputData = await fetchFile(recording.blob);
      ffmpeg.writeFile(inputFileName, inputData);
      this.onLog(`[WRITE] Input file written: ${inputData.byteLength} bytes`);
      
      // SPECIAL CUSTOM COMMAND FOR WEBM CONVERSION THAT PRESERVES DURATION
      const command: string[] = [];
      
      if (options.format === 'gif') {
        // GIF generation requires special handling with palettegen
        this.buildGifCommand(command, inputFileName, outputFileName, options, recording.duration);
      } else {
        // For MP4 and WebM outputs with edits
        this.buildVideoCommand(command, inputFileName, outputFileName, options, recording.duration);
      }
      
      // Log the final command
      this.onLog(`[COMMAND] ffmpeg ${command.join(' ')}`);
      
      // Execute FFmpeg command
      await ffmpeg.exec(command);
      this.onLog('[EXEC] FFmpeg command completed successfully');
      
      // Get output file
      let outputData: Uint8Array;
      try {
        outputData = await ffmpeg.readFile(outputFileName);
        this.onLog(`[READ] Output file read: ${outputData.byteLength} bytes`);
      } catch (e) {
        this.onLog(`[ERROR] Failed to read output file: ${e}`);
        throw new Error(`Failed to read output file: ${e}`);
      }
      
      // Check if output file is empty or too small (<10KB)
      if (!outputData || outputData.byteLength < 10000) {
        this.onLog(`[ERROR] Output file too small or empty: ${outputData?.byteLength || 0} bytes`);
        throw new Error('FFmpeg processing failed: output file is too small or empty');
      }
      
      const outputBlob = new Blob([outputData], { type: this.getMimeType(options.format) });
      const outputUrl = URL.createObjectURL(outputBlob);
      
      this.onLog(`[OUTPUT] File created: size=${outputBlob.size} bytes, type=${outputBlob.type}`);
      
      // Create processed recording with explicitly preserved duration
      const processed: RecordedMedia = {
        ...recording,
        id: recording.id + '_processed',
        blob: outputBlob,
        url: outputUrl,
        type: this.getMimeType(options.format),
        size: outputBlob.size,
        duration: recording.duration, // Always preserve original duration
        name: recording.name.includes('_processed') 
          ? recording.name
          : recording.name + '_processed'
      };
      
      // Get output file metadata
      try {
        // Check the output file duration directly
        const probeCommand = `-v error -show_entries format=duration -of csv=p=0 ${outputFileName}`;
        ffmpeg.writeFile('probe.sh', new TextEncoder().encode(probeCommand));
        this.onLog(`[PROBE] Running: ffprobe ${probeCommand}`);
        
        try {
          await ffmpeg.exec(['-f', 'concat', '-i', 'probe.sh', '-c', 'copy', '-f', 'null', '-']);
        } catch (e) {
          // Expected to fail, output should be in the logs
          this.onLog(`[PROBE] Completed with expected error`);
        }
      } catch (e) {
        this.onLog(`[PROBE] Error checking output: ${e}`);
      }
      
      this.onLog(`[COMPLETE] Processing finished: ${processed.duration}s`);
      return processed;
    } catch (error) {
      this.onLog(`[ERROR] ${error}`);
      throw error;
    }
  }
  
  /**
   * Build command for GIF processing
   */
  private buildGifCommand(
    command: string[],
    inputFileName: string, 
    outputFileName: string, 
    options: ProcessingOptions,
    originalDuration: number
  ): void {
    // Build a palette for high-quality GIF
    const paletteFileName = 'palette.png';
    
    // First command: generate palette
    command.push(
      '-v', 'warning',
      '-stats',
      '-i', inputFileName
    );
    
    // Apply trim if specified
    if (options.trimStart !== undefined) {
      command.push('-ss', options.trimStart.toString());
    }
    
    // Set exact duration
    if (options.trimEnd !== undefined && options.trimStart !== undefined) {
      command.push('-t', (options.trimEnd - options.trimStart).toString());
    } else if (options.trimEnd !== undefined) {
      command.push('-t', options.trimEnd.toString());
    } else {
      command.push('-t', originalDuration.toString());
    }
    
    // Apply filters for palette generation
    let filters = '';
    
    if (options.resolution) {
      filters += `scale=${options.resolution.width}:${options.resolution.height}:flags=lanczos,`;
    }
    
    if (options.frameRate) {
      filters += `fps=${options.frameRate},`;
    }
    
    filters += 'split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle';
    
    command.push('-vf', filters);
    command.push('-y', outputFileName);
  }
  
  /**
   * Build command for video processing (MP4 or WebM)
   */
  private buildVideoCommand(
    command: string[],
    inputFileName: string, 
    outputFileName: string, 
    options: ProcessingOptions,
    originalDuration: number
  ): void {
    // Start with verbose logging
    command.push('-v', 'warning', '-stats');
    
    // Explicit timestamp handling
    command.push('-fflags', '+genpts+igndts');
    
    // Force maximum buffer sizes for proper WebM parsing
    command.push(
      '-analyzeduration', '2147483647',
      '-probesize', '2147483647'
    );
    
    // Input file
    command.push('-i', inputFileName);
    
    // Apply trim if specified
    if (options.trimStart !== undefined) {
      command.push('-ss', options.trimStart.toString());
    }
    
    // Set exact duration
    if (options.trimEnd !== undefined && options.trimStart !== undefined) {
      command.push('-t', (options.trimEnd - options.trimStart).toString());
    } else if (options.trimEnd !== undefined) {
      command.push('-t', options.trimEnd.toString());
    } else {
      // Force exact duration from the original recording
      command.push('-t', originalDuration.toString());
    }
    
    // Apply filters (resolution, framerate)
    const filters: string[] = [];
    
    if (options.resolution) {
      filters.push(`scale=${options.resolution.width}:${options.resolution.height}`);
    }
    
    if (options.frameRate) {
      filters.push(`fps=${options.frameRate}`);
    }
    
    if (filters.length > 0) {
      command.push('-vf', filters.join(','));
    }
    
    // Format-specific settings
    if (options.format === 'mp4') {
      // MP4 output
      command.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '22',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart'
      );
    } else {
      // WebM output
      command.push(
        '-c:v', 'libvpx-vp9',
        '-deadline', 'realtime',
        '-cpu-used', '8',  // Faster encoding
        '-crf', '30',
        '-b:v', '0',      // Use CRF mode
        '-pix_fmt', 'yuv420p',
        '-c:a', 'libopus',
        '-b:a', '128k'
      );
    }
    
    // Critical flags for reliable processing
    command.push(
      '-max_muxing_queue_size', '9999',
      '-avoid_negative_ts', 'make_zero'
    );
    
    // Output file
    command.push('-y', outputFileName);
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
