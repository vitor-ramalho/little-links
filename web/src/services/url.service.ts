import api from '@/api/axios';
import { CreateUrlRequest, CreateUrlResponse, Url } from '@/models/url.model';
import { generateQRCode } from './qrcode.service';

// Create a server-side version of the API
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const UrlService = {
  /**
   * Shorten a URL (server-side)
   * @param data URL to shorten
   * @param token Optional auth token for authenticated requests
   * @returns Shortened URL data
   */
  shortenUrl: async (data: CreateUrlRequest, token?: string): Promise<CreateUrlResponse> => {
    console.log('Shortening URL with data:', data);
    
    try {
      // Create an AbortController with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Determine endpoint and headers based on authentication status
      const endpoint = token ? `${baseUrl}/links` : `${baseUrl}/api/links/public`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using authenticated endpoint for URL shortening');
      } else {
        console.log('Using public endpoint for URL shortening');
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        next: { revalidate: 0 }, // Don't cache this request
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        
        // Handle specific error status codes
        if (response.status === 400) {
          throw new Error('Invalid URL format');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 409) {
          throw new Error('This URL has already been shortened');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(`Failed to shorten URL: ${response.status} ${errorText}`);
      }
      
      const urlData = await response.json();
      
      // Generate QR code for the shortened URL
      try {
        const qrCodePath = await generateQRCode(urlData.shortUrl, {
          errorCorrectionLevel: 'quartile',
          size: 300,
          margin: 4
        });
        
        // Add the QR code path to the response
        urlData.qrCode = qrCodePath;
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
        // Continue without QR code, it's not critical
      }
      
      return urlData;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Request timeout:', error);
        throw new Error('Request timed out. Please try again later.');
      }
      
      // Rethrow other errors
      throw error;
    }
  },

  /**
   * Get URLs for the authenticated user (server-side)
   * @returns List of URLs
   */
  getUserUrls: async (token?: string): Promise<Url[]> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Server-side API request with token:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('No token provided for server-side API request');
    }
    
    try {
      const response = await fetch(`${baseUrl}/links`, {
        headers,
        next: { revalidate: 0 } // Always fetch fresh data
      });
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch user URLs: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      throw error;
    }
  },

  /**
   * Get details for a specific URL (server-side)
   * @param id URL ID
   * @returns URL details
   */
  getUrl: async (id: string, token?: string): Promise<Url> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseUrl}/api/links/${id}`, {
      headers,
      next: { revalidate: 0 } // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL with ID: ${id}`);
    }
    
    return response.json();
  }
};

// Client-side version of the API for interactive components that need it
export const UrlServiceClient = {
  /**
   * Shorten a URL (client-side)
   * @param data URL to shorten
   * @param isAuthenticated Whether the user is authenticated
   * @returns Shortened URL data
   */
  shortenUrl: async (data: CreateUrlRequest, isAuthenticated = false): Promise<CreateUrlResponse> => {
    // Use the authenticated endpoint if the user is logged in, otherwise use the public endpoint
    const endpoint = isAuthenticated ? '/links' : '/public/links';
    const response = await api.post<CreateUrlResponse>(endpoint, data);
    return response.data;
  },

  /**
   * Get URLs for the authenticated user (client-side)
   * @returns List of URLs
   */
  getUserUrls: async (): Promise<Url[]> => {
    const response = await api.get<Url[]>('/links');
    return response.data;
  },

  /**
   * Get details for a specific URL (client-side)
   * @param id URL ID
   * @returns URL details
   */
  getUrl: async (id: string): Promise<Url> => {
    const response = await api.get<Url>(`/links/${id}`);
    return response.data;
  }
};
