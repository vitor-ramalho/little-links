import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLinkDto {
  @ApiProperty({
    description: 'The new URL to update the short link with',
    example: 'https://updated-example.com/new/destination',
    required: true,
  })
  @IsUrl()
  originalUrl: string;
}
