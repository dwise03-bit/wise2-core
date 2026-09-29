'use client';

import { formatPhone } from '@/lib/format';
import { queryQueue } from '@/lib/conversations/queue';
import { createSeedCatalog, SEED_NOTICE, SIMULATION_NOW, TECHNICIANS } from '@/lib/seed';
import { Badge } from './ui';

const catalog = createSeedCatalog();
const queue = queryQueue(catalog, 'all', '', SIMULATION_NOW);

export function CallsPage() {
  return (
    <SimplePage title="Calls" notice="Inbound conversation log from the simulated inbox.">
      <ul className="space-y-2">
        {queue.map((item) => (
          <li key={item.conversation.id} className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="ice">{item.conversation.channel}</Badge>
              <Badge tone="chrome">{item.conversation.status.replace('_', ' ')}</Badge>
            </div>
            <p className="mt-2 font-semibold">{item.customer.name}</p>
            <p className="text-sm text-chrome">
              {formatPhone(item.customer.phone)} · {item.conversation.issue}
            </p>
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}

export function DispatchBoardPage() {
  return (
    <SimplePage title="Dispatch" notice="Technician roster is simulated. No GPS or Field Tech link is active.">
      <ul className="space-y-2">
        {TECHNICIANS.map((tech) => (
          <li key={tech.id} className="glass flex items-center justify-between rounded-2xl p-4">
            <div>
              <p className="font-semibold">{tech.name}</p>
              <p className="text-sm text-chrome">{tech.trade}</p>
            </div>
            <Badge tone={tech.availableToday ? 'emerald' : 'chrome'}>
              {tech.availableToday ? 'Available today' : 'Off roster'}
            </Badge>
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}

export function CustomersPage() {
  return (
    <SimplePage title="Customers" notice="Customer records are seed data with example.test addresses and 555 numbers.">
      <ul className="space-y-2">
        {catalog.customers.map((customer) => (
          <li key={customer.id} className="glass rounded-2xl p-4">
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-chrome">
              {formatPhone(customer.phone)} · {customer.email ?? 'Email unavailable'}
            </p>
            <p className="text-xs text-chrome">{customer.flags.join(' · ')}</p>
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}

export function JobsPage() {
  const jobs = queue.filter((item) =>
    ['scheduled', 'dispatched', 'quoted', 'completed'].includes(item.conversation.status),
  );
  return (
    <SimplePage title="Jobs" notice="Job list is derived from conversation status in the simulated catalog.">
      <ul className="space-y-2">
        {jobs.map((item) => (
          <li key={item.conversation.id} className="glass rounded-2xl p-4">
            <Badge tone="chrome">{item.conversation.status}</Badge>
            <p className="mt-2 font-semibold">{item.customer.name}</p>
            <p className="text-sm text-chrome">{item.conversation.issue}</p>
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}

export function SettingsPage() {
  const ports = ['PhoneProvider', 'MessagingProvider', 'CRMProvider', 'SchedulerProvider', 'DispatchProvider', 'EstimateProvider'];
  return (
    <SimplePage title="Settings" notice="Provider ports are implemented by simulated adapters only.">
      <ul className="space-y-2">
        {ports.map((port) => (
          <li key={port} className="glass flex items-center justify-between rounded-2xl p-4">
            <span>{port}</span>
            <Badge tone="amber">Simulated adapter</Badge>
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}

function SimplePage({ title, notice, children }: { title: string; notice: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 pt-[calc(1.5rem+var(--safe-top))]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-ice">WISE² Home Services</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-amber">{SEED_NOTICE}</p>
      <p className="mt-1 text-sm text-chrome">{notice}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
