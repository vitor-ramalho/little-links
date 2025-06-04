import { LinkAnalytics, DashboardAnalytics } from '@/models/analytics.model';

/**
 * Determines if code is running on server or client
 */
const isServer = () => typeof window === 'undefined';

export const AnalyticsService = {
  /**
   * Get analytics for a specific link (server-side)
   * @param linkId Link ID
   * @param token Auth token
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @returns Analytics data
   */
  getLinkAnalytics: async (
    linkId: string, 
    token: string,
    startDate?: string,
    endDate?: string
  ): Promise<LinkAnalytics> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    let queryParams = '';
    if (startDate && endDate) {
      queryParams = `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    try {
      // Use the frontend API route for server-side requests
      const apiEndpoint = isServer()
        ? `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3002'}/api/analytics/links/${linkId}${queryParams}`
        : `/api/analytics/links/${linkId}${queryParams}`;
      
      const response = await fetch(apiEndpoint, {
        headers,
        next: { revalidate: 0 } // Always fetch fresh data
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch analytics: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching link analytics:', error);
      throw error;
    }
  },
  
  /**
   * Get dashboard analytics for all user links (server-side)
   * @param token Auth token
   * @param period Period for analytics (day, week, month, year)
   * @returns Dashboard analytics data
   */
  getDashboardAnalytics: async (
    token: string,
    period: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<DashboardAnalytics> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    try {
      // Use the frontend API route for server-side requests
      const apiEndpoint = isServer() 
        ? `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3002'}/api/analytics/dashboard?period=${period}`
        : `/api/analytics/dashboard?period=${period}`;
        
      const response = await fetch(apiEndpoint, {
        headers,
        next: { revalidate: 0 } // Always fetch fresh data
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch dashboard analytics: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }
};
