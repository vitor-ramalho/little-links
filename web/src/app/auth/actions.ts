'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { User } from '@/models/user.model';

// Environment variables
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:3000/api';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Types for form state
type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
  token?: string;
  user?: User;
  redirectTo?: string;
};

type RegisterFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
  token?: string;
  user?: User;
  redirectTo?: string;
};

// Login action
export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // Extract form data
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Validate form data
  const validationResult = loginSchema.safeParse({ email, password });
  
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Please fix the errors in the form',
      success: false,
    };
  }
  
  try {
    // Send login request to API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        message: error.message || 'Login failed. Please check your credentials.',
        success: false,
      };
    }
    
    // Get response data
    const data = await response.json();
    
    // Store auth token and user data in cookies
    const cookieStore = await cookies();
    cookieStore.set('auth_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    cookieStore.set('user', JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Return success response with token and user data
    // Client will handle the redirect
    return {
      success: true,
      message: 'Login successful!',
      token: data.accessToken,
      user: data.user,
      redirectTo: '/dashboard',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Login failed. Please try again.',
      success: false,
    };
  }
}

// Register action
export async function register(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Extract form data
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Validate form data
  const validationResult = registerSchema.safeParse({ name, email, password });
  
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Please fix the errors in the form',
      success: false,
    };
  }
  
  try {
    // Send register request to API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        message: error.message || 'Registration failed. Please try again.',
        success: false,
      };
    }
    
    // Now we need to log in to get the auth token
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!loginResponse.ok) {
      return {
        message: 'Account created but login failed. Please login manually.',
        success: true, // Still success because registration worked
      };
    }
    
    // Get login data with token
    const loginData = await loginResponse.json();
    
    // Store auth token and user data in cookies
    const cookieStore = await cookies();
    cookieStore.set('auth_token', loginData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    cookieStore.set('user', JSON.stringify(loginData.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Return success response with token, user data, and redirect info
    // Client will handle the redirect
    return {
      success: true,
      message: 'Registration successful!',
      token: loginData.accessToken,
      user: loginData.user,
      redirectTo: '/dashboard',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      message: 'Registration failed. Please try again.',
      success: false,
    };
  }
}

// Logout action
export async function logout() {
  // Clear auth cookies
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('user');
  
  // Redirect to homepage
  redirect('/');
}
