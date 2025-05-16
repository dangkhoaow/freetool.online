import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, createFetchOptions } from '../config/apiConfig';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/auth-utils';

type User = { id: string; email: string; firstName: string; lastName: string; };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isEditMode?: boolean; // Optional for backward compatibility
  register: (data: { email: string; password: string; firstName: string; lastName: string; }) => Promise<void>;
  login: (data: { email: string; password: string; }) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>; // For backward compatibility
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      console.log('[AUTH_CONTEXT] Fetching current user from', API_ENDPOINTS.AUTH.ME);
      const res = await fetch(API_ENDPOINTS.AUTH.ME, { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json() as Promise<{ success: boolean; user: User }>;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; firstName: string; lastName: string; }) => {
      console.log('[AUTH_CONTEXT] Registering user at', API_ENDPOINTS.AUTH.REGISTER);
      const res = await fetch(
        API_ENDPOINTS.AUTH.REGISTER, 
        createFetchOptions('POST', payload)
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; }) => {
      console.log('[AUTH_CONTEXT] Logging in user at', API_ENDPOINTS.AUTH.LOGIN);
      const res = await fetch(
        API_ENDPOINTS.AUTH.LOGIN, 
        createFetchOptions('POST', payload)
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // If login successful and we have a token, store it properly
      if (data.token) {
        console.log('[AUTH_CONTEXT] Setting auth token from login response');
        setAuthToken(data.token);
      } else {
        console.warn('[AUTH_CONTEXT] No token received in login response');
      }
      
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('[AUTH_CONTEXT] Logging out user at', API_ENDPOINTS.AUTH.LOGOUT);
      
      try {
        // Call the API to invalidate the session on the server
        const res = await fetch(
          API_ENDPOINTS.AUTH.LOGOUT, 
          createFetchOptions('POST')
        );
        
        if (!res.ok) throw new Error('Logout failed');
        
        // Clear the authentication token using our centralized utility
        clearAuthToken();
        
        // Clear any local storage items related to authentication
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('authState');
        
        // Clear any session storage items related to authentication
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile');
        sessionStorage.removeItem('authState');
        
        console.log('[AUTH_CONTEXT] Logout successful, session cleared');
        
        // Redirect to login page
        window.location.href = '/login';
      } catch (error) {
        console.error('[AUTH_CONTEXT] Logout error:', error);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  });

  const signOut = useCallback(async () => {
    try {
      console.log('[AUTH_CONTEXT] Signing out user');
      const result = await logoutMutation.mutateAsync();
      
      // Clear auth tokens using our centralized utility
      clearAuthToken();
      
      // Clear other user data from storage
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('authState');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('profile');
      sessionStorage.removeItem('authState');
      
      console.log('[AUTH_CONTEXT] Client-side storage cleared');
      console.log('Successfully logged out');
      
      // Reset React Query cache
      queryClient.clear();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('[AUTH_CONTEXT] Logout error:', error);
    }
  }, [logoutMutation, queryClient]);

  // Check for edit mode based on URL or other parameters
  const isEditMode = typeof window !== 'undefined' ? 
    window.location.href.includes('edit') || 
    window.location.search.includes('editMode=true') : false;

  // For backward compatibility with existing code
  const refreshSession = async () => {
    console.log('[AUTH_CONTEXT] Refreshing session');
    return queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const authContextValue: AuthContextType = {
    user: data?.user ?? null,
    isLoading,
    isEditMode,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    signOut: logoutMutation.mutateAsync,
    refreshSession
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
