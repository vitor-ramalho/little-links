// Server-side ViewModel for the analytics page
import { cookies } from "next/headers";
import { formatUrl } from "@/models/url.model";
import { UrlService } from "@/services/url.service";

export async function analyticsViewModel(urlId: string) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return {
        url: null,
        error: 'Authentication required',
        visits: []
      };
    }
    
    // Fetch URL details
    const url = await UrlService.getUrl(urlId, token);
    
    // Format the URL data
    const formattedUrl = formatUrl(url);
    
    // Mock visit data (to be replaced with actual API implementation)
    const visits = [
      { date: '2023-05-12', count: 12 },
      { date: '2023-05-13', count: 8 },
      { date: '2023-05-14', count: 15 },
      { date: '2023-05-15', count: 22 },
      { date: '2023-05-16', count: 18 },
      { date: '2023-05-17', count: 25 },
      { date: '2023-05-18', count: 17 },
    ];
    
    return {
      url: formattedUrl,
      error: null,
      visits
    };
  } catch (error) {
    console.error('Error in analytics view model:', error);
    return {
      url: null,
      error: `Failed to load URL analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      visits: []
    };
  }
}
