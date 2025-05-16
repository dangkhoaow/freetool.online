'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { projlyAuthService } from "@/lib/services/projly";

export default function ProjlyRootPage() {
  const router = useRouter();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:ROOT] ${message}`, data);
    } else {
      console.log(`[PROJLY:ROOT] ${message}`);
    }
  };
  
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        log('Checking authentication status');
        const isAuthenticated = await projlyAuthService.isAuthenticated();
        
        if (isAuthenticated) {
          log('User is authenticated, redirecting to dashboard');
          router.push('/projly/dashboard');
        } else {
          log('User is not authenticated, redirecting to login');
          router.push('/projly/login');
        }
      } catch (error) {
        console.error('[PROJLY:ROOT] Error checking authentication:', error);
        // Default to login page on error
        router.push('/projly/login');
      }
    };
    
    checkAuthAndRedirect();
  }, [router]);
  
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-semibold mb-2">Loading Projly</h1>
        <p className="text-muted-foreground">Please wait while we prepare your workspace...</p>
      </div>
    </div>
  );
}
