'use client';

import { useState } from 'react';
import { Url } from '@/models/url.model';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClicksChart } from '@/components/analytics/ClicksChart';
import { GeoDistribution } from '@/components/analytics/GeoDistribution';
import { DeviceAnalytics } from '@/components/analytics/DeviceAnalytics';
import { LinkCard } from '@/components/features/LinkCard';
import { AdvancedUrlForm } from '@/components/features/AdvancedUrlForm';
import { CreateUrlResponse } from '@/models/url.model';
import { toast } from 'sonner';

interface DashboardClientProps {
  urls: Url[];
  stats: {
    totalUrls: number;
    totalClicks: number;
    averageClicksPerUrl: number;
  };
}

export function DashboardClient({ urls }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState('links');
  const [selectedUrlId, setSelectedUrlId] = useState<string | null>(null);
  const [userUrls, setUserUrls] = useState(urls);
  
  // Handle URL creation success
  const handleUrlCreated = (data: CreateUrlResponse) => {
    // Create a new URL object with the response data
    const newUrl = {
      id: data.id,
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      shortUrl: data.shortUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clicks: 0,
      formattedCreatedAt: new Date().toLocaleDateString(),
      formattedUpdatedAt: new Date().toLocaleDateString()
    };
    
    // Update the URLs list with the new URL
    setUserUrls([newUrl, ...userUrls]);
    
    toast.success('URL shortened successfully!');
  };
  
  // Handle opening analytics for a specific URL
  const handleOpenAnalytics = (urlId: string) => {
    setSelectedUrlId(urlId);
    setActiveTab('analytics');
  };
  
  // Get the selected URL
  const selectedUrl = selectedUrlId 
    ? userUrls.find(url => url.id === selectedUrlId)
    : null;
  
  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - URL shortener and stats */}
        <div className="md:w-full lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1">Create Short Link</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
                Customize and track your shortened URLs
              </p>
              <AdvancedUrlForm 
                isAuthenticated={true} 
                onSuccess={handleUrlCreated}
              />
            </div>
          </div>
        </div>
        
        {/* Right column - Tabs for URLs and analytics */}
        <div className="md:w-full lg:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="links">My Links</TabsTrigger>
              <TabsTrigger value="analytics" disabled={!selectedUrlId}>Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="links" className="space-y-4">
              {userUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {userUrls.map((url) => (
                    <LinkCard 
                      key={url.id} 
                      url={url} 
                      onOpenAnalytics={handleOpenAnalytics}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No links yet</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                    Create your first short link using the form on the left.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              {selectedUrl ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-bold">{selectedUrl.shortCode}</h2>
                    <a 
                      href={selectedUrl.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-neutral-500 dark:text-neutral-400 text-sm break-all hover:underline"
                    >
                      {selectedUrl.originalUrl}
                    </a>
                  </div>
                  
                  <ClicksChart urls={[selectedUrl as Url]} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GeoDistribution urls={[selectedUrl as Url]} />
                    <DeviceAnalytics urls={[selectedUrl as Url]} />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Select a link to view analytics
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                    Click on the &quot;Stats&quot; button on any link to see detailed analytics.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
