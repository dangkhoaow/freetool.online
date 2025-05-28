/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Modified to support both development and production environments
 */

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get the base URL for API calls
function getBaseUrl(): string {
  // First, try to use the environment variable in all environments
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.debug('[API CONFIG] Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (isBrowser) {
    // In browser environment without env var, use the current window location for local dev
    const hostname = window.location.hostname;
    
    // For local development, use the hardcoded port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.debug('[API CONFIG] Using localhost:3001 for development');
      return 'http://localhost:3001';
    }
    
    // For production without env var (should not happen), log a warning
    console.warn('[API CONFIG] NEXT_PUBLIC_API_URL not set in production environment!');
    console.warn('[API CONFIG] Falling back to service.freetool.online');
    return 'https://service.freetool.online';
  }
  
  // Fallback for SSR or non-browser environments
  console.debug('[API CONFIG] Using fallback URL: http://localhost:3001');
  return 'http://localhost:3001';
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
  // Profiles endpoints
  PROFILES: `${API_BASE_URL}/profiles`,
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
  // User Status endpoints
  USER_STATUS: `${API_BASE_URL}/user-status`,
  // Teams endpoints
  TEAMS: {
    BASE: `${API_BASE_URL}/teams`,
    DETAIL: (id: string) => `${API_BASE_URL}/teams/${id}`,
    MEMBERS: (id: string) => `${API_BASE_URL}/teams/${id}/members`,
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
  } else {
    console.debug(`[API CONFIG] ${group}:`, endpoints);
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
