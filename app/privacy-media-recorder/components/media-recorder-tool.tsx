"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceSelectionPanel from "./device-selection-panel";
import RecordingControls from "./recording-controls";
import RecordingsList from "./recordings-list";
import OptionsPanel from "./options-panel";
import { MediaRecorderService, MediaDevice, RecordedMedia } from "@/lib/services/privacy-media-recorder/media-recorder-service";
import { RecordingManagerService } from "@/lib/services/privacy-media-recorder/recording-manager-service";
import { LocalStorageService } from "@/lib/services/privacy-media-recorder/local-storage-service";
import { PrivacyProtectionService } from "@/lib/services/privacy-media-recorder/privacy-protection-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Video, Mic, Camera } from "lucide-react";

export default function MediaRecorderTool() {
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
  const [recordingOptions, setRecordingOptions] = useState({
    video: true,
    audio: true,
    screen: false,
    resolution: { width: 1280, height: 720 },
    frameRate: 30,
    mimeType: "video/webm;codecs=vp9,opus",
  });
  const [privacyOptions, setPrivacyOptions] = useState({
    faceBlur: false,
    blurIntensity: 5,
    stripMetadata: true,
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderServiceRef = useRef<MediaRecorderService | null>(null);
  const recordingManagerRef = useRef<RecordingManagerService | null>(null);
  const localStorageRef = useRef<LocalStorageService | null>(null);
  const privacyServiceRef = useRef<PrivacyProtectionService | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Component mount and cleanup
  useEffect(() => {
    mediaRecorderServiceRef.current = new MediaRecorderService();
    recordingManagerRef.current = new RecordingManagerService();
    localStorageRef.current = new LocalStorageService();
    privacyServiceRef.current = new PrivacyProtectionService();

    console.log('[INIT] Media recorder initialized');

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
      },
      (error) => {
        toast.error(`Recording error: ${error.message}`);
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

      tracks.forEach(track => {
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

        videoTracks.forEach(track => {
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
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
          groupId: device.groupId
        }));

      const audioinput = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          kind: device.kind,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          groupId: device.groupId
        }));

      setAvailableDevices({ videoinput, audioinput });

      // Auto-select first devices if none selected
      if (!selectedDevices.videoDeviceId && videoinput.length > 0) {
        setSelectedDevices(prev => ({
          ...prev,
          videoDeviceId: videoinput[0].deviceId
        }));
      }

      if (!selectedDevices.audioDeviceId && audioinput.length > 0) {
        setSelectedDevices(prev => ({
          ...prev,
          audioDeviceId: audioinput[0].deviceId
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
        setSelectedDevices(prev => ({
          ...prev,
          videoDeviceId: devices.videoinput[0].deviceId
        }));
      }

      if (!selectedDevices.audioDeviceId && devices.audioinput.length > 0) {
        setSelectedDevices(prev => ({
          ...prev,
          audioDeviceId: devices.audioinput[0].deviceId
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
      stream.getTracks().forEach(track => {
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

  // Start recording
  const startRecording = async () => {
    try {
      // Start the preview if not already started
      if (!mediaStreamRef.current) {
        console.log('[RECORDING] Camera not active, starting preview first');
        await startPreview();
      }
      
      if (recordingManagerRef.current && mediaStreamRef.current) {
        recordingManagerRef.current.startRecording(mediaStreamRef.current, recordingOptions);
        setIsRecording(true);
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording");
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recordingManagerRef.current) return;

      console.log('[STOP] Stopping recording');
      setIsRecording(false);
      setIsPaused(false);

      // Stop the recording
      const finalRecording = await recordingManagerRef.current.stopRecording();

      if (finalRecording) {
        // Strip metadata if privacy option is enabled
        let finalRecordingToSave = finalRecording;
        if (privacyOptions.stripMetadata && privacyServiceRef.current) {
          const cleanBlob = await privacyServiceRef.current.stripMetadata(finalRecording.blob);
          finalRecordingToSave = {
            ...finalRecording,
            blob: cleanBlob,
            size: cleanBlob.size,
            url: URL.createObjectURL(cleanBlob)
          };
        }

        // Save recording to local storage
        await saveRecording(finalRecordingToSave);

        toast.success("Recording saved successfully");
        setActiveTab("recordings");
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to save recording");
    }
  };

  // Save recording to localStorage and return the final recorded media
  const saveRecording = async (recording: RecordedMedia): Promise<RecordedMedia> => {
    try {
      console.log('[MEDIA_TOOL] Recording to save:', {
        name: recording.name,
        size: recording.blob.size,
        duration: recording.duration,
        type: recording.type
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

  // Toggle horizontal flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.style.transform = !isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
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
