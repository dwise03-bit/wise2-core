import type { Metadata } from 'next';
import {
  Magnet,
  Bot,
  FileText,
  CalendarClock,
  Users,
  Banknote,
  CloudLightning,
  BarChart3,
  Sparkles,
  ShieldCheck,
  HardHat,
  TrendingUp,
  Search,
  Bell,
  MessageCircle,
  User,
  LayoutDashboard,
  GitBranch,
  Contact,
  Building2,
  Truck,
  CalendarDays,
  Receipt,
  CreditCard,
  MessagesSquare,
  Package,
  Megaphone,
  Folder,
  Plug,
  Settings,
  Phone,
  Navigation as NavigationIcon,
  Mic,
  ChevronRight,
  Wind,
  Droplets,
  Car,
  Hammer,
  Plus,
  ArrowRight,
  Check,
  Lock,
  Headphones,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'WISE² Contractor OS | One Login. One System. Total Control.',
  description:
    'The AI-operated business platform for contractors: CRM, jobs, estimates, crews, payments, marketing, and AI — one system, every job, total control.',
  robots: 'index, follow',
};

const FEATURES = [
  { icon: Magnet, title: 'Capture More Leads', desc: 'Forms, calls, chats, ads & referrals in one place.' },
  { icon: Bot, title: 'AI Follow-Up 24/7', desc: 'Instant responses. Smart nurturing. More appointments.' },
  { icon: FileText, title: 'Estimates & Proposals', desc: 'Build fast. Professional. Win more. Digital signatures.' },
  { icon: CalendarClock, title: 'Jobs & Dispatch', desc: 'Schedule, map, track crews in real-time.' },
  { icon: Users, title: 'Team Communication', desc: 'Chat, channels, job rooms, files & @mentions.' },
  { icon: Banknote, title: 'Invoices & Payments', desc: 'Send, automate, collect. Get paid faster.' },
  { icon: CloudLightning, title: 'Storm & Weather Intel', desc: 'Detect storms. Find opportunities. Act first.' },
  { icon: BarChart3, title: 'Reports & Insights', desc: 'Real-time dashboards. Know your numbers.' },
  { icon: Bot, title: 'AI Operator', desc: 'Ask anything. Get answers. Take action.' },
];

const REPLACES = [
  { icon: Contact, label: 'CRM' },
  { icon: FileText, label: 'Estimating' },
  { icon: CalendarDays, label: 'Scheduling' },
  { icon: MessagesSquare, label: 'Chat' },
  { icon: Megaphone, label: 'Marketing' },
  { icon: Banknote, label: 'Accounting' },
  { icon: BarChart3, label: 'Reporting' },
];

const HERO_BADGES = [
  { icon: Sparkles, title: 'AI-Powered', desc: 'Operates while you focus.' },
  { icon: HardHat, title: 'Built for Trades', desc: 'HVAC, Roofing, Detailing & more.' },
  { icon: TrendingUp, title: 'Proven Results', desc: 'More cash. More jobs. More profit.' },
  { icon: ShieldCheck, title: 'Secure & Reliable', desc: 'Your data. Your rules. Always protected.' },
];

const KPIS = [
  { icon: Banknote, label: 'Open Estimates', value: '$71,300', meta: '12 deals', delta: '+24% vs last 7 days', tone: 'amber' },
  { icon: TrendingUp, label: 'Recoverable Revenue', value: '$18,420', meta: '23 opportunities', delta: '+31% vs last 7 days', tone: 'amber' },
  { icon: Banknote, label: 'Cash Collected (MTD)', value: '$84,250', meta: '', delta: '+37% vs last month', tone: 'green' },
  { icon: CalendarClock, label: 'Jobs In Progress', value: '18', meta: '3 behind schedule', delta: '', tone: 'neutral' },
  { icon: ShieldCheck, label: 'Business Health Score', value: '87', meta: 'Excellent', delta: '+9 pts vs last month', tone: 'green' },
];

const DASH_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: GitBranch, label: 'Pipeline' },
  { icon: Magnet, label: 'Leads' },
  { icon: Contact, label: 'Customers' },
  { icon: HardHat, label: 'Jobs' },
  { icon: Truck, label: 'Dispatch' },
  { icon: CalendarDays, label: 'Calendar' },
  { icon: FileText, label: 'Estimates' },
  { icon: Receipt, label: 'Invoices' },
  { icon: CreditCard, label: 'Payments' },
  { icon: MessagesSquare, label: 'Team Chat' },
  { icon: Package, label: 'Suppliers' },
  { icon: Megaphone, label: 'Marketing' },
  { icon: Bot, label: 'AI Operator' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Folder, label: 'Files' },
  { icon: Plug, label: 'Integrations' },
  { icon: Settings, label: 'Settings' },
];

const PIPELINE_STAGES = [
  { label: 'New Lead', value: 84200 },
  { label: 'Contacted', value: 67300 },
  { label: 'Appointment', value: 52900 },
  { label: 'Estimate Sent', value: 41800 },
  { label: 'Follow-Up', value: 25250 },
  { label: 'Won', value: 0 },
];

const JOBS_BY_STATUS = [
  { label: 'Scheduled', value: 8, color: '#0094FF' },
  { label: 'In Progress', value: 14, color: '#F59E0B' },
  { label: 'Waiting', value: 6, color: '#F2B632' },
  { label: 'Completed', value: 10, color: '#22C55E' },
  { label: 'On Hold', value: 4, color: '#8D98A5' },
];

const RECOMMENDATIONS = [
  { text: 'Follow up with 6 leads created in the last 3 days.', meta: 'Est. Revenue $12,450' },
  { text: 'Send proposal to 5 open estimates over $5,000.', meta: 'Est. Revenue $18,970' },
  { text: 'You have 2 openings tomorrow. Want WISE² to schedule?', meta: 'Est. Revenue $6,800' },
];

const ACTIVITY = [
  'James Johnson approved estimate #1042 · 2h ago',
  'Invoice #INV-2213 paid $3,420 · 3h ago',
  'New lead from Google Ads · 5h ago',
  'Technician Mike arrived on site — Job #1039 · 6h ago',
  'AI Follow-Up sent to Martinez Residence · 7h ago',
];

const TRADE_PACKS = [
  { icon: Wind, label: 'HVAC Pack' },
  { icon: Building2, label: 'Roofing Pack' },
  { icon: Droplets, label: 'Pressure Washing Pack' },
  { icon: Car, label: 'Detailing Pack' },
  { icon: Hammer, label: 'Construction Pack' },
  { icon: Plus, label: 'More Trades' },
];

const WORKFLOW_STEPS = [
  { icon: Magnet, label: 'Lead' },
  { icon: Bot, label: 'Follow-Up' },
  { icon: FileText, label: 'Estimate' },
  { icon: Truck, label: 'Dispatch' },
  { icon: HardHat, label: 'Perform' },
  { icon: Banknote, label: 'Payment' },
];

const INTEGRATIONS = [
  'QuickBooks',
  'Stripe',
  'ABC Supply',
  'QXO',
  'SRS Distribution',
  'Google Ads',
  'Meta',
  'EagleView',
];

const FOOTER_STATS = [
  { icon: Users, value: '10,000+', label: 'Contractors Trust WISE²' },
  { icon: ShieldCheck, value: '99.9%', label: 'Uptime, Always Reliable' },
  { icon: Lock, value: 'Bank-Level', label: 'Security, Your Data Is Safe' },
  { icon: Headphones, value: 'US-Based', label: 'Support, Real People, Real Help' },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#F2B632]/40 bg-[#F2B632]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2B632]">
      {children}
    </span>
  );
}

export default function ContractorOsPage() {
  const pipelineMax = Math.max(...PIPELINE_STAGES.map((s) => s.value), 1);
  const jobsTotal = JOBS_BY_STATUS.reduce((sum, s) => sum + s.value, 0);

  let cumulative = 0;
  const donutStops = JOBS_BY_STATUS.map((s) => {
    const start = (cumulative / jobsTotal) * 360;
    cumulative += s.value;
    const end = (cumulative / jobsTotal) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="bg-[#050505] text-white">
      {/* ================= HERO: SIDEBAR + MAIN ================= */}
      <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* ---- Left: brand + feature sidebar ---- */}
          <aside className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
            <div className="mb-1 text-4xl font-black tracking-tight text-white">
              WISE<sup className="text-2xl text-[#F2B632]">2</sup>
            </div>
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#8D98A5]">
              Contractor OS 2.0
            </div>
            <Pill>AI-Operated Business Platform</Pill>

            <h1 className="mt-6 text-3xl font-black uppercase leading-tight tracking-tight text-white">
              One System.
              <br />
              Every Job.
              <br />
              <span className="text-[#F2B632]">Total Control.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#C9CED6]">
              The all-in-one platform for contractors: CRM, jobs, estimates, crews, payments,
              marketing, AI, and more.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#F2B632]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{title}</div>
                    <div className="text-xs leading-snug text-[#8D98A5]">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8D98A5]">
                Replaces 7+ Apps
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-7 lg:grid-cols-4">
                {REPLACES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#C9CED6]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-medium text-[#8D98A5]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ---- Right: hero banner + KPIs + dashboard mock ---- */}
          <div className="space-y-6">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D1117] via-[#0A0A0A] to-[#1A1206] p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 85% 20%, rgba(242,182,50,0.18), transparent 55%)',
                }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#F2B632]">
                    Your Business.
                  </div>
                  <h2 className="mt-1 text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
                    Now <span className="text-[#F2B632]">AI-Operated.</span>
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#C9CED6]">
                    WISE² finds the opportunity, tells your team what comes next, and executes
                    the work you approve.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                  {HERO_BADGES.map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center"
                    >
                      <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2B632]/10 text-[#F2B632]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="text-[11px] font-bold text-white">{title}</div>
                      <div className="text-[10px] leading-tight text-[#8D98A5]">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {KPIS.map(({ icon: Icon, label, value, meta, delta, tone }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-[#0D1117] p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        tone === 'green'
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : tone === 'amber'
                            ? 'bg-[#F2B632]/10 text-[#F2B632]'
                            : 'bg-white/[0.06] text-[#C9CED6]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8D98A5]">
                      {label}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">{value}</div>
                  {meta && <div className="mt-0.5 text-[11px] text-[#8D98A5]">{meta}</div>}
                  {delta && (
                    <div className="mt-1 text-[11px] font-semibold text-[#22C55E]">{delta}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Dashboard mock + Field Copilot */}
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              {/* Dashboard "browser" card */}
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A]">
                <div className="flex items-center gap-4 border-b border-white/10 px-5 py-3">
                  <div className="text-lg font-black text-white">
                    WISE<sup className="text-[10px] text-[#F2B632]">2</sup>
                  </div>
                  <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#8D98A5]">
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    Search anything...
                  </div>
                  <Bell className="h-4 w-4 text-[#8D98A5]" aria-hidden="true" />
                  <MessageCircle className="h-4 w-4 text-[#8D98A5]" aria-hidden="true" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <User className="h-3.5 w-3.5 text-[#C9CED6]" aria-hidden="true" />
                  </span>
                </div>

                <div className="flex">
                  <nav
                    aria-label="Contractor OS sections"
                    className="hidden w-44 shrink-0 space-y-0.5 border-r border-white/10 p-3 md:block"
                  >
                    {DASH_NAV.map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                          active
                            ? 'bg-[#F2B632]/10 text-[#F2B632]'
                            : 'text-[#8D98A5]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {label}
                      </div>
                    ))}
                  </nav>

                  <div className="flex-1 space-y-4 p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#F2B632]">
                      Mission Control
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      {/* Revenue overview */}
                      <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-4 lg:col-span-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8D98A5]">
                            Revenue Overview
                          </span>
                          <span className="text-[10px] text-[#8D98A5]">This Month</span>
                        </div>
                        <div className="text-xl font-black text-white">$84,250</div>
                        <div className="mb-3 text-[11px] font-semibold text-[#22C55E]">
                          ▲ 37% vs last month
                        </div>
                        <svg viewBox="0 0 200 60" className="h-14 w-full" aria-hidden="true">
                          <polyline
                            fill="none"
                            stroke="#F2B632"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points="0,50 25,44 50,46 75,34 100,38 125,24 150,26 175,10 200,6"
                          />
                        </svg>
                      </div>

                      {/* Pipeline value */}
                      <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-4 lg:col-span-1">
                        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8D98A5]">
                          Pipeline Value
                        </div>
                        <div className="mb-3 text-xl font-black text-white">$271,450</div>
                        <div className="space-y-1.5">
                          {PIPELINE_STAGES.map((s) => (
                            <div key={s.label} className="flex items-center gap-2 text-[10px]">
                              <span className="w-16 shrink-0 truncate text-[#8D98A5]">
                                {s.label}
                              </span>
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                <span
                                  className="block h-full rounded-full bg-[#F2B632]"
                                  style={{ width: `${(s.value / pipelineMax) * 100}%` }}
                                />
                              </span>
                              <span className="w-10 shrink-0 text-right text-[#C9CED6]">
                                ${Math.round(s.value / 1000)}k
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Jobs by status donut */}
                      <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-4 lg:col-span-1">
                        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8D98A5]">
                          Jobs By Status
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                            style={{ background: `conic-gradient(${donutStops})` }}
                            role="img"
                            aria-label={`${jobsTotal} total jobs by status`}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D1117] text-sm font-black text-white">
                              {jobsTotal}
                            </div>
                          </div>
                          <ul className="space-y-1 text-[10px]">
                            {JOBS_BY_STATUS.map((s) => (
                              <li key={s.label} className="flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: s.color }}
                                  aria-hidden="true"
                                />
                                <span className="text-[#8D98A5]">{s.label}</span>
                                <span className="font-semibold text-white">{s.value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Recommends */}
                      <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-4">
                        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8D98A5]">
                          WISE² Recommends
                        </div>
                        <ul className="space-y-2.5">
                          {RECOMMENDATIONS.map((r) => (
                            <li
                              key={r.text}
                              className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-[11px] text-[#C9CED6]">{r.text}</div>
                                <div className="text-[10px] text-[#8D98A5]">{r.meta}</div>
                              </div>
                              <button
                                type="button"
                                className="shrink-0 rounded-full bg-[#F2B632] px-2.5 py-1 text-[10px] font-bold text-black transition-colors duration-200 hover:bg-[#FFB84D] motion-reduce:transition-none"
                              >
                                Do It Now
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Activity */}
                      <div className="rounded-2xl border border-white/10 bg-[#0D1117] p-4">
                        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8D98A5]">
                          Recent Activity
                        </div>
                        <ul className="space-y-2 text-[11px] text-[#C9CED6]">
                          {ACTIVITY.map((a) => (
                            <li key={a} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#22C55E]" aria-hidden="true" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Copilot + Autonomy */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-4">
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2B632]">
                    Field Copilot
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black p-4">
                    <div className="mb-3 flex items-center justify-between text-[11px] text-[#8D98A5]">
                      <span>Job #1039</span>
                      <span className="rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
                        In Progress
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">Johnson Residence</div>
                    <div className="mb-3 text-[11px] text-[#8D98A5]">123 Oak St, Atlanta, GA</div>
                    <div className="mb-4 grid grid-cols-4 gap-2">
                      {[Phone, MessageCircle, NavigationIcon, User].map((Icon, i) => (
                        <span
                          key={i}
                          className="flex h-9 items-center justify-center rounded-lg bg-white/[0.06] text-[#C9CED6]"
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      ))}
                    </div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8D98A5]">
                      My Day · 3 Jobs Today
                    </div>
                    <ul className="space-y-1.5 text-[11px]">
                      <li className="flex justify-between text-[#C9CED6]">
                        <span>9:00 AM · Johnson Residence</span>
                        <span className="text-[#22C55E]">On Site</span>
                      </li>
                      <li className="flex justify-between text-[#C9CED6]">
                        <span>11:00 AM · Martinez Residence</span>
                        <span className="text-[#8D98A5]">Scheduled</span>
                      </li>
                      <li className="flex justify-between text-[#C9CED6]">
                        <span>2:00 PM · Smith Residence</span>
                        <span className="text-[#8D98A5]">Scheduled</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 rounded-2xl border border-[#F2B632]/30 bg-[#F2B632]/5 p-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#F2B632]">
                      <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                      Ask Copilot <span className="text-[8px] text-[#8D98A5]">BETA</span>
                    </div>
                    <div className="text-[10px] leading-relaxed text-[#8D98A5]">
                      &ldquo;Add compressor amp reading&rdquo; · &ldquo;Build repair options&rdquo; ·
                      &ldquo;Send update to customer&rdquo;
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-4">
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F2B632]">
                    Autonomy Level
                  </div>
                  <ul className="space-y-2 text-[11px]">
                    {[
                      { label: 'Manual', desc: 'WISE² recommends.', active: false },
                      { label: 'Assist', desc: 'WISE² prepares.', active: false },
                      { label: 'Autopilot', desc: 'WISE² acts on approved rules.', active: true },
                      { label: 'Guarded Autopilot', desc: 'Confirms for money, mass messages & deletes.', active: false },
                    ].map((tier) => (
                      <li
                        key={tier.label}
                        className={`rounded-xl border px-3 py-2 ${
                          tier.active
                            ? 'border-[#F2B632]/50 bg-[#F2B632]/10'
                            : 'border-white/10 bg-white/[0.02]'
                        }`}
                      >
                        <div
                          className={`font-bold ${tier.active ? 'text-[#F2B632]' : 'text-white'}`}
                        >
                          {tier.label}
                        </div>
                        <div className="text-[10px] text-[#8D98A5]">{tier.desc}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRADE PACKS ================= */}
      <section className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F2B632]">
            Trade Packs — Purpose Built For Your Trade
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {TRADE_PACKS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center transition-colors duration-200 hover:border-[#F2B632]/40 motion-reduce:transition-none"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2B632]/10 text-[#F2B632]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW + INTEGRATIONS ================= */}
      <section className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#F2B632]">
              The Complete Workflow
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {WORKFLOW_STEPS.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F2B632]/40 bg-[#F2B632]/10 text-[#F2B632]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-semibold text-[#C9CED6]">{label}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-[#8D98A5]" aria-hidden="true" />
                  )}
                </div>
              ))}
              <ArrowRight className="ml-1 h-4 w-4 text-[#F2B632]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#F2B632]">
                Repeat
              </span>
            </div>
            <p className="mt-4 text-xs text-[#8D98A5]">
              From lead to lifetime customer. All in one flow.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#F2B632]">
              Powerful Integrations
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INTEGRATIONS.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-center text-xs font-semibold text-[#C9CED6]"
                >
                  {name}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-[#8D98A5]">
              Shown integrations reflect target partners for this vertical; connection status
              is per-tenant and clearly labeled as Connected, Connection Required, or Demo.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA BAR ================= */}
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-[#F2B632]/30 bg-gradient-to-r from-[#0A0A0A] to-[#1A1206] p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-2xl font-black leading-none text-white">
              WISE<sup className="text-sm text-[#F2B632]">2</sup>
            </div>
            <div className="mt-1 text-sm font-bold uppercase tracking-[0.1em] text-[#C9CED6]">
              One Login. One System. Total Control.
            </div>
          </div>

          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2B632] px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition-colors duration-200 hover:bg-[#FFB84D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B632] motion-reduce:transition-none"
          >
            Book Your WISE² Demo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            {FOOTER_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#F2B632]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-sm font-bold text-white">{value}</div>
                  <div className="text-[10px] leading-tight text-[#8D98A5]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
