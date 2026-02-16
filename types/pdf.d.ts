declare module 'pdfjs-dist/webpack.mjs' {
  export function getDocument(params: any): { promise: Promise<any> };
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export const version: string;
}

declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<any>;
    getPageIndices(): number[];
  }
} 