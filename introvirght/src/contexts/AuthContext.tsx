import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuthFixed } from '../hooks/useAuthFixed';
import type { AuthState, AuthUser, LoginCredentials, RegisterData } from '../types';

// Define the context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; errors?: string[] }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; errors?: string[] }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'bio'>>) => Promise<{ success: boolean; errors?: string[] }>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthFixed();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback = <div className="text-center py-8">Please log in to continue</div> 
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Component to show content only when user is NOT authenticated
interface RequireGuestProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireGuest: React.FC<RequireGuestProps> = ({ 
  children, 
  fallback = <div className="text-center py-8">You are already logged in</div> 
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};