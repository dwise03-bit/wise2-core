'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bluetooth, Check, CheckCircle2, ClipboardCheck, FileCheck2,
  Loader2, MapPin, Navigation, Phone, Radio, RefreshCw,
  Save, Thermometer, Wifi, Zap, Sparkles,
} from 'lucide-react';
import {
  DiagnosticApiResult,
  FieldJobLike,
  formatReportTitle,
  formatShareText,
  toImpDiagnosticViewModel,
} from '@/lib/imp-diagnostics';
import { DiagnosticHeader } from './components/DiagnosticHeader';
import { DiagnosticFullReport } from './components/DiagnosticFullReport';
import { FieldTechBottomNav, FieldTechTab } from './components/FieldTechBottomNav';
import { ImpDiagnosticLoadingState, ImpDiagnosticResultsScreen } from './components/ImpDiagnosticResultsScreen';
import './imp-diagnostics.css';

type JobStatus = 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';
type Job = FieldJobLike & {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  appointmentAt: string;
  complaint: string;
  status: JobStatus;
  priority: 'NORMAL' | 'HIGH';
  notes: string;
  accessNotes: string;
  updatedAt: string;
  equipment: {
    manufacturer: string;
    model: string;
    serial: string;
    tonnage: number;
    installedAt: string;
    warranty: string;
  };
  serviceHistory: Array<{ date: string; type: string; summary: string; amount?: number }>;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/wise-hvac-demo';
const statusLabels: Record<JobStatus, string> = {
  DISPATCHED: 'Dispatched',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};
const HASH_TO_TAB: Record<string, FieldTechTab> = {
  'work-order': 'jobs',
  jobs: 'jobs',
  instruments: 'tools',
  tools: 'tools',
  crm: 'more',
  closeout: 'more',
  more: 'more',
  diagnostics: 'imp',
  imp: 'imp',
  dashboard: 'dashboard',
};

function tabFromHash(): FieldTechTab {
  if (typeof window === 'undefined') return 'imp';
  const key = window.location.hash.replace('#', '');
  return HASH_TO_TAB[key] || 'imp';
}

export function FieldTechApp() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosticApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<FieldTechTab>('imp');
  const [reportOpen, setReportOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [reportChecks, setReportChecks] = useState({
    readings: true,
    notes: false,
    photos: false,
    approval: false,
  });
  const autoDiagnoseRef = useRef(false);
  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) || jobs[0],
    [jobs, selectedId],
  );
  const viewModel = useMemo(
    () => toImpDiagnosticViewModel(diagnosis, selected, { symptoms }),
    [diagnosis, selected, symptoms],
  );

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    setNotes(selected?.notes || '');
    setSymptoms(selected?.complaint || '');
    setDiagnosis(null);
    setMessage('');
    setReportOpen(false);
  }, [selected?.id]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return;
    if (typeof window === 'undefined' || autoDiagnoseRef.current) return;
    if (new URLSearchParams(window.location.search).get('autodiagnose') !== '1') return;
    if (!selected?.id || !symptoms.trim() || analyzing || diagnosis) return;
    autoDiagnoseRef.current = true;
    void runDiagnosis();
  }, [selected?.id, symptoms, analyzing, diagnosis]);

  function changeTab(next: FieldTechTab) {
    setTab(next);
    const hash = next === 'imp' ? 'diagnostics' : next === 'jobs' ? 'work-order' : next === 'tools' ? 'instruments' : next;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${hash}`);
  }

  async function updateJob(updates: { status?: JobStatus; notes?: string }, success: string) {
    if (!selected) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${basePath}/api/field/jobs/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Update could not be saved.');
      const updated = (await response.json()) as Job;
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)));
      setNotes(updated.notes);
      setMessage(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Update could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function runDiagnosis() {
    if (!selected || !symptoms.trim()) return;
    setAnalyzing(true);
    setDiagnosis(null);
    setError('');
    try {
      const response = await fetch(`${basePath}/api/field/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selected.id, symptoms }),
      });
      if (!response.ok) throw new Error('AI diagnosis could not be generated.');
      setDiagnosis((await response.json()) as DiagnosticApiResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'AI diagnosis could not be generated.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function shareReport() {
    if (!diagnosis) return;
    setShareLoading(true);
    setError('');
    const title = formatReportTitle(viewModel);
    const text = formatShareText(viewModel, selected);
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text });
      } else {
        const mailto = `mailto:${encodeURIComponent(selected?.customerEmail || '')}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
        window.location.href = mailto;
      }
    } catch (caught) {
      if ((caught as { name?: string })?.name !== 'AbortError') {
        const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
        window.location.href = mailto;
      }
    } finally {
      setShareLoading(false);
    }
  }

  const activeCount = jobs.filter((job) => job.status !== 'COMPLETED').length;
  const completedCount = jobs.filter((job) => job.status === 'COMPLETED').length;

  return (
    <div className="imp-app-root">
      <div className="imp-phone-shell">
        {tab === 'imp' && analyzing ? <ImpDiagnosticLoadingState systemId={viewModel.systemId} /> : null}
        {tab === 'imp' && !analyzing && diagnosis ? (
          <ImpDiagnosticResultsScreen
            model={viewModel}
            onViewReport={() => setReportOpen(true)}
            onShareReport={shareReport}
            shareLoading={shareLoading}
            onRunAgain={() => {
              setDiagnosis(null);
              setReportOpen(false);
            }}
          />
        ) : null}
        {tab === 'imp' && !analyzing && !diagnosis ? (
          <ImpCapturePane
            selected={selected}
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            analyzing={analyzing}
            onRun={runDiagnosis}
            systemId={viewModel.systemId}
            error={error}
          />
        ) : null}

        {tab === 'dashboard' ? (
          <DashboardPane
            jobs={jobs}
            loading={loading}
            activeCount={activeCount}
            completedCount={completedCount}
            selected={selected}
            onOpenJob={() => changeTab('jobs')}
            onRefresh={loadJobs}
          />
        ) : null}

        {tab === 'jobs' ? (
          <JobsPane
            jobs={jobs}
            selected={selected}
            loading={loading}
            saving={saving}
            onSelect={setSelectedId}
            onUpdate={updateJob}
          />
        ) : null}

        {tab === 'tools' ? <ToolsPane /> : null}

        {tab === 'more' ? (
          <MorePane
            selected={selected}
            notes={notes}
            setNotes={setNotes}
            saving={saving}
            reportChecks={reportChecks}
            setReportChecks={setReportChecks}
            onSaveNotes={() => updateJob({ notes }, 'CRM notes saved.')}
            onFinalize={() => updateJob({ status: 'COMPLETED', notes }, 'Report finalized and job completed.')}
            message={message}
            error={error}
          />
        ) : null}

        <FieldTechBottomNav active={tab} onChange={changeTab} />
        {reportOpen ? (
          <DiagnosticFullReport
            model={viewModel}
            customerName={selected?.customerName}
            onClose={() => setReportOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}

function ImpCapturePane({
  selected,
  symptoms,
  setSymptoms,
  analyzing,
  onRun,
  systemId,
  error,
}: {
  selected?: Job;
  symptoms: string;
  setSymptoms: (value: string) => void;
  analyzing: boolean;
  onRun: () => void;
  systemId: string;
  error: string;
}) {
  return (
    <>
      <DiagnosticHeader systemId={systemId} />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <section className="imp-panel imp-form">
            <h2>FIELD OBSERVATIONS</h2>
            <p className="imp-empty" style={{ textAlign: 'left', marginBottom: 10 }}>
              {selected
                ? `Describe verified readings and symptoms for ${selected.customerName}.`
                : 'No work order is assigned. IMP can still format the results screen once a job is available.'}
            </p>
            <label htmlFor="symptoms" className="sr-only">Observed symptoms and measurements</label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              placeholder="Enter observed symptoms and verified measurements. Example: HIGH HEAD PRESSURE 248.7 PSIG, low subcooling 8.6°F."
            />
            <button
              type="button"
              className="imp-primary"
              onClick={onRun}
              disabled={analyzing || !selected || !symptoms.trim()}
              aria-busy={analyzing}
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {analyzing ? 'ANALYZING SYSTEM' : 'RUN AI DIAGNOSIS'}
            </button>
          </section>
          {error ? <div className="imp-alert" role="alert">{error}</div> : null}
          <div className="imp-panel">
            <p className="imp-empty">
              Results stay bound to the diagnostic engine. Missing values display as — or Not available.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardPane({
  jobs,
  loading,
  activeCount,
  completedCount,
  selected,
  onOpenJob,
  onRefresh,
}: {
  jobs: Job[];
  loading: boolean;
  activeCount: number;
  completedCount: number;
  selected?: Job;
  onOpenJob: () => void;
  onRefresh: () => void;
}) {
  return (
    <>
      <header className="imp-header">
        <div className="imp-wordmark">
          <strong>WISE²</strong>
          <span>IMP TECH</span>
        </div>
        <div className="imp-header-title">
          <strong>DASHBOARD</strong>
          <span>FIELD COMMAND</span>
        </div>
        <div className="imp-system-id">
          <span>QUEUE</span>
          <strong>{jobs.length}</strong>
        </div>
      </header>
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <div className="imp-evidence-grid">
            <DashStat icon={ClipboardCheck} value={jobs.length} label="Assigned" />
            <DashStat icon={Zap} value={activeCount} label="Active" />
            <DashStat icon={CheckCircle2} value={completedCount} label="Complete" />
            <DashStat icon={Wifi} value={loading ? '…' : 'Live'} label="Sync" />
          </div>
          {selected ? (
            <button type="button" className="imp-job-btn" onClick={onOpenJob}>
              <small style={{ color: '#66FF78', letterSpacing: '0.14em', fontSize: 10, fontWeight: 800 }}>ACTIVE JOB</small>
              <strong style={{ display: 'block', marginTop: 6, fontSize: 16 }}>{selected.customerName}</strong>
              <p style={{ margin: '6px 0 0', color: '#98A2AC', fontSize: 12 }}>{selected.complaint}</p>
            </button>
          ) : (
            <div className="imp-panel">
              <p className="imp-empty">No work orders assigned. Check dispatch when a job is released.</p>
              <button type="button" className="imp-primary" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />CHECK DISPATCH
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DashStat({ icon: Icon, value, label }: { icon: typeof ClipboardCheck; value: string | number; label: string }) {
  return (
    <div className="imp-metric-card">
      <Icon className="h-4 w-4" />
      <small>{label}</small>
      <div className="imp-metric-value"><strong>{value}</strong></div>
    </div>
  );
}

function JobsPane({
  jobs,
  selected,
  loading,
  saving,
  onSelect,
  onUpdate,
}: {
  jobs: Job[];
  selected?: Job;
  loading: boolean;
  saving: boolean;
  onSelect: (id: string) => void;
  onUpdate: (updates: { status?: JobStatus; notes?: string }, success: string) => void;
}) {
  return (
    <>
      <header className="imp-header">
        <div className="imp-wordmark">
          <strong>WISE²</strong>
          <span>IMP TECH</span>
        </div>
        <div className="imp-header-title">
          <strong>JOBS</strong>
          <span>WORK ORDERS</span>
        </div>
        <div className="imp-system-id">
          <span>TODAY</span>
          <strong>{jobs.length}</strong>
        </div>
      </header>
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#66FF78]" /> : null}
          {jobs.map((job) => (
            <button
              type="button"
              key={job.id}
              className="imp-job-btn"
              data-active={selected?.id === job.id}
              onClick={() => onSelect(job.id)}
            >
              <strong style={{ display: 'block' }}>{job.customerName}</strong>
              <p style={{ margin: '6px 0 0', color: '#98A2AC', fontSize: 12 }}>{job.complaint}</p>
              <small style={{ display: 'block', marginTop: 8, color: '#66717A' }}>{statusLabels[job.status]}</small>
            </button>
          ))}
          {selected ? (
            <section className="imp-panel" id="work-order">
              <h2>WORK ORDER</h2>
              <p style={{ color: '#F4F7F8', fontWeight: 700 }}>{selected.customerName}</p>
              <p>{selected.address || 'Address not provided'}</p>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {(['DISPATCHED', 'IN_PROGRESS', 'COMPLETED'] as JobStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="imp-ghost-btn"
                    disabled={saving || selected.status === status}
                    onClick={() => onUpdate({ status }, `Job marked ${statusLabels[status].toLowerCase()}.`)}
                  >
                    {selected.status === status && <Check className="mr-2 inline h-4 w-4" />}
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {selected.customerPhone ? (
                  <a className="imp-ghost-btn" href={`tel:${selected.customerPhone}`}><Phone className="h-4 w-4" /> Call</a>
                ) : (
                  <button className="imp-ghost-btn" type="button" disabled><Phone className="h-4 w-4" /> No phone</button>
                )}
                {selected.address ? (
                  <a className="imp-ghost-btn" href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer"><Navigation className="h-4 w-4" /> Route</a>
                ) : (
                  <button className="imp-ghost-btn" type="button" disabled><MapPin className="h-4 w-4" /> No address</button>
                )}
              </div>
            </section>
          ) : (
            <div className="imp-panel"><p className="imp-empty">No work orders assigned.</p></div>
          )}
        </div>
      </div>
    </>
  );
}

function ToolsPane() {
  return (
    <>
      <header className="imp-header">
        <div className="imp-wordmark">
          <strong>WISE²</strong>
          <span>IMP TECH</span>
        </div>
        <div className="imp-header-title">
          <strong>TOOLS</strong>
          <span>FIELD INSTRUMENTS</span>
        </div>
        <div className="imp-system-id">
          <span>BRIDGE</span>
          <strong>OFF</strong>
        </div>
      </header>
      <div className="imp-scroll">
        <div className="imp-scroll-inner" id="instruments">
          <section className="imp-panel">
            <h2><Radio className="mr-2 inline h-4 w-4" />LIVE READINGS</h2>
            <p className="imp-empty" style={{ textAlign: 'left' }}>
              Bluetooth capture runs in the native field app. No readings are simulated on the web.
            </p>
            <a href={`${basePath}/download`} className="imp-primary" style={{ marginTop: 12 }}>
              <Bluetooth className="h-4 w-4" />OPEN FIELD APP
            </a>
          </section>
          <div className="imp-evidence-grid">
            <InstrumentCard label="LOW SIDE" value="—" unit="PSIG" />
            <InstrumentCard label="HIGH SIDE" value="—" unit="PSIG" />
            <InstrumentCard label="SUCTION LINE" value="—" unit="°F" />
            <InstrumentCard label="LIQUID LINE" value="—" unit="°F" />
          </div>
        </div>
      </div>
    </>
  );
}

function InstrumentCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="imp-metric-card">
      <Thermometer className="h-4 w-4" />
      <small>{label}</small>
      <div className="imp-metric-value"><strong>{value}</strong><span>{unit}</span></div>
    </div>
  );
}

function MorePane({
  selected,
  notes,
  setNotes,
  saving,
  reportChecks,
  setReportChecks,
  onSaveNotes,
  onFinalize,
  message,
  error,
}: {
  selected?: Job;
  notes: string;
  setNotes: (value: string) => void;
  saving: boolean;
  reportChecks: { readings: boolean; notes: boolean; photos: boolean; approval: boolean };
  setReportChecks: Dispatch<SetStateAction<{ readings: boolean; notes: boolean; photos: boolean; approval: boolean }>>;
  onSaveNotes: () => void;
  onFinalize: () => void;
  message: string;
  error: string;
}) {
  return (
    <>
      <header className="imp-header">
        <div className="imp-wordmark">
          <strong>WISE²</strong>
          <span>IMP TECH</span>
        </div>
        <div className="imp-header-title">
          <strong>MORE</strong>
          <span>CRM / CLOSEOUT</span>
        </div>
        <div className="imp-system-id">
          <span>RECORD</span>
          <strong>{selected ? 'OPEN' : '—'}</strong>
        </div>
      </header>
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          {(error || message) ? <div className="imp-alert" data-tone={error ? undefined : 'ok'}>{error || message}</div> : null}
          <section className="imp-panel" id="crm">
            <h2>CUSTOMER 360</h2>
            {selected ? (
              <>
                <p>{selected.customerPhone || 'No phone'}</p>
                <p>{selected.customerEmail || 'No email'}</p>
                <p style={{ marginTop: 8 }}>{selected.accessNotes || 'No access notes provided.'}</p>
                <div style={{ marginTop: 12 }}>
                  {(selected.serviceHistory || []).map((event) => (
                    <p key={`${event.date}-${event.type}`} style={{ fontSize: 12, color: '#98A2AC' }}>
                      {event.type} · {new Date(event.date).toLocaleDateString()}
                    </p>
                  ))}
                </div>
                <label htmlFor="job-notes" className="sr-only">Technician notes</label>
                <textarea
                  id="job-notes"
                  className="wise-input mt-3 min-h-28"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Record verified readings, work performed, parts used, and customer authorization."
                />
                <button type="button" className="imp-primary" onClick={onSaveNotes} disabled={saving || notes === selected.notes}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  SAVE CRM NOTES
                </button>
              </>
            ) : <p className="imp-empty">No customer record until dispatch assigns a job.</p>}
          </section>
          {selected ? (
            <section className="imp-panel">
              <h2>EQUIPMENT</h2>
              <p>{selected.equipment.manufacturer} {selected.equipment.model}</p>
              <p>Serial {selected.equipment.serial || '—'}</p>
              <p>{selected.equipment.warranty}</p>
            </section>
          ) : null}
          <section className="imp-panel" id="closeout">
            <h2>CLOSEOUT</h2>
            {([
              ['readings', 'Verified readings attached'],
              ['notes', 'Work performed documented'],
              ['photos', 'Before and after photos'],
              ['approval', 'Customer approval captured'],
            ] as const).map(([key, title]) => (
              <label key={key} className="closeout-check" style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={reportChecks[key]}
                  onChange={(event) => setReportChecks((current) => ({ ...current, [key]: event.target.checked }))}
                />
                <span className="closeout-checkmark"><Check className="h-4 w-4" /></span>
                <span><strong>{title}</strong></span>
              </label>
            ))}
            <button
              type="button"
              className="imp-primary"
              onClick={onFinalize}
              disabled={saving || !Object.values(reportChecks).every(Boolean)}
            >
              <FileCheck2 className="h-4 w-4" />FINALIZE REPORT
            </button>
          </section>
          <a className="imp-ghost-btn" href={`${basePath}/`}>Return to WISE² HVAC</a>
        </div>
      </div>
    </>
  );
}
