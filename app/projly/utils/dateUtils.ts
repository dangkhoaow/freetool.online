/**
 * Utility functions for handling date conversions and formatting throughout the application
 */

import { format, isValid, parseISO } from 'date-fns';

/**
 * Standard date display format for the application (DD/MM/YYYY)
 */
export const DATE_DISPLAY_FORMAT = 'dd/MM/yyyy';

/**
 * ISO format for sending dates to the backend
 */
export const DATE_ISO_FORMAT = 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'';

/**
 * Format for date inputs (YYYY-MM-DD)
 */
export const DATE_INPUT_FORMAT = 'yyyy-MM-dd';

/**
 * Type guard to check if a value is a Date object
 */
export function isDate(value: any): value is Date {
  return value instanceof Date;
}

/**
 * Safely parses a date string or date object into a Date object
 * Handles various date formats including ISO strings from the backend
 * @param value The date string, Date object, or null/undefined to parse
 * @returns A valid Date object or null if parsing fails
 */
export function parseDateSafe(value: string | Date | null | undefined): Date | null {
  console.log("[dateUtils] Parsing date:", value);
  
  if (!value) {
    console.log("[dateUtils] Date is null or undefined, returning null");
    return null;
  }
  
  // If it's already a Date object, just validate it
  if (isDate(value)) {
    if (isValid(value)) {
      console.log("[dateUtils] Value is already a valid Date object");
      return value;
    } else {
      console.error("[dateUtils] Value is a Date object but invalid:", value);
      return null;
    }
  }
  
  // Handle string dates
  try {
    const dateString = String(value);
    
    // Handle ISO format from backend (e.g., "2025-05-10T00:00:00.000Z")
    if (dateString.includes('T')) {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        console.log("[dateUtils] Successfully parsed ISO date:", parsedDate);
        return parsedDate;
      }
    }
    
    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        console.log("[dateUtils] Successfully parsed YYYY-MM-DD date:", parsedDate);
        return parsedDate;
      }
    }
    
    // Fallback to standard Date constructor with noon UTC time
    const [year, month, day] = dateString.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Create date at noon UTC to avoid timezone issues
      const parsedDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
      if (isValid(parsedDate)) {
        console.log("[dateUtils] Successfully created UTC date at noon:", parsedDate);
        return parsedDate;
      }
    }
    
    // Last resort: try regular Date constructor
    const fallbackDate = new Date(dateString);
    if (isValid(fallbackDate)) {
      console.log("[dateUtils] Used fallback Date constructor successfully:", fallbackDate);
      return fallbackDate;
    }
    
    console.error("[dateUtils] Failed to parse date with any method:", dateString);
    return null;
  } catch (error) {
    console.error("[dateUtils] Error parsing date:", error);
    return null;
  }
}

/**
 * Converts a Date object or string to an ISO string safely
 * @param date The Date object or string to format
 * @returns ISO string or null if date is invalid
 */
export function toISOStringSafe(value: Date | string | null | undefined): string | null {
  if (!value) {
    console.log("[dateUtils] Value is null or undefined, returning null");
    return null;
  }
  
  try {
    // First ensure we have a Date object
    const date = isDate(value) ? value : parseDateSafe(value);
    
    if (date && isValid(date)) {
      const isoString = date.toISOString();
      console.log("[dateUtils] Successfully converted to ISO string:", isoString);
      return isoString;
    }
    console.error("[dateUtils] Date is invalid, cannot convert to ISO string:", value);
    return null;
  } catch (error) {
    console.error("[dateUtils] Error converting value to ISO string:", error);
    return null;
  }
}

/**
 * Formats a date for display in the UI (DD/MM/YYYY)
 * @param date The Date object, string, or null/undefined to format
 * @returns Formatted date string or fallback if date is invalid
 */
export function formatDateForDisplay(value: Date | string | null | undefined, fallback: string = '-'): string {
  if (!value) {
    return fallback;
  }
  
  try {
    // First ensure we have a Date object
    const date = isDate(value) ? value : parseDateSafe(value);
    
    if (date && isValid(date)) {
      const formatted = format(date, DATE_DISPLAY_FORMAT);
      console.log("[dateUtils] Formatted date for display:", formatted);
      return formatted;
    }
    
    console.error("[dateUtils] Value is invalid, cannot format for display:", value);
    return fallback;
  } catch (error) {
    console.error("[dateUtils] Error formatting value for display:", error);
    return fallback;
  }
}

/**
 * Formats a date as YYYY-MM-DD for form inputs
 * @param date The Date object, string, or null/undefined to format
 * @returns Formatted date string or empty string if date is invalid
 */
export function formatDateForInput(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }
  
  try {
    // First ensure we have a Date object
    const date = isDate(value) ? value : parseDateSafe(value);
    
    if (date && isValid(date)) {
      const formatted = format(date, 'yyyy-MM-dd');
      console.log("[dateUtils] Formatted date for input:", formatted);
      return formatted;
    }
    
    // Special case for string dates in YYYY-MM-DD format
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log("[dateUtils] Value is already in YYYY-MM-DD format:", value);
      return value;
    }
    
    // Special case for ISO string dates
    if (typeof value === 'string' && value.includes('T')) {
      const datePart = value.split('T')[0];
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log("[dateUtils] Extracted date part from ISO string:", datePart);
        return datePart;
      }
    }
    
    console.error("[dateUtils] Value is invalid, cannot format for input:", value);
    return "";
  } catch (error) {
    console.error("[dateUtils] Error formatting value for input:", error);
    return "";
  }
}

/**
 * Creates a UTC date at noon to avoid timezone issues
 * @param value The date string or Date object
 * @returns A Date object at noon UTC on the specified date
 */
export function createUTCDateAtNoon(value: string | Date | null | undefined): Date | null {
  console.log("[dateUtils] Creating UTC date at noon from:", value);
  
  if (!value) {
    console.log("[dateUtils] Value is null or undefined, returning null");
    return null;
  }
  
  // If it's already a Date object, create a new noon UTC date from it
  if (isDate(value)) {
    if (isValid(value)) {
      const year = value.getUTCFullYear();
      const month = value.getUTCMonth(); // 0-indexed
      const day = value.getUTCDate();
      
      const noonDate = new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
      console.log("[dateUtils] Created noon UTC from Date object:", noonDate);
      return noonDate;
    } else {
      console.error("[dateUtils] Input Date is invalid:", value);
      return null;
    }
  }
  
  // Handle string cases
  try {
    const dateString = String(value);
    
    // Handle ISO format
    if (dateString.includes('T')) {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return createUTCDateAtNoon(parsedDate);
      }
    }
    
    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error("[dateUtils] Invalid date components:", { year, month, day });
        return null;
      }
      
      // Create date with noon UTC time to avoid timezone issues
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
      
      if (isValid(date)) {
        console.log("[dateUtils] Successfully created UTC date at noon:", date);
        return date;
      }
    }
    
    // Last resort: parse the string and then create noon UTC
    const parsed = parseDateSafe(dateString);
    if (parsed) {
      return createUTCDateAtNoon(parsed);
    }
    
    console.error("[dateUtils] Failed to create UTC date at noon from:", value);
    return null;
  } catch (error) {
    console.error("[dateUtils] Error creating UTC date at noon:", error);
    return null;
  }
}
