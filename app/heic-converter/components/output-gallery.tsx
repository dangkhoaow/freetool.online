"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, DownloadCloud, Eye, Zap, Check, X, AlertCircle, Clock } from "lucide-react"
import Image from "next/image"
import { ConversionJob, getHeicConverterService } from "@/lib/services/heic-converter-service"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OutputGalleryProps {
  files: File[]
  settings: any
  onReset: () => void
  job: ConversionJob | null
  jobId: string | null
}

// Add import for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get a filename with the correct extension
function getOutputFilename(originalName: string, format: string): string {
  // Get the filename without extension
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  
  // Return with the new extension
  return `${baseName}.${format}`;
}

export default function OutputGallery({ files, settings, onReset, job, jobId }: OutputGalleryProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewImage, setPreviewImage] = useState<any | null>(null)
  const { toast } = useToast()
  const converterService = getHeicConverterService(); // Get the service instance
  const token = localStorage.getItem('userId') || 'anonymous'; // Use userId as token

  // Stats for success/failure
  const completedFiles = job?.files?.filter(file => file.status === 'completed').length || 0;
  const failedFiles = job?.files?.filter(file => file.status === 'failed').length || 0;
  const processingFiles = job?.files?.filter(file => file.status === 'processing').length || 0;
  const pendingFiles = job?.files?.filter(file => file.status === 'pending').length || 0;
  const totalFiles = job?.files?.length || files.length;
  
  // Use actual converted files from the job if available, otherwise fall back to placeholders
  const isPdfFormat = settings.outputFormat === 'pdf';
  const convertedImages = job?.files?.map((file: any, index) => {
    console.log('Processing file:', file); // Debug log

    // Extract necessary information from the file object with fallbacks
    let originalName = '';
    if (file && typeof file === 'object' && 'originalName' in file) {
      originalName = file.originalName;
    } else if (file && typeof file === 'object' && 'name' in file && typeof file.name === 'string') {
      originalName = file.name;
    } else {
      originalName = files[index]?.name || `File ${index+1}`;
    }
    
    // Get converted name with fallbacks
    let convertedName = '';
    if ('convertedName' in file && file.convertedName) {
      convertedName = file.convertedName;
    } else {
      convertedName = originalName.replace(/\.[^/.]+$/, `.${settings.outputFormat}`);
    }
    
    // Get thumbnail URL
    let thumbnailUrl = '';
    if ('thumbnailUrl' in file && file.thumbnailUrl) {
      thumbnailUrl = file.thumbnailUrl;
    }
    
    // Status with fallbacks
    const status = file.status || 'processing';
    
    // Extract just the filename part without path or extension
    const fileBaseName = originalName.split('/').pop()?.split('.')[0] || '';
    console.log('Extracted base name:', fileBaseName);
    
    // Construct URLs for display and download
    let displayUrl, downloadUrl;
    
    // For display URL (thumbnail) with authentication token
    if (jobId && status === 'completed') {
      // First try to use the thumbnailUrl from the file if available
      if (thumbnailUrl) {
        displayUrl = thumbnailUrl;
        console.log('Using thumbnailUrl from file:', displayUrl);
      } else if (file.convertedPath) {
        // If no thumbnailUrl but we have convertedPath, construct a thumbnail URL
        try {
          const url = new URL(file.convertedPath);
          const pathParts = url.pathname.split('/');
          const filename = pathParts[pathParts.length - 1];
          
          // Create a thumbnail URL based on the converted path
          // Replace the last part of the path with thumbnails/filename
          const thumbnailPath = url.pathname.replace(/\/[^\/]+$/, `/thumbnails/${filename}`);
          
          // Create a new URL for the thumbnail
          displayUrl = url.origin + thumbnailPath;
          
          // Copy the token from the converted path
          if (url.searchParams.has('token')) {
            displayUrl += `?token=${url.searchParams.get('token')}`;
          } else {
            displayUrl += `?token=user_${token}`;
          }
          
          console.log('Constructed thumbnail URL from convertedPath:', displayUrl);
        } catch (error) {
          console.error('Error constructing thumbnail URL:', error);
          // Fallback to placeholder
          displayUrl = "/placeholder.svg?height=200&width=300";
        }
      } else {
        // Fallback to constructing from jobId and convertedName
        const thumbnailBase = convertedName.split('.')[0];
        const thumbnailExt = settings.outputFormat === 'pdf' ? 'jpg' : settings.outputFormat;
        displayUrl = `${API_BASE_URL}/api/files/uploads/converted/${jobId}/thumbnails/${thumbnailBase}.${thumbnailExt}?token=user_${token}`;
        console.log('Constructed thumbnail URL with auth:', displayUrl);
      }
    } else {
      // Fallback to placeholder
      displayUrl = "/placeholder.svg?height=200&width=300";
    }
    
    // For download URL with authentication token (without /thumbnails path)
    if (jobId && status === 'completed') {
      // First try to use the convertedPath from the file if available
      if (file.convertedPath) {
        downloadUrl = file.convertedPath;
        console.log('Using convertedPath from file:', downloadUrl);
      } else {
        // Construct download URL from jobId and convertedName with token
        downloadUrl = `${API_BASE_URL}/api/files/converted/${jobId}/${convertedName}?token=user_${token}`;
        console.log('Constructed download URL with auth:', downloadUrl);
      }
    } else {
      downloadUrl = null;
    }
    
    return {
      id: index + 1,
      name: convertedName || originalName.replace(".heic", `.${settings.outputFormat}`),
      size: file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "Unknown",
      url: displayUrl,
      downloadUrl: downloadUrl,
      originalName: originalName,
      status: status,
      error: file.error || undefined,
      convertedPath: file.convertedPath || null,
      thumbnailUrl: thumbnailUrl || null,
    };
  }) || 
  // Fallback to local files
  files.map((file, index) => ({
    id: index + 1,
    name: file.name.replace(".heic", `.${settings.outputFormat}`),
    size: ((file.size / 1024 / 1024) * 0.7).toFixed(2) + " MB",
    url: "/placeholder.svg?height=200&width=300",
    downloadUrl: null,
    originalName: file.name,
    status: "pending",
    error: undefined,
    convertedPath: null,
    thumbnailUrl: null,
  }))
  
  // Handle downloading a single file
  const handleDownload = async (image: any) => {
    if (!image.downloadUrl) {
      toast({
        title: "Download Failed",
        description: "File path not available",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsDownloading(true)
      
      // Create an anchor element to download with proper headers
      const link = document.createElement('a')
      link.href = image.downloadUrl
      link.download = image.name // This triggers download mode
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download Complete",
        description: `File ${image.name} has been downloaded.`
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "An error occurred during download",
        variant: "destructive"
      })
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }
  
  // Handle downloading all files as a ZIP
  const handleDownloadAll = async () => {
    if (!jobId) {
      toast({
        title: "Download Failed",
        description: "Job ID not available",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsDownloading(true)
      
      // Create and use direct download link with token
      const zipUrl = `${API_BASE_URL}/api/files/download-zip/${jobId}?token=user_${token}`;
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `converted-files-${jobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Complete",
        description: "All files have been downloaded as a ZIP"
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "An error occurred during download",
        variant: "destructive"
      })
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle downloading combined PDF
  const handleDownloadCombinedPdf = async () => {
    if (!jobId) {
      toast({
        title: "Download Failed",
        description: "Job ID not available",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsDownloading(true)
      
      // Create direct URL to the combined.pdf file in the job directory
      const pdfUrl = `${API_BASE_URL}/api/files/converted/${jobId}/combined.pdf?token=user_${token}`;
      console.log("Attempting to download combined PDF from:", pdfUrl);
      
      // Create direct download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'combined.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Complete",
        description: "Combined PDF has been downloaded"
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "An error occurred during download",
        variant: "destructive"
      })
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // In a real implementation, this would show actual conversion results

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Converted Images</h3>

      {/* Debug output for combined PDF URL - with proper null checks */}
      {isPdfFormat && job && job.files && Array.isArray(job.files) && job.files.length > 1 && job.combinedPdfUrl && (
        <div className="bg-gray-100 p-3 mb-3 text-xs font-mono">
          <p>Debug: CombinedPdfUrl available: {job?.combinedPdfUrl ? 'YES' : 'NO'}</p>
          <p>Files count: {job?.files?.length}</p>
          <p>Job status: {job?.status}</p>
        </div>
      )}

      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center">
        <div className="bg-green-100 rounded-full p-1 mr-3">
          {failedFiles > 0 && completedFiles > 0 ? (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          ) : failedFiles > 0 ? (
            <X className="h-5 w-5 text-red-600" />
          ) : processingFiles > 0 || pendingFiles > 0 ? (
            <Clock className="h-5 w-5 text-blue-600" />
          ) : (
            <Check className="h-5 w-5 text-green-600" />
          )}
        </div>
        <div>
          {completedFiles === totalFiles ? (
            <p className="text-green-800 font-medium">Conversion Complete!</p>
          ) : failedFiles === totalFiles ? (
            <p className="text-red-800 font-medium">Conversion Failed!</p>
          ) : failedFiles > 0 ? (
            <p className="text-yellow-800 font-medium">Partial Conversion</p>
          ) : (
            <p className="text-blue-800 font-medium">Processing...</p>
          )}
          <p className="text-sm text-green-700">
            {completedFiles} of {totalFiles} files successfully converted to {settings.outputFormat.toUpperCase()}
            {failedFiles > 0 && ` (${failedFiles} failed)`}
            {processingFiles > 0 && ` (${processingFiles} processing)`}
            {pendingFiles > 0 && ` (${pendingFiles} pending)`}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-medium">Download Options</h4>
          <p className="text-sm text-gray-500">Download individual files or all at once</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={handleDownloadAll} 
            disabled={isDownloading || !job || job.status !== 'completed' || completedFiles === 0}
          >
            {isDownloading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Downloading...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4 mr-2" />
                Download All
              </>
            )}
          </Button>
          {isPdfFormat && job && job.files && Array.isArray(job.files) && job.files.length > 1 && (
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleDownloadCombinedPdf}
              disabled={isDownloading || !jobId || completedFiles === 0}
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Combined PDF
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {convertedImages.map((image) => (
          <div key={image.id} className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="relative aspect-video bg-gray-100 cursor-pointer" 
              onClick={() => image.status === 'completed' && setPreviewImage(image)}
            >
              {image.status === 'failed' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center px-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium text-sm">Conversion Failed</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{image.error || 'Could not convert file'}</p>
                  </div>
                </div>
              ) : image.status === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                  <div className="text-center px-4">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-blue-600 font-medium text-sm">Processing...</p>
                    <p className="text-xs text-gray-600 mt-1">Converting your file</p>
                  </div>
                </div>
              ) : image.status === 'pending' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center px-4">
                    <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium text-sm">Pending</p>
                    <p className="text-xs text-gray-500 mt-1">Waiting to process</p>
                  </div>
                </div>
              ) : (
                <Image 
                  src={image.url || "/placeholder.svg"} 
                  alt={image.name} 
                  fill 
                  className="object-cover hover:opacity-90 transition-opacity" 
                  onError={(e) => {
                    // Handle image load error by setting a placeholder
                    console.error(`Error loading image: ${image.url}`);
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
              <div className="absolute top-2 right-2 flex space-x-1">
                {settings.aiOptimization && (
                  <div className="p-1 bg-blue-500 rounded-full" title="AI Optimized">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="mb-2">
                <p className="text-sm font-medium truncate">{image.name}</p>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <span>{image.size}</span>
                  {settings.aiOptimization && image.status === 'completed' && (
                    <span className="flex items-center ml-2 text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                      {settings.aiOptimization ? "30% smaller" : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => image.status === 'completed' && setPreviewImage(image)}
                  disabled={image.status !== 'completed'}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                  onClick={() => handleDownload(image)}
                  disabled={isDownloading || image.status !== 'completed'}
                >
                  {isDownloading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-4 w-4 mr-1">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" x2="12" y1="15" y2="3"></line>
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {failedFiles > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6 flex items-center">
          <div className="bg-yellow-100 rounded-full p-1 mr-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-yellow-800 font-medium">Some files failed to convert</p>
            <p className="text-sm text-yellow-700">
              {failedFiles} of {totalFiles} files couldn't be converted. This might be due to corrupted HEIC files or unsupported formats.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Convert More Files
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownloadAll}
            disabled={isDownloading || !job || completedFiles === 0}
          >
            {isDownloading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Downloading...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4 mr-2" />
                Download All as ZIP
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{previewImage?.name}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreviewImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Original: {previewImage?.originalName} • Size: {previewImage?.size}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[60vh] border rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
            {previewImage && (
              <a href={previewImage.downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                <Image 
                  src={previewImage.url || "/placeholder.svg"} 
                  alt={previewImage.name} 
                  fill
                  className="object-contain" 
                  onError={(e) => {
                    // Handle image load error by setting a placeholder
                    console.error(`Error loading preview image: ${previewImage.url}`);
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </a>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-2">
            <Button 
              variant="default" 
              onClick={() => previewImage && handleDownload(previewImage)}
              disabled={isDownloading || !previewImage || previewImage.status !== 'completed'}
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
