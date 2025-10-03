import { useState, useEffect } from 'react';

interface SimpleUser {
  id: string;
  username: string;
  email: string;
  bio?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

interface SimpleAuthState {
  user: SimpleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export const useSimpleAuth = () => {
  const [authState, setAuthState] = useState<SimpleAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Simple auth initializing...');
        const token = localStorage.getItem('authToken');
        const cachedUser = localStorage.getItem('user');
        
        if (token && cachedUser) {
          console.log('🔍 Found cached token and user');
          try {
            const user = JSON.parse(cachedUser);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('✅ Simple auth initialized with cached user');
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
        console.error('❌ Simple auth initialization error:', error);
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

  // Simple login function
  const login = async (credentials: { email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorData.error?.message || 'Login failed',
        }));
        return { success: false, errors: [errorData.error?.message || 'Login failed'] };
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
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Login failed',
        }));
        return { success: false, errors: ['Login failed'] };
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Unable to connect to server',
      }));
      return { success: false, errors: ['Unable to connect to server'] };
    }
  };

  // Simple logout function
  const logout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Clear error function
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: undefined }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
    register: async () => ({ success: false, errors: ['Registration not implemented in simple auth'] }),
    updateProfile: async () => ({ success: false, errors: ['Profile update not implemented in simple auth'] }),
  };
};