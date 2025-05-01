"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoOff, MicOff, RefreshCw, StopCircle, PlayCircle } from "lucide-react";
import { MediaDevice } from "@/lib/services/privacy-media-recorder/media-recorder-service";

interface DeviceSelectionPanelProps {
  availableDevices: {
    videoinput: MediaDevice[];
    audioinput: MediaDevice[];
  };
  selectedDevices: {
    videoDeviceId: string;
    audioDeviceId: string;
  };
  setSelectedDevices: React.Dispatch<React.SetStateAction<{
    videoDeviceId: string;
    audioDeviceId: string;
  }>>;
  onRefreshDevices: () => Promise<void>;
}

export default function DeviceSelectionPanel({
  availableDevices,
  selectedDevices,
  setSelectedDevices,
  onRefreshDevices
}: DeviceSelectionPanelProps) {
  const [testingVideo, setTestingVideo] = useState<string | null>(null);
  const [testingAudio, setTestingAudio] = useState<MediaStream | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const videoTestRef = useRef<HTMLVideoElement>(null);
  const audioTestRef = useRef<HTMLAudioElement>(null);
  const [audioVolume, setAudioVolume] = useState<number[]>(Array(50).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Handle video device change
  const handleVideoDeviceChange = (deviceId: string) => {
    setSelectedDevices(prev => ({
      ...prev,
      videoDeviceId: deviceId
    }));
    
    // Stop testing current video if active
    stopVideoTest();
  };

  // Handle audio device change
  const handleAudioDeviceChange = (deviceId: string) => {
    setSelectedDevices(prev => ({
      ...prev,
      audioDeviceId: deviceId
    }));
    
    // Stop testing current audio if active
    stopAudioTest();
  };

  // Start video device test
  const startVideoTest = async (deviceId: string) => {
    try {
      // Stop any active tests
      stopVideoTest();
      stopAudioTest();
      
      // Set the device ID being tested
      setTestingVideo(deviceId);
      
      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false
      });
      
      // Display in test video element
      if (videoTestRef.current) {
        videoTestRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Failed to test video device:", error);
      setTestingVideo(null);
    }
  };

  // Stop video device test
  const stopVideoTest = () => {
    if (testingVideo && videoTestRef.current && videoTestRef.current.srcObject) {
      const stream = videoTestRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoTestRef.current.srcObject = null;
      setTestingVideo(null);
    }
  };

  // Test audio device
  const testAudioDevice = async (deviceId: string) => {
    try {
      // Stop any previous test
      stopAudioTest();
      
      console.log("Starting audio test for device:", deviceId);
      
      // Get audio stream for the selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } }
      });
      console.log("Audio stream obtained:", deviceId === 'default' ? 'Default - MacBook Air Microphone (Built-in)' : deviceId);
      
      // Clean up previous audio context if exists
      if (audioContextRef.current) {
        console.log("Closed previous AudioContext");
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
        audioContextRef.current = null;
        analyserRef.current = null;
      }
      
      // Create new audio context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("Created new AudioContext, state:", audioContext.state);
      audioContextRef.current = audioContext;
      
      // Create analyzer for frequency data visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64; // Smaller FFT for more responsive visualization
      console.log("Analyzer created with fftSize:", analyser.fftSize);
      
      const bufferLength = analyser.frequencyBinCount;
      console.log("Buffer length:", bufferLength);
      
      // Create data array for frequency data
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      // Connect audio stream to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      console.log("Audio source connected to analyzer");
      
      // Resume audio context if needed
      if (audioContext.state !== 'running') {
        await audioContext.resume();
        console.log("AudioContext resumed, state:", audioContext.state);
      }
      
      // Start visualization by setting state
      setTestingAudio(stream);
      console.log("Set testingAudio state to stream");
      
      // Set stream to audio element (not essential for visualization but useful for UI consistency)
      if (audioTestRef.current) {
        audioTestRef.current.srcObject = stream;
        audioTestRef.current.muted = false; // Ensure audio element is not muted
        
        console.log("Audio set to test element, muted:", audioTestRef.current.muted);
        
        // Add playing event listener to ensure stream is active
        const playPromise = audioTestRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("Audio playback started successfully"))
            .catch(e => console.error("Audio playback failed:", e));
        }
      }
      
      // Store analyzer reference for visualization
      analyserRef.current = analyser;
      
      // Ensure React state updates have been processed before visualization starts
      // Use a longer timeout to ensure state is fully updated
      setTimeout(() => {
        // Double-check testingAudio is set here
        if (testingAudio === null) {
          console.log("State mismatch - setting testingAudio directly before visualization");
          // Direct DOM manipulation approach as fallback
          if (audioTestRef.current && audioTestRef.current.srcObject) {
            // Type-safe check for MediaStream
            const srcObj = audioTestRef.current.srcObject;
            if (srcObj instanceof MediaStream) {
              visualize(srcObj);
            }
          }
        } else {
          console.log("Starting visualization with properly set testingAudio");
          visualize();
        }
      }, 250); // Increased timeout to give more time for state updates
      
    } catch (error) {
      console.error("Failed to test audio device:", error);
      setTestingAudio(null);
    }
  };

  // Interface for visualize function with timestamp tracking
  interface VisualizeFunction {
    (forcedStream?: MediaStream): void;
    lastLog?: number;
  }

  // Audio visualization function
  const visualize: VisualizeFunction = (forcedStream) => {
    // Use a direct reference check first
    const hasActiveStream = (forcedStream !== undefined) || (testingAudio !== null);
    
    console.log('Visualization function called, checking requirements:', {
      hasAnalyser: !!analyserRef.current,
      hasDataArray: !!dataArrayRef.current,
      hasActiveStream: hasActiveStream,
      forcedStream: !!forcedStream,
      testingAudio: !!testingAudio
    });
    
    if (!analyserRef.current || !dataArrayRef.current || !hasActiveStream) {
      console.log("Visualization cancelled - missing required refs or test stopped");
      return;
    }
    
    try {
      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Log data occasionally to avoid console spam
      const now = Date.now();
      if (!visualize.lastLog || now - visualize.lastLog > 1000) { // Log once per second
        console.log("Audio data samples:", Array.from(dataArrayRef.current).slice(0, 10));
        console.log("Max value:", Math.max(...Array.from(dataArrayRef.current)));
        visualize.lastLog = now;
      }
      
      // Process the data to create a more dynamic visualization
      // Map each frequency bin to a visual bar in our display (50 bars total)
      const bins = dataArrayRef.current.length;
      const bars = 50; // Match number of bars in the UI
      const volumeData = Array(bars).fill(0);
      
      // Sample frequency data to create visual bars
      for (let i = 0; i < bars; i++) {
        // Find which frequency bin corresponds to this visualization bar
        const binIndex = Math.floor(i * bins / bars);
        // Get normalized value (0-1)
        const value = dataArrayRef.current[binIndex] / 255;
        // Apply non-linear scaling to emphasize changes and ensure minimum height
        volumeData[i] = Math.max(0.05, Math.pow(value, 0.7) * 0.95 + 0.05);
      }
      
      // Update volume display
      setAudioVolume(volumeData);
      
      // Continue visualization loop if still testing
      // Check testingAudio state and forcedStream to determine if we should continue
      if (testingAudio !== null || forcedStream !== undefined) {
        requestAnimationFrame(() => visualize(forcedStream));
      } else {
        console.log("Stopping visualization loop - no active stream");
      }
    } catch (error) {
      console.error("Error in visualization:", error);
      // Try to recover
      setTimeout(() => {
        if (testingAudio !== null || forcedStream !== undefined) {
          visualize(forcedStream);
        }
      }, 500);
    }
  };

  // Initialize the lastLog property
  visualize.lastLog = 0;

  // Stop audio device test
  const stopAudioTest = () => {
    if (testingAudio && audioTestRef.current && audioTestRef.current.srcObject) {
      console.log("Stopping audio test");
      const stream = audioTestRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      audioTestRef.current.srcObject = null;
      setTestingAudio(null);
      
      // Clear visualization
      setAudioVolume(Array(50).fill(0.05)); // Minimum height for visual elements
      console.log("Audio test stopped and visualization reset");
    } else if (testingAudio) {
      setTestingAudio(null);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopVideoTest();
      stopAudioTest();
    };
  }, []);

  // Add validation logic for device IDs when mapping
  const validVideoDevices = availableDevices.videoinput.filter(device => device.deviceId && device.deviceId.trim() !== '');
  const validAudioDevices = availableDevices.audioinput.filter(device => device.deviceId && device.deviceId.trim() !== '');

  // Update effect to check for valid selections when devices change
  useEffect(() => {
    // Ensure selected device IDs are still valid
    if (selectedDevices.videoDeviceId && !validVideoDevices.some(d => d.deviceId === selectedDevices.videoDeviceId)) {
      // Selected video device no longer available, reset or pick first valid one
      setSelectedDevices(prev => ({
        ...prev,
        videoDeviceId: validVideoDevices.length > 0 ? validVideoDevices[0].deviceId : ''
      }));
    }
    
    if (selectedDevices.audioDeviceId && !validAudioDevices.some(d => d.deviceId === selectedDevices.audioDeviceId)) {
      // Selected audio device no longer available, reset or pick first valid one
      setSelectedDevices(prev => ({
        ...prev,
        audioDeviceId: validAudioDevices.length > 0 ? validAudioDevices[0].deviceId : ''
      }));
    }
  }, [availableDevices, selectedDevices.videoDeviceId, selectedDevices.audioDeviceId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card className="border border-purple-100 dark:border-purple-900">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2 h-5 w-5 text-purple-600"
            >
              <path d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3z" />
              <path d="M15 7 2 2" />
              <path d="M15 11 2-2" />
              <path d="M13 17v2" />
              <path d="M9 17v2" />
              <path d="M9 17h5" />
            </svg>
            Video Devices
          </CardTitle>
          <CardDescription>Select and test your camera devices</CardDescription>
        </CardHeader>
        <CardContent>
          {validVideoDevices.length > 0 ? (
            <>
              <Select 
                value={selectedDevices.videoDeviceId}
                onValueChange={handleVideoDeviceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  {validVideoDevices.map(device => (
                    <SelectItem 
                      key={device.deviceId} 
                      value={device.deviceId || `device-${Math.random().toString(36).substring(2, 9)}`}
                    >
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4 bg-black rounded overflow-hidden">
                <video 
                  ref={videoTestRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full aspect-video object-contain" 
                />
              </div>
              
              <div className="flex justify-center mt-4">
                {testingVideo === selectedDevices.videoDeviceId ? (
                  <Button 
                    variant="outline" 
                    onClick={stopVideoTest}
                    className="gap-1"
                  >
                    <VideoOff className="h-4 w-4" />
                    Stop Test
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={() => startVideoTest(selectedDevices.videoDeviceId)}
                    className="gap-1"
                    disabled={!selectedDevices.videoDeviceId}
                  >
                    Test Camera
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <VideoOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No video devices detected</p>
              <Button 
                variant="outline" 
                onClick={onRefreshDevices}
                className="mt-4 gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Devices
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border border-purple-100 dark:border-purple-900">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2 h-5 w-5 text-purple-600"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Audio Devices
          </CardTitle>
          <CardDescription>Select and test your microphone devices</CardDescription>
        </CardHeader>
        <CardContent>
          {validAudioDevices.length > 0 ? (
            <>
              <Select 
                value={selectedDevices.audioDeviceId}
                onValueChange={handleAudioDeviceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a microphone" />
                </SelectTrigger>
                <SelectContent>
                  {validAudioDevices.map(device => (
                    <SelectItem 
                      key={device.deviceId} 
                      value={device.deviceId || `device-${Math.random().toString(36).substring(2, 9)}`}
                    >
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4 h-24 bg-purple-50 dark:bg-gray-800 rounded p-2 flex items-end gap-0.5">
                {audioVolume.map((volume, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t transition-all duration-75"
                    style={{
                      height: `${Math.max(4, volume * 100)}%`,
                      opacity: testingAudio ? 1 : 0.3
                    }}
                  ></div>
                ))}
              </div>
              
              {/* Hidden audio element for testing */}
              <audio 
                ref={audioTestRef} 
                autoPlay 
                controls={false} 
                muted={audioMuted} 
                className="hidden" 
              />
              
              <div className="flex justify-center mt-4">
                {selectedDevices.audioDeviceId ? (
                  <div className="flex items-center justify-between gap-2">
                    <Button 
                      variant={testingAudio ? "destructive" : "default"} 
                      onClick={() => testingAudio ? stopAudioTest() : testAudioDevice(selectedDevices.audioDeviceId)}
                      className="gap-1"
                    >
                      {testingAudio ? (
                        <>
                          <StopCircle className="h-4 w-4" />
                          Stop Test
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Test Microphone
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="default" 
                      onClick={() => setAudioMuted(!audioMuted)}
                      className="gap-1"
                    >
                      {audioMuted ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <MicOff className="h-4 w-4" />
                          Mute
                        </>
                      )}
                    </Button>
                    
                    {/* Microphone visualization */}
                    <div className="hidden flex h-8 w-full items-end gap-px overflow-hidden rounded-md bg-gray-100 p-1 dark:bg-gray-800">
                      {audioVolume.map((volume, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t transition-all duration-75"
                          style={{
                            height: `${Math.max(4, volume * 100)}%`,
                            opacity: testingAudio ? 1 : 0.3
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MicOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No audio devices detected</p>
                    <Button 
                      variant="outline" 
                      onClick={onRefreshDevices}
                      className="mt-4 gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh Devices
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MicOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No audio devices detected</p>
              <Button 
                variant="outline" 
                onClick={onRefreshDevices}
                className="mt-4 gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Devices
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="md:col-span-2">
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Can't see your devices? Make sure you've granted the necessary permissions.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefreshDevices}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Devices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
