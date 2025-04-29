import { fetchFile } from "@ffmpeg/util";
import { FFmpegTranscoderBaseService } from "./ffmpeg-transcoder-base-service";
import { ProcessingResult, VideoSettings, ProgressCallback, LogCallback } from "./ffmpeg-transcoder-types";

interface SplitResult {
  segments: ProcessingResult[];
}

export class FFmpegTranscoderSplitService extends FFmpegTranscoderBaseService {
  constructor(onProgress: ProgressCallback = () => {}, onLog: LogCallback = () => {}) {
    super(onProgress, onLog);
  }
  
  /**
   * Split a video file into multiple segments at the specified split points
   * @param file The video file to split
   * @param settings The settings containing splitPoints array
   * @returns Promise with an array of URLs and blobs for each segment
   */
  public async splitVideo(file: File, settings: VideoSettings): Promise<SplitResult> {
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      await this.initialize();
    }
    
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }
    
    try {
      // Ensure split points are ordered
      const sortedSplitPoints = [...settings.splitPoints].sort((a, b) => a - b);
      this.onLog(`Starting split of ${file.name} at points: ${sortedSplitPoints.join(', ')}`);
      
      // Write the input file to the FFmpeg virtual file system
      const inputFileName = 'input.' + file.name.split('.').pop();
      const fileData = await fetchFile(file);
      const fileDataArray = await this.convertToUint8Array(fileData);
      
      await this.ffmpeg.writeFile(inputFileName, fileDataArray);
      this.onLog(`Successfully wrote input file to FFmpeg filesystem`);
      
      // Determine the output format
      const outputFormat = settings.format.toLowerCase();
      
      // Create segments array to store results
      const segments: ProcessingResult[] = [];
      
      // Calculate the total number of segments
      const numSegments = sortedSplitPoints.length + 1;
      
      // Process each segment
      for (let i = 0; i < numSegments; i++) {
        const segmentStartTime = i === 0 ? 0 : sortedSplitPoints[i - 1];
        const segmentEndTime = i === sortedSplitPoints.length ? null : sortedSplitPoints[i];
        const segmentDuration = segmentEndTime !== null ? segmentEndTime - segmentStartTime : null;
        
        const outputFileName = `segment_${i}.${outputFormat}`;
        
        // Build FFmpeg arguments for this segment
        const ffmpegArgs = [
          '-ss', segmentStartTime.toString(),
          '-i', inputFileName
        ];
        
        // Add duration if not the last segment
        if (segmentDuration !== null) {
          ffmpegArgs.push('-t', segmentDuration.toString());
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
        
        this.onLog(`Creating segment ${i+1}/${numSegments} from ${segmentStartTime}s to ${segmentEndTime ? segmentEndTime + 's' : 'end'}`);
        
        // Execute FFmpeg command for this segment
        await this.ffmpeg.exec(ffmpegArgs);
        
        // Update progress
        this.onProgress(Math.floor(((i + 1) / numSegments) * 100));
        
        // Read the output file
        const outputData = await this.ffmpeg.readFile(outputFileName);
        
        // Create a blob and URL from the output data
        const blob = new Blob([outputData], { type: `video/${outputFormat}` });
        const url = URL.createObjectURL(blob);
        
        segments.push({ url, blob });
        
        this.onLog(`Segment ${i+1} complete: ${outputFileName}`);
      }
      
      this.onLog(`Splitting complete, created ${segments.length} segments`);
      
      return { segments };
    } catch (err) {
      this.onLog(`Error in video splitting: ${err}`);
      throw err;
    }
  }
}
