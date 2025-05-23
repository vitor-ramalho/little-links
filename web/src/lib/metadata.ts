import type { Metadata, Viewport } from 'next';

// Base metadata configuration
const siteConfig = {
  name: 'LittleLink',
  description: 'Simple, modern URL shortening with powerful analytics',
  url: 'https://ll.ink', // Replace with your actual domain
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - URL Shortener`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [
    {
      name: 'LittleLink Team',
    },
  ],
  creator: 'LittleLink',
  publisher: 'LittleLink',
  robots: {
    index: true,
    follow: true,
  },
  applicationName: siteConfig.name,
  keywords: [
    'URL shortener',
    'link management',
    'link analytics',
    'shortened URLs',
    'custom links',
    'URL tracking',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/twitter-image.png`],
    creator: '@littlelink', // Replace with your Twitter handle
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  width: 'device-width',
  initialScale: 1,
};
