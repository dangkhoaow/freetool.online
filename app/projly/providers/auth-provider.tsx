'use client';

import { ReactNode } from 'react';
import { AuthProvider as CustomAuthProvider } from '../contexts/AuthContextCustom';

/**
 * Auth provider component for Projly
 * Wraps all components that require authentication
 */
export function ProjlyAuthProvider({ children }: { children: ReactNode }) {
  // Log initialization
  console.log('[PROJLY:AUTH_PROVIDER] Initializing AuthProvider');
  
  return (
    <CustomAuthProvider>
      {children}
    </CustomAuthProvider>
  );
}
