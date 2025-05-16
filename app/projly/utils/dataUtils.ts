/**
 * Data Utilities
 * 
 * This file contains utility functions for consistent data handling across the application.
 * It helps address common issues with data mismatches between API responses and UI components.
 */

import { format, parseISO } from 'date-fns';

/**
 * Safely get a string value from a potentially null/undefined value
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined
 * @returns A string value or the default value
 */
export function safeString(value: any, defaultValue: string = ""): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}

/**
 * Safely get a number value from a potentially null/undefined value
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined or not a number
 * @returns A number value or the default value
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safely get a date value from a potentially null/undefined/invalid date value
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined/invalid
 * @returns A Date object or the default value
 */
export function safeDate(value: any, defaultValue: Date | null = null): Date | null {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  try {
    // Handle string dates
    if (typeof value === 'string') {
      const date = parseISO(value);
      return isNaN(date.getTime()) ? defaultValue : date;
    }
    
    // Handle Date objects
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? defaultValue : value;
    }
    
    return defaultValue;
  } catch (error) {
    console.error("Error parsing date:", error);
    return defaultValue;
  }
}

/**
 * Safely format a date value to a string using date-fns
 * @param value The date value to format
 * @param formatString The format string to use
 * @param defaultValue The default value to return if value is null/undefined/invalid
 * @returns A formatted date string or the default value
 */
export function safeFormatDate(
  value: Date | string | null | undefined, 
  formatString: string = "yyyy-MM-dd", 
  defaultValue: string = ""
): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return defaultValue;
  }
}

/**
 * Safely get a boolean value from a potentially null/undefined value
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined
 * @returns A boolean value or the default value
 */
export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return Boolean(value);
}

/**
 * Safely get an ID value from a potentially null/undefined value
 * Useful for handling assignedTo, ownerId, etc.
 * @param value The value to check
 * @param defaultValue The default value to return if value is null/undefined
 * @returns An ID string or the default value
 */
export function safeId(value: any, defaultValue: string = "unassigned"): string {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  return String(value);
}

/**
 * Normalize an API response object to ensure consistent field naming and types
 * @param data The API response data to normalize
 * @returns A normalized object with consistent field names and types
 */
export function normalizeApiResponse<T>(data: any): T {
  if (!data) return {} as T;
  
  // Create a new object to avoid mutating the original
  const normalized = { ...data };
  
  // Convert snake_case to camelCase for all fields
  Object.keys(normalized).forEach(key => {
    if (key.includes('_')) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      normalized[camelKey] = normalized[key];
      delete normalized[key];
    }
  });
  
  return normalized as T;
}

/**
 * Debug utility to log data transformation
 * @param label A label for the log
 * @param before The data before transformation
 * @param after The data after transformation
 */
export function logDataTransformation(label: string, before: any, after: any): void {
  console.log(`[DATA TRANSFORM] ${label}:`);
  console.log("  Before:", before);
  console.log("  After:", after);
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value The value to check
 * @returns True if the value is empty, false otherwise
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Get a default value for a field based on its type
 * @param fieldType The type of the field
 * @returns A default value for the field
 */
export function getDefaultValueByType(fieldType: string): any {
  switch (fieldType) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'date':
      return null;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'id':
      return 'unassigned';
    default:
      return null;
  }
}
