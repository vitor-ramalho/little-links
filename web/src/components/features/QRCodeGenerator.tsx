'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Define interfaces for QRCodeStyling
interface QRCodeStylingOptions {
  width: number;
  height: number;
  type: string;
  data: string;
  margin?: number;
  dotsOptions?: {
    color: string;
    type?: string;
  };
  cornersSquareOptions?: {
    type?: string;
  };
  cornersDotOptions?: {
    type?: string;
  };
  backgroundOptions?: {
    color: string;
  };
  image?: string;
  imageOptions?: {
    crossOrigin: string;
    margin: number;
    imageSize: number;
  };
}

interface QRCodeStylingInstance {
  append: (element: HTMLElement) => void;
  update: (options: Partial<QRCodeStylingOptions>) => void;
  download: (options: { name: string; extension: string }) => void;
}

// Type for the constructor
type QRCodeStylingConstructor = new (options: QRCodeStylingOptions) => QRCodeStylingInstance;

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  logoUrl?: string;
  logoSize?: number;
  showDownload?: boolean;
}

export function QRCodeGenerator({
  url,
  size = 200,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  logoUrl,
  logoSize = 50,
  showDownload = true,
}: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStylingInstance | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Dynamically import QRCodeStyling
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!qrRef.current) return;
      
      if (!qrCodeRef.current) {
        const options: QRCodeStylingOptions = {
          width: size,
          height: size,
          type: 'svg',
          data: url,
          dotsOptions: {
            color: fgColor,
            type: 'rounded',
          },
          backgroundOptions: {
            color: bgColor,
          },
          cornersSquareOptions: {
            type: 'extra-rounded',
          },
          cornersDotOptions: {
            type: 'dot',
          },
        };
        
        if (logoUrl) {
          options.image = logoUrl;
          options.imageOptions = {
            crossOrigin: 'anonymous',
            margin: 5,
            imageSize: logoSize / size,
          };
        }
        
        qrCodeRef.current = new (QRCodeStyling as unknown as QRCodeStylingConstructor)(options);
      } else {
        qrCodeRef.current.update({
          data: url,
          dotsOptions: {
            color: fgColor,
          },
          backgroundOptions: {
            color: bgColor,
          },
        });
      }

      // Clear existing content and append new QR code
      while (qrRef.current.firstChild) {
        qrRef.current.removeChild(qrRef.current.firstChild);
      }

      qrCodeRef.current.append(qrRef.current);
    });
  }, [url, size, bgColor, fgColor, logoUrl, logoSize]);

  const handleDownload = () => {
    if (qrCodeRef.current) {
      const hostname = url.includes('://') ? new URL(url).hostname : 'link';
      qrCodeRef.current.download({
        name: `qrcode-${hostname}`,
        extension: 'png',
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={qrRef} 
        className="bg-white p-3 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 min-w-[100px] min-h-[100px]"
      />
      {showDownload && (
        <Button
          variant="outline" 
          size="sm"
          onClick={handleDownload}
          className="mt-4 text-xs gap-1"
        >
          <Download className="h-3 w-3" />
          Download QR
        </Button>
      )}
    </div>
  );
}
