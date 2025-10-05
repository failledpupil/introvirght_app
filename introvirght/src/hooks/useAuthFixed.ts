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

  // Login function (client-side)
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; errors?: string[] }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

      console.log('✅ Client-side login for:', credentials.email);
      
      // Client-side authentication - accept any credentials
      const user: AuthUser = {
        id: 'demo-user-' + Date.now(),
        username: credentials.email.split('@')[0] || 'user',
        email: credentials.email,
        bio: 'Demo user account',
        createdAt: new Date(),
        updatedAt: new Date(),
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
      };
      
      const token = 'demo-token-' + Date.now();
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
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
  };

  // Register function (client-side)
  const register = async (userData: RegisterData): Promise<{ success: boolean; errors?: string[] }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

      console.log('✅ Client-side register for:', userData.email);
      
      // Client-side registration - accept any data
      const user: AuthUser = {
        id: 'demo-user-' + Date.now(),
        username: userData.username,
        email: userData.email,
        bio: userData.bio || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
      };
      
      const token = 'demo-token-' + Date.now();
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
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