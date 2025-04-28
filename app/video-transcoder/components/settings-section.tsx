"use client"

import React, { useRef, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileCog, 
  Split, 
  Scissors, 
  Merge,
  RefreshCw,
  Play,
  X
} from "lucide-react"

// Define output format options
const formatOptions = [
  { id: "mp4-h264", name: "MP4 (H.264)", description: "Best compatibility" },
  { id: "webm-vp9", name: "WebM (VP9)", description: "Better compression" },
  { id: "mp4-av1", name: "MP4 (AV1)", description: "Next-gen codec" },
  { id: "mov-h264", name: "QuickTime", description: "For Apple devices" }
]

// Define resolution options
const resolutionOptions = [
  { id: "original", name: "Original" },
  { id: "1080p", name: "1080p (1920×1080)" },
  { id: "720p", name: "720p (1280×720)" },
  { id: "480p", name: "480p (854×480)" },
  { id: "360p", name: "360p (640×360)" }
]

// Settings section component
export default function SettingsSection({
  settings,
  videoMetadata,
  onUpdateSettings,
  onAddVideoToMerge,
  onUpdateMergeClip,
  onRemoveMergeClip,
  onStartProcessing,
  formatTime
}: {
  settings: any;
  videoMetadata: any;
  onUpdateSettings: (settings: any) => void;
  onAddVideoToMerge: (file: File) => void;
  onUpdateMergeClip?: (clipId: string, updates: any) => void;
  onRemoveMergeClip?: (clipId: string) => void;
  onStartProcessing?: () => void;
  formatTime: (seconds: number) => string;
}) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activeSplitPointRef = useRef<number | null>(null)
  const [activeClipId, setActiveClipId] = useState<string | null>(null)
  const [dragType, setDragType] = useState<'start' | 'end' | null>(null)
  
  // Handle task type selection
  const handleTaskChange = (task: 'convert' | 'trim' | 'split' | 'merge') => {
    onUpdateSettings({ task })
  }
  
  // Handle format selection
  const handleFormatChange = (formatId: string) => {
    const [format, codec] = formatId.split('-')
    onUpdateSettings({ format, codec })
  }
  
  // Handle quality change
  const handleQualityChange = (value: number[]) => {
    onUpdateSettings({ quality: value[0] })
  }
  
  // Handle resolution change
  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ resolution: e.target.value })
  }
  
  // Handle trim points change
  const handleTrimPointsChange = (startTime: number, endTime: number) => {
    onUpdateSettings({ startTime, endTime })
  }
  
  // Handle split points update
  const handleSplitPointsChange = (splitPoints: number[]) => {
    onUpdateSettings({ splitPoints })
  }
  
  // Update timeline drag position
  const updatePositionFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!timelineRef.current || !videoMetadata) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    const time = ratio * videoMetadata.duration
    
    if (settings.task === 'trim') {
      if (isDraggingRef.current) {
        if (Math.abs(time - settings.startTime) < Math.abs(time - (settings.endTime || videoMetadata.duration))) {
          onUpdateSettings({ startTime: time })
        } else {
          onUpdateSettings({ endTime: time })
        }
      }
    } else if (settings.task === 'split') {
      if (activeSplitPointRef.current !== null) {
        const newSplitPoints = [...settings.splitPoints]
        newSplitPoints[activeSplitPointRef.current] = time
        handleSplitPointsChange(newSplitPoints.sort((a, b) => a - b))
      }
    }
  }
  
  // Add mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        updatePositionFromEvent(e as unknown as React.MouseEvent)
      }
    }
    
    const handleMouseUp = () => {
      isDraggingRef.current = false
      activeSplitPointRef.current = null
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [settings.task, settings.splitPoints, videoMetadata])
  
  // Add split point
  const addSplitPoint = () => {
    if (!videoMetadata) return
    
    // Calculate a reasonable position for the new split point
    const existingPoints = [...settings.splitPoints]
    const sortedPoints = [0, ...existingPoints, videoMetadata.duration].sort((a, b) => a - b)
    
    // Find the largest gap
    let maxGap = 0
    let maxGapIndex = 0
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const gap = sortedPoints[i + 1] - sortedPoints[i]
      if (gap > maxGap) {
        maxGap = gap
        maxGapIndex = i
      }
    }
    
    // Add a point in the middle of the largest gap
    const newPoint = sortedPoints[maxGapIndex] + maxGap / 2
    const newSplitPoints = [...existingPoints, newPoint].sort((a, b) => a - b)
    
    handleSplitPointsChange(newSplitPoints)
  }
  
  // Remove split point
  const removeSplitPoint = (index: number) => {
    const newSplitPoints = [...settings.splitPoints]
    newSplitPoints.splice(index, 1)
    handleSplitPointsChange(newSplitPoints)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold dark:text-white">Video Settings</h3>
      </div>
      
      {/* Task selection tabs */}
      <Tabs 
        value={settings.task} 
        onValueChange={(value) => handleTaskChange(value as any)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="convert">
            <FileCog className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Convert</span>
          </TabsTrigger>
          <TabsTrigger value="trim">
            <Scissors className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Trim</span>
          </TabsTrigger>
          <TabsTrigger value="split">
            <Split className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Split</span>
          </TabsTrigger>
          <TabsTrigger value="merge">
            <Merge className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Merge</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Convert settings */}
        <TabsContent value="convert" className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Output Format</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formatOptions.map(format => (
                <div
                  key={format.id}
                  onClick={() => handleFormatChange(format.id)}
                  className={`
                    p-4 border rounded-lg text-center cursor-pointer transition
                    ${settings.format + '-' + settings.codec === format.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-white'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:text-gray-300'}
                  `}
                >
                  <div className="font-medium mb-1">{format.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{format.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Quality</h4>
            <div className="px-2">
              <Slider
                value={[settings.quality]}
                min={1}
                max={5}
                step={1}
                onValueChange={handleQualityChange}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Smaller file size</span>
                <span>Higher quality</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Resolution</h4>
            <select
              value={settings.resolution}
              onChange={handleResolutionChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {resolutionOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </TabsContent>
        
        {/* Trim settings */}
        <TabsContent value="trim" className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Trim Start and End</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drag the markers to set start and end points for your video
            </p>
            
            {/* Video timeline */}
            <div 
              ref={timelineRef}
              className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 cursor-pointer"
              onClick={(e) => {
                if (timelineRef.current && videoMetadata?.duration) {
                  // Calculate position within timeline
                  const rect = timelineRef.current.getBoundingClientRect();
                  const position = (e.clientX - rect.left) / rect.width;
                  const timePosition = position * videoMetadata.duration;
                  
                  // Determine if we're closer to start or end marker to decide which to update
                  const distToStart = Math.abs(timePosition - settings.startTime);
                  const distToEnd = Math.abs(timePosition - (settings.endTime || videoMetadata.duration));
                  
                  if (distToStart < distToEnd) {
                    // Update start time
                    if (timePosition < (settings.endTime || videoMetadata.duration)) {
                      onUpdateSettings({ startTime: timePosition });
                    }
                  } else {
                    // Update end time
                    if (timePosition > settings.startTime) {
                      onUpdateSettings({ endTime: timePosition });
                    }
                  }
                }
              }}
            >
              {/* Progress bar */}
              <div 
                className="absolute h-full bg-blue-600 rounded-l-full opacity-30"
                style={{ 
                  width: `${(settings.startTime / videoMetadata?.duration || 0) * 100}%` 
                }}
              />
              
              {/* Selected area */}
              <div 
                className="absolute h-full bg-blue-600 opacity-50"
                style={{ 
                  left: `${(settings.startTime / videoMetadata?.duration || 0) * 100}%`,
                  width: `${((settings.endTime || videoMetadata?.duration || 0) - settings.startTime) / (videoMetadata?.duration || 1) * 100}%` 
                }}
              />
              
              {/* Start handle */}
              <div 
                className="absolute top-0 w-4 h-8 bg-blue-600 rounded-full -ml-2 cursor-ew-resize z-10"
                style={{ left: `${(settings.startTime / videoMetadata?.duration || 0) * 100}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  
                  // Set up for dragging the start handle
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    if (timelineRef.current && videoMetadata?.duration) {
                      const rect = timelineRef.current.getBoundingClientRect();
                      const position = (moveEvent.clientX - rect.left) / rect.width;
                      const newStartTime = Math.max(0, Math.min(position * videoMetadata.duration, (settings.endTime || videoMetadata.duration) - 0.5));
                      
                      // Update the start time
                      onUpdateSettings({ startTime: newStartTime });
                    }
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              {/* End handle */}
              <div 
                className="absolute top-0 w-4 h-8 bg-blue-600 rounded-full -ml-2 cursor-ew-resize z-10"
                style={{ left: `${((settings.endTime || videoMetadata?.duration || 0) / videoMetadata?.duration || 0) * 100}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  
                  // Set up for dragging the end handle
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    if (timelineRef.current && videoMetadata?.duration) {
                      const rect = timelineRef.current.getBoundingClientRect();
                      const position = (moveEvent.clientX - rect.left) / rect.width;
                      const newEndTime = Math.max(settings.startTime + 0.5, Math.min(position * videoMetadata.duration, videoMetadata.duration));
                      
                      // Update the end time
                      onUpdateSettings({ endTime: newEndTime });
                    }
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              {/* Time indicators */}
              <div className="absolute -bottom-6 left-0 text-xs text-gray-600 dark:text-gray-400">
                {formatTime(settings.startTime)}
              </div>
              <div className="absolute -bottom-6 right-0 text-xs text-gray-600 dark:text-gray-400">
                {formatTime(settings.endTime || videoMetadata?.duration || 0)}
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <div className="w-1/2">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                <Input
                  type="text"
                  value={formatTime(settings.startTime)}
                  onChange={(e) => {
                    // Parse time input
                    const time = parseTimeInput(e.target.value)
                    if (time !== null && time >= 0 && time < (settings.endTime || videoMetadata?.duration || 0)) {
                      onUpdateSettings({ startTime: time })
                    }
                  }}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                <Input
                  type="text"
                  value={formatTime(settings.endTime || videoMetadata?.duration || 0)}
                  onChange={(e) => {
                    // Parse time input
                    const time = parseTimeInput(e.target.value)
                    if (time !== null && time > settings.startTime && time <= (videoMetadata?.duration || 0)) {
                      onUpdateSettings({ endTime: time })
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Split settings */}
        <TabsContent value="split" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium dark:text-white">Split Points</h4>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addSplitPoint}
                disabled={!videoMetadata || settings.splitPoints.length >= 5}
              >
                Add Split Point
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add points where you want to split the video into multiple clips
            </p>
            
            {/* Video timeline */}
            <div 
              ref={timelineRef}
              className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 cursor-pointer"
              onClick={(e) => {
                if (timelineRef.current && videoMetadata?.duration && settings.task === 'split') {
                  // Calculate position within timeline
                  const rect = timelineRef.current.getBoundingClientRect();
                  const position = (e.clientX - rect.left) / rect.width;
                  const timePosition = position * videoMetadata.duration;
                  
                  // Only add a point if we have fewer than 5 points
                  if (settings.splitPoints.length < 5) {
                    // Avoid adding points too close to existing ones
                    const minDistance = videoMetadata.duration * 0.02; // 2% of total duration
                    const isTooClose = settings.splitPoints.some((point: number) => 
                      Math.abs(timePosition - point) < minDistance
                    );
                    
                    if (!isTooClose) {
                      const newSplitPoints = [...settings.splitPoints, timePosition].sort((a, b) => a - b);
                      handleSplitPointsChange(newSplitPoints);
                    }
                  }
                }
              }}
            >
              {/* Time markers */}
              {videoMetadata?.duration && (
                <div className="absolute top-full mt-1 left-0 right-0 flex justify-between text-xs text-gray-500">
                  <span>{formatTime(0)}</span>
                  <span>{formatTime(videoMetadata.duration / 2)}</span>
                  <span>{formatTime(videoMetadata.duration)}</span>
                </div>
              )}
              
              {/* Split points */}
              {settings.splitPoints.map((point: number, index: number) => (
                <div key={index} className="absolute top-0 -ml-2" style={{ left: `${(point / videoMetadata?.duration || 0) * 100}%` }}>
                <div 
                  className="w-4 h-8 bg-red-500 rounded-full cursor-move z-10"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    
                    // Set up for dragging this split point
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      if (timelineRef.current && videoMetadata?.duration) {
                        const rect = timelineRef.current.getBoundingClientRect();
                        const position = (moveEvent.clientX - rect.left) / rect.width;
                        const newPosition = Math.max(0, Math.min(position * videoMetadata.duration, videoMetadata.duration));
                        
                        // Update the split point
                        const newSplitPoints = [...settings.splitPoints];
                        newSplitPoints[index] = newPosition;
                        handleSplitPointsChange(newSplitPoints.sort((a, b) => a - b));
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div className="absolute -bottom-6 text-xs text-center w-12 -ml-4 text-gray-600 dark:text-gray-400">
                  {formatTime(point)}
                </div>
              </div>
              ))}
              
              {/* Timeline markers */}
              {videoMetadata?.duration && (
                <div className="absolute top-full mt-1 left-0 right-0 flex justify-between text-xs text-gray-500">
                  <span>{formatTime(0)}</span>
                  <span>{formatTime(videoMetadata.duration / 2)}</span>
                  <span>{formatTime(videoMetadata.duration)}</span>
                </div>
              )}
            </div>
            
            {/* Split points list */}
            <div className="space-y-2 mt-6">
              {settings.splitPoints.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 italic py-4">
                  No split points added yet
                </p>
              ) : (
                settings.splitPoints.map((point: number, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs mr-3">
                        {index + 1}
                      </span>
                      <span className="dark:text-white">{formatTime(point)}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeSplitPoint(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Merge settings */}
        <TabsContent value="merge" className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium dark:text-white">Video Timeline</h4>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  // Open file picker to add more videos
                  document.getElementById('merge-file-input')?.click();
                }}
              >
                Add Videos
              </Button>
              <input
                id="merge-file-input"
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  // Call the parent handler to add new video files
                  if (onAddVideoToMerge && e.target.files && e.target.files.length > 0) {
                    onAddVideoToMerge(e.target.files[0]);
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Arrange and trim your videos to combine them into a single file
            </p>
            
            {/* Video timeline - using a design similar to the image */}
            <div className="mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4" ref={timelineRef}>
              {/* Calculate total duration of all clips for dynamic timeline */}
              {(() => {
                // Calculate total duration of clips (sum of all clips' (endTrim - startTrim))
                const totalDuration = settings.mergeClips.reduce(
                  (total: number, clip: any) => total + (clip.endTrim - clip.startTrim), 
                  0
                );
                
                // Calculate reasonable time markers based on actual content
                let maxDuration = totalDuration;
                
                // If the duration is very short, add a small buffer but keep it proportional
                if (maxDuration < 10) {
                  maxDuration = Math.ceil(maxDuration * 1.2); // Add 20% buffer for very short clips
                }
                
                const markerCount = 5;
                const stepSize = Math.ceil(maxDuration / (markerCount - 1));
                const timeMarkers = Array.from({ length: markerCount }, (_, i) => i * stepSize);
                
                return (
                  <>
                    {/* Timeline header with dynamic time markers */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
                      {timeMarkers.map((seconds, index) => (
                        <span key={index}>{formatTime(seconds)}</span>
                      ))}
                    </div>
                    
                    {/* Timeline ruler */}
                    <div className="h-6 relative mb-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                      {/* Dynamic time markers */}
                      {timeMarkers.slice(1, -1).map((_, index) => (
                        <div 
                          key={index}
                          className="absolute top-0 h-full w-px bg-gray-400"
                          style={{ left: `${((index + 1) / (markerCount - 1)) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </>
                );
              })()}
              
              {/* Video clips container */}
              <div className="space-y-3">
                {settings.mergeClips.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No videos added yet. Add videos to start merging.</p>
                  </div>
                ) : (
                  settings.mergeClips
                    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
                    .map((clip: { id: string, position: number, name: string, color: string, duration: number, startTrim: number, endTrim: number }, index: number) => (
                      <div 
                        key={clip.id} 
                        className="flex items-center mb-2 relative"
                      >
                        {/* Add drag handle indicator - positioned outside */}
                        <div className="mr-2 flex flex-col items-center justify-center cursor-move text-gray-400 hover:text-gray-500 absolute left-[-20px]"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('clipId', clip.id);
                            console.log(`Started dragging clip: ${clip.id}, ${clip.name}, position: ${clip.position}`);
                            setActiveClipId(clip.id);
                          }}
                          onDragEnd={(e) => {
                            console.log(`Finished dragging clip: ${clip.id}`);
                            setActiveClipId(null);
                          }}
                        >
                          <div className="h-full w-1 bg-current"></div>
                          <div className="h-full w-1 bg-current"></div>
                          <div className="h-full w-1 bg-current"></div>
                        </div>
                        
                        {/* Up/Down movement buttons */}
                        <div className="mr-2 flex flex-col items-center space-y-1">
                          <button 
                            type="button"
                            className={`w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${index === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            disabled={index === 0}
                            onClick={() => {
                              if (index > 0 && onUpdateMergeClip) {
                                console.log(`Moving clip ${clip.id} up`);
                                
                                // Find the clip above this one
                                const sortedClips = [...settings.mergeClips]
                                  .sort((a: { position: number }, b: { position: number }) => a.position - b.position);
                                
                                const prevClip = sortedClips[index - 1];
                                
                                // Swap positions
                                onUpdateMergeClip(clip.id, { position: prevClip.position });
                                onUpdateMergeClip(prevClip.id, { position: clip.position });
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button 
                            type="button"
                            className={`w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${index === settings.mergeClips.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            disabled={index === settings.mergeClips.length - 1}
                            onClick={() => {
                              if (index < settings.mergeClips.length - 1 && onUpdateMergeClip) {
                                console.log(`Moving clip ${clip.id} down`);
                                
                                // Find the clip below this one
                                const sortedClips = [...settings.mergeClips]
                                  .sort((a: { position: number }, b: { position: number }) => a.position - b.position);
                                
                                const nextClip = sortedClips[index + 1];
                                
                                // Swap positions
                                onUpdateMergeClip(clip.id, { position: nextClip.position });
                                onUpdateMergeClip(nextClip.id, { position: clip.position });
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        <div 
                          className={`flex-1 relative h-12 flex items-center rounded-lg bg-${clip.color}-100 dark:bg-${clip.color}-900/30 overflow-hidden`}
                          style={{
                            borderWidth: activeClipId === clip.id ? 2 : 1,
                            borderColor: `var(--${clip.color}-600)`,
                            borderStyle: 'solid'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault(); // Necessary to allow dropping
                            if (activeClipId !== clip.id) {
                              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                            }
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.boxShadow = 'none';
                            
                            const draggedId = e.dataTransfer.getData('clipId');
                            console.log(`Dropped clip ${draggedId} onto clip ${clip.id}`);
                            
                            if (draggedId && draggedId !== clip.id && onUpdateMergeClip) {
                              // Find the source and target clips
                              const sourceClip = settings.mergeClips.find((c: any) => c.id === draggedId);
                              const targetClip = settings.mergeClips.find((c: any) => c.id === clip.id);
                              
                              if (sourceClip && targetClip) {
                                // Save the original positions 
                                const sourcePosition = sourceClip.position;
                                const targetPosition = targetClip.position;
                                
                                console.log(`Reordering: Moving ${draggedId} from position ${sourcePosition} to position ${targetPosition}`);
                                
                                // Update all clips in between to shift their positions
                                settings.mergeClips.forEach((c: any) => {
                                  // If moving up (smaller position to larger position)
                                  if (sourcePosition < targetPosition) {
                                    if (c.position > sourcePosition && c.position <= targetPosition) {
                                      console.log(`Shifting clip ${c.id} from position ${c.position} to ${c.position - 1}`);
                                      if (onUpdateMergeClip) {
                                        onUpdateMergeClip(c.id, { position: c.position - 1 });
                                      }
                                    }
                                  } 
                                  // If moving down (larger position to smaller position)
                                  else if (sourcePosition > targetPosition) {
                                    if (c.position < sourcePosition && c.position >= targetPosition) {
                                      console.log(`Shifting clip ${c.id} from position ${c.position} to ${c.position + 1}`);
                                      if (onUpdateMergeClip) {
                                        onUpdateMergeClip(c.id, { position: c.position + 1 });
                                      }
                                    }
                                  }
                                });
                                
                                // Finally update the dragged clip's position
                                console.log(`Setting dragged clip ${draggedId} to final position ${targetPosition}`);
                                onUpdateMergeClip(draggedId, { position: targetPosition });
                              }
                            }
                          }}
                        >
                          {/* Basic controls */}
                          <div className="absolute top-0 left-0 right-0 h-full flex items-center justify-center p-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300 text-center">
                              {clip.name.length > 40 ? clip.name.substring(0, 40) + '...' : clip.name}
                            </span>
                          </div>
                          
                          {/* Duration and controls at the bottom */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center text-xs text-center bg-black/10 py-1 px-2">
                            <span className="px-4 text-gray-700 dark:text-gray-300">
                              {formatTime(clip.startTrim)} - {formatTime(clip.endTrim)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-4 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => {
                                if (onRemoveMergeClip) {
                                  console.log(`Removing clip ${clip.id}`);
                                  onRemoveMergeClip(clip.id);
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          
                          {/* Left trim handle - styled as a vertical blue bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-4 bg-blue-600 cursor-ew-resize flex items-center justify-center"
                            style={{
                              left: `${(clip.startTrim / clip.duration) * 100}%`
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              
                              // Track initial mouse position and trim value
                              const startX = e.clientX;
                              const initialTrim = clip.startTrim;
                              
                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                if (!timelineRef.current) return;
                                
                                // Calculate how far mouse has moved
                                const deltaX = moveEvent.clientX - startX;
                                
                                // Convert to time based on timeline width and clip duration
                                const timelineWidth = timelineRef.current.clientWidth;
                                const timePerPixel = clip.duration / timelineWidth;
                                const deltaTime = deltaX * timePerPixel;
                                
                                // Update trim position, keeping within bounds
                                const newStartTrim = Math.max(0, Math.min(clip.endTrim - 0.5, initialTrim + deltaTime));
                                
                                console.log("Left trim update:", { 
                                  clip: clip.id, 
                                  startX, 
                                  currentX: moveEvent.clientX, 
                                  deltaX, 
                                  newStartTrim 
                                });
                                
                                // Update the clip
                                if (onUpdateMergeClip) {
                                  onUpdateMergeClip(clip.id, { startTrim: newStartTrim });
                                }
                              };
                              
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };
                              
                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          >
                            <div className="h-full w-1 bg-white"></div>
                          </div>
                          
                          {/* Right trim handle - styled as a vertical blue bar */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-4 bg-blue-600 cursor-ew-resize flex items-center justify-center"
                            style={{
                              right: `${100 - ((clip.endTrim / clip.duration) * 100)}%`
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              
                              // Track initial mouse position and trim value
                              const startX = e.clientX;
                              const initialTrim = clip.endTrim;
                              
                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                if (!timelineRef.current) return;
                                
                                // Calculate how far mouse has moved
                                const deltaX = moveEvent.clientX - startX;
                                
                                // Convert to time based on timeline width and clip duration
                                const timelineWidth = timelineRef.current.clientWidth;
                                const timePerPixel = clip.duration / timelineWidth;
                                const deltaTime = deltaX * timePerPixel;
                                
                                // Update trim position, keeping within bounds
                                const newEndTrim = Math.max(clip.startTrim + 0.5, Math.min(clip.duration, initialTrim + deltaTime));
                                
                                console.log("Right trim update:", { 
                                  clip: clip.id, 
                                  startX, 
                                  currentX: moveEvent.clientX, 
                                  deltaX, 
                                  newEndTrim 
                                });
                                
                                // Update the clip
                                if (onUpdateMergeClip) {
                                  onUpdateMergeClip(clip.id, { endTrim: newEndTrim });
                                }
                              };
                              
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };
                              
                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          >
                            <div className="h-full w-1 bg-white"></div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
              
              {/* Add a video placeholder */}
              <button 
                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                onClick={() => document.getElementById('merge-file-input')?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add Another Video
              </button>
            </div>
            
            {/* Additional settings */}
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2 dark:text-white">Transition Between Clips</h4>
                <select
                  className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={settings.transition}
                  onChange={(e) => {
                    if (onUpdateSettings) {
                      onUpdateSettings({ transition: e.target.value });
                    }
                  }}
                >
                  <option value="none">None (Cut)</option>
                  <option value="crossfade">Crossfade</option>
                  <option value="fade">Fade to Black</option>
                  <option value="wipe">Wipe</option>
                </select>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 dark:text-white">Output Format</h4>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.slice(0, 2).map(format => (
                    <div
                      key={format.id}
                      onClick={() => handleFormatChange(format.id)}
                      className={`
                        p-4 border rounded-lg text-center cursor-pointer transition
                        ${settings.format + '-' + settings.codec === format.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:text-gray-300'}
                      `}
                    >
                      <div className="font-medium mb-1">{format.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{format.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Info box */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-300">Video Merging Tips</h5>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Drag the handles to trim each video clip</li>
                <li>• Drag and drop videos to reorder them</li>
                <li>• All videos will be merged in the order shown</li>
                <li>• For best results, use videos with similar resolutions</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Process video button */}
      <div className="mt-6">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium flex items-center justify-center"
          onClick={() => {
            if (onStartProcessing) {
              onStartProcessing();
            }
          }}
        >
          <Play className="w-5 h-5 mr-2" />
          Process Video
        </Button>
      </div>
    </div>
  )
}

// Helper to format seconds to MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Helper to parse time input (MM:SS)
function parseTimeInput(timeStr: string): number | null {
  const regex = /^(\d+):([0-5]?\d)$/
  const match = timeStr.match(regex)
  
  if (match) {
    const minutes = parseInt(match[1], 10)
    const seconds = parseInt(match[2], 10)
    return minutes * 60 + seconds
  }
  
  return null
}
