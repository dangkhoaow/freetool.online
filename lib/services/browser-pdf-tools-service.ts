import { PDFDocument } from 'pdf-lib';
// Use browser-specific PDF.js imports
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

// Set the PDF.js worker source correctly for browser environment
if (typeof window !== 'undefined') {
  const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
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
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Apply compression settings
      const compressionOptions: { [key: string]: any } = {
        low: { useObjectStreams: false },
        medium: { useObjectStreams: true },
        high: { useObjectStreams: true, objectsPerTick: 20 },
      };
      
      // Define page size dimensions with support for more sizes
      const pageSizes: { [key: string]: [number, number] } = {
        'a4': [595.28, 841.89],
        'letter': [612, 792],
        'legal': [612, 1008],
        'a3': [841.89, 1190.55],
        'a5': [419.53, 595.28],
        'tabloid': [792, 1224],
        '13x11': [936, 792], // Photo book size
      };
      
      // Get page size
      const [width, height] = pageSizes[options.pageSize] || pageSizes['a4'];
      
      // Adjust for orientation
      const pageWidth = options.orientation === 'landscape' ? Math.max(width, height) : Math.min(width, height);
      const pageHeight = options.orientation === 'landscape' ? Math.min(width, height) : Math.max(width, height);
      
      // Define margins
      const marginSizes: { [key: string]: number } = {
        'none': 0,
        'small': 20,
        'medium': 40,
        'large': 60,
      };
      const margin = marginSizes[options.margin] || marginSizes['medium'];
      
      // Default values for optional settings
      const fitToPage = options.fitToPage !== undefined ? options.fitToPage : true;
      const quality = options.quality !== undefined ? options.quality : 90;
      const centered = options.centered !== undefined ? options.centered : true;
      const addPageNumbers = options.addPageNumbers || false;
      const createBookmarks = options.createBookmarks || false;
      const autoRotate = options.autoRotate !== undefined ? options.autoRotate : true;
      
      let processedFiles = 0;
      const totalFiles = files.length;
      
      // We'll track page indices for bookmarks
      const bookmarkData: { title: string; pageIndex: number }[] = [];
      
      // Process each image
      for (const file of files) {
        // Update progress
        if (progressCallback) {
          progressCallback(Math.floor((processedFiles / totalFiles) * 90));
        }
        
        // Convert image to embedded image
        const imageBytes = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          // Skip unsupported image formats
          console.warn(`Skipping unsupported image format: ${file.type}`);
          continue;
        }
        
        // Calculate dimensions to fit the page with margins
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        const imgWidth = image.width;
        const imgHeight = image.height;
        
        // Auto-rotate image if needed and requested
        let shouldRotate = false;
        let finalImgWidth = imgWidth;
        let finalImgHeight = imgHeight;
        
        if (autoRotate && 
            ((options.orientation === 'portrait' && imgWidth > imgHeight) || 
             (options.orientation === 'landscape' && imgHeight > imgWidth))) {
          // Swap dimensions for rotation
          finalImgWidth = imgHeight;
          finalImgHeight = imgWidth;
          shouldRotate = true;
        }
        
        // Calculate scale to fit if requested
        let scale = 1;
        if (fitToPage) {
          scale = Math.min(maxWidth / finalImgWidth, maxHeight / finalImgHeight);
        } else {
          // Limit scale to 1 (don't enlarge small images)
          scale = Math.min(1, Math.min(maxWidth / finalImgWidth, maxHeight / finalImgHeight));
        }
        
        // Calculate final dimensions
        const finalWidth = finalImgWidth * scale;
        const finalHeight = finalImgHeight * scale;
        
        // Calculate position (center by default)
        const x = centered ? (pageWidth - finalWidth) / 2 : margin;
        const y = centered ? (pageHeight - finalHeight) / 2 : margin;
        
        // Add a page and draw the image
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Draw the image (handle rotation in a type-safe way)
        if (shouldRotate) {
          // For rotation, we need to modify our drawing approach
          // First move to the position
          page.moveTo(x, y);
          // Then draw the image with standard dimensions
          page.drawImage(image, {
            x: x,
            y: y,
            width: finalHeight,
            height: finalWidth,
          });
        } else {
          page.drawImage(image, {
            x: x,
            y: y,
            width: finalWidth,
            height: finalHeight,
          });
        }
        
        // Add page number if requested
        if (addPageNumbers) {
          const pageNumber = processedFiles + 1;
          const fontSize = 10;
          page.drawText(`${pageNumber}`, {
            x: pageWidth / 2,
            y: margin / 2,
            size: fontSize,
          });
        }
        
        // Store bookmark data if requested
        if (createBookmarks) {
          bookmarkData.push({
            title: file.name,
            pageIndex: processedFiles,
          });
        }
        
        processedFiles++;
      }
      
      // Handle bookmarks (pdf-lib doesn't directly support bookmarks,
      // but we keep the data for potential future implementation)
      
      // Save the PDF with compression options
      const compressionLevel = options.compression || 'medium';
      const pdfBytes = await pdfDoc.save(compressionOptions[compressionLevel]);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Final progress update
      if (progressCallback) {
        progressCallback(100);
      }
      
      return {
        url: URL.createObjectURL(blob),
      };
    } catch (error) {
      console.error('Error creating PDF from images:', error);
      throw new Error('Failed to create PDF from images');
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