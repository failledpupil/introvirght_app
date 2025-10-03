import { useState, useEffect } from 'react';
import type { AuthState, AuthUser, LoginCredentials, RegisterData } from '../types';
import { UserService, TokenManager } from '../services/userService';
import { validateLoginForm, validateRegisterForm } from '../utils/validation';

// Custom hook for authentication management
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...');
      const token = TokenManager.getToken();
      const cachedUser = TokenManager.getUser();
      console.log('🔍 Token:', token ? 'exists' : 'missing');
      console.log('🔍 Cached user:', cachedUser ? cachedUser.username : 'missing');

      if (token && cachedUser) {
        console.log('🔍 Verifying token with server...');
        // Verify token with server
        const response = await UserService.getCurrentUser();
        
        if (response.success && response.data) {
          console.log('✅ Auth verified, user:', response.data.username);
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.log('❌ Token invalid, clearing storage. Error:', response.error);
          // Token is invalid, clear local storage
          TokenManager.clear();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        console.log('🔍 No token or user, setting unauthenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; errors?: string[] }> => {
    // Validate form data
    const validation = validateLoginForm(credentials);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(err => err.message),
      };
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      console.log('🔍 Attempting login for:', credentials.email);
      const response = await UserService.login(credentials);
      console.log('🔍 Login response:', response.success ? 'success' : 'failed');

      if (response.success && response.data) {
        const { user, token } = response.data;
        console.log('✅ Login successful, user:', user.username);
        console.log('✅ Token received:', token ? 'yes' : 'no');
        
        // Store token and user data
        TokenManager.setToken(token);
        TokenManager.setUser(user);
        console.log('✅ Token and user stored in localStorage');

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('✅ Auth state updated');

        return { success: true };
      } else {
        const errorMessage = response.error?.message || 'Login failed';
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
      const errorMessage = 'An unexpected error occurred';
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

  // Register function
  const register = async (userData: RegisterData): Promise<{ success: boolean; errors?: string[] }> => {
    // Validate form data
    const validation = validateRegisterForm(userData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(err => err.message),
      };
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await UserService.register(userData);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token and user data
        TokenManager.setToken(token);
        TokenManager.setUser(user);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        const errorMessage = response.error?.message || 'Registration failed';
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
      const errorMessage = 'An unexpected error occurred';
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
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await UserService.logout();
    } catch (error) {
      // Logout should always succeed locally
      console.warn('Logout request failed, but continuing with local logout');
    }

    // Clear local state regardless of API response
    TokenManager.clear();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Pick<AuthUser, 'bio'>>): Promise<{ success: boolean; errors?: string[] }> => {
    if (!authState.user) {
      return {
        success: false,
        errors: ['User not authenticated'],
      };
    }

    try {
      const response = await UserService.updateProfile(updates);

      if (response.success && response.data) {
        const updatedUser = { ...authState.user, ...response.data };
        TokenManager.setUser(updatedUser);
        
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));

        return { success: true };
      } else {
        return {
          success: false,
          errors: [response.error?.message || 'Profile update failed'],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['An unexpected error occurred'],
      };
    }
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