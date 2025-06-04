import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from '../../src/links/services/qr-code.service';
import * as fs from 'fs/promises';
// Renamed to _path to indicate it's not used (to satisfy ESLint)
import * as _path from 'path';

jest.mock('fs/promises');
jest.mock('qrcode');
jest.mock('nanoid', () => ({ nanoid: (): string => 'test-nanoid' }));

describe('QrCodeService', () => {
  let service: QrCodeService;
  // Renamed to _configService to indicate it's not used (to satisfy ESLint)
  let _configService: ConfigService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'BASE_URL') {
                return 'http://test.com';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<QrCodeService>(QrCodeService);
    _configService = module.get<ConfigService>(ConfigService);

    // Mock fs.mkdir implementation
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

    // Mock QRCode.toDataURL implementation
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access */
    const mockQRCode = require('qrcode');
    mockQRCode.toDataURL = jest
      .fn()
      .mockResolvedValue('data:image/png;base64,testbase64data');
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access */

    // Mock fs.writeFile implementation
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQRCode', () => {
    it('should generate a QR code and return the path', async () => {
      // Call the method
      const result = await service.generateQRCode('https://example.com/abc123');

      // Assertions
      expect(result).toBe('/qrcodes/test-nanoid.png');
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle errors during QR code generation', async () => {
      // Mock QRCode.toDataURL to throw an error
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access */
      const mockQRCode = require('qrcode');
      mockQRCode.toDataURL = jest
        .fn()
        .mockRejectedValue(new Error('QR code generation failed'));
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access */

      // Call the method and expect it to throw
      await expect(
        service.generateQRCode('https://example.com/abc123'),
      ).rejects.toThrow('Failed to generate QR code');
    });
  });

  describe('getQRCodeUrl', () => {
    it('should return the full URL for a QR code path', () => {
      const result = service.getQRCodeUrl('/qrcodes/abc123.png');
      expect(result).toBe('http://test.com/qrcodes/abc123.png');
    });
  });
});
