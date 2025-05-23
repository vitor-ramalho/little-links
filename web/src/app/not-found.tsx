import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          404
        </span>
      </div>
      <h1 className="text-4xl font-bold mb-4">Page not found</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          asChild
          className="bg-gradient-to-r from-primary to-accent text-white"
        >
          <Link href="/">Go back home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
