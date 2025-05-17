/**
 * Common types for Projly services
 * 
 * This file contains shared types and interfaces for the Projly module
 * to avoid circular dependencies and provide type consistency.
 */

import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

// Log initialization for debugging
console.log('[TYPES] Loading Projly service types');

// User role types
export type AppRole = 'admin' | 'user' | 'guest' | 'editor' | 'viewer' | 'manager' | 'site_owner' | 'regular_user';
export type UserRole = AppRole;

// API Response Types

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | string | null;
  message?: string;
  status?: number;
  statusCode?: number;
  success?: boolean;
}

export interface ApiClientResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  message?: string;
  status?: number;
}

export interface ApiClient {
  get<T = any>(url: string): Promise<ApiClientResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiClientResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiClientResponse<T>>;
  delete<T = any>(url: string): Promise<ApiClientResponse<T>>;
}

// User and Role Types

export interface UserWithSettings {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  activationStatus: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  };
  firstName?: string;
  lastName?: string;
  name?: string;
  image?: string;
  emailVerified?: Date | null;
  settings?: Record<string, any>;
}

export interface UserRoleUpdateParams {
  userId: string;
  role: UserRole;
}

export interface ActivationStatusUpdateParams {
  userId: string;
  isActive: boolean;
  status?: string; // For backward compatibility
}

export interface PasswordResetParams {
  userId: string;
  newPassword: string;
  password?: string; // For backward compatibility
}

// Hook Return Types

export interface UseUserRolesReturn {
  users: UseQueryResult<UserWithSettings[], Error>;
  currentUserRole: UseQueryResult<UserRole, Error>;
  updateUserRole: UseMutationResult<ApiResponse<{ message?: string }>, Error, UserRoleUpdateParams>;
  updateActivationStatus: UseMutationResult<ApiResponse<{ message?: string }>, Error, ActivationStatusUpdateParams>;
  resetPassword: UseMutationResult<ApiResponse<any>, Error, PasswordResetParams>;
  hasRole: (role: UserRole) => Promise<boolean>;
}

// Error Handling

export interface ErrorWithMessage {
  message: string;
  status?: number | string;
  code?: string | number;
}

export function isErrorWithMessage(error: any): error is ErrorWithMessage {
  return (
    typeof error === 'object' && 
    error !== null && 
    'message' in error && 
    typeof error.message === 'string'
  );
}

// Resource Types
export interface Resource {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  filePath?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  quantity?: number | null;  // Made optional to match backend schema
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    teamId: string | null;
  };
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}
console.log('[TYPES] Updated Resource interface to make "quantity" optional (number | null) for backend consistency');

// Project and Task Types (kept for backward compatibility)

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
