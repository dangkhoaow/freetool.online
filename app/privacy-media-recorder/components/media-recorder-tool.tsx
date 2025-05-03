"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceSelectionPanel from "./device-selection-panel";
import RecordingControls from "./recording-controls";
import RecordingsList from "./recordings-list";
import OptionsPanel from "./options-panel";
import { MediaRecorderService, MediaDevice, RecordedMedia, RecordingOptions } from "@/lib/services/privacy-media-recorder/media-recorder-service";
import { RecordingManagerService } from "@/lib/services/privacy-media-recorder/recording-manager-service";
import { LocalStorageService } from "@/lib/services/privacy-media-recorder/local-storage-service";
import { PrivacyProtectionService } from "@/lib/services/privacy-media-recorder/privacy-protection-service";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Settings, Video, Mic, Camera } from "lucide-react";

// Maximum storage size in MB for saved recordings
const maxStorageSizeMB = 500;

export default function MediaRecorderTool() {
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState({
    videoDeviceId: "",
    audioDeviceId: "",
  });
  const [availableDevices, setAvailableDevices] = useState<{
    videoinput: MediaDevice[];
    audioinput: MediaDevice[];
  }>({
    videoinput: [],
    audioinput: [],
  });
  const [allRecordedChunks, setAllRecordedChunks] = useState<Blob[]>([]);
  const [recordingsList, setRecordingsList] = useState<RecordedMedia[]>([]);
  const [recordingSegments, setRecordingSegments] = useState<{ 
    id: string; 
    startTime: number; 
    isFlipped: boolean;
    chunks: Blob[];
  }[]>([]);
  
  // Define the concrete type that matches the options panel component props
  type ConcreteRecordingOptions = {
    video: boolean;
    audio: boolean;
    screen: boolean;
    resolution: { width: number; height: number };
    frameRate: number;
    mimeType: string;
  };
  
  // Use the concrete type for state
  const [recordingOptions, setRecordingOptions] = useState<ConcreteRecordingOptions>({
    video: true,
    audio: true,
    screen: false,
    resolution: {
      width: 1280,
      height: 720
    },
    frameRate: 30,
    mimeType: 'video/webm'
  });
  const [privacyOptions, setPrivacyOptions] = useState({
    faceBlur: false,
    blurIntensity: 5,
    stripMetadata: true,
  });
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderServiceRef = useRef<MediaRecorderService | null>(null);
  const recordingManagerRef = useRef<RecordingManagerService | null>(null);
  const localStorageRef = useRef<LocalStorageService | null>(null);
  const privacyServiceRef = useRef<PrivacyProtectionService | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentSegmentRef = useRef<string | null>(null);

  // Store all recording segments in a ref to avoid state update issues
  const recordingSegmentsRef = useRef<{
    id: string;
    startTime: number;
    isFlipped: boolean;
    chunks: Blob[];
  }[]>([]);

  // Component mount and cleanup
  useEffect(() => {
    mediaRecorderServiceRef.current = new MediaRecorderService();
    recordingManagerRef.current = new RecordingManagerService();
    localStorageRef.current = new LocalStorageService();
    privacyServiceRef.current = new PrivacyProtectionService();

    console.log('[INIT] Media recorder initialized');

    // Initialize segments ref
    recordingSegmentsRef.current = [];

    // Initialize LocalStorage
    localStorageRef.current.initialize().catch((error) => {
      console.error("Failed to initialize storage:", error);
      toast.error("Failed to initialize local storage");
    });

    // Initialize Privacy Service
    privacyServiceRef.current.initialize().catch((error) => {
      console.error("Failed to initialize privacy service:", error);
    });

    // Set up recording state change callback
    recordingManagerRef.current.setCallbacks(
      (state) => {
        setIsRecording(state.isRecording);
        setIsPaused(state.isPaused);
        setRecordingDuration(state.duration);

        // When new chunks are added, store them in our global chunks array and current segment
        if (state.recordedChunks.length > 0) {
          console.log(`[RECORDING] Received ${state.recordedChunks.length} new chunks`);
          
          // Add to all chunks array
          setAllRecordedChunks((prevChunks) => {
            const newChunks = [...prevChunks, ...state.recordedChunks];
            console.log(`[RECORDING] All chunks count: ${newChunks.length}`);
            return newChunks;
          });
          
          // Add to current segment if we have one
          if (currentSegmentRef.current) {
            const segmentId = currentSegmentRef.current;
            
            // Update the current segment with new chunks
            setRecordingSegments(prevSegments => {
              return prevSegments.map(segment => {
                if (segment.id === segmentId) {
                  // Get the count of chunks we already have in this segment
                  const existingChunkCount = segment.chunks.length;
                  
                  // Get only the new chunks that belong to this segment
                  const newChunks = [...segment.chunks, ...state.recordedChunks];
                  
                  console.log(`[RECORDING] Added ${state.recordedChunks.length} chunks to segment ${segmentId}, now has ${newChunks.length} chunks`);
                  
                  // Also update the ref for safety
                  const updatedSegment = {
                    ...segment,
                    chunks: newChunks
                  };
                  
                  // Update the ref manually (since setState might not be immediate)
                  const segmentIndex = recordingSegmentsRef.current.findIndex(s => s.id === segmentId);
                  if (segmentIndex !== -1) {
                    recordingSegmentsRef.current[segmentIndex] = updatedSegment;
                    console.log(`[RECORDING_REF] Updated segment ${segmentId}, now has ${newChunks.length} chunks`);
                  }
                  
                  return updatedSegment;
                }
                return segment;
              });
            });
          }
        }
      },
      (error) => {
        toast.error(`Recording error: ${error.message}`);
      },
      (blob) => {
        // Handle data chunks if needed - we're collecting them via the state callback
      }
    );

    // Load recordings without requesting permissions
    loadDevicesWithoutPermissions();

    // Clean up on unmount - VERY IMPORTANT to stop all tracks
    return () => {
      console.log('[CLEANUP] Component unmounting, cleaning up all resources');
      cleanupMediaStream();
      if (recordingManagerRef.current) {
        recordingManagerRef.current.cleanup();
      }
    };
  }, []);

  // Effect to monitor tab changes and handle camera resources
  useEffect(() => {
    console.log(`[TAB_CHANGE] Active tab changed to: ${activeTab}`);

    // When leaving the recording tab, stop all streams
    if (activeTab !== "record") {
      console.log('[TAB_CHANGE] Not on recording tab, stopping all streams');
      cleanupMediaStream();
    }
  }, [activeTab]);

  // Explicit function to cleanup media stream resources
  const cleanupMediaStream = () => {
    console.log('[CLEANUP] Stopping all tracks in media stream');

    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      console.log(`[CLEANUP] Stopping ${tracks.length} tracks`);

      tracks.forEach((track) => {
        console.log(`[CLEANUP] Stopping track: ${track.kind} (${track.id}), enabled: ${track.enabled}, readyState: ${track.readyState}`);
        track.stop();
      });

      mediaStreamRef.current = null;
    } else {
      console.log('[CLEANUP] No media stream to clean up');
    }

    // Also check for any existing video stream
    if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
      console.log('[CLEANUP] Clearing video preview srcObject');

      // Get and stop tracks from the video element directly
      const videoStream = videoPreviewRef.current.srcObject as MediaStream;
      if (videoStream) {
        const videoTracks = videoStream.getTracks();
        console.log(`[CLEANUP] Stopping ${videoTracks.length} tracks from video element`);

        videoTracks.forEach((track) => {
          console.log(`[CLEANUP] Stopping video track: ${track.kind} (${track.id})`);
          track.stop();
        });
      }

      videoPreviewRef.current.srcObject = null;
    }

    // Update camera active state
    setIsCameraActive(false);
  };

  // Fetch available devices without requesting permissions
  const loadDevicesWithoutPermissions = async () => {
    try {
      if (!mediaRecorderServiceRef.current) return;

      // Just enumerate devices without requesting permissions
      // This will only show labels for devices that have been previously allowed
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoinput = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
          groupId: device.groupId,
        }));

      const audioinput = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          groupId: device.groupId,
        }));

      setAvailableDevices({ videoinput, audioinput });

      // Auto-select first devices if none selected
      if (!selectedDevices.videoDeviceId && videoinput.length > 0) {
        setSelectedDevices((prev) => ({
          ...prev,
          videoDeviceId: videoinput[0].deviceId,
        }));
      }

      if (!selectedDevices.audioDeviceId && audioinput.length > 0) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioDeviceId: audioinput[0].deviceId,
        }));
      }
    } catch (error) {
      console.error("Failed to enumerate devices:", error);
    }
  };

  // Fetch available devices with permissions
  const loadDevices = async () => {
    try {
      if (!mediaRecorderServiceRef.current) return;

      const devices = await mediaRecorderServiceRef.current.getAvailableDevices();
      setAvailableDevices(devices);

      // Auto-select first devices if none selected
      if (!selectedDevices.videoDeviceId && devices.videoinput.length > 0) {
        setSelectedDevices((prev) => ({
          ...prev,
          videoDeviceId: devices.videoinput[0].deviceId,
        }));
      }

      if (!selectedDevices.audioDeviceId && devices.audioinput.length > 0) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioDeviceId: devices.audioinput[0].deviceId,
        }));
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
      toast.error("Failed to detect media devices");
    }
  };

  // Start preview
  const startPreview = async () => {
    try {
      if (!mediaRecorderServiceRef.current) return;

      // Stop any existing stream first to be safe
      cleanupMediaStream();

      console.log('[PREVIEW] Starting new capture for preview');

      // Start new capture based on options
      const stream = await mediaRecorderServiceRef.current.startCapture(
        recordingOptions,
        selectedDevices.videoDeviceId,
        selectedDevices.audioDeviceId
      );

      console.log(`[PREVIEW] Capture created with ${stream.getTracks().length} tracks`);
      stream.getTracks().forEach((track) => {
        console.log(`[PREVIEW] Track added: ${track.kind} (${track.id}), enabled: ${track.enabled}`);
      });

      // Process stream if privacy options enabled
      if (privacyOptions.faceBlur && privacyServiceRef.current) {
        mediaStreamRef.current = await privacyServiceRef.current.processMediaStream(
          stream,
          privacyOptions
        );
      } else {
        mediaStreamRef.current = stream;
      }

      // Display in video preview
      if (videoPreviewRef.current && mediaStreamRef.current) {
        console.log('[PREVIEW] Setting video preview srcObject');
        videoPreviewRef.current.srcObject = mediaStreamRef.current;
        // Apply horizontal flip if enabled
        videoPreviewRef.current.style.transform = isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
      }

      // Update camera active state
      setIsCameraActive(true);
    } catch (error) {
      console.error("[PREVIEW] Failed to start preview:", error);
      toast.error("Failed to access media devices");
      setIsCameraActive(false);
    }
  };

  // Create a flipped stream for recording with explicit flip parameter
  const createProcessedStreamWithFlip = (originalStream: MediaStream): MediaStream => {
    console.log('[STREAM_PROCESS] Creating flipped stream for recording');

    // Get video track settings to set up canvas
    const videoTrack = originalStream.getVideoTracks()[0];
    if (!videoTrack) {
      console.log('[STREAM_PROCESS] No video track found, returning original stream');
      return originalStream;
    }

    const settings = videoTrack.getSettings();
    const width = settings.width || 1280;
    const height = settings.height || 720;

    console.log(`[STREAM_PROCESS] Creating canvas for flipped stream: ${width}x${height}`);

    // Create canvas and context for processing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('[STREAM_PROCESS] Failed to get canvas context');
      return originalStream;
    }

    // Create a video element to receive the original stream
    const videoEl = document.createElement('video');
    videoEl.srcObject = originalStream;
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.playsInline = true;

    // Create output stream from the canvas
    const processedStream = canvas.captureStream();

    // Add audio tracks from the original stream
    originalStream.getAudioTracks().forEach((track) => {
      processedStream.addTrack(track);
      console.log(`[STREAM_PROCESS] Added audio track: ${track.id}`);
    });

    // Process frames on animation loop to apply the flip
    const processFrame = () => {
      if (videoEl.readyState >= 2) {
        // Flip the video horizontally
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoEl, 0, 0, width, height);
        ctx.restore();
      }

      requestAnimationFrame(processFrame);
    };

    // Make sure the video element starts playing
    videoEl.play().catch((err) => {
      console.error('[STREAM_PROCESS] Error playing video element:', err);
    });

    processFrame();
    console.log('[STREAM_PROCESS] Created flipped stream successfully');

    return processedStream;
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Start the preview if not already started
      if (!mediaStreamRef.current) {
        console.log('[RECORDING] Camera not active, starting preview first');
        await startPreview();
      }
      
      if (recordingManagerRef.current && mediaStreamRef.current) {
        // Reset recording state when starting a new recording
        setRecordingSegments([]);
        recordingSegmentsRef.current = [];
        setAllRecordedChunks([]);
        
        // Create a flipped stream if flip is enabled
        const streamToRecord = isFlipped ? 
          createProcessedStreamWithFlip(mediaStreamRef.current!) : 
          mediaStreamRef.current!;
        
        // Start recording with the appropriate stream
        console.log('[RECORDING] Starting new recording with flip state:', isFlipped);
        
        // Convert to RecordingOptions format expected by the service
        const serviceOptions: RecordingOptions = {
          ...recordingOptions
        };
        
        // Create first segment
        const segmentId = Date.now().toString();
        const newSegment = {
          id: segmentId,
          startTime: Date.now(),
          isFlipped: isFlipped,
          chunks: [] as Blob[]
        };
        
        // Set as current segment
        currentSegmentRef.current = segmentId;
        
        // Add to segments collection
        setRecordingSegments([newSegment]);
        recordingSegmentsRef.current = [newSegment];
        console.log(`[RECORDING] Created new segment ${segmentId} with flip=${isFlipped}`);
        
        // Start the recording - pass isFlipped parameter to the service
        recordingManagerRef.current?.startRecording(streamToRecord, serviceOptions, false, isFlipped);
        
        setIsRecording(true);
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording");
    }
  }, [isFlipped, mediaStreamRef, recordingManagerRef, recordingOptions]);

  // Toggle horizontal flip
  const toggleFlip = useCallback(() => {
    console.log(`[FLIP] Toggling horizontal flip from ${isFlipped} to ${!isFlipped}`);
    
    // Store the current flip state before updating it
    const currentFlipState = isFlipped;
    
    // If recording is active, we need to stop and restart with the flipped stream
    const wasRecording = isRecording;
    const wasPaused = isPaused;
    const currentDuration = recordingDuration;
    
    console.log(`[FLIP] Recording state: recording=${wasRecording}, paused=${wasPaused}, duration=${currentDuration}s`);
    
    // If recording, finish current segment
    if (wasRecording && recordingManagerRef.current) {
      console.log('[FLIP] Recording is active, finishing current segment');
      
      // Pause the recorder to collect current chunks
      if (!wasPaused) {
        recordingManagerRef.current.pauseRecording();
      }
      
      // Wait a bit for any remaining chunks to be processed
      setTimeout(() => {
        // Log current segments state for debugging
        console.log(`[FLIP_DEBUG] Current segments before closing: ${recordingSegmentsRef.current.length}`);
        recordingSegmentsRef.current.forEach((segment, index) => {
          console.log(`[FLIP_DEBUG] Segment #${index + 1}: id=${segment.id}, chunks=${segment.chunks.length}, flipped=${segment.isFlipped}`);
        });
        
        // Close the current segment
        currentSegmentRef.current = null;
      }, 200);
    }
    
    // Update flip state
    setIsFlipped(!isFlipped);
    
    // Apply CSS transform to the preview
    if (videoPreviewRef.current) {
      videoPreviewRef.current.style.transform = !isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
      console.log(`[FLIP] Applied CSS transform: ${!isFlipped ? 'scaleX(-1)' : 'scaleX(1)'}`);
    }
    
    // If we're recording or have an active camera, we need to restart with the flipped stream
    if (mediaStreamRef.current && wasRecording && recordingManagerRef.current) {
      console.log('[FLIP] Restarting recording with new flip setting');
      
      // Short delay to allow state updates to propagate
      setTimeout(() => {
        // Create a new stream with or without flipping
        const newStream = !currentFlipState ? 
          createProcessedStreamWithFlip(mediaStreamRef.current!) : 
          mediaStreamRef.current!;
        
        console.log(`[FLIP] New stream created, flipped=${!currentFlipState}, current duration=${currentDuration}s`);
        
        // Create a new segment
        const segmentId = Date.now().toString();
        const newSegment = {
          id: segmentId,
          startTime: Date.now(),
          isFlipped: !currentFlipState,
          chunks: [] as Blob[]
        };
        
        // Set as current segment
        currentSegmentRef.current = segmentId;
        
        // Add to segments collection - using function form to ensure we have latest state
        setRecordingSegments(prevSegments => {
          const updatedSegments = [...prevSegments, newSegment];
          // Also update our ref for consistency
          recordingSegmentsRef.current = updatedSegments;
          console.log(`[FLIP_DEBUG] Segments after adding new one: ${updatedSegments.length}`);
          return updatedSegments;
        });
        
        console.log(`[RECORDING] Created new segment ${segmentId} with flip=${!currentFlipState}`);
        
        // Restart recording with the new stream and preserve timing
        console.log(`[FLIP] Resuming recording with new stream, flipped=${!currentFlipState}, preserving timing`);
        
        // Convert to RecordingOptions format expected by the service
        const serviceOptions: RecordingOptions = {
          ...recordingOptions
        };
        
        try {
          // Pass the isFlipped parameter to the recording manager
          recordingManagerRef.current?.startRecording(newStream, serviceOptions, true, !currentFlipState);
          
          // Restore paused state if needed
          if (wasPaused) {
            console.log('[FLIP] Restoring paused state');
            recordingManagerRef.current?.pauseRecording();
          }
        } catch (error) {
          console.error('[FLIP] Error restarting recording after flip:', error);
          toast.error('Error when flipping video during recording. Try again.');
        }
      }, 200);
    }
  }, [isFlipped, mediaStreamRef, recordingManagerRef, recordingOptions]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    console.log(`[STOP] Stopping recording`);
    console.log(`[STOP_DEBUG] recordingSegments state has ${recordingSegments.length} segments`);
    console.log(`[STOP_DEBUG] recordingSegmentsRef has ${recordingSegmentsRef.current.length} segments`);
    
    // Debug log segments before flip
    recordingSegments.forEach((segment, index) => {
      console.log(`[STOP_DEBUG] Segment #${index + 1}: id=${segment.id}, chunks=${segment.chunks.length}, flipped=${segment.isFlipped}, started at ${new Date(segment.startTime).toISOString()}`);
    });
    
    if (!isRecording) {
      console.log(`[STOP] No recording in progress`);
      return;
    }
    
    // Use the recording manager service to stop recording
    console.log(`[STOP_DEBUG] Calling stopRecording on RecordingManagerService`);
    
    // Pass our UI segments to the service for synchronization
    recordingManagerRef.current?.syncSegments(recordingSegments);
    
    try {
      const finalRecording = await recordingManagerRef.current?.stopRecording(recordingSegments);
      
      if (!finalRecording) {
        console.error(`[STOP] Failed to get final recording from service`);
        return;
      }
      
      console.log(`[STOP_DEBUG] stopRecording completed`);
      console.log(`[STOP_DEBUG] Final recording returned with size: ${(finalRecording.blob.size / (1024 * 1024)).toFixed(2)} MB`);
      
      // Log information about our segments
      console.log(`[RECORDING] Recording finished with ${recordingSegments.length} segments:`);
      let totalChunks = 0;
      recordingSegments.forEach((segment, index) => {
        console.log(`[RECORDING] Segment #${index + 1}: id=${segment.id}, chunks=${segment.chunks.length}, flipped=${segment.isFlipped}`);
        totalChunks += segment.chunks.length;
      });
      console.log(`[RECORDING] Total chunks across segments: ${totalChunks}`);
      
      // Apply privacy protection if needed
      console.log(`[STOP] Applying privacy protection to final recording`);
      
      // Process with privacy protection if needed
      if (privacyServiceRef.current && privacyOptions.stripMetadata) {
        console.log('[STOP] Applying privacy protection to final recording');
        
        // Strip metadata from the final blob
        const cleanBlob = await privacyServiceRef.current.stripMetadata(finalRecording.blob);
        finalRecording.blob = cleanBlob;
        finalRecording.size = cleanBlob.size;
        finalRecording.url = URL.createObjectURL(cleanBlob);
      }

      try {
        // Save recording to local storage
        await saveRecording(finalRecording);
        
        // Reset our recording state
        setAllRecordedChunks([]);
        setRecordingSegments([]);
        recordingSegmentsRef.current = [];

        toast.success("Recording saved successfully");
        console.log('[STOP] Recording saved, switching to recordings tab');
        
        // Switch to the recordings tab with a small delay to ensure state is updated
        setTimeout(() => {
          setActiveTab("recordings");
          console.log('[STOP] Tab switched to recordings');
        }, 100);
      } catch (error) {
        console.error('[STOP] Error saving recording:', error);
        toast.error('Failed to save recording');
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to save recording");
    }
  }, [isRecording, recordingManagerRef, recordingSegments, recordingSegmentsRef, privacyOptions, privacyServiceRef]);

  // Save recording to localStorage and return the final recorded media
  const saveRecording = async (recording: RecordedMedia): Promise<RecordedMedia> => {
    try {
      console.log('[MEDIA_TOOL] Recording to save:', {
        name: recording.name,
        size: recording.blob.size,
        duration: recording.duration,
        type: recording.type,
      });

      // Store a direct reference to the recording in an in-memory map for immediate access
      // This bypasses storage issues with large blobs
      window._directRecordings = window._directRecordings || new Map();
      window._directRecordings.set(recording.id, recording);

      // Create a lightweight version for storage
      // For the stored version, create a smaller preview version if it's large
      let storageRecording = recording;

      if (recording.blob.size > 1024 * 1024 * 5) { // If larger than 5MB
        console.log('[MEDIA_TOOL] Creating lightweight preview for large recording');

        // Keep the original values but reference the in-memory version for access
        storageRecording = {
          ...recording,
          directAccessId: recording.id, // Reference to the direct access map
          // No need to change the URL as it points to the original blob
        };
      }

      // Save to storage
      await localStorageRef.current?.saveRecording(storageRecording);
      return recording; // Return the full recording
    } catch (error) {
      console.error('Failed to save recording:', error);
      throw error;
    }
  };

  // Toggle recording pause state
  const togglePause = () => {
    if (!recordingManagerRef.current) return;

    if (isPaused) {
      recordingManagerRef.current.resumeRecording();
      setIsPaused(false);
    } else {
      recordingManagerRef.current.pauseRecording();
      setIsPaused(true);
    }
  };

  // Format seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle tab change - ensure recording is stopped and streams are released
  const handleTabChange = (newTab: string) => {
    console.log(`[TAB_CHANGE] Tab changing from ${activeTab} to ${newTab}`);

    setActiveTab(newTab);
  };

  return (
    <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-0">
              Privacy Media Recorder
            </h2>
            <TabsList className="bg-purple-50 dark:bg-gray-800">
              <TabsTrigger
                value="record"
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900"
              >
                <Camera className="h-4 w-4 mr-2" />
                Record
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900"
              >
                <Settings className="h-4 w-4 mr-2" />
                Devices
              </TabsTrigger>
              <TabsTrigger
                value="recordings"
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900"
              >
                <Video className="h-4 w-4 mr-2" />
                Recordings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="record" className="p-0 m-0">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="col-span-1 lg:col-span-3 p-4 relative">
                <div className="relative w-full aspect-video bg-gray-900 rounded overflow-hidden">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-2"></span>
                      {isPaused ? "Paused" : "Recording"} {formatDuration(recordingDuration)}
                    </div>
                  )}
                </div>

                <RecordingControls
                  isRecording={isRecording}
                  isPaused={isPaused}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onTogglePause={togglePause}
                  onRefreshPreview={loadDevices}
                  onToggleFlip={toggleFlip}
                />
              </div>

              <div className="col-span-1 lg:col-span-2 bg-gray-50 dark:bg-gray-900 p-4 lg:border-l border-gray-200 dark:border-gray-800">
                <OptionsPanel
                  recordingOptions={recordingOptions}
                  setRecordingOptions={setRecordingOptions}
                  privacyOptions={privacyOptions}
                  setPrivacyOptions={setPrivacyOptions}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="p-0 m-0">
            <DeviceSelectionPanel
              availableDevices={availableDevices}
              selectedDevices={selectedDevices}
              setSelectedDevices={setSelectedDevices}
              onRefreshDevices={loadDevices}
            />
          </TabsContent>

          <TabsContent value="recordings" className="p-0 m-0">
            <RecordingsList localStorageService={localStorageRef.current} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

declare global {
  interface Window {
    _directRecordings?: Map<string, RecordedMedia>;
  }
}
