"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConversionJob } from "@/lib/services/heic-converter-service"
import React from "react"

interface ProcessingSectionProps {
  files: File[]
  settings: any
  progress: number
  error: string | null
  job: ConversionJob | null
}

export default function ProcessingSection({ files, settings, progress, error, job }: ProcessingSectionProps) {
  // Calculate which file is currently being processed
  const totalFiles = files.length
  
  // Get actual completed file count from job status
  const completedFiles = React.useMemo(() => {
    if (!job?.files) return 0;
    return job.files.filter(f => f.status === 'completed').length;
  }, [job]);
  
  // Calculate which file is being processed more accurately
  const fileProgress = React.useMemo(() => {
    if (!job?.files) return Math.min(Math.floor((progress / 100) * totalFiles), totalFiles - 1);
    
    // Use actual completed files + 1 (for the one currently processing)
    // but don't exceed the total number of files
    const inProgressFile = job.files.some(f => f.status === 'processing') ? 1 : 0;
    return Math.min(completedFiles + inProgressFile, totalFiles - 1);
  }, [job, completedFiles, progress, totalFiles]);
  
  // Check if there are inconsistencies between overall status and file statuses
  const hasInconsistentStatus = React.useMemo(() => {
    if (!job || !job.files || job.files.length === 0) return false;
    
    const completedFiles = job.files.filter(f => f.status === 'completed').length;
    const failedFiles = job.files.filter(f => f.status === 'failed').length;
    const totalFiles = job.files.length;
    
    // Detect inconsistencies between overall job status and individual file statuses
    return (job.status === 'failed' && completedFiles === totalFiles) || 
           (job.status === 'failed' && completedFiles > 0 && failedFiles === 0) ||
           (job.progress === 0 && completedFiles > 0);
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
    const totalFiles = job.files.length;
    
    if (completedFiles === totalFiles) {
      return hasInconsistentStatus ? "Complete (Syncing status...)" : "Complete";
    }
    
    if (completedFiles > 0 || failedFiles > 0) {
      return `Processing (${completedFiles}/${totalFiles} files completed${failedFiles > 0 ? `, ${failedFiles} failed` : ''})`;
    }
    
    return jobStatus === "processing" ? "Processing" : jobStatus === "pending" ? "Pending" : jobStatus;
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
    if (!job?.files) return `Converting ${fileProgress + 1} of ${totalFiles} files`;
    
    const completedCount = job.files.filter(f => f.status === 'completed').length;
    const failedCount = job.files.filter(f => f.status === 'failed').length;
    const processingCount = job.files.filter(f => f.status === 'processing').length;
    const pendingCount = job.files.filter(f => f.status === 'pending').length;
    
    if (completedCount === totalFiles) {
      return `All ${totalFiles} files converted`;
    }
    
    if (failedCount === totalFiles) {
      return `All ${totalFiles} files failed`;
    }
    
    if (processingCount > 0) {
      return `Converting file ${completedCount + 1} of ${totalFiles}`;
    }
    
    return `Converted ${completedCount} of ${totalFiles} files${failedCount > 0 ? `, ${failedCount} failed` : ''}`;
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
    <div>
      <h3 className="text-xl font-semibold mb-4">Converting Files</h3>

      <div className="space-y-8">
        {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {hasInconsistentStatus && (
              <div className="mt-2 text-amber-600 text-sm">
                Note: Some files appear to have converted successfully despite this error.
                The status will be updated automatically.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium">Overall Progress</p>
          <p className="text-sm text-gray-500">
            {getProgressDescription()}
          </p>
        </div>
        <div className="flex items-center text-primary">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span className="text-sm">{processingText}</span>
        </div>
        </div>

        <div className="space-y-2">
        <Progress value={actualProgress} className="h-2" />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span>{actualProgress}%</span>
          <span>100%</span>
        </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-primary/10 rounded mr-3">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-medium">Currently processing:</p>
              <p className="text-sm text-gray-500">{getCurrentFileText()}</p>
            </div>
          </div>

          {/* Display file status summary if we have file information */}
          {job?.files && job.files.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>File status:</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <span className="text-green-500">Completed: {job.files.filter(f => f.status === 'completed').length}</span>
                <span className="text-red-500">Failed: {job.files.filter(f => f.status === 'failed').length}</span>
                <span className="text-yellow-500">Processing: {job.files.filter(f => f.status === 'processing').length}</span>
                <span className="text-gray-500">Pending: {job.files.filter(f => f.status === 'pending').length}</span>
              </div>
            </div>
          )}

          {settings.aiOptimization && (
            <div className="flex items-center mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Zap className="h-4 w-4 text-blue-500 mr-2" />
              <div className="text-sm text-blue-700">
                AI optimization in progress - this may take a few extra seconds
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Please don't close this window during conversion</p>
          <p>Your files are being processed securely in your browser</p>
        </div>
      </div>
    </div>
  )
}

