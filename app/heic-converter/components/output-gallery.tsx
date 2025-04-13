"use client"

import { useState, useMemo } from "react"
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
  const [previewImage, setPreviewImage] = useState<any>(null)
  const { toast } = useToast()
  const converterService = getHeicConverterService(); // Get the service instance
  const token = localStorage.getItem('userId') || 'anonymous'; // Use userId as token

  // Add logic to show images even if job failed but some files were converted
  const hasConvertedFiles = useMemo(() => {
    if (!job?.files) return false;
    return job.files.some(file => file.status === 'completed' && file.convertedPath);
  }, [job]);

  // If the job failed but we have converted files, make sure to display them
  const showGallery = job?.status === 'completed' || hasConvertedFiles;

  // Filter to only show successfully converted files
  const successfulFiles = useMemo(() => {
    return job?.files?.filter(file => file.status === 'completed' && file.convertedPath) || [];
  }, [job]);

  // Count stats
  const totalFiles = files.length;
  const successCount = successfulFiles.length;
  const failedCount = job?.files?.filter(file => file.status === 'failed').length || 0;

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
        // Ensure we're using .jpg extension for thumbnails
        if (thumbnailUrl.includes('.pdf')) {
          thumbnailUrl = thumbnailUrl.replace('.pdf', '.jpg');
        }
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
          // Always use .jpg extension for thumbnails regardless of the output format
          let thumbnailFilename = filename;
          if (thumbnailFilename.endsWith('.pdf')) {
            thumbnailFilename = thumbnailFilename.replace('.pdf', '.jpg');
          }
          
          const thumbnailPath = url.pathname.replace(/\/[^\/]+$/, `/thumbnails/${thumbnailFilename}`);
          
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
        // Always use .jpg extension for thumbnails
        const thumbnailExt = 'jpg';
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
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // View image in a new tab
  const handleViewImage = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  // Download a single file
  const handleDownload = (url: string, fileName: string) => {
    if (!url) return;
    setIsDownloading(true);
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
        setIsDownloading(false);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        setIsDownloading(false);
      });
  };
  
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
      
      // Use the new dedicated endpoint for combined PDF
      const pdfUrl = `${API_BASE_URL}/api/files/download-combined-pdf/${jobId}?token=user_${token}`;
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
      <h3 className="text-xl font-semibold mb-4">Conversion Results</h3>

      <div className="space-y-6">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center">
          <div className="bg-green-100 rounded-full p-1 mr-3">
            {failedCount > 0 && successCount > 0 ? (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            ) : failedCount > 0 ? (
              <X className="h-5 w-5 text-red-600" />
            ) : successCount > 0 ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            {successCount === totalFiles ? (
              <p className="text-green-800 font-medium">Conversion Complete!</p>
            ) : failedCount === totalFiles ? (
              <p className="text-red-800 font-medium">Conversion Failed!</p>
            ) : failedCount > 0 ? (
              <p className="text-yellow-800 font-medium">Partial Conversion</p>
            ) : (
              <p className="text-blue-800 font-medium">Processing...</p>
            )}
            <p className="text-sm text-green-700">
              {successCount} of {totalFiles} files successfully converted to {settings.outputFormat.toUpperCase()}
              {failedCount > 0 && ` (${failedCount} failed)`}
            </p>
          </div>
        </div>

        {failedCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6 flex items-center">
            <div className="bg-yellow-100 rounded-full p-1 mr-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-yellow-800 font-medium">Some files failed to convert</p>
              <p className="text-sm text-yellow-700">
                {failedCount} of {totalFiles} files couldn't be converted. This might be due to corrupted HEIC files or unsupported formats.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {successfulFiles.length > 0 ? (
            successfulFiles.map((file, index) => {
              // Get display URL
              let displayUrl = file.thumbnailUrl || file.convertedPath || '';
              let downloadUrl = file.convertedPath || '';
              
              // Extract the original file name
              const originalName = file.originalName || `file-${index + 1}.${settings.outputFormat}`;
              const convertedName = file.convertedName || originalName.replace(/\.(heic|heif)$/i, `.${settings.outputFormat}`);
              
              return (
                <div
                  key={index}
                  className="bg-white border rounded-lg overflow-hidden shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {/* Image thumbnail - adjust display logic as needed */}
                    <img
                      src={displayUrl}
                      alt={`Converted ${originalName}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Log the error for debugging
                        console.error(`Error loading thumbnail: ${displayUrl}`);
                        
                        // Try alternative thumbnail URL formats
                        const target = e.target as HTMLImageElement;
                        
                        if (displayUrl.includes('.jpg')) {
                          // Try with PDF extension instead
                          const pdfUrl = displayUrl.replace('.jpg', '.pdf');
                          console.log('Trying alternative PDF URL:', pdfUrl);
                          target.src = pdfUrl;
                          
                          // Add another error handler for the fallback
                          target.onerror = () => {
                            console.error(`Fallback URL also failed: ${pdfUrl}`);
                            target.src = "/placeholder.svg?height=200&width=300";
                            target.onerror = null; // Prevent infinite error handling
                          };
                        } else {
                          // Fall back to placeholder if image fails to load
                          target.src = "/placeholder.svg?height=200&width=300";
                        }
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-medium truncate">{convertedName}</p>
                    <p className="text-sm text-gray-500 truncate">Size: {formatFileSize(file.size || 0)}</p>

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleDownload(file.convertedPath || '', convertedName)}
                        className="flex-1"
                        disabled={!file.convertedPath}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No Converted Files Yet</h3>
              <p className="text-gray-500 mt-1">
                {job?.status === 'failed' ? 
                  'Conversion failed. Please try again or check your files.' : 
                  'Your files are still processing. Please wait...'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between">
              <Button variant="outline" onClick={onReset}>
                Convert More Files
              </Button>
              {(isPdfFormat && job && job.files && Array.isArray(job.files) && job.files.length > 1) ? (
                <Button 
                  variant="default" 
                  onClick={handleDownloadCombinedPdf}
                  disabled={isDownloading || !job || successCount === 0}
                >
                  {isDownloading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Download Combined PDF
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  onClick={handleDownloadAll}
                  disabled={isDownloading || !job || successCount === 0}
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
              )}
            </div>
          </div>
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
              onClick={() => previewImage && handleDownload(previewImage.downloadUrl || '', previewImage.name)}
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
