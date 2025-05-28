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
  status?: number; // HTTP status code
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
  // In the browser, use the public API URL from environment variables
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // For server-side rendering, use the environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

// Get the base URL for API requests
const API_BASE_URL = getBaseUrl();

// Log the API base URL for debugging
console.log('[API_CLIENT] Environment:', process.env.NODE_ENV);
console.log('[API_CLIENT] API Base URL:', API_BASE_URL);

/**
 * Generic function to handle API responses and errors
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const statusCode = response.status;
  console.log(`[API_CLIENT] Received response with status: ${statusCode}`);
  
  try {
    const responseText = await response.text();
    let jsonData: any;
    
    // Handle empty response case
    if (!responseText) {
      console.warn('[API_CLIENT] Empty response body');
      return {
        data: {} as T,
        success: response.ok,
        error: response.ok ? undefined : 'Empty response from server',
        status: statusCode
      };
    }
    
    // Try to parse the response as JSON if it's not empty
    try {
      jsonData = JSON.parse(responseText);
    } catch (e) {
      console.error('[API_CLIENT] Error parsing JSON response:', e);
      return {
        data: {} as T,
        error: 'Invalid response from server',
        success: false,
        status: statusCode
      };
    }
    
    if (!response.ok) {
      console.error(`[API_CLIENT] HTTP error ${statusCode}:`, jsonData);
      return {
        data: {} as T,
        error: jsonData?.message || jsonData?.error || `HTTP error ${statusCode}`,
        success: false,
        status: statusCode
      };
    }
    
    console.log('[API_CLIENT] Successfully processed response');
    return {
      data: jsonData?.data !== undefined ? jsonData.data : jsonData,
      success: true,
      status: statusCode
    };
  } catch (e) {
    console.error('[API_CLIENT] Error handling response:', e);
    return {
      data: {} as T,
      error: e instanceof Error ? e.message : 'An unknown error occurred',
      success: false,
      status: statusCode || 500 // Use the status code or default to 500 for unexpected errors
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
      console.log(`[API_CLIENT] GET request to: ${endpoint}`, params);
      
      // Clean up the endpoint by removing any leading/trailing slashes
      const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
      
      // Check if the endpoint is already a full URL
      let url: URL;
      try {
        // If it's a valid URL, use it as is
        url = new URL(cleanEndpoint);
      } catch (e) {
        // If not a valid URL, treat it as a relative path
        url = new URL(`${API_BASE_URL}/${cleanEndpoint}`);
      }
      
      // Add query parameters if provided
      if (params) {
        console.log('[API_CLIENT] Adding query params:', params);
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      console.log(`[API_CLIENT] Final URL: ${url.toString()}`);
      
      const headers = await createHeaders();
      const init: RequestInit = {
        method: 'GET',
        headers,
        credentials: 'include',
      };

      const response = await fetch(url.toString(), init);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] Error in GET request:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Network error',
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
      console.log(`[API_CLIENT] POST request to: ${endpoint}`, data);
      
      // Clean up the endpoint by removing any leading/trailing slashes
      const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
      
      // Check if the endpoint is already a full URL
      let url: URL;
      try {
        // If it's a valid URL, use it as is
        url = new URL(cleanEndpoint);
      } catch (e) {
        // If not a valid URL, treat it as a relative path
        url = new URL(`${API_BASE_URL}/${cleanEndpoint}`);
      }
      
      console.log(`[API_CLIENT] Final URL: ${url.toString()}`);
      
      const headers = await createHeaders();
      const init: RequestInit = {
        method: 'POST',
        headers,
        credentials: 'include',
      };

      // Only add body if data is provided
      if (data !== undefined) {
        init.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), init);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] Error in POST request:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Network error',
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
      console.log(`[API_CLIENT] PUT request to: ${endpoint}`, data);
      
      // Clean up the endpoint by removing any leading/trailing slashes
      const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
      
      // Check if the endpoint is already a full URL
      let url: URL;
      try {
        // If it's a valid URL, use it as is
        url = new URL(cleanEndpoint);
      } catch (e) {
        // If not a valid URL, treat it as a relative path
        url = new URL(`${API_BASE_URL}/${cleanEndpoint}`);
      }
      
      console.log(`[API_CLIENT] Final URL: ${url.toString()}`);
      
      const headers = await createHeaders();
      const init: RequestInit = {
        method: 'PUT',
        headers,
        credentials: 'include',
      };

      // Only add body if data is provided
      if (data !== undefined) {
        init.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), init);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] Error in PUT request:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Network error',
        success: false
      };
    }
  },
  
  /**
   * Perform a DELETE request to the API
   * @param endpoint - API endpoint to call (without base URL)
   */
  delete: async <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      console.log(`[API_CLIENT] DELETE request to: ${endpoint}`, data);
      
      // Clean up the endpoint by removing any leading/trailing slashes
      const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
      
      // Check if the endpoint is already a full URL
      let url: URL;
      try {
        // If it's a valid URL, use it as is
        url = new URL(cleanEndpoint);
      } catch (e) {
        // If not a valid URL, treat it as a relative path
        url = new URL(`${API_BASE_URL}/${cleanEndpoint}`);
      }
      
      console.log(`[API_CLIENT] Final URL: ${url.toString()}`);
      
      const headers = await createHeaders();
      const init: RequestInit = {
        method: 'DELETE',
        headers,
        credentials: 'include',
      };

      // Only add body if data is provided
      if (data !== undefined) {
        init.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), init);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] Error in DELETE request:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Network error',
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
      console.log(`[API_CLIENT] PATCH request to: ${endpoint}`, data);
      
      // Clean up the endpoint by removing any leading/trailing slashes
      const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
      
      // Check if the endpoint is already a full URL
      let url: URL;
      try {
        // If it's a valid URL, use it as is
        url = new URL(cleanEndpoint);
      } catch (e) {
        // If not a valid URL, treat it as a relative path
        url = new URL(`${API_BASE_URL}/${cleanEndpoint}`);
      }
      
      console.log(`[API_CLIENT] Final URL: ${url.toString()}`);
      
      const headers = await createHeaders();
      const init: RequestInit = {
        method: 'PATCH',
        headers,
        credentials: 'include',
      };

      // Only add body if data is provided
      if (data !== undefined) {
        init.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), init);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('[API_CLIENT] Error in PATCH request:', error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Network error',
        success: false
      };
    }
  }
};

export default apiClient;
