/**
 * Forgot Password Hook
 * 
 * This hook provides functionality for the forgot password flow.
 * It handles sending password reset requests to the backend API.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import API_ENDPOINTS from '@/app/projly/config/apiConfig';
import { createFetchOptions } from '@/app/projly/config/apiConfig';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: {
    message: string;
  };
}

/**
 * Hook for handling forgot password functionality
 * @returns Object containing forgotPassword function, loading state, and result data
 */
export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:FORGOT_PASSWORD] ${message}`, data);
    } else {
      console.log(`[PROJLY:FORGOT_PASSWORD] ${message}`);
    }
  };

  // Mutation for forgot password request
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      log(`Sending forgot password request for email: ${email}`);
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
          ...createFetchOptions('POST', { email }),
        });

        const data: ForgotPasswordResponse = await response.json();
        log('Forgot password response:', data);

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Failed to process request');
        }

        return data;
      } catch (err: any) {
        log('Forgot password error:', err);
        throw new Error(err.message || 'Failed to process forgot password request');
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      log('Forgot password request successful');
      setSuccess(data.message || "If an account exists with this email, we've sent password reset instructions.");
    },
    onError: (error: Error) => {
      log('Forgot password request failed:', error);
      setError(error.message || 'Failed to process forgot password request');
    }
  });

  /**
   * Send a forgot password request
   * @param email - Email address to send reset instructions to
   * @returns Promise resolving to the result
   */
  const forgotPassword = async (email: string) => {
    log(`Initiating forgot password flow for: ${email}`);
    return forgotPasswordMutation.mutateAsync(email);
  };

  return {
    forgotPassword,
    isLoading,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(null);
    }
  };
}

export default useForgotPassword;
