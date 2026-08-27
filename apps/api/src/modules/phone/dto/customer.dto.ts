/**
 * Customer & Lead Management DTOs
 */

import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class IdentifyCustomerDto {
  @IsString()
  callSid: string;

  @IsOptional()
  @IsString()
  customerId?: string; // If known, link directly

  @IsOptional()
  @IsString()
  callerNumber?: string; // To lookup by phone
}

export class IdentifyPropertyDto {
  @IsString()
  callSid: string;

  @IsString()
  propertyId: string;
}

export class CreateLeadDto {
  @IsString()
  callSid: string; // Originating call

  @IsString()
  contactName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  issue?: string; // Customer's HVAC issue

  @IsOptional()
  @IsString()
  urgency?: 'routine' | 'priority' | 'urgent' | 'emergency';
}

export class CustomerContextResponse {
  id: string;
  contactName: string;
  email: string;
  phone?: string;
  businessName?: string;
  properties?: {
    id: string;
    address: string;
    heatingType?: string;
    coolingType?: string;
    equipment?: {
      id: string;
      type: string;
      manufacturer: string;
      model: string;
    }[];
  }[];
  recentCalls?: {
    date: string;
    duration: number;
    summary: string;
  }[];
  activeWorkOrders?: {
    id: string;
    status: string;
    address: string;
  }[];
  upcomingAppointments?: {
    id: string;
    scheduledAt: string;
    type: string;
  }[];
}

export class LeadResponse {
  id: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  source: string; // PHONE
  callSid: string;
  createdAt: string;
}
