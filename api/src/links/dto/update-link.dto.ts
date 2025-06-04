import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLinkDto {
  @ApiProperty({
    description: 'The new URL to update the short link with',
    example: 'https://updated-example.com/new/destination',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @ApiProperty({
    description: 'Expiration date for the link',
    example: '2023-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    description: 'Maximum number of clicks before link expires',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxClicks?: number;

  @ApiProperty({
    description: 'Password to protect the link',
    example: 'securepassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Tags for categorizing the link',
    example: ['marketing', 'social-media'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
