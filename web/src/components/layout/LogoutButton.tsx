'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call the logout API endpoint directly
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh the page to update auth state
        router.push('/');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoggingOut ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
