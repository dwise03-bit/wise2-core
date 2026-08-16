import { Injectable } from '@nestjs/common';
import { PricingPlan } from '@prisma/client';

/**
 * Canonical Entitlements Engine
 * Maps PricingPlan to product capabilities
 * Used for feature gating and access control
 */

export interface PlanEntitlements {
  canAccessSoundLabs: boolean;
  canGenerateMusic: boolean;
  canUseVoiceTools: boolean;
  canExportAudio: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseAutomation: boolean;
  monthlyGenerations: number | null; // null = unlimited
  projectLimit: number | null; // null = unlimited
  storageGbLimit: number | null; // null = unlimited
  teamSeats: number;
}

@Injectable()
export class EntitlementsService {
  /**
   * Get entitlements for a pricing plan
   * Single source of truth for feature availability
   * SECURITY: Unknown plans fail closed (defaults to FREE tier)
   */
  getEntitlements(plan: PricingPlan): PlanEntitlements {
    const PLAN_ENTITLEMENTS: Record<PricingPlan, PlanEntitlements> = {
      FREE: {
        canAccessSoundLabs: false,
        canGenerateMusic: false,
        canUseVoiceTools: false,
        canExportAudio: false,
        canUseAdvancedAnalytics: false,
        canUseAutomation: false,
        monthlyGenerations: 0,
        projectLimit: 1,
        storageGbLimit: 1,
        teamSeats: 1,
      },
      STARTER: {
        canAccessSoundLabs: true,
        canGenerateMusic: true,
        canUseVoiceTools: true,
        canExportAudio: true,
        canUseAdvancedAnalytics: false,
        canUseAutomation: false,
        monthlyGenerations: 100,
        projectLimit: 10,
        storageGbLimit: 10,
        teamSeats: 1,
      },
      PRO: {
        canAccessSoundLabs: true,
        canGenerateMusic: true,
        canUseVoiceTools: true,
        canExportAudio: true,
        canUseAdvancedAnalytics: true,
        canUseAutomation: true,
        monthlyGenerations: 500,
        projectLimit: 50,
        storageGbLimit: 100,
        teamSeats: 5,
      },
      ENTERPRISE: {
        canAccessSoundLabs: true,
        canGenerateMusic: true,
        canUseVoiceTools: true,
        canExportAudio: true,
        canUseAdvancedAnalytics: true,
        canUseAutomation: true,
        monthlyGenerations: null, // unlimited
        projectLimit: null, // unlimited
        storageGbLimit: null, // unlimited
        teamSeats: 999,
      },
    };

    const entitlements = PLAN_ENTITLEMENTS[plan];

    // SECURITY: Fail closed on unknown plans
    if (!entitlements) {
      console.warn(`[SECURITY] Unknown pricing plan: ${plan}, defaulting to FREE`);
      return PLAN_ENTITLEMENTS.FREE;
    }

    return entitlements;
  }

  /**
   * Check if user can access a specific feature
   * Used for feature gates throughout the app
   */
  canAccessFeature(plan: PricingPlan, feature: keyof Omit<PlanEntitlements, 'monthlyGenerations' | 'projectLimit' | 'storageGbLimit' | 'teamSeats'>): boolean {
    const entitlements = this.getEntitlements(plan);
    return entitlements[feature] === true;
  }

  /**
   * Check if user has reached usage limit
   */
  hasReachedGenerationLimit(plan: PricingPlan, generationsThisMonth: number): boolean {
    const entitlements = this.getEntitlements(plan);
    if (entitlements.monthlyGenerations === null) {
      return false; // unlimited
    }
    return generationsThisMonth >= entitlements.monthlyGenerations;
  }

  /**
   * Check if user has reached project limit
   */
  hasReachedProjectLimit(plan: PricingPlan, projectCount: number): boolean {
    const entitlements = this.getEntitlements(plan);
    if (entitlements.projectLimit === null) {
      return false; // unlimited
    }
    return projectCount >= entitlements.projectLimit;
  }

  /**
   * Get plan upgrade required message
   */
  getUpgradeMessage(plan: PricingPlan, feature: string): string {
    const UPGRADE_MESSAGES: Record<PricingPlan, string> = {
      FREE: `Sound Labs requires WISE² Starter plan or higher. Upgrade to unlock full music generation capabilities.`,
      STARTER: `Advanced analytics available with WISE² Pro plan.`,
      PRO: `Custom team seats and unlimited projects available with WISE² Enterprise.`,
      ENTERPRISE: `You have full access to all WISE² features.`,
    };

    return UPGRADE_MESSAGES[plan];
  }
}
