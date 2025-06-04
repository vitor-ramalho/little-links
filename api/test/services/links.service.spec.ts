import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { LinksService } from '../../src/links/links.service';
import { Link } from '../../src/links/entities/link.entity';
import { Analytics } from '../../src/links/entities/analytics.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateLinkDto } from '../../src/links/dto/create-link.dto';
import { QrCodeService } from '../../src/links/services/qr-code.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('LinksService', () => {
  let service: LinksService;
  let _linkRepository: Repository<Link>; // Prefix with underscore to indicate it's not directly used
  let _qrCodeService: QrCodeService; // Prefix with underscore

  const mockLinkRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    increment: jest.fn(),
  };

  const mockAnalyticsRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'BASE_URL') {
        return 'http://test.com';
      }
      return undefined;
    }),
  };

  const mockQrCodeService = {
    generateQRCode: jest.fn().mockResolvedValue('/qrcodes/test-qr.png'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useValue: mockLinkRepository,
        },
        {
          provide: getRepositoryToken(Analytics),
          useValue: mockAnalyticsRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: QrCodeService,
          useValue: mockQrCodeService,
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    _linkRepository = module.get<Repository<Link>>(getRepositoryToken(Link));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a link with custom slug', async () => {
      // Setup
      const createLinkDto: CreateLinkDto = {
        originalUrl: 'https://example.com',
        customSlug: 'custom-test',
      };

      const mockLink = {
        id: '123',
        originalUrl: 'https://example.com',
        shortCode: 'custom-test',
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(null); // No existing link with this slug
      mockLinkRepository.create.mockReturnValueOnce(mockLink);
      mockLinkRepository.save.mockResolvedValueOnce(mockLink);

      // Execute
      const result = await service.create(createLinkDto);

      // Assert
      expect(result).toEqual({
        ...mockLink,
        shortUrl: 'http://test.com/custom-test',
      });
      expect(mockLinkRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        shortCode: 'custom-test',
        userId: undefined,
        customSlug: 'custom-test',
        expiresAt: undefined,
        maxClicks: undefined,
        password: undefined,
        tags: undefined,
      });
      expect(mockQrCodeService.generateQRCode).toHaveBeenCalledWith(
        'http://test.com/custom-test',
      );
    });

    it('should create a link with password protection', async () => {
      // Setup
      const createLinkDto: CreateLinkDto = {
        originalUrl: 'https://example.com',
        password: 'secret123',
      };

      const mockLink = {
        id: '123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      mockLinkRepository.findOne.mockResolvedValueOnce(null);
      service.generateShortCode = jest.fn().mockReturnValue('abc123');
      mockLinkRepository.create.mockReturnValueOnce(mockLink);
      mockLinkRepository.save.mockResolvedValueOnce(mockLink);

      // Execute
      const result = await service.create(createLinkDto);

      // Assert
      expect(result).toEqual({
        ...mockLink,
        shortUrl: 'http://test.com/abc123',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
    });
  });

  describe('findByShortCode', () => {
    it('should return a link if it exists and is not expired', async () => {
      // Setup
      const mockLink = {
        id: '123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        expiresAt: new Date(Date.now() + 86400000), // 1 day in the future
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(mockLink);

      // Execute
      const result = await service.findByShortCode('abc123');

      // Assert
      expect(result).toEqual(mockLink);
    });

    it('should throw an error if link is expired', async () => {
      // Setup
      const mockLink = {
        id: '123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 0,
        expiresAt: new Date(Date.now() - 86400000), // 1 day in the past
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(mockLink);

      // Execute & Assert
      await expect(service.findByShortCode('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if link has reached max clicks', async () => {
      // Setup
      const mockLink = {
        id: '123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        clicks: 10,
        maxClicks: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(mockLink);

      // Execute & Assert
      await expect(service.findByShortCode('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyLinkPassword', () => {
    it('should return true for correct password', async () => {
      // Setup
      const mockLink = {
        id: '123',
        shortCode: 'abc123',
        password: 'hashed_password',
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(mockLink);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await service.verifyLinkPassword(
        'abc123',
        'correct_password',
      );

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct_password',
        'hashed_password',
      );
    });

    it('should return false for incorrect password', async () => {
      // Setup
      const mockLink = {
        id: '123',
        shortCode: 'abc123',
        password: 'hashed_password',
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(mockLink);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Execute
      const result = await service.verifyLinkPassword(
        'abc123',
        'wrong_password',
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if link has no password', async () => {
      // Setup
      const mockLink = {
        id: '123',
        shortCode: 'abc123',
        password: null,
      };

      mockLinkRepository.findOne.mockResolvedValueOnce(mockLink);

      // Execute
      const result = await service.verifyLinkPassword('abc123', 'any_password');

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});
