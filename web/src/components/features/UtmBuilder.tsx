'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { addUtmParameters, UtmParameters } from '@/lib/utm-helper';
import { toast } from 'sonner';

interface UtmBuilderProps {
  originalUrl: string;
  onApply?: (url: string) => void;
  className?: string;
}

export function UtmBuilder({ originalUrl, onApply, className = '' }: UtmBuilderProps) {
  const [utmParams, setUtmParams] = useState<UtmParameters>({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });
  
  const [previewUrl, setPreviewUrl] = useState(originalUrl);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUtmParams(prev => ({ ...prev, [name]: value }));
    
    // Update preview URL
    try {
      const updatedUrl = addUtmParameters(originalUrl, {
        ...utmParams,
        [name]: value,
      });
      setPreviewUrl(updatedUrl);
    } catch (error) {
      console.error('Error updating preview URL:', error);
    }
  };
  
  const handleApply = () => {
    try {
      const urlWithUtm = addUtmParameters(originalUrl, utmParams);
      if (onApply) {
        onApply(urlWithUtm);
        toast.success('UTM parameters applied');
      }
    } catch (error) {
      toast.error('Failed to apply UTM parameters');
      console.error('Error applying UTM parameters:', error);
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-neutral-50/70 dark:bg-neutral-800/20 border-b">
        <CardTitle className="text-lg flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          UTM Parameter Builder
        </CardTitle>
        <CardDescription>Add tracking parameters to your URL</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              placeholder="google, facebook, newsletter"
              value={utmParams.source}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medium">Medium</Label>
            <Input
              id="medium"
              name="medium"
              placeholder="cpc, email, social"
              value={utmParams.medium}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign</Label>
            <Input
              id="campaign"
              name="campaign"
              placeholder="summer_sale, product_launch"
              value={utmParams.campaign}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term">Term (Optional)</Label>
            <Input
              id="term"
              name="term"
              placeholder="running+shoes, marketing+tools"
              value={utmParams.term}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="content">Content (Optional)</Label>
            <Input
              id="content"
              name="content"
              placeholder="top-link, image-ad"
              value={utmParams.content}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md overflow-x-auto">
            <code className="text-xs text-neutral-700 dark:text-neutral-300">
              {previewUrl}
            </code>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t bg-neutral-50/70 dark:bg-neutral-800/20 p-4">
        <Button 
          onClick={handleApply}
          className="bg-gradient-to-r from-primary to-accent text-white"
        >
          Apply Parameters
        </Button>
      </CardFooter>
    </Card>
  );
}
