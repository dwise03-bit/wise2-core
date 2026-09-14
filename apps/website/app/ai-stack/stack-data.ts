export type StackCategory = {
  title: string;
  subtitle: string;
  status: string;
  items: string[];
};

export const stackCategories: StackCategory[] = [
  { title: 'AI Models & Platforms', subtitle: 'Smarter models. Lower costs. More control.', status: 'Local + Cloud fallback (AUTO)', items: ['Ollama — local Mac/GPU/VPS', 'wise2:latest — general', 'wise2-fast — quick tasks', 'wise2-rag — RAG/knowledge', 'wise2-vision — vision/images', 'wise2-3d-ultra — 3D/worlds', 'gemma4:12b MLX — Mac', 'qwen2.5-coder:7b — coding', 'nomic-embed-text — embeddings'] },
  { title: 'Code & Agents', subtitle: 'Build faster. Ship smarter.', status: 'Coding + agents + automation', items: ['Claude Code', 'Cursor AI', 'Hermes — orchestration', 'PromptOS — agent router', 'OpenCode', 'GitHub Copilot', 'VS Code + extensions', 'Custom WISE² GPTs'] },
  { title: 'MCP Servers & Tools', subtitle: 'Connect everything. Make it work.', status: 'Secure tool access across devices', items: ['Filesystem MCP', 'PostgreSQL MCP', 'Notion MCP', 'Playwright MCP', 'Custom WISE² MCP', 'n8n MCP', 'GitHub MCP', 'Browser MCP'] },
  { title: 'Automation & Workflows', subtitle: 'Business automation that pays.', status: 'CRM + phone + leads + deployments', items: ['n8n — primary', 'Make — selective', 'Zapier — selective', 'Temporal — long jobs', 'Cron + systemd', 'Webhooks & APIs', 'Email/SMS — Telnyx', 'Discord automation', 'Self-hosted runners'] },
  { title: 'Design & UI/UX', subtitle: 'Build stunning. Keep it consistent.', status: 'Web + mobile + XR + 3D', items: ['Next.js 14', 'shadcn/ui', 'Figma', 'Framer', 'Tailwind CSS', 'Spline', 'Blender', 'Unity — Quest 3S', 'React design system'] },
  { title: 'Media & Content Gen', subtitle: 'Create. Automate. Scale.', status: 'Marketing + training + social', items: ['Runway', 'HeyGen', 'Midjourney', 'ElevenLabs', 'Suno', 'Luma Dream Machine', 'Kling', 'Pika', 'CapCut', 'Topaz'] },
  { title: 'Observability & Monitoring', subtitle: 'See everything. Fix faster.', status: 'Monitoring live', items: ['Uptime Kuma', 'Langfuse — LLM observability', 'GlitchTip — error tracking', 'OpenTelemetry', 'Grafana — when needed', 'Prometheus — when needed', 'Loki — logs', 'Sentry — selective', 'Cockpit'] },
  { title: 'Infrastructure & DevOps', subtitle: 'Secure. Scalable. Ready for clients.', status: 'Cloud + VPS + edge', items: ['Docker + Compose', 'Traefik', 'Cloudflare DNS/CDN', '20i hosting', 'Ubuntu VPS', 'Tailscale', 'GitHub Actions CI/CD', 'Kubernetes — future', 'Terraform — later', 'Ansible — optional'] },
  { title: 'Business Apps & Integrations', subtitle: 'Turn tools into revenue.', status: 'Sell + onboard + deliver + scale', items: ['Telnyx — phone/voice', 'WhatsApp — sales/follow-up', 'Stripe — payments', 'WISE² CRM — system of record', 'HVAC Field Tech App', 'Shopify — merch/EDC', 'Google Workspace', 'Discord', 'Roblox VR — training', 'Justway — 3D printing'] },
];

export const quickWins = [
  'Audit live VPS vs GitHub — verify running stack',
  'Collapse deployment drift — one production truth',
  'Verify wise2.net onboarding flow end-to-end',
  'Test Telnyx + CRM + WhatsApp integration',
  'Connect WISE² alerts to Discord with harmless test',
  'Standardize n8n workflows and retire duplicates',
  'Integrate Langfuse observability across AI calls',
  'Run full system health check through /status',
];

export const retireTools = [
  'Sora 2 — discontinued',
  'Duplicate automation platforms',
  'Unvetted MCP servers',
  'Another primary agent framework',
  'Another CRM — use WISE² CRM',
  'High-cost subscriptions without ROI',
  'Random SaaS without integration',
];

export const monthlyCostTiers = [
  { name: 'Lean', range: '$25–$50', detail: 'Local models, essential tools, self-hosted services' },
  { name: 'Recommended', range: '$50–$150', detail: 'Balanced stack, client-ready media and infrastructure' },
  { name: 'Pro Build', range: '$150–$300+', detail: 'Multiple agents, GPU/cloud scaling, XR + 3D + video' },
];

export const architectureLayers = [
  ['AI Layer', 'Models · Agents · RAG'],
  ['Automation Layer', 'n8n · Workflows · MCP'],
  ['Data Layer', 'PostgreSQL · Redis · Vector DB'],
  ['Application Layer', 'API · Dashboard · CRM'],
  ['Infrastructure Layer', 'VPS · Cloudflare · Tailscale'],
  ['Observability Layer', 'Langfuse · Uptime Kuma · Telemetry'],
] as const;
