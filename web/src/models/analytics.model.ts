// Analytics data models for the web frontend

// Single analytics entry
export interface AnalyticsEntry {
  id: string;
  linkId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  source?: string;
  browser?: string;
  os?: string;
  device?: string;
  createdAt: string;
}

// Daily click data
export interface ClickData {
  date: string;
  count: number;
}

// Geographic distribution data
export interface GeoData {
  country: string;
  count: number;
}

// Device type distribution
export interface DeviceData {
  device: string;
  count: number;
}

// Referrer/source distribution
export interface SourceData {
  source: string;
  count: number;
}

// Browser distribution
export interface BrowserData {
  browser: string;
  count: number;
}

// OS distribution
export interface OsData {
  os: string;
  count: number;
}

// Hour of day distribution
export interface HourData {
  hour: number;
  count: number;
}

// Top performing links
export interface TopLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
}

// Complete analytics data for a link
export interface LinkAnalytics {
  totalClicks: number;
  clicksByDate: ClickData[];
  geoDistribution: GeoData[];
  deviceDistribution: DeviceData[];
  referrerDistribution: SourceData[];
  browserDistribution: BrowserData[];
  osDistribution: OsData[];
  hourDistribution: HourData[];
}

// Dashboard analytics data
export interface DashboardAnalytics {
  totalClicks: number;
  clicksByDate: ClickData[];
  topLinks: TopLink[];
  geoDistribution: GeoData[];
  deviceDistribution: DeviceData[];
  referrerDistribution: SourceData[];
  browserDistribution?: BrowserData[];
  osDistribution?: OsData[];
}
