'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Url } from '@/models/url.model';
import { CopyLinkButton } from './CopyLinkButton';
import { BarChart2, Calendar, Eye, Lock, QrCode, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

// Import QR code components with no SSR
const QRCodeGenerator = dynamic(() => import('./QRCodeGenerator').then(mod => mod.QRCodeGenerator), { 
  ssr: false 
});
const QRCodeCustomizer = dynamic(() => import('./QRCodeCustomizer').then(mod => mod.QRCodeCustomizer), { 
  ssr: false 
});
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface LinkCardProps {
  url: Url;
  onOpenAnalytics?: (id: string) => void;
}

export function LinkCard({ url, onOpenAnalytics }: LinkCardProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Format the date relative to now
  const formattedDate = url.createdAt 
    ? formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })
    : '';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border border-neutral-200 dark:border-neutral-800">
      <div className="p-4 flex flex-col">
        {/* URL header */}
        <div className="flex items-start justify-between mb-2">
          <div className="overflow-hidden">
            <h3 className="font-medium text-lg truncate">{url.shortCode}</h3>
            <a 
              href={url.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-neutral-500 dark:text-neutral-400 truncate block hover:underline"
            >
              {url.originalUrl}
            </a>
          </div>
          
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsQrOpen(true)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* URL details */}
        <div className="flex flex-wrap items-center text-xs mt-2 gap-2">
          <div className="flex items-center gap-1 text-neutral-500">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500">
            <Eye className="h-3 w-3" />
            <span>{url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}</span>
          </div>
          {url.password && (
            <div className="flex items-center gap-1 text-neutral-500">
              <Lock className="h-3 w-3" />
              <span>Protected</span>
            </div>
          )}
          {url.maxClicks && (
            <div className="flex items-center gap-1 text-neutral-500">
              <BarChart2 className="h-3 w-3" />
              <span>{url.clicks}/{url.maxClicks} clicks</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {url.tags && url.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {url.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <CopyLinkButton 
            url={url.shortUrl || ''} 
            variant="outline" 
            className="text-xs h-8 flex-1"
          />
          
          {onOpenAnalytics && (
            <Button 
              variant="ghost"
              size="sm" 
              className="text-xs h-8"
              onClick={() => onOpenAnalytics(url.id)}
            >
              <BarChart2 className="h-3 w-3 mr-1" />
              Stats
            </Button>
          )}
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className={isCustomizing ? "sm:max-w-3xl" : "sm:max-w-md"}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>QR Code for {url.shortCode}</DialogTitle>
                <DialogDescription>
                  Scan this QR code with your phone camera to open the link
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="flex items-center gap-1"
              >
                <Palette className="h-4 w-4" />
                {isCustomizing ? "Simple View" : "Customize"}
              </Button>
            </div>
          </DialogHeader>
          
          {isCustomizing ? (
            <QRCodeCustomizer 
              url={url.shortUrl || ''} 
              onClose={() => setIsCustomizing(false)}
            />
          ) : (
            <>
              <div className="flex items-center justify-center p-6">
                {url.qrCode && !isCustomizing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-60 h-60 bg-white p-3 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
                      <QRCodeGenerator
                        url={url.shortUrl || ''}
                        size={240}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        showDownload={false}
                        logoUrl="/link.svg"
                        logoSize={40}
                      />
                    </div>
                    <a
                      href={url.qrCode}
                      download={`qrcode-${url.shortCode}.png`}
                      className="mt-4 inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-center border border-neutral-200 rounded-md hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download QR
                    </a>
                  </div>
                ) : (
                  <QRCodeGenerator
                    url={url.shortUrl || ''}
                    size={240}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    showDownload={true}
                    logoUrl="/link.svg"
                    logoSize={40}
                  />
                )}
              </div>
              <div className="text-center mt-2">
                <p className="text-sm text-neutral-500 break-all px-6">{url.shortUrl}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
