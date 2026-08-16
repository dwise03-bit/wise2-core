'use client';

import { useState } from 'react';
import { Check, Clapperboard, Film, Sparkles, Wand2 } from 'lucide-react';
import { Badge, Button, DemoAction, Drawer, Panel, SectionHead, Tabs } from '@/components/ui/kit';
import { CAMPAIGNS, MEDIA, REVIEWS } from '@/lib/data/seed';

const CATEGORIES = [
  'All',
  'Multifamily',
  'Commercial',
  'Lighting',
  'Job Footage',
  'Crew',
  'Equipment',
  'Testimonial',
];

/** Draft content generated from the selected assets — computed, never published. */
function draftContent(titles: string[]) {
  const subject = titles[0] ?? 'the job';
  return [
    {
      kind: 'Short-Form Video Concept',
      tone: '#A66BFF',
      body: `0:00 hold on the before frame from ${subject}. 0:02 hard cut to the wand entering frame, audio up on the pressure. 0:08 speed ramp across the wall. 0:16 static after frame, same camera position as the open. End card: GET DOWN — WE GET DOWN TO THE DIRT.`,
    },
    {
      kind: 'Social Caption',
      tone: '#22B8FF',
      body: `Same wall. Same angle. Ninety minutes apart.\n\nThis is what a maintained community looks like — not a one-time clean, a program.\n\n#GetDownPressureWashing #MultifamilyMaintenance #PropertyManagement #BeforeAndAfter`,
    },
    {
      kind: 'Educational Post',
      tone: '#7CFF3D',
      body: `Why property managers move to quarterly cleaning: reactive cleaning always costs more. Organic growth on siding and concrete compounds — the longer it sits, the more aggressive (and expensive) the removal. A scheduled program keeps surfaces in the easy-to-clean band year-round.`,
    },
    {
      kind: 'Google Business Profile Post',
      tone: '#C9D4E0',
      body: `Exterior cleaning for apartment communities, townhomes, and HOAs. Scheduled programs, resident notices posted in advance, COI on file before we arrive. Request a property assessment.`,
    },
    {
      kind: 'Email Campaign',
      tone: '#FFB020',
      body: `Subject: Your fall walkthrough is coming — here is what we would flag\n\nBefore your next property walkthrough, three exterior items usually cost the most to defer: dumpster corrals, breezeway concrete, and north-facing siding. Reply and we will assess your property at no charge.`,
    },
    {
      kind: 'Landing Page Headline',
      tone: '#22B8FF',
      body: `Expert Exterior Cleaning for Multifamily Communities.\nCleaner properties. Happier residents.\n[ Request a Proposal ]  [ Our Services ]`,
    },
  ];
}

export default function MarketingPage() {
  const [cat, setCat] = useState('All');
  const [picked, setPicked] = useState<string[]>(['m1', 'm2']);
  const [output, setOutput] = useState<ReturnType<typeof draftContent> | null>(null);

  const assets = cat === 'All' ? MEDIA : MEDIA.filter((a) => a.category === cat);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Content Engine
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            Content Production → Real Work → Real Results. Authentic footage builds trust.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neon">{picked.length} assets selected</Badge>
          <Button
            variant="neon"
            onClick={() =>
              setOutput(draftContent(picked.map((id) => MEDIA.find((a) => a.id === id)?.title ?? '')))
            }
          >
            <Wand2 className="h-3.5 w-3.5" /> Create Content
          </Button>
        </div>
      </div>

      {/* Campaign calendar strip */}
      <Panel className="p-5">
        <SectionHead
          title="Seasonal Campaign Calendar"
          sub="Film early → edit early → build pages → schedule, before demand arrives"
        />
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
          {CAMPAIGNS.map((c) => (
            <div key={c.name} className="rounded-lg border border-gd-line p-3">
              <div className="h-1.5 w-full rounded-full" style={{ background: c.tone }} />
              <p className="mt-2 font-display text-[11px] font-black uppercase tracking-wider text-white">
                {c.name}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-gd-steel">{c.window}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Media library */}
        <Panel data-tour="content" className="p-5 xl:col-span-3">
          <SectionHead
            title="Media Library"
            sub="Every completed job feeds the library. Select assets, then create content."
            right={
              <Tabs
                tabs={CATEGORIES.map((c) => ({ id: c, label: c }))}
                value={cat}
                onChange={setCat}
              />
            }
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {assets.map((a) => {
              const on = picked.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`group overflow-hidden rounded-xl border text-left transition-all ${
                    on ? 'border-gd-neon/60 shadow-glow-neon' : 'border-gd-line hover:border-white/25'
                  }`}
                >
                  <div className="relative h-28" style={{ background: a.tone }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    {a.kind === 'video' && (
                      <Film className="absolute left-2.5 top-2.5 h-4 w-4 text-white/85" />
                    )}
                    <span className="absolute right-2 top-2 rounded border border-white/25 bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {a.kind}
                    </span>
                    {on && (
                      <span className="absolute bottom-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-gd-neon">
                        <Check className="h-3 w-3 text-gd-void" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-[11px] font-bold text-white">{a.title}</p>
                    <p className="truncate text-[10px] text-gd-steel">
                      {a.property} · {a.service}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-gd-steel">
            Asset thumbnails are colour stand-ins for the real job footage in this demo. In
            production, photos and video sync from the crew&apos;s uploads on each job.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <SectionHead title="Capture Types" sub="What the crew films on every job" />
            <div className="space-y-1.5">
              {[
                'Job footage',
                'Before / after pairs',
                'POV (meta glasses)',
                'Property walkthroughs',
                'Crew in action',
                'Property manager content',
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-gd-chrome"
                >
                  <Clapperboard className="h-3.5 w-3.5 text-gd-electric" />
                  {t}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHead title="Review Fuel" sub="Customer words become marketing copy" />
            <div className="space-y-2">
              {REVIEWS.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <p className="text-[11px] leading-relaxed text-gd-chrome">&ldquo;{r.text}&rdquo;</p>
                  <p className="mt-1.5 text-[10px] text-gd-steel">
                    {r.customer} · {r.property}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Drawer
        open={!!output}
        onClose={() => setOutput(null)}
        title="WISE² Marketing AI — Draft Content"
        subtitle={`Generated from ${picked.length} selected assets · nothing is published`}
        width="max-w-2xl"
      >
        {output && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-gd-amber/30 bg-gd-amber/[0.07] px-3.5 py-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-gd-amber" />
              <p className="text-[11px] leading-relaxed text-gd-amber">
                These are drafts. Publishing to any channel requires your explicit approval — no
                social post, email, or Google Business Profile update leaves this demo.
              </p>
            </div>
            {output.map((o) => (
              <Panel key={o.kind} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="font-display text-[11px] font-extrabold uppercase tracking-wider"
                    style={{ color: o.tone }}
                  >
                    {o.kind}
                  </p>
                  <DemoAction label="Approval Required" />
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gd-chrome">
                  {o.body}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="primary" size="sm">
                    Queue for Approval
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
