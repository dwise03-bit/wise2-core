/**
 * Call Management DTOs
 */

import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class InitiateCallDto {
  @IsString()
  toNumber: string;

  @IsOptional()
  @IsString()
  fromNumber?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  recordingEnabled?: boolean;
}

export class TransferCallDto {
  @IsString()
  callSid: string;

  @IsString()
  toNumber: string;

  @IsOptional()
  @IsEnum(['BLIND', 'ATTENDED'])
  method?: string;
}

export class EndCallDto {
  @IsString()
  callSid: string;
}

export class PlayAudioDto {
  @IsString()
  callSid: string;

  @IsString()
  audioUrl: string;

  @IsOptional()
  loop?: boolean;
}

export class SendDTMFDto {
  @IsString()
  callSid: string;

  @IsString()
  digits: string;
}

export class CallStatusResponse {
  callSid: string;
  status: string;
  duration?: number;
  recordingUrl?: string;
  customerId?: string;
  propertyId?: string;
  transcript?: string;
}

export class CallListResponse {
  activeCalls: number;
  calls: CallStatusResponse[];
  timestamp: string;
}
