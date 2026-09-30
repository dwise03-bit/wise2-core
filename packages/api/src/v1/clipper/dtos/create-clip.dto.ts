import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateClipDto {
  @IsString()
  mediaAssetId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  startTimeSeconds: number;

  @IsInt()
  endTimeSeconds: number;

  @IsOptional()
  @IsString()
  autoCaption?: string;

  @IsOptional()
  hashtags?: string[];
}
