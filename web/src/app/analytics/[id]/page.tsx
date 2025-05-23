import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { analyticsViewModel } from './viewmodel';
import { AnalyticsChart } from './components/AnalyticsChart';

// Helper function to check auth
async function getUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user')?.value;
  
  if (!userCookie) {
    return null;
  }
  
  try {
    return JSON.parse(userCookie);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check if user is authenticated
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { id: urlId } = await params;
  
  // Get data from ViewModel
  const { url, error, visits } = await analyticsViewModel(urlId);
  
  // Handle errors
  if (error && error.includes('not found')) {
    notFound();
  }
  
  if (error) {
    console.error('Error in analytics page:', error);
  }

  // If URL is not found, show error message
  if (!url) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold mb-4">URL not found or access denied</h1>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Analytics for {url.shortCode}</h1>
          <p className="text-muted-foreground">Track the performance of your shortened URL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Original URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={url.originalUrl}>
              {url.originalUrl.length > 30 ? url.originalUrl.substring(0, 30) + '...' : url.originalUrl}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{url.clicks}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{url.formattedCreatedAt}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Click Performance</CardTitle>
            <CardDescription>Views over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AnalyticsChart visits={visits} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Shortened URL Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Short URL</p>
                <p className="font-mono text-sm">{url.shortUrl}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Short Code</p>
                <p className="font-mono text-sm">{url.shortCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Created At</p>
                <p className="text-sm">{url.formattedCreatedAt}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Last Updated</p>
                <p className="text-sm">{url.formattedUpdatedAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
