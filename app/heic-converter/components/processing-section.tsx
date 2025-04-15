"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ConversionJob } from "@/lib/services/heic-converter-service"

interface ProcessingSectionProps {
  files: File[]
  settings: any
  progress: number
  error: string | null
  job: ConversionJob | null
}

export default function ProcessingSection({ 
  files, 
  settings, 
  progress, 
  error,
  job
}: ProcessingSectionProps) {
  // Determine the current processing status text
  const getStatusText = () => {
    if (error) return "Error";
    
    // Show "Uploading" status when job exists but has no files yet (still uploading)
    if (job && (!job.files || job.files.length === 0)) {
      return "Uploading files...";
    }
    
    // For regular processing
    if (progress <= 0) return "Starting...";
    if (progress >= 100) return "Complete";
    return "Processing...";
  };
  
  // Get the file being processed
  const getCurrentFile = () => {
    if (!job || !job.files) return null;
    
    // Find a file that's in "processing" status
    const processingFile = job.files.find(file => file.status === 'processing');
    if (processingFile) {
      return processingFile.originalName;
    }
    
    // If we have no files yet, we're likely still in upload phase
    if (job.files.length === 0) {
      // Show upload status based on job ID
      return files && files.length > 0 ? files[0].name : "files";
    }
    
    return null;
  };
  
  // Calculate more accurate progress including upload phase
  const calculateProgress = () => {
    if (error) return 0;
    if (!job) return 0;
    
    // If we have no files yet, we're in upload phase (show 10% progress)
    if (!job.files || job.files.length === 0) {
      return 10;
    }
    
    // Calculate what percentage of files have been processed
    const totalFiles = files.length;
    const uploadedFiles = job.files.length;
    const uploadProgress = (uploadedFiles / totalFiles) * 20; // Upload is 20% of total progress
    
    // For conversion progress, use the reported progress
    const conversionProgress = job.progress * 0.8; // Conversion is 80% of total progress
    
    return Math.min(Math.round(uploadProgress + conversionProgress), 99);
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-center">Processing Your Files</h3>
      <div className="text-center text-gray-500 text-lg">
        {getStatusText()}
      </div>

      <Progress value={calculateProgress()} className="w-full h-2" />
      <div className="text-center text-gray-500">
        {calculateProgress()}% complete
      </div>

      {getCurrentFile() && (
        <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
          <h4 className="font-semibold">Currently Processing</h4>
          <p className="text-sm text-blue-800">{getCurrentFile()}</p>
        </div>
      )}

      {job && job.files && job.files.length === 0 && (
        <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
          <h4 className="font-semibold">Upload Phase</h4>
          <p className="text-sm text-blue-800">Uploading {files.length} files to server...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a few minutes for large files.</p>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

