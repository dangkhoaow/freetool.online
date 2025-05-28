/**
 * Auth Utilities for Projly
 * Provides centralized authentication utilities used across the application
 */

/**
 * Gets the auth token from cookies or localStorage
 * This function is used by both jwt-auth-adapter and api-client
 */
export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null; // Not in browser environment
  
  try {
    // First check the primary token location
    const token = localStorage.getItem('projly_token');
    if (token) {
      console.log('[PROJLY:AUTH] Token found in localStorage');
      return token;
    }
    
    // Try to get token from cookies as backup
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('projly_token='));
    
    if (tokenCookie) {
      const parts = tokenCookie.split('=');
      if (parts.length > 1) {
        console.log('[PROJLY:AUTH] Token found in cookies');
        const cookieToken = parts[1];
        // Store in localStorage for future use
        localStorage.setItem('projly_token', cookieToken);
        return cookieToken;
      }
    }
    
    // Legacy token location (compatibility with existing code)
    const legacyToken = localStorage.getItem('token');
    if (legacyToken) {
      console.log('[PROJLY:AUTH] Token found in legacy location');
      // Migrate to new location
      localStorage.setItem('projly_token', legacyToken);
      return legacyToken;
    }
  } catch (e) {
    console.error('[PROJLY:AUTH] Error accessing localStorage or cookies:', e);
  }
  
  console.log('[PROJLY:AUTH] No auth token found');
  return null;
};

/**
 * Sets the auth token in both cookies and localStorage
 */
export const setAuthToken = (token: string): void => {
  if (typeof document === 'undefined') return; // Not in browser environment
  
  try {
    if (!token) {
      console.error('[PROJLY:AUTH] Attempted to store empty token');
      return;
    }
    
    // Store in localStorage as primary location
    localStorage.setItem('projly_token', token);
    
    // Also set in cookie as backup (for server-side requests)
    // Determine if we're in production by checking the hostname
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    console.log('[PROJLY:AUTH] Environment detected:', isProduction ? 'production' : 'development');
    
    // Set cookie with appropriate attributes for the environment
    if (isProduction) {
      // In production, use SameSite=None and Secure for cross-domain cookies
      document.cookie = `projly_token=${token}; path=/; max-age=86400; SameSite=None; Secure; Domain=.freetool.online`;
      console.log('[PROJLY:AUTH] Set production cookie with cross-domain attributes');
    } else {
      // In development, use standard cookie settings
      document.cookie = `projly_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      console.log('[PROJLY:AUTH] Set development cookie');
    }
    
    // Remove any mock tokens
    const mockTokenPattern = 'mock-token';
    if (token.includes(mockTokenPattern)) {
      console.warn('[PROJLY:AUTH] Detected mock token, removing it');
      localStorage.removeItem('projly_token');
      document.cookie = 'projly_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      return;
    }
    
    console.log('[PROJLY:AUTH] Token stored successfully');
  } catch (e) {
    console.error('[PROJLY:AUTH] Error storing token:', e);
  }
};

/**
 * Clears the auth token from both cookies and localStorage
 */
export const clearAuthToken = (): void => {
  if (typeof document === 'undefined') return; // Not in browser environment
  
  try {
    // Clear from cookies
    // Determine if we're in production by checking the hostname
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      // In production, clear with cross-domain attributes
      document.cookie = 'projly_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure; Domain=.freetool.online';
      console.log('[PROJLY:AUTH] Cleared production cookie with cross-domain attributes');
    } else {
      // In development, use standard cookie clearing
      document.cookie = 'projly_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      console.log('[PROJLY:AUTH] Cleared development cookie');
    }
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'; // For backward compatibility
    
    // Clear from localStorage
    localStorage.removeItem('projly_token');
    localStorage.removeItem('token');
    
    console.log('[PROJLY:AUTH] Token cleared successfully');
  } catch (e) {
    console.error('[PROJLY:AUTH] Error clearing token:', e);
  }
};

/**
 * Creates fetch options for API requests with authentication
 */
export const createAuthFetchOptions = (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: any
): RequestInit => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return options;
};
