import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ClipPlatform } from '@prisma/client';

export class PublishClipDto {
  @IsEnum(ClipPlatform)
  platform!: ClipPlatform;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
