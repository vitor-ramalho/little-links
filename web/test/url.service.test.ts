import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UrlService } from '../src/services/url.service';
import { CreateUrlRequest } from '../src/models/url.model';

describe('URL Service', () => {
  // Setup fetch mock
  let originalFetch: typeof global.fetch;
  
  beforeEach(() => {
    originalFetch = global.fetch;
    // @ts-ignore - Mocking fetch
    global.fetch = vi.fn();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });
  
  it('should handle successful URL shortening', async () => {
    const mockResponse = {
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      shortUrl: 'https://ll.ink/abc123'
    };
    
    // Mock successful fetch response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const request: CreateUrlRequest = { originalUrl: 'https://example.com' };
    const result = await UrlService.shortenUrl(request);
    
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Verify the correct URL is being used
    const expectedUrl = 'http://localhost:3000/api/public/links';
    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(request)
      })
    );
  });
  
  it('should handle API errors with specific status codes', async () => {
    // Test cases for different HTTP status codes
    const errorCases = [
      { status: 400, expectedError: 'Invalid URL format' },
      { status: 429, expectedError: 'Rate limit exceeded. Please try again later.' },
      { status: 409, expectedError: 'This URL has already been shortened' },
      { status: 500, expectedError: 'Server error. Please try again later.' }
    ];
    
    for (const { status, expectedError } of errorCases) {
      // Mock fetch to return the specific error status
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status,
        text: () => Promise.resolve('Error message from server')
      });
      
      const request: CreateUrlRequest = { originalUrl: 'https://example.com' };
      
      await expect(UrlService.shortenUrl(request)).rejects.toThrow(expectedError);
      
      // Verify the correct URL is being used
      const expectedUrl = 'http://localhost:3000/api/public/links';
      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    }
  });
  
  it('should handle network errors', async () => {
    // Mock network error
    global.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    const request: CreateUrlRequest = { originalUrl: 'https://example.com' };
    
    await expect(UrlService.shortenUrl(request)).rejects.toThrow('Network error. Please check your internet connection.');
  });
  
  it('should handle request timeouts', async () => {
    // Mock AbortError for timeout
    global.fetch = vi.fn().mockImplementationOnce(() => {
      throw new DOMException('The operation was aborted', 'AbortError');
    });
    
    const request: CreateUrlRequest = { originalUrl: 'https://example.com' };
    
    await expect(UrlService.shortenUrl(request)).rejects.toThrow('Request timed out. Please try again later.');
  });
});
