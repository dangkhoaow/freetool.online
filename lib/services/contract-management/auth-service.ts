import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  UserRole, 
  Permission,
  ApiResponse 
} from './types';
import { CONTRACT_MANAGEMENT_CONFIG } from './config';

// Mock users for development
const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@contractmanagement.local',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    permissions: [
      'contracts.create',
      'contracts.read',
      'contracts.update',
      'contracts.delete',
      'contracts.export',
      'storage.manage',
      'users.manage',
      'dashboard.view'
    ],
    lastLogin: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'manager-1',
    username: 'manager',
    email: 'manager@contractmanagement.local',
    firstName: 'Contract',
    lastName: 'Manager',
    role: 'manager',
    permissions: [
      'contracts.create',
      'contracts.read',
      'contracts.update',
      'contracts.export',
      'dashboard.view'
    ],
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: 'user-1',
    username: 'user',
    email: 'user@contractmanagement.local',
    firstName: 'Contract',
    lastName: 'User',
    role: 'user',
    permissions: [
      'contracts.read',
      'contracts.create',
      'dashboard.view'
    ],
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: 'viewer-1',
    username: 'viewer',
    email: 'viewer@contractmanagement.local',
    firstName: 'Contract',
    lastName: 'Viewer',
    role: 'viewer',
    permissions: [
      'contracts.read',
      'dashboard.view'
    ],
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];

// Mock passwords (in real implementation, these would be hashed)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin': 'admin123',
  'manager': 'manager123',
  'user': 'user123',
  'viewer': 'viewer123'
};

class ContractManagementAuthService {
  private static instance: ContractManagementAuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;

  private constructor() {
    // Try to restore authentication state from localStorage
    this.restoreAuthState();
  }

  public static getInstance(): ContractManagementAuthService {
    if (!ContractManagementAuthService.instance) {
      ContractManagementAuthService.instance = new ContractManagementAuthService();
    }
    return ContractManagementAuthService.instance;
  }

  /**
   * Authenticate user with username/email and password
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { username, password } = credentials;
      
      // Determine if input is email or username
      const isEmail = username.includes('@');
      const requestBody = {
        password,
        ...(isEmail ? { email: username } : { username })
      };

            const loginUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log('[ContractManagementAuth] Attempting login to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagementAuth] Login failed:', data);
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Authentication failed'
        };
      }

      // Store authentication state
      this.currentUser = data.user;
      this.authToken = data.token;
      this.saveAuthState();

      console.log('[ContractManagementAuth] Login successful');

      return {
        success: true,
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Login error:', error);
      return {
        success: false,
        error: 'Network error during authentication'
      };
    }
  }

  /**
   * Register a new user
   */
  public async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    try {
            const registerUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.AUTH.REGISTER);
      console.log('[ContractManagementAuth] Attempting registration to:', registerUrl);
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagementAuth] Registration failed:', data);
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }

      console.log('[ContractManagementAuth] Registration successful');

      return {
        success: true,
        user: data.user,
        message: data.message
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Registration error:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  }

  /**
   * Verify email with token
   */
  public async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      console.log('[ContractManagementAuth] Attempting email verification');

      const verifyUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL);
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagementAuth] Email verification failed:', data);
        return {
          success: false,
          error: data.message || 'Email verification failed'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.message || 'Email verification failed'
        };
      }

      console.log('[ContractManagementAuth] Email verification successful');

      return {
        success: true,
        user: data.user,
        message: data.message
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Email verification error:', error);
      return {
        success: false,
        error: 'Network error during email verification'
      };
    }
  }

  /**
   * Resend verification email
   */
  public async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('[ContractManagementAuth] Requesting to resend verification email for:', email);

      const resendUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION);
      const response = await fetch(resendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ContractManagementAuth] Resend verification failed:', data);
        return {
          success: false,
          error: data.message || 'Failed to resend verification email'
        };
      }

      if (data.success) {
        console.log('[ContractManagementAuth] Verification email resent successfully');
        return {
          success: true,
          message: data.message || 'Verification email sent successfully'
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to resend verification email'
        };
      }
    } catch (error) {
      console.error('[ContractManagementAuth] Resend verification error:', error);
      return {
        success: false,
        error: 'Network error during resend verification'
      };
    }
  }

  /**
   * Logout current user with automatic redirect
   */
  public async logout(redirectPath?: string): Promise<ApiResponse<void>> {
    try {
      // Call logout endpoint to clear server-side session
      try {
        const logoutUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl(CONTRACT_MANAGEMENT_CONFIG.ENDPOINTS.AUTH.LOGOUT);
        await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
          },
          credentials: 'include'
        });
      } catch (error) {
        // Continue with logout even if server call fails
        console.warn('[ContractManagementAuth] Server logout failed, continuing with client logout');
      }

      // Clear authentication state
      this.currentUser = null;
      this.authToken = null;
      this.clearAuthState();

      // Determine redirect path based on current location or provided path
      const finalRedirectPath = redirectPath || this.getAppropriateLoginPath();
      
      // Redirect to appropriate login page
      if (typeof window !== 'undefined') {
        console.log(`[ContractManagementAuth] Redirecting to: ${finalRedirectPath}`);
        window.location.replace(finalRedirectPath);
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current authentication token
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  /**
   * Check if user has specific permission
   */
  public hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: UserRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  /**
   * Handle session expiration with automatic redirect
   */
  public handleSessionExpiration(): void {
    console.log('[ContractManagementAuth] Session expired, clearing state and redirecting');
    
    // Clear authentication state
    this.currentUser = null;
    this.authToken = null;
    this.clearAuthState();
    
    // Redirect to appropriate login page
    if (typeof window !== 'undefined') {
      const redirectPath = this.getAppropriateLoginPath();
      console.log(`[ContractManagementAuth] Session expired, redirecting to: ${redirectPath}`);
      window.location.replace(redirectPath);
    }
  }

  /**
   * Determine appropriate login path based on current URL
   */
  private getAppropriateLoginPath(): string {
    if (typeof window === 'undefined') {
      return '/contract-management/login'; // Default for SSR
    }
    
    const currentPath = window.location.pathname;
    
    // Check if we're in Projly context
    if (currentPath.startsWith('/projly')) {
      return '/projly/login';
    }
    
    // Default to contract management login
    return '/contract-management/login';
  }

  /**
   * Verify token validity with automatic session expiration handling
   */
  public async verifyToken(token: string): Promise<ApiResponse<User>> {
    try {
      // Simulate API delay
      await this.simulateDelay(200);

      if (!token || !token.startsWith('cm_token_')) {
        this.handleSessionExpiration();
        return {
          success: false,
          error: 'Invalid token format'
        };
      }

      // Extract user ID from token (simplified for mock)
      const userId = token.replace('cm_token_', '').split('_')[0];
      const user = MOCK_USERS.find(u => u.id === userId);

      if (!user || !user.isActive) {
        this.handleSessionExpiration();
        return {
          success: false,
          error: 'Invalid or expired token'
        };
      }

      return {
        success: true,
        data: user
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Token verification error:', error);
      this.handleSessionExpiration();
      return {
        success: false,
        error: 'Token verification failed'
      };
    }
  }

  /**
   * Get all users (admin only)
   */
  public async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      if (!this.hasPermission('users.manage')) {
        return {
          success: false,
          error: 'Insufficient permissions'
        };
      }

      // Simulate API delay
      await this.simulateDelay(500);

      return {
        success: true,
        data: MOCK_USERS
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Get users error:', error);
      return {
        success: false,
        error: 'Failed to fetch users'
      };
    }
  }

  /**
   * Change user password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      if (!this.authToken) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Validate input
      if (!currentPassword || !newPassword) {
        return {
          success: false,
          error: 'Current password and new password are required'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'New password must be at least 6 characters long'
        };
      }

      if (currentPassword === newPassword) {
        return {
          success: false,
          error: 'New password must be different from current password'
        };
      }

      // Forward request to service backend
      const changePasswordUrl = CONTRACT_MANAGEMENT_CONFIG.buildApiUrl('/api/contract-management/auth/change-password');
      const serviceResponse = await fetch(changePasswordUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const result = await serviceResponse.json();

      if (!serviceResponse.ok) {
        return {
          success: false,
          error: result.message || 'Failed to change password'
        };
      }

      return {
        success: result.success,
        message: result.message || 'Password changed successfully',
        error: result.success ? undefined : result.message
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Change password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(): Promise<AuthResponse> {
    try {
      if (!this.currentUser) {
        this.handleSessionExpiration();
        return {
          success: false,
          error: 'No user to refresh token for'
        };
      }

      // Simulate API delay
      await this.simulateDelay(300);

      // Generate new token
      const newToken = this.generateMockToken(this.currentUser);
      
      this.authToken = newToken;
      this.saveAuthState();

      return {
        success: true,
        token: newToken,
        user: this.currentUser,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

    } catch (error) {
      console.error('[ContractManagementAuth] Token refresh error:', error);
      this.handleSessionExpiration();
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  /**
   * Handle API response and check for authentication errors
   */
  public handleApiResponse<T>(response: Response, data: any): ApiResponse<T> {
    // Check for authentication-related errors
    if (response.status === 401 || response.status === 403) {
      console.log('[ContractManagementAuth] Authentication error detected, handling session expiration');
      this.handleSessionExpiration();
      return {
        success: false,
        error: 'Session expired. Please log in again.'
      };
    }

    // Check for other error responses
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Request failed with status ${response.status}`
      };
    }

    return {
      success: true,
      data: data
    };
  }

  // Private helper methods

  private generateMockToken(user: User): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `cm_token_${user.id}_${timestamp}_${random}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private saveAuthState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('contractManagementToken', this.authToken || '');
        localStorage.setItem('contractManagementUser', JSON.stringify(this.currentUser));
      } catch (error) {
        console.error('[ContractManagementAuth] Failed to save auth state:', error);
      }
    }
  }

  private restoreAuthState(): void {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('contractManagementToken');
        const userStr = localStorage.getItem('contractManagementUser');
        
        if (token && userStr) {
          this.authToken = token;
          this.currentUser = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('[ContractManagementAuth] Failed to restore auth state:', error);
        this.clearAuthState();
      }
    }
  }

  private clearAuthState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('contractManagementToken');
        localStorage.removeItem('contractManagementUser');
      } catch (error) {
        console.error('[ContractManagementAuth] Failed to clear auth state:', error);
      }
    }
  }
}

// Export singleton instance
export const contractManagementAuthService = ContractManagementAuthService.getInstance(); 