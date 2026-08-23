import { IsString, IsOptional, IsObject, IsNumber, Min, Max } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsObject()
  mixerState?: Record<string, any>;

  @IsOptional()
  @IsString()
  lyrics?: string | null;

  @IsOptional()
  @IsString()
  lyricsTitle?: string | null;
}

export class GenerateMusicDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(300)
  duration?: number;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  tempo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  seed?: number;
}
