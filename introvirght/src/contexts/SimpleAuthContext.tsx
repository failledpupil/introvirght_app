import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

// Define the context interface
interface SimpleAuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; errors?: string[] }>;
  logout: () => Promise<void>;
  clearError: () => void;
  register: () => Promise<{ success: boolean; errors?: string[] }>;
  updateProfile: () => Promise<{ success: boolean; errors?: string[] }>;
}

// Create the context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Provider component props
interface SimpleAuthProviderProps {
  children: ReactNode;
}

// SimpleAuthProvider component
export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const auth = useSimpleAuth();

  return (
    <SimpleAuthContext.Provider value={auth}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useSimpleAuthContext = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  
  if (context === undefined) {
    throw new Error('useSimpleAuthContext must be used within a SimpleAuthProvider');
  }
  
  return context;
};