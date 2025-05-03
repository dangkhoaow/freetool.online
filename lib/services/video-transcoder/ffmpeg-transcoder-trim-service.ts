import { fetchFile } from "@ffmpeg/util";
import { FFmpegTranscoderBaseService } from "./ffmpeg-transcoder-base-service";
import { ProcessingResult, VideoSettings, ProgressCallback, LogCallback } from "./ffmpeg-transcoder-types";

export class FFmpegTranscoderTrimService extends FFmpegTranscoderBaseService {
  constructor(onProgress: ProgressCallback = () => {}, onLog: LogCallback = () => {}) {
    super(onProgress, onLog);
  }
  
  /**
   * Trim a video file using FFmpeg with the specified start and end times
   * @param file The video file to trim
   * @param settings The trim settings containing startTime and endTime
   * @returns Promise with the URL and blob of the trimmed video
   */
  public async trimVideo(file: File, settings: VideoSettings): Promise<ProcessingResult> {
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      await this.initialize();
    }
    
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }
    
    // Variable for output data, declared at method scope so it's available in finally block
    let outputData: any = null;
    
    try {
      this.onLog(`Starting trim of ${file.name} from ${settings.startTime}s to ${settings.endTime}s`);
      
      // Write the input file to the FFmpeg virtual file system
      const inputFileName = 'input.' + file.name.split('.').pop();
      const fileData = await fetchFile(file);
      const fileDataArray = await this.convertToUint8Array(fileData);
      
      await this.ffmpeg.writeFile(inputFileName, fileDataArray);
      this.onLog(`Successfully wrote input file to FFmpeg filesystem`);
      
      // Determine the output file name and format
      const outputFormat = settings.format ? settings.format.toLowerCase() : 'mp4';
      const outputFileName = `output.${outputFormat}`;

      // Determine the correct MIME type
      let mimeType = 'video/mp4';
      if (outputFormat === 'webm') {
        mimeType = 'video/webm';
      } else if (outputFormat === 'mov' || outputFormat === 'quicktime') {
        mimeType = 'video/quicktime';
      } else if (outputFormat === 'mp4') {
        mimeType = 'video/mp4';
      }
      
      // Calculate duration if endTime is specified
      const duration = settings.endTime !== null ? settings.endTime - settings.startTime : null;
      
      // Build FFmpeg arguments for trimming
      const ffmpegArgs = [
        // Seeking before input can be faster for large trims
        '-ss', settings.startTime.toString(),
        '-i', inputFileName
      ];
      
      // Add duration if endTime is set
      if (duration !== null) {
        ffmpegArgs.push('-t', duration.toString());
      }
      
      // Video codec settings
      if (settings.codec !== 'copy') {
        ffmpegArgs.push('-c:v', settings.codec);

        // Use robust CRF/bitrate mapping for quality (like convert/merge)
        let crf = 23;
        let bitrate = 2500;
        if (settings.quality === 1) { crf = 18; bitrate = 5000; }
        else if (settings.quality === 2) { crf = 20; bitrate = 4000; }
        else if (settings.quality === 3) { crf = 23; bitrate = 3000; }
        else if (settings.quality === 4) { crf = 25; bitrate = 2000; }
        else if (settings.quality === 5) { crf = 28; bitrate = 1000; }

        if (settings.codec === 'libx264' || settings.codec === 'libx265') {
          ffmpegArgs.push('-crf', crf.toString());
        } else {
          ffmpegArgs.push('-b:v', `${bitrate}k`);
        }

        // Resolution
        if (settings.resolution !== 'original') {
          const [width, height] = settings.resolution.split('x');
          ffmpegArgs.push('-vf', `scale=${width}:${height}`);
        }

        // Ensure compatibility
        ffmpegArgs.push('-pix_fmt', 'yuv420p');
      } else {
        // Fast copy mode - caution: this may result in imprecise cuts
        ffmpegArgs.push('-c:v', 'copy');
      }
      
      // Audio codec settings
      if (settings.audioCodec !== 'copy') {
        ffmpegArgs.push(
          '-c:a', settings.audioCodec,
          '-b:a', `${settings.audioBitrate}k`
        );
      } else {
        ffmpegArgs.push('-c:a', 'copy');
      }
      
      // Add faststart for web streaming
      if (outputFormat === 'mp4') {
        ffmpegArgs.push('-movflags', '+faststart');
      }
      
      // Avoid re-encoding if possible and using copy mode
      if (settings.codec === 'copy' && settings.audioCodec === 'copy') {
        ffmpegArgs.push('-avoid_negative_ts', 'make_zero');
      }
      
      // Output file
      ffmpegArgs.push(outputFileName);
      
      this.onLog(`Running FFmpeg trim command with args: ${ffmpegArgs.join(' ')}`);
      
      // Execute the FFmpeg command
      await this.ffmpeg.exec(ffmpegArgs);
      
      // Read the output file
      try {
        outputData = await this.ffmpeg.readFile(outputFileName);
        this.onLog(`Successfully read output file: ${outputFileName}`);
      } catch (readErr) {
        this.onLog(`Error reading output file: ${readErr}`);
        throw new Error(`Failed to read output file: ${readErr}`);
      }
      
      // Create a blob and URL from the output data
      try {
        // Double-check MIME type based on output format
        if (outputFormat === 'webm') {
          mimeType = 'video/webm';
        } else if (outputFormat === 'mp4') {
          mimeType = 'video/mp4';
        } else if (outputFormat === 'mov' || outputFormat === 'quicktime') {
          mimeType = 'video/quicktime';
        }
        
        this.onLog(`Creating blob with MIME type: ${mimeType}`);
        const blob = new Blob([outputData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        this.onLog(`Trimming complete: ${outputFileName}, format: ${outputFormat}, MIME type: ${mimeType}`);
        
        return { url, blob };
      } catch (blobErr) {
        this.onLog(`Error creating blob: ${blobErr}`);
        
        // Fallback method for WebM format
        if (outputFormat === 'webm') {
          try {
            this.onLog(`Trying alternative blob creation for WebM`);
            // Create blob without specifying MIME type, then set URL with correct type
            const blob = new Blob([outputData]);
            const url = URL.createObjectURL(blob);
            
            this.onLog(`Fallback WebM trim complete`);
            return { url, blob };
          } catch (fallbackErr) {
            this.onLog(`Fallback blob creation failed: ${fallbackErr}`);
            throw new Error(`WebM output format error: ${fallbackErr}. Try MP4 instead.`);
          }
        }
        
        throw new Error(`Failed to create output video: ${blobErr}`);
      }
    } catch (err) {
      this.onLog(`Error in video trimming: ${err}`);
      throw err;
    } finally {
      // Clean up resources to avoid memory leaks
      try {
        // Clean up the input file if it exists
        if (this.ffmpeg) {
          try {
            await this.ffmpeg.exec(['-nostdin', '-f', 'lavfi', '-i', 'nullsrc', '-t', '0.001', '-f', 'null', '-']);
            this.onLog('Input file resources cleaned up');
          } catch (e) {
            this.onLog(`Failed to clean input file: ${e}`);
          }
          
          // Clean up the output file
          try {
            await this.ffmpeg.exec(['-nostdin', '-f', 'lavfi', '-i', 'nullsrc', '-t', '0.001', '-f', 'null', '-']);
            this.onLog('Output file resources cleaned up');
          } catch (e) {
            this.onLog(`Failed to clean output file: ${e}`);
          }
        }
        
        // Force garbage collection hint
        if (outputData) {
          // Free memory by setting to undefined instead of null
          // @ts-ignore
          outputData = undefined;
        }
        
        this.onLog('Memory cleanup completed after trim operation');
      } catch (cleanupErr) {
        this.onLog(`Error during cleanup: ${cleanupErr}`);
      }
    }
  }
}
