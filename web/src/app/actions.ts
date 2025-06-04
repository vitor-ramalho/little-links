'use server';

import { CreateUrlRequest, CreateUrlResponse } from "@/models/url.model";
import { UrlService } from "@/services/url.service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schema
const urlSchema = z.object({
  url: z.string()
    .min(1, { message: 'URL is required' })
    .max(2000, { message: 'URL is too long (maximum 2000 characters)' })
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL format. Must be a valid HTTP or HTTPS URL.' }
    )
    .refine(
      (url) => !url.includes('ll.ink'),
      { message: 'Cannot shorten our own URLs' }
    ),
  
  customSlug: z.string().optional(),
  expiresAt: z.string().optional(),
  maxClicks: z.number().positive().optional(),
  password: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type FormState = {
  errors?: {
    url?: string[];
    customSlug?: string[];
    expiresAt?: string[];
    maxClicks?: string[];
    password?: string[];
    tags?: string[];
  };
  message?: string;
  success?: boolean;
  data?: CreateUrlResponse;
};

export async function shortenUrl(prevState: FormState, formData: FormData): Promise<FormState> {
  // Extract form data
  const originalUrl = formData.get('originalUrl') as string;
  const customSlug = formData.get('customSlug') as string;
  const expiresAt = formData.get('expiresAt') as string;
  const maxClicksStr = formData.get('maxClicks') as string;
  const password = formData.get('password') as string;
  const tagsStr = formData.get('tags') as string;
  
  // If no URL provided (like when resetting the form), return initial state
  if (!originalUrl) {
    return { 
      errors: {},
      message: '',
      success: false
    };
  }
  
  // Validate the URL
  const validationResult = urlSchema.safeParse({ 
    url: originalUrl,
    customSlug: customSlug || undefined,
  });
  
  if (!validationResult.success) {
    return { 
      errors: {
        url: validationResult.error.flatten().fieldErrors.url || ['Invalid URL format'],
        customSlug: validationResult.error.flatten().fieldErrors.customSlug
      },
      message: 'Please enter a valid URL',
      success: false
    };
  }
  
  try {
    // Create the request object with advanced options
    const request: CreateUrlRequest = { originalUrl };
    
    // Add custom slug if provided
    if (customSlug) {
      request.customSlug = customSlug;
    }
    
    // Add expiration date if provided
    if (expiresAt) {
      request.expiresAt = expiresAt;
    }
    
    // Add maximum clicks if provided
    if (maxClicksStr) {
      request.maxClicks = parseInt(maxClicksStr, 10);
    }
    
    // Add password if provided
    if (password) {
      request.password = password;
    }
    
    // Add tags if provided
    if (tagsStr) {
      try {
        request.tags = JSON.parse(tagsStr);
      } catch (error) {
        console.error('Error parsing tags:', error);
      }
    }
    
    // Check if the user is authenticated by looking for the auth token in cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    // Call the service to shorten the URL, passing the auth token if available
    const data = await UrlService.shortenUrl(request, authToken);
    
    // Revalidate the path to ensure fresh data
    revalidatePath('/');
    
    // Return the successful result
    return { 
      success: true, 
      message: 'URL shortened successfully!',
      data
    };
  } catch (error) {
    // Handle errors
    console.error('Error shortening URL:', error);
    
    // Return a standard error message for consistency 
    return { 
      success: false, 
      message: 'Failed to shorten URL. Please try again.',
    };
  }
}
