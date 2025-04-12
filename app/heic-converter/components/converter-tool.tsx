"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import UploadSection from "./upload-section"
import SettingsPanel from "./settings-panel"
import ProcessingSection from "./processing-section"
import OutputGallery from "./output-gallery"
import { getHeicConverterService, ConversionJob } from "@/lib/services/heic-converter-service"

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

  // Set up polling for job status updates when processing
  useEffect(() => {
    if (isProcessing && currentJobId) {
      // Get the service and start polling for job status updates
      const converterService = getHeicConverterService();
      
      // Start polling with callback function for job updates
      converterService.startStatusPolling(currentJobId, (updatedJob) => {
        setConversionJob(updatedJob);
        setProgress(updatedJob.progress);
        
        // Check if job is complete or failed
        if (updatedJob.status === 'completed') {
          setIsProcessing(false);
          setIsComplete(true);
          setActiveTab("output");
          toast({
            title: "Conversion Complete",
            description: `All ${files.length} files have been successfully converted.`,
            variant: "default"
          });
        } else if (updatedJob.status === 'failed') {
          setIsProcessing(false);
          setError(updatedJob.error || 'Conversion failed');
          toast({
            title: "Conversion Failed",
            description: updatedJob.error || 'An error occurred during conversion.',
            variant: "destructive"
          });
        }
      });
      
      // Cleanup function to stop polling when component unmounts
      return () => {
        converterService.stopStatusPolling();
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
