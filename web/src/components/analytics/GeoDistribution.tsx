'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Url } from '@/models/url.model';

type GeoData = {
  country: string;
  percentage: number;
  color: string;
};

interface GeoDistributionProps {
  urls: Url[];
}

export function GeoDistribution({ urls }: GeoDistributionProps) {
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  
  // Generate mock geographic data based on URL clicks
  useEffect(() => {
    if (!urls.length) {
      setGeoData([]);
      return;
    }
    
    // For demo purposes, we'll create mock geographic data
    // In a real implementation, you would use actual geographic data from your analytics
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
    const mockData: GeoData[] = [
      { country: countries[0].country, percentage: 35 + Math.random() * 10, color: countries[0].color },
      { country: countries[1].country, percentage: 15 + Math.random() * 10, color: countries[1].color },
      { country: countries[2].country, percentage: 12 + Math.random() * 8, color: countries[2].color },
      { country: countries[3].country, percentage: 8 + Math.random() * 7, color: countries[3].color },
      { country: countries[4].country, percentage: 6 + Math.random() * 6, color: countries[4].color },
    ];
    
    // Calculate the remaining percentage for 'Others'
    const usedPercentage = mockData.reduce((sum, item) => sum + item.percentage, 0);
    mockData.push({ 
      country: countries[5].country, 
      percentage: Math.max(0, 100 - usedPercentage),
      color: countries[5].color
    });
    
    // Sort by percentage in descending order
    mockData.sort((a, b) => b.percentage - a.percentage);
    
    setGeoData(mockData);
  }, [urls]);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Where your link visitors are coming from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {geoData.length > 0 ? (
            geoData.map((item) => (
              <div key={item.country} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.country}</span>
                  <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400">No geographic data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
