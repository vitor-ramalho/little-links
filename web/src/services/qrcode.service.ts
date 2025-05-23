'use server';

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createCanvas } from 'canvas';
import QRCode from 'qrcode';

export interface QRCodeOptions {
  color?: string;
  backgroundColor?: string;
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high';
}

/**
 * Generate a QR code image and return its path relative to the public directory
 * 
 * @param url The URL to encode in the QR code
 * @param options Styling options for the QR code
 * @returns Path to the generated QR code image
 */
export async function generateQRCode(
  url: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  // Generate a unique filename based on URL and options
  const hash = crypto
    .createHash('md5')
    .update(url + JSON.stringify(options))
    .digest('hex');
  
  const fileName = `qrcode-${hash}.png`;
  const dirPath = path.join(process.cwd(), 'public', 'qrcodes');
  const filePath = path.join(dirPath, fileName);
  const publicPath = `/qrcodes/${fileName}`;
  
  try {
    // Ensure directory exists
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      console.error('Failed to create QR code directory:', err);
    }
    
    // Check if file already exists
    try {
      await fs.access(filePath);
      console.log('QR code already exists, returning existing path');
      return publicPath;
    } catch {
      // File doesn't exist, continue with generation
    }
    
    // Default options
    const {
      color = '#000000',
      backgroundColor = '#FFFFFF',
      size = 300,
      margin = 4,
      errorCorrectionLevel = 'quartile'
    } = options;
    
    // Create canvas for QR code
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // Generate QR code
    await QRCode.toCanvas(canvas, url, {
      width: size - margin * 2,
      margin: margin,
      color: {
        dark: color,
        light: backgroundColor,
      },
      errorCorrectionLevel: errorCorrectionLevel,
    });
    
    // Save the QR code as a PNG file
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filePath, buffer);
    
    return publicPath;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}
