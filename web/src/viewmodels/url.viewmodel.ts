import { create } from 'zustand';
import { CreateUrlRequest, CreateUrlResponse } from '@/models/url.model';
import { UrlService } from '@/services/url.service';


interface UrlState {
  loading: boolean;
  error: string | null;
  shortenedUrl: CreateUrlResponse | null;
  shortenUrl: (url: string) => Promise<CreateUrlResponse | null>;
  reset: () => void;
}

export const useUrlStore = create<UrlState>((set) => ({
  loading: false,
  error: null,
  shortenedUrl: null,
  
  shortenUrl: async (url: string) => {
    try {
      // Update loading state
      set({ loading: true, error: null });
      
      // Transform the input (url) into the model required by the service
      const request: CreateUrlRequest = { originalUrl: url };
      
      // Call the service to handle the API interaction
      const result = await UrlService.shortenUrl(request);
      
      // Update the state with the result
      set({ shortenedUrl: result, loading: false });
      
      // Return the result for any component that needs immediate access
      return result;
    } catch (error) {
      console.error('Error shortening URL:', error);
      
      // Handle error and update state
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to shorten URL';
      
      set({ error: errorMessage, loading: false });
      return null;
    }
  },
  
  reset: () => {
    set({ shortenedUrl: null, error: null, loading: false });
  },
}));
