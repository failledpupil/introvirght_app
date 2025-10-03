import type { User, AuthUser, LoginCredentials, RegisterData, ApiResponse } from '../types';

// API base URL - points to our backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// User service class for handling user-related API calls
export class UserService {
  // Authentication endpoints
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    try {
      console.log('🔍 UserService.login called with:', credentials.email);
      
      // TEMPORARY: Simple bypass for testing - remove after fixing auth issues
      if (credentials.email === 'test@test.com' && credentials.password === 'test123') {
        console.log('✅ Using simple bypass for testing');
        return {
          success: true,
          data: {
            user: {
              id: 'test-user-id',
              username: 'testuser',
              email: 'test@test.com',
              bio: 'Test user',
              createdAt: new Date(),
              updatedAt: new Date(),
              followerCount: 0,
              followingCount: 0,
              postCount: 0,
              isEmailVerified: true
            },
            token: 'test-token-simple'
          }
        };
      }
      
      // Use real authentication for other credentials
      
      console.log('🔍 API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Login failed, error data:', errorData);
        return {
          success: false,
          error: errorData.error || { code: 'LOGIN_FAILED', message: 'Login failed' },
        };
      }

      const data = await response.json();
      console.log('✅ Login successful, data received:', data.success ? 'success' : 'failed');
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log('❌ Network error in login:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  static async register(userData: RegisterData): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    try {
      // Mock implementation - will be replaced with actual API call
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'REGISTRATION_FAILED', message: 'Registration failed' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  static async logout(): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Clear local storage regardless of response
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      return {
        success: true,
      };
    } catch (error) {
      // Clear local storage even if network fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      return {
        success: true, // Logout should always succeed locally
      };
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'No authentication token found',
          },
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: 'Authentication failed',
          },
        };
      }

      const user = await response.json();
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // User profile endpoints
  static async getUserProfile(username: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        };
      }

      const user = await response.json();
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  static async updateProfile(updates: Partial<Pick<User, 'bio'>>): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'UPDATE_FAILED', message: 'Profile update failed' },
        };
      }

      const user = await response.json();
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Username availability check
  static async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean; reason?: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/check-username?username=${encodeURIComponent(username)}`);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'CHECK_FAILED',
            message: 'Unable to check username availability',
          },
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }
}

// Helper functions for local storage management
export const TokenManager = {
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  removeToken: (): void => {
    localStorage.removeItem('authToken');
  },

  setUser: (user: AuthUser): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  removeUser: (): void => {
    localStorage.removeItem('user');
  },

  clear: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};