import { Injectable } from '@nestjs/common';
import { HvacServiceCategory, LeadUrgency } from '@prisma/client';

export interface Classification {
  category: HvacServiceCategory;
  urgency: LeadUrgency;
  /** Terms that drove the decision, for auditability. */
  signals: string[];
}

const CATEGORY_TERMS: Array<{ category: HvacServiceCategory; terms: string[] }> = [
  {
    category: HvacServiceCategory.NO_COOLING,
    terms: ['no cool', 'not cooling', 'ac not working', 'ac is out', 'blowing warm', 'no ac'],
  },
  {
    category: HvacServiceCategory.NO_HEAT,
    terms: ['no heat', 'not heating', 'furnace not', 'heater not', 'blowing cold', 'heat is out'],
  },
  {
    category: HvacServiceCategory.WATER_OR_CONDENSATE_LEAK,
    terms: ['leaking water', 'water leak', 'condensate', 'drain pan', 'dripping'],
  },
  {
    category: HvacServiceCategory.THERMOSTAT,
    terms: ['thermostat', 'nest', 'ecobee', 'blank screen'],
  },
  {
    category: HvacServiceCategory.INDOOR_AIR_QUALITY,
    terms: ['air quality', 'humidity', 'humidifier', 'air purifier', 'dust', 'allergies'],
  },
  {
    category: HvacServiceCategory.EQUIPMENT_REPLACEMENT,
    terms: ['replace', 'replacement', 'new system', 'new unit', 'quote for a new'],
  },
  {
    category: HvacServiceCategory.PREVENTATIVE_MAINTENANCE,
    terms: ['maintenance', 'tune up', 'tune-up', 'check up', 'service plan', 'seasonal'],
  },
  {
    category: HvacServiceCategory.COMMERCIAL_HVAC,
    terms: ['commercial', 'rooftop unit', 'rtu', 'our office', 'our building', 'restaurant'],
  },
  {
    category: HvacServiceCategory.BILLING,
    terms: ['invoice', 'billing', 'my bill', 'payment', 'refund', 'charged'],
  },
];

const URGENCY_TERMS: Array<{ urgency: LeadUrgency; terms: string[] }> = [
  {
    urgency: LeadUrgency.EMERGENCY,
    terms: ['emergency', 'right now', 'asap', 'urgent', 'elderly', 'infant', 'baby', 'no air at all'],
  },
  { urgency: LeadUrgency.SAME_DAY, terms: ['today', 'this afternoon', 'tonight', 'as soon as'] },
  { urgency: LeadUrgency.THIS_WEEK, terms: ['this week', 'few days', 'by friday', 'soon'] },
];

/**
 * Intent and urgency classification for HVAC (Phase 4).
 *
 * Deterministic keyword matching rather than an LLM call: it is auditable,
 * free, instant, and cannot hallucinate a category. Agents may enrich this
 * later, but the stored classification always has a traceable reason.
 *
 * Vertical-neutral by construction — this service is only consulted for
 * tenants whose vertical is HVAC; the core Lead model keeps a free-form
 * serviceType for everyone else.
 */
@Injectable()
export class HvacClassifierService {
  classify(text: string | null | undefined): Classification {
    const haystack = (text ?? '').toLowerCase();
    const signals: string[] = [];

    let category: HvacServiceCategory = HvacServiceCategory.OTHER;
    for (const group of CATEGORY_TERMS) {
      const hit = group.terms.find((t) => haystack.includes(t));
      if (hit) {
        category = group.category;
        signals.push(hit);
        break;
      }
    }

    let urgency: LeadUrgency = LeadUrgency.FLEXIBLE;
    for (const group of URGENCY_TERMS) {
      const hit = group.terms.find((t) => haystack.includes(t));
      if (hit) {
        urgency = group.urgency;
        signals.push(hit);
        break;
      }
    }

    // No heat or no cooling with no stated timeframe is still same-day work
    // in practice; treating it as "flexible" loses bookable revenue.
    if (
      urgency === LeadUrgency.FLEXIBLE &&
      (category === HvacServiceCategory.NO_COOLING ||
        category === HvacServiceCategory.NO_HEAT)
    ) {
      urgency = LeadUrgency.SAME_DAY;
      signals.push('implied:no-conditioning');
    }

    return { category, urgency, signals };
  }
}
