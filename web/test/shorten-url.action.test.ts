import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shortenUrl } from '../src/app/actions';
import { UrlService } from '../src/services/url.service';

// Mock the revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

// Mock the URL service
vi.mock('../src/services/url.service', () => ({
  UrlService: {
    shortenUrl: vi.fn()
  }
}));

describe('URL Shorten Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should successfully shorten a valid URL', async () => {
    // Mock form data
    const formData = new FormData();
    formData.append('url', 'https://example.com');
    
    // Mock previous state
    const prevState = { errors: {}, message: '', success: false };
    
    // Mock service response
    const mockResponse = {
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      shortUrl: 'https://ll.ink/abc123'
    };
    
    // Set up the mock implementation
    vi.mocked(UrlService.shortenUrl).mockResolvedValue(mockResponse);
    
    // Call the action
    const result = await shortenUrl(prevState, formData);
    
    // Check if service was called with correct data
    expect(UrlService.shortenUrl).toHaveBeenCalledWith({ originalUrl: 'https://example.com' });
    
    // Verify success result
    expect(result.success).toBe(true);
    expect(result.message).toBe('URL shortened successfully!');
    expect(result.data).toEqual(mockResponse);
  });
  
  it('should return validation errors for invalid URLs', async () => {
    // Mock form data with invalid URL
    const formData = new FormData();
    formData.append('url', 'not-a-valid-url');
    
    // Mock previous state
    const prevState = { errors: {}, message: '', success: false };
    
    // Call the action
    const result = await shortenUrl(prevState, formData);
    
    // Verify validation error result
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.url).toBeDefined();
    
    // Make sure service was not called
    expect(UrlService.shortenUrl).not.toHaveBeenCalled();
  });
  
  it('should handle empty form data gracefully', async () => {
    // Mock empty form data (like when resetting)
    const formData = new FormData();
    
    // Mock previous state
    const prevState = { errors: {}, message: '', success: false };
    
    // Call the action
    const result = await shortenUrl(prevState, formData);
    
    // Verify it returns initial state
    expect(result.success).toBe(false);
    expect(result.errors).toEqual({});
    expect(result.message).toBe('');
    
    // Make sure service was not called
    expect(UrlService.shortenUrl).not.toHaveBeenCalled();
  });
  
  it('should handle service errors', async () => {
    // Mock form data
    const formData = new FormData();
    formData.append('url', 'https://example.com');
    
    // Mock previous state
    const prevState = { errors: {}, message: '', success: false };
    
    // Mock service error
    vi.mocked(UrlService.shortenUrl).mockRejectedValue(new Error('Service error'));
    
    // Call the action
    const result = await shortenUrl(prevState, formData);
    
    // Verify error handling
    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to shorten URL. Please try again.');
  });
});
