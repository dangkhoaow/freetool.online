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
          const [width, height] = settings.resolution.split('x').map(Number);
          if (width * height > MAX_SAFE_WEBM_RESOLUTION) {
            throw new Error('WebM/VP9 conversion is limited to 480p (854x480) or lower for browser stability.');
          }
        }
        // Lower default bitrate for VP9
        if (!settings.quality) settings.quality = 4;
      }

      // Check for high output resolution (default: 720p max)
      const MAX_SAFE_RESOLUTION = 1280 * 720; // 720p
      if (settings.resolution && settings.resolution !== 'original') {
        const [width, height] = settings.resolution.split('x').map(Number);
        if (width * height > MAX_SAFE_RESOLUTION) {
          throw new Error('Output resolution is too high for in-browser conversion. Please select 720p or lower.');
        }
      }

      // Warn about memory-intensive codecs
      if (settings.codec === 'libvpx-vp9' || settings.codec === 'libaom-av1') {
        this.onLog('Warning: VP9/AV1 codecs are memory-intensive and may fail in-browser. Use H.264 for best results.');
      }
      
      // Write the input file to the FFmpeg virtual file system
      const inputFileName = 'input.' + file.name.split('.').pop();
      const fileData = await fetchFile(file);
      const fileDataArray = await this.convertToUint8Array(fileData);
      
      await this.ffmpeg.writeFile(inputFileName, fileDataArray);
      this.onLog(`Successfully wrote input file to FFmpeg filesystem`);
      
      // Map format/codec to extension and mime type
      let outputExtension = 'mp4';
      let mimeType = 'video/mp4';
      if (settings.format === 'mov' || settings.format === 'quicktime') {
        outputExtension = 'mov';
        mimeType = 'video/quicktime';
      } else if (settings.format === 'mp4') {
        outputExtension = 'mp4';
        mimeType = 'video/mp4';
      } else if (settings.format === 'webm') {
        outputExtension = 'webm';
        mimeType = 'video/webm';
      }

      // Output file name
      const outputFileName = `output.${outputExtension}`;

      // Ensure valid audio codec for WebM
      if (outputExtension === 'webm') {
        settings.audioCodec = 'libvorbis'; // Or 'libopus' if preferred
        if (!settings.audioBitrate || settings.audioBitrate < 32) settings.audioBitrate = 128;
      }
      
      // Build FFmpeg arguments based on settings
      const ffmpegArgs = ['-i', inputFileName];
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
      if (outputExtension === 'mp4') {
        ffmpegArgs.push('-movflags', '+faststart');
      }
      
      // Output file
      ffmpegArgs.push(outputFileName);
      
      this.onLog(`Running FFmpeg command with args: ${ffmpegArgs.join(' ')}`);
      
      // Execute the FFmpeg command
      try {
        await this.ffmpeg.exec(ffmpegArgs);
      } catch (ffmpegErr) {
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
      
      // Read the output file
      const outputData = await this.ffmpeg.readFile(outputFileName);
      
      // Create a blob and URL from the output data
      const blob = new Blob([outputData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      this.onLog(`Conversion complete: ${outputFileName}`);
      
      return { url, blob };
    } catch (err) {
      this.onLog(`Error in video conversion: ${err}`);
      throw err;
    }
  }
}
