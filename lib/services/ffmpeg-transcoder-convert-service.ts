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
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      await this.initialize();
    }
    
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }
    
    try {
      this.onLog(`Starting conversion of ${file.name}`);
      
      // Write the input file to the FFmpeg virtual file system
      const inputFileName = 'input.' + file.name.split('.').pop();
      const fileData = await fetchFile(file);
      const fileDataArray = await this.convertToUint8Array(fileData);
      
      await this.ffmpeg.writeFile(inputFileName, fileDataArray);
      this.onLog(`Successfully wrote input file to FFmpeg filesystem`);
      
      // Determine the output file name and format
      const outputFormat = settings.format.toLowerCase();
      const outputFileName = `output.${outputFormat}`;
      
      // Build FFmpeg arguments based on settings
      const ffmpegArgs = ['-i', inputFileName];
      
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
      
      // Output file
      ffmpegArgs.push(outputFileName);
      
      this.onLog(`Running FFmpeg command with args: ${ffmpegArgs.join(' ')}`);
      
      // Execute the FFmpeg command
      await this.ffmpeg.exec(ffmpegArgs);
      
      // Read the output file
      const outputData = await this.ffmpeg.readFile(outputFileName);
      
      // Create a blob and URL from the output data
      const blob = new Blob([outputData], { type: `video/${outputFormat}` });
      const url = URL.createObjectURL(blob);
      
      this.onLog(`Conversion complete: ${outputFileName}`);
      
      return { url, blob };
    } catch (err) {
      this.onLog(`Error in video conversion: ${err}`);
      throw err;
    }
  }
}
