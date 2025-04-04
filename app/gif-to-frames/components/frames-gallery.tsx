"use client"

import { Button } from "@/components/ui/button"
import { Download, DownloadCloud, Eye, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface FramesGalleryProps {
  frames: string[];
  settings: {
    outputFormat: string;
    fps: number;
  };
  fileName: string;
  onReset: () => void;
}

export default function FramesGallery({ frames, settings, fileName, onReset }: FramesGalleryProps) {
  const [activeFrame, setActiveFrame] = useState<number | null>(null);
  
  // Extract base name without extension
  const baseFileName = fileName.split('.')[0] || 'frame';
  
  const closePreview = () => {
    setActiveFrame(null);
  };
  
  // In a real implementation, these functions would actually download the files
  const downloadFrame = (frameIndex: number) => {
    // This would download the specific frame
    console.log(`Downloading frame ${frameIndex + 1}`);
    
    // Simulate download by opening the image in a new tab for demo purposes
    window.open(frames[frameIndex], '_blank');
  };
  
  const downloadAllFrames = () => {
    // This would create a ZIP file with all frames and download it
    console.log(`Downloading all ${frames.length} frames as ZIP`);
    
    // For demo purposes, show alert
    alert(`In a production environment, this would download all ${frames.length} frames as a ZIP file.`);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Extracted Frames</h3>
      
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center">
        <div className="bg-green-100 rounded-full p-1 mr-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-green-600"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div>
          <p className="text-green-800 font-medium">Frame Extraction Complete!</p>
          <p className="text-sm text-green-700">
            Successfully extracted {frames.length} frames from "{fileName}" 
            as {settings.outputFormat.toUpperCase()} images.
          </p>
        </div>
      </div>
      
      {/* Frame Download Options */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-medium">Download Options</h4>
          <p className="text-sm text-gray-500">Download individual frames or all at once</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Convert Another File
          </Button>
          <Button size="sm" onClick={downloadAllFrames}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Download All as ZIP
          </Button>
        </div>
      </div>
      
      {/* Frames Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {frames.map((frame, index) => (
          <div key={index} className="border rounded-lg overflow-hidden bg-white">
            <div className="relative aspect-square bg-gray-100">
              <Image 
                src={frame} 
                alt={`Frame ${index + 1}`} 
                fill 
                className="object-cover" 
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                #{index + 1}
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-2 truncate">{`${baseFileName}_${index + 1}.${settings.outputFormat}`}</p>
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => setActiveFrame(index)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="default" size="sm" onClick={() => downloadFrame(index)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Frame Preview Modal */}
      {activeFrame !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Frame #{activeFrame + 1}</h3>
              <button onClick={closePreview} className="p-1 rounded-full hover:bg-gray-100">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <div className="relative w-full max-w-2xl aspect-video">
                <Image 
                  src={frames[activeFrame]} 
                  alt={`Frame ${activeFrame + 1}`} 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <p className="text-sm text-gray-600">
                {`${baseFileName}_${activeFrame + 1}.${settings.outputFormat}`} •  
                Frame {activeFrame + 1} of {frames.length}
              </p>
              <Button size="sm" onClick={() => downloadFrame(activeFrame)}>
                <Download className="h-4 w-4 mr-2" />
                Download Frame
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom CTA Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Convert Another File
          </Button>
          <Button variant="default" onClick={downloadAllFrames}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Download All as ZIP
          </Button>
        </div>
      </div>
    </div>
  )
}
