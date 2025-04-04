export interface Settings {
  outputFormat: string
  quality: number
  aiOptimization: boolean
  preserveExif: boolean
  resizeOption: string
  customWidth: number
  customHeight: number
  watermark: {
    enabled: boolean
    text: string
    position: string
    opacity: number
  }
  pdfOptions: {
    pageSize: string
    orientation: string
  }
}

