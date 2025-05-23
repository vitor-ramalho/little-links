'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Url } from '@/models/url.model';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DeviceData = {
  name: string;
  value: number;
};

interface DeviceAnalyticsProps {
  urls: Url[];
}

export function DeviceAnalytics({ urls }: DeviceAnalyticsProps) {
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [browserData, setBrowserData] = useState<DeviceData[]>([]);
  const [osData, setOsData] = useState<DeviceData[]>([]);
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];
  
  // Generate mock device data based on URL clicks
  useEffect(() => {
    if (!urls.length) {
      setDeviceData([]);
      setBrowserData([]);
      setOsData([]);
      return;
    }
    
    // For demo purposes, we'll create mock device data
    // In a real implementation, you would use actual device data from your analytics
    
    // Device type data
    const mockDeviceData: DeviceData[] = [
      { name: 'Mobile', value: 50 + Math.random() * 10 },
      { name: 'Desktop', value: 30 + Math.random() * 10 },
      { name: 'Tablet', value: 15 + Math.random() * 5 },
      { name: 'Other', value: 5 + Math.random() * 3 },
    ];
    
    // Browser data
    const mockBrowserData: DeviceData[] = [
      { name: 'Chrome', value: 40 + Math.random() * 15 },
      { name: 'Safari', value: 25 + Math.random() * 10 },
      { name: 'Firefox', value: 15 + Math.random() * 5 },
      { name: 'Edge', value: 10 + Math.random() * 5 },
      { name: 'Other', value: 10 + Math.random() * 5 },
    ];
    
    // OS data
    const mockOsData: DeviceData[] = [
      { name: 'Android', value: 35 + Math.random() * 10 },
      { name: 'iOS', value: 30 + Math.random() * 10 },
      { name: 'Windows', value: 20 + Math.random() * 7 },
      { name: 'macOS', value: 10 + Math.random() * 5 },
      { name: 'Linux', value: 5 + Math.random() * 3 },
    ];
    
    // Normalize data to make sure it sums to 100%
    const normalizeData = (data: DeviceData[]) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return data.map(item => ({
        ...item,
        value: (item.value / total) * 100
      }));
    };
    
    setDeviceData(normalizeData(mockDeviceData));
    setBrowserData(normalizeData(mockBrowserData));
    setOsData(normalizeData(mockOsData));
  }, [urls]);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Device Analytics</CardTitle>
        <CardDescription>How users access your links</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="browsers">Browsers</TabsTrigger>
            <TabsTrigger value="os">OS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="devices" className="h-64">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No device data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="browsers" className="h-64">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No browser data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="os" className="h-64">
            {osData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {osData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No OS data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
