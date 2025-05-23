'use client';

import { useState, useEffect } from 'react';
import { shortenUrl } from '@/app/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UrlServiceClient } from '@/services/url.service';
import { CreateUrlResponse } from '@/models/url.model';

// Helper component for the submit button
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]"
      disabled={pending}
    >
      {pending ? 'Shortening...' : 'Shorten URL'}
    </Button>
  );
}

// Define the shape of form state
type FormState = {
  errors?: {
    url?: string[];
  };
  message?: string;
  success?: boolean;
  data?: CreateUrlResponse;
};

interface ShortenUrlFormProps {
  isAuthenticated?: boolean;
  className?: string;
  onSuccess?: (data: CreateUrlResponse) => void;
}

export function ShortenUrlForm({ 
  isAuthenticated = false, 
  className = '',
  onSuccess 
}: ShortenUrlFormProps) {
  // State for URL shortening form
  const initialState = { errors: {}, message: '', success: false, data: undefined };
  
  // Create a wrapper around the server action that includes the isAuthenticated flag for client-side calls
  const formActionWithAuth = async (prevState: FormState, formData: FormData) => {
    // For client-side interactive validations and additional features
    // We'll use the server action for the actual submission to ensure server-side validation
    return shortenUrl(prevState, formData);
  };
  
  const [state, formAction] = useFormState(formActionWithAuth, initialState);
  const [copied, setCopied] = useState(false);
  
  // Use effect to show toast notifications for errors and success
  useEffect(() => {
    // Show validation errors
    if (state.errors?.url && state.errors.url.length > 0) {
      toast.error(state.errors.url[0]);
    }
    // Show general error message
    else if (!state.success && state.message) {
      toast.error(state.message);
    }
    // Show success message
    else if (state.success && state.message) {
      toast.success(state.message);
      // Call onSuccess callback if provided
      if (onSuccess && state.data) {
        onSuccess(state.data);
      }
    }
  }, [state, onSuccess]);
  
  // Copy shortened URL to clipboard
  const copyToClipboard = async () => {
    if (state.data?.shortUrl) {
      try {
        await navigator.clipboard.writeText(state.data.shortUrl);
        setCopied(true);
        toast.success('Copied to clipboard');
      } catch {
        toast.error('Failed to copy to clipboard');
      }
    }
  };
  
  // Reset form
  const resetForm = () => {
    // Create a new empty FormData without the URL
    const emptyForm = new FormData();
    // Reset the form and clear copied state
    formAction(emptyForm);
    setCopied(false);
  };

  return (
    <Card className={`w-full bg-white shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Shorten Your URL</CardTitle>
        <CardDescription>
          Enter a long URL to get a short link. {isAuthenticated && (
            <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-primary animate-fadeIn">
              Authenticated
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!state.success ? (
          <form action={formAction} className="space-y-4" onSubmit={async (e) => {
            // Validate form before submission
            const formData = new FormData(e.currentTarget);
            const url = formData.get('url') as string;
            
            // Client-side validation
            if (!url) {
              e.preventDefault();
              toast.error('Please enter a URL');
              return;
            }
            
            // Basic URL format check
            try {
              const parsed = new URL(url);
              // Check for HTTP/HTTPS protocols only
              if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                e.preventDefault();
                toast.error('URL must use HTTP or HTTPS protocol');
                return;
              }
              
              // If this is a client-side interaction in environments where 
              // we want to show immediate feedback (like dashboard) while the server
              // action runs, we can use the client service directly
              if (typeof window !== 'undefined' && isAuthenticated) {
                console.log('Using client-side service with auth:', isAuthenticated);
                
                try {
                  // This is a parallel client-side request for better UX in the dashboard
                  // The server action will still run for consistency
                  UrlServiceClient.shortenUrl(
                    { originalUrl: url }, 
                    isAuthenticated
                  ).then(result => {
                    console.log('Client-side shortening result:', result);
                  });
                } catch (error) {
                  console.error('Client-side shortening error:', error);
                  // We continue with the form submission as the server will handle it
                }
              }
            } catch {
              e.preventDefault();
              toast.error('Please enter a valid URL');
              return;
            }
            
            // Check if trying to shorten our own URLs
            if (url.includes('ll.ink')) {
              e.preventDefault();
              toast.error('Cannot shorten our own URLs');
              return;
            }
            
            // Check for extremely long URLs
            if (url.length > 2000) {
              e.preventDefault();
              toast.error('URL is too long (maximum 2000 characters)');
              return;
            }
          }}>
            <div className="space-y-2">
              <Input 
                name="url"
                placeholder="https://example.com/very/long/url" 
                className="h-12 rounded-xl transition-all duration-300 border-neutral-200 focus:border-primary/50 focus:shadow-md"
                aria-invalid={!!state.errors?.url}
                aria-describedby={state.errors?.url ? "url-error" : undefined}
                aria-required="true"
                required
                pattern="https?://.*"
                title="URL must start with http:// or https://"
              />
              
              {state.errors?.url && (
                <p id="url-error" className="text-sm font-medium text-red-500" role="alert">
                  {state.errors.url[0]}
                </p>
              )}
            </div>
            
            <SubmitButton />
            
            {!state.success && state.message && !state.errors?.url && (
              <p className="text-sm text-red-500 mt-2" role="alert">
                {state.message}
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <p className="text-sm text-neutral-500 mb-1">Your shortened URL:</p>
              <p className="font-medium break-all">{state.data?.shortUrl}</p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                className="flex-1 h-12 rounded-xl bg-black hover:bg-neutral-800 transition-colors"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              
              <Button 
                variant="outline"
                className="h-12 rounded-xl"
                onClick={resetForm}
              >
                Shorten Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
