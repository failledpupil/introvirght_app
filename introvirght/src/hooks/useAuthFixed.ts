import { useState, useEffect } from 'react';
import type { AuthState, AuthUser, LoginCredentials, RegisterData } from '../types';

// Simplified auth hook that doesn't cause runtime errors
export const useAuthFixed = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
  });

  // Initialize auth state on mount - simplified version
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('🔍 Initializing auth (fixed version)...');
        const token = localStorage.getItem('authToken');
        const cachedUserStr = localStorage.getItem('user');
        
        if (token && cachedUserStr) {
          try {
            const cachedUser = JSON.parse(cachedUserStr);
            console.log('✅ Found cached auth, user:', cachedUser.username);
            setAuthState({
              user: cachedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (parseError) {
            console.log('❌ Failed to parse cached user, clearing storage');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          console.log('🔍 No cached auth, setting unauthenticated');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication initialization failed',
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; errors?: string[] }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

      console.log('🔍 Attempting login for:', credentials.email);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('🔍 Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Login failed';
        console.log('❌ Login failed:', errorMessage);
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          errors: [errorMessage],
        };
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { user, token } = data.data;
        console.log('✅ Login successful, user:', user.username);
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        const errorMessage = 'Login failed';
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          errors: [errorMessage],
        };
      }
    } catch (error) {
      console.error('❌ Login network error:', error);
      const errorMessage = 'Unable to connect to server';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        errors: [errorMessage],
      };
    }
  };

  // Register function - simplified
  const register = async (userData: RegisterData): Promise<{ success: boolean; errors?: string[] }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Registration failed';
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          errors: [errorMessage],
        };
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { user, token } = data.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        const errorMessage = 'Registration failed';
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          errors: [errorMessage],
        };
      }
    } catch (error) {
      const errorMessage = 'Unable to connect to server';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        errors: [errorMessage],
      };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Update user profile - simplified
  const updateProfile = async (_updates: Partial<Pick<AuthUser, 'bio'>>): Promise<{ success: boolean; errors?: string[] }> => {
    return {
      success: false,
      errors: ['Profile update not implemented in fixed auth'],
    };
  };

  // Clear auth errors
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: undefined }));
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
};