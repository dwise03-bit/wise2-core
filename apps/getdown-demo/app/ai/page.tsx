'use client';

import { useState } from 'react';
import { ArrowRight, Bot, FileText, Inbox, Megaphone, Send, Settings2, Sparkles } from 'lucide-react';
import { Badge, Button, DemoAction, Panel, SectionHead } from '@/components/ui/kit';
import Link from 'next/link';
import { AI_ASSISTANTS } from '@/lib/data/seed';
import { askAssistant, type AssistantId } from '@/lib/assistant';
import { useTour } from '@/components/tour/TourProvider';
import { GuideAvatar } from '@/components/assistant/GuideAvatar';

const ICONS = { operations: Bot, inbox: Inbox, document: FileText, marketing: Megaphone } as const;

interface LogTurn {
  role: 'user' | 'ai';
  text: string;
  rows?: string[];
  route?: { href: string; label: string };
}

export default function AICommandCenter() {
  const [active, setActive] = useState<AssistantId>('operations');
  const [input, setInput] = useState('');
  const { voice } = useTour();
  const [log, setLog] = useState<LogTurn[]>([
    {
      role: 'ai',
      text: 'Operations AI is connected to the Get Down demo workspace — schedule, jobs, properties, estimates, invoices, payments, contracts, and follow-ups. Ask a question or pick one below.',
    },
  ]);

  const assistant = AI_ASSISTANTS.find((a) => a.id === active)!;

  const ask = (q: string) => {
    if (!q.trim()) return;
    const res = askAssistant(active, q);
    setLog((l) => [...l, { role: 'user', text: q }, { role: 'ai', ...res }]);
    setInput('');
    voice.speak(res.text);
  };

  const switchTo = (id: string) => {
    setActive(id as AssistantId);
    const a = AI_ASSISTANTS.find((x) => x.id === id)!;
    const intro = `${a.name} — ${a.tagline} Ask a question or pick one below.`;
    setLog([{ role: 'ai', text: intro }]);
    voice.cancel();
  };

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
          Get Down AI Business Command Center
        </h1>
        <p className="mt-1.5 font-display text-sm font-bold uppercase tracking-[0.28em] text-gd-neon">
          Four Connected Assistants. One System.
        </p>
      </div>

      {/* Assistant selector */}
      <div data-tour="ai" className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {AI_ASSISTANTS.map((a) => {
          const Icon = ICONS[a.id as keyof typeof ICONS];
          const on = active === a.id;
          return (
            <button
              key={a.id}
              onClick={() => switchTo(a.id)}
              className="gd-panel gd-panel-hover relative overflow-hidden rounded-xl p-4 text-left transition-all"
              style={on ? { borderColor: `${a.accent}66`, background: `${a.accent}0f` } : undefined}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${a.accent}, transparent 80%)` }}
              />
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg border"
                  style={{ borderColor: `${a.accent}55`, background: `${a.accent}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: a.accent }} />
                </span>
                <p className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
                  {a.name}
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-gd-steel">{a.tagline}</p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {a.capabilities.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gd-steel"
                  >
                    {c}
                  </span>
                ))}
                {a.capabilities.length > 4 && (
                  <span className="px-1 text-[9px] text-gd-steel">
                    +{a.capabilities.length - 4}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Conversation */}
        <Panel className="flex flex-col p-5 xl:col-span-2" >
          <SectionHead
            title={assistant.name}
            sub={assistant.tagline}
            right={
              <div className="flex items-center gap-2">
                <GuideAvatar speaking={voice.speaking} size={30} />
                {voice.supported && (
                  <button
                    onClick={voice.toggleEnabled}
                    title={voice.enabled ? 'Mute spoken answers' : 'Unmute spoken answers'}
                    className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      voice.enabled
                        ? 'border-gd-neon/40 bg-gd-neon/10 text-gd-neon'
                        : 'border-white/10 text-gd-steel hover:bg-white/5'
                    }`}
                  >
                    {voice.enabled ? 'Voice On' : 'Voice Off'}
                  </button>
                )}
                <Badge tone="amber">Demo — reads seeded data only</Badge>
              </div>
            }
          />

          <div className="min-h-[380px] flex-1 space-y-3 overflow-y-auto pr-1">
            {log.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'border border-gd-electric/35 bg-gd-electric/12 text-white'
                      : 'border border-gd-line bg-gd-hull/70'
                  }`}
                >
                  <p className="text-sm leading-relaxed text-white">{m.text}</p>
                  {m.rows && (
                    <div className="mt-3 space-y-1.5">
                      {m.rows.map((r, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-gd-chrome"
                        >
                          <ArrowRight
                            className="mt-0.5 h-3 w-3 shrink-0"
                            style={{ color: assistant.accent }}
                          />
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.route && (
                    <Link
                      href={m.route.href}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gd-electric/45 bg-gd-electric/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gd-electric transition-colors hover:bg-gd-electric/22"
                    >
                      {m.route.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 border-t border-white/[0.07] pt-4">
            <div className="flex flex-wrap gap-1.5">
              {assistant.prompts.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-gd-chrome transition-colors hover:border-white/25 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask(input)}
                placeholder={`Ask ${assistant.name}…`}
                className="flex-1 rounded-lg border border-gd-line bg-gd-hull/70 px-3.5 py-2.5 text-sm text-white placeholder:text-gd-steel/70 focus:border-gd-electric/50 focus:outline-none"
              />
              <Button variant="primary" onClick={() => ask(input)}>
                <Send className="h-3.5 w-3.5" /> Ask
              </Button>
            </div>
          </div>
        </Panel>

        {/* Capability + guardrails */}
        <div className="space-y-4">
          <Panel className="p-5">
            <SectionHead title="What It Reads" />
            <div className="space-y-1.5">
              {assistant.capabilities.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-gd-chrome"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: assistant.accent }}
                  />
                  {c}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="border-gd-amber/25 p-5">
            <SectionHead title="Guardrails" />
            <div className="space-y-2.5 text-[11px] leading-relaxed text-gd-chrome">
              {[
                'Nothing is sent, posted, charged, or published without your explicit approval.',
                'Inbox AI drafts replies. It never sends them on its own.',
                'Document AI reads, classifies, and matches documents. It never fabricates an insurance certificate or tax document.',
                'Marketing AI produces drafts. Publishing is a separate, approved action.',
                'In this demo every integration runs in mock mode against seeded data.',
              ].map((g) => (
                <div key={g} className="flex gap-2">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-gd-amber" />
                  {g}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <DemoAction label="Approval Required" />
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHead title="Automation Roadmap" sub="How autonomy is earned, not assumed" />
            <div className="space-y-2">
              {[
                ['Phase 1', 'Read / Summarize', 'Organize and draft. No actions taken.', '#22B8FF'],
                ['Phase 2', 'Approval-Based', 'Executes only with explicit permission.', '#7CFF3D'],
                ['Phase 3', 'Automate', 'Trusted workflows run on their own.', '#A66BFF'],
                ['Phase 4', 'Optimize', 'Forecasts, recommendations, proactive alerts.', '#FFB020'],
              ].map(([phase, title, desc, tone]) => (
                <div
                  key={phase}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-3 w-3" style={{ color: tone }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tone }}>
                      {phase}
                    </span>
                    <span className="text-xs font-bold text-white">{title}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gd-steel">{desc}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
