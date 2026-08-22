import { Injectable } from '@nestjs/common';
import {
  DigitalTwinAutonomyLevel,
  DigitalTwinConsentType,
  DigitalTwinStatus,
  TenantRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../revenue-os/tenant/tenant-context';

type IntakePayload = {
  packageId?: string;
  businessName: string;
  owner?: string;
  website?: string;
  industry?: string;
  tone?: string;
  phrases?: string;
  services?: string;
  faqs?: string;
  salesRules?: string;
  escalationContact?: string;
  voiceConsent?: boolean;
  videoConsent?: boolean;
  email?: string;
};

@Injectable()
export class DigitalTwinService {
  constructor(private prisma: PrismaService) {}

  async submitPublicIntake(payload: IntakePayload) {
    const slugBase = this.slugify(payload.businessName || 'digital-twin');
    const tenant = await this.prisma.tenant.upsert({
      where: { slug: slugBase },
      update: {
        name: payload.businessName,
        state: 'ONBOARDING',
      },
      create: {
        slug: slugBase,
        name: payload.businessName,
        state: 'ONBOARDING',
      },
    });

    const digitalTwin = await this.upsertTenantTwin(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        userId: payload.email || 'public-intake',
        role: TenantRole.OWNER,
        revenueOsEnabled: tenant.revenueOsEnabled,
        vertical: 'digital-twin',
        enabledModules: [],
      },
      payload,
    );

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      digitalTwinId: digitalTwin.id,
      status: digitalTwin.status,
    };
  }

  async upsertTenantTwin(tenant: TenantContext, payload: IntakePayload) {
    const existing = await this.prisma.digitalTwin.findFirst({
      where: { tenantId: tenant.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const twin = await this.prisma.digitalTwin.upsert({
      where: { id: existing?.id ?? 'missing-id-that-will-not-match' },
      update: {
        packageId: payload.packageId,
        name: payload.businessName,
        displayName: `${payload.businessName} Digital Twin`,
        status: DigitalTwinStatus.ONBOARDING,
        onboardingStatus: 'STARTED',
        businessProfile: {
          businessName: payload.businessName,
          owner: payload.owner,
          website: payload.website,
          industry: payload.industry,
          services: payload.services,
          escalationContact: payload.escalationContact,
        },
        brandProfile: {
          tone: payload.tone,
          phrases: payload.phrases,
        },
        salesProfile: {
          rules: payload.salesRules,
        },
        supportProfile: {
          faqs: payload.faqs,
          escalationContact: payload.escalationContact,
        },
      },
      create: {
        tenantId: tenant.tenantId,
        ownerUserId: tenant.userId,
        packageId: payload.packageId,
        name: payload.businessName,
        displayName: `${payload.businessName} Digital Twin`,
        status: DigitalTwinStatus.ONBOARDING,
        onboardingStatus: 'STARTED',
        autonomyLevel: DigitalTwinAutonomyLevel.LEVEL_1,
        businessProfile: {
          businessName: payload.businessName,
          owner: payload.owner,
          website: payload.website,
          industry: payload.industry,
          services: payload.services,
          escalationContact: payload.escalationContact,
        },
        brandProfile: {
          tone: payload.tone,
          phrases: payload.phrases,
        },
        salesProfile: {
          rules: payload.salesRules,
        },
        supportProfile: {
          faqs: payload.faqs,
          escalationContact: payload.escalationContact,
        },
      },
    });

    if (payload.services || payload.faqs) {
      await this.prisma.digitalTwinKnowledgeItem.createMany({
        data: [
          payload.services
            ? {
                tenantId: tenant.tenantId,
                digitalTwinId: twin.id,
                sourceType: 'SERVICES',
                sourceName: 'Core Services',
                status: 'PENDING_REVIEW',
                metadata: { content: payload.services },
              }
            : undefined,
          payload.faqs
            ? {
                tenantId: tenant.tenantId,
                digitalTwinId: twin.id,
                sourceType: 'FAQ',
                sourceName: 'FAQ Intake',
                status: 'PENDING_REVIEW',
                metadata: { content: payload.faqs },
              }
            : undefined,
        ].filter(Boolean) as any[],
      });
    }

    await this.upsertConsent(twin.id, tenant.tenantId, DigitalTwinConsentType.VOICE_CLONING, payload.voiceConsent);
    await this.upsertConsent(twin.id, tenant.tenantId, DigitalTwinConsentType.VIDEO_LIKENESS, payload.videoConsent);

    return twin;
  }

  async getSummary(tenant: TenantContext) {
    const twin = await this.prisma.digitalTwin.findFirst({
      where: { tenantId: tenant.tenantId },
      include: {
        knowledgeItems: true,
        consents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!twin) {
      return {
        status: 'DRAFT',
        autonomyLevel: 'LEVEL_0',
        knowledgeSources: 0,
        pendingApprovals: 0,
        consents: [],
      };
    }

    const pendingApprovals = await this.prisma.approval.count({
      where: {
        tenantId: tenant.tenantId,
        status: 'PENDING',
      },
    });

    return {
      id: twin.id,
      name: twin.displayName || twin.name,
      status: twin.status,
      autonomyLevel: twin.autonomyLevel,
      knowledgeSources: twin.knowledgeItems.length,
      pendingApprovals,
      consents: twin.consents.map((consent) => ({
        type: consent.consentType,
        granted: consent.granted,
        grantedAt: consent.grantedAt,
        revokedAt: consent.revokedAt,
      })),
      updatedAt: twin.updatedAt,
    };
  }

  private async upsertConsent(
    digitalTwinId: string,
    tenantId: string,
    consentType: DigitalTwinConsentType,
    granted: boolean | undefined,
  ) {
    if (granted === undefined) {
      return;
    }

    const existing = await this.prisma.digitalTwinConsent.findFirst({
      where: { digitalTwinId, consentType },
    });

    if (existing) {
      await this.prisma.digitalTwinConsent.update({
        where: { id: existing.id },
        data: {
          granted,
          grantedAt: granted ? new Date() : existing.grantedAt,
          revokedAt: granted ? null : new Date(),
        },
      });
      return;
    }

    await this.prisma.digitalTwinConsent.create({
      data: {
        tenantId,
        digitalTwinId,
        consentType,
        granted,
        grantedAt: granted ? new Date() : null,
        revokedAt: granted ? null : new Date(),
      },
    });
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || `digital-twin-${Date.now()}`;
  }
}
