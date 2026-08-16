'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Badge, Button, DemoAction, Panel, SectionHead, Tabs } from '@/components/ui/kit';
import { FOLLOW_UPS } from '@/lib/data/seed';
import { money } from '@/lib/metrics';

type Resolution = 'done' | 'snoozed' | 'assigned';

export default function FollowUpsPage() {
  const [filter, setFilter] = useState('all');
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [expanded, setExpanded] = useState<string | null>(FOLLOW_UPS[0].id);

  const items = useMemo(() => {
    if (filter === 'all') return FOLLOW_UPS;
    if (filter === 'open') return FOLLOW_UPS.filter((f) => !resolved[f.id]);
    return FOLLOW_UPS.filter((f) => f.priority === filter);
  }, [filter, resolved]);

  const openValue = FOLLOW_UPS.filter((f) => !resolved[f.id]).reduce((s, f) => s + f.value, 0);
  const resolve = (id: string, r: Resolution) => setResolved((p) => ({ ...p, [id]: r }));

  const channelIcon = { call: Phone, text: MessageSquare, email: Mail } as const;

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Follow-Up Engine
          </h1>
          <p className="mt-1 text-sm text-gd-steel">
            Every reason to reach out, queued with a drafted message. The follow-up that never
            happened is the most expensive thing in this business.
          </p>
        </div>
        <Tabs
          tabs={[
            { id: 'all', label: 'All', count: FOLLOW_UPS.length },
            { id: 'open', label: 'Open', count: FOLLOW_UPS.filter((f) => !resolved[f.id]).length },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Open Opportunities', String(FOLLOW_UPS.filter((f) => !resolved[f.id]).length), '#22B8FF'],
          ['Value In The Queue', money(openValue), '#7CFF3D'],
          ['High Priority', String(FOLLOW_UPS.filter((f) => f.priority === 'high').length), '#FF4D5E'],
          ['Handled This Session', String(Object.keys(resolved).length), '#A66BFF'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <div data-tour="followups" className="space-y-2.5">
        {items.map((f) => {
          const Icon = channelIcon[f.channel];
          const state = resolved[f.id];
          const open = expanded === f.id;
          return (
            <Panel
              key={f.id}
              className={`overflow-hidden transition-all ${state ? 'opacity-55' : ''}`}
            >
              <button
                onClick={() => setExpanded(open ? null : f.id)}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
              >
                <span
                  className="h-10 w-[3px] shrink-0 rounded-full"
                  style={{
                    background:
                      f.priority === 'high'
                        ? '#FF4D5E'
                        : f.priority === 'medium'
                          ? '#FFB020'
                          : '#8AA0B8',
                  }}
                />
                <Icon className="h-4 w-4 shrink-0 text-gd-electric" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-white">{f.type}</p>
                    <Badge
                      tone={f.priority === 'high' ? 'red' : f.priority === 'medium' ? 'amber' : 'steel'}
                    >
                      {f.priority}
                    </Badge>
                    {state && (
                      <Badge tone="neon">
                        {state === 'done' ? 'Completed' : state === 'snoozed' ? 'Snoozed' : 'Assigned'}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-gd-steel">
                    {f.customer.replace(/^\*/, '')} · {f.property} — {f.trigger}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="font-display text-sm font-black text-gd-neon">
                    {f.value ? money(f.value) : '—'}
                  </p>
                  <p className="flex items-center justify-end gap-1 text-[10px] text-gd-steel">
                    <Clock className="h-3 w-3" /> {f.age}
                  </p>
                </div>
              </button>

              {open && (
                <div className="border-t border-white/[0.06] bg-gd-void/40 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-gd-violet" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-violet">
                      WISE² drafted message — {f.channel}
                    </p>
                    <DemoAction label="Approval Required" />
                  </div>
                  <p className="mt-2.5 rounded-lg border border-gd-line bg-gd-hull/60 p-3.5 text-sm leading-relaxed text-gd-chrome">
                    {f.aiDraft}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="neon" onClick={() => resolve(f.id, 'done')}>
                      <Phone className="h-3.5 w-3.5" /> Call
                    </Button>
                    <Button variant="primary" onClick={() => resolve(f.id, 'done')}>
                      <MessageSquare className="h-3.5 w-3.5" /> Text
                    </Button>
                    <Button variant="primary" onClick={() => resolve(f.id, 'done')}>
                      <Mail className="h-3.5 w-3.5" /> Email
                    </Button>
                    <Button variant="ghost" onClick={() => resolve(f.id, 'assigned')}>
                      <UserPlus className="h-3.5 w-3.5" /> Assign
                    </Button>
                    <Button variant="ghost" onClick={() => resolve(f.id, 'snoozed')}>
                      <Clock className="h-3.5 w-3.5" /> Snooze
                    </Button>
                    <Button variant="ghost" onClick={() => resolve(f.id, 'done')}>
                      <Check className="h-3.5 w-3.5" /> Complete
                    </Button>
                    <span className="ml-auto text-[11px] text-gd-steel">Owner: {f.owner}</span>
                  </div>
                  <p className="mt-3 text-[11px] text-gd-steel/80">
                    Nothing is sent in owner demo mode. In production this drafts the message and
                    waits for your approval before it goes out.
                  </p>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
