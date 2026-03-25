/**
 * Contract Management Service Configuration
 * Centralized configuration for all contract management services
 */
import { navigateToRoute } from '@/src/router/hash-path';
import { resolveFrontendApiBaseUrl } from '@/src/runtime-env';

// Resolve the API base URL once so browser code never falls back to localhost on Pages.
export const API_BASE_URL = resolveFrontendApiBaseUrl(true);

// Contract Management API endpoints
export const CONTRACT_MANAGEMENT_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/contract-management/auth/login',
    LOGOUT: '/api/contract-management/auth/logout', 
    REGISTER: '/api/contract-management/auth/register',
    VERIFY_EMAIL: '/api/contract-management/auth/verify-email',
    RESEND_VERIFICATION: '/api/contract-management/auth/resend-verification',
  },
  
  // Contract endpoints
  CONTRACTS: {
    BASE: '/api/contract-management/contracts',
    BY_ID: (id: string) => `/api/contract-management/contracts/${id}`,
    COMPANIES: '/api/contract-management/companies',
  },
  
  // Storage endpoints
  STORAGE: {
    UNITS: '/api/contract-management/storage-units',
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    STATS: '/api/contract-management/dashboard',
  },
  
  // File endpoints
  FILES: {
    UPLOAD: '/api/contract-management/files/upload',
    DOWNLOAD: (id: string) => `/api/contract-management/files/${id}/download`,
  },
  
  // Export endpoints  
  EXPORT: {
    CONTRACTS: '/api/contract-management/exports',
    STATUS: (jobId: string) => `/api/contract-management/exports/${jobId}/status`,
  }
} as const;

/**
 * Build full URL for API endpoint
 */
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Default headers for API requests
 */
export const getDefaultHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Handle authentication errors by redirecting to login
 */
export const handleAuthError = (response: Response): void => {
  if (response.status === 401) {
    // Clear any stored authentication tokens
    localStorage.removeItem('contractManagementToken');
    
    // Redirect to login page
    navigateToRoute('/contract-management/login', false);
  }
};

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers = getDefaultHeaders();
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Export configuration object
export const CONTRACT_MANAGEMENT_CONFIG = {
  API_BASE_URL,
  ENDPOINTS: CONTRACT_MANAGEMENT_ENDPOINTS,
  buildApiUrl,
  getDefaultHeaders,
  getAuthHeaders,
} as const;
