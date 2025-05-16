/**
 * API Client for making requests to backend API endpoints
 * This replaces direct calls to Prisma services from client components
 * 
 * This client handles data transformations between frontend and backend:
 * - Converts snake_case field names to camelCase when sending to backend
 * - Ensures dates are properly formatted in ISO-8601 format
 * - Adds detailed logging for debugging data transformations
 */

// Import centralized API configuration
import { API_BASE_URL } from '../config/apiConfig';

// Use centralized API base URL to ensure consistency
// This ensures all requests go to the same backend server

// Error types
export interface ApiError {
  message: string;
  details?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// Utility functions for data transformation
function toCamelCase(str: string): string {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

// Check if a value is a Date object
function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// Format date to ISO string safely
function formatDateToISO(value: any): string | null {
  if (!value) return null;
  
  // If it's already a string that looks like an ISO date, return it
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    console.log('[API CLIENT] Value is already an ISO string:', value);
    return value;
  }
  
  try {
    // If it's a Date object, convert to ISO string
    if (isDate(value)) {
      console.log('[API CLIENT] Converting Date object to ISO string');
      return value.toISOString();
    }
    
    // If it's a string in YYYY-MM-DD format, convert to ISO
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('[API CLIENT] Converting YYYY-MM-DD string to ISO string:', value);
      // Create date at noon UTC to avoid timezone issues
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
      return date.toISOString();
    }
    
    // Try to parse as a date if it's a string
    if (typeof value === 'string') {
      console.log('[API CLIENT] Attempting to parse string as date:', value);
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    console.error('[API CLIENT] Could not convert value to ISO date:', value);
    return null;
  } catch (error) {
    console.error('[API CLIENT] Error formatting date to ISO:', error);
    return null;
  }
}

// Convert object keys from snake_case to camelCase recursively
function transformToCamelCase(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformToCamelCase);
  }

  const camelCaseObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      let value = obj[key];
      
      // Handle date fields - ensure they're in ISO format
      const dateFields = ['startDate', 'endDate', 'dueDate', 'createdAt', 'updatedAt', 'start_date', 'end_date', 'due_date', 'created_at', 'updated_at'];
      const isDateField = dateFields.includes(key) || dateFields.includes(camelKey);
      
      if (isDateField && value !== null && value !== undefined) {
        console.log(`[API CLIENT] Processing date field ${camelKey}:`, value);
        const isoDate = formatDateToISO(value);
        if (isoDate) {
          value = isoDate;
          console.log(`[API CLIENT] Converted to ISO:`, isoDate);
        }
      }
      
      camelCaseObj[camelKey] = typeof value === 'object' && !isDate(value) ? 
        transformToCamelCase(value) : value;
    }
  }
  return camelCaseObj;
}

// Convert object keys from camelCase to snake_case recursively
function transformToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformToSnakeCase);
  }

  const snakeCaseObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      let value = obj[key];
      
      // Handle date fields - ensure they're in ISO format
      const dateFields = ['startDate', 'endDate', 'dueDate', 'createdAt', 'updatedAt', 'start_date', 'end_date', 'due_date', 'created_at', 'updated_at'];
      const isDateField = dateFields.includes(key) || dateFields.includes(snakeKey);
      
      if (isDateField && value !== null && value !== undefined) {
        console.log(`[API CLIENT] Processing date field ${snakeKey}:`, value);
        const isoDate = formatDateToISO(value);
        if (isoDate) {
          value = isoDate;
          console.log(`[API CLIENT] Converted to ISO:`, isoDate);
        }
      }
      
      snakeCaseObj[snakeKey] = typeof value === 'object' && !isDate(value) ? 
        transformToSnakeCase(value) : value;
    }
  }
  return snakeCaseObj;
}

// API client class
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('[API CLIENT] Initialized with base URL:', this.baseUrl);
  }

  // Helper to build URLs
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    console.log('[API CLIENT] GET request to:', endpoint, 'with params:', params);
    try {
      const url = new URL(this.buildUrl(endpoint), window.location.origin);
      
      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('[API CLIENT] GET request failed:', data.error);
        return { data: null, error: data.error || { message: 'Unknown error occurred' } };
      }
      
      console.log('[API CLIENT] GET request successful, data:', data.data ? 'Received data' : 'No data');
      return data;
    } catch (error) {
      console.error('[API CLIENT] GET request error:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: String(error)
        }
      };
    }
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    console.log('[API CLIENT] POST request to:', endpoint);
    console.log('[API CLIENT] Original data:', data);
    
    // Transform data to camelCase for backend
    const transformedData = transformToCamelCase(data);
    console.log('[API CLIENT] Transformed data (camelCase):', transformedData);
    
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify(transformedData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('[API CLIENT] POST request failed:', responseData.error);
        return { data: null, error: responseData.error || { message: 'Unknown error occurred' } };
      }
      
      console.log('[API CLIENT] POST request successful');
      return responseData;
    } catch (error) {
      console.error('[API CLIENT] POST request error:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: String(error)
        }
      };
    }
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    console.log('[API CLIENT] PUT request to:', endpoint);
    console.log('[API CLIENT] Original data:', data);
    
    // Transform data to camelCase for backend
    const transformedData = transformToCamelCase(data);
    console.log('[API CLIENT] Transformed data (camelCase):', transformedData);
    
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify(transformedData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('[API CLIENT] PUT request failed:', responseData.error);
        return { data: null, error: responseData.error || { message: 'Unknown error occurred' } };
      }
      
      console.log('[API CLIENT] PUT request successful');
      return responseData;
    } catch (error) {
      console.error('[API CLIENT] PUT request error:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: String(error)
        }
      };
    }
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.log('[API CLIENT] DELETE request to:', endpoint);
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('[API CLIENT] DELETE request failed:', data.error);
        return { data: null, error: data.error || { message: 'Unknown error occurred' } };
      }
      
      console.log('[API CLIENT] DELETE request successful');
      return data;
    } catch (error) {
      console.error('[API CLIENT] DELETE request error:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: String(error)
        }
      };
    }
  }
}

// Create and export default API client instance
const apiClient = new ApiClient();
export default apiClient;
