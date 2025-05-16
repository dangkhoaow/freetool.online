// Custom JWT authentication types to replace NextAuth types

// Session type for JWT authentication
export interface JWTSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  expires?: string;
}

// User type for JWT authentication
export interface JWTUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
}

// JWT token type
export interface JWTToken {
  id: string;
  email: string;
  role?: string;
  exp?: number; // Expiration time
  iat?: number; // Issued at time
}

// Custom auth service response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
  error?: any;
  redirectUrl?: string; // Added for logout redirection
}

// User registration data type
export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Add detailed logging for type usage
console.log("[AUTH TYPES] Custom auth types loaded at", new Date().toISOString());
