'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Url } from '@/models/url.model';
import { HourData } from '@/models/analytics.model';
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
  urls?: Url[];
  analyticsData?: HourData[];
  title?: string;
  description?: string;
}

export function TimeOfDayAnalytics({ 
  urls, 
  analyticsData,
  title = 'Time of Day Analytics',
  description = 'When your links are clicked'
}: TimeOfDayAnalyticsProps) {
  // Format hour for display (e.g. "3 PM", "12 AM")
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Generate data - use real analytics data if available, otherwise generate mock data
  const getTimeOfDayData = () => {
    if (analyticsData && analyticsData.length > 0) {
      // Use real analytics data
      return analyticsData.map(item => ({
        hour: item.hour,
        clicks: item.count,
        label: formatHour(item.hour),
      }));
    } else if (urls && urls.length) {
      // Generate mock time of day data based on the URLs provided
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
    } else {
      // No data
      return Array(24).fill(0).map((_, hour) => ({
        hour,
        clicks: 0,
        label: formatHour(hour),
      }));
    }
  };

  const timeData = getTimeOfDayData();
  
  // Determine current hour for reference line
  const currentHour = new Date().getHours();
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timeData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} clicks`, 'Clicks']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <ReferenceLine
                x={formatHour(currentHour)}
                stroke="#ff0000"
                strokeDasharray="3 3"
                label={{ value: 'Now', position: 'insideTopRight', fill: '#ff0000', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
