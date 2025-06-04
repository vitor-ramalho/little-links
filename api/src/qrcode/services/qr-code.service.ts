import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface IQRCodeOptions {
  errorCorrectionLevel?:
    | 'low'
    | 'medium'
    | 'quartile'
    | 'high'
    | 'L'
    | 'M'
    | 'Q'
    | 'H';
  size?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);
  private readonly qrcodesDirectory: string;
  private readonly baseUrl: string;
  constructor(private configService: ConfigService) {
    // Directory where QR codes will be stored
    this.qrcodesDirectory = path.join(process.cwd(), 'public', 'qrcodes');
    this.baseUrl =
      this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';

    // Ensure directory exists
    void this.initDirectory();
  }

  private async initDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.qrcodesDirectory, { recursive: true });
      this.logger.log(
        `QR code directory initialized: ${this.qrcodesDirectory}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to initialize QR code directory: ${errorMessage}`,
      );
    }
  }

  /**
   * Generate a QR code for a URL with optional customization
   * @param url The URL to encode in the QR code
   * @param options Optional customization options
   * @returns Path to the saved QR code file (relative to public directory)
   */
  async generateQRCode(
    url: string,
    options: IQRCodeOptions = {},
  ): Promise<string> {
    try {
      // Configure options with defaults
      const finalOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
        width: options.size ?? 300,
        margin: options.margin ?? 4,
        color: options.color ?? { dark: '#000000', light: '#ffffff' },
      };

      // Generate QR code as data URL
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      const qrCodeDataURL = await QRCode.toDataURL(url, finalOptions);
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      /* eslint-enable @typescript-eslint/no-unsafe-call */
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */

      // Convert data URL to buffer - add type safety
      const dataUrlParts =
        typeof qrCodeDataURL === 'string' ? qrCodeDataURL.split(',') : [];
      if (dataUrlParts.length < 2) {
        throw new Error('Invalid QR code data URL format');
      }
      const buffer = Buffer.from(dataUrlParts[1], 'base64');

      // Generate unique filename
      const filename = `${randomUUID()}.png`;
      const filepath = path.join(this.qrcodesDirectory, filename);

      // Write file to disk
      await fs.writeFile(filepath, buffer);

      // Return path relative to public directory
      const relativePath = `/qrcodes/${filename}`;
      this.logger.log(`QR code generated: ${relativePath}`);

      return relativePath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate QR code: ${errorMessage}`);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Get the full URL for a QR code path
   * @param path Relative path to the QR code
   * @returns Full URL to the QR code
   */
  getQRCodeUrl(pathToQr: string): string {
    return `${this.baseUrl}${pathToQr}`;
  }
}
