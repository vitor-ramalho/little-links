import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { HttpStatus } from '@nestjs/common';
import { IRequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Request, Response } from 'express';

describe('LinksController', () => {
  let controller: LinksController;
  const mockService = {
    createPublic: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByShortCode: jest.fn(),
    trackVisit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [
        {
          provide: LinksService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LinksController>(LinksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPublic', () => {
    it('should create a public link', async () => {
      const dto: CreateLinkDto = { originalUrl: 'https://example.com' };

      const result = {
        id: 'link-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        clicks: 0,
        userId: null,
      };

      mockService.createPublic.mockResolvedValue(result);

      expect(await controller.createPublic(dto)).toBe(result);
      expect(mockService.createPublic).toHaveBeenCalledWith(dto);
    });
  });

  describe('create', () => {
    it('should create a link for authenticated user', async () => {
      const dto: CreateLinkDto = { originalUrl: 'https://example.com' };
      const req = { user: { id: 'user-id' } } as IRequestWithUser;

      const result = {
        id: 'link-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        clicks: 0,
        userId: 'user-id',
      };

      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto, req)).toBe(result);
      expect(mockService.create).toHaveBeenCalledWith(dto, 'user-id');
    });
  });

  describe('findAll', () => {
    it('should return all links for the authenticated user', async () => {
      const req = { user: { id: 'user-id' } } as IRequestWithUser;

      const links = [
        {
          id: 'link-id-1',
          originalUrl: 'https://example1.com',
          shortCode: 'abc123',
          clicks: 5,
          userId: 'user-id',
        },
        {
          id: 'link-id-2',
          originalUrl: 'https://example2.com',
          shortCode: 'def456',
          clicks: 10,
          userId: 'user-id',
        },
      ];

      mockService.findAll.mockResolvedValue(links);

      expect(await controller.findAll(req)).toBe(links);
      expect(mockService.findAll).toHaveBeenCalledWith('user-id');
    });
  });

  describe('update', () => {
    it('should update a link', async () => {
      const linkId = 'link-id';
      const dto: UpdateLinkDto = { originalUrl: 'https://updated-example.com' };
      const req = { user: { id: 'user-id' } } as IRequestWithUser;

      const updatedLink = {
        id: linkId,
        originalUrl: 'https://updated-example.com',
        shortCode: 'abc123',
        clicks: 5,
        userId: 'user-id',
      };

      mockService.update.mockResolvedValue(updatedLink);

      expect(await controller.update(linkId, dto, req)).toBe(updatedLink);
      expect(mockService.update).toHaveBeenCalledWith(linkId, 'user-id', dto);
    });
  });

  describe('remove', () => {
    it('should remove a link', async () => {
      const linkId = 'link-id';
      const req = { user: { id: 'user-id' } } as IRequestWithUser;

      await controller.remove(linkId, req);

      expect(mockService.remove).toHaveBeenCalledWith(linkId, 'user-id');
    });
  });

  describe('redirect', () => {
    it('should redirect to original URL', async () => {
      // Setup
      const shortCode = 'abc123';
      const req = {
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'test-agent',
          referer: 'http://referer.com',
        },
      } as unknown as Request;

      const mockRedirect = jest.fn();
      const res = {
        redirect: mockRedirect,
      } as Partial<Response> as Response;

      const link = {
        id: 'link-id',
        originalUrl: 'https://example.com',
        shortCode,
      };

      mockService.findByShortCode.mockResolvedValue(link);

      // Act
      await controller.redirect(shortCode, req, res);

      // Assert - without chaining assertions to avoid unbound method errors
      expect(mockService.findByShortCode).toHaveBeenCalledWith(shortCode);

      expect(mockService.trackVisit).toHaveBeenCalledWith(link, {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        referrer: 'http://referer.com',
      });

      expect(mockRedirect).toHaveBeenCalledWith(
        HttpStatus.MOVED_PERMANENTLY,
        link.originalUrl,
      );
    });
  });
});
