"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InfoCircle, ShieldCheck } from "lucide-react";

interface OptionsProps {
  recordingOptions: {
    video: boolean;
    audio: boolean;
    screen: boolean;
    resolution: { width: number; height: number };
    frameRate: number;
    mimeType: string;
  };
  setRecordingOptions: React.Dispatch<
    React.SetStateAction<{
      video: boolean;
      audio: boolean;
      screen: boolean;
      resolution: { width: number; height: number };
      frameRate: number;
      mimeType: string;
    }>
  >;
  privacyOptions: {
    faceBlur: boolean;
    blurIntensity: number;
    stripMetadata: boolean;
  };
  setPrivacyOptions: React.Dispatch<
    React.SetStateAction<{
      faceBlur: boolean;
      blurIntensity: number;
      stripMetadata: boolean;
    }>
  >;
}

export default function OptionsPanel({
  recordingOptions,
  setRecordingOptions,
  privacyOptions,
  setPrivacyOptions,
}: OptionsProps) {
  // Resolution presets
  const resolutionOptions = [
    { label: "360p", value: { width: 640, height: 360 } },
    { label: "480p", value: { width: 854, height: 480 } },
    { label: "720p", value: { width: 1280, height: 720 } },
    { label: "1080p", value: { width: 1920, height: 1080 } },
    { label: "4K", value: { width: 3840, height: 2160 } },
  ];

  // Frame rate presets
  const frameRateOptions = [
    { label: "15fps", value: 15 },
    { label: "24fps", value: 24 },
    { label: "30fps", value: 30 },
    { label: "60fps", value: 60 },
  ];

  // Format presets
  const formatOptions = [
    { 
      label: "WebM (VP9)", 
      value: "video/webm;codecs=vp9,opus" 
    },
    { 
      label: "WebM (VP8)", 
      value: "video/webm;codecs=vp8,opus" 
    },
    { 
      label: "MP4 (H.264)", 
      value: "video/mp4" 
    },
  ];

  // Get current resolution label
  const getCurrentResolutionLabel = () => {
    const match = resolutionOptions.find(
      (option) =>
        option.value.width === recordingOptions.resolution.width &&
        option.value.height === recordingOptions.resolution.height
    );
    return match ? match.label : "Custom";
  };

  // Get current frame rate label
  const getCurrentFrameRateLabel = () => {
    const match = frameRateOptions.find(
      (option) => option.value === recordingOptions.frameRate
    );
    return match ? match.label : `${recordingOptions.frameRate}fps`;
  };

  // Get current format label
  const getCurrentFormatLabel = () => {
    const match = formatOptions.find(
      (option) => option.value === recordingOptions.mimeType
    );
    return match ? match.label : "Custom";
  };

  // Toggle recording mode between webcam and screen
  const toggleRecordingMode = (useScreen: boolean) => {
    setRecordingOptions((prev) => ({
      ...prev,
      screen: useScreen,
      video: !useScreen, // Disable video if screen is enabled and vice versa
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Recording Options</h3>
        <Tabs defaultValue="capture">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger
              value="capture"
              className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900"
            >
              Capture
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900"
            >
              <ShieldCheck className="h-4 w-4 mr-1" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Capture Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleRecordingMode(false)}
                  className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                    !recordingOptions.screen
                      ? "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
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
                    className={`h-6 w-6 mb-1 ${
                      !recordingOptions.screen
                        ? "text-purple-600"
                        : "text-gray-500"
                    }`}
                  >
                    <path d="M7 6h10" />
                    <path d="M7 18h10" />
                    <path d="M13 6v12" />
                    <rect width="18" height="18" x="3" y="3" rx="3" />
                  </svg>
                  <span className="text-sm">Webcam</span>
                </button>

                <button
                  onClick={() => toggleRecordingMode(true)}
                  className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                    recordingOptions.screen
                      ? "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
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
                    className={`h-6 w-6 mb-1 ${
                      recordingOptions.screen
                        ? "text-purple-600"
                        : "text-gray-500"
                    }`}
                  >
                    <rect width="18" height="14" x="3" y="5" rx="2" />
                    <line x1="7" x2="17" y1="19" y2="19" />
                  </svg>
                  <span className="text-sm">Screen</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="use-audio"
                className="text-sm font-medium cursor-pointer"
              >
                Record Audio
              </Label>
              <Switch
                id="use-audio"
                checked={recordingOptions.audio}
                onCheckedChange={(checked) =>
                  setRecordingOptions((prev) => ({ ...prev, audio: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Resolution</Label>
                <span className="text-xs text-gray-500">
                  {getCurrentResolutionLabel()}
                </span>
              </div>
              <Select
                value={getCurrentResolutionLabel()}
                onValueChange={(value) => {
                  const selected = resolutionOptions.find(
                    (option) => option.label === value
                  );
                  if (selected) {
                    setRecordingOptions((prev) => ({
                      ...prev,
                      resolution: selected.value,
                    }));
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label} ({option.value.width}×{option.value.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Frame Rate</Label>
                <span className="text-xs text-gray-500">
                  {getCurrentFrameRateLabel()}
                </span>
              </div>
              <Select
                value={getCurrentFrameRateLabel()}
                onValueChange={(value) => {
                  const selected = frameRateOptions.find(
                    (option) => option.label === value
                  );
                  if (selected) {
                    setRecordingOptions((prev) => ({
                      ...prev,
                      frameRate: selected.value,
                    }));
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select frame rate" />
                </SelectTrigger>
                <SelectContent>
                  {frameRateOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Format</Label>
                <span className="text-xs text-gray-500">
                  {getCurrentFormatLabel()}
                </span>
              </div>
              <Select
                value={getCurrentFormatLabel()}
                onValueChange={(value) => {
                  const selected = formatOptions.find(
                    (option) => option.label === value
                  );
                  if (selected) {
                    setRecordingOptions((prev) => ({
                      ...prev,
                      mimeType: selected.value,
                    }));
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="face-blur"
                className="text-sm font-medium cursor-pointer"
              >
                Face Blur
              </Label>
              <Switch
                id="face-blur"
                checked={privacyOptions.faceBlur}
                onCheckedChange={(checked) =>
                  setPrivacyOptions((prev) => ({ ...prev, faceBlur: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Blur Intensity</Label>
                <span className="text-xs text-gray-500">
                  {privacyOptions.blurIntensity}
                </span>
              </div>
              <Slider
                value={[privacyOptions.blurIntensity]}
                min={1}
                max={10}
                step={1}
                disabled={!privacyOptions.faceBlur}
                onValueChange={(value) =>
                  setPrivacyOptions((prev) => ({
                    ...prev,
                    blurIntensity: value[0],
                  }))
                }
                className={!privacyOptions.faceBlur ? "opacity-50" : ""}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="strip-metadata"
                className="text-sm font-medium cursor-pointer"
              >
                Strip Metadata (EXIF/GPS)
              </Label>
              <Switch
                id="strip-metadata"
                checked={privacyOptions.stripMetadata}
                onCheckedChange={(checked) =>
                  setPrivacyOptions((prev) => ({
                    ...prev,
                    stripMetadata: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-xs">
              <InfoCircle className="h-4 w-4 flex-shrink-0" />
              <p>
                All processing happens locally in your browser. No data is sent to
                any server.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
