export interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl?: string;
  createdAt: string;
  updatedAt: string;
  clicks: number;
  userId?: string;
  customSlug?: string;
  expiresAt?: string;
  maxClicks?: number;
  password?: string;
  tags?: string[];
  qrCode?: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customSlug?: string;
  expiresAt?: string;
  maxClicks?: number;
  password?: string;
  tags?: string[];
}

export interface CreateUrlResponse {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  customSlug?: string;
  expiresAt?: string;
  maxClicks?: number;
  password?: boolean;
  tags?: string[];
  qrCode?: string;
}

// Server-side data transformation functions
export function formatUrls(urls: Url[]) {
  return urls.map(url => ({
    ...url,
    formattedCreatedAt: new Date(url.createdAt).toLocaleDateString(),
    formattedUpdatedAt: new Date(url.updatedAt).toLocaleDateString(),
  }));
}

export function formatUrl(url: Url) {
  return {
    ...url,
    formattedCreatedAt: new Date(url.createdAt).toLocaleDateString(),
    formattedUpdatedAt: new Date(url.updatedAt).toLocaleDateString(),
  };
}
