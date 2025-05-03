import { fetchFile } from "@ffmpeg/util";
import { FFmpegTranscoderBaseService } from "./ffmpeg-transcoder-base-service";
import { ProcessingResult, VideoSettings, ProgressCallback, LogCallback } from "./ffmpeg-transcoder-types";

export class FFmpegTranscoderConvertService extends FFmpegTranscoderBaseService {
  constructor(onProgress: ProgressCallback = () => {}, onLog: LogCallback = () => {}) {
    super(onProgress, onLog);
  }
  
  /**
   * Convert a video file using FFmpeg with the specified settings
   * @param file The video file to convert
   * @param settings The conversion settings
   * @returns Promise with the URL and blob of the converted video
   */
  public async convertVideo(file: File, settings: VideoSettings): Promise<ProcessingResult> {
    try {
      this.onLog(`DEBUG: Starting conversion with file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      this.logMemoryUsage('START_CONVERSION');
      
      // Initialize FFmpeg if not already done
      await this.initialize();
      this.logMemoryUsage('AFTER_INIT');
    } catch (err) {
      throw new Error(`FFmpeg failed to initialize: ${err}`);
    }
    
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      throw new Error('FFmpeg initialization failed');
    }
    
    // Declare variables at method scope for cleanup in finally block
    let outputData: any = null;
    let inputFileName: string = '';
    let outputFileName: string = '';
    
    // Log every step of the process to identify startsWith error
    this.onLog(`DEBUG: Settings: ${JSON.stringify({
      format: settings.format,
      codec: settings.codec,
      resolution: settings.resolution,
      frameRate: settings.frameRate,
      audioBitrate: settings.audioBitrate,
      audioCodec: settings.audioCodec,
      performanceMode: settings.performanceMode,
    })}`);
    
    try {
      this.onLog(`Starting conversion of ${file.name}`);
      
      // Check for large files and warn user (in-browser WASM FFmpeg memory limits)
      const MAX_SAFE_SIZE_MB = 100;
      if (file.size > MAX_SAFE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File is too large for in-browser conversion (> ${MAX_SAFE_SIZE_MB}MB). Try a smaller file or lower resolution/bitrate.`);
      }

      // Special VP9/WebM stricter limits
      if (settings.format === 'webm' || settings.codec === 'libvpx-vp9') {
        const MAX_SAFE_WEBM_SIZE_MB = 50;
        const MAX_SAFE_WEBM_RESOLUTION = 854 * 480; // 480p
        if (file.size > MAX_SAFE_WEBM_SIZE_MB * 1024 * 1024) {
          throw new Error(`WebM/VP9 conversion is limited to files under ${MAX_SAFE_WEBM_SIZE_MB}MB due to browser memory limits.`);
        }
        if (settings.resolution && settings.resolution !== 'original') {
          let width = null, height = null;
          if (/^\d+x\d+$/.test(settings.resolution)) {
            [width, height] = settings.resolution.split('x');
          } else if (settings.resolution === 'custom' && settings.customWidth && settings.customHeight) {
            width = settings.customWidth;
            height = settings.customHeight;
          } else if (/^\d+p$/.test(settings.resolution)) {
            const presetMap: Record<string, [string, string]> = {
              '1080p': ['1920', '1080'],
              '720p': ['1280', '720'],
              '480p': ['854', '480'],
              '360p': ['640', '360']
            };
            [width, height] = presetMap[settings.resolution] || [null, null];
          }
          if (width && height) {
            const widthNum = Number(width);
            const heightNum = Number(height);
            if (widthNum * heightNum > MAX_SAFE_WEBM_RESOLUTION) {
              throw new Error('WebM/VP9 conversion is limited to 480p (854x480) or lower for browser stability.');
            }
          }
        }
        // Lower default bitrate for VP9
        if (!settings.quality) settings.quality = 4;
      }

      // Check for high output resolution (default: 720p max)
      const MAX_SAFE_RESOLUTION = 1280 * 720; // 720p
      if (settings.resolution && settings.resolution !== 'original') {
        let width = null, height = null;
        if (/^\d+x\d+$/.test(settings.resolution)) {
          [width, height] = settings.resolution.split('x');
        } else if (settings.resolution === 'custom' && settings.customWidth && settings.customHeight) {
          width = settings.customWidth;
          height = settings.customHeight;
        } else if (/^\d+p$/.test(settings.resolution)) {
          const presetMap: Record<string, [string, string]> = {
            '1080p': ['1920', '1080'],
            '720p': ['1280', '720'],
            '480p': ['854', '480'],
            '360p': ['640', '360']
          };
          [width, height] = presetMap[settings.resolution] || [null, null];
        }
        if (width && height) {
          const widthNum = Number(width);
          const heightNum = Number(height);
          if (widthNum * heightNum > MAX_SAFE_RESOLUTION) {
            throw new Error('Output resolution is too high for in-browser conversion. Please select 720p or lower.');
          }
        }
      }

      // Warn about memory-intensive codecs
      if (settings.codec === 'libvpx-vp9' || settings.codec === 'libaom-av1') {
        this.onLog('Warning: VP9/AV1 codecs are memory-intensive and may fail in-browser. Use H.264 for best results.');
      }
      
      // Write input file to memory file system
      try {
        this.logMemoryUsage('BEFORE_WRITE_FILE');
        inputFileName = 'input.' + file.name.split('.').pop();
        const fileData = await fetchFile(file);
        const fileDataArray = await this.convertToUint8Array(fileData);
        
        await this.ffmpeg.writeFile(inputFileName, fileDataArray);
        this.onLog(`Successfully wrote input file to FFmpeg filesystem`);
        this.logMemoryUsage('AFTER_WRITE_FILE');
      } catch (writeErr) {
        throw new Error(`Failed to write input file to FFmpeg filesystem: ${writeErr}`);
      }
      
      // Output format and file extension
      const outputFormat = settings.format?.toLowerCase() || 'mp4';
      const outputExtension = this.getExtensionForFormat(outputFormat);
      // Setup MIME type for the output
      let mimeType = 'video/mp4'; // Default
      if (outputExtension === 'webm') {
        mimeType = 'video/webm';
      } else if (outputExtension === 'mov') {
        mimeType = 'video/quicktime';
      }
      
      this.onLog(`Output format: ${outputFormat}, extension: ${outputExtension}, MIME type: ${mimeType}`);
      
      // Set the output filename
      outputFileName = `output.${outputExtension}`;
      
      // Use specialized WebM handler for WebM format to avoid startsWith errors
      if (outputFormat === 'webm') {
        try {
          this.onLog('Detected WebM format, using specialized safe WebM handler');
          // Pass input file name and the settings
          return await this.handleWebMConversion(inputFileName, settings);
        } catch (webmErr) {
          this.onLog(`Specialized WebM handler failed: ${webmErr}`);
          this.onLog('Falling back to standard conversion path');
          // Continue with standard flow
        }
      }
      
      // Ensure valid audio codec for WebM
      let audioCodec = settings.audioCodec;
      if (outputExtension === 'webm') {
        audioCodec = 'libvorbis'; // Or 'libopus' if preferred
        if (!settings.audioBitrate || settings.audioBitrate < 32) settings.audioBitrate = 128;
      } else if (outputExtension === 'mp4' || outputExtension === 'mov') {
        audioCodec = 'aac'; // MP4/MOV work best with AAC
      }
      
      // Build FFmpeg arguments based on settings
      const ffmpegArgs = ['-i', inputFileName];
      
      // Apply performance mode settings
      if (settings.performanceMode === 'max-performance') {
        this.onLog('Using maximum performance mode');
        // Add thread count setting to use more CPU threads
        ffmpegArgs.push('-threads', '0'); // 0 means use all available threads
        
        // For x264, add faster preset while maintaining quality
        if (settings.codec === 'libx264') {
          // Use a faster preset for encoding
          ffmpegArgs.push('-preset', 'veryfast');
        } else if (settings.codec === 'libvpx-vp9') {
          // For VP9, use row-based multithreading and a faster quality setting
          ffmpegArgs.push('-row-mt', '1', '-cpu-used', '4');
        }
      } else {
        // Default balanced mode 
        if (settings.codec === 'libx264') {
          ffmpegArgs.push('-preset', 'medium'); // Default preset
        } else if (settings.codec === 'libvpx-vp9') {
          ffmpegArgs.push('-row-mt', '1', '-cpu-used', '2'); // Moderate CPU usage
        }
      }
      
      // For VP9/WebM, lower bitrate if not set
      let forceBitrate = null;
      if ((settings.format === 'webm' || settings.codec === 'libvpx-vp9') && (!settings.quality || settings.quality > 4)) {
        forceBitrate = 1200; // safer default for VP9
      }
      
      // Video codec settings
      if (settings.codec !== 'copy') {
        ffmpegArgs.push('-c:v', settings.codec);
        
        // Quality settings (UI slider: 1 = highest, 5 = lowest)
        // Map slider to CRF/bitrate: 1 (high) → CRF 18 / 5000k, 5 (low) → CRF 28 / 1000k
        let crf = 23; // default
        let bitrate = 2500; // default kbps
        if (settings.quality === 1) { crf = 18; bitrate = 5000; }
        else if (settings.quality === 2) { crf = 20; bitrate = 4000; }
        else if (settings.quality === 3) { crf = 23; bitrate = 3000; }
        else if (settings.quality === 4) { crf = 25; bitrate = 2000; }
        else if (settings.quality === 5) { crf = 28; bitrate = 1000; }
        if (forceBitrate) bitrate = forceBitrate;
        if (settings.codec === 'libx264' || settings.codec === 'libx265') {
          ffmpegArgs.push('-crf', crf.toString());
        } else {
          ffmpegArgs.push('-b:v', `${bitrate}k`);
        }
        
        // Resolution
        if (settings.resolution !== 'original') {
          let width = null, height = null;
          if (/^\d+x\d+$/.test(settings.resolution)) {
            [width, height] = settings.resolution.split('x');
          } else if (settings.resolution === 'custom' && settings.customWidth && settings.customHeight) {
            width = settings.customWidth;
            height = settings.customHeight;
          } else if (/^\d+p$/.test(settings.resolution)) {
            const presetMap: Record<string, [string, string]> = {
              '1080p': ['1920', '1080'],
              '720p': ['1280', '720'],
              '480p': ['854', '480'],
              '360p': ['640', '360']
            };
            [width, height] = presetMap[settings.resolution] || [null, null];
          }
          if (width && height) {
            const widthNum = Number(width);
            const heightNum = Number(height);
            if (widthNum * heightNum > MAX_SAFE_RESOLUTION) {
              throw new Error('Output resolution is too high for in-browser conversion. Please select 720p or lower.');
            }
            ffmpegArgs.push('-vf', `scale=${width}:${height}`);
          }
        }
        
        // Frame rate
        if (settings.frameRate) {
          ffmpegArgs.push('-r', settings.frameRate.toString());
        }
        
        // Ensure compatibility
        ffmpegArgs.push('-pix_fmt', 'yuv420p');
      } else {
        ffmpegArgs.push('-c:v', 'copy');
      }
      
      // Audio codec settings
      if (audioCodec !== 'copy') {
        ffmpegArgs.push(
          '-c:a', audioCodec,
          '-b:a', `${settings.audioBitrate}k`
        );
      } else {
        ffmpegArgs.push('-c:a', 'copy');
      }
      
      // Add faststart for web streaming
      if (outputExtension === 'mp4') {
        ffmpegArgs.push('-movflags', '+faststart');
      }
      
      // Output file
      ffmpegArgs.push(outputFileName);
      
      this.onLog(`Running FFmpeg command with args: ${ffmpegArgs.join(' ')}`);
      this.logMemoryUsage('BEFORE_FFMPEG_EXEC');
      
      // Execute the FFmpeg command with enhanced error handling
      try {
        await this.ffmpeg.exec(ffmpegArgs);
        this.logMemoryUsage('AFTER_FFMPEG_EXEC');
      } catch (ffmpegErr) {
        this.logMemoryUsage('FFMPEG_EXEC_ERROR');
        // Enhanced error handling for WASM memory errors
        if (settings.format === 'webm' || settings.codec === 'libvpx-vp9') {
          const msg = String(ffmpegErr);
          if (msg.includes('memory access out of bounds') || msg.includes('abort') || msg.includes('OOM')) {
            this.onLog('WebM/VP9 conversion failed due to browser memory limits. Try a lower resolution or use MP4/H.264.');
            throw new Error('WebM/VP9 conversion failed: browser ran out of memory. Try 360p or 240p, or switch to MP4 for better stability.');
          }
        }
        throw ffmpegErr;
      }
      
      // Read the output file with explicit error handling for memory issues
      try {
        this.logMemoryUsage('BEFORE_READ_FILE');
        this.onLog(`Attempting to read output file: ${outputFileName}`);
        outputData = await this.ffmpeg.readFile(outputFileName);
        this.onLog(`Successfully read output file: ${outputFileName}, data type: ${typeof outputData}, length: ${outputData?.length || 'unknown'}`);
        this.logMemoryUsage('AFTER_READ_FILE');
        
        // Immediately verify we have valid data before proceeding
        if (!outputData || !(outputData instanceof Uint8Array) || outputData.length === 0) {
          throw new Error('Invalid or empty output data from FFmpeg');
        }
      } catch (readErr) {
        this.logMemoryUsage('READ_FILE_ERROR');
        this.onLog(`Error reading output file: ${readErr}`);
        
        // Special handling for memory errors
        if (String(readErr).includes('memory access out of bounds')) {
          this.onLog('CRITICAL: Memory access error detected. WebM/VP9 processing likely exceeded browser memory limits.');
          throw new Error('Video processing failed due to browser memory constraints. Try using MP4 format instead of WebM, or reduce video resolution.');
        }
        
        throw new Error(`Failed to read output file: ${readErr}`);
      }

      // Create a blob and URL from the output data
      try {
        this.logMemoryUsage('BEFORE_BLOB_CREATION');
        // Double-check that we have valid blob data before proceeding
        if (!outputData) {
          this.onLog('No output data - cannot create blob');
          throw new Error('No output data available from FFmpeg');
        }

        // Set appropriate MIME type with extra safety checks
        if (typeof outputExtension === 'string') {
          if (outputExtension === 'webm') {
            mimeType = 'video/webm';
          } else if (outputExtension === 'mp4') {
            mimeType = 'video/mp4';
          } else if (outputExtension === 'mov') {
            mimeType = 'video/quicktime';
          }
        } else {
          // Fallback to a safe default if extension is somehow undefined
          this.onLog('WARNING: outputExtension is not a string, using default MIME type');
          mimeType = 'video/mp4';
        }
        
        this.onLog(`Creating blob with MIME type: ${mimeType}`);
        
        // Safeguard blob creation for memory issues
        let blob: Blob;
        try {
          blob = new Blob([outputData], { type: mimeType });
          if (blob.size === 0) {
            throw new Error('Created blob has zero size - invalid output data');
          }
        } catch (blobCreateErr) {
          this.logMemoryUsage('BLOB_CREATION_ERROR');
          this.onLog(`Error creating blob: ${blobCreateErr}`);
          throw blobCreateErr;
        }
        
        // Create URL with explicit safety
        let url: string;
        try {
          const tempUrl = URL.createObjectURL(blob);
          if (!tempUrl) throw new Error('URL creation returned null or undefined');
          url = tempUrl;
        } catch (urlErr) {
          this.logMemoryUsage('URL_CREATION_ERROR');
          this.onLog(`Error creating URL: ${urlErr}`);
          throw urlErr;
        }
        
        this.onLog(`Conversion complete: ${outputFileName}`);
        
        // Create a proper result object with null checks
        const result: ProcessingResult = { 
          url: url, 
          blob: blob
        };
        
        return result;
      } catch (blobErr) {
        // Safe handling of error object for debugging
        if (blobErr instanceof Error) {
          this.onLog(`Error details: ${blobErr.toString()}, Stack: ${blobErr.stack || 'no stack'}`);
        }
        
        // Fallback method specifically for WebM format
        if (typeof outputExtension === 'string' && outputExtension === 'webm') {
          try {
            this.onLog(`Trying alternative blob creation for WebM`);
            
            // Create blob without specifying MIME type
            const blob = new Blob([outputData]);
            this.onLog(`Blob created without MIME type. Size: ${blob.size}`);
            
            // Create URL with safety checks
            let url = null;
            try {
              url = URL.createObjectURL(blob);
              this.onLog(`Alternative URL created: ${typeof url === 'string' ? 'success' : 'failed'}`);
            } catch (urlErr) {
              this.onLog(`Error creating URL in fallback: ${urlErr}`);
              throw urlErr;
            }
            
            if (!url) {
              throw new Error('URL creation failed in fallback path');
            }
            
            this.onLog(`Fallback WebM conversion complete`);
            
            // Return with the same structured result
            return { 
              url: url, 
              blob: blob
            };
          } catch (fallbackErr) {
            this.onLog(`Fallback blob creation failed: ${fallbackErr}`);
            throw new Error(`WebM output format error: ${fallbackErr}. Try MP4 instead.`);
          }
        }
        
        this.onLog(`Error creating blob: ${blobErr}`);
        throw new Error(`Failed to create output video: ${blobErr}`);
      }
    } catch (err) {
      this.onLog(`Error in video conversion: ${err}`);
      throw err;
    } finally {
      // Clean up resources to avoid memory leaks
      this.logMemoryUsage('START_CLEANUP');
      try {
        // Clear any stored data in the convert service
        if (outputData) {
          this.onLog(`DEBUG CLEANUP: outputData exists and is type: ${typeof outputData}`);
          // Clear large data references to help garbage collection
          outputData = undefined;
        }
        
        // Array of temp files to clean
        let tempArray: any = [];
        if (inputFileName) {
          tempArray.push(inputFileName);
        }
        if (outputFileName) {
          tempArray.push(outputFileName);
        }
        
        // Try to clean input file
        try {
          if (inputFileName) {
            await this.ffmpeg.deleteFile(inputFileName);
            this.onLog(`Cleaned input file: ${inputFileName}`);
          }
        } catch (cleanErr) {
          this.onLog(`Failed to clean input file: ${cleanErr}`);
        }
        
        // Try to clean output file
        try {
          if (outputFileName) {
            await this.ffmpeg.deleteFile(outputFileName);
            this.onLog(`Cleaned output file: ${outputFileName}`);
          }
        } catch (cleanErr) {
          this.onLog(`Failed to clean output file: ${cleanErr}`);
        }
        
        // Release temp array
        tempArray = undefined;
        
        // Force garbage collection hint
        if (typeof window !== 'undefined') {
          // Only try to use gc() if it's available (Chrome with special flag)
          try {
            // @ts-ignore
            if (window.gc) window.gc();
          } catch (e) {
            // Ignore if gc() not available
          }
        }
        
        // Explicitly revoke any blob URLs before garbage collection
        try {
          if (typeof window !== 'undefined' && window.URL && typeof window.URL.revokeObjectURL === 'function') {
            this.onLog(`URL API is available for cleanup`);
          } else {
            this.onLog(`URL API is not available for blob URL cleanup`);
          }
        } catch (urlErr) {
          this.onLog(`Error checking URL API: ${urlErr}`);
        }
        
        this.logMemoryUsage('END_CLEANUP');
        this.onLog('Memory cleanup completed');
      } catch (cleanupErr) {
        this.onLog(`Error during cleanup: ${cleanupErr}`);
      }
    }
  }

  // Helper method to get the file extension for a given format
  private getExtensionForFormat(format: string): string {
    // Ensure we have a valid output format with a fallback
    if (format === 'webm') return 'webm';
    if (format === 'mov' || format === 'quicktime') return 'mov';
    return 'mp4'; // Default fallback
  }

  // Method to handle the WebM format specifically
  private async handleWebMConversion(inputFile: string, outputSettings: any): Promise<ProcessingResult> {
    this.onLog('Using direct WebM handling path for safer conversion');
    this.logMemoryUsage('WEBM_HANDLER_START');
    
    try {
      // Set up safer WebM specific settings
      const args = [
        '-i', inputFile,
        '-c:v', 'libvpx',  // Use regular libvpx instead of libvpx-vp9 for stability
        '-b:v', '1000k',   // Use lower bitrate
        '-c:a', 'libvorbis',
        '-b:a', '128k',
        'safer_output.webm'
      ];
      
      // Run the simpler command
      if (!this.ffmpeg) {
        throw new Error('FFmpeg not initialized');
      }
      
      await this.ffmpeg.exec(args);
      
      // Read the output with extra caution
      const outputData = await this.ffmpeg.readFile('safer_output.webm');
      if (!outputData || outputData.length === 0) {
        throw new Error('WebM conversion failed - empty output file');
      }
      
      this.logMemoryUsage('WEBM_BEFORE_BLOB');
      // Create blob with explicit try/catch
      let blob: Blob;
      try {
        blob = new Blob([outputData], { type: 'video/webm' });
        if (blob.size === 0) {
          throw new Error('Created blob has zero size');
        }
      } catch (blobErr) {
        this.onLog(`WebM blob creation failed: ${blobErr}`);
        throw blobErr;
      }
      
      // Create URL with explicit safety
      let url: string;
      try {
        const tempUrl = URL.createObjectURL(blob);
        if (!tempUrl) throw new Error('URL creation returned null or undefined');
        url = tempUrl;
      } catch (urlErr) {
        this.logMemoryUsage('URL_CREATION_ERROR');
        this.onLog(`WebM URL creation failed: ${urlErr}`);
        throw urlErr;
      }
      
      this.logMemoryUsage('WEBM_HANDLER_END');
      
      // Try to clean up the temp file
      try {
        await this.ffmpeg.deleteFile('safer_output.webm');
        this.onLog('Cleaned up WebM temp file');
      } catch (cleanupErr) {
        this.onLog(`Failed to clean up WebM temp file: ${cleanupErr}`);
      }
      
      return {
        url: url,
        blob: blob
      };
    } catch (err) {
      this.onLog(`WebM handler failed: ${err}`);
      // Try to clean up anyway on error
      try {
        if (this.ffmpeg) {
          await this.ffmpeg.deleteFile('safer_output.webm');
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      throw new Error(`Alternative WebM conversion failed: ${err}. Please try MP4 format.`);
    }
  }

  private logMemoryUsage(stage: string) {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      // @ts-ignore - performance.memory is Chrome-specific and not in TypeScript types
      const memoryInfo = window.performance.memory;
      this.onLog(`MEMORY [${stage}] - Used JS Heap: ${Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024))}MB / ${Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024))}MB (${Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100)}%)`);
    } else {
      this.onLog(`MEMORY [${stage}] - Memory metrics not available in this browser`);
    }
  }
}
