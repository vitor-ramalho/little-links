'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-3">Something went wrong!</h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-md">
        We apologize for the inconvenience. Please try again or contact support if the problem persists.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={reset}
          className="bg-gradient-to-r from-primary to-accent text-white"
        >
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
