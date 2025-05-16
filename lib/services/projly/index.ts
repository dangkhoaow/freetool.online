/**
 * Projly Services Index
 * 
 * This file exports all Projly services to be consumed by the frontend components.
 * It centralizes service exports and implements services that don't have their own files.
 */

// Using absolute imports to resolve path issues
import { API_ENDPOINTS } from '@/app/projly/config/apiConfig';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/app/projly/utils/auth-utils';
import { signIn, signOut, useSession, getSession } from './jwt-auth-adapter';

// Export hooks
export * from './use-analytics';
export * from './use-members';
export * from './use-notifications';
export * from './use-pages';
export * from './use-pages-api';
export * from './use-profile';
export * from './use-project-ownership';
export * from './use-project-permissions';
export * from './use-projects';
export * from './use-resources';
export * from './use-search';
export * from './use-storage';
export * from './use-tasks';
export * from './use-team';
export * from './use-toast';
export * from './use-user-extended';
export * from './use-user-roles';

// Re-export JWT auth adapter
export { useSession, getSession, signIn, signOut };

/**
 * Authentication Service
 * Provides authentication operations for the Projly application
 */
export const projlyAuthService = {
  /**
   * Check if the user is authenticated
   * @returns Promise resolving to boolean indicating authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    console.log('[PROJLY:AUTH] Checking authentication status');
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:AUTH] No token found, user is not authenticated');
        return false;
      }

      // Validate token by making a call to the backend
      console.debug('[PROJLY:AUTH] Using profile endpoint:', API_ENDPOINTS.AUTH.ME);
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const isAuthenticated = response.ok;
      console.log(`[PROJLY:AUTH] Authentication check result: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      return isAuthenticated;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error checking authentication:', error);
      return false;
    }
  },

  /**
   * Sign in a user
   * @param credentials User credentials (email and password)
   * @returns Promise resolving to authentication result
   */
  async signIn(credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Attempting sign in for user:', credentials.email);
    try {
      console.log('[PROJLY:AUTH] Using login endpoint:', API_ENDPOINTS.AUTH.LOGIN);
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Sign in failed:', data.error || response.statusText);
        return {
          success: false,
          error: data.error?.message || data.message || 'Authentication failed'
        };
      }

      if (data.token) {
        setAuthToken(data.token);
        console.log('[PROJLY:AUTH] Token stored successfully after login');
      }

      console.log('[PROJLY:AUTH] Sign in successful');
      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in'
      };
    }
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise resolving to registration result
   */
  async register(userData: any): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Attempting to register new user:', userData.email);
    try {
      console.log('[PROJLY:AUTH] Using register endpoint:', API_ENDPOINTS.AUTH.REGISTER);
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Registration failed:', data.error || response.statusText);
        return {
          success: false,
          error: data.error?.message || data.message || 'Registration failed'
        };
      }

      if (data.token) {
        setAuthToken(data.token);
        console.log('[PROJLY:AUTH] Token stored successfully after registration');
      }

      console.log('[PROJLY:AUTH] Registration successful');
      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register'
      };
    }
  },

  /**
   * Sign out the current user
   * @returns Promise resolving to sign out result
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Signing out user');
    try {
      // Call the logout endpoint
      console.log('[PROJLY:AUTH] Using logout endpoint:', API_ENDPOINTS.AUTH.LOGOUT);
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }).catch(err => {
        console.warn('[PROJLY:AUTH] Error calling logout endpoint:', err);
        // Continue with client-side logout even if server call fails
      });

      // Clear token regardless of server response
      clearAuthToken();
      console.log('[PROJLY:AUTH] Sign out completed, token cleared');
      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Sign out error:', error);
      // Still clear the token on error
      clearAuthToken();
      return { success: true }; // Return success anyway since we've cleared the token
    }
  },

  /**
   * Refresh the authentication session
   * @returns Promise resolving to refresh result
   */
  async refreshSession(): Promise<{ success: boolean; error?: string }> {
    console.log('[PROJLY:AUTH] Refreshing authentication session');
    try {
      console.log('[PROJLY:AUTH] Using refresh endpoint:', API_ENDPOINTS.AUTH.REFRESH);
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Session refresh failed:', data.error || response.statusText);
        return {
          success: false,
          error: data.error?.message || data.message || 'Session refresh failed'
        };
      }

      if (data.token) {
        setAuthToken(data.token);
        console.log('[PROJLY:AUTH] Token refreshed successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('[PROJLY:AUTH] Session refresh error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh session'
      };
    }
  },

  /**
   * Get the current user data
   * @returns Promise resolving to user data
   */
  async getCurrentUser(): Promise<any> {
    console.log('[PROJLY:AUTH] Getting current user data');
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('[PROJLY:AUTH] No token found when getting current user');
        return null;
      }

      console.log('[PROJLY:AUTH] Using profile endpoint:', API_ENDPOINTS.AUTH.PROFILE);
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('[PROJLY:AUTH] Failed to get current user:', response.statusText);
        return null;
      }

      const userData = await response.json();
      console.log('[PROJLY:AUTH] Current user data retrieved successfully');
      return userData.data;
    } catch (error) {
      console.error('[PROJLY:AUTH] Error getting current user:', error);
      return null;
    }
  }
};

// Log initialization
console.log('[PROJLY:SERVICES] Services initialized and exported');
