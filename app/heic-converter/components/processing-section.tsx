"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, Zap, AlertCircle, Upload, ClockIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConversionJob } from "@/lib/services/heic-converter-service"
import React, { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"

interface ProcessingSectionProps {
  files: File[]
  settings: any
  progress: number
  error: string | null
  job: ConversionJob | null
}

export default function ProcessingSection({ files, settings, progress, error, job }: ProcessingSectionProps) {
  // State to track queued files vs. actively uploading files
  const [uploadStatus, setUploadStatus] = useState<{
    uploading: string[];
    queued: string[];
  }>({ uploading: [], queued: [] });

  // Effect to handle file processing progress
  useEffect(() => {
    // Listen for events dispatched by the service about file upload status
    const handleFileStatusUpdate = (event: any) => {
      const { status, files } = event.detail;
      if (status && files) {
        setUploadStatus({
          uploading: files.filter((f: any) => f.status === 'uploading').map((f: any) => f.originalName || f.name),
          queued: files.filter((f: any) => f.status === 'queued').map((f: any) => f.originalName || f.name)
        });
      }
    };

    window.addEventListener('fileUploadStatusUpdate', handleFileStatusUpdate);
    return () => {
      window.removeEventListener('fileUploadStatusUpdate', handleFileStatusUpdate);
    };
  }, []);
  
  // Calculate which file is being processed more accurately
  const fileProgress = Math.min(Math.floor((progress / 100) * files.length), files.length - 1);
  
  // For safety, check if an edge case has inconsistent status
  const hasInconsistentStatus = React.useMemo(() => {
    if (job?.status === 'failed' && job?.files) {
      // If marked as failed but all files completed, consider it inconsistent
      const completedFiles = job.files.filter(f => f.status === 'completed');
      return completedFiles.length === job.files.length;
    }
    return false;
  }, [job]);
  
  // Get actual completed file count from job status
  const completedFiles = React.useMemo(() => {
    if (!job?.files) return 0;
    return job.files.filter(f => f.status === 'completed').length;
  }, [job]);
  
  // Get current file information - either from job status or fallback to local files array
  const currentFileName = React.useMemo(() => {
    if (!job?.files) return files[fileProgress]?.name || `File ${fileProgress + 1}`;
    
    // Find the file that's currently being processed
    const processingFile = job.files.find(f => f.status === 'processing');
    if (processingFile) return processingFile.originalName || `File ${fileProgress + 1}`;
    
    // If no file is processing but there are pending files, show the first pending one
    const pendingFile = job.files.find(f => f.status === 'pending');
    if (pendingFile) return pendingFile.originalName || `File ${fileProgress + 1}`;
    
    // Otherwise just show the next file after the completed ones
    return job.files[fileProgress]?.originalName || files[fileProgress]?.name || `File ${fileProgress + 1}`;
  }, [job, files, fileProgress]);
    
  // Get the job status details with improved detection
  const jobStatus = job?.status || "processing";
  
  // More accurate status text based on file completions
  const getStatusText = () => {
    if (!job || !job.files) return jobStatus === "processing" ? "Processing" : jobStatus === "pending" ? "Pending" : jobStatus;
    
    const completedFiles = job.files.filter(f => f.status === 'completed').length;
    const failedFiles = job.files.filter(f => f.status === 'failed').length;
    const processingFiles = job.files.filter(f => f.status === 'processing').length;
    const queuedFiles = uploadStatus.queued.length;
    const totalFiles = job.files.length;
    
    if (completedFiles === totalFiles) {
      return hasInconsistentStatus ? "Complete (Syncing status...)" : "Complete";
    }
    
    let statusText = `Processing (${completedFiles}/${totalFiles} files completed`;
    if (failedFiles > 0) {
      statusText += `, ${failedFiles} failed`;
    }
    if (processingFiles > 0) {
      statusText += `, ${processingFiles} processing`;
    }
    if (queuedFiles > 0) {
      statusText += `, ${queuedFiles} queued`;
    }
    statusText += ')';
    
    return statusText;
  };
  
  const processingText = getStatusText();
  
  // Display actual file progress regardless of overall job status
  const actualProgress = React.useMemo(() => {
    if (!job?.files) return progress;
    
    const completedFiles = job.files.filter(f => f.status === 'completed').length;
    const totalFiles = job.files.length;
    
    return totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : progress;
  }, [job, progress]);

  // More accurate "in progress" status description
  const getProgressDescription = () => {
    if (!job?.files) return `Converting ${fileProgress + 1} of ${files.length} files`;
    
    const completedCount = job.files.filter(f => f.status === 'completed').length;
    const failedCount = job.files.filter(f => f.status === 'failed').length;
    const processingCount = job.files.filter(f => f.status === 'processing').length;
    const pendingCount = job.files.filter(f => f.status === 'pending').length;
    
    if (completedCount === files.length) {
      return `All ${files.length} files converted`;
    }
    
    if (failedCount === files.length) {
      return `All ${files.length} files failed`;
    }
    
    if (processingCount > 0) {
      return `Converting file ${completedCount + 1} of ${files.length}`;
    }
    
    return `Converted ${completedCount} of ${files.length} files${failedCount > 0 ? `, ${failedCount} failed` : ''}`;
  };

  // Function to get the current file being processed
  const getCurrentFileText = () => {
    if (!job?.files || job.files.length === 0) {
      return "Preparing to convert files...";
    }

    // Look for a file with 'processing' status
    const processingFile = job.files.find(file => file.status === 'processing');
    if (processingFile) {
      return `Converting: ${processingFile.originalName || 'file'}`;
    }

    // If no file is currently processing, show counts of completed/failed files
    const completedFiles = job.files.filter(file => file.status === 'completed').length;
    const failedFiles = job.files.filter(file => file.status === 'failed').length;
    const totalFiles = job.files.length;
    
    if (completedFiles === totalFiles) {
      return "All files converted successfully!";
    } else if (completedFiles + failedFiles === totalFiles) {
      return `Converted ${completedFiles} of ${totalFiles} files. ${failedFiles} files failed.`;
    }
    
    // Otherwise, just show the progress
    return `Converting ${completedFiles} of ${totalFiles} files (${progress}%)...`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Processing Your Files</h2>
        <p className="text-lg text-muted-foreground">
          {processingText}
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {progress}% complete
        </p>
      </div>
      
      <div className="bg-muted rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="font-medium">Currently Processing</p>
            <p className="text-sm text-muted-foreground truncate">{currentFileName}</p>
          </div>
        </div>
      </div>
      
      {uploadStatus.uploading.length > 0 && (
        <div className="bg-muted rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-blue-600" />
            <div className="w-full">
              <p className="font-medium">Currently Uploading ({uploadStatus.uploading.length})</p>
              <div className="text-sm text-muted-foreground max-h-16 overflow-y-auto">
                {uploadStatus.uploading.map((name, i) => (
                  <p key={i} className="truncate">{name}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {uploadStatus.queued.length > 0 && (
        <div className="bg-muted rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
            <div className="w-full">
              <p className="font-medium">In Queue ({uploadStatus.queued.length})</p>
              <div className="text-sm text-muted-foreground max-h-24 overflow-y-auto">
                {uploadStatus.queued.map((name, i) => (
                  <p key={i} className="truncate">{name}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

