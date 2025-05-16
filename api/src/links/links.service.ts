import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Link } from './entities/link.entity';
import { Analytics } from './entities/analytics.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    private configService: ConfigService,
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
      let shortCode = this.generateShortCode();
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

      // Create the link
      const link = this.linkRepository.create({
        originalUrl: createLinkDto.originalUrl,
        shortCode,
        userId,
      });

      await this.linkRepository.save(link);

      // Add the base URL to the response
      const baseUrl = this.configService.get<string>('BASE_URL');
      return {
        ...link,
        shortUrl: `${baseUrl}/${link.shortCode}`,
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
    return link;
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
      if (updateLinkDto.originalUrl) {
        new URL(updateLinkDto.originalUrl);
      }

      await this.linkRepository.update(id, {
        originalUrl: updateLinkDto.originalUrl,
      });

      const updatedLink = await this.linkRepository.findOne({ where: { id } });
      if (!updatedLink) {
        throw new NotFoundException(
          `Link with ID ${id} not found after update`,
        );
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
    await this.linkRepository.increment({ id: link.id }, 'clicks', 1);

    const analytics = this.analyticsRepository.create({
      link,
      linkId: link.id,
      ...analyticsData,
    });

    await this.analyticsRepository.save(analytics);
  }
}
