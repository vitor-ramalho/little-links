import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Link } from './entities/link.entity';
import { Analytics } from './entities/analytics.entity';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from '../qrcode/services/qr-code.service';
import { UserAgentService } from '../common/services/user-agent.service';
import { IUserAgentInfo } from '../common/services/user-agent.service';
import { AnalyticsService } from '../analytics/services/analytics.service';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private configService: ConfigService,
    private qrCodeService: QrCodeService,
    private userAgentService: UserAgentService,
    private analyticsService: AnalyticsService,
  ) {}

  // Generate a random shortcode of 6 characters
  private generateShortCode(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 6;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  /**
   * Creates a public short link without authentication
   */
  async createPublic(
    createLinkDto: CreateLinkDto,
  ): Promise<Link & { shortUrl: string }> {
    return this.create(createLinkDto);
  }

  /**
   * Creates a short link, optionally associated with a user
   */
  async create(
    createLinkDto: CreateLinkDto,
    userId?: string,
  ): Promise<Link & { shortUrl: string }> {
    try {
      try {
        new URL(createLinkDto.originalUrl);
      } catch {
        throw new BadRequestException('Invalid URL format');
      }

      // Handle custom slug if provided
      let shortCode: string;
      if (createLinkDto.customSlug) {
        // Check if custom slug is already taken
        const existingWithCustomSlug = await this.linkRepository.findOne({
          where: { shortCode: createLinkDto.customSlug },
        });

        if (existingWithCustomSlug) {
          throw new BadRequestException('Custom slug is already taken');
        }

        shortCode = createLinkDto.customSlug;
      } else {
        // Generate a random shortcode
        shortCode = this.generateShortCode();
        let existingLink = await this.linkRepository.findOne({
          where: { shortCode },
        });

        // Keep generating until we find a unique code
        while (existingLink) {
          shortCode = this.generateShortCode();
          existingLink = await this.linkRepository.findOne({
            where: { shortCode },
          });
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (createLinkDto.password) {
        hashedPassword = await bcrypt.hash(createLinkDto.password, 10);
      }

      // Create the link
      const link = this.linkRepository.create({
        originalUrl: createLinkDto.originalUrl,
        shortCode,
        userId,
        customSlug: createLinkDto.customSlug,
        expiresAt: createLinkDto.expiresAt
          ? new Date(createLinkDto.expiresAt)
          : undefined,
        maxClicks: createLinkDto.maxClicks,
        password: hashedPassword,
        tags: createLinkDto.tags,
      });

      // Save link to get the ID
      await this.linkRepository.save(link);

      // Get the base URL for the short link
      const appBaseUrl = this.configService.get<string>('BASE_URL');
      const shortUrl = `${appBaseUrl}/${link.shortCode}`;

      // Generate QR code
      try {
        const qrCodePath = await this.qrCodeService.generateQRCode(shortUrl);
        link.qrCodePath = qrCodePath;
        await this.linkRepository.save(link);
      } catch (error) {
        // Log error but continue - QR code is not critical
        console.error('Failed to generate QR code:', error);
      }

      // Return the complete link with shortUrl
      return {
        ...link,
        shortUrl,
      };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new BadRequestException('Invalid URL format');
      }
      throw error;
    }
  }

  async findAll(userId: string): Promise<Link[]> {
    return this.linkRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByShortCode(shortCode: string): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { shortCode } });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      throw new NotFoundException('This link has expired');
    }

    // Check if link has reached maximum clicks
    if (link.maxClicks && link.clicks >= link.maxClicks) {
      throw new NotFoundException(
        'This link has reached its maximum click limit',
      );
    }

    return link;
  }

  /**
   * Verify if a password matches for a password-protected link
   */
  async verifyLinkPassword(
    shortCode: string,
    password: string,
  ): Promise<boolean> {
    const link = await this.linkRepository.findOne({ where: { shortCode } });

    if (!link?.password) {
      return false;
    }

    return bcrypt.compare(password, link.password);
  }

  async update(
    id: string,
    userId: string,
    updateLinkDto: UpdateLinkDto,
  ): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { id, userId } });

    if (!link) {
      throw new NotFoundException(
        'Link not found or you do not have permission to edit it',
      );
    }

    try {
      // Validate URL if provided
      if (updateLinkDto.originalUrl) {
        new URL(updateLinkDto.originalUrl);
      }

      const updateData: Partial<Link> = {};

      // Update only the fields that are provided
      if (updateLinkDto.originalUrl !== undefined) {
        updateData.originalUrl = updateLinkDto.originalUrl;
      }

      if (updateLinkDto.expiresAt !== undefined) {
        updateData.expiresAt = new Date(updateLinkDto.expiresAt);
      }

      if (updateLinkDto.maxClicks !== undefined) {
        updateData.maxClicks = updateLinkDto.maxClicks;
      }

      if (updateLinkDto.password !== undefined) {
        // Hash password if provided
        updateData.password = await bcrypt.hash(updateLinkDto.password, 10);
      }

      if (updateLinkDto.tags !== undefined) {
        updateData.tags = updateLinkDto.tags;
      }

      await this.linkRepository.update(id, updateData);

      const updatedLink = await this.linkRepository.findOne({ where: { id } });
      if (!updatedLink) {
        throw new NotFoundException(
          `Link with ID ${id} not found after update`,
        );
      }

      // Generate QR code if it doesn't exist yet
      if (!updatedLink.qrCodePath) {
        try {
          const shortUrl = `${this.configService.get<string>('BASE_URL')}/${updatedLink.shortCode}`;
          const qrCodePath = await this.qrCodeService.generateQRCode(shortUrl);
          await this.linkRepository.update(id, { qrCodePath });
          updatedLink.qrCodePath = qrCodePath;
        } catch (error) {
          // Log error but don't fail the update
          console.error(`Failed to generate QR code for link ${id}:`, error);
        }
      }

      return updatedLink;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new BadRequestException('Invalid URL format');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const link = await this.linkRepository.findOne({ where: { id, userId } });

    if (!link) {
      throw new NotFoundException(
        'Link not found or you do not have permission to delete it',
      );
    }

    await this.linkRepository.softDelete(id);
  }

  async trackVisit(
    link: Link,
    analyticsData: Partial<Analytics>,
  ): Promise<void> {
    // Increment the click counter for the link
    await this.linkRepository.increment({ id: link.id }, 'clicks', 1);

    // Parse user agent info if user agent is provided
    let userAgentInfo: IUserAgentInfo = {};
    if (analyticsData.userAgent) {
      userAgentInfo = this.userAgentService.parseUserAgent(
        analyticsData.userAgent,
      );
    }

    // Detect source if referrer is provided
    let source = 'Direct';
    if (analyticsData.referrer) {
      source = this.userAgentService.detectSource(analyticsData.referrer);
    }

    // Create analytics record with all the enhanced data
    const analytics = this.analyticsRepository.create({
      link,
      linkId: link.id,
      ...analyticsData,
      ...userAgentInfo,
      source,
    });

    await this.analyticsRepository.save(analytics);
  }
}
