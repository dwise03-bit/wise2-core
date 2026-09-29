import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClientAccount,
  ClientIntegration,
  IntegrationHealth,
  ClientMetrics,
  ClientOnboardingStep,
  PaymentRecord,
} from './types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ClientManagementService {
  constructor(private prisma: PrismaService) {}

  // Client Account Management
  async createClient(data: Partial<ClientAccount>): Promise<ClientAccount> {
    const clientId = uuid();
    const now = new Date();

    return {
      id: clientId,
      companyName: data.companyName || 'New Client',
      email: data.email || '',
      phone: data.phone || '',
      industry: data.industry || 'other',
      status: 'onboarding',
      plan: 'starter',
      tier: 'getting-started',
      createdAt: now,
    };
  }

  async getClient(clientId: string): Promise<ClientAccount | null> {
    // Mock implementation
    return {
      id: clientId,
      companyName: 'Get Down Pressure Washing',
      email: 'contact@getdownpressure.com',
      phone: '+1-555-0100',
      industry: 'field-service',
      status: 'active',
      plan: 'pro',
      tier: 'growing',
      createdAt: new Date('2026-08-01'),
      activatedAt: new Date('2026-08-05'),
    };
  }

  async updateClient(clientId: string, data: Partial<ClientAccount>): Promise<ClientAccount> {
    const existing = await this.getClient(clientId);
    if (!existing) throw new Error(`Client ${clientId} not found`);

    return { ...existing, ...data, id: clientId };
  }

  // Integration Management
  async createIntegration(clientId: string, type: string): Promise<ClientIntegration> {
    return {
      id: uuid(),
      clientId,
      type: type as any,
      status: 'pending',
      metadata: {},
    };
  }

  async getIntegrations(clientId: string): Promise<ClientIntegration[]> {
    // Mock: Get Down has Jobber + Stripe
    if (clientId.includes('down')) {
      return [
        {
          id: uuid(),
          clientId,
          type: 'jobber',
          status: 'connected',
          lastSyncAt: new Date(Date.now() - 600000), // 10 min ago
          nextSyncAt: new Date(Date.now() + 300000), // in 5 min
          metadata: { apiKey: 'jobber_***' },
        },
        {
          id: uuid(),
          clientId,
          type: 'stripe',
          status: 'connected',
          lastSyncAt: new Date(Date.now() - 3600000), // 1 hour ago
          metadata: { accountId: 'stripe_***' },
        },
      ];
    }
    return [];
  }

  // Health Monitoring
  async getIntegrationHealth(integrationId: string): Promise<IntegrationHealth> {
    return {
      integrationId,
      clientId: 'client-001',
      type: 'jobber',
      status: 'healthy',
      syncRate: 98.5,
      lastSync: new Date(Date.now() - 600000),
      uptime: 99.95,
      errorCount: 2,
      warningCount: 0,
    };
  }

  async getClientHealth(clientId: string): Promise<IntegrationHealth[]> {
    const integrations = await this.getIntegrations(clientId);
    return Promise.all(integrations.map((i) => this.getIntegrationHealth(i.id)));
  }

  // Metrics & Usage
  async getClientMetrics(clientId: string, period?: string): Promise<ClientMetrics> {
    const now = new Date();
    const start = period ? new Date(period + '-01') : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return {
      clientId,
      periodStart: start,
      periodEnd: end,
      apiCalls: Math.floor(Math.random() * 100000) + 50000,
      dataRecordsSynced: Math.floor(Math.random() * 50000) + 10000,
      integrationUptime: 99.95,
      costEstimate: 299.99,
      usagePercentage: 42,
    };
  }

  // Onboarding Workflow
  async initializeOnboarding(clientId: string): Promise<ClientOnboardingStep[]> {
    const steps: ClientOnboardingStep[] = [
      {
        id: uuid(),
        clientId,
        step: 1,
        title: 'Connect Integration',
        description: 'Connect your Jobber account',
        metadata: { type: 'jobber' },
      },
      {
        id: uuid(),
        clientId,
        step: 2,
        title: 'Setup Billing',
        description: 'Configure payment method',
        metadata: { type: 'stripe' },
      },
      {
        id: uuid(),
        clientId,
        step: 3,
        title: 'Configure Dashboard',
        description: 'Customize dashboard widgets',
        metadata: { type: 'dashboard' },
      },
      {
        id: uuid(),
        clientId,
        step: 4,
        title: 'Enable AI Phone',
        description: 'Set up AI receptionist',
        metadata: { type: 'ai-phone' },
      },
      {
        id: uuid(),
        clientId,
        step: 5,
        title: 'Launch',
        description: 'Go live!',
        metadata: { type: 'launch' },
      },
    ];

    return steps;
  }

  async completeOnboardingStep(
    clientId: string,
    step: number
  ): Promise<ClientOnboardingStep | null> {
    return {
      id: uuid(),
      clientId,
      step: step as any,
      title: `Step ${step}`,
      description: `Completed step ${step}`,
      completedAt: new Date(),
      metadata: {},
    };
  }

  // Payment Management
  async recordPayment(clientId: string, amount: number): Promise<PaymentRecord> {
    const now = new Date();
    return {
      id: uuid(),
      clientId,
      amount,
      currency: 'USD',
      status: 'pending',
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      createdAt: now,
    };
  }

  async getPaymentHistory(clientId: string, limit = 12): Promise<PaymentRecord[]> {
    const records: PaymentRecord[] = [];
    const now = new Date();

    for (let i = 0; i < limit; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(monthDate.getMonth() - i);

      records.push({
        id: uuid(),
        clientId,
        amount: 299.99,
        currency: 'USD',
        status: i === 0 ? 'pending' : 'paid',
        period: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
        createdAt: monthDate,
        paidAt: i === 0 ? undefined : monthDate,
      });
    }

    return records;
  }

  // Analytics
  async getClientDashboardData(clientId: string) {
    const client = await this.getClient(clientId);
    const integrations = await this.getIntegrations(clientId);
    const health = await this.getClientHealth(clientId);
    const metrics = await this.getClientMetrics(clientId);
    const payments = await this.getPaymentHistory(clientId, 3);

    return {
      client,
      integrations,
      health,
      metrics,
      payments,
      timestamp: new Date(),
    };
  }
}
