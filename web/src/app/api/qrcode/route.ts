import { NextRequest, NextResponse } from 'next/server';
import { generateQRCode, QRCodeOptions } from '@/services/qrcode.service';
import { z } from 'zod';

// Validate the request body
const qrCodeSchema = z.object({
  url: z.string().url("A valid URL is required"),
  options: z.object({
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
    backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
    size: z.number().int().min(50).max(1000).optional(),
    margin: z.number().int().min(0).max(50).optional(),
    errorCorrectionLevel: z.enum(['low', 'medium', 'quartile', 'high']).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = qrCodeSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.flatten();
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    
    const { url, options = {} } = result.data;
    
    // Generate QR code
    const qrCodePath = await generateQRCode(url, options as QRCodeOptions);
    
    // Return the QR code path
    return NextResponse.json({
      success: true,
      qrCode: qrCodePath,
      url: url,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate QR code'
    }, { status: 500 });
  }
}
