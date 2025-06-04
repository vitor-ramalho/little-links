'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Url } from '@/models/url.model';
import { GeoData } from '@/models/analytics.model';

interface GeoChartData {
  country: string;
  percentage: number;
  color: string;
}

interface GeoDistributionProps {
  urls?: Url[];
  analyticsData?: GeoData[];
  title?: string;
  description?: string;
}

export function GeoDistribution({ 
  urls, 
  analyticsData,
  title = 'Geographic Distribution', 
  description = 'Visitor locations by country'
}: GeoDistributionProps) {
  const [geoData, setGeoData] = useState<GeoChartData[]>([]);
  
  // Colors for the different countries
  const countryColors = useMemo(() => [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#6b7280', // gray
  ], []);
  
  // Process data - use real analytics data if available, otherwise generate mock data
  useEffect(() => {
    if (analyticsData && analyticsData.length > 0) {
      // Use real analytics data
      const totalClicks = analyticsData.reduce((sum, item) => sum + item.count, 0);
      
      // Calculate percentages and assign colors
      const formattedData: GeoChartData[] = analyticsData
        .map((item, index) => ({
          country: item.country,
          percentage: (item.count / totalClicks) * 100,
          color: countryColors[index % countryColors.length]
        }))
        .sort((a, b) => b.percentage - a.percentage);
      
      // Limit to top 5 countries and group the rest as "Others"
      if (formattedData.length > 5) {
        const topCountries = formattedData.slice(0, 5);
        const otherCountries = formattedData.slice(5);
        
        const othersPercentage = otherCountries.reduce(
          (sum, item) => sum + item.percentage, 
          0
        );
        
        if (othersPercentage > 0) {
          topCountries.push({
            country: 'Others',
            percentage: othersPercentage,
            color: countryColors[5]
          });
        }
        
        setGeoData(topCountries);
      } else {
        setGeoData(formattedData);
      }
    } else if (urls && urls.length) {
      // Generate mock data (for backward compatibility)
      const countries = [
        { country: 'United States', color: '#3b82f6' },
        { country: 'Germany', color: '#10b981' },
        { country: 'India', color: '#f59e0b' },
        { country: 'Brazil', color: '#8b5cf6' },
        { country: 'Japan', color: '#ef4444' },
        { country: 'Others', color: '#6b7280' },
      ];
      
      // Calculate total clicks
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
      
      if (totalClicks === 0) {
        setGeoData([]);
        return;
      }
      
      // Create realistic percentage distributions
      const mockData: GeoChartData[] = [
        { country: countries[0].country, percentage: 35 + Math.random() * 10, color: countries[0].color },
        { country: countries[1].country, percentage: 15 + Math.random() * 10, color: countries[1].color },
        { country: countries[2].country, percentage: 12 + Math.random() * 8, color: countries[2].color },
        { country: countries[3].country, percentage: 8 + Math.random() * 7, color: countries[3].color },
        { country: countries[4].country, percentage: 5 + Math.random() * 5, color: countries[4].color },
        { country: countries[5].country, percentage: 5 + Math.random() * 5, color: countries[5].color },
      ];
      
      setGeoData(mockData);
    } else {
      setGeoData([]);
    }
  }, [urls, analyticsData, countryColors]);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {geoData.length > 0 ? (
          <div className="space-y-4">
            {geoData.map((item) => (
              <div key={item.country} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.country}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center text-muted-foreground">
            No geographic data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
