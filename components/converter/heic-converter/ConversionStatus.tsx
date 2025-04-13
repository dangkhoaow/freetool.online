import React, { useCallback, useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { syncJobStatus, fixAllFailedJobs, fixJobStatus, fixJobUrls } from "../../../lib/api/job-service";
import { useToast } from "@/components/ui/use-toast";
import { ConversionJob } from '../../../lib/services/heic-converter-service';
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface ConversionStatusProps {
  job: ConversionJob;
  userId: string;
  onCheckStatus: () => void;
}

export default function ConversionStatus({ job, userId, onCheckStatus }: ConversionStatusProps) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [statusInconsistent, setStatusInconsistent] = useState(false);
  const [autoFixAttempted, setAutoFixAttempted] = useState(false);
  const autoFixTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFixingUrls, setIsFixingUrls] = useState(false);
  
  // Perform automatic status fix immediately when job has inconsistencies
  const performAutoFix = useCallback(async (jobId: string) => {
    try {
      console.log('🔄 Auto-fixing job status:', jobId);
      const result = await fixJobStatus(jobId, userId);
      
      if (result.success) {
        console.log('✅ Auto-fix successful:', result);
        // Refresh the job status
        onCheckStatus();
        
        // Show a subtle success toast
        toast({
          title: "Job status automatically synced",
          description: "Detected and fixed inconsistency in job status",
          className: "bg-green-50 border-green-200",
        });
      } else {
        console.log('❌ Auto-fix failed:', result.message);
        // No toast for failures, just log to console
      }
    } catch (error) {
      console.error('❌ Error during auto-fix:', error);
    }
    
    // Always mark as attempted regardless of outcome
    setAutoFixAttempted(true);
  }, [userId, onCheckStatus, toast]);

  // Check for status inconsistencies and immediately fix
  useEffect(() => {
    // Skip if no job or already attempted fix
    if (!job || !job.jobId || autoFixAttempted) return;

    // Clear any existing timeout to prevent multiple calls
    if (autoFixTimeoutRef.current) {
      clearTimeout(autoFixTimeoutRef.current);
      autoFixTimeoutRef.current = null;
    }
    
    console.log('📊 Job details:', {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      fileCount: job.files?.length || 0
    });
    
    // Check for inconsistencies
    if (job.files && job.files.length > 0) {
      const completedFiles = job.files.filter(file => file.status === 'completed').length;
      const failedFiles = job.files.filter(file => file.status === 'failed').length;
      const processingFiles = job.files.filter(file => file.status === 'processing').length;
      const pendingFiles = job.files.filter(file => file.status === 'pending').length;
      const totalFiles = job.files.length;
      
      console.log('📊 File status breakdown:', {
        completed: completedFiles,
        failed: failedFiles,
        processing: processingFiles,
        pending: pendingFiles,
        total: totalFiles
      });
      
      // Clear conditions for inconsistency:
      const isInconsistent = (
        // Case 1: Job failed but all files completed
        (job.status === 'failed' && completedFiles === totalFiles) ||
        // Case 2: Job failed but some files completed and no processing/pending files
        (job.status === 'failed' && completedFiles > 0 && processingFiles === 0 && pendingFiles === 0) ||
        // Case 3: Job shows 0 progress but files have progress
        (job.progress === 0 && job.files.some(file => file.status === 'completed'))
      );
      
      setStatusInconsistent(isInconsistent);
      
      if (isInconsistent) {
        console.log('⚠️ Status inconsistency detected:', {
          jobStatus: job.status,
          jobProgress: job.progress,
          completedFiles,
          totalFiles
        });
        
        // Immediately call the fix API
        performAutoFix(job.jobId);
      }
    }
    
    // Cleanup function
    return () => {
      if (autoFixTimeoutRef.current) {
        clearTimeout(autoFixTimeoutRef.current);
        autoFixTimeoutRef.current = null;
      }
    };
  }, [job, performAutoFix, autoFixAttempted]);

  const handleSyncStatus = useCallback(async () => {
    if (!job?.jobId) return;
    
    setIsSyncing(true);
    try {
      console.log('🔄 Manual sync for job:', job.jobId);
      const result = await syncJobStatus(job.jobId, userId);
      
      if (result.success) {
        toast({
          title: "Status synced successfully",
          description: "The job status has been updated"
        });
        // Refresh the job status
        onCheckStatus();
      } else {
        console.error('Sync failed with error:', result.message);
        
        // Try direct fix as fallback
        const fixResult = await fixJobStatus(job.jobId, userId);
        if (fixResult.success) {
          toast({
            title: "Status fixed successfully",
            description: "The job status has been updated using direct fix"
          });
          // Refresh the job status
          onCheckStatus();
        } else {
          toast({
            title: "Fix failed",
            description: fixResult.message || "Failed to fix job status",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error syncing job status:', error);
      toast({
        title: "Failed to sync status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [job?.jobId, userId, toast, onCheckStatus]);

  const handleFixAllJobs = useCallback(async () => {
    setIsFixingAll(true);
    try {
      const result = await fixAllFailedJobs(userId);
      if (result.success) {
        toast({
          title: "Job statuses fixed",
          description: result.message || `Fixed ${result.fixedCount || 0} jobs`
        });
        // Refresh the job status
        onCheckStatus();
      } else {
        toast({
          title: "Fix failed",
          description: result.message || "Failed to fix job statuses",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fixing all job statuses:', error);
      toast({
        title: "Failed to fix statuses",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsFixingAll(false);
    }
  }, [userId, toast, onCheckStatus]);

  // Fix URLs function
  const handleFixUrls = useCallback(async () => {
    if (!job?.jobId || !userId) return;
    
    setIsFixingUrls(true);
    try {
      const result = await fixJobUrls(job.jobId, userId);
      
      if (result.success) {
        toast({
          title: "URLs fixed",
          description: "The file URLs have been fixed successfully.",
        });
        
        // Refresh job status to get updated URLs
        if (onCheckStatus) {
          onCheckStatus();
        }
      } else {
        toast({
          title: "Error fixing URLs",
          description: result.message || "An error occurred while fixing the file URLs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fixing URLs:", error);
      toast({
        title: "Error fixing URLs",
        description: "An unexpected error occurred while fixing the file URLs.",
        variant: "destructive",
      });
    } finally {
      setIsFixingUrls(false);
    }
  }, [job?.jobId, userId, toast, onCheckStatus]);

  // Only show sync button if first auto-fix attempt failed
  const renderSyncButton = () => {
    if (!job) return null;
    
    const hasCompletedFiles = job.files?.some(file => file.status === 'completed') || false;
    const canShowManualButton = job.status === 'failed' && hasCompletedFiles && autoFixAttempted;
    
    if (canShowManualButton) {
      return (
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncStatus}
            disabled={isSyncing}
            className="bg-amber-50 hover:bg-amber-100 border-amber-200 w-full sm:w-auto"
          >
            {isSyncing ? 
              <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing...</> : 
              <><RefreshCw className="h-3 w-3 mr-1" /> Fix Job Status</>
            }
          </Button>
          
          {/* Add Fix URLs button */}
          <Button
            variant="outline"
            onClick={handleFixUrls}
            disabled={isFixingUrls}
            className="w-full sm:w-auto"
          >
            {isFixingUrls ? 'Fixing URLs...' : 'Fix URLs'}
          </Button>

          {job.status === 'failed' && (
            <Button
              variant="destructive"
              onClick={handleSyncStatus}
              disabled={isSyncing}
              className="w-full sm:w-auto"
            >
              {isSyncing ? 'Processing...' : 'Fix failed files'}
            </Button>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Determine the status text to display based on file statuses
  const getStatusText = () => {
    if (!job) return "Unknown";
    
    if (job.status === "completed") return "Complete";
    
    if (job.status === "failed") {
      // Check if this is a false failure (files are actually completed)
      if (job.files?.every(file => file.status === "completed")) {
        return autoFixAttempted ? "Fixing Status..." : "Complete (Fixing status...)";
      }
      
      if (job.files?.some(file => file.status === "completed")) {
        return "Partially Complete";
      }
      
      return "Failed";
    }
    
    // For processing/pending
    if (job.files) {
      const completedCount = job.files.filter(file => file.status === "completed").length;
      const totalFiles = job.files.length;
      
      if (completedCount > 0) {
        return `Processing (${completedCount}/${totalFiles} files completed)`;
      }
    }
    
    return "Processing";
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold flex items-center gap-2">
            Conversion Status: {getStatusText()}
            {statusInconsistent && (
              <span className="text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-1 inline-flex items-center gap-1">
                <RefreshCw className={`h-3 w-3 ${autoFixAttempted ? '' : 'animate-spin'}`} /> 
                {autoFixAttempted ? "Fixing status..." : "Fixing inconsistency..."}
              </span>
            )}
          </div>
          {renderSyncButton()}
        </div>
        
        <Progress value={job?.progress || 0} className="h-2" />
        
        {job?.status === "failed" && job.error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
            {job.error}
            {statusInconsistent && (
              <div className="mt-1 text-amber-600 flex items-center gap-1">
                <RefreshCw className={`h-3 w-3 ${autoFixAttempted ? '' : 'animate-spin'}`} />
                {autoFixAttempted ? 
                  "Status is being synchronized automatically..." : 
                  "Some files appear to be completed despite the error. Fixing automatically..."}
              </div>
            )}
          </div>
        )}
        
        {job?.files && job.files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Files:</h3>
            <ul className="space-y-2">
              {job.files.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[200px]">
                    {file.originalName || (file as any).name || `File ${index + 1}`}
                  </span>
                  <span className={`flex items-center gap-1 ${file.status === "completed" ? "text-green-500" : file.status === "failed" ? "text-red-500" : "text-yellow-500"}`}>
                    {file.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                    {file.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFixAllJobs}
            disabled={isFixingAll}
          >
            {isFixingAll ? 
              <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Fixing All Jobs...</> : 
              <><RefreshCw className="h-3 w-3 mr-1" /> Fix All Failed Jobs</>
            }
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            This will check for completed files in all failed jobs and update their status
          </p>
        </div>
      </div>
    </div>
  );
}