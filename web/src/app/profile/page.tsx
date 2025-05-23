// filepath: /Users/vitorramalho/Documents/Projects/little-link/web/src/app/profile/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

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

export default async function ProfilePage() {
  // Check if user is authenticated
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
            <p className="text-lg">{user.name}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-lg">{user.email}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Account ID</h3>
            <p className="text-lg font-mono">{user.id}</p>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
            
            <form action="/api/auth/logout" method="post">
              <Button variant="destructive" type="submit">Logout</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
