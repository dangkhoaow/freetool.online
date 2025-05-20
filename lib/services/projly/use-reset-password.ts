/**
 * Reset Password Hook
 * 
 * This hook provides functionality for the password reset flow.
 * It handles validating reset tokens and updating passwords.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import API_ENDPOINTS from '@/app/projly/config/apiConfig';
import { createFetchOptions } from '@/app/projly/config/apiConfig';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: {
    message: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

/**
 * Hook for handling password reset functionality
 * @returns Object containing resetPassword function, loading state, and result data
 */
export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:RESET_PASSWORD] ${message}`, data);
    } else {
      console.log(`[PROJLY:RESET_PASSWORD] ${message}`);
    }
  };

  // Mutation for reset password request
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      log(`Processing password reset with token`);
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
          ...createFetchOptions('POST', { token, password }),
        });

        const data: ResetPasswordResponse = await response.json();
        log('Reset password response:', data);

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Failed to reset password');
        }

        return data;
      } catch (err: any) {
        log('Reset password error:', err);
        throw new Error(err.message || 'Failed to reset password');
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      log('Password reset successful');
      setSuccess(data.message || "Your password has been reset successfully. You can now log in with your new password.");
    },
    onError: (error: Error) => {
      log('Password reset failed:', error);
      setError(error.message || 'Failed to reset password');
    }
  });

  /**
   * Reset a user's password using a token
   * @param token - Reset token from email
   * @param password - New password
   * @returns Promise resolving to the result
   */
  const resetPassword = async (token: string, password: string) => {
    log(`Initiating password reset with token`);
    return resetPasswordMutation.mutateAsync({ token, password });
  };

  return {
    resetPassword,
    isLoading,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(null);
    }
  };
}

export default useResetPassword;
