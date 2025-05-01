"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Square, 
  Pause, 
  RefreshCw, 
  Camera, 
  ScreenShare, 
  Mic,
  FlipHorizontal
} from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  onTogglePause: () => void;
  onRefreshPreview: () => Promise<void>;
  onToggleFlip: () => void;
}

export default function RecordingControls({
  isRecording,
  isPaused,
  onStartRecording,
  onStopRecording,
  onTogglePause,
  onRefreshPreview,
  onToggleFlip
}: RecordingControlsProps) {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap justify-center gap-3">
        {!isRecording ? (
          <>
            <Button
              onClick={onStartRecording}
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full h-12 w-12 p-0 flex items-center justify-center"
              title="Start Recording"
            >
              <Play className="h-6 w-6" />
            </Button>
            <Button
              onClick={onRefreshPreview}
              variant="outline"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
              title="Refresh Preview"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              onClick={onToggleFlip}
              variant="outline"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
              title="Flip Horizontally"
            >
              <FlipHorizontal className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onStopRecording}
              variant="destructive"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
              title="Stop Recording"
            >
              <Square className="h-5 w-5" fill="white" />
            </Button>
            <Button
              onClick={onTogglePause}
              variant={isPaused ? "default" : "outline"}
              className={`rounded-full h-12 w-12 p-0 flex items-center justify-center ${
                isPaused ? "bg-green-600 hover:bg-green-700 text-white" : ""
              }`}
              title={isPaused ? "Resume Recording" : "Pause Recording"}
            >
              {isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={onToggleFlip}
              variant="outline"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
              title="Flip Horizontally"
            >
              <FlipHorizontal className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      
      {!isRecording && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <div className="flex items-center mr-4">
              <Camera className="h-3.5 w-3.5 mr-1 text-purple-600" />
              <span>Camera</span>
            </div>
            <div className="flex items-center mr-4">
              <ScreenShare className="h-3.5 w-3.5 mr-1 text-purple-600" />
              <span>Screen</span>
            </div>
            <div className="flex items-center">
              <Mic className="h-3.5 w-3.5 mr-1 text-purple-600" />
              <span>Microphone</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
