import { create } from 'zustand';
import { 
  AuthState, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '@/models/auth.model';
import { AuthService } from '@/services/auth.service';

interface AuthStore extends AuthState {
  loading: boolean;
  error: string | null;
  
  // Auth actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User | null>;
  
  // Local state actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Create auth store with Zustand
export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  
  // Initialize from localStorage if available (to persist auth state)
  init: () => {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ 
          isAuthenticated: true, 
          token, 
          user 
        });
        
        // Verify token is still valid by getting profile
        get().getProfile().catch(() => {
          // Silent handling - will clear invalid tokens in the catch block
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth state from storage', error);
      // Reset auth state if initialization fails
      get().reset();
    }
  },
  
  // Login
  login: async (credentials: LoginRequest) => {
    try {
      set({ loading: true, error: null });
      
      const response = await AuthService.login(credentials);
      
      // Store auth data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      set({ 
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        loading: false
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Login failed. Please check your credentials.';
      
      set({ 
        isAuthenticated: false, 
        user: null, 
        token: null, 
        loading: false, 
        error: errorMessage 
      });
      
      return false;
    }
  },
  
  // Register
  register: async (data: RegisterRequest) => {
    try {
      set({ loading: true, error: null });
      
      const response = await AuthService.register(data);
      
      // Store auth data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      set({ 
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        loading: false
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Registration failed. Please try again.';
      
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      return false;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      set({ loading: true });
      
      // Call logout API
      await AuthService.logout();
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      
      // Reset state
      set({ 
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if API call fails, we should still clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      
      set({ 
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      });
    }
  },
  
  // Get current user profile
  getProfile: async () => {
    try {
      set({ loading: true, error: null });
      
      const user = await AuthService.getProfile();
      
      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      set({ 
        isAuthenticated: true,
        user,
        loading: false
      });
      
      return user;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      
      // Clear auth data if token is invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      
      set({ 
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Authentication expired. Please login again.'
      });
      
      return null;
    }
  },
  
  // Local state setters
  setUser: (user: User | null) => {
    set({ user });
    
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  
  setToken: (token: string | null) => {
    set({ token, isAuthenticated: !!token });
    
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  reset: () => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    
    // Reset state
    set({ 
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    });
  }
}));
