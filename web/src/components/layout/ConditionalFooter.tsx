'use client';

import { Footer } from './Footer';
import { usePathname } from 'next/navigation';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages and other internal pages
  const hideFooterPaths = [
    '/dashboard',
    '/analytics',
    '/settings',
    '/profile',
  ];
  
  // Check if current path starts with any of the paths in hideFooterPaths
  const shouldHideFooter = hideFooterPaths.some(path => 
    pathname.startsWith(path)
  );
  
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer />;
}
