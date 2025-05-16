'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

/**
 * React Query provider component for Projly
 * Creates and manages a QueryClient instance for the application
 */
export function ProjlyQueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each client session
  // This ensures proper data isolation between users
  const [queryClient] = useState(() => {
    // Log initialization
    console.log('[PROJLY:QUERY_PROVIDER] Initializing QueryClient');
    
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  // Log when the provider renders
  console.log('[PROJLY:QUERY_PROVIDER] Rendering QueryClientProvider');

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
