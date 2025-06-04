import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeController } from '../qr-code.controller';
import { QrCodeService } from '../../services/qr-code.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('QrCodeController', () => {
  let controller: QrCodeController;
  let _qrCodeService: QrCodeService; // Prefix with underscore to indicate it's unused

  const mockQrCodeService = {
    generateQRCode: jest.fn(),
    getQRCodeUrl: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [
        {
          provide: QrCodeService,
          useValue: mockQrCodeService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<QrCodeController>(QrCodeController);
    _qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateQrCode', () => {
    it('should generate a QR code for a given URL', async () => {
      // Rename to _mockResponse to indicate it's unused
      const _mockResponse = {
        json: jest.fn(),
      } as unknown as Response;

      mockQrCodeService.generateQRCode.mockResolvedValue(
        '/qrcodes/test-qr.png',
      );
      mockConfigService.get.mockReturnValue('http://example.com');

      const result = await controller.generateQrCode(
        'https://example.com/abc123',
        300,
        4,
        'H',
      );

      expect(mockQrCodeService.generateQRCode).toHaveBeenCalledWith(
        'https://example.com/abc123',
        expect.objectContaining({
          size: 300,
          margin: 4,
          errorCorrectionLevel: 'H',
        }),
      );
      expect(result).toEqual({
        qrCodeUrl: 'http://example.com/qrcodes/test-qr.png',
      });
    });
  });
});
