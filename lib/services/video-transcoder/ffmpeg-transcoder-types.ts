// Common types used by the transcoder services

export interface VideoSettings {
  format: string;
  codec: string;
  quality: number;
  resolution: string;
  frameRate: number | null;
  audioCodec: string;
  audioBitrate: number;
  task: 'convert' | 'trim' | 'split' | 'merge';
  startTime: number;
  endTime: number | null;
  splitPoints: number[];
  mergeClips: MergeClip[];
  transition: 'none' | 'crossfade' | 'fade' | 'wipe';
  customWidth?: string;
  customHeight?: string;
  performanceMode?: 'balanced' | 'max-performance';
}

export interface MergeClip {
  id: string;
  file: File;
  name: string;
  duration: number;
  startTrim: number;
  endTrim: number;
  position: number;
  color: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec?: string;
  frameRate?: number;
}

export interface ProcessingResult {
  url: string;
  blob: Blob;
  duration?: number;
  width?: number;
  height?: number;
}

export type ProgressCallback = (progress: number) => void;
export type LogCallback = (message: string) => void;
