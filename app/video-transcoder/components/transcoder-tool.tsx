"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { UploadCloud, Settings as SettingsIcon, Cog, Check, AlertTriangle } from "lucide-react"
import UploadSection from "./upload-section"
import SettingsSection from "./settings-section"
import ProcessingSection from "./processing-section"
import OutputSection from "./output-section"

// Import service classes
import { 
  VideoSettings,
  MergeClip,
  ProcessingResult
} from "@/lib/services/ffmpeg-transcoder-types"
import { FFmpegTranscoderConvertService } from "@/lib/services/ffmpeg-transcoder-convert-service"
import { FFmpegTranscoderTrimService } from "@/lib/services/ffmpeg-transcoder-trim-service"
import { FFmpegTranscoderSplitService } from "@/lib/services/ffmpeg-transcoder-split-service"
import { FFmpegTranscoderMergeService } from "@/lib/services/ffmpeg-transcoder-merge-service"

// Define component
export default function TranscoderTool() {
  // State for managing the conversion flow
  const [activeTab, setActiveTab] = useState("upload")
  const [files, setFiles] = useState<File[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<any>(null)
  const [settings, setSettings] = useState<VideoSettings>({
    format: 'mp4',
    codec: 'libx264',
    quality: 23,
    resolution: 'original',
    frameRate: null,
    audioCodec: 'aac',
    audioBitrate: 128,
    task: 'convert',
    startTime: 0,
    endTime: null,
    splitPoints: [],
    mergeClips: [],
    transition: 'none'
  })
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [segments, setSegments] = useState<ProcessingResult[]>([])
  const [processingStats, setProcessingStats] = useState<{
    speed: number | null;
    fps: number | null;
    size: string | null;
    time: string | null;
    bitrate: string | null;
  }>({
    speed: null,
    fps: null,
    size: null,
    time: null,
    bitrate: null
  })
  
  // Parse FFmpeg log to extract processing stats
  const parseFFmpegLog = (message: string) => {
    // Try to match the FFmpeg progress line
    // Example: frame=  161 fps=2.3 q=29.0 size=1792kB time=00:00:06.31 bitrate=2324.4kbits/s speed=0.0895x
    const progressMatch = message.match(/frame=\s*(\d+)\s+fps=\s*([\d.]+).*?size=\s*(\S+).*?time=\s*(\S+).*?bitrate=\s*([\d.]+\S+).*?speed=\s*([\d.]+)x/);
    
    if (progressMatch) {
      const [, , fps, size, time, bitrate, speed] = progressMatch;
      console.log(`FFmpeg processing stats: speed=${speed}x, fps=${fps}, size=${size}, time=${time}, bitrate=${bitrate}`);
      
      setProcessingStats({
        speed: parseFloat(speed),
        fps: parseFloat(fps),
        size: size,
        time: time,
        bitrate: bitrate
      });
    }
  }

  // Service instances
  const [convertService] = useState(() => 
    new FFmpegTranscoderConvertService(
      progress => setProgress(progress),
      message => {
        console.log(message);
        parseFFmpegLog(message);
      }
    )
  )
  
  const [trimService] = useState(() => 
    new FFmpegTranscoderTrimService(
      progress => setProgress(progress),
      message => {
        console.log(message);
        parseFFmpegLog(message);
      }
    )
  )
  
  const [splitService] = useState(() => 
    new FFmpegTranscoderSplitService(
      progress => setProgress(progress),
      message => {
        console.log(message);
        parseFFmpegLog(message);
      }
    )
  )
  
  const [mergeService] = useState(() => 
    new FFmpegTranscoderMergeService(
      progress => setProgress(progress),
      message => {
        console.log(message);
        parseFFmpegLog(message);
      }
    )
  )

  // Handle clean up URLs when unmounting
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      
      // Clean up services
      convertService.destroy();
      trimService.destroy();
      splitService.destroy();
      mergeService.destroy();
    }
  }, [videoUrl, outputUrl, convertService, trimService, splitService, mergeService])

  // Debug logging for critical states
  useEffect(() => {
    console.log('Current task:', settings.task);
    console.log('Merge clips count:', settings.mergeClips.length);
  }, [settings.task, settings.mergeClips.length]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFiles([file])
      
      // Create URL for the video
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      
      // Also add this as the first merge clip if there are no clips yet
      addMainVideoToMergeClips(file, url);

      // Reset settings if changing files
      setSettings(prev => ({
        ...prev,
        startTime: 0,
        endTime: null,
        splitPoints: [],
        task: 'convert'
      }))

      // Get video metadata
      const video = document.createElement("video")
      video.onloadedmetadata = () => {
        setVideoMetadata({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        })

        setSettings(prev => ({
          ...prev,
          endTime: video.duration
        }))
      }
      video.src = url
    }
  }

  // Add the main uploaded video to merge clips
  const addMainVideoToMergeClips = (file: File, url: string) => {
    console.log('Adding main video to merge clips:', file.name);
    
    // Clear previous merge clips when adding a new main video
    setSettings(prev => ({
      ...prev,
      mergeClips: []
    }));
    
    // Get video duration
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      const duration = video.duration;
      console.log(`Main video metadata loaded. Duration: ${duration}s`, file.name);
      
      // Create merge clip for main video
      const mainClip: MergeClip = {
        id: `main-clip-${Date.now()}`,
        file,
        name: file.name,
        duration,
        startTrim: 0,
        endTrim: duration,
        position: 0,
        color: 'blue'
      };
      
      console.log('Created main video clip:', mainClip);
      
      // Add to clips array
      setSettings(prev => ({
        ...prev,
        mergeClips: [mainClip]
      }));
      console.log('Added main video to merge clips array');
    };
    video.src = url;
  }

  // Add video to merge
  const addVideoToMerge = async (file: File) => {
    console.log('Adding video to merge:', file.name);
    
    // Create URL for the video
    const url = URL.createObjectURL(file);
    
    // Get video duration
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      const duration = video.duration;
      console.log(`Video metadata loaded. Duration: ${duration}s`, file.name);
      
      // Create merge clip for the video
      const newClip: MergeClip = {
        id: `clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        file,
        name: file.name,
        duration,
        startTrim: 0,
        endTrim: duration,
        position: settings.mergeClips.length, // Add to the end
        color: 'green'
      };
      
      console.log('Created new merge clip:', newClip);
      
      // Add to clips array
      setSettings(prev => ({
        ...prev,
        mergeClips: [...prev.mergeClips, newClip]
      }));
      console.log('Updated merge clips array, new count:', settings.mergeClips.length + 1);
    };
    video.src = url;
  };

  // Update merge clip
  const updateMergeClip = (clipId: string, updates: Partial<MergeClip>) => {
    setSettings(prev => {
      const updatedClips = prev.mergeClips.map(clip => 
        clip.id === clipId ? { ...clip, ...updates } : clip
      );
      return { ...prev, mergeClips: updatedClips };
    });
  };

  // Remove merge clip
  const removeMergeClip = (clipId: string) => {
    setSettings(prev => {
      const filteredClips = prev.mergeClips.filter(clip => clip.id !== clipId);
      
      // Reorder positions
      const reorderedClips = filteredClips.map((clip, index) => ({
        ...clip,
        position: index
      }));
      
      return { ...prev, mergeClips: reorderedClips };
    });
  };

  // Start processing the video
  const startProcessing = async () => {
    if (files.length === 0) {
      setError('No file selected');
      return;
    }

    try {
      setProcessingStatus('processing');
      setProgress(0);
      setError(null);
      setOutputUrl(null);
      setOutputBlob(null);
      setSegments([]);
      setProcessingStats({
        speed: null,
        fps: null,
        size: null,
        time: null,
        bitrate: null
      });

      console.log('Starting processing task:', settings.task);

      let result: ProcessingResult | null = null;

      switch (settings.task) {
        case 'convert':
          result = await convertService.convertVideo(files[0], settings);
          break;
          
        case 'trim':
          result = await trimService.trimVideo(files[0], settings);
          break;
          
        case 'split':
          const splitResult = await splitService.splitVideo(files[0], settings);
          setSegments(splitResult.segments);
          // Use first segment as primary result
          result = splitResult.segments[0];
          break;
          
        case 'merge':
          console.log('Processing merge task with clips:', settings.mergeClips);
          console.log('Using transition:', settings.transition);
          result = await mergeService.mergeVideos(settings.mergeClips, settings.transition);
          break;
      }

      if (result) {
        setOutputUrl(result.url);
        setOutputBlob(result.blob);
        setProcessingStatus('complete');
        setActiveTab('output');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(`Processing failed: ${err instanceof Error ? err.message : String(err)}`);
      setProcessingStatus('error');
    }
  };

  // Update settings from controls
  const updateSettings = (newSettings: Partial<VideoSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="upload">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="relative"
            id="settings-tab"
            disabled={files.length === 0 || processingStatus === 'processing'}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="processing"
            disabled={files.length === 0 || processingStatus === 'processing'}
          >
            <Cog className="mr-2 h-4 w-4" />
            Processing
          </TabsTrigger>
          <TabsTrigger 
            value="output"
            disabled={processingStatus !== 'complete' && processingStatus !== 'error'}
          >
            <Check className="mr-2 h-4 w-4" />
            Output
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <UploadSection
            onFileSelect={handleFileSelect}
            videoUrl={videoUrl}
            videoMetadata={videoMetadata}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsSection
            settings={settings}
            videoMetadata={videoMetadata}
            onUpdateSettings={updateSettings}
            onAddVideoToMerge={addVideoToMerge}
            onUpdateMergeClip={updateMergeClip}
            onRemoveMergeClip={removeMergeClip}
            onStartProcessing={() => {
              startProcessing();
              setActiveTab('processing');
            }}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="processing">
          <ProcessingSection
            processingStatus={processingStatus}
            progress={progress}
            error={error}
            processingStats={processingStats}
            onRetry={() => {
              setProcessingStatus('idle');
              setProgress(0);
              setError(null);
            }}
            onViewOutput={() => setActiveTab('output')}
          />
        </TabsContent>

        <TabsContent value="output">
          <OutputSection 
            videoUrl={outputUrl} 
            segments={segments}
            videoBlob={outputBlob}
            task={settings.task}
            onBackToSettings={() => setActiveTab('settings')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
