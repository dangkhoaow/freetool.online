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
    
    try {
      this.onLog(`Starting trim of ${file.name} from ${settings.startTime}s to ${settings.endTime}s`);
      
      // Write the input file to the FFmpeg virtual file system
      const inputFileName = 'input.' + file.name.split('.').pop();
      const fileData = await fetchFile(file);
      const fileDataArray = await this.convertToUint8Array(fileData);
      
      await this.ffmpeg.writeFile(inputFileName, fileDataArray);
      this.onLog(`Successfully wrote input file to FFmpeg filesystem`);
      
      // Determine the output file name and format
      const outputFormat = settings.format.toLowerCase();
      const outputFileName = `output.${outputFormat}`;
      
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
        
        // Quality settings
        if (settings.codec === 'libx264' || settings.codec === 'libx265') {
          ffmpegArgs.push('-crf', settings.quality.toString());
        } else {
          ffmpegArgs.push('-b:v', `${settings.quality}k`);
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
      const outputData = await this.ffmpeg.readFile(outputFileName);
      
      // Create a blob and URL from the output data
      const blob = new Blob([outputData], { type: `video/${outputFormat}` });
      const url = URL.createObjectURL(blob);
      
      this.onLog(`Trimming complete: ${outputFileName}`);
      
      return { url, blob };
    } catch (err) {
      this.onLog(`Error in video trimming: ${err}`);
      throw err;
    }
  }
}
