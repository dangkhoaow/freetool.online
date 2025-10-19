'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useLanguage } from '../contexts/language-context';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
}

interface PdfViewerDialogProps {
  fileId: string | null;
  fileName: string;
  fileBlob: Blob | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfViewerDialog({ fileId, fileName, fileBlob, isOpen, onClose }: PdfViewerDialogProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && fileBlob) {
      loadPdf();
    } else {
      // Clean up when dialog closes
      if (canvasUrl) {
        URL.revokeObjectURL(canvasUrl);
      }
      setCanvasUrl(null);
      setPdfDoc(null);
      setCurrentPage(1);
      setTotalPages(0);
      setError(null);
    }
  }, [isOpen, fileBlob]);

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage]);

  const loadPdf = async () => {
    if (!fileBlob) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert Blob to ArrayBuffer
      const arrayBuffer = await fileBlob.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(t('contracts.errorLoadingDetails') || 'Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDoc) return;

    try {
      // Get the page
      const page = await pdfDoc.getPage(pageNumber);
      
      // Calculate scale to fit the viewer width (max 800px)
      const viewport = page.getViewport({ scale: 1.0 });
      const maxWidth = 800;
      const scale = viewport.width > maxWidth ? maxWidth / viewport.width : 1.5;
      const scaledViewport = page.getViewport({ scale });
      
      // Create a canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }
      
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      // Render the page to the canvas
      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Clean up previous canvas URL
      if (canvasUrl) {
        URL.revokeObjectURL(canvasUrl);
      }
      
      setCanvasUrl(dataUrl);
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownload = () => {
    if (!fileBlob) return;

    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    // Clean up canvas URL
    if (canvasUrl) {
      URL.revokeObjectURL(canvasUrl);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span className="truncate flex-1 mr-4">{fileName}</span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!fileBlob}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('common.download')}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {!isLoading && !error && canvasUrl && (
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <img 
                  src={canvasUrl} 
                  alt={`Page ${currentPage} of ${totalPages}`}
                  className="max-w-full h-auto shadow-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Page Navigation */}
        {totalPages > 1 && !isLoading && !error && (
          <div className="flex-shrink-0 flex items-center justify-center gap-4 py-4 border-t">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {t('common.showing')} {currentPage} {t('common.of')} {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-shrink-0 flex justify-end pt-2 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


