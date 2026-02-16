import { PDFDocument, RotationTypes, PDFOperator, PDFPage } from 'pdf-lib';
// Use browser-specific PDF.js imports
import * as pdfjsLib from 'pdfjs-dist/webpack.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Set the PDF.js worker source correctly for browser environment
if (typeof window !== 'undefined') {
  const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
}

// Define the types for PDF operations
export interface PdfMergeResult {
  url: string
  size: number
}

export interface PdfSplitResult {
  urls: string[]
}

export interface PdfCompressResult {
  url: string
  size: number
}

export interface PdfToImageResult {
  images: { url: string; name: string }[]
}

export interface ImageToPdfResult {
  url: string
}

export interface PdfRotateResult {
  url: string
  size: number
}

export interface PdfToImageOptions {
  format: "jpg" | "png"
  quality: number
  pageRange: string
}

export interface ImageToPdfOptions {
  pageSize: string
  orientation: "portrait" | "landscape"
  margin: "none" | "small" | "medium" | "large"
  fitToPage?: boolean
  quality?: number
  compression?: "low" | "medium" | "high"
  autoRotate?: boolean
  addPageNumbers?: boolean
  centered?: boolean
  createBookmarks?: boolean
}

// Singleton instance
let instance: BrowserPdfToolsService | null = null;

export class BrowserPdfToolsService {
  private userId: string;

  constructor() {
    // Generate or retrieve a user ID for tracking operations
    this.userId = this.getUserId();
  }

  // Get or create a user ID
  private getUserId(): string {
    if (typeof window !== "undefined") {
      let userId = localStorage.getItem("userId")
      if (!userId) {
        userId = "user_" + Math.random().toString(36).substring(2, 15)
        localStorage.setItem("userId", userId)
      }
      return userId
    }
    return "anonymous"
  }

  // Get PDF page count using PDF.js
  public async getPdfPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch (error) {
      console.error('Error getting PDF page count:', error);
      throw new Error('Failed to get page count from PDF');
    }
  }

  // Merge multiple PDF files using pdf-lib
  public async mergePdfs(files: File[], progressCallback?: (progress: number) => void): Promise<PdfMergeResult> {
    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      
      let processedFiles = 0;
      const totalFiles = files.length;
      
      // Process each file
      for (const file of files) {
        // Update progress
        if (progressCallback) {
          progressCallback(Math.floor((processedFiles / totalFiles) * 90));
        }
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Copy pages from the source document to the merged document
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
        
        processedFiles++;
      }
      
      // Serialize the merged PDF to bytes
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create a Blob from the bytes
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      
      // Final progress update
      if (progressCallback) {
        progressCallback(100);
      }
      
      // Create a URL for the Blob
      return {
        url: URL.createObjectURL(blob),
        size: blob.size
      };
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF files');
    }
  }

  // Split PDF by all pages
  public async splitPdfAllPages(file: File, progressCallback?: (progress: number) => void): Promise<PdfSplitResult> {
    try {
      const pageCount = await this.getPdfPageCount(file);
      return this.splitPdfByPages(file, Array.from({ length: pageCount }, (_, i) => i + 1).join(','), progressCallback);
    } catch (error) {
      console.error('Error splitting PDF by all pages:', error);
      throw new Error('Failed to split PDF');
    }
  }

  // Split PDF by page range
  public async splitPdfByRange(
    file: File,
    pageRange: string,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfSplitResult> {
    try {
      // Parse page range (e.g., "1-5")
      const [start, end] = pageRange.split("-").map(Number);
      const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      return this.splitPdfByPages(file, pages.join(','), progressCallback);
    } catch (error) {
      console.error('Error splitting PDF by range:', error);
      throw new Error('Failed to split PDF by range');
    }
  }

  // Split PDF by specific pages
  public async splitPdfByPages(
    file: File,
    pageList: string,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfSplitResult> {
    try {
      // Parse page list (e.g., "1,3,5,7")
      const pages = pageList.split(",").map(Number);
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the source PDF
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const urls: string[] = [];
      
      let processedPages = 0;
      const totalPages = pages.length;
      
      // Create a new PDF for each page
      for (const pageNum of pages) {
        // Update progress
        if (progressCallback) {
          progressCallback(Math.floor((processedPages / totalPages) * 90));
        }
        
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);
        
        // Save the new PDF
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        urls.push(URL.createObjectURL(blob));
        
        processedPages++;
      }
      
      // Final progress update
      if (progressCallback) {
        progressCallback(100);
      }
      
      return { urls };
    } catch (error) {
      console.error('Error splitting PDF by pages:', error);
      throw new Error('Failed to split PDF by pages');
    }
  }

  // Compress PDF
  public async compressPdf(
    file: File,
    compressionLevel: "low" | "medium" | "high",
    progressCallback?: (progress: number) => void,
  ): Promise<PdfCompressResult> {
    try {
      if (progressCallback) progressCallback(10);
      
      // Load the PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      if (progressCallback) progressCallback(40);
      
      // Apply compression settings
      const compressionOptions: { [key: string]: any } = {
        low: { useObjectStreams: false },
        medium: { useObjectStreams: true },
        high: { useObjectStreams: true, objectsPerTick: 20 },
      };
      
      // Save with compression options
      const pdfBytes = await pdfDoc.save(compressionOptions[compressionLevel]);
      
      if (progressCallback) progressCallback(90);
      
      // Create blob and URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      if (progressCallback) progressCallback(100);
      
      return {
        url: URL.createObjectURL(blob),
        size: blob.size,
      };
    } catch (error) {
      console.error('Error compressing PDF:', error);
      throw new Error('Failed to compress PDF');
    }
  }

  // Convert PDF to images
  public async convertPdfToImages(
    file: File,
    options: PdfToImageOptions,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfToImageResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      
      // Determine which pages to convert
      let pagesToConvert: number[] = [];
      
      if (options.pageRange === "all") {
        pagesToConvert = Array.from({ length: pageCount }, (_, i) => i + 1);
      } else if (options.pageRange.includes("-")) {
        const [start, end] = options.pageRange.split("-").map(Number);
        pagesToConvert = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      } else if (options.pageRange.includes(",")) {
        pagesToConvert = options.pageRange.split(",").map(Number);
      } else {
        pagesToConvert = [parseInt(options.pageRange)];
      }
      
      const images: { url: string; name: string }[] = [];
      let processedPages = 0;
      
      // Process each page
      for (const pageNum of pagesToConvert) {
        // Update progress
        if (progressCallback) {
          progressCallback(Math.floor((processedPages / pagesToConvert.length) * 90));
        }
        
        // Get the page
        const page = await pdf.getPage(pageNum);
        
        // Scale viewport for better quality
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create a canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render the page to the canvas
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
        
        // Convert to image based on format choice
        const quality = options.quality / 100;
        let url: string;
        
        if (options.format === 'jpg') {
          url = canvas.toDataURL('image/jpeg', quality);
        } else {
          url = canvas.toDataURL('image/png');
        }
        
        // Add to results
        images.push({
          url,
          name: `page-${pageNum}.${options.format}`,
        });
        
        processedPages++;
      }
      
      // Final progress update
      if (progressCallback) {
        progressCallback(100);
      }
      
      return { images };
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error('Failed to convert PDF to images');
    }
  }

  // Create PDF from images
  public async createPdfFromImages(
    files: File[],
    options: ImageToPdfOptions,
    progressCallback?: (progress: number) => void,
  ): Promise<ImageToPdfResult> {
    try {
      const { margin = 20, fitToPage = true } = options;
      const pdfDoc = await PDFDocument.create();
      
      let processedFiles = 0;
      
      for (const file of files) {
        try {
          const image = await this.loadImageFromFile(file);
          
          // Get page dimensions based on options or default to A4
          const pageWidth = this.getPageWidth(options.pageSize);
          const pageHeight = this.getPageHeight(options.pageSize);
          
          // Calculate dimensions to fit the page with margins
          const { width: imgWidth, height: imgHeight, shouldRotate } = this.calculateDimensions(
            image.width, 
            image.height, 
            pageWidth, 
            pageHeight, 
            this.getMarginSize(options.margin), 
            fitToPage
          );
          
          console.log(`Processing image: ${file.name}, original dimensions: ${image.width}x${image.height}`);
          console.log(`PDF page dimensions: ${pageWidth}x${pageHeight}, margin: ${this.getMarginSize(options.margin)}`);
          console.log(`Calculated dimensions after scaling/rotation: ${imgWidth.toFixed(2)}x${imgHeight.toFixed(2)}, shouldRotate: ${shouldRotate}`);
          
          // Create page
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          
          // Draw the image on the page
          await this.drawImageOnPage(
            page, 
            image, 
            this.getMarginSize(options.margin), 
            shouldRotate, 
            imgWidth, 
            imgHeight
          );
          
          processedFiles++;
          if (progressCallback) {
            progressCallback((processedFiles / files.length) * 100);
          }
        } catch (error: unknown) {
          console.error(`Error processing image: ${file.name}`, error);
          throw new Error(`Failed to process image: ${file.name}. ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Save the PDF document
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob URL for the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      return { url };
    } catch (error) {
      console.error('Error creating PDF from images:', error);
      throw new Error('Failed to create PDF from images');
    }
  }

  // Rotate PDF pages
  public async rotatePdfPages(
    file: File,
    pageRange: string,
    degrees: 90 | 180 | 270,
    progressCallback?: (progress: number) => void,
  ): Promise<PdfRotateResult> {
    try {
      if (progressCallback) progressCallback(10);
      
      // Load the PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      if (progressCallback) progressCallback(30);
      
      // Parse page range
      let pagesToRotate: number[] = [];
      
      if (pageRange === "all") {
        pagesToRotate = Array.from({ length: pageCount }, (_, i) => i);
      } else if (pageRange.includes("-")) {
        const [start, end] = pageRange.split("-").map(num => parseInt(num, 10) - 1);
        pagesToRotate = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      } else if (pageRange.includes(",")) {
        pagesToRotate = pageRange.split(",").map(num => parseInt(num, 10) - 1);
      } else {
        // Single page
        pagesToRotate = [parseInt(pageRange, 10) - 1];
      }
      
      if (progressCallback) progressCallback(50);
      
      // Make sure page indices are valid
      pagesToRotate = pagesToRotate.filter(pageIdx => pageIdx >= 0 && pageIdx < pageCount);
      
      // Rotate each page in the range
      for (const pageIndex of pagesToRotate) {
        const page = pdfDoc.getPage(pageIndex);
        
        // Calculate the rotation degree based on current rotation
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + degrees) % 360;
        
        // Set the new rotation with the correct enum type
        page.setRotation({ type: RotationTypes.Degrees, angle: newRotation });
      }
      
      if (progressCallback) progressCallback(80);
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      if (progressCallback) progressCallback(100);
      
      return {
        url: URL.createObjectURL(blob),
        size: blob.size,
      };
    } catch (error) {
      console.error('Error rotating PDF pages:', error);
      throw new Error('Failed to rotate PDF pages');
    }
  }

  private calculateDimensions(imgWidth: number, imgHeight: number, pageWidth: number, pageHeight: number, margin: number, fitToPage: boolean): { 
    width: number; 
    height: number; 
    shouldRotate: boolean;
  } {
    console.log(`Original image dimensions: ${imgWidth}x${imgHeight}, Page dimensions: ${pageWidth}x${pageHeight}, margin: ${margin}`);
    
    // Calculate available space on page
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;
    console.log(`Available space on page: ${maxWidth}x${maxHeight}`);
    
    // Determine if image should be rotated based on aspect ratios
    const imgAspectRatio = imgWidth / imgHeight;
    const pageAspectRatio = maxWidth / maxHeight;
    
    // Improve rotation decision logic:
    // Rotate only if both conditions are met:
    // 1. Image is landscape and PDF is portrait (or vice versa)
    // 2. Rotating would result in better utilization of page space
    const imageLandscape = imgAspectRatio > 1;
    const pageLandscape = pageAspectRatio > 1;
    
    // Only rotate if image and page orientations don't match AND rotating improves fit
    const shouldRotate = 
      (imageLandscape && !pageLandscape && imgWidth > maxWidth && imgHeight < maxHeight) || 
      (!imageLandscape && pageLandscape && imgHeight > maxHeight && imgWidth < maxWidth);
    
    console.log(`Image aspect ratio: ${imgAspectRatio.toFixed(2)}, Page aspect ratio: ${pageAspectRatio.toFixed(2)}`);
    console.log(`Image is ${imageLandscape ? 'landscape' : 'portrait'}, Page is ${pageLandscape ? 'landscape' : 'portrait'}`);
    console.log(`Should rotate: ${shouldRotate}`);
    
    let width = imgWidth;
    let height = imgHeight;
    
    // If should rotate, swap dimensions for calculation purposes
    if (shouldRotate) {
      [width, height] = [height, width];
      console.log(`Swapped dimensions for calculation: ${width}x${height}`);
    }
    
    // Calculate scale factor
    let scale = 1;
    
    if (fitToPage) {
      // When fitting to page, prioritize maintaining aspect ratio while maximizing size
      if (width > maxWidth || height > maxHeight) {
        // If image is too large in any dimension, scale down proportionally
        scale = Math.min(maxWidth / width, maxHeight / height);
        console.log(`Scaling to fit page, scale factor: ${scale.toFixed(4)}`);
      } else if (width < maxWidth && height < maxHeight && Math.min(maxWidth / width, maxHeight / height) > 1) {
        // If image is smaller than the page and fitToPage is true, scale up proportionally
        // but limit scaling to avoid excessive enlargement
        scale = Math.min(maxWidth / width, maxHeight / height, 2);
        console.log(`Scaling up to better fit page, scale factor: ${scale.toFixed(4)}`);
      }
    } else {
      // When not fitting to page, only scale down if needed, never scale up
      if (width > maxWidth || height > maxHeight) {
        scale = Math.min(maxWidth / width, maxHeight / height);
        console.log(`Scaling down to fit page, scale factor: ${scale.toFixed(4)}`);
      } else {
        console.log('No scaling needed, image fits within page');
      }
    }
    
    // Apply scaling
    width = width * scale;
    height = height * scale;
    
    console.log(`Final calculated dimensions: ${width.toFixed(2)}x${height.toFixed(2)}`);
    
    return {
      width,
      height,
      shouldRotate
    };
  }

  private async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private getPageWidth(pageSize: string = 'a4'): number {
    const pageSizes: { [key: string]: [number, number] } = {
      'a4': [595.28, 841.89],
      'letter': [612, 792],
      'legal': [612, 1008],
      'a3': [841.89, 1190.55],
      'a5': [419.53, 595.28],
      'tabloid': [792, 1224],
    };
    const [width, height] = pageSizes[pageSize] || pageSizes['a4'];
    return width;
  }

  private getPageHeight(pageSize: string = 'a4'): number {
    const pageSizes: { [key: string]: [number, number] } = {
      'a4': [595.28, 841.89],
      'letter': [612, 792],
      'legal': [612, 1008],
      'a3': [841.89, 1190.55],
      'a5': [419.53, 595.28],
      'tabloid': [792, 1224],
    };
    const [width, height] = pageSizes[pageSize] || pageSizes['a4'];
    return height;
  }

  private getMarginSize(marginOption: string = 'medium'): number {
    const marginSizes: { [key: string]: number } = {
      'none': 0,
      'small': 20,
      'medium': 40,
      'large': 60,
    };
    return marginSizes[marginOption] || marginSizes['medium'];
  }

  private async imageToBase64(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(image, 0, 0);
        
        // Remove the data:image/png;base64, prefix if using with pdf-lib
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async drawImageOnPage(page: PDFPage, image: HTMLImageElement, margin: number, shouldRotate: boolean, finalWidth: number, finalHeight: number): Promise<void> {
    console.log(`Drawing image on page. Dimensions: ${finalWidth.toFixed(2)}x${finalHeight.toFixed(2)}, Should rotate: ${shouldRotate}`);
    
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    
    // Calculate center position
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    try {
      // First, convert image to base64 and embed it in the PDF document
      const base64Image = await this.imageToBase64(image);
      const embeddedImage = await page.doc.embedPng(base64Image);
      
      if (shouldRotate) {
        console.log(`Drawing rotated image at center: ${centerX}, ${centerY}`);
        
        // For rotated images, we need to use operators for transformation
        // Save graphics state
        page.pushOperators(PDFOperator.of('q' as any));
        
        // Translate to center of page
        page.pushOperators(PDFOperator.of('cm' as any, [1, 0, 0, 1, centerX, centerY] as any[]));
        
        // Rotate 90 degrees counterclockwise
        page.pushOperators(PDFOperator.of('cm' as any, [0, 1, -1, 0, 0, 0] as any[]));
        
        // Translate to position image correctly given its center
        page.pushOperators(PDFOperator.of('cm' as any, [1, 0, 0, 1, -finalHeight/2, -finalWidth/2] as any[]));
        
        // Draw the image with the calculated dimensions
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: finalHeight,
          height: finalWidth
        });
        
        // Restore graphics state
        page.pushOperators(PDFOperator.of('Q' as any));
      } else {
        console.log(`Drawing image at center: ${centerX}, ${centerY}`);
        
        // For non-rotated images, draw normally
        page.drawImage(embeddedImage, {
          x: centerX - finalWidth / 2,
          y: centerY - finalHeight / 2,
          width: finalWidth,
          height: finalHeight,
        });
      }
    } catch (error: unknown) {
      console.error('Error drawing image:', error);
      throw new Error(`Failed to draw image on PDF page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Singleton getter
export function getBrowserPdfToolsService(): BrowserPdfToolsService {
  if (!instance) {
    instance = new BrowserPdfToolsService();
  }
  return instance;
} 