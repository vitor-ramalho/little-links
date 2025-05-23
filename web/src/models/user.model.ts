// User model interface definition
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  subscriptionTier?: 'free' | 'premium' | 'enterprise';
  preferences?: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  defaultPrivacy?: 'public' | 'private';
  language?: string;
}

// User authentication response interface
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
