import type { User, AuthUser, LoginCredentials, RegisterData, ApiResponse } from '../types';

// API base URL - points to our backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// User service class for handling user-related API calls
export class UserService {
  // Authentication endpoints
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
    try {
      console.log('🔍 UserService.login called with:', credentials.email);
      
      // For demo purposes, accept any login credentials
      console.log('✅ Using demo authentication - accepting any credentials');
      return {
        success: true,
        data: {
          user: {
            id: 'demo-user-' + Date.now(),
            username: credentials.email.split('@')[0] || 'user',
            email: credentials.email,
            bio: 'Demo user account',
            createdAt: new Date(),
            updatedAt: new Date(),
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            isEmailVerified: true
          },
          token: 'demo-token-' + Date.now()
        }
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
      // For demo purposes, accept any registration
      console.log('✅ Using demo registration - accepting any user data');
      return {
        success: true,
        data: {
          user: {
            id: 'demo-user-' + Date.now(),
            username: userData.username,
            email: userData.email,
            bio: userData.bio || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            isEmailVerified: true
          },
          token: 'demo-token-' + Date.now()
        }
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
      // Client-side logout - just clear local storage
      console.log('✅ Client-side logout - clearing local storage');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      return {
        success: true,
      };
    } catch (error) {
      // Clear local storage even if there's an error
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
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'No authentication token found',
          },
        };
      }

      // Client-side authentication - get user from local storage
      console.log('✅ Client-side getCurrentUser - using local storage');
      const user = JSON.parse(userStr);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Unable to parse user data',
        },
      };
    }
  }

  // User profile endpoints
  static async getUserProfile(username: string): Promise<ApiResponse<User>> {
    try {
      // Client-side profile lookup - return current user or demo user
      console.log('✅ Client-side getUserProfile for:', username);
      const currentUserStr = localStorage.getItem('user');
      
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.username === username) {
          return {
            success: true,
            data: currentUser,
          };
        }
      }

      // Return a demo user if not found
      return {
        success: true,
        data: {
          id: 'demo-user-' + username,
          username: username,
          email: username + '@example.com',
          bio: 'Demo user profile',
          createdAt: new Date(),
          updatedAt: new Date(),
          followerCount: 0,
          followingCount: 0,
          postCount: 0,
          isEmailVerified: true
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Unable to get user profile',
        },
      };
    }
  }

  static async updateProfile(updates: Partial<Pick<User, 'bio'>>): Promise<ApiResponse<User>> {
    try {
      // Client-side profile update - update local storage
      console.log('✅ Client-side updateProfile:', updates);
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        return {
          success: false,
          error: {
            code: 'NO_USER',
            message: 'No user found to update',
          },
        };
      }

      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Unable to update profile',
        },
      };
    }
  }

  // Username availability check
  static async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean; reason?: string }>> {
    try {
      // Client-side username check - always available for demo
      console.log('✅ Client-side checkUsernameAvailability for:', username);
      
      // Simple validation
      if (username.length < 3) {
        return {
          success: true,
          data: {
            available: false,
            reason: 'Username must be at least 3 characters long'
          }
        };
      }

      return {
        success: true,
        data: {
          available: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_ERROR',
          message: 'Unable to check username availability',
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