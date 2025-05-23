'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Url } from '@/models/url.model';
import { LinkCard } from '@/components/features/LinkCard';
import { ClicksChart } from '@/components/analytics/ClicksChart';
import { GeoDistribution } from '@/components/analytics/GeoDistribution';
import { DeviceAnalytics } from '@/components/analytics/DeviceAnalytics';
import { ReferrerAnalytics } from '@/components/analytics/ReferrerAnalytics';
import { TimeOfDayAnalytics } from '@/components/analytics/TimeOfDayAnalytics';
import { AdvancedUrlForm } from '@/components/features/AdvancedUrlForm';
import { CreateUrlResponse } from '@/models/url.model';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  TrendingUp,
  Users,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DashboardClientProps {
  initialUrls: Url[];
  stats: {
    totalUrls: number;
    totalClicks: number;
    averageClicksPerUrl: number;
  };
}

export function DashboardClient({ initialUrls, stats }: DashboardClientProps) {
  const [urls, setUrls] = useState<Url[]>(initialUrls);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  
  // Filter URLs based on search query
  const filteredUrls = searchQuery 
    ? urls.filter(url => 
        url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) || 
        url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (url.tags && url.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : urls;
    
  // Get selected link for analytics
  const selectedLink = selectedLinkId 
    ? urls.find(url => url.id === selectedLinkId) 
    : null;
  
  // Handle creating a new URL
  const handleUrlCreated = (data: CreateUrlResponse) => {
    const newUrl = {
      id: data.id,
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      shortUrl: data.shortUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clicks: 0,
    };
    
    setUrls(prevUrls => [newUrl, ...prevUrls]);
    
    toast.success('URL shortened successfully!', {
      description: 'Your new link has been created.',
    });
  };
  
  // Show analytics for a specific link
  const handleOpenAnalytics = (id: string) => {
    setSelectedLinkId(id);
  };
  
  // Calculate trends and metrics
  const todayClicks = Math.round(stats.totalClicks * 0.25); // Mock data for recent clicks
  const weekGrowth = stats.totalUrls > 5 ? '+12%' : '+0%'; // Mock growth data
  const popularTimes = ['2pm - 4pm', '7pm - 9pm'];  // Mock popular times
  const recentCountries = ['United States', 'Germany', 'Brazil']; // Mock recent countries
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats cards */}
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardDescription>Total Links</CardDescription>
            <CardTitle className="text-3xl">{stats.totalUrls}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">{weekGrowth}</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle className="text-3xl">{stats.totalClicks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{todayClicks} clicks today</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardDescription>Popular Times</CardDescription>
            <CardTitle className="text-xl">{popularTimes[0]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Also popular: {popularTimes[1]}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardDescription>Top Countries</CardDescription>
            <CardTitle className="text-xl">{recentCountries[0]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>Also: {recentCountries.slice(1).join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - URL shortener and Links */}
        <div className="lg:col-span-1 space-y-6">
          {/* URL Shortener Form */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle>Create Short Link</CardTitle>
              <CardDescription>
                Shorten your URL and track its performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedUrlForm 
                isAuthenticated={true}
                onSuccess={handleUrlCreated}
              />
            </CardContent>
          </Card>
          
          {/* Links List */}
          <Card className="hover:shadow-md transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Links</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" title="Filter links">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Organize links">
                    <Layers className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Manage and track all your shortened links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search links..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredUrls.length > 0 ? (
                  filteredUrls.map((url) => (
                    <LinkCard
                      key={url.id}
                      url={url}
                      onOpenAnalytics={handleOpenAnalytics}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    {searchQuery ? (
                      <>
                        <p>No links found matching &quot;{searchQuery}&quot;</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <p>You haven&apos;t created any links yet</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLink ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Link Analytics</h2>
                  <p className="text-sm text-muted-foreground">
                    Detailed statistics for {selectedLink.shortCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLinkId(null)}
                >
                  Back to overview
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClicksChart urls={[selectedLink]} />
                <GeoDistribution urls={[selectedLink]} />
                <DeviceAnalytics urls={[selectedLink]} />
                <ReferrerAnalytics urls={[selectedLink]} />
                <TimeOfDayAnalytics urls={[selectedLink]} />
              </div>
              
              {/* Single Link Card for selected link */}
              <Card className="hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle>Link Details</CardTitle>
                  <CardDescription>
                    Complete information about this link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Original URL</p>
                      <a
                        href={selectedLink.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        {selectedLink.originalUrl}
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Short URL</p>
                      <a
                        href={selectedLink.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        {selectedLink.shortUrl}
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm">
                          {new Date(selectedLink.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Clicks</p>
                        <p className="text-sm">{selectedLink.clicks}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="traffic">Traffic</TabsTrigger>
                  <TabsTrigger value="devices">Devices</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 pt-6">
                  <ClicksChart urls={urls} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GeoDistribution urls={urls} />
                    <ReferrerAnalytics urls={urls} />
                  </div>
                </TabsContent>
                
                <TabsContent value="traffic" className="pt-6 space-y-6">
                  <ClicksChart urls={urls} />
                  <TimeOfDayAnalytics urls={urls} />
                </TabsContent>
                
                <TabsContent value="devices" className="pt-6">
                  <DeviceAnalytics urls={urls} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
