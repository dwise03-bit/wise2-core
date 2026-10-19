'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, BriefcaseBusiness, CircleDollarSign, RefreshCw, TrendingUp, Users, Wrench, Zap } from 'lucide-react';

type KPI = { totalLeads?: number; qualifiedLeads?: number; hotLeads?: number; totalDeals?: number; openDeals?: number; wonDeals?: number; totalRevenue?: number; pipelineValue?: number; conversionRate?: number };
type RecordItem = { id?: string; name?: string; customerId?: string; status?: string; stage?: string; source?: string; owner?: string; value?: number; score?: number; urgency?: string };
const money = (n?: number) => n == null ? '—' : new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(n);
const panel = 'rounded-2xl border border-white/10 bg-[#0b1425]/90 shadow-[0_20px_70px_rgba(0,0,0,.28)]';
export default function RevenueDashboardPage() {
  const [kpis,setKpis] = useState<KPI | null>(null);
  const [leads,setLeads] = useState<RecordItem[]>([]);
  const [deals,setDeals] = useState<RecordItem[]>([]);
  const [tab,setTab] = useState<'overview'|'leads'|'deals'>('overview');
  const [status,setStatus] = useState<'loading'|'connected'|'unavailable'>('loading');
  const [updated,setUpdated] = useState('');
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const responses = await Promise.all(['/api/revenue/dashboard','/api/revenue/leads','/api/revenue/deals'].map(path => fetch(path, { cache:'no-store', credentials:'same-origin' })));
      if (responses.some(r=>!r.ok)) throw new Error('Revenue API unavailable');
      const [dashboard, leadData, dealData] = await Promise.all(responses.map(r=>r.json()));
      const raw = dashboard?.data?.kpis ?? dashboard?.kpis ?? dashboard?.summary;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Missing KPI payload');
      setKpis(raw);
      setLeads(Array.isArray(leadData?.data) ? leadData.data : Array.isArray(leadData?.data?.leads) ? leadData.data.leads : Array.isArray(leadData?.leads) ? leadData.leads : []);
      setDeals(Array.isArray(dealData?.data) ? dealData.data : Array.isArray(dealData?.data?.deals) ? dealData.data.deals : Array.isArray(dealData?.deals) ? dealData.deals : []);
      setUpdated(new Date().toLocaleTimeString());
      setStatus('connected');
    } catch {
      setKpis(null); setLeads([]); setDeals([]); setStatus('unavailable');
    }
  }, []);
  useEffect(()=>{ void load(); },[load]);
  const cards = [
    {label:'TOTAL REVENUE',value:money(kpis?.totalRevenue),icon:CircleDollarSign},
    {label:'OPEN PIPELINE',value:money(kpis?.pipelineValue),icon:TrendingUp},
    {label:'CONVERSION RATE',value:kpis?.conversionRate == null ? '—' : kpis.conversionRate.toFixed(1)+'%',icon:Activity},
    {label:'ACTIVE DEALS',value:kpis?.openDeals?.toLocaleString() ?? '—',icon:BriefcaseBusiness},
  ];
  return <main className="min-h-screen bg-[#030711] text-white" style={{backgroundImage:'radial-gradient(ellipse at 85% 0%,rgba(0,118,255,.18),transparent 44%),radial-gradient(ellipse at 10% 45%,rgba(185,255,0,.045),transparent 45%)'}}>
    <div className="mx-auto max-w-[1550px] px-5 py-7 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6">
        <Link href="/" className="text-2xl font-black tracking-[-.09em]">WISE<sup className="text-[#b9ff00]">²</sup></Link>
        <nav aria-label="Revenue navigation" className="flex flex-wrap gap-4 text-xs font-semibold tracking-wider text-white/60">
          <Link href="/products" className="hover:text-white">PRODUCTS</Link><Link href="/hvac" className="hover:text-white">HVAC OS</Link><Link href="/revenue" className="hover:text-white">REVENUE</Link><Link href="/audit" className="hover:text-white">CONSULTING</Link>
        </nav>
        <div className="flex items-center gap-3"><span className={`rounded-full border px-3 py-2 text-[10px] font-bold tracking-widest ${status==='connected'?'border-[#b9ff00]/40 text-[#b9ff00]':status==='loading'?'border-blue-400/30 text-blue-300':'border-amber-400/40 text-amber-300'}`}>{status==='connected'?'● API CONNECTED':status==='loading'?'○ CONNECTING':'○ DATA UNAVAILABLE'}</span><button type="button" onClick={()=>void load()} aria-label="Refresh revenue data" className="rounded-lg border border-white/15 p-2 hover:bg-white/10"><RefreshCw size={17}/></button></div>
      </header>
      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="absolute right-0 top-8 hidden select-none text-[180px] font-black leading-none tracking-tighter text-white/[.025] lg:block">REVENUE</div>
        <div className="relative"><p className="text-xs font-bold tracking-[.32em] text-[#b9ff00]">WISE² / BUSINESS INTELLIGENCE / COMMAND CENTER</p><h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[.92] tracking-[-.065em] md:text-8xl">Control the work.<br/><span className="bg-gradient-to-r from-[#b9ff00] via-[#67e8f9] to-[#3b82f6] bg-clip-text text-transparent">Command the revenue.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/55">One operating picture for sales, pipeline, clients, field operations, and the next decision.</p></div>
      </section>
      {status==='unavailable' && <div role="alert" className="mb-7 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 text-sm text-amber-100">Revenue data could not be verified. No sample financial figures are being substituted. Check API routing, authentication, and service health before using this dashboard for decisions.</div>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({label,value,icon:Icon})=><div key={label} className={panel+' p-6'}><div className="flex items-center justify-between text-[11px] font-bold tracking-[.16em] text-white/45"><span>{label}</span><Icon size={19} className="text-[#b9ff00]"/></div><p className="mt-7 text-4xl font-black tracking-tight text-white">{status==='loading'?'…':value}</p><p className="mt-3 text-xs text-white/35">{status==='connected'?'Connected revenue API':'Awaiting verified data'}</p></div>)}</section>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"><div className="flex gap-2">{(['overview','leads','deals'] as const).map(t=><button key={t} type="button" onClick={()=>setTab(t)} aria-pressed={tab===t} className={`rounded-lg px-5 py-3 text-xs font-black uppercase tracking-widest transition ${tab===t?'bg-[#b9ff00] text-black':'bg-white/5 text-white/55 hover:bg-white/10'}`}>{t}</button>)}</div><span className="text-xs text-white/35">{updated?'Last refreshed '+updated:'Waiting for connection'}</span></div>
      {tab==='overview' && <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div className={panel+' p-7'}><div className="flex items-center justify-between"><h2 className="text-sm font-black tracking-[.15em]">SALES OPERATIONS</h2><Activity className="text-cyan-400" size={20}/></div><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">{[['Total leads',kpis?.totalLeads],['Qualified leads',kpis?.qualifiedLeads],['Hot leads',kpis?.hotLeads],['Total deals',kpis?.totalDeals],['Won deals',kpis?.wonDeals],['Open deals',kpis?.openDeals]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs text-white/45">{label}</p><p className="mt-3 text-3xl font-bold text-[#b9ff00]">{status==='connected' && typeof value==='number'?value:'—'}</p></div>)}</div></div><div className={panel+' flex flex-col justify-between p-7'}><div><p className="text-xs font-bold tracking-[.2em] text-cyan-400">NEXT ACTION / WISE²</p><h2 className="mt-5 text-3xl font-black leading-tight">Turn opportunity into an operating system.</h2><p className="mt-5 text-sm leading-6 text-white/50">Connect CRM, estimates, invoicing, field service, and AI workflows. Public visitors see no private customer records unless access is authorized.</p></div><Link href="/audit" className="mt-8 inline-flex items-center gap-2 self-start rounded-lg bg-[#b9ff00] px-5 py-4 text-xs font-black tracking-wider text-black">START BUSINESS AUDIT <ArrowRight size={17}/></Link></div></section>}
      {(tab==='leads'||tab==='deals') && <section className={panel+' mt-6 overflow-hidden p-6'}><h2 className="mb-5 text-lg font-black uppercase tracking-wider">{tab==='leads'?'Lead Intelligence':'Deal Pipeline'}</h2><div className="space-y-3">{(tab==='leads'?leads:deals).length===0?<p className="py-12 text-center text-sm text-white/50">{status==='connected'?'No records returned.':'No verified records available.'}</p>:(tab==='leads'?leads:deals).map((item,i)=><div key={item.id??i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.035] p-5"><div><p className="font-semibold">{item.name??item.customerId??('Record '+(i+1))}</p><p className="mt-1 text-xs text-white/40">{item.source??'Revenue operations'}</p></div><div className="flex items-center gap-5"><span className="text-xs font-bold uppercase tracking-wider text-cyan-300">{item.stage??item.status??'—'}</span>{tab==='deals'&&<span className="font-bold text-[#b9ff00]">{money(item.value)}</span>}</div></div>)}</div></section>}
      <section className="mt-7 grid gap-4 md:grid-cols-3"><Link href="/hvac" className={panel+' group p-6 hover:border-cyan-400/50'}><Wrench className="text-cyan-400"/><h3 className="mt-5 text-xl font-black">HVAC REVENUE OS</h3><p className="mt-2 text-sm text-white/50">Field operations, service, estimates, and equipment.</p><ArrowRight className="mt-5 text-[#b9ff00] group-hover:translate-x-1 transition-transform"/></Link><Link href="/products" className={panel+' group p-6 hover:border-cyan-400/50'}><Zap className="text-[#b9ff00]"/><h3 className="mt-5 text-xl font-black">WISE² PRODUCT SUITE</h3><p className="mt-2 text-sm text-white/50">AI companions, automation, edge devices, and XR.</p><ArrowRight className="mt-5 text-[#b9ff00] group-hover:translate-x-1 transition-transform"/></Link><Link href="/audit" className={panel+' group p-6 hover:border-cyan-400/50'}><Users className="text-cyan-400"/><h3 className="mt-5 text-xl font-black">CONSULTANT PORTAL</h3><p className="mt-2 text-sm text-white/50">Discover opportunities and build a custom solution.</p><ArrowRight className="mt-5 text-[#b9ff00] group-hover:translate-x-1 transition-transform"/></Link></section>
      <footer className="mt-14 border-t border-white/10 py-8 text-xs text-white/35">© 2026 WISE² · Revenue Command Center · Metrics are shown only when returned by the connected API.</footer>
    </div>
  </main>;
}
