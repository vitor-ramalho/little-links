import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardViewModel } from '../src/app/dashboard/viewmodel';
import { UrlService } from '../src/services/url.service';

// Mock the cookies API
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn((name) => {
      if (name === 'auth_token') {
        return { value: 'mock-token' };
      }
      return null;
    })
  })
}));

// Mock the URL service
vi.mock('../src/services/url.service', () => ({
  UrlService: {
    getUserUrls: vi.fn()
  }
}));

describe('Dashboard ViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return formatted URLs and stats', async () => {
    // Mock URL data
    const mockUrls = [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'https://ll.ink/abc123',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        clicks: 10,
        userId: 'user1'
      },
      {
        id: '2',
        originalUrl: 'https://example.org',
        shortCode: 'def456',
        shortUrl: 'https://ll.ink/def456',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        clicks: 5,
        userId: 'user1'
      }
    ];
    
    // Set up the mock implementation
    vi.mocked(UrlService.getUserUrls).mockResolvedValue(mockUrls);
    
    // Call the viewmodel
    const result = await dashboardViewModel();
    
    // Check if service was called with token
    expect(UrlService.getUserUrls).toHaveBeenCalledWith('mock-token');
    
    // Verify results
    expect(result.urls).toHaveLength(2);
    expect(result.stats.totalUrls).toBe(2);
    expect(result.stats.totalClicks).toBe(15);
    expect(result.stats.averageClicksPerUrl).toBe(8);
    
    // Check formatting
    expect(result.urls[0].formattedCreatedAt).toBeDefined();
    expect(result.urls[1].formattedUpdatedAt).toBeDefined();
  });
  
  it('should handle empty URL list', async () => {
    // Mock empty URL array
    vi.mocked(UrlService.getUserUrls).mockResolvedValue([]);
    
    // Call the viewmodel
    const result = await dashboardViewModel();
    
    // Verify results for empty data
    expect(result.urls).toHaveLength(0);
    expect(result.stats.totalUrls).toBe(0);
    expect(result.stats.totalClicks).toBe(0);
    expect(result.stats.averageClicksPerUrl).toBe(0);
  });
  
  it('should handle errors', async () => {
    // Mock error
    vi.mocked(UrlService.getUserUrls).mockRejectedValue(new Error('Service error'));
    
    // Call the viewmodel
    const result = await dashboardViewModel();
    
    // Verify error handling
    expect(result.error).toBe('Failed to load dashboard data');
    expect(result.urls).toHaveLength(0);
    expect(result.stats.totalUrls).toBe(0);
  });
});
