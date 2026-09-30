import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MediaSourceType } from '@prisma/client';

export class CreateMediaDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MediaSourceType)
  sourceType!: MediaSourceType;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  transcriptUrl?: string;
}
