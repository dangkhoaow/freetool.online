import jwt from 'jsonwebtoken';

// JWT secret - ideally this would be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'freetool-admin-secret-key-dev-only';
const JWT_EXPIRY = '24h'; // Token expires in 24 hours

/**
 * Generate a JWT token
 * @param payload Data to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify a JWT token
 * @param token Token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Decode a JWT token without verifying
 * @param token Token to decode
 * @returns Decoded token payload or null if invalid format
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Check if the provided token belongs to an admin user
 * @param token JWT token to verify
 * @returns Boolean indicating if the token belongs to an admin
 */
export async function isAdmin(token?: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return false;
    }
    
    // Check if the token's payload contains the 'role' field with value 'admin'
    return decoded.role === 'admin';
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}
