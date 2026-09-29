import { Injectable, Logger } from '@nestjs/common';
import { SafetyRiskType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface SafetyDetection {
  riskType: SafetyRiskType;
  matchedTerm: string;
}

export interface SafetyOutcome {
  safe: boolean;
  detection?: SafetyDetection;
  /** Tenant-approved copy to speak/send. Never AI-generated. */
  script?: string;
}

/**
 * Default escalation language, used when a tenant has not supplied its own.
 *
 * Deliberately does not diagnose, does not instruct the caller to inspect or
 * repair anything, and does not estimate risk. It tells them to leave and
 * call the emergency line. Any change here is a safety change.
 */
const DEFAULT_SAFETY_SCRIPT =
  'For your safety, please stop what you are doing, leave the building now, ' +
  'and call 911 or your gas utility emergency line from outside. ' +
  'Do not use light switches, appliances, or phones indoors. ' +
  'A member of our team will follow up with you as soon as possible.';

/**
 * Terms are matched on word boundaries against lowercased text. Ordering
 * matters only for which term is reported first; any match halts the flow.
 *
 * This list is intentionally broad. A false positive costs one unnecessary
 * escalation; a false negative means an AI kept selling to someone standing
 * in a house that smells of gas.
 */
const RISK_TERMS: Array<{ risk: SafetyRiskType; terms: string[] }> = [
  {
    risk: SafetyRiskType.GAS_ODOR,
    terms: [
      'smell gas', 'smells like gas', 'gas smell', 'smell of gas', 'gas leak',
      'rotten egg', 'rotten eggs', 'sulfur smell', 'propane smell', 'smell propane',
    ],
  },
  {
    risk: SafetyRiskType.CARBON_MONOXIDE,
    terms: [
      'carbon monoxide', 'co detector', 'co alarm', 'co2 alarm',
      'monoxide alarm', 'headache and dizzy', 'dizzy and nauseous',
    ],
  },
  {
    risk: SafetyRiskType.SMOKE,
    terms: ['smoke coming', 'smoking', 'smoke from', 'house is smoky', 'smell smoke'],
  },
  {
    risk: SafetyRiskType.FIRE,
    terms: ['on fire', 'flames', 'fire in', 'caught fire', 'burning up'],
  },
  {
    risk: SafetyRiskType.ELECTRICAL_BURNING,
    terms: [
      'burning smell', 'smells like burning', 'burning plastic',
      'electrical smell', 'smells electrical', 'melting smell',
    ],
  },
  {
    risk: SafetyRiskType.ARCING,
    terms: ['arcing', 'sparking', 'sparks', 'popping sound electrical'],
  },
  {
    risk: SafetyRiskType.ELECTRICAL_HAZARD,
    terms: [
      'shocked me', 'electric shock', 'exposed wire', 'exposed wires',
      'live wire', 'breaker keeps tripping', 'panel is hot',
    ],
  },
  {
    risk: SafetyRiskType.REFRIGERANT_EXPOSURE,
    terms: [
      'refrigerant leak', 'freon leak', 'refrigerant exposure',
      'chemical smell', 'trouble breathing',
    ],
  },
  {
    risk: SafetyRiskType.IMMEDIATE_DANGER,
    terms: [
      'emergency', 'someone is hurt', 'call 911', 'passed out',
      'unconscious', 'evacuating', 'evacuate',
    ],
  },
];

/**
 * HVAC safety gate (Phase 4).
 *
 * When a high-risk trigger is present the normal sales/diagnosis flow stops.
 * The AI must not offer a diagnosis, must not suggest repairs, and must use
 * tenant-approved language only.
 */
@Injectable()
export class HvacSafetyService {
  private readonly logger = new Logger('RevenueOS/HvacSafety');

  constructor(private prisma: PrismaService) {}

  /**
   * Pure detection, no side effects — safe to call anywhere, including
   * inside classification, without writing to the database.
   */
  detect(text: string | null | undefined): SafetyDetection | null {
    if (!text) {
      return null;
    }

    const haystack = text.toLowerCase();

    for (const group of RISK_TERMS) {
      for (const term of group.terms) {
        if (haystack.includes(term)) {
          return { riskType: group.risk, matchedTerm: term };
        }
      }
    }

    return null;
  }

  /**
   * Run the gate for a tenant. Logs a SafetyEvent whenever it trips, so
   * every halt is auditable, and returns the tenant's approved script.
   */
  async evaluate(
    tenantId: string,
    text: string | null | undefined,
    leadId?: string,
  ): Promise<SafetyOutcome> {
    const detection = this.detect(text);

    if (!detection) {
      return { safe: true };
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { safetyScript: true },
    });

    // Log before returning: a halt that is not recorded cannot be reviewed.
    await this.prisma.safetyEvent.create({
      data: {
        tenantId,
        leadId,
        riskType: detection.riskType,
        matchedTerm: detection.matchedTerm,
        sourceText: text ?? undefined,
        escalated: true,
        escalatedTo: 'human',
      },
    });

    this.logger.warn(
      `Safety gate tripped for tenant ${tenantId}: ${detection.riskType}`,
    );

    return {
      safe: false,
      detection,
      script: tenant?.safetyScript || DEFAULT_SAFETY_SCRIPT,
    };
  }

  /** Exposed for tests and for tenants reviewing the fallback copy. */
  static get defaultScript(): string {
    return DEFAULT_SAFETY_SCRIPT;
  }
}
