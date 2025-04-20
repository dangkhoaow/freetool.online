"use client";

import { v4 as uuidv4 } from 'uuid';

// Import types but don't re-export the interface name
import { 
  type ConversionJob, 
  type ConversionSettings,
  type HeicConverterService as HeicConverterServiceType 
} from '../lib/services/heic-converter-service';

// Re-export the types
export type { ConversionJob, ConversionSettings, HeicConverterServiceType };

// Get the implementation
import { getHeicConverterService } from '../lib/services/heic-converter-service';

// Export a singleton instance
export const HeicConverterService = getHeicConverterService(); 