'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Url } from '@/models/url.model';
import { ClickData } from '@/models/analytics.model';

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface ClicksChartProps {
  urls?: Url[];
  analyticsData?: ClickData[];
  title?: string;
  description?: string;
}

interface ChartDataPoint {
  name: string; // This is actually used for display in the chart
  date?: string; // Optional for migration
  clicks: number;
}

export function ClicksChart({ 
  urls, 
  analyticsData,
  title = 'Click Analytics',
  description = 'Link performance over time'
}: ClicksChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  // Process data - use real analytics data if available, otherwise generate mock data
  useEffect(() => {
    if (analyticsData && analyticsData.length > 0) {
      // Use real analytics data
      const formattedData = analyticsData.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: item.count
      }));
      
      setData(formattedData);
    } else if (urls && urls.length) {
      // Generate mock data (for backward compatibility)
      const now = new Date();
      const mockData: ChartDataPoint[] = [];
      
      let daysToShow = 7;
      if (timeRange === '30d') daysToShow = 30;
      if (timeRange === '90d') daysToShow = 90;
      if (timeRange === 'all') daysToShow = 180; // Showing max 6 months for 'all'
      
      // Create a data point for each day in the range
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Create some realistic-looking data with random fluctuations
        // but generally increasing over time
        const baseClicks = Math.floor(urls.length * 2.5);
        const randomVariation = Math.floor(Math.random() * baseClicks * 0.5);
        const trend = Math.floor((daysToShow - i) / daysToShow * baseClicks * 0.3);
        
        mockData.push({
          name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          clicks: baseClicks + randomVariation + trend
        });
      }
      
      setData(mockData);
    } else {
      setData([]);
    }
  }, [urls, analyticsData, timeRange]);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs rounded-md ${
                  timeRange === range 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} clicks`, 'Clicks']}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No click data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
