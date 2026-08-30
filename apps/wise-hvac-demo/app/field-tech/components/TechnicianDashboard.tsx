'use client';

import { Bluetooth, Cpu, QrCode, Radio, RefreshCw, ScanLine } from 'lucide-react';
import { FieldHeader } from './FieldChrome';
import { JOB_STATUS_LABELS, type FieldJob, type JobStatus } from '@/lib/field-data';

const BUCKETS: JobStatus[] = ['DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'COMPLETED'];

function elapsedLabel(startedAt: string | null): string {
  if (!startedAt) return '—';
  const ms = Date.now() - Date.parse(startedAt);
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function TechnicianDashboard({
  jobs,
  loading,
  selected,
  startedAt,
  toolsLabel,
  impAvailable,
  online,
  onOpenJob,
  onResume,
  onRefresh,
  onQuick,
}: {
  jobs: FieldJob[];
  loading: boolean;
  selected?: FieldJob;
  startedAt: string | null;
  toolsLabel: string;
  impAvailable: boolean;
  online: boolean;
  onOpenJob: (jobId?: string) => void;
  onResume: () => void;
  onRefresh: () => void;
  onQuick: (action: 'scan' | 'tools' | 'diagnostic' | 'equipment' | 'imp') => void;
}) {
  return (
    <>
      <FieldHeader
        title="TODAY"
        subtitle="TECHNICIAN STATUS"
        badgeLabel="QUEUE"
        badgeValue={String(jobs.length)}
      />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <section className="imp-panel">
            <h2>WISE² FIELD TECH</h2>
            <div className="imp-kv"><span>Network</span><UnknownLine value={online ? 'Online' : 'Offline'} /></div>
            <div className="imp-kv"><span>Tools</span><UnknownLine value={toolsLabel} /></div>
            <div className="imp-kv"><span>IMP</span><UnknownLine value={impAvailable ? 'Available' : 'Unavailable'} /></div>
          </section>

          {selected ? (
            <section className="imp-panel">
              <h2>ACTIVE CALL</h2>
              <div className="imp-kv"><span>Customer</span><UnknownLine value={selected.customerName} /></div>
              <div className="imp-kv"><span>Location</span><UnknownLine value={selected.address} /></div>
              <div className="imp-kv"><span>Equipment</span><UnknownLine value={[selected.equipment.manufacturer, selected.equipment.model].filter(Boolean).join(' ')} /></div>
              <div className="imp-kv"><span>Complaint</span><UnknownLine value={selected.complaint} /></div>
              <div className="imp-kv"><span>Arrival</span><UnknownLine value={JOB_STATUS_LABELS[selected.status]} /></div>
              <div className="imp-kv"><span>Diagnostic time</span><UnknownLine value={elapsedLabel(startedAt)} /></div>
              <button type="button" className="imp-primary" onClick={onResume}>RESUME DIAGNOSTIC</button>
              <button type="button" className="imp-ghost-btn" onClick={() => onOpenJob(selected.id)}>OPEN JOB</button>
            </section>
          ) : (
            <section className="imp-panel">
              <p className="imp-empty">No work order is assigned. Check dispatch when a job is released.</p>
              <button type="button" className="imp-primary" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />CHECK DISPATCH
              </button>
            </section>
          )}

          <section className="imp-panel">
            <h2>TODAY&apos;S WORK</h2>
            {loading ? <p className="imp-empty">Loading assigned calls…</p> : null}
            <div className="imp-evidence-grid">
              {BUCKETS.map((status) => {
                const count = jobs.filter((job) => job.status === status).length;
                return (
                  <div key={status} className="imp-metric-card">
                    <small>{JOB_STATUS_LABELS[status].toUpperCase()}</small>
                    <div className="imp-metric-value"><strong>{count}</strong></div>
                  </div>
                );
              })}
            </div>
            {jobs.map((job) => (
              <button key={job.id} type="button" className="imp-job-btn" data-active={selected?.id === job.id} onClick={() => onOpenJob(job.id)}>
                <strong style={{ display: 'block' }}>{job.customerName}</strong>
                <p style={{ margin: '6px 0 0', color: '#98A2AC', fontSize: 12 }}>{job.complaint || 'Complaint not provided'}</p>
                <small style={{ display: 'block', marginTop: 8, color: '#66717A' }}>{JOB_STATUS_LABELS[job.status]}</small>
              </button>
            ))}
          </section>

          <section className="imp-panel">
            <h2>QUICK ACTIONS</h2>
            <div className="imp-quick-grid">
              <button type="button" className="imp-ghost-btn" onClick={() => onQuick('scan')}><ScanLine className="h-4 w-4" />Scan Equipment</button>
              <button type="button" className="imp-ghost-btn" onClick={() => onQuick('tools')}><Bluetooth className="h-4 w-4" />Connect Smart Tools</button>
              <button type="button" className="imp-ghost-btn" onClick={() => onQuick('diagnostic')}><Radio className="h-4 w-4" />New Diagnostic</button>
              <button type="button" className="imp-ghost-btn" onClick={() => onQuick('equipment')}><QrCode className="h-4 w-4" />Recent Equipment</button>
              <button type="button" className="imp-ghost-btn" onClick={() => onQuick('imp')}><Cpu className="h-4 w-4" />IMP</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function UnknownLine({ value }: { value?: string | null }) {
  return <strong>{value?.trim() ? value : '—'}</strong>;
}
