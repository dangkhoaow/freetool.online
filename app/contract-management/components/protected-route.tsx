"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { contractManagementAuthService, User } from '@/lib/services/contract-management';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  fallbackTo = '/contract-management/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = contractManagementAuthService.isAuthenticated();
        const currentUser = contractManagementAuthService.getCurrentUser();

        if (!authenticated || !currentUser) {
          setIsAuthenticated(false);
          router.push(fallbackTo);
          return;
        }

        // Check required permissions
        if (requiredPermissions.length > 0) {
          const hasAllPermissions = requiredPermissions.every(permission =>
            contractManagementAuthService.hasPermission(permission as any)
          );

          if (!hasAllPermissions) {
            setIsAuthenticated(false);
            router.push('/contract-management/unauthorized');
            return;
          }
        }

        setUser(currentUser);
        setIsAuthenticated(true);

      } catch (error) {
        console.error('[ProtectedRoute] Auth check error:', error);
        setIsAuthenticated(false);
        router.push(fallbackTo);
      }
    };

    checkAuth();
  }, [router, fallbackTo, requiredPermissions]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Render children with user context
  return <>{children}</>;
}

// Hook to access current user in protected components
export function useContractManagementAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = contractManagementAuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const logout = async () => {
    try {
      await contractManagementAuthService.logout();
      setUser(null);
      window.location.href = '/contract-management/login';
    } catch (error) {
      console.error('[useContractManagementAuth] Logout error:', error);
    }
  };

  const hasPermission = (permission: string) => {
    return contractManagementAuthService.hasPermission(permission as any);
  };

  const hasRole = (role: string) => {
    return contractManagementAuthService.hasRole(role as any);
  };

  return {
    user,
    isLoading,
    logout,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };
} 