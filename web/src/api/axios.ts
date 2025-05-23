import axios from 'axios';

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle auth tokens
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage if available
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear stored auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle other common errors
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

export default api;
