'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Bluetooth, Bot, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock3, FileCheck2, Gauge, HardHat, History, Loader2, Mail,
  MapPin, Navigation, Phone, Radio, RefreshCw, Save, ShieldAlert, Sparkles,
  Thermometer, UserRound, Wifi, Wrench, Zap,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

type JobStatus = 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';
type Job = {
  id: string; customerName: string; customerPhone: string; customerEmail: string;
  address: string; appointmentAt: string; complaint: string; status: JobStatus;
  priority: 'NORMAL' | 'HIGH'; notes: string; accessNotes: string; updatedAt: string;
  equipment: { manufacturer: string; model: string; serial: string; tonnage: number; installedAt: string; warranty: string };
  serviceHistory: Array<{ date: string; type: string; summary: string; amount?: number }>;
};
type Diagnosis = {
  likelyCause: string; confidence: number; reasoning: string; checks: string[];
  parts: string[]; safety: string; customerSummary: string; disclaimer: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/wise-hvac-demo';
const statusLabels: Record<JobStatus, string> = { DISPATCHED: 'Dispatched', IN_PROGRESS: 'In progress', COMPLETED: 'Completed' };
const statusClasses: Record<JobStatus, string> = {
  DISPATCHED: 'border-wise-blue/35 bg-wise-blue/10 text-wise-cyan',
  IN_PROGRESS: 'border-wise-orange/35 bg-wise-orange/10 text-wise-ember',
  COMPLETED: 'border-wise-success/35 bg-wise-success/10 text-wise-success',
};

export default function FieldTechPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reportChecks, setReportChecks] = useState({ readings: true, notes: false, photos: false, approval: false });
  const selected = useMemo(() => jobs.find((job) => job.id === selectedId) || jobs[0], [jobs, selectedId]);

  async function loadJobs() {
    setError('');
    try {
      const response = await fetch(`${basePath}/api/field/jobs`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not sync the job queue.');
      const data = (await response.json()) as Job[];
      setJobs(data);
      setSelectedId((current) => current || data[0]?.id || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sync the job queue.');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadJobs(); }, []);
  useEffect(() => {
    setNotes(selected?.notes || '');
    setSymptoms(selected?.complaint || '');
    setDiagnosis(null); setMessage('');
  }, [selected?.id]);

  async function updateJob(updates: { status?: JobStatus; notes?: string }, success: string) {
    if (!selected) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch(`${basePath}/api/field/jobs/${selected.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Update could not be saved.');
      const updated = (await response.json()) as Job;
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)));
      setNotes(updated.notes); setMessage(success);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Update could not be saved.'); }
    finally { setSaving(false); }
  }

  async function runDiagnosis() {
    if (!selected || !symptoms.trim()) return;
    setAnalyzing(true); setDiagnosis(null); setError('');
    try {
      const response = await fetch(`${basePath}/api/field/diagnose`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: selected.id, symptoms }),
      });
      if (!response.ok) throw new Error('AI diagnosis could not be generated.');
      setDiagnosis((await response.json()) as Diagnosis);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'AI diagnosis could not be generated.'); }
    finally { setAnalyzing(false); }
  }

  const activeCount = jobs.filter((job) => job.status !== 'COMPLETED').length;
  const completedCount = jobs.filter((job) => job.status === 'COMPLETED').length;

  return (
    <main className="min-h-screen bg-wise-void text-wise-text">
      <div className="wise-bg-pointer min-h-screen">
        <SiteHeader activeHref="/field-tech" />
        <section className="mx-auto max-w-[1500px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          <div className="field-command-bar flex flex-col gap-5 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><span className="field-live-pill"><span className="field-live-dot" />Field system online</span><span className="field-context-pill"><HardHat className="h-3.5 w-3.5" />Daniel · Technician</span></div><p className="section-kicker mt-5">Technician workspace</p><h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">Today in the field</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-wise-mute">One command surface for dispatch, instruments, CRM, diagnostics, documentation, and closeout.</p></div>
            <div className="flex flex-wrap gap-2"><div className="field-sync-state"><Wifi className="h-4 w-4 text-wise-success" /><div><span>Online</span><small>Last sync just now</small></div></div><button type="button" onClick={loadJobs} disabled={loading} className="tech-secondary-button" aria-busy={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Sync jobs</button></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric icon={ClipboardCheck} value={jobs.length} label="Assigned today" tone="blue" />
            <Metric icon={Zap} value={activeCount} label="Active jobs" tone="orange" />
            <Metric icon={CheckCircle2} value={completedCount} label="Completed" tone="green" />
            <Metric icon={Clock3} value="Live" label="CRM sync" tone="cyan" />
          </div>
          <nav className="field-module-nav mt-4" aria-label="Field workspace modules">
            <a href="#work-order"><ClipboardCheck className="h-4 w-4" />Work order</a>
            <a href="#instruments"><Gauge className="h-4 w-4" />Instruments</a>
            <a href="#crm"><UserRound className="h-4 w-4" />CRM</a>
            <a href="#diagnostics"><Bot className="h-4 w-4" />AI assist</a>
            <a href="#closeout"><FileCheck2 className="h-4 w-4" />Closeout</a>
          </nav>
          {(error || message) && <div role={error ? 'alert' : 'status'} className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-wise-success/30 bg-wise-success/10 text-wise-success'}`}>{error || message}</div>}

          <div className={`mt-5 grid gap-5 ${jobs.length ? 'xl:grid-cols-[360px_minmax(0,1fr)]' : ''}`}>
            <aside className={`tech-card h-fit p-3 xl:sticky xl:top-4 ${jobs.length ? '' : 'hidden'}`}>
              <div className="flex items-center justify-between px-2 pb-3 pt-1"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-wise-cyan">Job queue</p><p className="mt-1 text-xs text-wise-mute">Tap a customer to open the work order.</p></div>{loading && <Loader2 className="h-4 w-4 animate-spin text-wise-cyan" />}</div>
              <div className="space-y-2">{jobs.map((job) => (
                <button type="button" key={job.id} onClick={() => setSelectedId(job.id)} className={`w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wise-cyan ${selected?.id === job.id ? 'border-wise-cyan/45 bg-wise-blue/10 shadow-neon' : 'border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]'}`} aria-pressed={selected?.id === job.id}>
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black uppercase text-white">{job.customerName}</p><p className="mt-1 text-xs text-wise-mute">{new Date(job.appointmentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-wise-mute" /></div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-wise-text/80">{job.complaint}</p><div className="mt-3 flex items-center justify-between gap-2"><span className={`tech-status ${statusClasses[job.status]}`}>{statusLabels[job.status]}</span>{job.priority === 'HIGH' && <span className="text-[10px] font-black uppercase text-wise-ember">High priority</span>}</div>
                </button>
              ))}</div>
            </aside>

            {selected ? <div className="space-y-5">
              <section id="work-order" className="tech-card scroll-mt-24 overflow-hidden">
                <div className="border-b border-white/10 p-5 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`tech-status ${statusClasses[selected.status]}`}>{statusLabels[selected.status]}</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-wise-mute">{selected.id}</span></div><h2 className="mt-4 font-display text-3xl font-black uppercase text-white sm:text-4xl">{selected.customerName || 'Customer not added'}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-wise-text/85">{selected.complaint}</p></div><div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{selected.customerPhone ? <a className="tech-secondary-button" href={`tel:${selected.customerPhone}`}><Phone className="h-4 w-4" />Call</a> : <button className="tech-secondary-button" type="button" disabled><Phone className="h-4 w-4" />No phone</button>}{selected.address ? <a className="tech-secondary-button" href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer"><Navigation className="h-4 w-4" />Route</a> : <button className="tech-secondary-button" type="button" disabled><Navigation className="h-4 w-4" />No address</button>}</div></div></div>
                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3"><InfoBlock icon={MapPin} label="Service address" value={selected.address || 'Not provided'} /><InfoBlock icon={Clock3} label="Appointment" value={new Date(selected.appointmentAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })} /><InfoBlock icon={Wrench} label="Equipment" value={`${selected.equipment.manufacturer} ${selected.equipment.model} · ${selected.equipment.tonnage} ton`} /></div>
                <div className="border-t border-white/10 p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.18em] text-wise-mute">Job status</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{(['DISPATCHED', 'IN_PROGRESS', 'COMPLETED'] as JobStatus[]).map((status) => <button type="button" key={status} onClick={() => updateJob({ status }, `Job marked ${statusLabels[status].toLowerCase()}.`)} disabled={saving || selected.status === status} className={`tech-status-button ${selected.status === status ? 'tech-status-button-active' : ''}`}>{selected.status === status && <Check className="h-4 w-4" />}{statusLabels[status]}</button>)}</div></div>
              </section>

              <section id="instruments" className="tech-card scroll-mt-24 overflow-hidden">
                <div className="instrument-header p-5 sm:p-6"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-wise-cyan"><Radio className="h-4 w-4" />Field instrument bridge</div><h3 className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">Live system readings</h3><p className="mt-2 text-sm text-wise-mute">Bluetooth capture runs in the Android app. No readings are simulated on the web.</p></div><a href={`${basePath}/download`} className="instrument-connect"><Bluetooth className="h-4 w-4" />Open field app</a></div>
                <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                  <InstrumentReading label="Low side" value="—" unit="PSIG" source="SM480V" tone="blue" />
                  <InstrumentReading label="High side" value="—" unit="PSIG" source="SM480V" tone="orange" />
                  <InstrumentReading label="Suction line" value="—" unit="°F" source="Clamp" tone="blue" />
                  <InstrumentReading label="Liquid line" value="—" unit="°F" source="Clamp" tone="orange" />
                </div>
                <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3"><ToolIdentity name="Fieldpiece SM480V" status="Not connected" /><ToolIdentity name="Fluke 902 FC" status="Not connected" /><ToolIdentity name="Job Link clamps" status="Not connected" /></div>
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section id="crm" className="tech-card scroll-mt-24 p-5 sm:p-6">
                  <PanelTitle icon={UserRound} kicker="CRM record" title="Customer 360" />
                  <div className="mt-4 rounded-2xl border border-wise-cyan/25 bg-wise-cyan/5 p-4 text-xs leading-5 text-wise-text/80"><strong className="text-wise-cyan">Customer record.</strong> Information appears only when supplied by dispatch.</div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2"><InfoBlock icon={Phone} label="Phone" value={selected.customerPhone || 'Not provided'} /><InfoBlock icon={Mail} label="Email" value={selected.customerEmail || 'Not provided'} /></div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs font-black uppercase tracking-wider text-wise-mute">Access notes</p><p className="mt-2 text-sm leading-6 text-wise-text/85">{selected.accessNotes || 'No access notes provided.'}</p></div>
                  <div className="mt-5"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-wise-mute"><History className="h-4 w-4" />Service history</div>{selected.serviceHistory.length ? <div className="mt-3 space-y-3">{selected.serviceHistory.map((event) => <div key={`${event.date}-${event.type}`} className="border-l border-wise-blue/40 pl-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-white">{event.type}</p><span className="text-xs text-wise-mute">{new Date(event.date).toLocaleDateString()}</span></div><p className="mt-1 text-xs leading-5 text-wise-mute">{event.summary}</p></div>)}</div> : <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-4 text-xs leading-5 text-wise-mute">No service history yet. Completed visits will appear here.</p>}</div>
                  <div className="mt-5 border-t border-white/10 pt-5"><label htmlFor="job-notes" className="text-xs font-black uppercase tracking-wider text-wise-mute">Technician notes</label><textarea id="job-notes" className="wise-input mt-3 min-h-28 resize-y" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record verified readings, work performed, parts used, and customer authorization." /><button type="button" onClick={() => updateJob({ notes }, 'CRM notes saved.')} disabled={saving || notes === selected.notes} className="wise-button-blue mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50" aria-busy={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save CRM notes</button></div>
                </section>

                <section id="diagnostics" className="tech-card scroll-mt-24 p-5 sm:p-6">
                  <PanelTitle icon={Bot} kicker="WISE AI copilot" title="Diagnostic assist" />
                  <p className="mt-3 text-sm leading-6 text-wise-mute">Describe what you observe, including readings, sounds, fault codes, and operating conditions.</p><label htmlFor="symptoms" className="sr-only">Observed symptoms and measurements</label><textarea id="symptoms" className="wise-input mt-4 min-h-32 resize-y" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="Enter observed symptoms and verified measurements." /><button type="button" onClick={runDiagnosis} disabled={analyzing || !symptoms.trim()} className="wise-button-orange mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50" aria-busy={analyzing}>{analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{analyzing ? 'Analyzing system…' : 'Run AI diagnosis'}</button>
                  {diagnosis ? <div className="mt-5 space-y-4" aria-live="polite"><div className="rounded-2xl border border-wise-orange/30 bg-wise-orange/10 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-wider text-wise-ember">Likely cause</p><span className="text-xs font-black text-white">{diagnosis.confidence}% confidence</span></div><p className="mt-2 text-lg font-black text-white">{diagnosis.likelyCause}</p><p className="mt-2 text-xs leading-5 text-wise-text/80">{diagnosis.reasoning}</p></div><DiagnosticList title="Verification sequence" items={diagnosis.checks} /><DiagnosticList title="Likely parts" items={diagnosis.parts} /><div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-200"><ShieldAlert className="h-4 w-4" />Safety gate</p><p className="mt-2 text-xs leading-5 text-red-100/80">{diagnosis.safety}</p></div><div className="rounded-2xl border border-wise-cyan/25 bg-wise-cyan/5 p-4"><p className="text-xs font-black uppercase tracking-wider text-wise-cyan">Customer-ready explanation</p><p className="mt-2 text-sm leading-6 text-wise-text/85">{diagnosis.customerSummary}</p></div><p className="text-[11px] leading-5 text-wise-mute">{diagnosis.disclaimer}</p></div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-6 text-center"><Bot className="mx-auto h-8 w-8 text-wise-cyan/70" /><p className="mt-3 text-sm font-bold text-white">Ready for field observations</p><p className="mt-1 text-xs leading-5 text-wise-mute">The copilot uses the work order, equipment record, and your symptoms to generate a verification plan.</p></div>}
                </section>
              </div>

              <section className="tech-card p-5 sm:p-6"><PanelTitle icon={Wrench} kicker="Asset record" title="Equipment & warranty" /><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><DataPoint label="Manufacturer" value={selected.equipment.manufacturer} /><DataPoint label="Model" value={selected.equipment.model} /><DataPoint label="Serial" value={selected.equipment.serial} /><DataPoint label="Installed" value={new Date(selected.equipment.installedAt).toLocaleDateString()} /></div><div className="mt-3 flex items-start gap-3 rounded-2xl border border-wise-success/25 bg-wise-success/10 p-4 text-sm text-wise-success"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{selected.equipment.warranty}</span></div></section>

              <section id="closeout" className="tech-card scroll-mt-24 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><PanelTitle icon={FileCheck2} kicker="Job closeout" title="Field-ready report" /><span className="tech-status border-wise-orange/35 bg-wise-orange/10 text-wise-ember">{Object.values(reportChecks).filter(Boolean).length}/4 complete</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{([
                ['readings', 'Verified readings attached', 'SM480V, clamps, and meter capture'],
                ['notes', 'Work performed documented', 'Finding, repair, and final condition'],
                ['photos', 'Before and after photos', 'Equipment and completed work'],
                ['approval', 'Customer approval captured', 'Authorization and completion signature'],
              ] as const).map(([key, title, copy]) => <label key={key} className="closeout-check"><input type="checkbox" checked={reportChecks[key]} onChange={(event) => setReportChecks((current) => ({ ...current, [key]: event.target.checked }))} /><span className="closeout-checkmark"><Check className="h-4 w-4" /></span><span><strong>{title}</strong><small>{copy}</small></span></label>)}</div><div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 text-xs text-wise-mute"><Activity className="h-4 w-4 text-wise-success" />Draft auto-saved locally · syncs when online</div><button type="button" onClick={() => updateJob({ status: 'COMPLETED', notes }, 'Report finalized and job completed.')} disabled={saving || !Object.values(reportChecks).every(Boolean)} className="wise-button-blue disabled:cursor-not-allowed disabled:opacity-40"><FileCheck2 className="h-4 w-4" />Finalize report</button></div></section>
            </div> : <div id="work-order" className="tech-card grid min-h-96 place-items-center p-6 text-center sm:p-10"><div className="max-w-md"><ClipboardCheck className="mx-auto h-10 w-10 text-wise-cyan" /><h2 className="mt-4 font-display text-2xl font-black uppercase text-white sm:text-3xl">No work orders assigned</h2><p className="mt-3 text-sm leading-6 text-wise-mute">Your queue and CRM are empty. New customer information will appear here only after dispatch assigns a real job.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={loadJobs} disabled={loading} className="wise-button-blue"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Check dispatch</button><a href={`${basePath}/download`} className="tech-secondary-button"><Bluetooth className="h-4 w-4" />Get field app</a></div></div></div>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, value, label, tone }: { icon: typeof ClipboardCheck; value: string | number; label: string; tone: 'blue' | 'orange' | 'green' | 'cyan' }) {
  const tones = { blue: 'text-wise-blue', orange: 'text-wise-ember', green: 'text-wise-success', cyan: 'text-wise-cyan' };
  return <div className="tech-card flex items-center gap-3 p-4"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div><p className="font-display text-2xl font-black text-white">{value}</p><p className="text-[10px] font-bold uppercase tracking-wider text-wise-mute">{label}</p></div></div>;
}
function PanelTitle({ icon: Icon, kicker, title }: { icon: typeof Bot; kicker: string; title: string }) { return <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-wise-blue/25 bg-wise-blue/10 text-wise-cyan"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-wise-cyan">{kicker}</p><h3 className="mt-1 font-display text-2xl font-black uppercase text-white">{title}</h3></div></div>; }
function InfoBlock({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) { return <div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-wise-cyan"><Icon className="h-4 w-4" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-wise-mute">{label}</p><p className="mt-1 text-sm leading-5 text-white">{value}</p></div></div>; }
function DataPoint({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-wise-mute">{label}</p><p className="mt-2 break-all text-sm font-bold text-white">{value}</p></div>; }
function DiagnosticList({ title, items }: { title: string; items: string[] }) { return <div><p className="text-xs font-black uppercase tracking-wider text-wise-mute">{title}</p><div className="mt-2 space-y-2">{items.map((item) => <div key={item} className="flex items-start gap-2 text-xs leading-5 text-wise-text/85"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wise-success" />{item}</div>)}</div></div>; }
function InstrumentReading({ label, value, unit, source, tone }: { label: string; value: string; unit: string; source: string; tone: 'blue' | 'orange' }) { return <div className={`instrument-reading instrument-reading-${tone}`}><div className="flex items-center justify-between"><span>{label}</span><Thermometer className="h-4 w-4" /></div><div className="mt-4 flex items-end gap-2"><strong>{value}</strong><em>{unit}</em></div><small>{source}</small></div>; }
function ToolIdentity({ name, status }: { name: string; status: string }) { return <div className="flex items-center justify-between gap-3 bg-wise-panel px-5 py-4"><div className="flex items-center gap-3"><span className="field-live-dot" /><span className="text-xs font-bold text-white">{name}</span></div><span className="text-[10px] font-black uppercase tracking-wider text-wise-mute">{status}</span></div>; }
