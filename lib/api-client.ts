/**
 * API Client for Projly services
 * 
 * This module provides a consistent interface for making HTTP requests to the API.
 * It handles common error scenarios and provides type-safe responses.
 */

import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';

// Log initialization for debugging
console.log('[API_CLIENT] Initializing API client');

// Define interface for the API responses
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  success: boolean;
}

// Helper to get the auth token from cookies (similar to getAuthToken in other modules)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('projly_token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1].trim();
  }
  
  return null;
};

// Build the API base URL
const getBaseUrl = () => {
  // Use the same logic as in apiConfig.ts to determine base URL
  // This ensures we're using the exact same URL calculation method
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // In browser environment, use the current window location
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // For local development, use the hardcoded port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    }
    
    // For production, use the same host as the frontend
    return `${protocol}//${hostname}`;
  }
  
  // Fallback for SSR or non-browser environments
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

// Log the API base URL for debugging
console.log('[API_CLIENT] Base URL:', getBaseUrl());

/**
 * Generic function to handle API responses and errors
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  console.log(`[API_CLIENT] Received response with status: ${response.status}`);
  
  if (!response.ok) {
    console.error(`[API_CLIENT] Error response: ${response.status}`);
    try {
      const errorData = await response.json();
      console.error('[API_CLIENT] Error data:', errorData);
      return {
        data: {} as T,
        error: errorData.message || 'Unknown error occurred',
        success: false
      };
    } catch (e) {
      return {
        data: {} as T,
        error: `HTTP error ${response.status}`,
        success: false
      };
    }
  }
  
  try {
    const jsonData = await response.json();
    console.log('[API_CLIENT] Successfully parsed JSON response');
    return {
      data: jsonData.data || jsonData,
      success: true
    };
  } catch (e) {
    console.error('[API_CLIENT] Error parsing JSON:', e);
    return {
      data: {} as T,
      error: 'Failed to parse response',
      success: false
    };
  }
};

/**
 * Create request headers with authorization if token exists
 */
const createHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * API client with methods for different HTTP verbs
 */
const apiClient = {
  /**
   * Perform a GET request to the API
   * @param endpoint - API endpoint to call (without base URL)
   * @param params - Optional query parameters
   */
  get: async <T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const url = new URL(`${getBaseUrl()}/${endpoint.replace(/^\//, '')}`);
      
      // Add query parameters if provided
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      console.log(`[API_CLIENT] GET request to: ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: createHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] GET request failed:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  },
  
  /**
   * Perform a POST request to the API
   * @param endpoint - API endpoint to call (without base URL)
   * @param data - Request payload
   */
  post: async <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const url = `${getBaseUrl()}/${endpoint.replace(/^\//, '')}`;
      console.log(`[API_CLIENT] POST request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });
      
      return await handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] POST request failed:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  },
  
  /**
   * Perform a PUT request to the API
   * @param endpoint - API endpoint to call (without base URL)
   * @param data - Request payload
   */
  put: async <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const url = `${getBaseUrl()}/${endpoint.replace(/^\//, '')}`;
      console.log(`[API_CLIENT] PUT request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: createHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });
      
      return await handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] PUT request failed:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  },
  
  /**
   * Perform a DELETE request to the API
   * @param endpoint - API endpoint to call (without base URL)
   */
  delete: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const url = `${getBaseUrl()}/${endpoint.replace(/^\//, '')}`;
      console.log(`[API_CLIENT] DELETE request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: createHeaders(),
        credentials: 'include'
      });
      
      return await handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] DELETE request failed:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  },
  
  /**
   * Perform a PATCH request to the API
   * @param endpoint - API endpoint to call (without base URL)
   * @param data - Request payload
   */
  patch: async <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const url = `${getBaseUrl()}/${endpoint.replace(/^\//, '')}`;
      console.log(`[API_CLIENT] PATCH request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: createHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
      });
      
      return await handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] PATCH request failed:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }
};

export default apiClient;
