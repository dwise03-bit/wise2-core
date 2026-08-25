import { IsEnum, IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GenerationType, BrandProfile } from '@wise2/creative-engine';

export class CreateGenerationDto {
  @IsEnum(GenerationType)
  type: GenerationType;

  @IsEnum(BrandProfile)
  brand: BrandProfile;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(['draft', 'standard', 'premium'])
  quality?: 'draft' | 'standard' | 'premium';

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  metadata?: Record<string, any>;
}

export class GenerationStatusDto {
  id: string;
  status: string;
  progress: number;
  provider: string;
  estimatedCost: number;
  actualCost: number;
  resultsCount: number;
  qualityScore: number;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}

export class CreditWalletStatusDto {
  userId: string;
  totalFreeCredits: number;
  totalPaidCredits: number;
  monthlyCost: number;
  estimatedRetailValue: number;
  generationCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
}
