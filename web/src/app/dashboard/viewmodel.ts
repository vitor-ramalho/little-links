// Server-side ViewModel for the dashboard page
import { cookies } from "next/headers";
import { Url, formatUrls } from "@/models/url.model";
import { UrlService } from "@/services/url.service";

export async function dashboardViewModel() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // Fetch user's URLs using the token
    let urls: Url[] = [];
    
    if (token) {
      console.log({token})
      urls = await UrlService.getUserUrls(token);
    }
    
    // Transform data for the view
    const formattedUrls = formatUrls(urls);
    
    // Calculate statistics
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const totalUrls = urls.length;
    
    // Return view-ready data
    return {
      urls: formattedUrls,
      stats: {
        totalUrls,
        totalClicks,
        averageClicksPerUrl: totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error in dashboard view model:', error);
    return {
      urls: [],
      stats: {
        totalUrls: 0,
        totalClicks: 0,
        averageClicksPerUrl: 0
      },
      error: 'Failed to load dashboard data'
    };
  }
}
