'use client';

import { useState } from 'react';
import { Camera, Mic, Navigation, Phone, QrCode, ScanLine } from 'lucide-react';
import { FieldHeader, Unknown } from './FieldChrome';
import { JOB_STATUS_LABELS, JOB_STATUSES, type FieldJob, type JobStatus } from '@/lib/field-data';
import type { AttachmentRecord } from '@/lib/field-session';

function unknown(value?: string | number | null) {
  if (value === 0) return '0';
  return value === null || value === undefined || String(value).trim() === '' ? '—' : String(value);
}

export function ActiveWorkOrder({
  jobs,
  selected,
  loading,
  saving,
  equipmentDraft,
  attachments,
  scanOpen,
  scanMessage,
  onSelect,
  onUpdate,
  onStartDiagnostic,
  onScan,
  onCloseScan,
  onResolveToken,
  onEquipmentField,
  onAddPhoto,
  onAddVoice,
  onCall,
}: {
  jobs: FieldJob[];
  selected?: FieldJob;
  loading: boolean;
  saving: boolean;
  equipmentDraft: Record<string, string>;
  attachments: AttachmentRecord[];
  scanOpen: boolean;
  scanMessage: string;
  onSelect: (id: string) => void;
  onUpdate: (updates: { status?: JobStatus; notes?: string }, success: string) => void;
  onStartDiagnostic: () => void;
  onScan: () => void;
  onCloseScan: () => void;
  onResolveToken: (token: string) => void;
  onEquipmentField: (key: string, value: string) => void;
  onAddPhoto: (file: File) => void;
  onAddVoice: () => void;
  onCall: () => void;
}) {
  const [token, setToken] = useState('');
  const [query, setQuery] = useState('');
  const equipment = selected?.equipment;
  const merged = {
    manufacturer: equipmentDraft.manufacturer || equipment?.manufacturer || '',
    model: equipmentDraft.model || equipment?.model || '',
    serial: equipmentDraft.serial || equipment?.serial || '',
    equipmentType: equipmentDraft.equipmentType || equipment?.equipmentType || '',
    refrigerant: equipmentDraft.refrigerant || equipment?.refrigerant || '',
    voltage: equipmentDraft.voltage || equipment?.voltage || '',
    phase: equipmentDraft.phase || equipment?.phase || '',
    location: equipmentDraft.location || equipment?.location || '',
    assetId: equipmentDraft.assetId || equipment?.assetId || '',
    nominalCapacity: equipmentDraft.nominalCapacity || equipment?.nominalCapacity || (equipment?.tonnage ? String(equipment.tonnage) : ''),
    installedAt: equipment?.installedAt || '',
  };
  const filtered = query.trim()
    ? jobs.filter((job) => `${job.customerName} ${job.equipment.serial} ${job.equipment.model} ${job.id}`.toLowerCase().includes(query.toLowerCase()))
    : jobs;

  return (
    <>
      <FieldHeader title="JOB" subtitle="WORK ORDER" badgeLabel="WO" badgeValue={selected?.id || '—'} />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          {loading ? <p className="imp-empty">Loading work orders…</p> : null}
          <section className="imp-panel">
            <h2>ASSIGNED CALLS</h2>
            <input className="wise-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, serial, asset…" />
            {filtered.map((job) => (
              <button key={job.id} type="button" className="imp-job-btn" data-active={selected?.id === job.id} onClick={() => onSelect(job.id)}>
                <strong style={{ display: 'block' }}>{job.customerName}</strong>
                <p style={{ margin: '6px 0 0', color: '#98A2AC', fontSize: 12 }}>{job.complaint || 'Complaint not provided'}</p>
                <small style={{ display: 'block', marginTop: 8, color: '#66717A' }}>{JOB_STATUS_LABELS[job.status]} · {job.id}</small>
              </button>
            ))}
            {jobs.length === 0 ? <p className="imp-empty">No work order is assigned.</p> : null}
          </section>

          {selected ? (
            <>
              <section className="imp-panel" id="work-order">
                <h2>WORK ORDER</h2>
                <div className="imp-kv"><span>Number</span><Unknown value={selected.id} /></div>
                <div className="imp-kv"><span>Customer</span><Unknown value={selected.customerName} /></div>
                <div className="imp-kv"><span>Site</span><Unknown value={selected.address} /></div>
                <div className="imp-kv"><span>Contact</span><Unknown value={selected.customerPhone} /></div>
                <div className="imp-kv"><span>Complaint</span><Unknown value={selected.complaint} /></div>
                <div className="imp-kv"><span>Priority</span><Unknown value={selected.priority} /></div>
                <div className="imp-kv"><span>Dispatch notes</span><Unknown value={selected.dispatchNotes} /></div>
                <div className="imp-kv"><span>Tech notes</span><Unknown value={selected.notes} /></div>
                <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                  <button type="button" className="imp-primary" onClick={onStartDiagnostic} disabled={saving}>START DIAGNOSTIC</button>
                  <button type="button" className="imp-ghost-btn" onClick={onScan}><ScanLine className="h-4 w-4" />SCAN EQUIPMENT</button>
                  <label className="imp-ghost-btn">
                    <Camera className="h-4 w-4" />ADD PHOTO
                    <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onAddPhoto(file);
                      event.currentTarget.value = '';
                    }} />
                  </label>
                  <button type="button" className="imp-ghost-btn" onClick={onAddVoice}><Mic className="h-4 w-4" />VOICE NOTE</button>
                  {selected.customerPhone ? (
                    <a className="imp-ghost-btn" href={`tel:${selected.customerPhone}`} onClick={onCall}><Phone className="h-4 w-4" />CALL CUSTOMER</a>
                  ) : (
                    <button type="button" className="imp-ghost-btn" disabled><Phone className="h-4 w-4" />CALL CUSTOMER</button>
                  )}
                  {selected.address ? (
                    <a className="imp-ghost-btn" href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer">
                      <Navigation className="h-4 w-4" />Route
                    </a>
                  ) : null}
                </div>
                <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                  {JOB_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="imp-ghost-btn"
                      disabled={saving || selected.status === status}
                      onClick={() => onUpdate({ status }, `Job marked ${JOB_STATUS_LABELS[status].toLowerCase()}.`)}
                    >
                      {JOB_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </section>

              <section className="imp-panel">
                <h2>EQUIPMENT</h2>
                <p className="imp-empty" style={{ textAlign: 'left' }}>Unknown fields stay unknown. Model numbers are not used to guess refrigerant or capacity.</p>
                {([
                  ['manufacturer', 'Manufacturer'],
                  ['model', 'Model'],
                  ['serial', 'Serial'],
                  ['assetId', 'Asset ID'],
                  ['equipmentType', 'Type'],
                  ['refrigerant', 'Refrigerant'],
                  ['nominalCapacity', 'Nominal capacity'],
                  ['voltage', 'Voltage'],
                  ['phase', 'Phase'],
                  ['location', 'Location'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="imp-kv" style={{ alignItems: 'center' }}>
                    <span>{label}</span>
                    <input
                      className="wise-input"
                      value={merged[key]}
                      placeholder="Unknown"
                      onChange={(event) => onEquipmentField(key, event.target.value)}
                    />
                  </label>
                ))}
                <div className="imp-kv"><span>Install date</span><Unknown value={merged.installedAt ? new Date(merged.installedAt).toLocaleDateString() : ''} /></div>
                <div className="imp-kv"><span>Warranty</span><Unknown value={equipment?.warranty} /></div>
              </section>

              <section className="imp-panel">
                <h2>HISTORY</h2>
                {(selected.serviceHistory || []).length === 0 ? <p className="imp-empty">No previous repair history on this work order.</p> : null}
                {(selected.serviceHistory || []).map((event) => (
                  <p key={`${event.date}-${event.type}`} style={{ fontSize: 12, color: '#98A2AC' }}>
                    {event.type} · {new Date(event.date).toLocaleDateString()} · {event.summary}
                  </p>
                ))}
              </section>

              <section className="imp-panel">
                <h2>PHOTOS / VOICE</h2>
                {attachments.length === 0 ? <p className="imp-empty">No attachments on this job.</p> : null}
                {attachments.map((item) => (
                  <p key={item.id} style={{ fontSize: 12, color: '#98A2AC' }}>
                    {item.kind} · {item.name} · {item.syncState}
                    {item.transcript ? ` · transcript reviewed` : ''}
                  </p>
                ))}
              </section>
            </>
          ) : (
            <div className="imp-panel"><p className="imp-empty">No work order is assigned.</p></div>
          )}

          {scanOpen ? (
            <section className="imp-panel">
              <h2><QrCode className="mr-2 inline h-4 w-4" />SCAN / TOKEN</h2>
              <p className="imp-empty" style={{ textAlign: 'left' }}>
                Use a WISE² record token (work order or asset ID). Customer details are not encoded in the QR payload.
              </p>
              {scanMessage ? <div className="imp-alert">{scanMessage}</div> : null}
              <input className="wise-input" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Job ID, serial, or asset token" />
              <button type="button" className="imp-primary" onClick={() => onResolveToken(token)}>RESOLVE</button>
              <p style={{ fontSize: 12, color: '#98A2AC' }}>QR for this job: {unknown(selected?.id)}</p>
              <button type="button" className="imp-ghost-btn" onClick={onCloseScan}>Close scanner</button>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
