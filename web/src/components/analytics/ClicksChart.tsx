'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Url } from '@/models/url.model';

type ClickData = {
  name: string;
  clicks: number;
};

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface ClicksChartProps {
  urls: Url[];
}

export function ClicksChart({ urls }: ClicksChartProps) {
  const [data, setData] = useState<ClickData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  // Process URL data to generate chart data based on time range
  useEffect(() => {
    if (!urls.length) {
      setData([]);
      return;
    }
    
    // For demo purposes, we'll create mock time-based data
    // In a real implementation, you would use actual timestamp data from your URLs
    const now = new Date();
    const mockData: ClickData[] = [];
    
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
  }, [urls, timeRange]);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Click Analytics</CardTitle>
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
        <CardDescription>Link performance over time</CardDescription>
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
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">No data to display</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
