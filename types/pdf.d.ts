declare module 'pdfjs-dist/build/pdf.js' {
  export function getDocument(params: any): { promise: Promise<any> };
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
}

declare module 'pdfjs-dist/types/src/display/api' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<any>;
    getPageIndices(): number[];
  }
} 