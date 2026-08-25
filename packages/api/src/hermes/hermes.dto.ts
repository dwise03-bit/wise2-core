import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { HermesMode, HermesRisk } from './hermes-action.entity';

const HERMES_MODES: HermesMode[] = [
  'executive',
  'audit',
  'sales',
  'projects',
  'support',
  'systems',
];

const HERMES_RISKS: HermesRisk[] = ['low', 'medium', 'high', 'critical'];

export class CreateHermesActionDto {
  @IsIn(HERMES_MODES)
  mode!: HermesMode;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  kind!: string;

  @IsIn(HERMES_RISKS)
  risk!: HermesRisk;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  summary?: string;

  @IsOptional()
  @IsArray()
  evidence?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class DecideHermesActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class HermesChatMessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  content!: string;
}

export class HermesChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  message!: string;

  @IsOptional()
  @IsIn(HERMES_MODES)
  mode?: HermesMode;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HermesChatMessageDto)
  messages?: HermesChatMessageDto[];

  @IsOptional()
  @IsIn(['fast', 'deep', 'auto'])
  profile?: 'fast' | 'deep' | 'auto';
}

// Image generation DTOs
class ImageReferenceAssetDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsIn(['LOCKED', 'EDITABLE', 'NEW'])
  role?: 'LOCKED' | 'EDITABLE' | 'NEW';

  @IsOptional()
  @IsIn(['person', 'logo', 'hardware', 'screenshot', 'approved-art', 'other'])
  kind?: 'person' | 'logo' | 'hardware' | 'screenshot' | 'approved-art' | 'other';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class HermesImageRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  instruction!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageReferenceAssetDto)
  references?: ImageReferenceAssetDto[];

  @IsOptional()
  @IsBoolean()
  deliverToDiscord?: boolean;

  @IsOptional()
  @IsIn(['builds', 'alerts', 'decisions', 'images'])
  discordChannel?: 'builds' | 'alerts' | 'decisions' | 'images';

  @IsOptional()
  @IsIn(['1:1', '4:5', '16:9', '9:16'])
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
}
