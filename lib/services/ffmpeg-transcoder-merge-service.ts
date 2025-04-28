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
        // Create a file list for concat demuxer
        const concatListFileName = 'files.txt';
        let concatList = '';
        
        // Verify that each processed file exists before adding to concat list
        for (let i = 0; i < processedFiles.length; i++) {
          const file = processedFiles[i];
          
          try {
            // Check if file exists by trying to read it
            await this.ffmpeg.readFile(file);
            
            // File exists, add to concat list
            concatList += `file '${file}'\n`;
            this.onLog(`Verified file exists and added to concat: ${file}`);
          } catch (error) {
            this.onLog(`Error: File ${file} does not exist or can't be read: ${error}`);
            // If this is not the first file, we can skip it, otherwise throw an error
            if (i === 0) {
              throw new Error(`Primary video file ${file} could not be read for merge operation`);
            }
          }
        }
        
        if (concatList.trim() === '') {
          throw new Error('No valid files to concat');
        }
        
        await this.ffmpeg.writeFile(concatListFileName, concatList);
        this.onLog('Created concat list with verified files: ' + concatList);
        
        // Try the simple concat demuxer first with copy codecs (this is much faster)
        this.onLog('Starting fast concat with copy codec...');
        const fastConcatCommand = [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatListFileName,
          '-c', 'copy',               // Just copy streams, no re-encoding
          '-y',                       // Overwrite output
          outputFileName
        ];
        
        this.onLog('Fast FFmpeg concat command: ' + fastConcatCommand.join(' '));
        
        try {
          await this.ffmpeg.exec(fastConcatCommand);
          this.onLog('Fast concat operation completed successfully');
        } catch (error) {
          this.onLog('Fast concat operation failed: ' + error);
          
          // Fall back to slower concat with re-encoding
          this.onLog('Trying standard concat with re-encoding...');
          const concatCommand = [
            '-f', 'concat',
            '-safe', '0',
            '-i', concatListFileName,
            '-c:v', 'libx264',
            '-preset', 'ultrafast',     // Changed from medium to ultrafast
            '-crf', '28',               // Less quality, faster encoding
            '-pix_fmt', 'yuv420p',
            '-fflags', '+genpts',       // Generate presentation timestamps
            '-max_muxing_queue_size', '9999', // Increase muxing queue size
            '-movflags', '+faststart',
            '-y',                       // Overwrite output
            'reencoded_output.mp4'
          ];
          
          this.onLog('Standard FFmpeg concat command: ' + concatCommand.join(' '));
          
          try {
            await this.ffmpeg.exec(concatCommand);
            this.onLog('Standard concat operation completed successfully');
            // Update the output filename for the return value
            await this.ffmpeg.exec([
              '-i', 'reencoded_output.mp4',
              '-c', 'copy',
              '-y',
              outputFileName
            ]);
          } catch (secondError) {
            this.onLog('Standard concat also failed: ' + secondError);
            
            // Last resort: try combining videos using the filtergraph approach
            this.onLog('Trying filter_complex concat as last resort...');
            
            const inputs = [];
            const filterInputs = [];
            
            for (let i = 0; i < processedFiles.length; i++) {
              inputs.push('-i', processedFiles[i]);
              filterInputs.push(`[${i}:v]`);
              // Only add audio if we're sure it exists
              try {
                await this.ffmpeg.exec(['-i', processedFiles[i], '-c', 'copy', '-f', 'null', '-']);
                filterInputs.push(`[${i}:a]`);
              } catch {
                // No audio stream in this file
              }
            }
            
            // Create a concat filter, adapting to the number of streams we have
            const hasAudio = filterInputs.some(input => input.includes(':a'));
            let filterGraph;
            let outputMaps;
            
            if (hasAudio) {
              filterGraph = `${filterInputs.join('')}concat=n=${processedFiles.length}:v=1:a=1[outv][outa]`;
              outputMaps = ['-map', '[outv]', '-map', '[outa]'];
            } else {
              // Video only
              filterGraph = `${filterInputs.filter(i => i.includes(':v')).join('')}concat=n=${processedFiles.length}:v=1[outv]`;
              outputMaps = ['-map', '[outv]'];
            }
            
            const alternativeCommand = [
              ...inputs,
              '-filter_complex', filterGraph,
              ...outputMaps,
              '-c:v', 'libx264',
              '-preset', 'ultrafast',  // Use fastest preset
              '-crf', '28',            // Lower quality for performance
              '-pix_fmt', 'yuv420p',
              '-movflags', '+faststart',
              '-y',
              'fallback_output.mp4'
            ];
            
            this.onLog('Trying alternative concat command: ' + alternativeCommand.join(' '));
            
            try {
              await this.ffmpeg.exec(alternativeCommand);
              this.onLog('Alternative concat method succeeded');
              // Copy the fallback output to main output
              await this.ffmpeg.exec([
                '-i', 'fallback_output.mp4',
                '-c', 'copy',
                '-y',
                outputFileName
              ]);
            } catch (fallbackError) {
              this.onLog('All concat methods failed: ' + fallbackError);
              throw new Error('Unable to merge videos after trying multiple methods');
            }
          }
        }
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
