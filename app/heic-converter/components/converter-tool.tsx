"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import UploadSection from "./upload-section"
import SettingsPanel from "./settings-panel"
import ProcessingSection from "./processing-section"
import OutputGallery from "./output-gallery"
import { getHeicConverterService, ConversionJob } from "@/lib/services/heic-converter-service"

// Add pollingStarted flag to track if polling has begun
let pollingStarted = false;

export default function ConverterTool() {
  // State for managing the conversion flow
  const [files, setFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("settings")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [conversionJob, setConversionJob] = useState<ConversionJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()

  // Settings state
  const [settings, setSettings] = useState({
    outputFormat: "jpg",
    quality: 85,
    aiOptimization: true,
    aiIntensity: "medium",
    preserveExif: true,
    resizeOption: "original",
    customWidth: 1920,
    customHeight: 1080,
    watermark: {
      enabled: false,
      text: "Copyright",
      position: "bottom-right",
      opacity: 30,
    },
    pdfOptions: {
      pageSize: "a4",
      orientation: "portrait",
    },
  })

  // Add an effect to listen for first file uploaded event
  useEffect(() => {
    // Create event listener for the first file upload
    const handleFirstFileUploaded = (event: any) => {
      const { masterJobId, fileName } = event.detail;
      console.log(`First file uploaded: ${fileName} for job ${masterJobId}`);
      
      // If we don't already have a job ID set, use this one
      if (!currentJobId) {
        setCurrentJobId(masterJobId);
        setIsProcessing(true);
        // Start polling immediately after first file upload
        const converterService = getHeicConverterService();
        pollingStarted = true;
        
        // Start polling with callback function for job updates - check every 2 seconds
        converterService.startStatusPolling(masterJobId, (updatedJob) => {
          setConversionJob(updatedJob);
          setProgress(updatedJob.progress || 0);
          
          // Check if all files are processed (no more processing or pending files)
          const allFilesProcessed = updatedJob.files?.every(file => 
            file.status === 'completed' || file.status === 'failed'
          ) || false;
          
          // Check if at least one file is completed successfully
          const hasCompletedFiles = updatedJob.files?.some(file => 
            file.status === 'completed'
          ) || false;
          
          // Check if completed files
          const completedFiles = updatedJob.files?.filter(file => file.status === 'completed') || [];
          
          // Show toast for each newly completed file
          if (completedFiles.length > 0) {
            const lastFile = completedFiles[completedFiles.length - 1];
            const fileName = lastFile.originalName || lastFile.convertedName || 'Unknown file';
            console.log(`File completed: ${fileName}`);
          }
          
          // Check if job is complete, failed, or has partial success
          if (updatedJob.status === 'completed') {
            setIsProcessing(false);
            setIsComplete(true);
            setActiveTab("output");
            toast({
              title: "Conversion Complete",
              description: `All ${files.length} files have been successfully converted.`,
              variant: "default"
            });
          } else if (updatedJob.status === 'failed' && hasCompletedFiles && allFilesProcessed) {
            // Handle partial success - some files converted successfully but overall job failed
            setIsProcessing(false);
            setIsComplete(true);
            setActiveTab("output");
            
            // Count completed files
            const completedCount = updatedJob.files?.filter(file => file.status === 'completed').length || 0;
            const failedCount = updatedJob.files?.filter(file => file.status === 'failed').length || 0;
            
            toast({
              title: "Partial Conversion",
              description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
              variant: "default"
            });
          } else if (updatedJob.status === 'failed' && !hasCompletedFiles) {
            // All files failed
            setIsProcessing(false);
            setError(updatedJob.error || 'Conversion failed');
            toast({
              title: "Conversion Failed",
              description: updatedJob.error || 'An error occurred during conversion.',
              variant: "destructive"
            });
          } else if (allFilesProcessed && hasCompletedFiles) {
            // Handle case where all files are processed but job status hasn't updated yet
            setIsProcessing(false);
            setIsComplete(true);
            setActiveTab("output");
            
            // Count completed files
            const completedCount = updatedJob.files?.filter(file => file.status === 'completed').length || 0;
            const failedCount = updatedJob.files?.filter(file => file.status === 'failed').length || 0;
            
            toast({
              title: "Processing Complete",
              description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
              variant: "default"
            });
          }
        }, 2000);
      }
    };

    // Create event listener for individual file processing updates
    const handleFileProcessed = (event: any) => {
      const { masterJobId, fileName, jobStatus } = event.detail;
      console.log(`File processed event: ${fileName} for job ${masterJobId}`);
      
      // Update the job status directly from the event data
      // This ensures we have the latest job status right after each file is processed
      if (jobStatus && masterJobId === currentJobId) {
        console.log('Updating job status from file processed event:', jobStatus);
        setConversionJob(jobStatus);
        setProgress(jobStatus.progress || 0);
        
        // Show toast for the processed file
        const file = jobStatus.files?.find((f: any) => f.name === fileName || f.originalName === fileName);
        if (file && file.status === 'completed') {
          toast({
            title: "File Converted",
            description: `${fileName} has been successfully converted.`,
            variant: "default"
          });
        } else if (file && file.status === 'failed') {
          toast({
            title: "File Failed",
            description: `Failed to convert ${fileName}.`,
            variant: "destructive"
          });
        }
        
        // Check if all files are processed
        const allFilesProcessed = jobStatus.files?.every((file: any) => 
          file.status === 'completed' || file.status === 'failed'
        ) || false;
        
        if (allFilesProcessed) {
          // Count completed files
          const completedCount = jobStatus.files?.filter((file: any) => file.status === 'completed').length || 0;
          const failedCount = jobStatus.files?.filter((file: any) => file.status === 'failed').length || 0;
          
          // If all files are processed, update UI accordingly
          setIsProcessing(false);
          setIsComplete(true);
          setActiveTab("output");
          
          if (completedCount === files.length) {
            toast({
              title: "Conversion Complete",
              description: `All ${files.length} files have been successfully converted.`,
              variant: "default"
            });
          } else if (completedCount > 0) {
            toast({
              title: "Processing Complete",
              description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
              variant: "default"
            });
          } else {
            toast({
              title: "Conversion Failed",
              description: "All files failed to convert.",
              variant: "destructive"
            });
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('firstFileUploaded', handleFirstFileUploaded);
    window.addEventListener('fileProcessed', handleFileProcessed);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('firstFileUploaded', handleFirstFileUploaded);
      window.removeEventListener('fileProcessed', handleFileProcessed);
    };
  }, [currentJobId, files.length, toast, setActiveTab]);

  // Original polling effect - modify to only run if not started by first file upload
  useEffect(() => {
    // Only run this if isProcessing is true and we have a jobId but no polling started yet
    if (isProcessing && currentJobId && !pollingStarted) {
      // Get the service and start polling for job status updates
      const converterService = getHeicConverterService();
      pollingStarted = true;
      
      // Start polling with callback function for job updates
      converterService.startStatusPolling(currentJobId, (updatedJob) => {
        setConversionJob(updatedJob);
        setProgress(updatedJob.progress || 0);
        
        // Check if all files are processed (no more processing or pending files)
        const allFilesProcessed = updatedJob.files?.every(file => 
          file.status === 'completed' || file.status === 'failed'
        ) || false;
        
        // Check if at least one file is completed successfully
        const hasCompletedFiles = updatedJob.files?.some(file => 
          file.status === 'completed'
        ) || false;
        
        // Check if job is complete, failed, or has partial success
        if (updatedJob.status === 'completed') {
          setIsProcessing(false);
          setIsComplete(true);
          setActiveTab("output");
          toast({
            title: "Conversion Complete",
            description: `All ${files.length} files have been successfully converted.`,
            variant: "default"
          });
        } else if (updatedJob.status === 'failed' && hasCompletedFiles && allFilesProcessed) {
          // Handle partial success - some files converted successfully but overall job failed
          setIsProcessing(false);
          setIsComplete(true);
          setActiveTab("output");
          
          // Count completed files
          const completedCount = updatedJob.files?.filter(file => file.status === 'completed').length || 0;
          const failedCount = updatedJob.files?.filter(file => file.status === 'failed').length || 0;
          
          toast({
            title: "Partial Conversion",
            description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
            variant: "default"
          });
        } else if (updatedJob.status === 'failed' && !hasCompletedFiles) {
          // All files failed
          setIsProcessing(false);
          setError(updatedJob.error || 'Conversion failed');
          toast({
            title: "Conversion Failed",
            description: updatedJob.error || 'An error occurred during conversion.',
            variant: "destructive"
          });
        } else if (allFilesProcessed && hasCompletedFiles) {
          // Handle case where all files are processed but job status hasn't updated yet
          setIsProcessing(false);
          setIsComplete(true);
          setActiveTab("output");
          
          // Count completed files
          const completedCount = updatedJob.files?.filter(file => file.status === 'completed').length || 0;
          const failedCount = updatedJob.files?.filter(file => file.status === 'failed').length || 0;
          
          toast({
            title: "Processing Complete",
            description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
            variant: "default"
          });
        }
      }, 2000);
      
      // Cleanup function to stop polling when component unmounts
      return () => {
        converterService.stopStatusPolling();
        pollingStarted = false;
      }
    }
  }, [isProcessing, currentJobId, files.length, toast]);

  // Handle starting the conversion process
  const handleStartConversion = async () => {
    setError(null)
    setIsProcessing(true)
    setActiveTab("processing")
    
    try {
      // Start actual conversion with backend service
      const converterService = getHeicConverterService();
      const jobId = await converterService.convertFiles(files, settings)
      setCurrentJobId(jobId)
      toast({
        title: "Conversion Started",
        description: `Processing ${files.length} files...`,
      })
    } catch (err: any) {
      console.error('Error starting conversion:', err)
      setError(err.message || 'Failed to start conversion')
      setIsProcessing(false)
      toast({
        title: "Conversion Failed",
        description: err.message || 'An error occurred starting the conversion.',
        variant: "destructive"
      })
    }
  }

  // Reset the tool to initial state
  const handleReset = () => {
    setFiles([])
    setActiveTab("settings")
    setIsProcessing(false)
    setIsComplete(false)
    setProgress(0)
    setCurrentJobId(null)
    setConversionJob(null)
    setError(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">HEIC Converter Tool</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 relative">
            <TabsTrigger 
              value="settings" 
              disabled={isProcessing}
              className="px-2 sm:px-4 text-xs sm:text-sm py-2"
            >
              1. Settings
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              disabled={isProcessing}
              className="px-2 sm:px-4 text-xs sm:text-sm py-2"
            >
              2. Upload Files
            </TabsTrigger>
            <TabsTrigger 
              value="output" 
              disabled={!isComplete}
              className="px-2 sm:px-4 text-xs sm:text-sm py-2"
            >
              3. Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadSection
              files={files}
              setFiles={setFiles}
              onContinue={() => handleStartConversion()}
              disabled={isProcessing}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              onStartConversion={handleStartConversion}
              disabled={isProcessing}
              files={files}
              setActiveTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="processing">
            <ProcessingSection 
              files={files} 
              settings={settings} 
              progress={progress} 
              error={error}
              job={conversionJob}
            />
          </TabsContent>

          <TabsContent value="output">
            <OutputGallery 
              files={files} 
              settings={settings} 
              onReset={handleReset} 
              job={conversionJob}
              jobId={currentJobId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
