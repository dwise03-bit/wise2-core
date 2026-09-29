import { digitalTwinCommandCenterTabs, digitalTwinDashboardCards, digitalTwinQuickActions } from '@/lib/digital-twin';

const overviewStats = [
  { label: 'Status', value: 'ACTIVE', tone: 'text-[#39FF14]' },
  { label: 'Autonomy', value: 'LEVEL 2', tone: 'text-[#0094FF]' },
  { label: 'Knowledge Sources', value: '24', tone: 'text-[#F4EBDD]' },
  { label: 'Pending Approvals', value: '3', tone: 'text-[#F97316]' },
];

export default function DigitalTwinDashboardPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-16 pt-20 text-[#F4EBDD]">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-[#39FF14]/20 bg-[linear-gradient(135deg,rgba(57,255,20,0.12),rgba(0,148,255,0.06))] p-8">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Your Digital Twin</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-black uppercase leading-none">Command Center</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#e5dacb]">
                Monitor the twin’s knowledge, approvals, content, sales, support, and operating boundaries from one tenant-scoped control plane.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {digitalTwinQuickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-full border border-[#F4EBDD]/16 bg-black/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#F4EBDD]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b8ae9f]">{stat.label}</p>
              <p className={`mt-3 text-3xl font-black uppercase ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Tabs</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {digitalTwinCommandCenterTabs.map((tab, index) => (
              <div
                key={tab}
                className={`rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em] ${
                  index === 0 ? 'bg-[#39FF14] text-[#050505]' : 'border border-[#F4EBDD]/14 bg-black/20 text-[#F4EBDD]'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
            <h2 className="text-3xl font-black uppercase">Overview</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {digitalTwinDashboardCards.map((card) => (
                <div key={card} className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-5">
                  <p className="text-lg font-black uppercase text-[#F4EBDD]">{card}</p>
                  <p className="mt-2 text-sm leading-7 text-[#c9bfaf]">
                    {card === 'Knowledge' && 'Search sources, inspect sync health, review missing information, and validate tenant isolation.'}
                    {card === 'Writing' && 'Approve tone outputs, regenerate samples, and keep public content inside brand boundaries.'}
                    {card === 'Voice' && 'Track consent, sample provenance, enabled providers, and current authorization state.'}
                    {card === 'Video' && 'Review likeness approvals, source assets, script readiness, and pending renders.'}
                    {card === 'Sales' && 'See lead handling, qualification, pipeline movement, objections, and appointment routing.'}
                    {card === 'Content' && 'Generate social posts, email, blogs, FAQ copy, ad variants, and scripts.'}
                    {card === 'Customer Service' && 'Monitor response quality, escalation paths, unresolved issues, and knowledge gaps.'}
                    {card === 'Automations' && 'Control workflow status, triggers, approval requirements, and execution history.'}
                    {card === 'Activity' && 'Audit what the twin generated, suggested, escalated, or executed.'}
                    {card === 'Analytics' && 'Measure usage, engagement, approvals, and performance signals tied to the twin.'}
                    {card === 'Permissions' && 'Manage autonomy levels, role access, and public-facing capability toggles.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
              <h2 className="text-3xl font-black uppercase">Approval Center</h2>
              <div className="mt-6 space-y-4">
                {[
                  'SEND MESSAGE · Pricing lead follow-up · awaiting owner approval',
                  'PUBLISH CONTENT · Launch post for Friday campaign · pending',
                  'RESPOND TO COMPLAINT · Warranty escalation draft · review required',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-[#39FF14]/14 bg-black/20 px-5 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#F4EBDD]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-8">
              <h2 className="text-3xl font-black uppercase">Brain</h2>
              <div className="mt-5 rounded-[1.5rem] border border-[#F4EBDD]/10 bg-black/20 p-5 text-sm leading-7 text-[#d4cabb]">
                Ask your Digital Twin what it knows. Surface sources used, confidence where supported, approval requirements, and any risk flags before the answer moves into public action.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
