"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContractManagementPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated for contract management
    const checkAuth = () => {
      const token = localStorage.getItem('contractManagementToken');
      
      if (token) {
        // User is authenticated, redirect to dashboard
        router.push('/contract-management/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.push('/contract-management/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
} 