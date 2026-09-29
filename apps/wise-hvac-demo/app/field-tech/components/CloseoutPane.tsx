'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { Check, FileCheck2, Loader2, Phone, Save, Zap } from 'lucide-react';
import { FieldHeader } from './FieldChrome';
import type { FieldJob } from '@/lib/field-data';
import type { MoreView } from '@/lib/field-tech-nav';
import type {
  AttachmentRecord,
  FieldSessionState,
  RepairKind,
  RepairVerification,
} from '@/lib/field-session';
import { MEASUREMENT_CATALOG } from '@/lib/measurements';
import { buildTestComparison } from '@/lib/service-notes';
import type { CustomerChatMessage, ServiceVisitRecord } from '@/lib/field-tech-local';
import { getServiceHistoryStats } from '@/lib/field-tech-local';

const COMPARE_KEYS = ['suction_pressure', 'liquid_pressure', 'superheat', 'subcooling', 'delta_t', 'tesp', 'amperage'];

export function CloseoutPane({
  view,
  onView,
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
  serviceHistory,
  chatMessages,
  chatDraft,
  setChatDraft,
  onSendChat,
  session,
  generatedNotes,
  generatedReport,
  onCaptureTestIn,
  onCaptureTestOut,
  onRepair,
  onVerification,
  onAcceptNotes,
  onEditNotes,
  onReviewReport,
  onGenerateReport,
}: {
  view: MoreView;
  onView: (view: MoreView) => void;
  selected?: FieldJob;
  notes: string;
  setNotes: (value: string) => void;
  saving: boolean;
  reportChecks: { readings: boolean; notes: boolean; photos: boolean; approval: boolean };
  setReportChecks: Dispatch<SetStateAction<{ readings: boolean; notes: boolean; photos: boolean; approval: boolean }>>;
  onSaveNotes: () => void;
  onFinalize: () => void;
  message: string;
  error: string;
  serviceHistory: ServiceVisitRecord[];
  chatMessages: CustomerChatMessage[];
  chatDraft: string;
  setChatDraft: (value: string) => void;
  onSendChat: () => void;
  session: FieldSessionState;
  generatedNotes: string;
  generatedReport: string;
  onCaptureTestIn: () => void;
  onCaptureTestOut: () => void;
  onRepair: (kind: RepairKind, summary: string, repairNotes: string) => void;
  onVerification: (value: RepairVerification) => void;
  onAcceptNotes: (text: string) => void;
  onEditNotes: (text: string) => void;
  onReviewReport: () => void;
  onGenerateReport: () => void;
}) {
  const stats = getServiceHistoryStats(serviceHistory);
  const labels = Object.fromEntries(MEASUREMENT_CATALOG.map((item) => [item.key, { label: item.label, unit: item.unit }]));
  const rows = buildTestComparison(session.testIn, session.testOut, COMPARE_KEYS, labels);

  return (
    <>
      <FieldHeader title="MORE" subtitle="REPAIR / REPORT" badgeLabel="RECORD" badgeValue={selected ? 'OPEN' : '—'} />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <div className="imp-subnav" data-cols="4">
            <button type="button" data-active={view === 'job-closeout'} onClick={() => onView('job-closeout')}>CRM</button>
            <button type="button" data-active={view === 'repair'} onClick={() => onView('repair')}>REPAIR</button>
            <button type="button" data-active={view === 'notes'} onClick={() => onView('notes')}>NOTES</button>
            <button type="button" data-active={view === 'report'} onClick={() => onView('report')}>REPORT</button>
          </div>
          {(error || message) ? <div className="imp-alert" data-tone={error ? undefined : 'ok'}>{error || message}</div> : null}

          {view === 'repair' ? (
            <RepairPanel
              session={session}
              rows={rows}
              onCaptureTestIn={onCaptureTestIn}
              onCaptureTestOut={onCaptureTestOut}
              onRepair={onRepair}
              onVerification={onVerification}
            />
          ) : null}

          {view === 'notes' ? (
            <section className="imp-panel">
              <h2>SERVICE NOTES</h2>
              <p className="imp-empty" style={{ textAlign: 'left' }}>
                {session.notes.accepted ? 'Technician-accepted notes.' : 'AI/system draft — not technician-approved until you save/accept.'}
              </p>
              <textarea className="wise-input min-h-28" value={generatedNotes} onChange={(event) => onEditNotes(event.target.value)} />
              <button type="button" className="imp-primary" onClick={() => onAcceptNotes(generatedNotes)}>ACCEPT NOTES</button>
            </section>
          ) : null}

          {view === 'report' ? (
            <section className="imp-panel" id="closeout">
              <h2>SERVICE REPORT</h2>
              <p className="imp-empty" style={{ textAlign: 'left' }}>
                {session.report.reviewed ? 'Reviewed by technician.' : 'Draft only. Review before complete.'}
              </p>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#98A2AC' }}>{generatedReport || 'Generate a report from finalized information.'}</pre>
              <button type="button" className="imp-primary" onClick={onGenerateReport}>GENERATE SERVICE REPORT</button>
              <button type="button" className="imp-ghost-btn" onClick={onReviewReport} disabled={!generatedReport}>REVIEW REPORT</button>
              {([
                ['readings', 'Verified readings attached'],
                ['notes', 'Work performed documented'],
                ['photos', 'Before and after photos'],
                ['approval', 'Technician report review'],
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
                disabled={saving || !session.report.reviewed || !Object.values(reportChecks).every(Boolean)}
              >
                <FileCheck2 className="h-4 w-4" />COMPLETE JOB
              </button>
            </section>
          ) : null}

          {view === 'job-closeout' ? (
            <>
              <section className="imp-panel">
                <h2>TECH ANALYTICS</h2>
                <div className="imp-evidence-grid">
                  <div className="imp-metric-card"><small>VISITS</small><div className="imp-metric-value"><strong>{stats.totalJobs}</strong></div></div>
                  <div className="imp-metric-card"><small>AVG RATING</small><div className="imp-metric-value"><strong>{stats.avgRating ? stats.avgRating.toFixed(1) : '—'}</strong></div></div>
                  <div className="imp-metric-card"><small>REVENUE</small><div className="imp-metric-value"><strong>{stats.totalRevenue ? `$${Math.round(stats.totalRevenue)}` : '—'}</strong></div></div>
                </div>
              </section>
              <section className="imp-panel" id="crm">
                <h2>CUSTOMER 360</h2>
                {selected ? (
                  <>
                    <p>{selected.customerPhone || 'No phone'}</p>
                    <p>{selected.customerEmail || 'No email'}</p>
                    <p style={{ marginTop: 8 }}>{selected.accessNotes || 'No access notes provided.'}</p>
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
                  <h2>CUSTOMER MESSAGES</h2>
                  <p className="imp-empty" style={{ textAlign: 'left' }}>Local-only thread until a messaging API ships.</p>
                  {chatMessages.length === 0 ? <p style={{ color: '#98A2AC', fontSize: 12 }}>No messages yet.</p> : chatMessages.map((entry) => (
                    <div key={entry.id} style={{ padding: '8px 10px', borderRadius: 8, background: entry.isFromTech ? 'rgba(102,255,120,0.12)' : 'rgba(255,255,255,0.06)', fontSize: 12, marginTop: 8 }}>
                      <strong>{entry.isFromTech ? 'Tech' : 'Customer'}</strong>
                      <p style={{ margin: '4px 0 0' }}>{entry.message}</p>
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 10 }}>
                    <input className="wise-input" value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Update the customer…" />
                    <button type="button" className="imp-primary" onClick={onSendChat} disabled={!chatDraft.trim()}>Send</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    {selected.customerPhone ? <a className="imp-ghost-btn" href={`tel:${selected.customerPhone}`}><Phone className="h-4 w-4" /> Call</a> : <button className="imp-ghost-btn" type="button" disabled>No phone</button>}
                    {selected.customerPhone ? <a className="imp-ghost-btn" href={`sms:${selected.customerPhone}`}><Zap className="h-4 w-4" /> SMS</a> : <button className="imp-ghost-btn" type="button" disabled>No SMS</button>}
                  </div>
                </section>
              ) : null}
              <section className="imp-panel">
                <h2>ATTACHMENTS</h2>
                {session.attachments.length === 0 ? <p className="imp-empty">No photos or voice notes.</p> : session.attachments.map((item: AttachmentRecord) => (
                  <p key={item.id} style={{ fontSize: 12, color: '#98A2AC' }}>{item.kind} · {item.name} · {item.syncState}</p>
                ))}
              </section>
              <a className="imp-ghost-btn" href={`${process.env.NEXT_PUBLIC_BASE_PATH || '/wise-hvac-demo'}/`}>Return to WISE² HVAC</a>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function RepairPanel({
  session,
  rows,
  onCaptureTestIn,
  onCaptureTestOut,
  onRepair,
  onVerification,
}: {
  session: FieldSessionState;
  rows: ReturnType<typeof buildTestComparison>;
  onCaptureTestIn: () => void;
  onCaptureTestOut: () => void;
  onRepair: (kind: RepairKind, summary: string, repairNotes: string) => void;
  onVerification: (value: RepairVerification) => void;
}) {
  const [kind, setKind] = useState<RepairKind>('other');
  const [summary, setSummary] = useState(session.repair?.summary || '');
  const [repairNotes, setRepairNotes] = useState(session.repair?.notes || '');
  return (
    <>
      <section className="imp-panel">
        <h2>REPAIR</h2>
        <select className="wise-input" value={kind} onChange={(event) => setKind(event.target.value as RepairKind)}>
          <option value="part_replaced">Part replaced</option>
          <option value="adjustment">Adjustment</option>
          <option value="cleaning">Cleaning</option>
          <option value="wiring">Wiring correction</option>
          <option value="refrigerant">Refrigerant action</option>
          <option value="airflow">Airflow correction</option>
          <option value="other">Other action</option>
        </select>
        <input className="wise-input" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Repair performed" />
        <textarea className="wise-input" value={repairNotes} onChange={(event) => setRepairNotes(event.target.value)} placeholder="Technician notes" />
        <button type="button" className="imp-ghost-btn" onClick={onCaptureTestIn}>CAPTURE TEST-IN</button>
        <button type="button" className="imp-ghost-btn" onClick={onCaptureTestOut}>CAPTURE TEST-OUT</button>
        <button type="button" className="imp-primary" onClick={() => onRepair(kind, summary, repairNotes)}>SAVE REPAIR</button>
      </section>
      <section className="imp-panel">
        <h2>TEST-IN / TEST-OUT</h2>
        <p className="imp-empty" style={{ textAlign: 'left' }}>A numeric change is not automatically an improvement. Status is technician-verified.</p>
        <table className="imp-compare">
          <thead>
            <tr><th>Parameter</th><th>Test in</th><th>Test out</th><th>Change</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{row.testIn}</td>
                <td>{row.testOut}</td>
                <td>{row.change}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {(['REPAIR VERIFIED', 'PARTIALLY VERIFIED', 'NOT VERIFIED'] as RepairVerification[]).map((value) => (
            <button key={value} type="button" className="imp-ghost-btn" data-active={session.verification === value} onClick={() => onVerification(value)}>
              {value}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
