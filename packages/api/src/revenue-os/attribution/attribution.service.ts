import { Injectable, NotFoundException } from '@nestjs/common';
import { EstimateStatus, LeadStatus, Prisma, ServiceJobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { withTenant } from '../../common/prisma/tenant-isolation';
import {
  AttributionFilter,
  AttributionMetrics,
  AttributionSummary,
  CampaignAttribution,
  FunnelStage,
} from './attribution.types';

/**
 * Marketing attribution, tenant-scoped.
 *
 * Preserves the full chain CAMPAIGN → LEAD → CONVERSATION → BOOKING →
 * ESTIMATE → SOLD JOB → REVENUE by working from a lead cohort: leads are
 * selected first (scoped by tenant, optionally by createdAt), and everything
 * downstream is joined to those leads. Conversations, estimates and jobs that
 * are not linked to a lead are outside the chain and are deliberately not
 * attributed to any campaign — inventing a link would be the same class of
 * mistake as counting clicks as revenue.
 *
 * Every method takes `tenantId` as its first argument and every Prisma call
 * filters on it. There is no code path that reads a tenant id from a request.
 */
@Injectable()
export class AttributionService {
  constructor(private prisma: PrismaService) {}

  /** Attribution for every campaign, plus unattributed leads and totals. */
  async summary(
    tenantId: string,
    filter: AttributionFilter = {},
  ): Promise<AttributionSummary> {
    const [campaigns, cohort] = await Promise.all([
      this.prisma.campaign.findMany({
        where: withTenant(tenantId),
        orderBy: { createdAt: 'desc' },
      }),
      this.loadCohort(tenantId, filter),
    ]);

    const perCampaign: CampaignAttribution[] = campaigns.map((campaign) => ({
      campaignId: campaign.id,
      campaignName: campaign.campaignName,
      platform: campaign.platform,
      active: campaign.active,
      ...this.metricsFor(
        cohort,
        (leadCampaignId) => leadCampaignId === campaign.id,
        toNumber(campaign.spend),
      ),
    }));

    // Leads with no campaign attached. Spend is 0 by definition, which is why
    // costPerLead and roas come back null here rather than as a number.
    const unattributed = this.metricsFor(cohort, (id) => id === null, 0);

    const totalSpend = campaigns.reduce((sum, c) => sum + toNumber(c.spend), 0);
    const totals = this.metricsFor(cohort, () => true, totalSpend);

    return {
      range: {
        from: filter.from ? filter.from.toISOString() : null,
        to: filter.to ? filter.to.toISOString() : null,
      },
      spendIsLifetime: true,
      campaigns: perCampaign,
      unattributed,
      totals,
    };
  }

  /** Attribution for a single campaign. */
  async forCampaign(
    tenantId: string,
    campaignId: string,
    filter: AttributionFilter = {},
  ): Promise<CampaignAttribution> {
    // findFirst with the tenant in the where clause, not findUnique by id and
    // a check afterwards: the latter leaks the existence of foreign rows.
    const campaign = await this.prisma.campaign.findFirst({
      where: withTenant(tenantId, { id: campaignId }),
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const cohort = await this.loadCohort(tenantId, filter, campaignId);

    return {
      campaignId: campaign.id,
      campaignName: campaign.campaignName,
      platform: campaign.platform,
      active: campaign.active,
      ...this.metricsFor(cohort, () => true, toNumber(campaign.spend)),
    };
  }

  /** The chain as ordered stages, for a funnel view. */
  async funnel(
    tenantId: string,
    filter: AttributionFilter = {},
  ): Promise<FunnelStage[]> {
    const [campaignCount, cohort] = await Promise.all([
      this.prisma.campaign.count({ where: withTenant(tenantId) }),
      this.loadCohort(tenantId, filter),
    ]);

    const m = this.metricsFor(cohort, () => true, 0);

    const ordered: Array<{ stage: FunnelStage['stage']; count: number }> = [
      { stage: 'CAMPAIGN', count: campaignCount },
      { stage: 'LEAD', count: m.leads },
      { stage: 'CONVERSATION', count: m.contacted },
      { stage: 'BOOKING', count: m.booked },
      { stage: 'ESTIMATE', count: m.estimated },
      { stage: 'SOLD', count: m.sold },
      { stage: 'REVENUE', count: m.completed },
    ];

    return ordered.map((entry, index) => ({
      ...entry,
      conversionFromPrevious:
        index === 0 ? 0 : ratio(entry.count, ordered[index - 1].count),
    }));
  }

  /**
   * Loads the lead cohort and everything hanging off it.
   *
   * Five queries, each independently scoped by tenantId — the downstream
   * three are additionally restricted to the cohort's lead ids, so a row
   * belonging to another tenant cannot enter even if a lead id were guessed.
   */
  private async loadCohort(
    tenantId: string,
    filter: AttributionFilter,
    campaignId?: string,
  ): Promise<Cohort> {
    const createdAt =
      filter.from || filter.to
        ? {
            ...(filter.from ? { gte: filter.from } : {}),
            ...(filter.to ? { lte: filter.to } : {}),
          }
        : undefined;

    const leadWhere: Prisma.LeadWhereInput = {
      ...withTenant(tenantId),
      ...(campaignId ? { campaignId } : {}),
      ...(createdAt ? { createdAt } : {}),
    };

    const leads = await this.prisma.lead.findMany({
      where: leadWhere,
      select: {
        id: true,
        campaignId: true,
        status: true,
        estimatedValue: true,
        bookedAt: true,
      },
    });

    const leadIds = leads.map((l) => l.id);

    // An empty cohort means there is nothing to join to. Issuing `IN ()`
    // queries would be wasted round trips, and returning zeros here is what
    // makes an empty tenant come back clean rather than divide by nothing.
    if (leadIds.length === 0) {
      return { leads: [], conversationLeadIds: new Set(), estimates: [], jobs: [] };
    }

    const [conversations, estimates, jobs] = await Promise.all([
      this.prisma.conversation.findMany({
        where: withTenant(tenantId, { leadId: { in: leadIds } }),
        select: { leadId: true },
      }),
      this.prisma.estimate.findMany({
        where: withTenant(tenantId, { leadId: { in: leadIds } }),
        select: { leadId: true, status: true, amount: true },
      }),
      this.prisma.serviceJob.findMany({
        where: withTenant(tenantId, { leadId: { in: leadIds } }),
        select: { leadId: true, status: true, revenue: true },
      }),
    ]);

    const conversationLeadIds = new Set<string>();
    conversations.forEach((c) => {
      if (c.leadId) conversationLeadIds.add(c.leadId);
    });

    return {
      leads: leads.map((l) => ({
        id: l.id,
        campaignId: l.campaignId ?? null,
        status: l.status,
        estimatedValue: toNumber(l.estimatedValue),
        booked: isBooked(l.status, l.bookedAt),
      })),
      conversationLeadIds,
      estimates: estimates.map((e) => ({
        leadId: e.leadId ?? null,
        status: e.status,
        amount: toNumber(e.amount),
      })),
      jobs: jobs.map((j) => ({
        leadId: j.leadId ?? null,
        status: j.status,
        revenue: toNumber(j.revenue),
      })),
    };
  }

  /** Folds the cohort into KPIs for the leads selected by `selectLead`. */
  private metricsFor(
    cohort: Cohort,
    selectLead: (campaignId: string | null) => boolean,
    spend: number,
  ): AttributionMetrics {
    const leads = cohort.leads.filter((l) => selectLead(l.campaignId));
    const ids = new Set(leads.map((l) => l.id));

    const estimates = cohort.estimates.filter((e) => e.leadId && ids.has(e.leadId));
    const jobs = cohort.jobs.filter((j) => j.leadId && ids.has(j.leadId));

    const contacted = leads.filter((l) => cohort.conversationLeadIds.has(l.id)).length;
    const bookedLeads = leads.filter((l) => l.booked);

    const estimatedIds = new Set(estimates.map((e) => e.leadId as string));
    const soldEstimates = estimates.filter((e) => e.status === EstimateStatus.SOLD);
    const soldIds = new Set(soldEstimates.map((e) => e.leadId as string));

    const completedJobs = jobs.filter((j) => j.status === ServiceJobStatus.COMPLETED);
    const completedIds = new Set(completedJobs.map((j) => j.leadId as string));

    // The three revenue figures stay separate. Booked is a forecast off the
    // lead, sold is the contracted estimate, completed is money actually
    // earned on a finished job. Nothing here reads an engagement metric —
    // a click is not revenue and has no path into these sums.
    const bookedRevenue = bookedLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
    const soldRevenue = soldEstimates.reduce((sum, e) => sum + e.amount, 0);
    const completedRevenue = completedJobs.reduce((sum, j) => sum + j.revenue, 0);

    return {
      spend,
      leads: leads.length,
      contacted,
      booked: bookedLeads.length,
      estimated: estimatedIds.size,
      sold: soldIds.size,
      completed: completedIds.size,

      contactRate: ratio(contacted, leads.length),
      bookingRate: ratio(bookedLeads.length, contacted),
      estimateRate: ratio(estimatedIds.size, bookedLeads.length),
      closeRate: ratio(soldIds.size, estimatedIds.size),

      bookedRevenue,
      soldRevenue,
      completedRevenue,

      costPerLead: quotient(spend, leads.length),

      // ROAS numerator is completedRevenue: revenue that has actually been
      // earned on a finished job. Sold revenue is contracted but not yet
      // delivered and can still be cancelled, and booked revenue is only an
      // estimate — using either would report money the business does not
      // have. Both remain on the payload for anyone who wants a forward-
      // looking ratio, but the headline ROAS is the conservative one.
      roas: quotient(completedRevenue, spend),
    };
  }
}

interface CohortLead {
  id: string;
  campaignId: string | null;
  status: LeadStatus;
  estimatedValue: number;
  booked: boolean;
}

interface Cohort {
  leads: CohortLead[];
  conversationLeadIds: Set<string>;
  estimates: Array<{ leadId: string | null; status: EstimateStatus; amount: number }>;
  jobs: Array<{ leadId: string | null; status: ServiceJobStatus; revenue: number }>;
}

/**
 * A lead counts as booked if it carries a bookedAt stamp, or if its status
 * has moved past booking. Statuses beyond BOOKED imply it: a lead cannot be
 * at ESTIMATE or WON without having been booked, and older rows predate the
 * bookedAt stamp.
 */
function isBooked(status: LeadStatus, bookedAt: Date | null): boolean {
  if (bookedAt) return true;
  return (
    status === LeadStatus.BOOKED ||
    status === LeadStatus.ESTIMATE ||
    status === LeadStatus.WON
  );
}

/**
 * Rate helper. Returns 0 — never NaN or Infinity — when the denominator is
 * zero or either side is not a finite number.
 */
function ratio(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return 0;
  if (denominator === 0) return 0;
  const value = numerator / denominator;
  return Number.isFinite(value) ? value : 0;
}

/**
 * Money-per-unit helper. Returns null rather than 0 when the denominator is
 * zero: a cost per lead of 0 reads as "leads are free" and a ROAS of 0 reads
 * as "the spend earned nothing", when the truth in both cases is that the
 * ratio is undefined.
 */
function quotient(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator === 0) return null;
  const value = numerator / denominator;
  return Number.isFinite(value) ? value : null;
}

/**
 * Prisma returns Decimal columns as Decimal instances (and, through some
 * drivers, as strings). Anything unparseable becomes 0 so a single bad row
 * cannot turn an entire dashboard into NaN.
 */
function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof (value as Prisma.Decimal).toNumber === 'function') {
    const parsed = (value as Prisma.Decimal).toNumber();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
