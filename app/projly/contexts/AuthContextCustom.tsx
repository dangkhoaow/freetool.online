import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, createFetchOptions } from '../config/apiConfig';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/auth-utils';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isEditMode: boolean;
  register: (data: { email: string; password: string; firstName: string; lastName: string; }) => Promise<void>;
  login: (data: { email: string; password: string; }) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>; // For backward compatibility
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  // Add a local state to force updates and ensure re-renders
  const [userState, setUserState] = useState<User | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      console.log('[AUTH_CONTEXT] Fetching current user data');
      try {
        const response = await fetch('http://localhost:3001/api/projly/auth/me', { credentials: 'include' });
        console.log('[AUTH_CONTEXT] Raw response from auth/me:', response);
        
        if (response.ok) {
          const data = await response.json();
          // Map nested user data to flat structure if needed
          const userData = {
            ...data,
            ...(data.user ? {
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
            } : {}),
            id: data.userId || data.id,
          };
          console.log('[AUTH_CONTEXT] Returning mapped user data:', userData);
          return userData;
        } else {
          console.log('[AUTH_CONTEXT] No user data in response, returning null');
          return null;
        }
      } catch (err) {
        console.error('[AUTH_CONTEXT] Error fetching user data:', err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!getAuthToken(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Sync userState with the latest query data
  useEffect(() => {
    if (data) {
      console.log('[AUTH_CONTEXT] Syncing userState with query data:', data);
      setUserState(data as User);
    }
  }, [data]);

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
        
        // Redirect to login page with correct path
        window.location.replace('/projly/login');
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
      
      // Redirect to login page with correct path
      window.location.replace('/projly/login');
    } catch (error) {
      console.error('[AUTH_CONTEXT] Logout error:', error);
    }
  }, [logoutMutation, queryClient]);

  const refetchUser = useCallback(async () => {
    console.log('[AUTH_CONTEXT] Refetching user data');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    await queryClient.refetchQueries({ queryKey: ['me'] });
    console.log('[AUTH_CONTEXT] User data refetched');
  }, [queryClient]);

  // Update user state and trigger re-render
  const updateUser = async (updates: Partial<User>) => {
    console.log('[AUTH_CONTEXT] Updating user with data:', updates);
    setUserState(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      console.log('[AUTH_CONTEXT] Updated user state:', updatedUser);
      return updatedUser;
    });
    // Also update the query cache to maintain consistency
    queryClient.setQueryData(['me'], (oldData: User | null) => {
      if (!oldData) return oldData;
      const updatedData = { ...oldData, ...updates };
      console.log('[AUTH_CONTEXT] Updated query cache with new user data:', updatedData);
      return updatedData;
    });
    // Force a refetch to ensure data consistency with backend
    await refetch();
    console.log('[AUTH_CONTEXT] Refetched user data after update');
  };

  // For backward compatibility with existing code
  const refreshSession = async () => {
    console.log('[AUTH_CONTEXT] Refreshing session');
    await refetch();
    return queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  // Expose AuthContext instance globally for direct updates
  // This allows other parts of the app to directly update the context
  const authContextValue = {
    user: userState,
    isLoading,
    isEditMode,
    register: (data: { email: string; password: string; firstName: string; lastName: string; }) => registerMutation.mutateAsync(data),
    login: (data: { email: string; password: string; }) => loginMutation.mutateAsync(data),
    logout: () => logoutMutation.mutateAsync(),
    signOut,
    refreshSession,
    updateUser
  };
  
  // Store context instance globally for direct access
  (window as any).__AUTH_CONTEXT = authContextValue;
  console.log('[AUTH_CONTEXT] AuthContext instance stored globally');
  
  // Log when user state changes for debugging
  useEffect(() => {
    console.log('[AUTH_CONTEXT] User state updated in AuthProvider:', userState);
  }, [userState]);
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
