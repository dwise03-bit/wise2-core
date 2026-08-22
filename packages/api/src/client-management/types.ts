// Client Management Types

export interface ClientAccount {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  industry: 'field-service' | 'ecommerce' | 'saas' | 'other';
  status: 'active' | 'trial' | 'onboarding' | 'paused' | 'churned';
  plan: 'starter' | 'pro' | 'enterprise';
  tier: 'getting-started' | 'growing' | 'scaling' | 'enterprise';
  createdAt: Date;
  activatedAt?: Date;
  cancelledAt?: Date;
}

export interface ClientIntegration {
  id: string;
  clientId: string;
  type: 'jobber' | 'stripe' | 'twilio' | 'openai' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  lastError?: string;
  metadata: Record<string, unknown>;
}

export interface IntegrationHealth {
  integrationId: string;
  clientId: string;
  type: string;
  status: 'healthy' | 'degraded' | 'error';
  syncRate: number; // percentage 0-100
  lastSync: Date;
  uptime: number; // percentage 0-100
  errorCount: number;
  warningCount: number;
}

export interface ClientMetrics {
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
  apiCalls: number;
  dataRecordsSynced: number;
  integrationUptime: number;
  costEstimate: number;
  usagePercentage: number; // % of plan quota used
}

export interface ClientOnboardingStep {
  id: string;
  clientId: string;
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  completedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  amount: number;
  currency: 'USD';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  period: string; // YYYY-MM
  invoiceId?: string;
  stripeId?: string;
  createdAt: Date;
  paidAt?: Date;
}

export interface ClientUsageLog {
  id: string;
  clientId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
