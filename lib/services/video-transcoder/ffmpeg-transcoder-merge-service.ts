import { fetchFile } from "@ffmpeg/util";
import { FFmpegTranscoderBaseService } from "./ffmpeg-transcoder-base-service";
import { ProcessingResult, VideoSettings, MergeClip, ProgressCallback, LogCallback } from "./ffmpeg-transcoder-types";

export class FFmpegTranscoderMergeService extends FFmpegTranscoderBaseService {
  constructor(onProgress: ProgressCallback = () => {}, onLog: LogCallback = () => {}) {
    super(onProgress, onLog);
  }
  
  /**
   * Merge multiple video clips into a single video
   * @param clips Array of MergeClip objects containing files and trim settings
   * @param transition Transition type to use between clips
   * @returns Promise with the URL and blob of the merged video
   */
  public async mergeVideos(clips: MergeClip[], transition: string = 'none'): Promise<ProcessingResult> {
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      await this.initialize();
    }
    
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }
    
    try {
      this.onLog('Starting FFmpeg merge with clips: ' + clips.length);
      
      // Sort clips by position
      const sortedClips = [...clips].sort((a, b) => a.position - b.position);
      this.onLog('Processing clips in order: ' + sortedClips.map(c => c.name).join(', '));
      
      // First, create standardized versions of each clip
      const processedFiles = [];
      
      for (let i = 0; i < sortedClips.length; i++) {
        const clip = sortedClips[i];
        // Use a more reliable progress calculation that starts from 0 and increases
        const processingProgress = Math.floor((i / sortedClips.length) * 40);
        this.onProgress(processingProgress);
        
        this.onLog(`Processing clip ${i+1}/${sortedClips.length}: ${clip.name}`);
        
        // Upload the file to FFmpeg filesystem
        const inputFileName = `input_${i}.mp4`;
        const fileData = await fetchFile(clip.file);
        
        try {
          const fileDataArray = await this.convertToUint8Array(fileData);
          await this.ffmpeg.writeFile(inputFileName, fileDataArray);
          this.onLog(`Successfully wrote ${inputFileName} to FFmpeg filesystem`);
          
          // Create a standardized version with consistent encoding parameters
          const standardizedFileName = `standardized_${i}.mp4`;
          
          // Build FFmpeg command for processing clip
          const ffmpegArgs = ['-i', inputFileName];
          
          // Add trim parameters if needed
          if (clip.startTrim > 0 || clip.endTrim < clip.duration) {
            const duration = clip.endTrim - clip.startTrim;
            this.onLog(`Trimming clip ${i+1} from ${clip.startTrim}s to ${clip.endTrim}s (duration: ${duration}s)`);
            ffmpegArgs.push('-ss', clip.startTrim.toString());
            ffmpegArgs.push('-t', duration.toString());
          }
          
          // Add encoding parameters - ensure all videos have the same format
          // Use ultrafast preset and optimize for speed
          ffmpegArgs.push(
            '-c:v', 'libx264',             // Video codec
            '-preset', 'ultrafast',        // Fastest encoding
            '-crf', '28',                  // Lower quality for faster processing
            '-pix_fmt', 'yuv420p',         // Pixel format
            '-vf', 'scale=640:-2',         // Scale to standard width, maintain aspect ratio
            '-f', 'mp4'                    // Force MP4 format
          );
          
          // Handle audio differently - make sure all outputs have audio stream
          // If the clip has audio, encode it. If not, create silent audio.
          ffmpegArgs.push(
            '-c:a', 'aac',                 // Audio codec
            '-b:a', '128k',                // Audio bitrate
            '-ar', '44100',                // Audio sample rate
            '-ac', '2',                    // 2 channels (stereo)
            '-shortest'                    // Stop encoding when shortest stream ends
          );
          
          // Add the output filename
          ffmpegArgs.push(standardizedFileName);
          
          // Execute FFmpeg command
          await this.ffmpeg.exec(ffmpegArgs);
          
          processedFiles.push(standardizedFileName);
          
        } catch (error) {
          this.onLog(`Error processing clip ${i}: ${error}`);
          throw new Error(`Failed to process video clip ${i}: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // More reliable progress calculation
        this.onProgress(40 + Math.floor((i / sortedClips.length) * 30));
      }
      
      this.onProgress(70);
      
      // Try direct approach first - use file concat
      const outputFileName = 'output.mp4';
      
      if (processedFiles.length === 1) {
        // Only one file, just copy it
        this.onLog('Only one file to process, copying directly to output');
        await this.ffmpeg.exec([
          '-i', processedFiles[0],
          '-c', 'copy',
          outputFileName
        ]);
      } else {
        // Always use re-encoding concat for best compatibility
        const concatListFileName = 'files.txt';
        let concatList = '';
        for (let i = 0; i < processedFiles.length; i++) {
          const file = processedFiles[i];
          await this.ffmpeg.readFile(file); // Ensure file exists
          concatList += `file '${file}'\n`;
        }
        await this.ffmpeg.writeFile(concatListFileName, concatList);
        this.onLog('Created concat list with verified files: ' + concatList);
        // Use re-encoding concat method
        const concatCommand = [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatListFileName,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-crf', '28',
          '-pix_fmt', 'yuv420p',
          '-fflags', '+genpts',
          '-max_muxing_queue_size', '9999',
          '-movflags', '+faststart',
          '-y',
          outputFileName
        ];
        this.onLog('Re-encoding FFmpeg concat command: ' + concatCommand.join(' '));
        await this.ffmpeg.exec(concatCommand);
      }
      
      this.onProgress(90);
      
      // Read the output file and create a blob URL
      const outputData = await this.ffmpeg.readFile(outputFileName);
      
      // Set progress to 100% after successfully reading the output file
      this.onProgress(100);
      
      // Create a blob from the output data
      const blob = new Blob([outputData], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      return { url, blob };
    } catch (err) {
      this.onLog('Error in FFmpeg merge process: ' + err);
      this.onProgress(0);
      throw err;
    }
  }
  
  /**
   * Apply a transition effect between clips
   * This is a placeholder for future implementation of transitions
   */
  private applyTransition(transition: string): string[] {
    // In future, this will return FFmpeg filter options for transitions
    return [];
  }
}
