// Server-side ViewModel for the dashboard page
import { cookies } from "next/headers";
import { Url, formatUrls } from "@/models/url.model";
import { UrlService } from "@/services/url.service";
import { AnalyticsService } from "@/services/analytics.service";
import { DashboardAnalytics } from "@/models/analytics.model";

export async function dashboardViewModel() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // Fetch user's URLs using the token
    let urls: Url[] = [];
    let analyticsData: DashboardAnalytics | null = null;
    
    if (token) {
      // Fetch URLs and analytics data concurrently
      const [urlsResult, analyticsResult] = await Promise.all([
        UrlService.getUserUrls(token),
        AnalyticsService.getDashboardAnalytics(token, 'week')
          .catch(error => {
            console.error('Error fetching analytics:', error);
            return null;
          })
      ]);
      
      urls = urlsResult;
      analyticsData = analyticsResult;
    }
    
    // Transform data for the view
    const formattedUrls = formatUrls(urls);
    
    // Calculate statistics (use analytics data if available)
    const totalClicks = analyticsData?.totalClicks ?? urls.reduce((sum, url) => sum + url.clicks, 0);
    const totalUrls = urls.length;
    
    // Return view-ready data
    return {
      urls: formattedUrls,
      stats: {
        totalUrls,
        totalClicks,
        averageClicksPerUrl: totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0
      },
      analytics: analyticsData,
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
      analytics: null,
      error: 'Failed to load dashboard data'
    };
  }
}
