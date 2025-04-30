"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceSelectionPanel from "./device-selection-panel";
import RecordingControls from "./recording-controls";
import RecordingsList from "./recordings-list";
import OptionsPanel from "./options-panel";
import { MediaRecorderService } from "@/lib/services/privacy-media-recorder/media-recorder-service";
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
  const [availableDevices, setAvailableDevices] = useState({
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

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderServiceRef = useRef<MediaRecorderService | null>(null);
  const recordingManagerRef = useRef<RecordingManagerService | null>(null);
  const localStorageRef = useRef<LocalStorageService | null>(null);
  const privacyServiceRef = useRef<PrivacyProtectionService | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize services
  useEffect(() => {
    mediaRecorderServiceRef.current = new MediaRecorderService();
    recordingManagerRef.current = new RecordingManagerService();
    localStorageRef.current = new LocalStorageService();
    privacyServiceRef.current = new PrivacyProtectionService();

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

    // Clean up on unmount
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingManagerRef.current) {
        recordingManagerRef.current.cleanup();
      }
    };
  }, []);

  // Fetch available devices
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
      
      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      
      // Start new capture based on options
      const stream = await mediaRecorderServiceRef.current.startCapture(
        recordingOptions,
        selectedDevices.videoDeviceId,
        selectedDevices.audioDeviceId
      );
      
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
        videoPreviewRef.current.srcObject = mediaStreamRef.current;
      }
    } catch (error) {
      console.error("Failed to start preview:", error);
      toast.error("Failed to access media devices");
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (!recordingManagerRef.current || !mediaStreamRef.current) {
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
      if (!recordingManagerRef.current || !localStorageRef.current) return;
      
      const recording = recordingManagerRef.current.stopRecording();
      
      if (recording) {
        // Strip metadata if privacy option is enabled
        let finalRecording = recording;
        if (privacyOptions.stripMetadata && privacyServiceRef.current) {
          const cleanBlob = await privacyServiceRef.current.stripMetadata(recording.blob);
          finalRecording = {
            ...recording,
            blob: cleanBlob,
            size: cleanBlob.size,
            url: URL.createObjectURL(cleanBlob)
          };
        }
        
        // Save recording to local storage
        await localStorageRef.current.saveRecording(finalRecording);
        
        toast.success("Recording saved successfully");
        setActiveTab("recordings");
      }
      
      setIsRecording(false);
      setIsPaused(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to save recording");
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

  // Load devices on component mount
  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  onRefreshPreview={startPreview}
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
