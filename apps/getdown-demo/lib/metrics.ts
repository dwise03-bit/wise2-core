import {
  CREW,
  ESTIMATES,
  FOLLOW_UPS,
  INVOICES,
  JOBS,
  LIGHTING,
  OPPORTUNITIES,
  PROPERTIES,
  REVENUE_SERIES,
  REVIEWS,
  TODAY,
} from './data/seed';
import type { Estimate } from './data/types';

export const money = (n: number, opts: { cents?: boolean } = {}) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  });

export const compactMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

export const pct = (n: number) => `${Math.round(n)}%`;

export const shortDate = (iso: string) => {
  if (!iso || iso === '—') return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const longDate = (iso: string) => {
  if (!iso || iso === '—') return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export const estimateTotals = (e: Estimate) => {
  const subtotal = e.lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const afterDiscount = subtotal - e.discount;
  const tax = afterDiscount * e.taxRate;
  const total = afterDiscount + tax;
  return { subtotal, discount: e.discount, tax, total, deposit: total * (e.depositPct / 100) };
};

export const estimateTotal = (e: Estimate) => estimateTotals(e).total;

const thisMonth = TODAY.slice(0, 7);

/** Every KPI on the owner dashboard — all derived from the demo seed. */
export function ownerMetrics() {
  const completedJobs = JOBS.filter((j) => j.status === 'completed');
  const revenueMtd =
    INVOICES.filter((i) => i.issued.startsWith(thisMonth)).reduce((s, i) => s + i.amount, 0) +
    32100; // earlier-month collections closed in-month — DEMO DATA
  const revenueYtd = REVENUE_SERIES.slice(4).reduce(
    (s, m) => s + m.recurring + m.project + m.lighting,
    0,
  );
  const openEstimates = ESTIMATES.filter((e) => ['sent', 'opened'].includes(e.status));
  const estimateValue = openEstimates.reduce((s, e) => s + estimateTotal(e), 0);
  const outstanding = INVOICES.filter((i) => i.status !== 'paid').reduce(
    (s, i) => s + (i.amount - i.paid),
    0,
  );
  const recurringAnnual = PROPERTIES.reduce((s, p) => s + p.contractValue, 0);
  const wonOpps = OPPORTUNITIES.filter((o) => ['won', 'scheduled', 'completed'].includes(o.stage));
  const decided = OPPORTUNITIES.filter((o) =>
    ['won', 'scheduled', 'completed', 'lost'].includes(o.stage),
  );
  const closeRate = (wonOpps.length / Math.max(decided.length, 1)) * 100;
  const pipelineValue = OPPORTUNITIES.filter(
    (o) => !['completed', 'lost'].includes(o.stage),
  ).reduce((s, o) => s + o.value, 0);
  const weightedPipeline = OPPORTUNITIES.filter(
    (o) => !['completed', 'lost'].includes(o.stage),
  ).reduce((s, o) => s + (o.value * o.probability) / 100, 0);

  return {
    revenueMtd,
    revenueYtd,
    jobsCompleted: completedJobs.length,
    jobsScheduled: JOBS.filter((j) => j.date >= TODAY).length,
    openEstimates: openEstimates.length,
    estimateValue,
    newLeads: OPPORTUNITIES.filter((o) => ['new', 'contacted'].includes(o.stage)).length,
    bookedJobs: wonOpps.length,
    recurringAnnual,
    recurringMonthly: Math.round(recurringAnnual / 12),
    outstanding,
    avgTicket: Math.round(
      completedJobs.reduce((s, j) => s + j.value, 0) / Math.max(completedJobs.length, 1),
    ),
    closeRate,
    pipelineValue,
    weightedPipeline,
    activeContracts: PROPERTIES.filter((p) => p.frequency !== 'One-Time').length,
    lightingPipeline: LIGHTING.filter((l) => l.stage !== 'installed').reduce(
      (s, l) => s + l.price,
      0,
    ),
    followUps: FOLLOW_UPS.length,
    avgRating: REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length,
    reviewCount: 118,
    crewUtilization:
      (CREW.reduce((s, c) => s + c.hoursBooked, 0) /
        CREW.reduce((s, c) => s + c.hoursCapacity, 0)) *
      100,
  };
}

export const STAGE_META: Record<
  string,
  { label: string; accent: string; hint: string }
> = {
  new: { label: 'New Lead', accent: '#22B8FF', hint: 'Captured, not yet worked' },
  contacted: { label: 'Contacted', accent: '#4FC8FF', hint: 'First touch made' },
  site_visit: { label: 'Site Visit / Estimate', accent: '#A66BFF', hint: 'Walking the property' },
  estimate_sent: { label: 'Estimate Sent', accent: '#FFB020', hint: 'Waiting on the customer' },
  follow_up: { label: 'Follow-Up', accent: '#FF8A3D', hint: 'Needs another touch' },
  won: { label: 'Won / Booked', accent: '#7CFF3D', hint: 'Approved, ready to schedule' },
  scheduled: { label: 'Scheduled', accent: '#5EE0A8', hint: 'On the board' },
  completed: { label: 'Completed', accent: '#3FA46E', hint: 'Work delivered' },
  lost: { label: 'Lost', accent: '#FF4D5E', hint: 'Closed without the work' },
};

export const JOB_STATUS_META: Record<string, { label: string; color: string }> = {
  unassigned: { label: 'Unassigned', color: '#8AA0B8' },
  traveling: { label: 'Traveling', color: '#22B8FF' },
  arrived: { label: 'Arrived', color: '#A66BFF' },
  in_progress: { label: 'In Progress', color: '#FFB020' },
  completed: { label: 'Completed', color: '#7CFF3D' },
  needs_follow_up: { label: 'Needs Follow-Up', color: '#FF4D5E' },
};
