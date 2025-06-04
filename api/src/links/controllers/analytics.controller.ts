import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('links/:linkId')
  @ApiOperation({ summary: 'Get analytics for a specific link' })
  @ApiResponse({
    status: 200,
    description: 'The analytics for the link',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for analytics (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for analytics (YYYY-MM-DD)',
  })
  async getLinkAnalytics(
    @Param('linkId') linkId: string,
    @GetUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<unknown> {
    return this.analyticsService.getLinkAnalytics(
      linkId,
      userId,
      startDate,
      endDate,
    );
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics for all user links' })
  @ApiResponse({
    status: 200,
    description: 'The dashboard analytics for all user links',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Period for analytics (day, week, month, year)',
    enum: ['day', 'week', 'month', 'year'],
  })
  async getDashboardAnalytics(
    @GetUser('id') userId: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'week',
  ): Promise<unknown> {
    return this.analyticsService.getDashboardAnalytics(userId, period);
  }
}
