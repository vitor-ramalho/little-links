// Server-side ViewModel for the landing page URL shortener
import { CreateUrlRequest, CreateUrlResponse } from "@/models/url.model";
import { UrlService } from "@/services/url.service";

export async function urlShortenerViewModel() {
  // This function prepares data for the landing page
  return {
    shortenUrl: async (url: string): Promise<CreateUrlResponse> => {
      try {
        const request: CreateUrlRequest = { originalUrl: url };
        return await UrlService.shortenUrl(request);
      } catch (error) {
        console.error('Error shortening URL:', error);
        throw error;
      }
    }
  };
}
