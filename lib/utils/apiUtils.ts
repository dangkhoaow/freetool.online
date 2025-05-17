/**
 * Utility functions for handling API responses consistently across the application
 */

import { toast } from "@/components/ui/use-toast";

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
  
  console.log(`[${componentName}] No array data found in response`);
  return [];
}

/**
 * Handles API errors consistently across the application
 * Shows toast notifications for user-facing errors
 * 
 * @param error The error object from the API call
 * @param defaultMessage Default error message if none is provided
 * @param options Additional options for error handling
 */
export function handleApiError(
  error: any,
  defaultMessage: string = 'An error occurred',
  options: { showToast?: boolean; logError?: boolean } = { showToast: true, logError: true }
): void {
  const { showToast = true, logError = true } = options;
  
  let errorMessage = defaultMessage;
  let errorDetails: any = undefined;
  
  // Parse error from different possible formats
  if (error) {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
      errorDetails = error;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
      errorDetails = error.error;
    }
  }
  
  // Log error details if needed
  if (logError) {
    console.error('API Error:', {
      message: errorMessage,
      details: errorDetails || error,
      timestamp: new Date().toISOString()
    });
  }
  
  // Show toast notification if needed
  if (showToast) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: errorMessage,
      duration: 5000,
    });
  }
}

/**
 * Creates a standardized API response object
 * 
 * @param data The data to include in the response
 * @param options Additional response options
 * @returns Standardized API response object
 */
export function createApiResponse<T>(
  data: T | null,
  options: {
    error?: string | Error | null;
    message?: string;
    status?: number;
    success?: boolean;
  } = {}
) {
  const { error = null, message, status = 200, success = true } = options;
  
  return {
    data,
    error: error 
      ? typeof error === 'string' 
        ? { message: error, status }
        : error instanceof Error
        ? { message: error.message, status, stack: error.stack }
        : { ...error, status }
      : null,
    message,
    status,
    success: error ? false : success,
  };
}
