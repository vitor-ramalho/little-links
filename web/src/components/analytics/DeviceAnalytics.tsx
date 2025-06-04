'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Url } from '@/models/url.model';
import { DeviceData, BrowserData, OsData } from '@/models/analytics.model';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ChartData = {
  name: string;
  value: number;
};

interface DeviceAnalyticsProps {
  urls?: Url[];
  deviceAnalytics?: DeviceData[];
  browserAnalytics?: BrowserData[];
  osAnalytics?: OsData[];
  title?: string;
  description?: string;
}

export function DeviceAnalytics({ 
  urls, 
  deviceAnalytics,
  browserAnalytics,
  osAnalytics,
  title = 'Device Analytics',
  description = 'Visitor technology breakdown'
}: DeviceAnalyticsProps) {
  const [deviceData, setDeviceData] = useState<ChartData[]>([]);
  const [browserData, setBrowserData] = useState<ChartData[]>([]);
  const [osData, setOsData] = useState<ChartData[]>([]);
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];
  
  // Process data - use real analytics data if available, otherwise generate mock data
  useEffect(() => {
    // Process device data
    if (deviceAnalytics && deviceAnalytics.length > 0) {
      const totalCount = deviceAnalytics.reduce((sum, item) => sum + item.count, 0);
      const formattedData = deviceAnalytics
        .map(item => ({
          name: item.device,
          value: (item.count / totalCount) * 100
        }))
        .sort((a, b) => b.value - a.value);
      
      setDeviceData(formattedData);
    } else if (urls && urls.length) {
      // Mock device data for backward compatibility
      const mockDeviceData: ChartData[] = [
        { name: 'Mobile', value: 50 + Math.random() * 10 },
        { name: 'Desktop', value: 30 + Math.random() * 10 },
        { name: 'Tablet', value: 15 + Math.random() * 5 },
        { name: 'Other', value: 5 + Math.random() * 3 },
      ];
      setDeviceData(mockDeviceData);
    } else {
      setDeviceData([]);
    }
    
    // Process browser data
    if (browserAnalytics && browserAnalytics.length > 0) {
      const totalCount = browserAnalytics.reduce((sum, item) => sum + item.count, 0);
      const formattedData = browserAnalytics
        .map(item => ({
          name: item.browser,
          value: (item.count / totalCount) * 100
        }))
        .sort((a, b) => b.value - a.value);
      
      setBrowserData(formattedData);
    } else if (urls && urls.length) {
      // Mock browser data for backward compatibility
      const mockBrowserData: ChartData[] = [
        { name: 'Chrome', value: 40 + Math.random() * 15 },
        { name: 'Safari', value: 25 + Math.random() * 10 },
        { name: 'Firefox', value: 15 + Math.random() * 5 },
        { name: 'Edge', value: 10 + Math.random() * 5 },
        { name: 'Other', value: 10 + Math.random() * 5 },
      ];
      setBrowserData(mockBrowserData);
    } else {
      setBrowserData([]);
    }
    
    // Process OS data
    if (osAnalytics && osAnalytics.length > 0) {
      const totalCount = osAnalytics.reduce((sum, item) => sum + item.count, 0);
      const formattedData = osAnalytics
        .map(item => ({
          name: item.os,
          value: (item.count / totalCount) * 100
        }))
        .sort((a, b) => b.value - a.value);
      
      setOsData(formattedData);
    } else if (urls && urls.length) {
      // Mock OS data for backward compatibility
      const mockOsData: ChartData[] = [
        { name: 'iOS', value: 35 + Math.random() * 10 },
        { name: 'Android', value: 30 + Math.random() * 10 },
        { name: 'Windows', value: 20 + Math.random() * 5 },
        { name: 'macOS', value: 10 + Math.random() * 5 },
        { name: 'Linux', value: 5 + Math.random() * 3 },
      ];
      setOsData(mockOsData);
    } else {
      setOsData([]);
    }
  }, [urls, deviceAnalytics, browserAnalytics, osAnalytics]);
  
  const renderPieChart = (data: ChartData[]) => {
    if (data.length === 0) {
      return (
        <div className="flex h-52 items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `${Number(value).toFixed(1)}%`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="device">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="device">Device Type</TabsTrigger>
            <TabsTrigger value="browser">Browser</TabsTrigger>
            <TabsTrigger value="os">Operating System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="device" className="mt-4">
            {renderPieChart(deviceData)}
          </TabsContent>
          
          <TabsContent value="browser" className="mt-4">
            {renderPieChart(browserData)}
          </TabsContent>
          
          <TabsContent value="os" className="mt-4">
            {renderPieChart(osData)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
