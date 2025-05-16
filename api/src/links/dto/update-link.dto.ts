import { IsUrl } from 'class-validator';

export class UpdateLinkDto {
  @IsUrl()
  originalUrl: string;
}
