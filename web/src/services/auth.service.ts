import api from '@/api/axios';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/models/auth.model';

export const AuthService = {
  /**
   * Register a new user
   * @param data Registration data
   * @returns Auth response with user data and token
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // First register the user
    await api.post<User>('/auth/register', data);
    
    // Then log in to get the token
    const loginResponse = await api.post<{accessToken: string; user: User}>('/auth/login', {
      email: data.email,
      password: data.password
    });
    
    // Transform the API response to match our client model
    return {
      user: loginResponse.data.user,
      token: loginResponse.data.accessToken
    };
  },

  /**
   * Login a user
   * @param data Login credentials
   * @returns Auth response with user data and token
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<{accessToken: string; user: User}>('/auth/login', data);
    // Transform the API response to match our client model
    return {
      user: response.data.user,
      token: response.data.accessToken
    };
  },

  /**
   * Get the current user's profile
   * @returns User profile data
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  }
};
