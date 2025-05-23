import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { LogoutButton } from './LogoutButton';
import { ThemeToggle } from './ThemeToggle';

interface HeaderServerProps {
  showNav?: boolean;
}

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

export async function HeaderServer({ showNav = true }: HeaderServerProps) {
  const user = await getUser();
  
  return (
    <header className="border-b border-neutral-100 shadow-sm bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group pl-0">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">LittleLink</span>
          </Link>
          
          {showNav && user && (
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:bg-primary after:h-[2px] after:w-0 hover:after:w-full after:transition-all after:duration-300">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:bg-primary after:h-[2px] after:w-0 hover:after:w-full after:transition-all after:duration-300">
                Profile
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white transition-all duration-300 shadow-md hover:shadow-lg">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
