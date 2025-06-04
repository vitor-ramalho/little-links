import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
} from 'class-validator';
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

  @ApiProperty({
    description: 'Custom slug for the shortened URL',
    example: 'my-special-link',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message:
      'Custom slug can only contain letters, numbers, hyphens, and underscores',
  })
  customSlug?: string;

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
