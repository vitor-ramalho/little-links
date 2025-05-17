import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://example.com/very/long/url/that/needs/shortening',
    required: true,
  })
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;
}
