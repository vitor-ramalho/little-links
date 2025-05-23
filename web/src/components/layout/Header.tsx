'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      // The AuthProvider will handle the redirect to homepage
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="py-4 px-6 border-b border-neutral-100">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-semibold text-xl tracking-tight">LittleLink</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Button variant="link" asChild>
            <Link href="/features" className="text-neutral-700 hover:text-neutral-900">
              Features
            </Link>
          </Button>
          
          <Button variant="link" asChild>
            <Link href="/pricing" className="text-neutral-700 hover:text-neutral-900">
              Pricing
            </Link>
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button variant="link" asChild>
                <Link href="/dashboard" className="text-neutral-700 hover:text-neutral-900">
                  Dashboard
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-neutral-200 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">{user?.name || 'Account'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    disabled={loggingOut}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                asChild 
                variant="outline" 
                className="rounded-full border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              
              <Button 
                asChild 
                className="rounded-full bg-black hover:bg-neutral-800 transition-colors"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
