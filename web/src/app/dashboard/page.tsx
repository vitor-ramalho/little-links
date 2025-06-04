import { dashboardViewModel } from './viewmodel';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/features/DashboardClient';

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

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get data from ViewModel
  const { urls, stats, analytics, error } = await dashboardViewModel();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Manage your links and view analytics.
        </p>
      </div>
      
      {error ? (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-red-500 dark:text-red-300">
          <p>{error}</p>
        </div>
      ) : (
        <DashboardClient 
          initialUrls={urls} 
          stats={stats} 
          analytics={analytics}
        />
      )}
    </div>
  );
}