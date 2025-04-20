"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import UploadSection from "./upload-section"
import SettingsPanel from "./settings-panel"
import ProcessingSection from "./processing-section"
import OutputGallery from "./output-gallery"
import { getHeicConverterService, type ConversionJob } from "@/lib/services/heic-converter-service"
import { processBatchInBrowser } from "@/lib/services/browser-heic-converter"

// Add pollingStarted flag to track if polling has begun
let pollingStarted = false

export default function ConverterTool() {
  // State for managing the conversion flow
  const [files, setFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [conversionJob, setConversionJob] = useState<ConversionJob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState(() => {
    // Try to load settings from localStorage on initial render
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('heicConverterSettings')
        if (savedSettings) {
          return JSON.parse(savedSettings)
        }
      } catch (e) {
        console.error('Error loading settings from localStorage:', e)
      }
    }
    
    // Default settings
    return {
      outputFormat: "jpg",
      quality: 85,
      aiOptimization: true,
      aiIntensity: "medium",
      preserveExif: true,
      resizeOption: "original",
      customWidth: 1920,
      customHeight: 1080,
      conversionMode: "browser", // Default to browser-based conversion
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
    }
  })

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('heicConverterSettings', JSON.stringify(settings))
      } catch (e) {
        console.error('Error saving settings to localStorage:', e)
      }
    }
  }, [settings])

  // Update the useEffect for event listeners and polling
  useEffect(() => {
    // Add debugging to track conversion mode
    console.log("Conversion mode:", settings.conversionMode);
    console.log("Current job ID:", currentJobId);
    console.log("isProcessing:", isProcessing);
    
    // Create event listener for the first file upload
    const handleFirstFileUploaded = (event: any) => {
      const { masterJobId, fileName } = event.detail
      console.log(`First file uploaded: ${fileName} for job ${masterJobId}`)

      // Only handle this event in server mode
      if (settings.conversionMode !== 'browser') {
        // If we don't already have a job ID set, use this one
        if (!currentJobId) {
          setCurrentJobId(masterJobId)
          setIsProcessing(true)
          // Start polling immediately after first file upload
          const converterService = getHeicConverterService()
          pollingStarted = true

          // Start polling with callback function for job updates - check every 2 seconds
          converterService.startStatusPolling(
            masterJobId,
            (updatedJob) => {
              console.log(`Job update: ${updatedJob.status}, files count: ${updatedJob.files?.length || 0}, total expected: ${files.length}`);
              setConversionJob(updatedJob)
              setProgress(updatedJob.progress || 0)

              // Check if all files are processed (no more processing or pending files)
              const allFilesProcessed =
                (updatedJob.files?.every((file) => file.status === "completed" || file.status === "failed") &&
                  updatedJob.files?.length === files.length) ||
                false
              
              // Check if initial upload is still in progress
              const isStillUploading = updatedJob.files?.length < files.length;
              
              // Update progress calculation for uploads in progress
              if (isStillUploading) {
                // Adjust progress to show uploads in progress
                const uploadPortion = 50; // First 50% for upload
                const uploadProgress = (updatedJob.files?.length || 0) / files.length * uploadPortion;
                const conversionPortion = 50; // Last 50% for conversion
                const conversionProgress = (updatedJob.progress || 0) / 100 * conversionPortion;
                
                setProgress(Math.floor(uploadProgress + conversionProgress));
              }

              // Check if at least one file is completed successfully
              const hasCompletedFiles = updatedJob.files?.some((file) => file.status === "completed") || false

              // Check if job is complete, failed, or has partial success
              if (updatedJob.status === "completed") {
                setIsProcessing(false)
                setIsComplete(true)
                setActiveTab("output")
                toast({
                  title: "Conversion Complete",
                  description: `All ${files.length} files have been successfully converted.`,
                  variant: "default",
                })
              } else if (updatedJob.status === "failed" && !isStillUploading) {
                // Only show failure if all files have been uploaded and still failed
                // First check if there are any completed files, regardless of other conditions
                if (hasCompletedFiles) {
                  // If any files completed successfully, show output gallery
                  setIsProcessing(false)
                  setIsComplete(true)
                  setActiveTab("output")

                  // Count completed files
                  const completedCount = updatedJob.files?.filter((file) => file.status === "completed").length || 0
                  const failedCount = updatedJob.files?.filter((file) => file.status === "failed").length || 0

                  toast({
                    title: "Partial Conversion",
                    description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
                    variant: "default",
                  })
                } else {
                  // Only show error if there are no completed files
                  setIsProcessing(false)
                  setError(updatedJob.error || "Conversion failed")
                  toast({
                    title: "Conversion Failed",
                    description: updatedJob.error || "An error occurred during conversion.",
                    variant: "destructive",
                  })
                }
              } else if (allFilesProcessed && hasCompletedFiles) {
                // Handle case where all files are processed but job status hasn't updated yet
                setIsProcessing(false)
                setIsComplete(true)
                setActiveTab("output")

                // Count completed files
                const completedCount = updatedJob.files?.filter((file) => file.status === "completed").length || 0
                const failedCount = updatedJob.files?.filter((file) => file.status === "failed").length || 0

                toast({
                  title: "Processing Complete",
                  description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
                  variant: "default",
                })
              }
            },
            2000,
          )
        }
      }
    }

    // Skip server-side event listeners for browser-based conversion
    if (settings.conversionMode === 'browser') {
      return;
    }

    // Create event listener for individual file processing updates
    const handleFileProcessed = (event: any) => {
      const { masterJobId, fileName, jobStatus } = event.detail
      console.log(`File processed event: ${fileName} for job ${masterJobId}`)

      // Update the job status directly from the event data
      // This ensures we have the latest job status right after each file is processed
      if (jobStatus && masterJobId === currentJobId) {
        console.log("Updating job status from file processed event:", jobStatus)
        setConversionJob(jobStatus)
        setProgress(jobStatus.progress || 0)

        // Show toast for the processed file
        const file = jobStatus.files?.find((f: any) => f.name === fileName || f.originalName === fileName)
        if (file && file.status === "completed") {
          toast({
            title: "File Converted",
            description: `${fileName} has been successfully converted.`,
            variant: "default",
          })
        } else if (file && file.status === "failed") {
          toast({
            title: "File Failed",
            description: `Failed to convert ${fileName}.`,
            variant: "destructive",
          })
        }

        // Check if all files are processed
        const allFilesProcessed =
          (jobStatus.files?.every((file: any) => file.status === "completed" || file.status === "failed") &&
            jobStatus.files?.length === files.length) ||
          false

        console.log(
          `allFilesProcessed_2: ${allFilesProcessed}, jobStatus.files?.length: ${jobStatus.files?.length}, files.length: ${files.length}`,
        )

        if (allFilesProcessed) {
          // Count completed files
          const completedCount = jobStatus.files?.filter((file: any) => file.status === "completed").length || 0
          const failedCount = jobStatus.files?.filter((file: any) => file.status === "failed").length || 0

          // If all files are processed, update UI accordingly
          setIsProcessing(false)
          setIsComplete(true)
          setActiveTab("output")

          if (completedCount === files.length) {
            toast({
              title: "Conversion Complete",
              description: `All ${files.length} files have been successfully converted.`,
              variant: "default",
            })
          } else if (completedCount > 0) {
            toast({
              title: "Processing Complete",
              description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
              variant: "default",
            })
          } else {
            toast({
              title: "Conversion Failed",
              description: "All files failed to convert.",
              variant: "destructive",
            })
          }
        }

        // Also check if we have any completed files, regardless of job status
        // This ensures we show output gallery even if job status is "failed" but some files completed
        const hasCompletedFiles = jobStatus.files?.some((file: any) => file.status === "completed") || false
        if (hasCompletedFiles && jobStatus.status === "failed") {
          const completedCount = jobStatus.files?.filter((file: any) => file.status === "completed").length || 0
          const failedCount = jobStatus.files?.filter((file: any) => file.status === "failed").length || 0

          setIsProcessing(false)
          setIsComplete(true)
          setActiveTab("output")

          console.log(`Job marked as failed but has ${completedCount} completed files - showing output gallery`)

          toast({
            title: "Partial Conversion",
            description: `${completedCount} of ${files.length} files successfully converted. ${failedCount} files failed.`,
            variant: "default",
          })
        }
      }
    }

    // Add event listeners
    window.addEventListener("firstFileUploaded", handleFirstFileUploaded)
    window.addEventListener("fileProcessed", handleFileProcessed)

    // Start polling when component mounts and we are processing
    if (
      isProcessing &&
      currentJobId &&
      !pollingStarted &&
      typeof window !== "undefined" &&
      settings.conversionMode === 'server'
    ) {
      console.log(`Starting polling for job ID: ${currentJobId}`)
      const converterService = getHeicConverterService()
      pollingStarted = true

      converterService.startStatusPolling(
        currentJobId,
        (updatedJob) => {
          console.log("Polling received job update:", updatedJob.status, updatedJob.progress);
          setConversionJob(updatedJob)
          setProgress(updatedJob.progress || 0)

          // Check if job is complete or failed
          if (updatedJob.status === "completed" || 
             (updatedJob.status === "failed" && updatedJob.files?.some(f => f.status === "completed"))) {
            setIsProcessing(false);
            setIsComplete(true);
            setActiveTab("output");
          }
        },
        2000,
      )
    }

    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener("firstFileUploaded", handleFirstFileUploaded)
      window.removeEventListener("fileProcessed", handleFileProcessed)
      
      // Also stop polling if it's active
      if (pollingStarted && settings.conversionMode === 'server') {
        const converterService = getHeicConverterService()
        converterService.stopStatusPolling()
        pollingStarted = false
      }
    }
  }, [isProcessing, currentJobId, files.length, toast, settings.conversionMode])

  // Handle starting the conversion process
  const handleStartConversion = async () => {
    // Validate files
    if (!files.length) {
      toast({
        title: "No files selected",
        description: "Please upload at least one HEIC file to convert.",
        variant: "destructive",
      });
      return;
    }

    // Set active tab to processing
    setActiveTab("processing");
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Create a timeout to detect if conversion is stuck
      const conversionTimeout = setTimeout(() => {
        if (isProcessing) {
          console.error("Conversion timeout - process appears to be stuck");
          setIsProcessing(false);
          setError("Conversion timeout - the process appears to be stuck. Try smaller files or server conversion.");
          toast({
            title: "Conversion timed out",
            description: "The conversion process took too long. Try smaller files or switch to server conversion.",
            variant: "destructive",
          });
        }
      }, 60000); // 60 second timeout
      
      // Reset any previous results
      setConversionJob(null);
      
      if (settings.conversionMode === 'browser') {
        console.log("Starting browser-based conversion...");
        try {
          // Log PDF settings
          const pdfSettings = {
            pageSize: settings.pdfOptions?.pageSize || 'letter',
            orientation: settings.pdfOptions?.orientation || 'portrait',
            margin: settings.pdfOptions?.margin || 'medium'
          };
          console.log("PDF settings for conversion:", pdfSettings);
          
          const browserResults = await processBatchInBrowser(
            files,
            {
              outputFormat: settings.outputFormat,
              quality: settings.quality,
              pageSize: pdfSettings.pageSize,
              orientation: pdfSettings.orientation,
              margin: pdfSettings.margin
            },
            (progress) => setProgress(progress)
          );
          
          clearTimeout(conversionTimeout);
          
          console.log("Browser conversion complete:", browserResults);
          
          if (browserResults.status === "completed") {
            console.log("Browser conversion successful, file details:", JSON.stringify(browserResults.files.map(f => ({
              status: f.status,
              hasConvertedPath: 'convertedPath' in f ? !!f.convertedPath : false,
              hasUrl: !!f.url,
              hasThumbnail: !!f.thumbnailUrl,
              size: f.size
            }))));

            // Set tabs to show output and set complete status
            setIsComplete(true);
            setActiveTab("output");
            
            if (browserResults.files.some(f => f.status === "failed")) {
              // Partial success
              setIsProcessing(false);
              setConversionJob({
                ...browserResults,
                files: browserResults.files.map(file => ({
                  ...file,
                  size: file.size || 0, // Ensure size is always a number
                  convertedPath: file.url // Map url to convertedPath as a fallback
                }))
              } as ConversionJob);
              const successCount = browserResults.files.filter(f => f.status === "completed").length;
              const failCount = browserResults.files.filter(f => f.status === "failed").length;
              
              toast({
                title: "Partial conversion success",
                description: `${successCount} files converted successfully, ${failCount} files failed.`,
                variant: "default",
              });
            } else {
              // Full success
              setIsProcessing(false);
              setConversionJob({
                ...browserResults,
                files: browserResults.files.map(file => ({
                  ...file,
                  size: file.size || 0, // Ensure size is always a number
                  convertedPath: file.url // Map url to convertedPath as a fallback
                }))
              } as ConversionJob);
              toast({
                title: "Conversion completed",
                description: `Successfully converted ${browserResults.files.length} files.`,
                variant: "default",
              });
            }
          } else {
            // All files failed
            setIsProcessing(false);
            setError(browserResults.error || "Conversion failed for all files");
            toast({
              title: "Conversion failed",
              description: browserResults.error || "Failed to convert files in browser mode. Try server mode instead.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          clearTimeout(conversionTimeout);
          console.error("Browser conversion error:", error);
          setIsProcessing(false);
          setError(error.message || "Unknown error during browser conversion");
          toast({
            title: "Conversion error",
            description: `Error during browser conversion: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });
        }
      } else {
        // Server-side conversion
        console.log("Starting server-side conversion...");
        try {
          // Get the converter service for server-side processing
          const converterService = getHeicConverterService();
          
          // Start the conversion with the server
          const jobId = await converterService.convertFiles(files, settings);
          
          // Set current job ID to enable polling
          setCurrentJobId(jobId);
          
          // Show toast confirming the conversion has started
          toast({
            title: "Conversion Started",
            description: `Processing ${files.length} files on our servers...`,
            variant: "default",
          });
          
          // Note: Don't set isProcessing to false here - 
          // the polling logic will handle that when the job completes
        } catch (error: any) {
          clearTimeout(conversionTimeout);
          console.error("Server conversion error:", error);
          setIsProcessing(false);
          setError(error.message || "Unknown error during server conversion");
          
          toast({
            title: "Conversion error",
            description: `Error during server conversion: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Unhandled conversion error:", error);
      setIsProcessing(false);
      setError(`Unhandled error: ${error.message || "Unknown error"}`);
      
      toast({
        title: "Conversion error",
        description: `An unexpected error occurred: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  // Reset the tool to initial state
  const handleReset = () => {
    setFiles([])
    setActiveTab("upload")
    setIsProcessing(false)
    setIsComplete(false)
    setProgress(0)
    setCurrentJobId(null)
    setConversionJob(null)
    setError(null)
    
    // Clean up browser-based conversion URLs
    if (conversionJob && settings.conversionMode === 'browser') {
      conversionJob.files.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
        if (file.thumbnailUrl && file.thumbnailUrl.startsWith('data:')) {
          // No need to revoke data URLs
        }
      });
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">HEIC Converter Tool</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 relative">
            <TabsTrigger value="upload" disabled={isProcessing} className="px-2 sm:px-4 text-xs sm:text-sm py-2">
              1. Upload Files
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={isProcessing} className="px-2 sm:px-4 text-xs sm:text-sm py-2">
              2. Settings
            </TabsTrigger>
            <TabsTrigger value="output" disabled={!isComplete} className="px-2 sm:px-4 text-xs sm:text-sm py-2">
              3. Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadSection
              files={files}
              setFiles={setFiles}
              onContinue={() => setActiveTab("settings")}
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
