'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Create context for production state
const ProductionContext = createContext<boolean>(false);

// Custom hook to use production state
export const useIsProduction = () => useContext(ProductionContext);

// Provider component that detects if running in production domain
export function ProductionProvider({ children }: { children: ReactNode }) {
  // Start with a safe default - only use env variable for initial state
  // We can't access document/window in the initial state because it runs during SSR
  const [isProduction, setIsProduction] = useState<boolean>(
    process.env.NODE_ENV === 'production'
  );

  useEffect(() => {
    // This runs only in the browser after hydration
    const checkProductionState = () => {
      // Check for cookie
      const hasCookie = document.cookie.includes('isProduction=true');
      
      // Check domain
      const hostname = window.location.hostname;
      const isProductionDomain = 
        hostname === 'freetool.online' || 
        hostname === 'www.freetool.online' ||
        hostname.endsWith('.github.io');
      
      if (hasCookie || isProductionDomain) {
        // If on production domain, set cookie for future reference
        if (isProductionDomain) {
          document.cookie = "isProduction=true; path=/; secure; samesite=strict";
        }
        
        setIsProduction(true);
      }
    };

    checkProductionState();
  }, []);

  return (
    <ProductionContext.Provider value={isProduction}>
      {children}
    </ProductionContext.Provider>
  );
} 