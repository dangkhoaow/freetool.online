"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Trash2,
  Play,
  Pause,
  Film,
  Scissors,
  Share,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalStorageService } from "@/lib/services/privacy-media-recorder/local-storage-service";
import { RecordedMedia } from "@/lib/services/privacy-media-recorder/media-recorder-service";
import { FFmpegProcessorService, ProcessingOptions } from "@/lib/services/privacy-media-recorder/ffmpeg-processor-service";
import { toast } from "sonner";

// Declare the global window property for TypeScript
declare global {
  interface Window {
    _directRecordings?: Map<string, RecordedMedia>;
  }
}

interface RecordingsListProps {
  localStorageService: LocalStorageService | null;
}

export default function RecordingsList({ localStorageService }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<RecordedMedia[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<RecordedMedia | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    format: "webm",
    trimStart: 0,
    trimEnd: 30,
    resolution: { width: 1280, height: 720 },
  });
  const [trimValues, setTrimValues] = useState<number[]>([0, 100]);
  const [isPlaying, setIsPlaying] = useState(false);
  // Store poster images for video elements (simplified from thumbnails)
  const [posters, setPosters] = useState<{[id: string]: boolean}>({});

  // Initialize FFmpeg processor
  const ffmpegProcessor = new FFmpegProcessorService(
    (progress) => setProcessingProgress(progress),
    (message) => console.log("FFmpeg:", message)
  );

  // Fetch all recordings on component mount
  useEffect(() => {
    loadRecordings();
  }, []);

  // Load recordings from IndexedDB
  const loadRecordings = async () => {
    if (!localStorageService) return;

    try {
      const allRecordings = await localStorageService.getAllRecordings();
      
      // Check for recordings that have directAccessId (in-memory reference)
      const recordingsWithUrls = allRecordings.map(r => {
        // If this recording has a directAccessId, try to get the full recording from memory
        if (r.directAccessId && window._directRecordings?.has(r.directAccessId)) {
          console.log('[LOAD] Found direct memory reference for recording:', r.directAccessId);
          const fullRecording = window._directRecordings.get(r.directAccessId);
          return fullRecording || {
            ...r,
            url: URL.createObjectURL(r.blob)
          };
        }
        
        // Otherwise just create a fresh blob URL for the stored recording
        return {
          ...r,
          url: URL.createObjectURL(r.blob)
        };
      });
      
      setRecordings(recordingsWithUrls);
    } catch (error) {
      console.error("Failed to load recordings:", error);
      toast.error("Failed to load recordings");
    }
  };

  // Delete a recording
  const deleteRecording = async (id: string) => {
    if (!localStorageService) return;

    try {
      await localStorageService.deleteRecording(id);
      toast.success("Recording deleted");
      loadRecordings(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete recording:", error);
      toast.error("Failed to delete recording");
    }
  };

  // Download a recording
  const downloadRecording = (recording: RecordedMedia) => {
    try {
      console.log('[DOWNLOAD] Original recording before download:', {
        name: recording.name,
        size: recording.blob?.size,
        url: recording.url,
        type: recording.type,
        duration: recording.duration
      });
      
      // Create a fresh blob from the recorded media
      // This ensures we're working with the full, in-memory blob
      const a = document.createElement("a");
      a.href = recording.url;
      a.download = recording.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Log the download attempt
      console.log('[DOWNLOAD] Download initiated with size:', recording.blob?.size || 'unknown');
    } catch (error) {
      console.error("Failed to download recording:", error);
      toast.error("Failed to download recording");
    }
  };

  // Open recording in dialog
  const openRecording = (recording: RecordedMedia) => {
    setSelectedRecording(recording);
    setIsDialogOpen(true);
    
    // Set trim values based on recording duration
    setTrimValues([0, 100]);
    setProcessingOptions({
      ...processingOptions,
      trimStart: 0,
      trimEnd: recording.duration,
    });
  };

  // Process recording (convert/trim)
  const processRecording = async () => {
    if (!selectedRecording || !localStorageService) return;

    try {
      setIsProcessing(true);
      
      // Calculate trim points
      const start = Math.max(0, selectedRecording.duration * trimValues[0] / 100);
      const end = Math.min(selectedRecording.duration, selectedRecording.duration * trimValues[1] / 100);
      
      // Log original blob size before processing
      console.log('[PROCESS] Original recording:', {
        name: selectedRecording.name,
        size: selectedRecording.blob?.size,
        url: selectedRecording.url,
        type: selectedRecording.type,
        duration: selectedRecording.duration
      });

      // Process recording
      const processedRecording = await ffmpegProcessor.processRecording(
        selectedRecording,
        {
          ...processingOptions,
          trimStart: start,
          trimEnd: end,
        }
      );

      // Log processed blob size after processing
      console.log('[PROCESS] Processed recording:', {
        name: processedRecording.name,
        size: processedRecording.blob?.size,
        url: processedRecording.url,
        type: processedRecording.type,
        duration: processedRecording.duration
      });

      // Log before saving
      console.log('[SAVE] Saving processed recording:', {
        name: processedRecording.name,
        size: processedRecording.blob?.size,
        type: processedRecording.type,
        duration: processedRecording.duration
      });

      // Save processed recording
      await localStorageService.saveRecording(processedRecording);
      
      toast.success("Recording processed successfully");
      setIsDialogOpen(false);
      loadRecordings(); // Refresh the list
    } catch (error) {
      console.error("Failed to process recording:", error);
      toast.error("Failed to process recording");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Share recording
  const shareRecording = async () => {
    if (!selectedRecording) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedRecording.name,
          text: "Check out my recording!",
          files: [new File([selectedRecording.blob], selectedRecording.name, { type: selectedRecording.type })]
        });
      } else {
        // Fallback to copy URL
        copyShareURL();
      }
    } catch (error) {
      console.error("Failed to share recording:", error);
      // Fallback to copy URL on error
      copyShareURL();
    }
  };

  // Copy share URL
  const copyShareURL = () => {
    if (!selectedRecording) return;
    
    try {
      // Create a temporary URL for the recording
      const url = URL.createObjectURL(selectedRecording.blob);
      setShareUrl(url);
      
      navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    }
  };
  
  // Format bytes to human readable size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-4">
      {recordings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((recording) => (
            <Card
              key={recording.id}
              className="overflow-hidden border border-gray-200 hover:border-purple-300 dark:border-gray-800 dark:hover:border-purple-700 transition-colors"
            >
              <div className="relative aspect-video bg-gray-900">
                {recording.type.includes("video") ? (
                  <video
                    src={recording.url}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => openRecording(recording)}
                    // Don't autoplay in the list to save resources
                    preload="metadata"
                    muted
                    // Add onLoadedMetadata to handle when video is ready
                    onLoadedMetadata={(e) => {
                      // Set the current time to 2 seconds (or end if shorter) to show a better thumbnail
                      const video = e.currentTarget;
                      const seekTime = Math.min(2, recording.duration);
                      
                      // Only seek if we haven't already done so for this recording
                      if (!posters[recording.id]) {
                        console.log(`[VIDEO] Setting seek time to ${seekTime}s for recording ${recording.id}`);
                        video.currentTime = seekTime;
                        
                        // Mark this video as having its poster set
                        setPosters(prev => ({
                          ...prev, 
                          [recording.id]: true
                        }));
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(recording.duration)}
                </div>
              </div>
              
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium truncate" title={recording.name}>
                    {recording.name.length > 25
                      ? recording.name.substring(0, 25) + "..."
                      : recording.name}
                  </h3>
                  <span className="text-xs text-gray-500">{formatSize(recording.size)}</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  {formatDate(recording.timestamp)}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => openRecording(recording)}
                    title="Play"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => downloadRecording(recording)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={() => deleteRecording(recording.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <Film className="h-16 w-16 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No recordings yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your recordings will appear here after you record them
          </p>
        </div>
      )}

      {/* Recording Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRecording?.name}
            </DialogTitle>
            <DialogDescription style={{ display: "none" }}>
              View, edit, and export your recording
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative aspect-video bg-gray-900 rounded overflow-hidden">
            {selectedRecording && (
              <video
                src={selectedRecording.url}
                controls
                autoPlay
                className="w-full h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            )}
          </div>
          
          <Tabs style={{ display: "none" }} defaultValue="process">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="process">
                <Scissors className="h-4 w-4 mr-2" />
                Edit & Export
              </TabsTrigger>
              <TabsTrigger value="share">
                <Share className="h-4 w-4 mr-2" />
                Share
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Trim Video</Label>
                  <span className="text-xs text-gray-500">
                    {formatDuration(Math.floor(selectedRecording?.duration || 0 * trimValues[0] / 100))} - 
                    {formatDuration(Math.floor(selectedRecording?.duration || 0 * trimValues[1] / 100))}
                  </span>
                </div>
                <Slider
                  value={trimValues}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={setTrimValues}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Output Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={processingOptions.format === "webm" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProcessingOptions(prev => ({ ...prev, format: "webm" }))}
                    className={
                      processingOptions.format === "webm"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                    disabled={isProcessing}
                  >
                    WebM
                  </Button>
                  <Button
                    variant={processingOptions.format === "mp4" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProcessingOptions(prev => ({ ...prev, format: "mp4" }))}
                    className={
                      processingOptions.format === "mp4"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                    disabled={isProcessing}
                  >
                    MP4
                  </Button>
                  <Button
                    variant={processingOptions.format === "gif" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProcessingOptions(prev => ({ ...prev, format: "gif" }))}
                    className={
                      processingOptions.format === "gif"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                    disabled={isProcessing}
                  >
                    GIF
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Resolution</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={
                      processingOptions.resolution?.width === 640 ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setProcessingOptions(prev => ({
                        ...prev,
                        resolution: { width: 640, height: 360 }
                      }))
                    }
                    className={
                      processingOptions.resolution?.width === 640
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                    disabled={isProcessing}
                  >
                    360p
                  </Button>
                  <Button
                    variant={
                      processingOptions.resolution?.width === 1280 ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setProcessingOptions(prev => ({
                        ...prev,
                        resolution: { width: 1280, height: 720 }
                      }))
                    }
                    className={
                      processingOptions.resolution?.width === 1280
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                    disabled={isProcessing}
                  >
                    720p
                  </Button>
                  <Button
                    variant={
                      processingOptions.resolution?.width === 1920 ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setProcessingOptions(prev => ({
                        ...prev,
                        resolution: { width: 1920, height: 1080 }
                      }))
                    }
                    className={
                      processingOptions.resolution?.width === 1920
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                    disabled={isProcessing}
                  >
                    1080p
                  </Button>
                </div>
              </div>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Processing...</Label>
                    <span className="text-xs">{processingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <Button
                className="w-full gap-2"
                onClick={processRecording}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Process & Save"}
              </Button>
            </TabsContent>
            
            <TabsContent value="share" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Share Options</Label>
                <div className="grid gap-2">
                  <Button
                    variant="default"
                    onClick={shareRecording}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Share className="h-4 w-4" />
                    Share Recording
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={copyShareURL}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => downloadRecording(selectedRecording!)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              </div>
              
              {shareUrl && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-between">
                  <div className="text-sm truncate">{shareUrl}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyShareURL}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter style={{ display: "none" }}>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
