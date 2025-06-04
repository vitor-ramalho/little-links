import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LinksService } from '../links.service';
import { VerifyLinkPasswordDto } from '../dto/verify-link-password.dto';

@ApiTags('links')
@Controller('links/verify')
export class LinkVerificationController {
  constructor(private readonly linksService: LinksService) {}

  @Post(':shortCode')
  @ApiOperation({ summary: 'Verify password for a protected link' })
  @ApiParam({
    name: 'shortCode',
    description: 'Short code of the link to access',
  })
  @ApiBody({ type: VerifyLinkPasswordDto })
  @ApiResponse({ status: 200, description: 'Password verification result' })
  async verifyPassword(
    @Param('shortCode') shortCode: string,
    @Body() verifyLinkPasswordDto: VerifyLinkPasswordDto,
  ): Promise<{ success: boolean }> {
    const isValid = await this.linksService.verifyLinkPassword(
      shortCode,
      verifyLinkPasswordDto.password,
    );

    return { success: isValid };
  }
}
