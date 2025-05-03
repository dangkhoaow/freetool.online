"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Settings
} from "lucide-react"

export default function OutputSection({ 
  videoUrl, 
  videoBlob,
  segments,
  task,
  onBackToSettings,
  settings
}: { 
  videoUrl: string | null;
  videoBlob: Blob | null;
  segments?: any[];
  task: 'convert' | 'trim' | 'split' | 'merge';
  onBackToSettings: () => void;
  settings: any;
}) {
  const [copied, setCopied] = React.useState(false)
  const [mergeInfo, setMergeInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    console.log('Output section mounted with URL:', videoUrl);
    console.log('Output file exists:', !!videoBlob);
    
    // Try to get merge info from session storage
    try {
      const storedInfo = sessionStorage.getItem('mergedVideoInfo');
      if (storedInfo) {
        const info = JSON.parse(storedInfo);
        console.log('Retrieved merge info from storage:', info);
        setMergeInfo(info);
      }
    } catch (e) {
      console.error('Error retrieving merge info:', e);
    }
    
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
      console.log('Video source set to:', videoUrl);
    }
  }, [videoUrl, videoBlob]);
  
  // Format file name based on settings
  const getFileName = () => {
    const date = new Date().toISOString().slice(0, 10)
    if (task === 'trim') {
      return `video_trimmed_${date}.${getExt()}`
    } else if (task === 'split') {
      return `video_split_${date}.${getExt()}`
    } else if (task === 'merge') {
      return `video_merged_${date}.${getExt()}`
    } else {
      return `video_converted_${date}.${getExt()}`
    }
  }

  // Helper to get the correct extension based on output format
  function getExt() {
    if (settings?.format === 'mov' || settings?.format === 'quicktime') return 'mov';
    if (settings?.format === 'webm') return 'webm';
    return 'mp4';
  }
  
  // Handle download
  const handleDownload = () => {
    if (!videoUrl) return
    
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = getFileName()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  // Copy share link
  const handleCopyLink = () => {
    // In a real implementation, this would generate a sharable link
    // For now, we'll just simulate copying text
    navigator.clipboard.writeText("https://freetool.online/shared-video/example")
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
      })
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Your Video is Ready</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {task === 'merge' ? 
            'Preview your merged video below and download when ready' : 
            'Preview your processed video below and download when ready'}
        </p>
      </div>
      
      {/* Video preview */}
      <div className="rounded-lg overflow-hidden bg-gray-900 shadow-lg">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            className="w-full m-auto" 
            controls
            autoPlay
            style={{ maxHeight: 'calc(100vh - 20rem)' }}
            ref={videoRef}
          />
        ) : (
          <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
            <p className="text-gray-400">No preview available</p>
          </div>
        )}
      </div>
      
      {/* Download and share options */}
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        {task === 'split' && segments && segments.length > 0 ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            {segments.map((segment, index) => (
              <Button 
                key={index}
                onClick={() => {
                  if (!segment.url) return;
                  const a = document.createElement('a');
                  a.href = segment.url;
                  a.download = `split_part_${index + 1}_${getFileName()}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!segment.url}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Segment {index + 1}
              </Button>
            ))}
          </div>
        ) : (
          <Button 
            onClick={handleDownload}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!videoUrl}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Video
          </Button>
        )}
        
        <div className="flex flex-1 gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onBackToSettings}
          >
            <Settings className="h-3 w-3 mr-1" />
            Edit Settings
          </Button>
        </div>
      </div>
      
      {/* Split segments list */}
      {task === 'split' && segments && segments.length > 0 && (
        <div className="mt-6 border rounded-lg p-4 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-3 dark:text-white">Split Segments</h4>
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div>
                  <span className="text-sm font-medium dark:text-white">Segment {index + 1}</span>
                  {segment.duration && (
                    <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                      Duration: {formatTime(segment.duration)}
                    </span>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    if (!segment.url) return;
                    videoRef.current!.src = segment.url;
                    videoRef.current!.load();
                    videoRef.current!.play();
                  }}
                >
                  Preview
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Video details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2 dark:text-white">Video Format</h4>
          <p className="text-gray-700 dark:text-gray-300">
            {settings?.format === 'mp4' ? 'MP4 (H.264)' :
             settings?.format === 'mov' || settings?.format === 'quicktime' ? 'QuickTime (MOV, H.264)' :
             settings?.format === 'webm' ? 'WebM (VP9)' :
             'Unknown'}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2 dark:text-white">Resolution</h4>
          <p className="text-gray-700 dark:text-gray-300">
            {settings?.resolution && settings?.resolution !== 'original' ? settings.resolution + 'p' : 'Original Resolution'}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2 dark:text-white">Processing Type</h4>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Task:</span>{" "}
            {task === 'convert' ? 'Format Conversion' :
             task === 'trim' ? 'Video Trimming' :
             task === 'split' ? 'Video Splitting' :
             task === 'merge' ? 'Video Merging' :
             'Video Processing'}
          </p>
        </div>
      </div>
      
      {/* Share on social media */}
      {/* <div className="border-t pt-6 mt-6 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-4 dark:text-white">Share on Social Media</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full p-2">
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full p-2">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full p-2">
            <Linkedin className="h-4 w-4" />
          </Button>
        </div>
      </div> */}
      
      {/* Video settings used */}
      <div className="border-t pt-6 mt-6 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium dark:text-white">Settings Used</h4>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {JSON.stringify({
              task: task,
              format: settings.format,
              codec: settings.codec,
              quality: settings.quality,
              performanceMode: settings.performanceMode || 'balanced',
              resolution: settings.resolution,
              ...(settings.resolution === 'custom' && {
                customWidth: settings.customWidth,
                customHeight: settings.customHeight
              }),
              ...(task === 'trim' && {
                startTime: formatTime(settings.startTime),
                endTime: formatTime(settings.endTime || 0)
              }),
              ...(task === 'split' && {
                splitPoints: settings.splitPoints?.map((p: number) => formatTime(p)) || []
              }),
              ...(task === 'merge' && {
                mergeClips: settings.mergeClips?.length || 0,
                transition: settings.transition
              })
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

// Helper to format seconds to MM:SS
function formatTime(seconds: number): string {
  if (!seconds && seconds !== 0) return "00:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
