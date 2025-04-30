"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoOff, MicOff, RefreshCw } from "lucide-react";
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
  const [testingAudio, setTestingAudio] = useState<string | null>(null);
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

  // Start audio device test
  const startAudioTest = async (deviceId: string) => {
    try {
      // Stop any active tests
      stopVideoTest();
      stopAudioTest();
      
      // Set the device ID being tested
      setTestingAudio(deviceId);
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } }
      });
      
      // Set up audio visualization
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Connect audio to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start visualization loop
      visualize();
      
      // Display in test audio element (silent playback)
      if (audioTestRef.current) {
        audioTestRef.current.srcObject = stream;
        audioTestRef.current.muted = true; // Avoid feedback
      }
    } catch (error) {
      console.error("Failed to test audio device:", error);
      setTestingAudio(null);
    }
  };

  // Stop audio device test
  const stopAudioTest = () => {
    if (testingAudio && audioTestRef.current && audioTestRef.current.srcObject) {
      const stream = audioTestRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      audioTestRef.current.srcObject = null;
      setTestingAudio(null);
      
      // Clear visualization
      setAudioVolume(Array(50).fill(0));
    }
  };

  // Audio visualization function
  const visualize = () => {
    if (!analyserRef.current || !dataArrayRef.current || testingAudio === null) {
      return;
    }
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume level
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    
    // Update volume display with moving average
    setAudioVolume(prev => {
      const newVolumes = [...prev];
      newVolumes.shift();
      newVolumes.push(average / 256); // Normalize to 0-1
      return newVolumes;
    });
    
    // Continue visualization loop if still testing
    if (testingAudio !== null) {
      requestAnimationFrame(visualize);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopVideoTest();
      stopAudioTest();
    };
  }, []);

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
              <path d="m15 7 2 2" />
              <path d="m15 11 2-2" />
              <path d="M13 17v2" />
              <path d="M9 17v2" />
              <path d="M9 17h5" />
            </svg>
            Video Devices
          </CardTitle>
          <CardDescription>Select and test your camera devices</CardDescription>
        </CardHeader>
        <CardContent>
          {availableDevices.videoinput.length > 0 ? (
            <>
              <Select 
                value={selectedDevices.videoDeviceId}
                onValueChange={handleVideoDeviceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.videoinput.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
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
          {availableDevices.audioinput.length > 0 ? (
            <>
              <Select 
                value={selectedDevices.audioDeviceId}
                onValueChange={handleAudioDeviceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a microphone" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.audioinput.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
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
              
              <audio ref={audioTestRef} autoPlay muted className="hidden" />
              
              <div className="flex justify-center mt-4">
                {testingAudio === selectedDevices.audioDeviceId ? (
                  <Button 
                    variant="outline" 
                    onClick={stopAudioTest}
                    className="gap-1"
                  >
                    <MicOff className="h-4 w-4" />
                    Stop Test
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={() => startAudioTest(selectedDevices.audioDeviceId)}
                    className="gap-1"
                    disabled={!selectedDevices.audioDeviceId}
                  >
                    Test Microphone
                  </Button>
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
