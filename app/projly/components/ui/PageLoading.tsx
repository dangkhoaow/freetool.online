import React from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';

interface PageLoadingProps {
  // Set to true if this is not wrapped inside a DashboardLayout
  standalone?: boolean;
  // Custom size for the spinner (default: 10)
  size?: number;
  // Custom height for the container (default: 80vh)
  height?: string;
  // Log message to include when showing loading state
  logContext?: string;
}

/**
 * A reusable loading component that displays a centered spinner
 * Consistent with the dashboard loading style
 */
export function PageLoading({ 
  standalone = false, 
  size = 10, 
  height = '80vh',
  logContext = 'Loading'
}: PageLoadingProps) {
  // Log loading state for debugging
  React.useEffect(() => {
    console.log(`[${logContext}] Showing loading spinner with animation`);
  }, [logContext]);

  // Create styles directly without template literals for better compatibility
  const containerStyle = `flex justify-center items-center h-[${height}]`;
  const loaderStyle = `h-10 w-10 animate-spin text-primary`;
  
  const LoadingContent = (
    <div className={containerStyle}>
      <Loader2 
        className={loaderStyle} 
        aria-label="Loading content"
      />
    </div>
  );

  // If standalone, don't wrap in DashboardLayout
  if (standalone) {
    return LoadingContent;
  }

  // Otherwise, wrap in DashboardLayout
  return (
    <DashboardLayout>
      {LoadingContent}
    </DashboardLayout>
  );
}
