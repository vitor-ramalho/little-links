'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Url } from '@/models/url.model';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

// Known referrer domains to track
const REFERRER_DOMAINS = [
  { name: 'Google', pattern: 'google' },
  { name: 'Facebook', pattern: 'facebook' },
  { name: 'Instagram', pattern: 'instagram' },
  { name: 'Twitter', pattern: 'twitter' },
  { name: 'LinkedIn', pattern: 'linkedin' },
  { name: 'YouTube', pattern: 'youtube' },
  { name: 'Direct', pattern: 'direct' },
];

// Pie chart colors
const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6B7280'];

interface ReferrerAnalyticsProps {
  urls: Url[];
}

export function ReferrerAnalytics({ urls }: ReferrerAnalyticsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Generate mock referrer data based on the URLs provided
  const generateReferrerData = (urls: Url[]) => {
    // Get total clicks
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    
    // If no clicks, return empty data
    if (totalClicks === 0) return [];
    
    // Distribute clicks among referrers somewhat realistically
    // Popular referrers like Google, Facebook get more clicks
    return REFERRER_DOMAINS.map((domain) => {
      // Generate somewhat realistic distribution
      let value: number;
      switch (domain.name) {
        case 'Google':
          value = Math.round(totalClicks * (0.3 + Math.random() * 0.1));
          break;
        case 'Facebook':
          value = Math.round(totalClicks * (0.15 + Math.random() * 0.1));
          break;
        case 'Direct':
          value = Math.round(totalClicks * (0.2 + Math.random() * 0.1));
          break;
        case 'Twitter':
          value = Math.round(totalClicks * (0.1 + Math.random() * 0.05));
          break;
        default:
          value = Math.round(totalClicks * (0.05 + Math.random() * 0.05));
      }
      
      return {
        name: domain.name,
        value: value,
      };
    });
  };

  const referrerData = generateReferrerData(urls);
  
  // Handle mouse hover on pie segments
  const handleMouseEnter = (_data: unknown, index: number) => {
    setActiveIndex(index);
  };
  
  const handleMouseLeave = () => {
    setActiveIndex(null);
  };
  
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Where your link visitors are coming from
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {referrerData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={referrerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {referrerData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={activeIndex === index ? 2 : 0}
                      style={{
                        filter: activeIndex === index ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' : 'none',
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.7,
                        transition: 'opacity 0.3s, filter 0.3s',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} clicks`, 'Traffic']}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              No traffic data available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
