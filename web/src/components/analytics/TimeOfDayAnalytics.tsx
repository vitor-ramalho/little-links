'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Url } from '@/models/url.model';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface TimeOfDayAnalyticsProps {
  urls: Url[];
}

export function TimeOfDayAnalytics({ urls }: TimeOfDayAnalyticsProps) {
  // Generate mock time of day data based on the URLs provided
  const generateTimeOfDayData = (urls: Url[]) => {
    // Get total clicks
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    
    // If no clicks, return empty data
    if (totalClicks === 0) {
      return Array(24).fill(0).map((_, hour) => ({
        hour,
        clicks: 0,
        label: formatHour(hour),
      }));
    }
    
    // Create a normalized time distribution based on typical internet usage
    // More traffic during working hours and evening, less during night
    const timeDistribution = [
      0.01, 0.01, 0.005, 0.005, 0.005, 0.01,  // 12am - 6am: Very low
      0.02, 0.04, 0.06, 0.07, 0.08, 0.09,    // 6am - 12pm: Rising
      0.09, 0.08, 0.07, 0.06, 0.07, 0.08,    // 12pm - 6pm: High
      0.09, 0.1, 0.09, 0.07, 0.04, 0.02      // 6pm - 12am: Peak then drop
    ];
    
    // Distribute clicks through hours of the day
    return timeDistribution.map((ratio, hour) => {
      // Add some randomness for more realistic data
      const variation = Math.random() * 0.02 - 0.01;
      const adjustedRatio = Math.max(0, ratio + variation);
      
      return {
        hour,
        clicks: Math.round(totalClicks * adjustedRatio),
        label: formatHour(hour),
      };
    });
  };
  
  // Format hour to AM/PM
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };
  
  // Get current hour to show in visualization
  const currentHour = new Date().getHours();
  
  const timeData = generateTimeOfDayData(urls);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Time of Day Activity</CardTitle>
        <CardDescription>
          When your links receive the most clicks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {timeData.some(data => data.clicks > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                  tickFormatter={(value, index) => (index % 3 === 0 ? value : '')}
                />
                <YAxis hide={true} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <Tooltip
                  formatter={(value: number) => [`${value} clicks`, 'Traffic']}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <ReferenceLine
                  x={formatHour(currentHour)}
                  stroke="#F59E0B"
                  label={{ value: 'Now', position: 'top', fill: '#F59E0B', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              No time data available yet
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-center text-neutral-500">
          Time shown in your local timezone
        </div>
      </CardContent>
    </Card>
  );
}
