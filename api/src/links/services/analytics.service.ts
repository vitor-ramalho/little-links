import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Link } from '../entities/link.entity';
import { Analytics } from '../entities/analytics.entity';
import {
  endOfDay,
  startOfDay,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
  ) {}

  /**
   * Get analytics for a specific link
   * @param linkId Link ID
   * @param userId User ID
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @returns Analytics data
   */
  async getLinkAnalytics(
    linkId: string,
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalClicks: number;
    clicksByDate: { date: string; count: number }[];
    deviceDistribution: { device: string; count: number }[];
    referrerDistribution: { source: string; count: number }[];
    browserDistribution: { browser: string; count: number }[];
    osDistribution: { os: string; count: number }[];
    hourDistribution: { hour: number; count: number }[];
  }> {
    // Verify link ownership
    const link = await this.linkRepository.findOne({
      where: { id: linkId, userId },
    });

    if (!link) {
      throw new NotFoundException(
        'Link not found or you do not have permission to access it',
      );
    }

    // Set up date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: Between(
          startOfDay(new Date(startDate)),
          endOfDay(new Date(endDate)),
        ),
      };
    }

    // Fetch all analytics records for the link
    const analytics = await this.analyticsRepository.find({
      where: {
        linkId,
        ...dateFilter,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // Get click counts by date
    const clicksByDate = this.getClicksByDate(analytics);

    // Get device distribution
    const deviceDistribution = this.getDeviceDistribution(analytics);

    // Get referrer distribution
    const referrerDistribution = this.getReferrerDistribution(analytics);

    // Get browser distribution
    const browserDistribution = this.getBrowserDistribution(analytics);

    // Get OS distribution
    const osDistribution = this.getOsDistribution(analytics);

    // Get hour of day distribution
    const hourDistribution = this.getHourDistribution(analytics);

    return {
      totalClicks: analytics.length,
      clicksByDate,
      deviceDistribution,
      referrerDistribution,
      browserDistribution,
      osDistribution,
      hourDistribution,
    };
  }

  /**
   * Get dashboard analytics for all user links
   * @param userId User ID
   * @param period Time period
   * @returns Dashboard analytics data
   */
  async getDashboardAnalytics(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'week',
  ): Promise<{
    totalClicks: number;
    clicksByDate: { date: string; count: number }[];
    topLinks: {
      id: string;
      shortCode: string;
      originalUrl: string;
      clicks: number;
    }[];
    deviceDistribution: { device: string; count: number }[];
    referrerDistribution: { source: string; count: number }[];
  }> {
    // Get the links for this user
    const links = await this.linkRepository.find({
      where: { userId },
      relations: ['analytics'],
    });

    if (links.length === 0) {
      return {
        totalClicks: 0,
        clicksByDate: [],
        topLinks: [],
        deviceDistribution: [],
        referrerDistribution: [],
      };
    }

    // Calculate the start date based on period
    const now = new Date();
    let startDateFilter: Date;

    switch (period) {
      case 'day':
        startDateFilter = subDays(now, 1);
        break;
      case 'week':
        startDateFilter = subWeeks(now, 1);
        break;
      case 'month':
        startDateFilter = subMonths(now, 1);
        break;
      case 'year':
        startDateFilter = subYears(now, 1);
        break;
    }

    // Get all analytics records for the user's links within the time period
    const linkIds = links.map((link) => link.id);
    const analytics = await this.analyticsRepository.find({
      where: [
        ...linkIds.map((id) => ({
          linkId: id,
          createdAt: Between(startDateFilter, now),
        })),
      ],
    });

    // Get click counts by date
    const clicksByDate = this.getClicksByDate(analytics);

    // Get top performing links
    const topLinks = this.getTopLinks(links, analytics);

    // Get device distribution
    const deviceDistribution = this.getDeviceDistribution(analytics);

    // Get referrer distribution
    const referrerDistribution = this.getReferrerDistribution(analytics);

    return {
      totalClicks: analytics.length,
      clicksByDate,
      topLinks,
      deviceDistribution,
      referrerDistribution,
    };
  }

  /**
   * Group analytics by date and count clicks
   * @param analytics Analytics records
   * @returns Clicks grouped by date
   */
  private getClicksByDate(
    analytics: Analytics[],
  ): { date: string; count: number }[] {
    const clicksByDate: Record<string, number> = {};

    analytics.forEach((record) => {
      const date = record.createdAt.toISOString().split('T')[0];
      clicksByDate[date] ??= 0;
      clicksByDate[date]++;
    });

    return Object.entries(clicksByDate).map(([date, count]) => ({
      date,
      count: count,
    }));
  }

  /**
   * Calculate top performing links
   * @param links Link records
   * @param analytics Analytics records
   * @returns Top links by click count
   */
  private getTopLinks(
    links: Link[],
    analytics: Analytics[],
  ): { id: string; shortCode: string; originalUrl: string; clicks: number }[] {
    const clicksByLink: Record<string, number> = {};

    analytics.forEach((record) => {
      clicksByLink[record.linkId] ??= 0;
      clicksByLink[record.linkId]++;
    });

    // Map link IDs to full link objects with click counts
    return links
      .map((link) => ({
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks: clicksByLink[link.id] ?? 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5); // Return top 5
  }

  /**
   * Group analytics by device type and count clicks
   * @param analytics Analytics records
   * @returns Clicks grouped by device
   */
  private getDeviceDistribution(
    analytics: Analytics[],
  ): { device: string; count: number }[] {
    const deviceDistribution: Record<string, number> = {};

    analytics.forEach((record) => {
      const device = record.device ?? 'Unknown';
      deviceDistribution[device] ??= 0;
      deviceDistribution[device]++;
    });

    return Object.entries(deviceDistribution)
      .map(([device, count]) => ({
        device,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group analytics by referrer/source and count clicks
   * @param analytics Analytics records
   * @returns Clicks grouped by referrer
   */
  private getReferrerDistribution(
    analytics: Analytics[],
  ): { source: string; count: number }[] {
    const referrerDistribution: Record<string, number> = {};

    analytics.forEach((record) => {
      const source = record.source ?? 'Direct';
      referrerDistribution[source] ??= 0;
      referrerDistribution[source]++;
    });

    return Object.entries(referrerDistribution)
      .map(([source, count]) => ({
        source,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group analytics by browser and count clicks
   * @param analytics Analytics records
   * @returns Clicks grouped by browser
   */
  private getBrowserDistribution(
    analytics: Analytics[],
  ): { browser: string; count: number }[] {
    const browserDistribution: Record<string, number> = {};

    analytics.forEach((record) => {
      const browser = record.browser ?? 'Unknown';
      browserDistribution[browser] ??= 0;
      browserDistribution[browser]++;
    });

    return Object.entries(browserDistribution)
      .map(([browser, count]) => ({
        browser,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group analytics by OS and count clicks
   * @param analytics Analytics records
   * @returns Clicks grouped by OS
   */
  private getOsDistribution(
    analytics: Analytics[],
  ): { os: string; count: number }[] {
    const osDistribution: Record<string, number> = {};

    analytics.forEach((record) => {
      const os = record.os ?? 'Unknown';
      osDistribution[os] ??= 0;
      osDistribution[os]++;
    });

    return Object.entries(osDistribution)
      .map(([os, count]) => ({
        os,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Group analytics by hour of day and count clicks
   * @param analytics Analytics records
   * @returns Clicks grouped by hour
   */
  private getHourDistribution(
    analytics: Analytics[],
  ): { hour: number; count: number }[] {
    // Create an array of 24 zeros (one for each hour)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hourDistribution: number[] = Array(24).fill(0);

    analytics.forEach((record) => {
      const hour = record.createdAt.getHours();
      hourDistribution[hour]++;
    });

    return hourDistribution.map((count, hour) => ({
      hour,
      count,
    }));
  }
}
