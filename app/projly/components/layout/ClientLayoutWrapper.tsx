'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProjlyQueryProvider } from "../../providers/query-provider";
import { ProjlyAuthProvider } from "../../providers/auth-provider";

// Client component wrapper for the layout
export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:LAYOUT] ${message}`, data);
    } else {
      console.log(`[PROJLY:LAYOUT] ${message}`);
    }
  };

  useEffect(() => {
    log('Layout mounted, pathname:', pathname);
    setIsClient(true);
  }, [pathname]);

  // Ensure we're rendering on the client-side
  if (!isClient) {
    return null;
  }

  // Check if the current page is login or register to apply different styling
  const isAuthPage = pathname === '/projly/login' || 
                     pathname === '/projly/register' || 
                     pathname === '/projly/forgot-password';

  log('Rendering layout with auth page status:', isAuthPage);
  
  return (
    <ProjlyQueryProvider>
      <ProjlyAuthProvider>
        {children}
      </ProjlyAuthProvider>
    </ProjlyQueryProvider>
  );
}
