'use client';

import { useState } from 'react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, RefreshCw } from 'lucide-react';
import Image from 'next/image';

const DEFAULT_COLORS = [
  '#000000', '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#6B7280', '#877EFF', '#0EA5E9'
];

interface QRCodeCustomizerProps {
  url: string;
  onClose: () => void;
  defaultSize?: number;
}

export function QRCodeCustomizer({ url, onClose, defaultSize = 240 }: QRCodeCustomizerProps) {
  const [size, setSize] = useState(defaultSize);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [withLogo, setWithLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState('/link.svg');
  const [logoSize, setLogoSize] = useState(40);

  // Reset to defaults
  const handleReset = () => {
    setFgColor('#000000');
    setBgColor('#FFFFFF');
    setSize(defaultSize);
    setWithLogo(true);
    setLogoUrl('/link.svg');
    setLogoSize(40);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="space-y-4">
          <Tabs defaultValue="colors">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="foreground">Foreground Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="foreground"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="font-mono"
                    maxLength={7}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      style={{ backgroundColor: color }}
                      onClick={() => setFgColor(color)}
                      aria-label={`Set foreground color to ${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="background">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="background"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono"
                    maxLength={7}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['#FFFFFF', '#F3F4F6', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#FEE2E2'].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      style={{ backgroundColor: color }}
                      onClick={() => setBgColor(color)}
                      aria-label={`Set background color to ${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="size"
                    type="range"
                    min="160"
                    max="320"
                    step="20"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="w-12 text-right font-mono">{size}px</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="logo" className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="with-logo"
                  checked={withLogo}
                  onCheckedChange={setWithLogo}
                />
                <Label htmlFor="with-logo">Include Logo</Label>
              </div>
              
              {withLogo && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo-url"
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="URL of the logo image"
                        className="flex-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="h-10 w-10">
                            <Paintbrush className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="end">
                          <div className="grid grid-cols-3 gap-2 p-2">
                            {['/link.svg', '/globe.svg', '/window.svg', '/file.svg'].map((src) => (
                              <button
                                key={src}
                                className="p-2 rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                onClick={() => setLogoUrl(src)}
                              >
                                <Image src={src} alt={`Logo option ${src}`} className="w-full h-8 object-contain" width={32} height={32} />
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo-size">Logo Size</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo-size"
                        type="range"
                        min="20"
                        max="80"
                        step="5"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="w-12 text-right font-mono">{logoSize}px</span>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <QRCodeGenerator
          url={url}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          logoUrl={withLogo ? logoUrl : undefined}
          logoSize={logoSize}
          showDownload={true}
        />
      </div>
    </div>
  );
}
