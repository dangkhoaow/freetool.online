/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Modified to support both development and production environments
 */

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get the current host/origin for production use
function getBaseUrl(): string {
  if (isBrowser) {
    // In browser environment, use the current window location
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // For local development, use the hardcoded port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // For production (EB), use the same host as the frontend, but with potential port difference
    // If frontend is on port 80/443, API might be on a different port
    const apiPort = process.env.API_PORT || '3001'; // Read from env if available
    
    // In production, API is typically on the same domain, just a different path or port
    // We'll use the same domain to avoid CORS issues
    return `${protocol}//${hostname}`;
  }
  
  // Fallback for SSR or non-browser environments
  return process.env.API_URL || 'http://localhost:3001';
}

// Server and API base URL configuration
export const SERVER_URL = getBaseUrl();
export const API_BASE_URL = `${SERVER_URL}/api/projly`;

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  // Projects endpoints
  PROJECTS: {
    BASE: `${API_BASE_URL}/projects`,
    DETAIL: (id: string) => `${API_BASE_URL}/projects/${id}`,
  },
  // Tasks endpoints
  TASKS: {
    ALL: `${API_BASE_URL}/tasks`,
    BY_ID: `${API_BASE_URL}/tasks/:id`,
    CREATE: `${API_BASE_URL}/tasks`,
    UPDATE: `${API_BASE_URL}/tasks/:id`,
    DELETE: `${API_BASE_URL}/tasks/:id`,
    DETAIL: (id: string) => `${API_BASE_URL}/tasks/${id}`,
  },
};

// Debug log all endpoints for verification
console.debug('[API CONFIG] API_BASE_URL:', API_BASE_URL);
Object.entries(API_ENDPOINTS).forEach(([group, endpoints]) => {
  if (typeof endpoints === 'object') {
    Object.entries(endpoints).forEach(([key, value]) => {
      if (typeof value === 'function') {
        console.debug(`[API CONFIG] ${group}.${key}:`, value('SAMPLE_ID'));
      } else {
        console.debug(`[API CONFIG] ${group}.${key}:`, value);
      }
    });
  }
});

/**
 * Helper function to create fetch options with appropriate headers
 */
export const createFetchOptions = (method: string = 'GET', body?: any): RequestInit => {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in the request
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
};

export default API_ENDPOINTS;
