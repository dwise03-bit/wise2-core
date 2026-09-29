/**
 * Marketing attribution types (Phase 7).
 *
 * Note the absence of `tenantId` on every filter in this file. Tenant comes
 * from the authenticated session via TenantGuard, never from the payload.
 */

/**
 * Funnel counts for one bucket (a campaign, the unattributed bucket, or the
 * tenant total), preserving the chain CAMPAIGN → LEAD → CONVERSATION →
 * BOOKING → ESTIMATE → SOLD JOB → REVENUE.
 *
 * Each stage is counted independently over the same lead cohort rather than
 * being derived from the previous one, so a lead that skipped a step (a
 * walk-in booked with no logged conversation, say) is still counted at the
 * stages it did reach instead of being silently dropped. A consequence is
 * that a stage-over-previous rate can exceed 1 on such data; that is real
 * signal about the pipeline and is not clamped away.
 */
export interface AttributionCounts {
  /** Leads generated (chain stage: LEAD). */
  leads: number;
  /** Leads with at least one Conversation (chain stage: CONVERSATION). */
  contacted: number;
  /** Leads that reached a booking (chain stage: BOOKING). */
  booked: number;
  /** Leads with at least one Estimate (chain stage: ESTIMATE). */
  estimated: number;
  /** Leads with at least one SOLD Estimate (chain stage: SOLD JOB). */
  sold: number;
  /** Leads with at least one COMPLETED ServiceJob (chain stage: REVENUE). */
  completed: number;
}

/**
 * The three revenue figures are deliberately distinct and never summed
 * together — each answers a different question and they overlap by design:
 *
 * - `bookedRevenue`    — Lead.estimatedValue for booked leads. A *forecast*.
 * - `soldRevenue`      — Estimate.amount where status = SOLD. *Contracted*.
 * - `completedRevenue` — ServiceJob.revenue where status = COMPLETED. *Earned*.
 *
 * Clicks, impressions and other engagement signals are never revenue and are
 * not represented here at all.
 */
export interface AttributionRevenue {
  bookedRevenue: number;
  soldRevenue: number;
  completedRevenue: number;
}

/**
 * Rates are fractions in [0, 1], not percentages. Every one of them is a
 * division whose denominator can legitimately be zero, so all of them go
 * through `ratio()` and yield 0 rather than NaN or Infinity.
 */
export interface AttributionRates {
  /** contacted / leads */
  contactRate: number;
  /** booked / contacted */
  bookingRate: number;
  /** estimated / booked */
  estimateRate: number;
  /** sold / estimated */
  closeRate: number;
}

export interface AttributionMetrics
  extends AttributionCounts,
    AttributionRevenue,
    AttributionRates {
  /** Recorded ad spend for the bucket. */
  spend: number;
  /**
   * spend / leads. `null` — not 0 — when there are no leads: a cost per lead
   * of zero would read as "leads are free" rather than "not yet defined".
   */
  costPerLead: number | null;
  /** completedRevenue / spend. `null` when spend is 0. See service comment. */
  roas: number | null;
}

export interface CampaignAttribution extends AttributionMetrics {
  campaignId: string;
  campaignName: string;
  platform: string;
  active: boolean;
}

export interface AttributionSummary {
  range: { from: string | null; to: string | null };
  /**
   * Campaign.spend is a lifetime running total — the schema carries no
   * per-day spend rows — so a date range narrows the funnel but cannot
   * narrow spend. Flagged here so a dashboard can say so out loud instead of
   * presenting a mismatched ROAS as if the two sides shared a window.
   */
  spendIsLifetime: boolean;
  campaigns: CampaignAttribution[];
  /** Leads with no campaign attached. Spend is 0 by definition. */
  unattributed: AttributionMetrics;
  /** Campaigns + unattributed. */
  totals: AttributionMetrics;
}

/** One stage of the chain, for the funnel endpoint. */
export interface FunnelStage {
  stage:
    | 'CAMPAIGN'
    | 'LEAD'
    | 'CONVERSATION'
    | 'BOOKING'
    | 'ESTIMATE'
    | 'SOLD'
    | 'REVENUE';
  count: number;
  /** Conversion from the previous stage, 0 when the previous stage is empty. */
  conversionFromPrevious: number;
}

export interface AttributionFilter {
  /** Filters the lead cohort on Lead.createdAt. */
  from?: Date;
  to?: Date;
}
