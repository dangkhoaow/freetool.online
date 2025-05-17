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
 * Safely parses a date string or date object into a Date object
 * Handles various date formats including ISO strings from the backend
 * @param value The date string, Date object, or null/undefined to parse
 * @returns A valid Date object or null if parsing fails
 */
export function parseDateSafe(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  
  // If it's already a Date object, return it if valid
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Try parsing as ISO string first
    const parsedDate = new Date(value);
    if (isValid(parsedDate)) return parsedDate;
    
    // Try parsing as timestamp
    if (/^\d+$/.test(value)) {
      const timestamp = parseInt(value, 10);
      const dateFromTimestamp = new Date(timestamp);
      if (isValid(dateFromTimestamp)) return dateFromTimestamp;
    }
    
    // Try parsing with Date.parse
    const timestamp = Date.parse(value);
    if (!isNaN(timestamp)) {
      const dateFromParse = new Date(timestamp);
      if (isValid(dateFromParse)) return dateFromParse;
    }
  }
  
  return null;
}

/**
 * Converts a Date object or string to an ISO string safely
 * @param date The Date object or string to format
 * @returns ISO string or null if date is invalid
 */
export function toISOStringSafe(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  
  const date = parseDateSafe(value);
  if (!date) return null;
  
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return null;
  }
}

/**
 * Formats a date for display in the UI (DD/MM/YYYY)
 * @param date The Date object, string, or null/undefined to format
 * @returns Formatted date string or fallback if date is invalid
 */
export function formatDateForDisplay(
  value: Date | string | null | undefined,
  fallback: string = '-'
): string {
  const date = parseDateSafe(value);
  if (!date) return fallback;
  
  try {
    return format(date, DATE_DISPLAY_FORMAT);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return fallback;
  }
}

/**
 * Formats a date as YYYY-MM-DD for form inputs
 * @param date The Date object, string, or null/undefined to format
 * @returns Formatted date string or empty string if date is invalid
 */
export function formatDateForInput(value: Date | string | null | undefined): string {
  const date = parseDateSafe(value);
  if (!date) return '';
  
  try {
    return format(date, DATE_INPUT_FORMAT);
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

/**
 * Creates a UTC date at noon to avoid timezone issues
 * @param value The date string or Date object
 * @returns A Date object at noon UTC on the specified date
 */
export function createUTCDateAtNoon(value: string | Date | null | undefined): Date | null {
  const date = parseDateSafe(value);
  if (!date) return null;
  
  try {
    // Create a new date in UTC
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        12, // Noon to avoid timezone issues
        0,
        0,
        0
      )
    );
    
    return isValid(utcDate) ? utcDate : null;
  } catch (error) {
    console.error('Error creating UTC date at noon:', error);
    return null;
  }
}
