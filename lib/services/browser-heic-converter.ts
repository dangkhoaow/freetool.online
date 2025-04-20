"use client";

// Only import the heic-to library
import { heicTo, isHeic as checkIsHeic } from "heic-to";

// Import pdf-lib for PDF operations
import { PDFDocument } from 'pdf-lib';

// Define the types for the converted results
export interface BrowserConversionJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  files: {
    originalName: string;
    convertedName?: string;
    size?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    url?: string;
    thumbnailUrl?: string;
  }[];
  outputFormat: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Check if a file is in HEIC format
 */
export async function isHeic(file: File): Promise<boolean> {
  try {
    console.log(`Checking if file ${file.name} is HEIC format...`);
    
    // Check file extension as a fallback
    const isHeicExtension = file.name.toLowerCase().endsWith('.heic') || 
                            file.name.toLowerCase().endsWith('.heif');
    
    if (!isHeicExtension) {
      console.log(`File ${file.name} does not have a HEIC/HEIF extension.`);
    }
    
    // Try to check using the library
    let result = false;
    try {
      result = await checkIsHeic(file);
      console.log(`HEIC check result for ${file.name}: ${result}`);
    } catch (libError) {
      console.error(`Error in HEIC library check for ${file.name}:`, libError);
      // If the library check fails, fall back to extension check
      if (isHeicExtension) {
        console.log(`Using extension fallback for ${file.name}`);
        return true;
      }
      return false;
    }
    
    // If library says it's not HEIC but has HEIC extension, we'll try conversion anyway
    return result || isHeicExtension;
  } catch (error: any) {
    console.error(`Error checking if file ${file.name} is HEIC:`, error);
    
    // If there's an error in checking, but the file has HEIC extension, we'll try anyway
    const isHeicExtension = file.name.toLowerCase().endsWith('.heic') || 
                            file.name.toLowerCase().endsWith('.heif');
    
    if (isHeicExtension) {
      console.log(`File ${file.name} has HEIC extension, attempting conversion despite check error.`);
      return true;
    }
    
    return false;
  }
}

/**
 * Combine multiple PDF blobs into a single PDF document
 */
export async function combinePdfsInBrowser(
  pdfBlobs: Blob[],
  fileNames: string[]
): Promise<Blob> {
  console.log(`Combining ${pdfBlobs.length} PDFs in browser mode...`);
  
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Sort blobs by filename alphabetically
    const sortedBlobsAndNames = pdfBlobs
      .map((blob, index) => ({ blob, name: fileNames[index] || `file-${index}.pdf` }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Sorted PDFs for combining: ${sortedBlobsAndNames.map(item => item.name).join(', ')}`);
    
    // Process each blob
    for (const { blob, name } of sortedBlobsAndNames) {
      try {
        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer();
        
        // Load PDF document from array buffer
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Copy all pages from the source document
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        // Add each copied page to the merged document
        pages.forEach(page => mergedPdf.addPage(page));
        
        console.log(`Added ${pages.length} pages from ${name} to combined PDF`);
      } catch (error: unknown) {
        console.error(`Error processing PDF ${name}:`, error);
      }
    }
    
    // Serialize the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    // Create a blob from the binary data with the correct MIME type
    const combinedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    console.log(`Combined PDF created, size: ${combinedPdfBlob.size} bytes`);
    
    return combinedPdfBlob;
  } catch (error: unknown) {
    console.error('Error combining PDFs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to combine PDFs: ${errorMessage}`);
  }
}

/**
 * Convert a HEIC file to the specified format in the browser
 */
export async function convertHeicInBrowser(
  file: File, 
  outputFormat: string = "jpg",
  quality: number = 80
): Promise<Blob> {
  // Map output format to mime type
  const mimeType = outputFormat === "jpg" ? "image/jpeg" :
                  outputFormat === "png" ? "image/png" :
                  outputFormat === "webp" ? "image/webp" : "image/jpeg";
  
  console.log(`Starting browser conversion of ${file.name} to ${outputFormat} with quality ${quality}...`);
  
  try {
    // Check for security or CORS issues
    try {
      // Try to read a small slice of the file to check for security restrictions
      const testSlice = file.slice(0, Math.min(1024, file.size));
      const reader = new FileReader();
      await new Promise<void>((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = (e) => reject(new Error(`Security restriction detected: ${e}`));
        reader.readAsArrayBuffer(testSlice);
      });
      console.log(`Security check passed for ${file.name}`);
    } catch (securityError: any) {
      console.error(`Security restriction detected for ${file.name}:`, securityError);
      throw new Error(`Browser security restriction: ${securityError.message || "Cannot access file"}`);
    }

    // Create a timeout promise to prevent hanging
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Conversion timeout for ${file.name}`)), 60000); // 60 second timeout
    });
    
    // Convert using heic-to library with timeout
    console.log(`Starting actual conversion for ${file.name}...`);
    const conversionPromise = heicTo({
      blob: file,
      type: mimeType,
      quality: quality / 100 // Convert from 0-100 to 0-1 scale
    }).catch(error => {
      console.error(`Library error converting ${file.name}:`, error);
      throw new Error(`HEIC conversion error: ${error.message || "Unknown library error"}`);
    });
    
    const result = await Promise.race([conversionPromise, timeout]);
    console.log(`Successfully converted ${file.name} to ${outputFormat}, size: ${result.size} bytes`);
    return result;
  } catch (error: any) {
    console.error(`Error converting ${file.name} in browser:`, error);
    
    // Check if this might be an ad blocker or security restriction
    const errorMessage = error.message || "";
    if (errorMessage.includes("security") || 
        errorMessage.includes("permission") || 
        errorMessage.includes("access") || 
        errorMessage.includes("denied") ||
        errorMessage.includes("blocked")) {
      throw new Error(`Browser security restriction detected: ${errorMessage}. Try disabling ad blockers or using server-based conversion.`);
    }
    
    // Default error message
    throw new Error(`Browser conversion failed for ${file.name}: ${errorMessage || "Unknown error"}`);
  }
}

/**
 * Generate a thumbnail for a converted blob
 */
export async function generateThumbnail(blob: Blob, maxWidth: number = 300): Promise<string> {
  console.log(`Generating thumbnail, blob size: ${blob.size} bytes`);
  
  // Check if the blob is a PDF by checking its type
  const isPdf = blob.type === 'application/pdf';
  
  if (isPdf) {
    console.log('Detected PDF file, creating generic PDF thumbnail');
    return createGenericPdfThumbnail();
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Create a timeout for image loading
    const timeoutId = setTimeout(() => {
      console.error("Thumbnail generation timed out");
      reject(new Error("Thumbnail generation timed out - image loading took too long"));
    }, 10000); // 10 second timeout
    
    // Create a safe object URL that we make sure to revoke
    let objectUrl: string | null = null;
    
    try {
      objectUrl = URL.createObjectURL(blob);
      console.log(`Created object URL for thumbnail: ${objectUrl}`);
      
      img.onload = function() {
        clearTimeout(timeoutId);
        
        try {
          console.log(`Image loaded for thumbnail: ${img.width}x${img.height}`);
          
          // Calculate thumbnail dimensions
          const canvas = document.createElement('canvas');
          const aspectRatio = img.width / img.height;
          const width = Math.min(maxWidth, img.width);
          const height = width / aspectRatio;
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error("Could not get canvas context");
          }
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to dataURL (can be changed to Blob if needed)
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          console.log(`Thumbnail generated, size: ~${Math.round(thumbnailUrl.length / 1.37)} bytes`);
          
          // Clean up resources
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
          
          resolve(thumbnailUrl);
        } catch (error) {
          console.error("Error generating thumbnail:", error);
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
          resolve(createGenericThumbnail());  // Fallback on error
        }
      };
      
      img.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error("Error loading image for thumbnail:", error);
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        
        // Fallback to generic thumbnail on error
        resolve(createGenericThumbnail());
      };
      
      img.src = objectUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error in thumbnail generation setup:", error);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      // Fallback to generic thumbnail on error
      resolve(createGenericThumbnail());
    }
  });
}

/**
 * Create a generic PDF thumbnail
 */
function createGenericPdfThumbnail(isLandscape: boolean = false): string {
  // Create a canvas for the PDF icon with appropriate orientation
  const canvas = document.createElement('canvas');
  
  if (isLandscape) {
    // Make landscape more pronounced
    canvas.width = 280;
    canvas.height = 190;
  } else {
    // Make portrait more pronounced
    canvas.width = 190;
    canvas.height = 280;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return createGenericThumbnail();
  }
  
  // Draw PDF document icon
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw PDF document outline - adjust based on orientation
  ctx.fillStyle = '#e74c3c';
  
  if (isLandscape) {
    // Draw landscape document outline
    const docWidth = Math.floor(canvas.width * 0.7);
    const docHeight = Math.floor(canvas.height * 0.65);
    const docX = Math.floor((canvas.width - docWidth) / 2);
    const docY = Math.floor((canvas.height - docHeight) / 2) - 10;
    
    ctx.fillRect(docX, docY, docWidth, docHeight);
    
    // Draw PDF dog-ear
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(docX + docWidth, docY);
    ctx.lineTo(docX + docWidth, docY + 40);
    ctx.lineTo(docX + docWidth - 40, docY);
    ctx.fill();
    
    // Draw PDF text lines
    ctx.fillStyle = 'white';
    ctx.fillRect(docX + 20, docY + 30, docWidth - 70, 8);
    ctx.fillRect(docX + 20, docY + 50, docWidth - 70, 8);
    ctx.fillRect(docX + 20, docY + 70, docWidth - 130, 8);
    
    // "LANDSCAPE" indicator at the bottom
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('LANDSCAPE', Math.floor(canvas.width / 2) - 45, canvas.height - 15);
  } else {
    // Draw portrait document outline
    const docWidth = Math.floor(canvas.width * 0.65);
    const docHeight = Math.floor(canvas.height * 0.7);
    const docX = Math.floor((canvas.width - docWidth) / 2);
    const docY = Math.floor((canvas.height - docHeight) / 2) - 20;
    
    ctx.fillRect(docX, docY, docWidth, docHeight);
    
    // Draw PDF dog-ear
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(docX + docWidth, docY);
    ctx.lineTo(docX + docWidth, docY + 40);
    ctx.lineTo(docX + docWidth - 40, docY);
    ctx.fill();
    
    // Draw PDF text lines
    ctx.fillStyle = 'white';
    ctx.fillRect(docX + 15, docY + 50, docWidth - 30, 8);
    ctx.fillRect(docX + 15, docY + 70, docWidth - 30, 8);
    ctx.fillRect(docX + 15, docY + 90, docWidth - 60, 8);
    
    // "PORTRAIT" indicator at the bottom
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PORTRAIT', Math.floor(canvas.width / 2) - 40, canvas.height - 15);
  }
  
  // PDF label at the top
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('PDF', Math.floor(canvas.width / 2) - 20, 25);
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Create a generic thumbnail for failed images
 */
function createGenericThumbnail(): string {
  // Create a canvas
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // If we can't get a context, return a transparent pixel
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  
  // Draw placeholder background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw image icon
  ctx.fillStyle = '#cccccc';
  ctx.beginPath();
  ctx.moveTo(60, 60);
  ctx.lineTo(140, 60);
  ctx.lineTo(140, 140);
  ctx.lineTo(60, 140);
  ctx.closePath();
  ctx.fill();
  
  // Draw mountain
  ctx.fillStyle = '#999999';
  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.lineTo(90, 100);
  ctx.lineTo(110, 120);
  ctx.lineTo(140, 90);
  ctx.lineTo(140, 140);
  ctx.closePath();
  ctx.fill();
  
  // Draw sun
  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.arc(120, 80, 10, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * Process multiple files in the browser
 */
export async function processBatchInBrowser(
  files: File[],
  settings: {
    outputFormat: string;
    quality: number;
    pageSize?: string;
    orientation?: string;
    margin?: string;
  },
  onProgress: (progress: number) => void
): Promise<BrowserConversionJob> {
  // Create a job ID for tracking
  const jobId = `browser-${Date.now()}`;
  const results: Array<{
    originalName: string;
    convertedName?: string;
    size?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    url?: string;
    thumbnailUrl?: string;
  }> = [];
  
  console.log(`Starting browser batch conversion of ${files.length} files to ${settings.outputFormat}...`);
  console.log(`PDF Settings: pageSize=${settings.pageSize}, orientation=${settings.orientation}, margin=${settings.margin}`);
  
  // Initial progress
  onProgress(5);
  
  let successCount = 0;
  let failedCount = 0;
  
  // Process files one by one
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Processing file ${i+1}/${files.length}: ${file.name} (${file.size} bytes)`);
    
    // Add pending status for this file
    results.push({
      originalName: file.name,
      status: "pending"
    });
    
    // Update progress (5% at start, 95% distributed across files)
    const fileProgress = 5 + Math.floor((i / files.length) * 90);
    onProgress(fileProgress);
    
    try {
      // Update status to processing
      results[i].status = "processing";
      
      // Check if file is HEIC
      console.log(`Checking if ${file.name} is HEIC...`);
      const isHeicFile = await isHeic(file);
      if (!isHeicFile) {
        console.warn(`File ${file.name} is not a HEIC file, skipping`);
        throw new Error("Not a HEIC file");
      }
      
      // Convert the file
      console.log(`Converting ${file.name} to ${settings.outputFormat}...`);
      
      // For PDF format, we need to keep the intermediate JPEG for thumbnailing
      let jpegBlob: Blob | null = null;
      let convertedBlob: Blob;
      
      if (settings.outputFormat === 'pdf') {
        // First convert to JPEG with high quality for both the PDF and thumbnail
        jpegBlob = await convertHeicInBrowser(file, "jpg", 90);
        
        // Use the JPEG to create the PDF
        convertedBlob = await convertJpegToPdf(
          jpegBlob,
          file.name,
          {
            pageSize: settings.pageSize,
            orientation: settings.orientation,
            margin: settings.margin
          }
        );
      } else {
        // For non-PDF formats, just convert directly
        convertedBlob = await convertHeicInBrowser(
          file,
          settings.outputFormat,
          settings.quality
        );
      }
      
      // Generate thumbnail
      console.log(`Generating thumbnail for ${file.name}...`);
      let thumbnailUrl: string;
      
      if (settings.outputFormat === 'pdf' && jpegBlob) {
        console.log(`Using actual image for PDF thumbnail of ${file.name}`);
        try {
          // Use the JPEG we already have for the thumbnail
          thumbnailUrl = await generateThumbnail(jpegBlob);
          console.log(`Generated thumbnail from JPEG for ${file.name}`);
        } catch (thumbnailError) {
          console.warn(`Error generating thumbnail from JPEG for ${file.name}, using fallback:`, thumbnailError);
          // Fallback to generic PDF thumbnail if needed
          const isLandscape = settings.orientation?.toLowerCase() === 'landscape';
          console.log(`PDF orientation for thumbnail fallback: ${isLandscape ? 'landscape' : 'portrait'}`);
          thumbnailUrl = createGenericPdfThumbnail(isLandscape);
        }
      } else {
        try {
          thumbnailUrl = await generateThumbnail(convertedBlob);
        } catch (thumbnailError) {
          console.warn(`Error generating thumbnail for ${file.name}, using fallback:`, thumbnailError);
          thumbnailUrl = createGenericThumbnail();
        }
      }
      
      // Create converted filename
      const convertedName = file.name.replace(/\.he(ic|if)$/i, `.${settings.outputFormat}`);
      
      // Create a URL for the converted blob
      console.log(`Creating object URL for ${convertedName}...`);
      const url = URL.createObjectURL(convertedBlob);
      
      // Update results
      results[i] = {
        originalName: file.name,
        convertedName,
        url,
        thumbnailUrl,
        size: convertedBlob.size,
        status: "completed" as const
      };
      
      successCount++;
      console.log(`Successfully processed ${file.name} to ${convertedName}`);
    } catch (error: any) {
      console.error(`Error processing file ${file.name}:`, error);
      failedCount++;
      results[i] = {
        originalName: file.name,
        status: "failed" as const,
        error: error.message || "Unknown error"
      };
    }
    
    // Update progress with completion percentage for this file
    const updatedProgress = 5 + Math.floor(((i + 1) / files.length) * 90);
    onProgress(updatedProgress);
  }
  
  // Final progress
  onProgress(100);
  
  // Log completion stats
  console.log(`Batch conversion complete. Successes: ${successCount}, Failures: ${failedCount}`);
  
  // Create result job
  return {
    jobId,
    status: successCount > 0 ? "completed" : "failed",
    progress: 100,
    files: results,
    outputFormat: settings.outputFormat,
    createdAt: new Date(),
    completedAt: new Date(),
    error: successCount === 0 ? `All files failed to convert. ${failedCount > 0 && results[0]?.error ? 'First error: ' + results[0].error : ''}` : undefined
  };
}

/**
 * Convert a JPEG blob to PDF with specified settings
 */
async function convertJpegToPdf(
  jpegBlob: Blob,
  originalFileName: string,
  settings?: {
    pageSize?: string;
    orientation?: string;
    margin?: string;
  }
): Promise<Blob> {
  try {
    console.log(`Converting JPEG to PDF with settings:`, settings);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Convert JPEG blob to base64
    const arrayBuffer = await jpegBlob.arrayBuffer();
    const base64Image = arrayBufferToBase64(arrayBuffer);
    
    // Embed the JPEG image in the PDF
    const jpegImage = await pdfDoc.embedJpg(`data:image/jpeg;base64,${base64Image}`);
    
    // Get image dimensions for aspect ratio calculations
    const imgDimensions = await getImageDimensions(jpegBlob);
    const imgAspectRatio = imgDimensions.width / imgDimensions.height;
    
    // Define page dimensions based on settings
    let pageWidth = 612; // Default US Letter width (8.5 x 11 inches at 72 dpi)
    let pageHeight = 792; // Default US Letter height
    
    // Set page size based on settings
    if (settings?.pageSize) {
      switch (settings.pageSize.toLowerCase()) {
        case 'a4':
          pageWidth = 595;
          pageHeight = 842;
          break;
        case 'a3':
          pageWidth = 842;
          pageHeight = 1191;
          break;
        case 'legal':
          pageWidth = 612;
          pageHeight = 1008;
          break;
        case 'tabloid':
          pageWidth = 792;
          pageHeight = 1224;
          break;
        // Default is already Letter
      }
    }
    
    // Apply orientation
    const isLandscape = settings?.orientation?.toLowerCase() === 'landscape';
    if (isLandscape) {
      // Swap width and height for landscape
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }
    
    // Create a page with the specified dimensions
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Calculate margin based on settings
    let margin = 36; // Default margin: 0.5 inch (36 points)
    if (settings?.margin) {
      switch (settings.margin.toLowerCase()) {
        case 'none':
          margin = 0;
          break;
        case 'small':
          margin = 18; // 0.25 inch
          break;
        case 'medium':
          margin = 36; // 0.5 inch (default)
          break;
        case 'large':
          margin = 72; // 1 inch
          break;
      }
    }
    
    // Calculate dimensions for the image to fit on the page with margins
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    // Determine if we should fit by width or height
    const availableAspectRatio = availableWidth / availableHeight;
    
    let imgWidth, imgHeight;
    
    if (imgAspectRatio > availableAspectRatio) {
      // Image is wider than the available space (relative to height)
      imgWidth = availableWidth;
      imgHeight = imgWidth / imgAspectRatio;
    } else {
      // Image is taller than the available space (relative to width)
      imgHeight = availableHeight;
      imgWidth = imgHeight * imgAspectRatio;
    }
    
    // Calculate position to center the image on the page
    const imgX = margin + (availableWidth - imgWidth) / 2;
    // PDF coordinate system starts from bottom-left, adjust Y accordingly
    const imgY = pageHeight - margin - imgHeight - (availableHeight - imgHeight) / 2;
    
    // Draw the image on the page with calculated dimensions and position
    page.drawImage(jpegImage, {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Create a PDF blob with the correct MIME type
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    console.log(`Successfully created PDF, size: ${pdfBlob.size} bytes`);
    
    return pdfBlob;
  } catch (error: unknown) {
    console.error(`Error creating PDF from JPEG:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`PDF creation failed: ${errorMessage}`);
  }
}

/**
 * Helper function to convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to get image dimensions from a blob
 */
async function getImageDimensions(imageBlob: Blob): Promise<{width: number, height: number}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(imageBlob);
  });
} 