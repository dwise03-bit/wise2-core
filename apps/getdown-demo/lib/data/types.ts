/**
 * GET DOWN PRESSURE WASHING — Command Center domain model
 *
 * Every record in this demo is FICTIONAL. No real customer, property manager,
 * or financial data is represented here.
 */

export type Engine = 'multifamily' | 'lighting';

export type LeadSource =
  | 'Google'
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'Referral'
  | 'Property Manager'
  | 'Existing Customer'
  | 'Commercial Outreach'
  | 'Seasonal Campaign'
  | 'Other';

export type PipelineStage =
  | 'new'
  | 'contacted'
  | 'site_visit'
  | 'estimate_sent'
  | 'follow_up'
  | 'won'
  | 'scheduled'
  | 'completed'
  | 'lost';

export interface Opportunity {
  id: string;
  customerId: string;
  customer: string;
  propertyId?: string;
  property: string;
  service: string;
  engine: Engine;
  source: LeadSource;
  value: number;
  owner: string;
  lastContact: string;
  nextAction: string;
  probability: number;
  notes: string;
  stage: PipelineStage;
  createdAt: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  skills: string[];
  hoursBooked: number;
  hoursCapacity: number;
}

export interface PropertyDoc {
  id: string;
  name: string;
  type: 'COI' | 'W-9' | 'Contract' | 'Proposal' | 'Service Record' | 'Insurance Request';
  propertyId: string;
  property: string;
  provider?: string;
  requestedAt?: string;
  receivedAt?: string;
  expiresAt?: string;
  status: 'requested' | 'received' | 'matched' | 'delivered' | 'stored' | 'expiring' | 'expired';
  nextAction: string;
  sizeKb: number;
}

export interface Property {
  id: string;
  name: string;
  managementCompany: string;
  manager: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  buildings: number;
  units: number;
  contractValue: number;
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'One-Time';
  lastService: string;
  nextService: string;
  coiStatus: 'Current' | 'Expiring' | 'Requested' | 'Missing';
  coiExpires?: string;
  contractStart: string;
  contractEnd: string;
  risk: 'healthy' | 'watch' | 'at_risk';
  lat: number; // normalized 0-100 map coordinates for the territory map
  lng: number;
  services: string[];
  expansion: string[];
  notes: string;
  photos: number;
}

export interface Customer {
  id: string;
  name: string;
  type: 'Property Management' | 'HOA' | 'Commercial' | 'Residential';
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  source: LeadSource;
  since: string;
  lifetimeValue: number;
  openBalance: number;
  properties: string[];
  rating?: number;
  tags: string[];
}

export interface EstimateLine {
  service: string;
  qty: number;
  unit: string;
  rate: number;
}

export interface Estimate {
  id: string;
  number: string;
  customerId: string;
  customer: string;
  property: string;
  engine: Engine;
  tier: 'Good' | 'Better' | 'Best';
  lines: EstimateLine[];
  discount: number;
  taxRate: number;
  depositPct: number;
  status: 'draft' | 'sent' | 'opened' | 'approved' | 'declined' | 'expired';
  sentAt?: string;
  openedAt?: string;
  approvedAt?: string;
  owner: string;
  ageDays: number;
}

export type JobStatus =
  | 'unassigned'
  | 'traveling'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'needs_follow_up';

export interface Job {
  id: string;
  number: string;
  customer: string;
  property: string;
  propertyId?: string;
  service: string;
  engine: Engine;
  date: string;
  start: number; // hour, 24h decimal (e.g. 8.5 = 8:30am)
  duration: number; // hours
  crewId: string | null;
  status: JobStatus;
  value: number;
  address: string;
  lat: number;
  lng: number;
  notes: string;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  property: string;
  issued: string;
  due: string;
  amount: number;
  paid: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
}

export interface Payment {
  id: string;
  invoice: string;
  customer: string;
  date: string;
  amount: number;
  method: 'ACH' | 'Card' | 'Check' | 'Cash';
}

export interface FollowUp {
  id: string;
  type: string;
  trigger: string;
  customer: string;
  property: string;
  value: number;
  age: string;
  priority: 'high' | 'medium' | 'low';
  channel: 'call' | 'text' | 'email';
  aiDraft: string;
  owner: string;
}

export interface LightingOpportunity {
  id: string;
  customer: string;
  property: string;
  city: string;
  linearFeet: number;
  price: number;
  stage:
    | 'lead'
    | 'site_assessment'
    | 'proposal'
    | 'design_selection'
    | 'scheduled'
    | 'installed';
  campaign: string;
  installDate?: string;
  crew?: string;
  materials: string;
  warranty: string;
  upsell: string[];
  source: LeadSource;
}

export interface Review {
  id: string;
  customer: string;
  property: string;
  rating: number;
  date: string;
  text: string;
  platform: 'Google' | 'Facebook' | 'Direct';
  responded: boolean;
}

export interface MediaAsset {
  id: string;
  title: string;
  category: string;
  property: string;
  service: string;
  date: string;
  kind: 'before' | 'after' | 'video' | 'crew' | 'lighting' | 'testimonial';
  tone: string; // css gradient used as the visual stand-in for the real footage
}

export interface PricebookItem {
  id: string;
  service: string;
  engine: Engine;
  unit: string;
  rate: number;
  minimum: number;
  crewHours: number;
  category: string;
}
