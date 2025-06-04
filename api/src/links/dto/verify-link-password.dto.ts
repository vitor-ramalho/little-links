import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyLinkPasswordDto {
  @ApiProperty({
    description: 'Password to verify',
    example: 'securepassword123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
