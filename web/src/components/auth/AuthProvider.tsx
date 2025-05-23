'use client';

import { 
  ReactNode, 
  createContext, 
  useContext, 
  useEffect 
} from 'react';
import { useAuthStore } from '@/viewmodels/auth.viewmodel';
import { User } from '@/models/auth.model';

// Type definitions for the auth context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Get auth state and methods from the auth store
  const { 
    isAuthenticated,
    user,
    loading,
    error,
    login: storeLogin,
    logout,
    register: storeRegister
  } = useAuthStore();

  // Initialize auth state on component mount
  useEffect(() => {
    // Auth initialization is now handled server-side
  }, []);

  // Simplified login function
  const login = async (email: string, password: string) => {
    return await storeLogin({ email, password });
  };

  // Simplified register function
  const register = async (name: string, email: string, password: string) => {
    return await storeRegister({ name, email, password });
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
