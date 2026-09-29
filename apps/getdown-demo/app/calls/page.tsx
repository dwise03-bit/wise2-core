'use client';

import { useState } from 'react';
import { PhoneCall, PhoneIncoming, PhoneMissed, PhoneOutgoing, Sparkles, UserPlus } from 'lucide-react';
import { Badge, Button, DemoAction, Panel, SectionHead, Tabs } from '@/components/ui/kit';

interface Call {
  id: string;
  direction: 'in' | 'out' | 'missed';
  contact: string;
  number: string;
  time: string;
  duration: string;
  outcome: string;
  summary: string;
  linked?: string;
  action?: string;
  isNewLead?: boolean;
}

const CALLS: Call[] = [
  { id: 'k1', direction: 'missed', contact: 'Unknown — Northgate area', number: '(555) 0198-7741', time: '8:42 AM', duration: '—', outcome: 'Missed · voicemail left', summary: 'Caller asking about pressure washing a driveway and walkway. Left a callback number. Not yet in the system.', action: 'Create lead + call back', isNewLead: true },
  { id: 'k2', direction: 'in', contact: 'Marissa Quill — Cedar Bluff Country Club', number: '(555) 0142-3345', time: '8:15 AM', duration: '6m 12s', outcome: 'Answered', summary: 'Wants the cart-path concrete and the facade lighting done on one mobilization to limit member disruption. Asked for a single combined invoice.', linked: 'Cedar Bluff Country Club', action: 'Bundle proposals' },
  { id: 'k3', direction: 'in', contact: 'Dana Whitlock — *Kestrel Property Partners', number: '(555) 0142-3317', time: '7:58 AM', duration: '4m 03s', outcome: 'Answered', summary: 'Fairgrove renewal question about adding the three new buildings at the current per-building rate. Contract ends Aug 31.', linked: 'The Fairgrove Apartments', action: 'Send renewal terms' },
  { id: 'k4', direction: 'out', contact: 'Alex Mullen — Kale Insurance', number: '(555) 0142-1102', time: '7:30 AM', duration: '2m 41s', outcome: 'Voicemail', summary: 'Follow-up on the Kingsley Court COI. Left voicemail requesting issuance this week — fall service is on hold.', linked: 'Kingsley Court Townhomes', action: 'Escalate by email' },
  { id: 'k5', direction: 'missed', contact: 'Tom Vasquez — *Summit Ridge Communities', number: '(555) 0142-5512', time: 'Yesterday 4:51 PM', duration: '—', outcome: 'Missed', summary: 'No voicemail. Summit Ridge has two live properties and four more in the portfolio.', linked: 'Millbrook Gardens', action: 'Return call today', isNewLead: false },
  { id: 'k6', direction: 'in', contact: 'Derek Hollis', number: '(555) 0198-4471', time: 'Yesterday 2:14 PM', duration: '8m 55s', outcome: 'Answered', summary: 'Reviewed the roofline lighting proposal. Wants to add two landscape zones before approving.', linked: 'Lantern Ridge Estate', action: 'Revise estimate' },
  { id: 'k7', direction: 'out', contact: 'Priya Raman — *Anchor Line Management', number: '(555) 0142-2204', time: 'Yesterday 11:02 AM', duration: '5m 30s', outcome: 'Answered', summary: 'Walked through the dumpster pad and walkway expansion at Stonecrest. She is taking it to the owner group.', linked: 'Stonecrest Village', action: 'Follow up Monday' },
  { id: 'k8', direction: 'missed', contact: 'Unknown — Westfield area', number: '(555) 0198-2277', time: 'Yesterday 9:20 AM', duration: '—', outcome: 'Missed · no voicemail', summary: 'No voicemail left. Number does not match any existing customer record.', action: 'Text a callback offer', isNewLead: true },
];

const ICON = { in: PhoneIncoming, out: PhoneOutgoing, missed: PhoneMissed } as const;
const TONE = { in: '#7CFF3D', out: '#22B8FF', missed: '#FF4D5E' } as const;

export default function CallsPage() {
  const [tab, setTab] = useState('all');
  const [handled, setHandled] = useState<string[]>([]);

  const rows =
    tab === 'all'
      ? CALLS
      : tab === 'leads'
        ? CALLS.filter((c) => c.isNewLead)
        : CALLS.filter((c) => c.direction === tab);

  const missed = CALLS.filter((c) => c.direction === 'missed');

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Calls
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Every call attached to a customer, property, and next action. A missed call is a lead
          until proven otherwise.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Calls Today', String(CALLS.filter((c) => !c.time.startsWith('Yesterday')).length), '#22B8FF'],
          ['Missed', String(missed.length), '#FF4D5E'],
          ['Potential New Leads', String(CALLS.filter((c) => c.isNewLead).length), '#7CFF3D'],
          ['Handled This Session', String(handled.length), '#A66BFF'],
        ].map(([l, v, c]) => (
          <Panel key={l} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gd-steel">{l}</p>
            <p className="mt-1.5 font-display text-2xl font-black" style={{ color: c }}>
              {v}
            </p>
          </Panel>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: CALLS.length },
          { id: 'missed', label: 'Missed', count: missed.length },
          { id: 'in', label: 'Inbound' },
          { id: 'out', label: 'Outbound' },
          { id: 'leads', label: 'Unmatched — Possible Leads' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="space-y-2.5">
        {rows.map((c) => {
          const Icon = ICON[c.direction];
          const done = handled.includes(c.id);
          return (
            <Panel key={c.id} className={`p-4 ${done ? 'opacity-55' : ''}`}>
              <div className="flex flex-wrap items-start gap-4">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                  style={{ borderColor: `${TONE[c.direction]}55`, background: `${TONE[c.direction]}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: TONE[c.direction] }} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-white">{c.contact.replace(/^\*/, '')}</p>
                    <span className="font-mono text-[11px] text-gd-steel">{c.number}</span>
                    {c.isNewLead && <Badge tone="neon">Possible new lead</Badge>}
                    {done && <Badge tone="violet">Handled</Badge>}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-gd-chrome">{c.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gd-steel">
                    <span>{c.time}</span>
                    <span>·</span>
                    <span>{c.duration}</span>
                    <span>·</span>
                    <span>{c.outcome}</span>
                    {c.linked && (
                      <>
                        <span>·</span>
                        <span className="text-gd-electric">{c.linked}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {c.action && (
                    <span className="flex items-center gap-1.5 text-[11px] text-gd-neon">
                      <Sparkles className="h-3 w-3" /> {c.action}
                    </span>
                  )}
                  <div className="flex gap-2">
                    {c.isNewLead && (
                      <Button variant="neon" size="sm" onClick={() => setHandled((p) => [...p, c.id])}>
                        <UserPlus className="h-3 w-3" /> Create Lead
                      </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => setHandled((p) => [...p, c.id])}>
                      <PhoneCall className="h-3 w-3" /> Call Back
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="p-4">
        <div className="flex items-center gap-2">
          <DemoAction />
          <span className="text-[11px] text-gd-steel">
            Call records are simulated. Production connects your business line so every call is
            logged, transcribed on request, and attached to the right property record.
          </span>
        </div>
      </Panel>
    </div>
  );
}
