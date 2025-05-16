import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Link } from './entities/link.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IRequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('links')
@Controller()
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  // Create a short link - public endpoint (no authentication required)
  @Post('public/links')
  @ApiOperation({ summary: 'Create a short link without authentication' })
  @ApiBody({ type: CreateLinkDto })
  @ApiResponse({
    status: 201,
    description: 'Link successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid URL format' })
  createPublic(
    @Body() createLinkDto: CreateLinkDto,
  ): Promise<Link & { shortUrl: string }> {
    return this.linksService.createPublic(createLinkDto);
  }

  // Create a short link - authentication required
  @UseGuards(JwtAuthGuard)
  @Post('links')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a short link' })
  @ApiBody({ type: CreateLinkDto })
  @ApiResponse({
    status: 201,
    description: 'Link successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid URL format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createLinkDto: CreateLinkDto,
    @Req() req: IRequestWithUser,
  ): Promise<Link & { shortUrl: string }> {
    return this.linksService.create(createLinkDto, req.user!.id);
  }

  // List user's links
  @UseGuards(JwtAuthGuard)
  @Get('links')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user links' })
  @ApiResponse({
    status: 200,
    description: 'Return all links for the authenticated user',
  })
  findAll(@Req() req: IRequestWithUser): Promise<Link[]> {
    return this.linksService.findAll(req.user!.id);
  }

  // Update a link
  @UseGuards(JwtAuthGuard)
  @Patch('links/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a link' })
  @ApiParam({ name: 'id', description: 'Link ID' })
  @ApiBody({ type: UpdateLinkDto })
  @ApiResponse({ status: 200, description: 'Link successfully updated' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  update(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Req() req: IRequestWithUser,
  ): Promise<Link> {
    return this.linksService.update(id, req.user!.id, updateLinkDto);
  }

  // Delete a link
  @UseGuards(JwtAuthGuard)
  @Delete('links/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a link' })
  @ApiParam({ name: 'id', description: 'Link ID' })
  @ApiResponse({ status: 200, description: 'Link successfully deleted' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  remove(@Param('id') id: string, @Req() req: IRequestWithUser): Promise<void> {
    return this.linksService.remove(id, req.user!.id);
  }

  // Redirect to the original URL
  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirect to original URL and track visit' })
  @ApiParam({ name: 'shortCode', description: 'Short URL code' })
  @ApiResponse({ status: 301, description: 'Redirects to original URL' })
  @ApiResponse({ status: 404, description: 'Short link not found' })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const link = await this.linksService.findByShortCode(shortCode);

    // Track this visit
    await this.linksService.trackVisit(link, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
    });

    return res.redirect(HttpStatus.MOVED_PERMANENTLY, link.originalUrl);
  }
}
