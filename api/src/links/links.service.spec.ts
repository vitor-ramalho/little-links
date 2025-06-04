import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinksService } from './links.service';
import { Link } from './entities/link.entity';
import { Analytics } from './entities/analytics.entity';
import { QrCodeService } from './services/qr-code.service';

describe('LinksService', () => {
  let service: LinksService;
  let _linkRepository: Repository<Link>;
  let _analyticsRepository: Repository<Analytics>;
  let _configService: ConfigService;
  let _qrCodeService: QrCodeService;

  const mockLinkRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
    get: jest.fn(),
  };

  const mockQrCodeService = {
    generateQRCode: jest.fn(),
    getQRCodeUrl: jest.fn(),
  };

  beforeEach(async () => {
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
    _analyticsRepository = module.get<Repository<Analytics>>(
      getRepositoryToken(Analytics),
    );
    _configService = module.get<ConfigService>(ConfigService);
    _qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new link with valid URL', async () => {
      const createLinkDto = { originalUrl: 'https://example.com' };
      const userId = 'user-123';
      const shortCode = 'abc123';
      const baseUrl = 'http://localhost:3000';

      const createdLink = {
        id: 'link-123',
        originalUrl: createLinkDto.originalUrl,
        shortCode,
        userId,
      };

      // Mock the random code generation
      jest
        .spyOn(service as any, 'generateShortCode')
        .mockReturnValue(shortCode);

      mockLinkRepository.findOne.mockResolvedValue(null); // No existing link with this code
      mockLinkRepository.create.mockReturnValue(createdLink);
      mockLinkRepository.save.mockResolvedValue(createdLink);
      mockConfigService.get.mockReturnValue(baseUrl);

      const result = await service.create(createLinkDto, userId);

      expect(mockLinkRepository.create).toHaveBeenCalledWith({
        originalUrl: createLinkDto.originalUrl,
        shortCode,
        userId,
      });
      expect(mockLinkRepository.save).toHaveBeenCalledWith(createdLink);
      expect(result).toEqual({
        ...createdLink,
        shortUrl: `${baseUrl}/${shortCode}`,
      });
    });

    it('should create a link without userId when not provided', async () => {
      const createLinkDto = { originalUrl: 'https://example.com' };
      const shortCode = 'abc123';
      const baseUrl = 'http://localhost:3000';

      const createdLink = {
        id: 'link-123',
        originalUrl: createLinkDto.originalUrl,
        shortCode,
        userId: null,
      };

      // Mock the random code generation
      jest
        .spyOn(service as any, 'generateShortCode')
        .mockReturnValue(shortCode);

      mockLinkRepository.findOne.mockResolvedValue(null);
      mockLinkRepository.create.mockReturnValue(createdLink);
      mockLinkRepository.save.mockResolvedValue(createdLink);
      mockConfigService.get.mockReturnValue(baseUrl);

      const result = await service.create(createLinkDto);

      expect(mockLinkRepository.create).toHaveBeenCalledWith({
        originalUrl: createLinkDto.originalUrl,
        shortCode,
        userId: undefined,
      });
      expect(result).toEqual({
        ...createdLink,
        shortUrl: `${baseUrl}/${shortCode}`,
      });
    });

    it('should throw BadRequestException for invalid URL', async () => {
      const createLinkDto = { originalUrl: 'not-a-valid-url' };

      await expect(service.create(createLinkDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByShortCode', () => {
    it('should return a link when it exists', async () => {
      const shortCode = 'abc123';
      const link = {
        id: 'link-123',
        shortCode,
        originalUrl: 'https://example.com',
      };

      mockLinkRepository.findOne.mockResolvedValue(link);

      const result = await service.findByShortCode(shortCode);

      expect(mockLinkRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode },
      });
      expect(result).toEqual(link);
    });

    it('should throw NotFoundException when link does not exist', async () => {
      const shortCode = 'nonexistent';

      mockLinkRepository.findOne.mockResolvedValue(null);

      await expect(service.findByShortCode(shortCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('trackVisit', () => {
    it('should increment clicks and save analytics', async () => {
      const link = {
        id: 'link-123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
      };

      const analyticsData = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        referrer: 'https://referrer.com',
      };

      const analytics = {
        id: 'analytics-123',
        link,
        linkId: link.id,
        ...analyticsData,
      };

      mockAnalyticsRepository.create.mockReturnValue(analytics);

      await service.trackVisit(link as Link, analyticsData);

      expect(mockLinkRepository.increment).toHaveBeenCalledWith(
        { id: link.id },
        'clicks',
        1,
      );
      expect(mockAnalyticsRepository.create).toHaveBeenCalledWith({
        link,
        linkId: link.id,
        ...analyticsData,
      });
      expect(mockAnalyticsRepository.save).toHaveBeenCalledWith(analytics);
    });
  });
});
