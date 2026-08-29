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

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  changeLog?: string;
}

export class CreateCommentDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @IsOptional()
  @IsString()
  trackId?: string;
}

export class SetApprovalDto {
  @IsString()
  status!: 'pending' | 'approved' | 'revision';

  @IsOptional()
  @IsString()
  note?: string;
}

export class AttachAssetDto {
  @IsString()
  galleryAssetId!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class ClientReviewCommentDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class ClientReviewApprovalDto {
  @IsString()
  status!: 'approved' | 'revision';

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  authorName?: string;
}
