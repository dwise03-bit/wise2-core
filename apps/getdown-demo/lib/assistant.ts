import {
  CREW,
  CUSTOMERS,
  DOCUMENTS,
  ESTIMATES,
  FOLLOW_UPS,
  INVOICES,
  JOBS,
  LIGHTING,
  OPPORTUNITIES,
  PROPERTIES,
  REVIEWS,
  TODAY,
} from './data/seed';
import { estimateTotal, longDate, money, ownerMetrics, pct, shortDate } from './metrics';

export interface AssistantReply {
  text: string;
  rows?: string[];
  /** Route the UI should offer to open alongside the answer. */
  route?: { href: string; label: string };
}

export type AssistantId = 'operations' | 'inbox' | 'document' | 'marketing';

const has = (p: string, ...words: string[]) => words.some((w) => p.includes(w));

/**
 * The demo's answer engine.
 *
 * Every response is computed from the same seed the screens read, so the
 * assistant can never contradict what the owner is looking at. No model is
 * called and nothing leaves the browser.
 */
export function askAssistant(assistant: AssistantId, question: string): AssistantReply {
  const p = question.toLowerCase();
  const m = ownerMetrics();

  // ── Cross-cutting questions any assistant should handle ──────────────
  if (has(p, 'how is the business', 'how are we doing', 'overview', 'summary', 'how is business')) {
    return {
      text: `Revenue month to date is ${money(m.revenueMtd)}, and ${money(m.revenueYtd)} year to date. Recurring contracts carry ${money(m.recurringMonthly)} a month, which is the floor underneath everything else. There are ${m.openEstimates} open estimates worth ${money(m.estimateValue)}, and ${m.followUps} follow-ups waiting.`,
      rows: [
        `Recurring revenue: ${money(m.recurringMonthly)}/mo across ${m.activeContracts} contracts`,
        `Open pipeline: ${money(m.pipelineValue)} · weighted ${money(m.weightedPipeline)}`,
        `Outstanding invoices: ${money(m.outstanding)}`,
        `Close rate: ${pct(m.closeRate)} · average ticket ${money(m.avgTicket)}`,
        `Crew utilization: ${pct(m.crewUtilization)}`,
      ],
      route: { href: '/', label: 'Open dashboard' },
    };
  }

  if (has(p, 'risk', 'at risk', 'worried', 'problem', 'attention', 'urgent')) {
    return {
      text: `Three things need you today. The Fairgrove contract ends August 31st and that is ${money(41600)} of renewal. The Kingsley Court certificate of insurance has been outstanding twelve days and is blocking ${money(10700)} of scheduled work. And there are estimates the customer opened but never approved.`,
      rows: [
        'Fairgrove Apartments — contract ends Aug 31, COI also expiring Sep 12',
        'Kingsley Court — COI outstanding 12 days, fall service on hold',
        `Harborview Dental — ${money(1450)} invoice 111 days past due`,
        `${ESTIMATES.filter((e) => e.status === 'opened' && e.ageDays >= 7).length} estimates opened but never approved`,
      ],
      route: { href: '/follow-ups', label: 'Open follow-ups' },
    };
  }

  if (has(p, 'lighting', 'govee', 'christmas', 'halloween', 'seasonal')) {
    const open = LIGHTING.filter((l) => l.stage !== 'installed');
    return {
      text: `The lighting division has ${money(m.lightingPipeline)} open across ${open.length} opportunities. It runs year-round on six campaigns rather than just December — security and accent lighting carry the months between holidays.`,
      rows: open
        .slice(0, 6)
        .map((l) => `${l.customer.replace(/^\*/, '')} — ${l.property}: ${money(l.price)} (${l.campaign})`),
      route: { href: '/lighting', label: 'Open lighting division' },
    };
  }

  if (has(p, 'grow', 'hire', 'capacity', 'another truck', 'equipment', 'expand')) {
    return {
      text: `Crews are at ${pct(m.crewUtilization)} of weekly capacity. The rule this system enforces is that capacity follows contracts — you add the helper after the work is secured, never before. With ${money(m.weightedPipeline)} of weighted pipeline, the current crew would not absorb it all if it converts.`,
      rows: CREW.map((c) => `${c.name}: ${c.hoursBooked} of ${c.hoursCapacity} hours booked`),
      route: { href: '/growth', label: 'Open growth view' },
    };
  }

  // ── Operations ───────────────────────────────────────────────────────
  if (assistant === 'operations') {
    if (has(p, 'tomorrow', 'schedule', 'today', 'calendar', 'week')) {
      const jobs = JOBS.filter((j) => j.date >= TODAY).slice(0, 6);
      return {
        text: `There are ${JOBS.filter((j) => j.date === TODAY).length} jobs on the board today and ${jobs.length} coming up. Marcus is the tightest resource at 34 of 40 hours booked; Devin has the most room.`,
        rows: jobs.map(
          (j) => `${shortDate(j.date)} — ${j.property}: ${j.service} (${money(j.value)})`,
        ),
        route: { href: '/dispatch', label: 'Open dispatch board' },
      };
    }
    if (has(p, 'estimate', 'quote', 'proposal')) {
      const open = ESTIMATES.filter(
        (e) => ['sent', 'opened'].includes(e.status) && estimateTotal(e) > 1000,
      );
      const stalled = ESTIMATES.filter((e) => e.status === 'opened' && e.ageDays >= 7);
      return {
        text: `${open.length} estimates over one thousand dollars are still open, worth ${money(open.reduce((s, e) => s + estimateTotal(e), 0))} together. ${stalled.length} of them were opened by the customer and never approved — that list is the highest-yield follow-up you have.`,
        rows: open.map(
          (e) =>
            `${e.number} — ${e.customer.replace(/^\*/, '')}: ${money(estimateTotal(e))} (${e.status}, ${e.ageDays} days)`,
        ),
        route: { href: '/estimates', label: 'Open estimates' },
      };
    }
    if (has(p, 'propert', 'due', 'service next', 'multifamily', 'apartment')) {
      const due = PROPERTIES.filter((x) => x.nextService !== '—' && x.nextService < '2026-11-01');
      return {
        text: `${due.length} properties come due before November, and ${PROPERTIES.length} properties are under management overall — ${PROPERTIES.reduce((s, x) => s + x.buildings, 0)} buildings and ${PROPERTIES.reduce((s, x) => s + x.units, 0).toLocaleString()} units.`,
        rows: due.map(
          (x) => `${shortDate(x.nextService)} — ${x.name} (${x.frequency}, ${x.buildings} buildings)`,
        ),
        route: { href: '/properties', label: 'Open properties' },
      };
    }
    if (has(p, 'crew', 'capacity', 'thursday', 'who is free', 'available')) {
      return {
        text: 'Devin Cross has the most room at 22 of 40 hours. The lighting team has 22 hours open but only for lighting-qualified work.',
        rows: CREW.map(
          (c) => `${c.name}: ${c.hoursBooked}/${c.hoursCapacity}h — ${c.skills.join(', ')}`,
        ),
        route: { href: '/dispatch', label: 'Open dispatch board' },
      };
    }
    if (has(p, 'invoice', 'owe', 'past due', 'outstanding', 'money', 'paid', 'collect')) {
      const overdue = INVOICES.filter((i) => i.status === 'overdue');
      return {
        text: `${money(m.outstanding)} is outstanding across ${INVOICES.filter((i) => i.status !== 'paid').length} invoices, and ${overdue.length} of those are past due.`,
        rows: INVOICES.filter((i) => i.status !== 'paid')
          .slice(0, 6)
          .map(
            (i) =>
              `${i.number} — ${i.customer.replace(/^\*/, '')}: ${money(i.amount - i.paid)} outstanding, due ${longDate(i.due)}`,
          ),
        route: { href: '/invoices', label: 'Open invoices' },
      };
    }
    if (has(p, 'contract', 'recurring', 'renewal')) {
      return {
        text: `There are ${m.activeContracts} active contracts worth ${money(m.recurringAnnual)} a year, or ${money(m.recurringMonthly)} a month. Two are inside the renewal window and need attention.`,
        rows: PROPERTIES.filter((x) => x.frequency !== 'One-Time')
          .sort((a, b) => b.contractValue - a.contractValue)
          .slice(0, 6)
          .map((x) => `${x.name}: ${money(x.contractValue)}/yr, ${x.frequency}, next ${shortDate(x.nextService)}`),
        route: { href: '/contracts', label: 'Open contracts' },
      };
    }
    if (has(p, 'customer', 'client', 'who')) {
      return {
        text: `There are ${CUSTOMERS.length} customer relationships. The four property-management companies account for most of the recurring revenue.`,
        rows: CUSTOMERS.filter((c) => c.type === 'Property Management' || c.type === 'HOA')
          .map((c) => `${c.name.replace(/^\*/, '')} — ${c.properties.length} properties, ${money(c.lifetimeValue)} lifetime`),
        route: { href: '/customers', label: 'Open customers' },
      };
    }
  }

  // ── Inbox ────────────────────────────────────────────────────────────
  if (assistant === 'inbox') {
    return {
      text: 'Overnight scan complete. Thirty-four messages came in and four are worth your time. Nothing has been replied to — I never send on my own.',
      rows: [
        'URGENT — Dana Whitlock (Kestrel): Fairgrove renewal terms question. Contract ends Aug 31.',
        'LEAD — Web form, P. Okonjo (Redbud Court): driveway and walkway request, no quote yet.',
        'PM REQUEST — Tom Vasquez (Summit Ridge): asking for a COI before onboarding Millbrook.',
        'CALLBACK — Marissa Quill (Cedar Bluff Country Club): wants lighting and concrete on one mobilization.',
        'Filtered: 21 solicitations, 9 newsletters, 0 flagged as spam risk.',
      ],
      route: { href: '/calls', label: 'Open calls and messages' },
    };
  }

  // ── Documents ────────────────────────────────────────────────────────
  if (assistant === 'document') {
    const need = DOCUMENTS.filter((d) =>
      ['requested', 'expiring', 'expired', 'received'].includes(d.status),
    );
    return {
      text: `${need.length} documents need action. The Kingsley Court certificate has been outstanding twelve days and is currently blocking ten thousand seven hundred dollars of scheduled work. The Fairgrove certificate expires September 12th, nine days before their next service.`,
      rows: need.map(
        (d) =>
          `${d.type} — ${d.property}: ${d.status.toUpperCase()}${d.expiresAt ? ` (expires ${longDate(d.expiresAt)})` : ''} → ${d.nextAction}`,
      ),
      route: { href: '/documents', label: 'Open document center' },
    };
  }

  // ── Marketing ────────────────────────────────────────────────────────
  if (assistant === 'marketing') {
    return {
      text: `Drafted from the completed work in the library. Nothing is published — every asset waits for your approval. You have ${REVIEWS.length} recent reviews averaging ${m.avgRating.toFixed(1)} stars, which is the strongest raw material here.`,
      rows: [
        'REEL (0:22) — Single-building push-in, before frame holds two seconds, wipe transition on the pressure line, end card: We maintain communities.',
        'CAPTION — Fourteen buildings. Two hundred eighty-eight units. Zero resident complaints. That is what a maintained community looks like.',
        'GBP POST — Educational: why quarterly exterior cleaning costs a property less than reactive cleaning.',
        'EMAIL — Property manager list: Your fall walkthrough is coming. Here is what we would flag.',
      ],
      route: { href: '/marketing', label: 'Open content engine' },
    };
  }

  return {
    text: 'I read the whole demo workspace — schedule, jobs, properties, estimates, invoices, payments, contracts, documents, and follow-ups. Ask about revenue, what needs attention, the schedule, open estimates, contracts, the lighting division, or whether the numbers justify hiring.',
  };
}

/** Suggested prompts surfaced by the floating assistant. */
export const QUICK_ASKS = [
  'How is the business doing?',
  'What needs my attention today?',
  "Which estimates haven't closed?",
  'Show me the schedule.',
  'How is the lighting division?',
  'Can I afford to hire?',
];
