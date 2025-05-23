'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUrlStore } from '@/viewmodels/url.viewmodel';
import { toast } from 'sonner';

// Define the form schema
const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' })
});

type FormValues = z.infer<typeof formSchema>;

export function UrlShortenerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { loading, shortenedUrl, error, shortenUrl, reset } = useUrlStore();
  const [copied, setCopied] = useState(false);

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      const result = await shortenUrl(values.url);
      
      // If successful and callback exists, call it
      if (result && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already handled in the viewmodel
      console.error('Form submission error:', error);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    if (!shortenedUrl) return;
    
    try {
      await navigator.clipboard.writeText(shortenedUrl.shortUrl);
      setCopied(true);
      toast('URL copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast('Failed to copy URL');
    }
  };

  // Reset the form and state
  const handleReset = () => {
    form.reset();
    reset();
    setCopied(false);
  };

  return (
    <Card className="w-full bg-white shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-medium">Shorten Your URL</CardTitle>
        <CardDescription>
          Enter a long URL to get a short link.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!shortenedUrl ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/very/long/url" 
                        {...field} 
                        className="h-12 rounded-xl"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-black hover:bg-neutral-800 transition-colors"
                disabled={loading}
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <p className="text-sm text-neutral-500 mb-1">Your shortened URL:</p>
              <p className="font-medium break-all">{shortenedUrl.shortUrl}</p>
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
                className="h-12 rounded-xl border-neutral-200 hover:bg-neutral-50 transition-colors"
                onClick={handleReset}
              >
                Shorten Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {error && (
        <CardFooter>
          <p className="text-sm text-red-500">{error}</p>
        </CardFooter>
      )}
    </Card>
  );
}
