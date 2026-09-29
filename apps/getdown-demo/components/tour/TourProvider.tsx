'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSpeech } from '@/lib/speech';

export interface TourStep {
  id: string;
  route: string;
  title: string;
  body: string;
  benefit: string;
  anchor?: string; // data-tour attribute to spotlight
  /** Spoken script — written for the ear, not the eye. */
  narration: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview',
    route: '/',
    title: '1 · Business Overview',
    body: 'Every number that describes the health of Get Down, on one screen, updated as work happens.',
    benefit: 'You stop reconstructing the business from memory at the end of the month.',
    anchor: 'kpis',
    narration:
      "Alright \u2014 welcome to the Get Down command center. I'm your guide, and I'll walk you through this in about six minutes. Start right here at the top. This row is the health of your whole business on one screen. Revenue this month. Revenue this year. The recurring revenue sitting underneath all of it. Open estimates, and your close rate. Every one of these is live, and every one of them is clickable. Right now, you're probably piecing most of this together from memory at the end of the month. This is that same picture, updating as the work happens.",
  },
  {
    id: 'pipeline',
    route: '/leads',
    title: '2 · Lead Pipeline',
    body: 'Every opportunity sits in a stage with an owner, a value, and a next action. Drag a card to move the deal.',
    benefit: 'Nothing dies in a text thread. Every lead has a visible next step.',
    anchor: 'pipeline',
    narration:
      "This is every opportunity you've got, sorted by where it actually stands. New lead. Contacted. Site visit. Estimate sent. Follow up. Won. Each card carries the customer, the property, what it's worth, who owns it, and, most importantly, the next action. You can grab a card and drag it to move the deal. Here's the whole point of this board. Nothing dies quietly in a text thread anymore. If a lead's going cold, you can see it from across the room.",
  },
  {
    id: 'estimates',
    route: '/estimates',
    title: '3 · Estimate Management',
    body: 'Good / Better / Best packages, deposits, and live status — sent, opened, approved.',
    benefit: 'You can see which estimates were opened but never approved. That list is money.',
    anchor: 'estimates',
    narration:
      "Estimates. Good, better, and best packaging, with deposits and add-ons built right in. But look at the status column, because this is the part that pays for the entire system. It tells you which estimates the customer opened, and then never approved. Right now that's a handful of quotes worth tens of thousands of dollars. Those people looked at your price, and then life got in the way. That list, worked properly, is the cheapest revenue in this business.",
  },
  {
    id: 'dispatch',
    route: '/dispatch',
    title: '4 · Schedule and Dispatch',
    body: 'Unassigned work on the left, the crew timeline in the middle, the territory map on the right. Drag a job onto a crew.',
    benefit: 'You see crew capacity before you promise a date.',
    anchor: 'dispatch',
    narration:
      "So this is the day. Unassigned work on the left, your crew timeline in the middle, and the territory map over on the right. You drag a job from the left onto a crew, and it's scheduled. Now watch the capacity bars under each name. That's the number that really matters, because it tells you whether you can say yes to a property manager before you promise them a date. And notice the Kingsley Court job is flagged. It can't be scheduled, because the insurance certificate hasn't come back yet. Hold that thought. We'll come back to it.",
  },
  {
    id: 'customer',
    route: '/customers',
    title: '5 · Customer 360',
    body: 'One record per relationship: properties, jobs, estimates, invoices, documents, reviews, and the full timeline.',
    benefit: 'Any crew member can answer a property manager without calling you.',
    anchor: 'customers',
    narration:
      "One record per relationship. Open any customer and you've got their properties, every job, every estimate, every invoice and payment, their documents, their reviews, and one single timeline of the whole relationship in order. Here's why that matters for you specifically. Today, when a property manager calls with a question, they get you, because the answer lives in your head. With this, anybody on your crew can answer it.",
  },
  {
    id: 'properties',
    route: '/properties',
    title: '6 · Multifamily Property Management',
    body: 'The commercial backbone. Buildings, units, COI status, contract value, service history, and expansion surface area.',
    benefit: 'Properties are the asset. This is the register of that asset.',
    anchor: 'properties',
    narration:
      "This is the commercial backbone, and honestly, it's the heart of the whole system. Every property, with its management company, how many buildings and units, the insurance certificate status, what the contract's worth, when it was last serviced, and when it's due next. You don't chase houses. You maintain communities. These properties are the real asset this business is built on. And this is the register of that asset.",
  },
  {
    id: 'contracts',
    route: '/contracts',
    title: '7 · Recurring Contracts',
    body: 'Annual contract value, monthly recurring revenue, renewals, contracts at risk, and expansion opportunities per property.',
    benefit: 'Protecting recurring revenue is cheaper than replacing it.',
    anchor: 'contracts',
    narration:
      "Now, the recurring engine. Annual contract value up top, monthly recurring revenue beside it, renewals coming due, and any contracts at risk. Now scroll down. Every property shows a coverage bar. That bar is the share of the property you're already cleaning, versus the surfaces you aren't. Dumpster pads. Gutters. Walkways. Roofs. You're already on site. Already mobilized. Already trusted. Growing a property you've already won is far cheaper than going out and winning a new one.",
  },
  {
    id: 'lighting',
    route: '/lighting',
    title: '8 · Permanent Lighting Pipeline',
    body: 'A separate revenue engine with its own stages, linear footage, install calendar, and six year-round campaigns.',
    benefit: 'The lighting division runs all year, not just in December.',
    anchor: 'lighting',
    narration:
      "Here's the second revenue engine. Permanent lighting gets its own pipeline, because it sells differently. Linear footage, site assessment, colour and design selection, then installation. And look at the campaigns across the top. Halloween. Christmas. Valentine's. Fourth of July. Game day. And warm weather. Six of them. This is exactly what stops lighting from being a December business. The content gets filmed and built months before the demand ever shows up.",
  },
  {
    id: 'followups',
    route: '/follow-ups',
    title: '9 · Follow-Up Automation',
    body: 'Every reason to reach out becomes a queued task with a drafted message — estimates, renewals, past-due invoices, COIs.',
    benefit: 'The follow-up that never happened is the most expensive thing in this business.',
    anchor: 'followups',
    narration:
      "This might just be the most valuable screen in here. Every reason to reach out becomes a task, automatically. An estimate went quiet. A contract's up for renewal. An invoice is past due. A certificate of insurance is blocking work. Open any one of them, and the message is already written, in your voice, ready to go. But it doesn't send. You approve it first. Because the follow-up that never happened is the single most expensive thing in a business like this one.",
  },
  {
    id: 'ai',
    route: '/ai',
    title: '10 · AI Command Center',
    body: 'Four connected assistants — Operations, Inbox, Document, and Marketing — reading the same business.',
    benefit: 'Administrative work gets drafted for you. You stay the approver.',
    anchor: 'ai',
    narration:
      "Four assistants, all reading the same business. Operations knows your schedule, your jobs, and your money. You can just ask it which estimates haven't closed. Inbox reads your email each morning and tells you what actually matters. Document handles the certificates and the paperwork. And Marketing turns finished jobs into content. Every one of them drafts. Not one of them sends. You stay the approver on anything that leaves this building.",
  },
  {
    id: 'content',
    route: '/marketing',
    title: '11 · Content Engine',
    body: 'Completed jobs become the content library. Select assets, click Create Content, review the drafts.',
    benefit: 'The work you already did becomes the marketing that wins the next property.',
    anchor: 'content',
    narration:
      "Every job your crew finishes feeds this library. Before and after pairs, job footage, crew shots, lighting installs. You pick the ones you want, hit create content, and you get a video concept, captions, an educational post, a Google Business post, and email copy. The work you already did becomes the marketing that wins you the next property. And nothing here posts on its own.",
  },
  {
    id: 'growth',
    route: '/growth',
    title: '12 · Owner Growth View',
    body: 'The controlled growth loop with the numbers underneath it: crew capacity, booked workload, pipeline, revenue per crew.',
    benefit: 'You add equipment and people when the data says the work is already secured.',
    anchor: 'growth',
    narration:
      "Last one. And this is the one built specifically for you. Win the property. Secure the revenue. Then add the equipment, or the helper. Train the crew. Step out. The crew operates. Win the next property. And underneath the loop are the actual numbers that tell you when to take each step. Crew capacity. Booked workload. Pipeline value. Revenue per crew. You don't buy the truck and hope. You buy it after the contract is signed. That's the whole idea. Let me show you what this adds up to.",
  },
];

interface TourCtx {
  active: boolean;
  index: number;
  step: TourStep | null;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goto: (i: number) => void;
  finished: boolean;
  dismissFinish: () => void;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  /** Single shared voice engine — the guide and the assistant must not talk over each other. */
  voice: ReturnType<typeof useSpeech>;
}

const Ctx = createContext<TourCtx | null>(null);

export function useTour() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTour must be used inside TourProvider');
  return c;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const voice = useSpeech();
  const { speakTrack, cancel } = voice;

  const step = active ? TOUR_STEPS[index] ?? null : null;

  // Keep the route in sync with the active step.
  useEffect(() => {
    if (step && pathname !== step.route) router.push(step.route);
  }, [step, pathname, router]);

  // Narrate each step once the route has settled. Plays the pre-rendered track
  // and falls back to live synthesis if the audio cannot be loaded.
  useEffect(() => {
    if (!step) return;
    const t = setTimeout(() => speakTrack(step.id, step.narration), 340);
    return () => clearTimeout(t);
  }, [step, speakTrack]);

  const start = useCallback(() => {
    setFinished(false);
    setIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    cancel();
  }, [cancel]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= TOUR_STEPS.length - 1) {
        setActive(false);
        setFinished(true);
        return i;
      }
      return i + 1;
    });
  }, []);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goto = useCallback((i: number) => setIndex(Math.min(TOUR_STEPS.length - 1, Math.max(0, i))), []);

  // Presenter keyboard control — arrows and space advance the walkthrough.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, prev, stop]);

  const value = useMemo(
    () => ({
      active,
      index,
      step,
      start,
      stop,
      next,
      prev,
      goto,
      finished,
      dismissFinish: () => setFinished(false),
      demoMode,
      setDemoMode,
      voice,
    }),
    [active, index, step, start, stop, next, prev, goto, finished, demoMode, voice],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
