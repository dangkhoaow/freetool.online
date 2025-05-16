/**
 * Utility functions for handling API responses consistently across the application
 */

import { toast } from "@/hooks/use-toast";

/**
 * Type guard to check if an object has a data property that is an array
 * @param obj Any object to check
 * @returns Type guard assertion
 */
export function hasDataProperty<T>(obj: any): obj is { data: T[]; error: any; count?: number } {
  return obj && typeof obj === 'object' && 'data' in obj && Array.isArray(obj.data);
}

/**
 * Safely extracts data from an API response with consistent error handling
 * Handles both direct array responses and nested { data: [...] } responses
 * 
 * @param response The API response to extract data from
 * @param componentName Name of the component for logging
 * @returns Extracted data array or empty array if not found
 */
export function extractApiData<T>(response: any, componentName: string): T[] {
  console.log(`[${componentName}] Processing API response:`, response);
  
  if (!response) {
    console.log(`[${componentName}] Response is null or undefined`);
    return [];
  }
  
  // Handle array response
  if (Array.isArray(response)) {
    console.log(`[${componentName}] Response is already an array with ${response.length} items`);
    return response as T[];
  }
  
  // Handle { data: [...] } response
  if (hasDataProperty<T>(response)) {
    console.log(`[${componentName}] Response has data property with ${response.data.length} items`);
    return response.data;
  }
  
  // Try to find an array in the response object values
  if (typeof response === 'object') {
    const values = Object.values(response);
    const possibleArray = values.find(val => Array.isArray(val));
    if (possibleArray) {
      console.log(`[${componentName}] Found array in response object with ${possibleArray.length} items`);
      return possibleArray as T[];
    }
  }
  
  // Handle error case
  if (response.error) {
    console.error(`[${componentName}] API error:`, response.error);
    toast({
      title: "Error fetching data",
      description: typeof response.error === 'string' 
        ? response.error 
        : response.error.message || "An unknown error occurred",
      variant: "destructive"
    });
  }
  
  console.warn(`[${componentName}] Could not extract data from response`);
  return [];
}
