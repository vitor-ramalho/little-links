'use client';

import { useState, useEffect, useCallback } from 'react';
import { shortenUrl, type FormState } from '@/app/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CreateUrlResponse } from '@/models/url.model';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { XCircle } from 'lucide-react';

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

// Form state shape matches the return type of shortenUrl action

interface AdvancedUrlFormProps {
  isAuthenticated?: boolean;
  className?: string;
  onSuccess?: (data: CreateUrlResponse) => void;
}

export function AdvancedUrlForm({ 
  isAuthenticated = false, 
  className = '',
  onSuccess 
}: AdvancedUrlFormProps) {
  // State for URL shortening form
  const initialState: FormState = { errors: {}, message: '', success: false, data: undefined };
  const [formState, formAction] = useFormState(shortenUrl, initialState);
  
  // Advanced options state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [maxClicksEnabled, setMaxClicksEnabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Handle successful URL creation
  const handleGenerateSuccess = useCallback((data: CreateUrlResponse) => {
    if (onSuccess) {
      onSuccess(data);
    }
    
    toast.success('URL shortened successfully!', {
      description: 'Your link is ready to share.',
      action: {
        label: 'Copy',
        onClick: () => {
          navigator.clipboard.writeText(data.shortUrl);
          toast.success('Copied to clipboard!');
        },
      },
    });
  }, [onSuccess]);
  
  // Check for successful URL creation in formState and handle it
  useEffect(() => {
    if (formState.success && formState.data) {
      handleGenerateSuccess(formState.data);
    }
  }, [formState, handleGenerateSuccess]);
  
  // Handle adding a tag
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };
  
  // Handle removing a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle key press for tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      addTag();
    }
  };
  
  // Create a wrapper around formAction to include advanced options
  const handleSubmit = async (formData: FormData) => {
    // Add advanced options to form data
    if (date) {
      formData.append('expiresAt', date.toISOString());
    }
    
    if (passwordEnabled) {
      const password = formData.get('password') as string;
      if (password) {
        formData.append('password', password);
      }
    }
    
    if (maxClicksEnabled) {
      const maxClicks = formData.get('maxClicks') as string;
      if (maxClicks) {
        formData.append('maxClicks', maxClicks);
      }
    }
    
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    
    // Call the original form action
    formAction(formData);
  };
  
  return (
    <form action={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label htmlFor="originalUrl" className="text-sm font-medium">
          Enter your long URL
        </label>
        <Input
          name="originalUrl"
          placeholder="https://example.com/very/long/url/that/needs/shortening"
          className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          required
        />
      </div>
      
      {isAuthenticated && (
        <div className="space-y-2">
          <label htmlFor="customSlug" className="text-sm font-medium">
            Custom back-half (optional)
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">littlelink.com/</span>
            <Input
              name="customSlug"
              placeholder="my-custom-url"
              className="rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          {formState.errors?.customSlug && (
            <p className="text-red-500 text-sm">{formState.errors.customSlug}</p>
          )}
        </div>
      )}
      
      {isAuthenticated && (
        <Accordion type="single" collapsible>
          <AccordionItem value="advanced-options">
            <AccordionTrigger className="text-sm font-medium">
              Advanced Options
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {/* Expiration Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expiration Date (Optional)
                </label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select expiration date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {date && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-gray-500 hover:text-gray-700"
                      onClick={() => setDate(undefined)}
                      type="button"
                    >
                      Clear date
                    </Button>
                  )}
                </div>
              </div>

              {/* Password Protection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-protection" className="text-sm font-medium">
                    Password Protection
                  </Label>
                  <Switch
                    id="password-protection"
                    checked={passwordEnabled}
                    onCheckedChange={setPasswordEnabled}
                  />
                </div>
                {passwordEnabled && (
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter password for this link"
                    className="rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                )}
              </div>

              {/* Maximum Clicks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-clicks" className="text-sm font-medium">
                    Maximum Clicks
                  </Label>
                  <Switch
                    id="max-clicks"
                    checked={maxClicksEnabled}
                    onCheckedChange={setMaxClicksEnabled}
                  />
                </div>
                {maxClicksEnabled && (
                  <Input
                    name="maxClicks"
                    type="number"
                    min="1"
                    placeholder="Number of maximum clicks"
                    className="rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags (Optional)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    placeholder="Add tags and press Enter"
                    className="rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTag}
                    disabled={!tagInput}
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                        {tag}
                        <XCircle 
                          className="h-4 w-4 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      {formState.errors?.url && (
        <p className="text-red-500 text-sm">{formState.errors.url}</p>
      )}
      
      {formState.message && !formState.success && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-500 dark:text-red-300">
          {formState.message}
        </div>
      )}
      
      <SubmitButton />
    </form>
  );
}
