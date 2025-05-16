import { JWTToken, JWTUser, RegistrationData } from "./types";

// Detect if we're running on server or client
const isServer = typeof window === 'undefined';

// Only import server-side dependencies when running on the server
// This prevents browser compatibility issues
let bcrypt: any;
let jwt: any;
let serverPrisma: any;

// Conditionally import server-side only modules
if (isServer) {
  // Dynamic imports to prevent browser issues
  const { PrismaClient } = require("@prisma/client");
  bcrypt = require("bcrypt");
  jwt = require("jsonwebtoken");
  serverPrisma = new PrismaClient();
  console.log('[AUTH] Server-side auth module initialized with Node.js dependencies');
} else {
  // Mock implementations for client-side
  bcrypt = {
    hash: () => Promise.resolve('browser-mock-hash'),
    compare: () => Promise.resolve(true)
  };
  jwt = {
    sign: () => 'browser-mock-token',
    verify: (token: string, secret: string, callback: any) => callback(null, { id: 'mock-id', email: 'mock@example.com' })
  };
  console.warn('[AUTH] Client-side auth module initialized with mock implementations.');
}

// Define credential types for authentication
interface Credentials {
  email: string;
  password: string;
}

// Define JWT configuration options
type JWTOptions = {
  secret: string;
  expiresIn: string | number;
  cookieName: string;
  secure: boolean;
  httpOnly: boolean;
};

// Log initialization for debugging
console.log(`[AUTH] Initializing JWT auth module in ${isServer ? 'server' : 'browser'} environment`);

// JWT configuration
const jwtOptions: JWTOptions = {
  secret: process.env.JWT_SECRET || 'your-default-secret-key-should-be-replaced',
  expiresIn: '1d', // Token expires in 1 day
  cookieName: 'auth-token',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true
};

// Log every authentication attempt for debugging
function logAuthAttempt(action: string, email: string, success: boolean, details?: any) {
  console.log(`[AUTH] ${action} attempt for ${email}: ${success ? 'SUCCESS' : 'FAILED'}`, {
    timestamp: new Date().toISOString(),
    details
  });
}

/**
 * JWT Authentication Utilities
 */
export const jwtAuth = {
  /**
   * Generate a JWT token for a user
   */
  generateToken: (user: JWTUser): string => {
    console.log('[AUTH] Generating JWT token for user:', user.email);
    
    const payload: JWTToken = {
      id: user.id,
      email: user.email || '',
      role: user.role
    };
    
    return jwt.sign(payload, jwtOptions.secret, { expiresIn: jwtOptions.expiresIn });
  },
  
  /**
   * Verify and decode a JWT token
   */
  verifyToken: (token: string): Promise<JWTToken> => {
    console.log('[AUTH] Verifying JWT token');
    
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtOptions.secret, (err, decoded) => {
        if (err) {
          console.error('[AUTH] Token verification failed:', err.message);
          reject(err);
          return;
        }
        
        console.log('[AUTH] Token verified successfully');
        resolve(decoded as JWTToken);
      });
    });
  },
  
  /**
   * Authenticate a user with email and password
   */
  authenticate: async (credentials: Credentials) => {
    if (!credentials?.email || !credentials?.password) {
      logAuthAttempt("FAIL", credentials?.email || "unknown", false, "Missing credentials");
      return { success: false, message: "Missing credentials", user: null };
    }
        
    const email = credentials.email;
    const password = credentials.password;

    // Check if running in browser environment
    if (!isServer) {
      console.log('[AUTH] Client-side authentication mock response');
      return { 
        success: true, 
        message: "Browser mock authentication successful", 
        user: {
          id: 'mock-id',
          email: 'user@example.com',
          role: 'user',
          name: 'Browser User',
          firstName: 'Browser',
          lastName: 'User'
        },
        token: 'mock-jwt-token'
      };
    }

    try {
      // Find user by email - server-side only
      const user = await serverPrisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          userRole: true
        },
      });

      if (!user) {
        logAuthAttempt("FAIL", email, false, "User not found");
        return { success: false, message: "Invalid email or password", user: null };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logAuthAttempt("FAIL", email, false, "Invalid password");
        return { success: false, message: "Invalid email or password", user: null };
      }

      // Check if user is active
      if (user.status !== "active") {
        logAuthAttempt("FAIL", email, false, `User status: ${user.status}`);
        return { success: false, message: "Account is not active", user: null };
      }

      // Create user object
      const userObj: JWTUser = {
        id: user.id,
        email: user.email,
        role: user.userRole?.role || "user",
        name: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim(),
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
      };

      // Generate JWT token
      const token = jwtAuth.generateToken(userObj);
      
      logAuthAttempt("SUCCESS", email, true);
      return { 
        success: true, 
        message: "Authentication successful", 
        user: userObj, 
        token 
      };
    } catch (error) {
      console.error("[AUTH] Error during authentication:", error);
      logAuthAttempt("ERROR", email, false, error);
      return { 
        success: false, 
        message: "Authentication error", 
        user: null, 
        error 
      };
    }
  }
};

/**
 * Create a new user with profile
 */
export async function createUserWithProfile(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
) {
  console.log(`[AUTH] Creating new user profile for ${email}`);
  
  // Check if running in browser environment
  if (!isServer) {
    console.log('[AUTH] Client-side user creation mock response');
    return { 
      success: true, 
      message: "Browser mock user created successfully", 
      user: {
        id: 'mock-new-user-id',
        email,
        role: 'user',
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName
      },
      token: 'mock-jwt-token'
    };
  }
  
  try {
    // Check if user already exists - server-side only
    const existingUser = await serverPrisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.warn(`[AUTH] User already exists with email: ${email}`);
      return { 
        success: false, 
        message: "Email is already registered", 
        user: null 
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create transaction to ensure both user and profile are created
    const result = await serverPrisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          id: newUser.id,
          email,
          firstName,
          lastName,
        },
      });

      return { user: newUser, profile };
    });

    console.log(`[AUTH] Successfully created user and profile for ${email}`);
    
    // Create user object for token
    const userObj: JWTUser = {
      id: result.user.id,
      email: result.user.email,
      role: "user",
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName
    };
    
    // Generate JWT token for the new user
    const token = jwtAuth.generateToken(userObj);
    
    return { 
      success: true, 
      message: "User created successfully", 
      user: userObj,
      token
    };
  } catch (error) {
    console.error("[AUTH] Error creating user:", error);
    throw error;
  }
}
