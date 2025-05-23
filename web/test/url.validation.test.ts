import { describe, it, expect, vi, afterEach } from 'vitest';
import { shortenUrl } from '../src/app/actions';
import { UrlService } from '../src/services/url.service';

// Mock URL service
vi.mock('@/services/url.service', () => ({
  UrlService: {
    shortenUrl: vi.fn()
  }
}));

describe('URL Validation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should reject URLs from our own domain', async () => {
    // Mock form data
    const formData = new FormData();
    formData.append('url', 'https://ll.ink/abc123');
    
    // Mock previous state
    const prevState = { errors: {}, message: '', success: false };
    
    // Call the action
    const result = await shortenUrl(prevState, formData);
    
    // Verify validation error
    expect(result.success).toBe(false);
    expect(result.errors?.url).toBeDefined();
    expect(result.errors?.url?.[0]).toContain('Cannot shorten our own URLs');
    // Ensure service wasn't called
    expect(UrlService.shortenUrl).not.toHaveBeenCalled();
  });
  
  it('should reject malformed URLs', async () => {
    const testCases = [
      'not-a-url',
      'example.com',        // Missing protocol
      'ftp://example.com'   // Non-HTTP protocol
    ];
    
    for (const testUrl of testCases) {
      // Mock form data
      const formData = new FormData();
      formData.append('url', testUrl);
      
      // Mock previous state
      const prevState = { errors: {}, message: '', success: false };
      
      // Mock service to throw if called - should never happen for this test case
      vi.mocked(UrlService.shortenUrl).mockImplementation(() => {
        throw new Error('This should not be called');
      });
      
      // Call the action
      const result = await shortenUrl(prevState, formData);
      
      // Verify validation error
      expect(result.success).toBe(false);
      expect(result.errors?.url).toBeDefined();
      
      // Ensure service wasn't called for this test case
      expect(UrlService.shortenUrl).not.toHaveBeenCalled();
      
      // Clear mock calls for the next iteration
      vi.clearAllMocks();
    }
  });
  
  it('should accept valid URLs with different domains', async () => {
    const validUrls = [
      'https://example.com',
      'https://subdomain.example.com/path?query=param#fragment',
      'http://example.org:8080/path/',
      'https://www.example.net/very/long/path/with/multiple/segments'
    ];
    
    // Mock service response
    vi.mocked(UrlService.shortenUrl).mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      shortUrl: 'https://ll.ink/abc123'
    });
    
    for (const testUrl of validUrls) {
      // Mock form data
      const formData = new FormData();
      formData.append('url', testUrl);
      
      // Mock previous state
      const prevState = { errors: {}, message: '', success: false };
      
      // Call the action
      const result = await shortenUrl(prevState, formData);
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
      // Ensure service was called
      expect(UrlService.shortenUrl).toHaveBeenCalled();
      
      // Clear mock for next iteration
      vi.clearAllMocks();
    }
  });
  
  it('should reject very long URLs', async () => {
    // Create an extremely long URL (over 2000 characters)
    const longPath = 'a'.repeat(2100);  // Increased to 2100 to exceed our 2000 limit
    const longURL = `https://example.com/${longPath}`;
    
    // Mock form data
    const formData = new FormData();
    formData.append('url', longURL);
    
    // Mock previous state
    const prevState = { errors: {}, message: '', success: false };
    
    // Call the action
    const result = await shortenUrl(prevState, formData);
    
    // Verify validation error
    expect(result.success).toBe(false);
    expect(result.errors?.url).toBeDefined();
    expect(result.errors?.url?.[0]).toContain('too long');
    
    // Ensure service wasn't called
    expect(UrlService.shortenUrl).not.toHaveBeenCalled();
  });
});
