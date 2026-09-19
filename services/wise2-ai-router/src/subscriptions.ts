export type SubscriptionKind = 'ai' | 'coding' | 'edge' | 'hosting' | 'network' | 'comms' | 'source' | 'local';

export interface SubscriptionResource {
  id: string;
  label: string;
  kind: SubscriptionKind;
  priority: number;
  includedFirst: boolean;
  auth: 'oauth' | 'local' | 'service';
  command?: string;
  notes: string;
}

export const SUBSCRIPTION_RESOURCES: SubscriptionResource[] = [
  { id: 'ollama-m4', label: 'Mac Ollama', kind: 'local', priority: 10, includedFirst: true, auth: 'local', notes: 'Zero marginal cost; preferred for routine work when reachable.' },
  { id: 'ollama-gpu', label: 'NVIDIA Ollama', kind: 'local', priority: 20, includedFirst: true, auth: 'local', command: 'ollama', notes: 'gpu-nmls local inference.' },
  { id: 'copilot', label: 'GitHub Copilot', kind: 'coding', priority: 30, includedFirst: true, auth: 'oauth', command: 'copilot', notes: 'Primary subscription coding lane.' },
  { id: 'cursor', label: 'Cursor', kind: 'coding', priority: 40, includedFirst: true, auth: 'oauth', command: 'cursor', notes: 'Use active subscription allowance before metered APIs.' },
  { id: 'gemini', label: 'Gemini', kind: 'ai', priority: 50, includedFirst: true, auth: 'oauth', command: 'gemini', notes: 'Subscription/CLI lane when installed and authenticated.' },
  { id: 'codex', label: 'Codex / ChatGPT', kind: 'coding', priority: 60, includedFirst: true, auth: 'oauth', command: 'codex', notes: 'Deep coding and review lane.' },
  { id: 'claude-a', label: 'Claude A', kind: 'coding', priority: 70, includedFirst: true, auth: 'oauth', command: 'claude', notes: 'Primary Claude subscription profile.' },
  { id: 'claude-b', label: 'Claude B', kind: 'coding', priority: 80, includedFirst: true, auth: 'oauth', command: 'claude', notes: 'Explicit overflow/review profile; no automatic identity rotation.' },
  { id: 'cloudflare', label: 'Cloudflare', kind: 'edge', priority: 100, includedFirst: true, auth: 'service', command: 'cloudflared', notes: 'DNS, CDN, Tunnel, Zero Trust, Workers/R2/AI Gateway as configured.' },
  { id: '20i', label: 'WISE2 Cloud / 20i', kind: 'hosting', priority: 110, includedFirst: true, auth: 'service', notes: 'Client hosting/reseller infrastructure.' },
  { id: 'tailscale', label: 'Tailscale', kind: 'network', priority: 120, includedFirst: true, auth: 'service', command: 'tailscale', notes: 'Private node connectivity.' },
  { id: 'github', label: 'GitHub', kind: 'source', priority: 130, includedFirst: true, auth: 'oauth', command: 'gh', notes: 'Source of truth and CI.' },
  { id: 'discord', label: 'Discord', kind: 'comms', priority: 140, includedFirst: true, auth: 'service', notes: 'Command/alert surface.' },
  { id: 'telnyx', label: 'Telnyx', kind: 'comms', priority: 150, includedFirst: false, auth: 'service', notes: 'Metered communications; use only for phone/SMS workloads.' },
];

export const ROUTING_POLICY = {
  mode: 'AUTO',
  costMode: 'SAVER',
  order: ['LOCAL', 'INCLUDED_SUBSCRIPTION', 'EDGE', 'METERED_API'],
  meteredApiDefault: false,
  rules: [
    'Never expose or copy credentials between providers.',
    'Prefer local capacity for routine work.',
    'Use included subscription capacity before metered API spend.',
    'Keep Claude A and Claude B as explicit profiles; never auto-rotate to bypass limits.',
    'Use a different capable lane for verification when practical.',
  ],
} as const;
