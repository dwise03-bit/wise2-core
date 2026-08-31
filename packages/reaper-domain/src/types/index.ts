// REAPER Domain Types - M0 Foundation

export type ScoreType =
  | 'WEBSITE'
  | 'BRAND'
  | 'SEO'
  | 'SOCIAL'
  | 'REPUTATION'
  | 'CONVERSION'
  | 'BUSINESS_HEALTH'
  | 'DIGITAL_EXECUTION'
  | 'GROWTH_POTENTIAL'
  | 'REAPER_OPPORTUNITY';

export type ProspectStatus =
  | 'DISCOVERY'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'INTERVIEWED'
  | 'CONVERTED'
  | 'DECLINED'
  | 'LOST';

export type AuditStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED';

export type AuditType =
  | 'WEBSITE'
  | 'SOCIAL'
  | 'REPUTATION'
  | 'FULL';

export type Confidence = 'UNKNOWN' | 'FAIL' | 'WARNING' | 'PASS' | 'NOT_APPLICABLE';

export interface ScoreComponent {
  name: string;
  weight: number;
  value: number;
  confidence: number;
}

export interface ScoreResult {
  id: string;
  scoreType: ScoreType;
  rawScore: number;
  confidence: number;
  components: ScoreComponent[];
  reasoning: string;
  version: number;
  calculatedAt: Date;
}

export interface ProspectData {
  id: string;
  organizationId: string;
  sourceUrl?: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: ProspectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessData {
  id: string;
  organizationId: string;
  prospectId?: string;
  name: string;
  industry?: string;
  description?: string;
  annualRevenue?: number;
  employeeCount?: number;
  yearsInBusiness?: number;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteData {
  id: string;
  organizationId: string;
  businessId?: string;
  url: string;
  domain: string;
  title?: string;
  description?: string;
  lastCrawledAt?: Date;
  httpStatus?: number;
  isAccessible: boolean;
  desktopScreenshot?: string;
  mobileScreenshot?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditRunData {
  id: string;
  organizationId: string;
  prospectId?: string;
  businessId?: string;
  websiteId?: string;
  status: AuditStatus;
  auditType: AuditType;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceData {
  id: string;
  organizationId: string;
  auditRunId?: string;
  auditJobId?: string;
  websitePageId?: string;
  sourceType: string;
  sourceValue: string;
  observation: string;
  confidence: number;
  createdAt: Date;
}

export interface FindingData {
  id: string;
  organizationId: string;
  auditRunId: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  recommendation?: string;
  createdAt: Date;
}
