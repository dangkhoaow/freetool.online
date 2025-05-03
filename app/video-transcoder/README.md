# Video Transcoder Tool

A powerful in-browser video processing tool that leverages WebAssembly-based FFmpeg to provide professional-grade video conversion, trimming, splitting, and merging capabilities.

## Features

- **Conversion**: Change video format, codec, quality, resolution, and framerate
- **Trimming**: Cut videos at specific timestamps
- **Splitting**: Divide videos into multiple segments
- **Merging**: Combine multiple videos with transition effects
- **Performance Modes**: Balance between speed and quality
- **Memory-Conscious Design**: Optimized for browser environment limitations

## Architecture

The Video Transcoder is built with a modular architecture consisting of:

### Core Components

1. **Service Layer**:
   - `FFmpegTranscoderBaseService`: Base class with common functionality
   - `FFmpegTranscoderConvertService`: Handles video format/codec conversion
   - `FFmpegTranscoderTrimService`: Handles video trimming
   - `FFmpegTranscoderSplitService`: Handles video splitting
   - `FFmpegTranscoderMergeService`: Handles video merging with transitions

2. **UI Components**:
   - `TranscoderTool`: Main orchestrator component
   - `UploadSection`: Handles file uploads and drag-and-drop
   - `SettingsSection`: Provides configuration interface for all operations
   - `OutputSection`: Displays and manages processing results

### Technical Implementation

The tool uses:
- WebAssembly-based FFmpeg for video processing
- React for the UI components
- TypeScript for type safety
- Next.js as the application framework

## Memory Management

Browser-based video processing is constrained by memory limitations. The tool implements several strategies to manage memory efficiently:

1. **Explicit Resource Cleanup**: All resources are properly cleaned up after processing
2. **Memory Usage Monitoring**: Tracking memory usage at different stages
3. **Format-Specific Optimizations**: Special handling for memory-intensive formats like WebM/VP9
4. **Progressive Processing**: Breaking down operations to minimize memory pressure

## WebM/VP9 Format Handling

WebM with VP9 codec is particularly memory-intensive for in-browser processing. The tool implements:

1. **Specialized WebM Handler**: A dedicated method for safer WebM conversion
2. **Codec Fallbacks**: Uses more stable libvpx instead of libvpx-vp9 when needed
3. **Comprehensive Error Handling**: Robust error detection and recovery
4. **User Warnings**: Notifies users about potential memory limitations

## Known Technical Challenges

1. **Browser Memory Limits**: Large videos (>1080p) may exceed browser memory limits, especially with VP9/AV1 codecs
2. **WebM Format Complexity**: WebM/VP9 encoding is particularly resource-intensive
3. **Performance Variations**: Performance can vary across browsers and devices

## Debugging

The tool includes extensive debugging capabilities:

1. **Memory Metrics**: Logs memory usage at each critical stage of processing
2. **Detailed Error Reporting**: Comprehensive error logging for easier debugging
3. **Safe Type Handling**: Prevents common errors like the "startsWith" undefined error

## Best Practices for Users

1. **Format Selection**: Use MP4/H.264 for best browser compatibility and performance
2. **Resolution Limits**: Keep resolution at 720p or lower for optimal browser performance
3. **Performance Mode**: Use "Max Performance" for faster processing with large files
4. **Transition Effects**: Keep transition durations short (0.5-1.0s) for better performance

## Technical Debt and Future Improvements

1. **Chunked Processing**: Implement chunk-based processing for very large files
2. **Worker Threads**: Move processing to dedicated web workers for UI responsiveness
3. **Quality Presets**: Provide simplified presets for common use cases
4. **Progressive Enhancement**: Add fallbacks for browsers without WebAssembly support

## Common Issues and Solutions

### Memory-Related Errors

- **Symptom**: "Out of memory" or browser tab crashes
- **Solution**: Reduce video resolution, use MP4 format, or process in smaller segments

### WebM Conversion Issues

- **Symptom**: "Cannot read properties of undefined (reading 'startsWith')"
- **Solution**: The specialized WebM handler should now handle this automatically. If issues persist, try MP4 format.

### Performance Issues

- **Symptom**: Slow processing or browser freezing
- **Solution**: Enable "Max Performance" mode, reduce resolution, or use a more efficient codec like H.264

## Implementation Details

### Critical Components

1. **FFmpeg Initialization**:
   ```typescript
   // Initialize FFmpeg with proper configuration
   protected async initialize(): Promise<void> {
     if (!this.ffmpeg) {
       this.ffmpeg = new FFmpeg();
       // Load FFmpeg with threading for better performance
       const config: ExtendedFFmpegLoadConfig = {
         coreURL: '/ffmpeg-core.js',
         wasmURL: '/ffmpeg-core.wasm',
         workerURL: '/ffmpeg-worker.js',
         threading: true
       };
       await this.ffmpeg.load(config);
       this.ffmpegLoaded = true;
     }
   }
   ```

2. **WebM Safe Handling**:
   ```typescript
   // Specialized WebM handler for safer conversion
   private async handleWebMConversion(inputFile: string, outputSettings: any): Promise<ProcessingResult> {
     // Uses more stable libvpx instead of libvpx-vp9
     const args = [
       '-i', inputFile,
       '-c:v', 'libvpx',
       '-b:v', '1000k',
       '-c:a', 'libvorbis',
       '-b:a', '128k',
       'safer_output.webm'
     ];
     
     // Execute with robust error handling
     // ...
   }
   ```

3. **Memory Monitoring**:
   ```typescript
   private logMemoryUsage(stage: string) {
     if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
       const memoryInfo = window.performance.memory;
       this.onLog(`MEMORY [${stage}] - Used JS Heap: ${Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024))}MB / ${Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024))}MB (${Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100)}%)`);
     }
   }
   ```

## Performance Considerations

For optimal performance, the tool:
1. Uses WebAssembly for near-native processing speed
2. Implements multi-threading when available
3. Provides performance mode options to prioritize speed
4. Uses efficient codecs by default (H.264)
5. Implements proper cleanup to avoid memory leaks

## Dependencies

- `@ffmpeg/ffmpeg`: WebAssembly-based FFmpeg implementation
- `@ffmpeg/util`: Utilities for FFmpeg integration
- Next.js and React for the UI framework
- TypeScript for type safety

## Maintenance Notes

When updating the tool, be careful with:
1. **FFmpeg Version**: Ensure compatibility with browser WebAssembly
2. **Memory Management**: Always test with WebM/VP9 which is most demanding
3. **Error Handling**: Maintain robust error handling for all asynchronous operations
4. **Browser Compatibility**: Test across multiple browsers (Chrome, Firefox, Safari)
