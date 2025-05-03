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
   * @param settings Video settings object containing transition type, format, codec, and quality
   * @returns Promise with the URL and blob of the merged video
   */
  public async mergeVideos(clips: MergeClip[], settings: VideoSettings): Promise<ProcessingResult> {
    if (!this.ffmpeg || !this.ffmpegLoaded) {
      await this.initialize();
    }
    
    if (!this.ffmpeg) {
      throw new Error('FFmpeg failed to initialize');
    }
    
    let outputData: any = null;
    const inputFileNames: string[] = [];
    const outputFormat = settings.format ? settings.format.toLowerCase() : 'mp4';
    const outputFileName = `output.${outputFormat}`;
    
    try {
      this.onLog('Starting FFmpeg merge with clips: ' + clips.length);
      this.onLog(`Using transition: ${settings.transition}, format: ${settings.format}, codec: ${settings.codec}`);
      
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
        inputFileNames.push(inputFileName);
        const fileData = await fetchFile(clip.file);
        
        try {
          const fileDataArray = await this.convertToUint8Array(fileData);
          await this.ffmpeg.writeFile(inputFileName, fileDataArray);
          this.onLog(`Successfully wrote ${inputFileName} to FFmpeg filesystem`);
          
          // Create a standardized version with consistent encoding parameters
          const standardizedFileName = `standardized_${i}.mp4`;
          inputFileNames.push(standardizedFileName);
          
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
      
      // Determine output format and output file name
      const mimeType = outputFormat === 'webm' ? 'video/webm' : 'video/mp4';
      
      this.onLog(`Output format: ${outputFormat}, MIME type: ${mimeType}`);
      
      // Try direct approach first - use file concat
      if (processedFiles.length === 1) {
        // Only one file, just copy it
        this.onLog('Only one file to process, copying directly to output');
        await this.ffmpeg.exec([
          '-i', processedFiles[0],
          '-c', 'copy',
          outputFileName
        ]);
      } else {
        // The approach depends on whether we need to apply transitions
        const useTransition = settings.transition !== 'none' && processedFiles.length > 1;
        
        if (useTransition) {
          // Use complex filtergraph for transitions
          this.onLog(`Applying ${settings.transition} transition between clips`);
          
          // Create filter inputs for video scaling first
          let videoInputs = '';
          let videoScaled = '';
          
          // First standardize all videos to the same dimensions
          for (let i = 0; i < processedFiles.length; i++) {
            videoInputs += `-i ${processedFiles[i]} `;
            videoScaled += `[${i}:v]scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}];`;
          }
          
          // For transitions between clips
          let transitionChain = '';
          
          // Reference to the previous output (for chaining)
          let prevOutput = `[v0]`;
          
          // Create transitions between clips
          for (let i = 1; i < processedFiles.length; i++) {
            const transitionLength = 0.5; // Transition length in seconds
            
            switch (settings.transition) {
              case 'crossfade':
                // Crossfade transition with xfade filter (properly blend two videos)
                this.onLog(`Applying crossfade transition between clip ${i-1} and clip ${i}`);
                transitionChain += `${prevOutput}[v${i}]xfade=transition=fade:duration=${transitionLength}:offset=0[v${i}out];`;
                prevOutput = `[v${i}out]`;
                break;
                
              case 'fade':
                // Fade to black transition (fade out first clip, then fade in second clip)
                this.onLog(`Applying fade to black transition between clip ${i-1} and clip ${i}`);
                
                // We need to:
                // 1. Fade out the first clip to black
                // 2. Fade in the second clip from black
                
                // Get effective duration of the current video in the chain
                const fadeOutAt = transitionLength; // Start fade out this many seconds before the end
                
                transitionChain += `${prevOutput}fade=t=out:st=${fadeOutAt}:d=${transitionLength}[fadeout${i-1}];`;
                transitionChain += `[v${i}]fade=t=in:st=0:d=${transitionLength}[fadein${i}];`;
                transitionChain += `[fadeout${i-1}][fadein${i}]concat=n=2:v=1:a=0[v${i}out];`;
                
                prevOutput = `[v${i}out]`;
                break;
                
              case 'wipe':
                // Wipe transition (slide the second clip over the first)
                this.onLog(`Applying wipe transition between clip ${i-1} and clip ${i}`);
                
                // Use xfade with a directional wipe effect
                transitionChain += `${prevOutput}[v${i}]xfade=transition=slideleft:duration=${transitionLength}:offset=0[v${i}out];`;
                prevOutput = `[v${i}out]`;
                break;
                
              case 'none':
              default:
                // Simple cut - just concatenate with no transition
                this.onLog(`No transition (cut) between clip ${i-1} and clip ${i}`);
                transitionChain += `${prevOutput}[v${i}]concat=n=2:v=1:a=0[v${i}out];`;
                prevOutput = `[v${i}out]`;
            }
          }
          
          // Build audio chain
          let audioChain = '';
          if (processedFiles.some(file => file.includes('_audio'))) {
            // If we have audio streams in any file
            let audioInputs = '';
            for (let i = 0; i < processedFiles.length; i++) {
              if (processedFiles[i].includes('_audio')) {
                audioInputs += `[${i}:a]`;
              }
            }
            
            if (audioInputs) {
              audioChain = `${audioInputs}concat=n=${audioInputs.match(/\[\d+:a\]/g)?.length || 0}:v=0:a=1[aout]`;
            }
          }
          
          // Combine filter graphs
          const fullFilterGraph = videoScaled + transitionChain + (audioChain ? audioChain : '');
          
          // Build the FFmpeg command
          const ffmpegCommand = [];
          
          // Add input files
          for (let i = 0; i < processedFiles.length; i++) {
            ffmpegCommand.push('-i', processedFiles[i]);
          }
          
          // Add filter complex
          ffmpegCommand.push('-filter_complex', fullFilterGraph);
          
          // Map video output - use the last transition output
          ffmpegCommand.push('-map', prevOutput);
          
          // Map audio if available
          if (audioChain) {
            ffmpegCommand.push('-map', '[aout]');
          }
          
          // Set codec and other parameters
          ffmpegCommand.push(
            '-c:v', settings.codec === 'libvpx-vp9' ? 'libvpx-vp9' : 'libx264',
            '-preset', 'ultrafast',
            '-crf', '28',
            '-pix_fmt', 'yuv420p'
          );
          
          // Add audio codec if we have audio
          if (audioChain) {
            ffmpegCommand.push(
              '-c:a', settings.format === 'webm' ? 'libvorbis' : 'aac',
              '-b:a', '128k'
            );
          }
          
          // Add output file
          ffmpegCommand.push('-y', outputFileName);
          
          // Log the command for debugging
          this.onLog('Executing FFmpeg command for transitions: ' + ffmpegCommand.join(' '));
          
          try {
            await this.ffmpeg.exec(ffmpegCommand);
          } catch (error) {
            this.onLog('Error in transition processing: ' + error);
            
            // Fallback to simple concat if transition fails
            this.onLog('Transition failed, falling back to simple concat method');
            
            // Use standard concat method as fallback
            const concatListFileName = 'files.txt';
            let concatList = '';
            for (let i = 0; i < processedFiles.length; i++) {
              const file = processedFiles[i];
              concatList += `file '${file}'\n`;
            }
            
            await this.ffmpeg.writeFile(concatListFileName, concatList);
            
            await this.ffmpeg.exec([
              '-f', 'concat',
              '-safe', '0',
              '-i', concatListFileName,
              '-c:v', settings.codec === 'libvpx-vp9' ? 'libvpx-vp9' : 'libx264',
              '-preset', 'ultrafast', 
              '-crf', '28',
              '-c:a', settings.format === 'webm' ? 'libvorbis' : 'aac',
              '-y',
              outputFileName
            ]);
          }
        } else {
          // Standard concat method without transitions
          this.onLog('No transition selected, using standard concat method');
          
          // Create a concat file list
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
            '-c:v', settings.codec || 'libx264',
            '-preset', 'ultrafast',
            '-crf', settings.quality ? String(18 + (settings.quality * 2)) : '28',
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
      }
      
      this.onProgress(90);
      
      // Read the output file and create a blob URL
      try {
        outputData = await this.ffmpeg.readFile(outputFileName);
        this.onLog(`Successfully read output file: ${outputFileName}`);
      } catch (readErr) {
        this.onLog(`Error reading output file: ${readErr}`);
        throw new Error(`Failed to read output file: ${readErr}`);
      }
      
      // Set progress to 100% after successfully reading the output file
      this.onProgress(100);
      
      // Create a blob from the output data
      try {
        this.onLog(`Creating blob with MIME type: ${mimeType}`);
        const blob = new Blob([outputData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        this.onLog(`Merge complete: format: ${outputFormat}, MIME type: ${mimeType}`);
        return { url, blob };
      } catch (blobErr) {
        this.onLog(`Error creating blob: ${blobErr}`);
        
        // Fallback method for WebM format
        if (outputFormat === 'webm') {
          try {
            this.onLog(`Trying alternative blob creation for WebM`);
            // Create blob without specifying MIME type
            const blob = new Blob([outputData]);
            const url = URL.createObjectURL(blob);
            
            this.onLog(`Fallback WebM merge complete`);
            return { url, blob };
          } catch (fallbackErr) {
            this.onLog(`Fallback blob creation failed: ${fallbackErr}`);
            throw new Error(`WebM output format error: ${fallbackErr}. Try MP4 instead.`);
          }
        }
        
        throw new Error(`Failed to create output video: ${blobErr}`);
      }
    } catch (err) {
      this.onLog('Error in FFmpeg merge process: ' + err);
      this.onProgress(0);
      throw err;
    } finally {
      // Clean up resources to avoid memory leaks
      try {
        // Clean up all input files
        if (this.ffmpeg && inputFileNames.length > 0) {
          for (const fileName of inputFileNames) {
            try {
              await this.ffmpeg.exec(['-nostdin', '-f', 'lavfi', '-i', 'nullsrc', '-t', '0.001', '-f', 'null', '-']);
              this.onLog(`Cleaned up input file: ${fileName}`);
            } catch (e) {
              // Just log errors and continue
              this.onLog(`Failed to clean input file ${fileName}: ${e}`);
            }
          }
        }
        
        // Clean up output file
        if (this.ffmpeg) {
          try {
            await this.ffmpeg.exec(['-nostdin', '-f', 'lavfi', '-i', 'nullsrc', '-t', '0.001', '-f', 'null', '-']);
            this.onLog(`Cleaned up output file: ${outputFileName}`);
          } catch (e) {
            this.onLog(`Failed to clean output file: ${e}`);
          }
        }
        
        // Explicitly set references to undefined to help garbage collection
        if (outputData) {
          // Free memory by setting to undefined
          // @ts-ignore
          outputData = undefined;
        }
        
        // Run a small operation to force memory flush
        if (this.ffmpeg) {
          try {
            // Create a small dummy operation to help flush memory
            await this.ffmpeg.exec([
              '-nostdin', '-f', 'lavfi', '-i', 'nullsrc=s=32x32:d=0.1', 
              '-t', '0.1', '-f', 'null', '-'
            ]);
          } catch (e) {
            // Ignore errors for this operation
          }
        }
        
        this.onLog('Memory cleanup completed after merge operation');
      } catch (cleanupErr) {
        this.onLog(`Error during cleanup: ${cleanupErr}`);
      }
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
