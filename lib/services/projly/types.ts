/**
 * Common types for Projly services
 * 
 * This file contains shared types and interfaces for the Projly module
 * to avoid circular dependencies and provide type consistency.
 */

// Log initialization for debugging
console.log('[TYPES] Loading Projly service types');

// User role types
export type UserRole = 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'site_owner' | 'regular_user';
export type AppRole = 'admin' | 'manager' | 'editor' | 'user' | 'guest' | 'site_owner' | 'regular_user';

// Define interfaces for request parameters
export interface UserRoleUpdateParams {
  userId: string;
  role: UserRole;
}

export interface ActivationStatusUpdateParams {
  userId: string;
  status: string;
}

export interface PasswordResetParams {
  userId: string;
  password: string;
}

// Define interface for user settings
export interface UserWithSettings {
  id: string;
  userId: string;
  role: UserRole;
  activationStatus: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// Error interface with message property
export interface ErrorWithMessage {
  message: string;
  status?: number | string;
  code?: string | number;
}

// Type guard for checking if an error object has a message property
export function isErrorWithMessage(error: any): error is ErrorWithMessage {
  return (
    typeof error === 'object' && 
    error !== null && 
    'message' in error && 
    typeof error.message === 'string'
  );
}

// Helper to get error message safely
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Unknown error occurred';
}

// Helper to get error status safely
export function getErrorStatus(error: unknown): string | number | undefined {
  if (isErrorWithMessage(error) && error.status) {
    return error.status;
  }
  
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return String(error.status);
  }
  
  return undefined;
}

// Project and task types
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  slug?: string;
  teamId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  createdAt?: string;
  updatedAt?: string;
}
