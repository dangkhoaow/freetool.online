/**
 * JWT Auth Adapter
 * This file provides compatibility functions to replace NextAuth in the codebase
 * and allows hooks to use our JWT authentication system directly.
 */

// Removed useAuth import to prevent circular dependency

// Simplified session type that mimics NextAuth session structure
export interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  expires?: string;
}

// Define credentials options types for compatibility
export interface CredentialsConfig {
  email: string;
  password: string;
  redirect?: boolean;
  callbackUrl?: string;
}

// Type for authentication responses
export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: any;
}

import { useContext } from 'react';
import API_ENDPOINTS from '@/app/projly/config/apiConfig';
// Use AuthContext from the standard location that's being used by other components
import { AuthContext, AuthProvider, useAuth } from '@/app/projly/contexts/AuthContextCustom';

/**
 * Enhanced useSession hook that mimics NextAuth functionality
 * This provides a drop-in replacement for NextAuth's useSession
 * 
 * NOTE: This implementation now directly uses the AuthContextCustom
 * to avoid circular dependencies. We import the context directly here
 * instead of using the useAuth hook.
 */
export function useSession() {
  // Access AuthContext via static import to avoid dynamic require issues
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    console.error('[JWT_AUTH_ADAPTER] AuthContext not found, make sure to use AuthProvider');
    return { data: null, status: 'unauthenticated', update: async () => null };
  }
  
  const { user, isLoading, refreshSession } = authContext;
  
  console.log('[JWT_AUTH_ADAPTER] useSession called', user ? `for user: ${user.email}` : 'no user');
  
  // Convert our JWT auth user to compatible session format
  const session: Session | null = user ? {
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName
    },
    // Using a fixed expiry time for compatibility
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  } : null;
  
  // Status based on our JWT auth loading state
  const status = isLoading 
    ? 'loading' 
    : user ? 'authenticated' : 'unauthenticated';
  
  return {
    data: session,
    status,
    update: async () => {
      console.log('[JWT_AUTH_ADAPTER] Updating session');
      await refreshSession();
      return session;
    }
  };
}

/**
 * Simplified getSession: reads from localStorage
 */
export async function getSession(): Promise<Session | null> {
  if (typeof window === 'undefined') return null;
  console.log('[JWT_AUTH_ADAPTER] getSession retrieving from localStorage');
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    const userData = JSON.parse(storedUser);
    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('[JWT_AUTH_ADAPTER] getSession error', error);
    return null;
  }
}

/**
 * Compatibility function for NextAuth signIn
 * @param provider - Authentication provider (only 'credentials' is supported)
 * @param options - Authentication options (email, password, etc.)
 */
export async function signIn(provider?: string, options?: CredentialsConfig) {
  console.log('[JWT_AUTH_ADAPTER] signIn called with:', provider);
  
  if (provider !== 'credentials' || !options) {
    console.error('[JWT_AUTH_ADAPTER] Only credentials provider is supported');
    return { ok: false, error: 'Only credentials provider is supported' };
  }
  
  try {
    const { email, password, redirect = false, callbackUrl } = options;
    
    // Client-side implementation - direct API call to avoid circular dependency
    if (typeof window !== 'undefined') {
      console.log('[JWT_AUTH_ADAPTER] Client-side login attempt');
      
      try {
        // Call the login API directly instead of using useAuth hook
        console.log('[JWT_AUTH_ADAPTER] Using login endpoint:', API_ENDPOINTS.AUTH.LOGIN);
        const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Login failed');
        }
        
        // Store user data in localStorage for future use
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        if (result.profile) {
          localStorage.setItem('profile', JSON.stringify(result.profile));
        }
        
        console.log('[JWT_AUTH_ADAPTER] Sign in successful');
        
        // Handle redirect if needed
        if (redirect && callbackUrl) {
          window.location.href = callbackUrl;
        }
        
        return { ok: true, error: null };
      } catch (error) {
        console.error('[JWT_AUTH_ADAPTER] Sign in error:', error);
        return { 
          ok: false, 
          error: error instanceof Error ? error.message : 'Unknown error during sign in'
        };
      }
    } else {
      // Server-side implementation would need to call the auth API directly
      console.warn('[JWT_AUTH_ADAPTER] Server-side signIn not fully implemented');
      return { ok: false, error: 'Server-side signIn not implemented' };
    }
  } catch (error) {
    console.error('[JWT_AUTH_ADAPTER] Sign in error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown authentication error'
    };
  }
}

/**
 * Compatibility function for NextAuth signOut
 * @param options - Sign out options
 */
export async function signOut(options?: { callbackUrl?: string; redirect?: boolean }) {
  console.log('[JWT_AUTH_ADAPTER] signOut called');
  
  try {
    // Client-side implementation
    if (typeof window !== 'undefined') {
      // Clear the authentication token from cookies
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      
      // Clear any local storage items related to authentication
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('authState');
      localStorage.removeItem('token');
      
      // Clear any session storage items related to authentication
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('profile');
      sessionStorage.removeItem('authState');
      sessionStorage.removeItem('token');
      
      // Call the API to invalidate the session on the server
      try {
        // Use the correct API endpoint from API_ENDPOINTS
        const logoutEndpoint = API_ENDPOINTS.AUTH.LOGOUT;
        
        console.log('[JWT_AUTH_ADAPTER] Using logout endpoint:', logoutEndpoint);
        const response = await fetch(logoutEndpoint, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('[JWT_AUTH_ADAPTER] Server logout response:', response.ok ? 'Success' : 'Failed');
      } catch (apiError) {
        console.error('[JWT_AUTH_ADAPTER] API logout error:', apiError);
        // Continue with client-side logout even if API call fails
      }
      
      // Invalidate any query cache if React Query is available
      try {
        // This is a safe way to access the query client without importing it directly
        const queryClientModule = (window as any)['__REACT_QUERY_GLOBAL__'];
        if (queryClientModule && queryClientModule.queryClient && typeof queryClientModule.queryClient.invalidateQueries === 'function') {
          queryClientModule.queryClient.invalidateQueries({ queryKey: ['me'] });
          console.log('[JWT_AUTH_ADAPTER] Invalidated query cache');
        }
      } catch (cacheError) {
        console.error('[JWT_AUTH_ADAPTER] Error invalidating query cache:', cacheError);
      }
      
      // Handle redirect
      const loginUrl = options?.callbackUrl || '/login';
      if (options?.redirect !== false) {
        console.log(`[JWT_AUTH_ADAPTER] Redirecting to ${loginUrl}`);
        window.location.href = loginUrl;
      }
      
      return { ok: true, error: null };
    } else {
      // Server-side implementation would need to call the auth API directly
      console.warn('[JWT_AUTH_ADAPTER] Server-side signOut not fully implemented');
      return { ok: false, error: 'Server-side signOut not implemented' };
    }
  } catch (error) {
    console.error('[JWT_AUTH_ADAPTER] Sign out error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error during sign out'
    };
  }
}
