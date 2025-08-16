'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ContractHeader from './contract-header';
import { contractManagementAuthService } from '@/lib/services/contract-management';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Pages that should not show the header (auth pages)
  const authPages = [
    '/contract-management/login',
    '/contract-management/signup', 
    '/contract-management/forgot-password',
    '/contract-management/verify-email',
    '/contract-management/resend-verification'
  ];

  const isAuthPage = authPages.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = contractManagementAuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, isAuthPage]);

  // For login page, never show header regardless of auth status
  const shouldShowHeader = !isAuthPage && isAuthenticated && !isLoading;

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {shouldShowHeader && <ContractHeader />}
      <main className={shouldShowHeader ? "pt-14" : ""}>
        {children}
      </main>
    </div>
  );
}
