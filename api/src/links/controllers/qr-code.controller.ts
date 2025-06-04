import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QrCodeService } from '../services/qr-code.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('qrcode')
@Controller('qrcode')
export class QrCodeController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly configService: ConfigService,
  ) {}

  @Get('generate')
  @ApiOperation({ summary: 'Generate a QR code for a URL' })
  @ApiQuery({
    name: 'url',
    description: 'URL to encode in QR code',
    required: true,
  })
  @ApiQuery({
    name: 'size',
    description: 'Size of QR code in pixels',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'margin',
    description: 'Margin around QR code',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'errorCorrectionLevel',
    description: 'Error correction level (L, M, Q, H)',
    required: false,
    enum: ['L', 'M', 'Q', 'H'],
  })
  @ApiResponse({
    status: 200,
    description: 'QR code path',
  })
  async generateQrCode(
    @Query('url') url: string,
    @Query('size') size?: number,
    @Query('margin') margin?: number,
    @Query('errorCorrectionLevel') errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H',
  ): Promise<{ qrCodeUrl: string }> {
    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Generate QR code
    const qrCodePath = await this.qrCodeService.generateQRCode(url, {
      size: size ? Number(size) : undefined,
      margin: margin ? Number(margin) : undefined,
      errorCorrectionLevel: errorCorrectionLevel,
    });

    // Return full URL to QR code
    const baseUrl = this.configService.get<string>('BASE_URL');
    return { qrCodeUrl: `${baseUrl}${qrCodePath}` };
  }

  @Get(':qrCodeId')
  @ApiOperation({ summary: 'Get a generated QR code by ID' })
  @ApiResponse({
    status: 200,
    description: 'QR code image',
  })
  getQrCode(@Param('qrCodeId') qrCodeId: string, @Res() res: Response): void {
    const qrCodePath = path.join(
      process.cwd(),
      'public',
      'qrcodes',
      qrCodeId + '.png',
    );

    // Check if file exists
    if (!fs.existsSync(qrCodePath)) {
      res.status(404).send('QR code not found');
      return;
    }

    // Send file
    res.sendFile(qrCodePath);
  }
}
