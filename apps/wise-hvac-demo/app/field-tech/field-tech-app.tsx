'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DiagnosticApiResult,
  formatReportTitle,
  formatShareText,
  toImpDiagnosticViewModel,
} from '@/lib/imp-diagnostics';
import {
  addServiceVisit,
  createBaselineReadings,
  loadCustomerMessages,
  loadServiceHistory,
  sendCustomerMessage,
  ServiceVisitRecord,
  tickSimulatedReadings,
  CustomerChatMessage,
} from '@/lib/field-tech-local';
import { FieldJob, JobStatus } from '@/lib/field-data';
import {
  FieldTechBottomNav,
} from './components/FieldTechBottomNav';
import { DiagnosticFullReport } from './components/DiagnosticFullReport';
import { TechnicianDashboard } from './components/TechnicianDashboard';
import { ActiveWorkOrder } from './components/ActiveWorkOrder';
import { SmartToolsPane } from './components/SmartToolsPane';
import { ImpWorkspace } from './components/ImpWorkspace';
import { CloseoutPane } from './components/CloseoutPane';
import { StatusStrip, WorkflowRail } from './components/FieldChrome';
import {
  FieldTechTab,
  hashForTab,
  impViewFromHash,
  moreViewFromHash,
  tabFromHash,
  toolsViewFromHash,
  type ImpView,
  type MoreView,
  type ToolsView,
} from '@/lib/field-tech-nav';
import {
  TOOL_ROLES,
  appendSample,
  deriveMeasurements,
  emptyMeasurement,
  markStale,
  snapshotToRaw,
  type Measurement,
  type MeasurementSample,
  type ToolCard,
} from '@/lib/measurements';
import { applyStabilityToMeasurements, assessStability } from '@/lib/stability';
import {
  captureSnapshot,
  emptySession,
  loadSession,
  saveSession,
  type AttachmentRecord,
  type FieldSessionState,
  type RepairKind,
  type RepairVerification,
} from '@/lib/field-session';
import { buildStructuredDiagnosis, type ImpDiagnosticResult } from '@/lib/imp-structured';
import { generateServiceNotes, generateServiceReport } from '@/lib/service-notes';
import type { GuidedTestRecord } from '@/lib/guided-tests';
import './imp-diagnostics.css';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/wise-hvac-demo';

function toolsFromMeasurements(measurements: Record<string, Measurement>, streaming: boolean): ToolCard[] {
  return TOOL_ROLES.map((role) => {
    const reading = measurements[role.measurementKey];
    const connected = streaming && reading?.simulated
      ? 'demo_stream'
      : reading?.source === 'manual'
        ? 'manual'
        : reading?.value != null
          ? 'disconnected'
          : 'disconnected';
    return {
      id: role.role,
      role: role.role,
      type: role.type,
      deviceName: streaming && reading?.simulated ? `Demo ${role.assignedRole}` : `${role.assignedRole} — not connected`,
      assignedRole: role.assignedRole,
      connection: connected,
      signalQuality: streaming && reading?.simulated ? 'fair' : '—',
      battery: streaming && reading?.simulated ? 72 : null,
      liveValue: reading?.value ?? null,
      unit: role.unit,
      lastUpdate: reading?.timestamp || null,
    };
  });
}

export function FieldTechApp() {
  const [jobs, setJobs] = useState<FieldJob[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosticApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<FieldTechTab>('dashboard');
  const [toolsView, setToolsView] = useState<ToolsView>('discover');
  const [moreView, setMoreView] = useState<MoreView>('job-closeout');
  const [impView, setImpView] = useState<ImpView>('capture');
  const [reportOpen, setReportOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [reportChecks, setReportChecks] = useState({
    readings: true,
    notes: false,
    photos: false,
    approval: false,
  });
  const [serviceHistory, setServiceHistory] = useState<ServiceVisitRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<CustomerChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [online, setOnline] = useState(true);
  const [impAvailable, setImpAvailable] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [toolScanMessage, setToolScanMessage] = useState('');
  const [session, setSession] = useState<FieldSessionState>(emptySession(''));
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const autoDiagnoseRef = useRef(false);
  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) || jobs[0],
    [jobs, selectedId],
  );
  const refrigerant = session.equipmentDraft.refrigerant || selected?.equipment.refrigerant || '';
  const measurements = useMemo(
    () => applyStabilityToMeasurements(
      markStale(deriveMeasurements(session.measurements, refrigerant || null)),
      assessStability(session.history, Object.keys(session.measurements), Date.now(), streaming),
    ),
    [session.measurements, session.history, refrigerant, streaming],
  );
  const stability = useMemo(
    () => assessStability(
      session.history,
      (streaming || session.history.length > 0)
        ? ['suction_pressure', 'liquid_pressure', 'suction_line_temp', 'liquid_line_temp']
        : [],
      Date.now(),
      streaming,
    ),
    [session.history, streaming],
  );
  const tools = useMemo(() => toolsFromMeasurements(measurements, streaming), [measurements, streaming]);
  const structured: ImpDiagnosticResult | null = diagnosis
    ? buildStructuredDiagnosis({
      complaint: selected?.complaint,
      symptoms,
      measurements: Object.values(measurements),
      refrigerantKnown: Boolean(refrigerant),
    })
    : session.diagnosis;
  const viewModel = useMemo(
    () => toImpDiagnosticViewModel(diagnosis, selected, { symptoms }),
    [diagnosis, selected, symptoms],
  );
  const toolsLabel = streaming ? 'DEMO STREAM' : Object.values(measurements).some((item) => item.source === 'manual' && item.value != null)
    ? 'MANUAL'
    : 'NO TOOLS';
  const workflowCompleted = {
    equipment: Boolean(selected?.equipment.serial || selected?.equipment.model || session.equipmentDraft.serial),
    connected: Object.values(measurements).some((item) => item.value != null),
    stabilized: stability.state === 'STABLE',
    diagnose: Boolean(diagnosis),
    repair: Boolean(session.repair?.savedAt),
    verify: Boolean(session.verification),
  };
  const workflowActive = !workflowCompleted.equipment
    ? 'equipment'
    : !workflowCompleted.connected
      ? 'connected'
      : !workflowCompleted.stabilized
        ? 'stabilized'
        : !workflowCompleted.diagnose
          ? 'diagnose'
          : !workflowCompleted.repair
            ? 'repair'
            : 'verify';

  async function loadJobs() {
    setError('');
    try {
      const response = await fetch(`${basePath}/api/field/jobs`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not sync the job queue.');
      const data = (await response.json()) as FieldJob[];
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
    setServiceHistory(loadServiceHistory());
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    setTab(tabFromHash(hash));
    setToolsView(toolsViewFromHash(hash));
    setMoreView(moreViewFromHash(hash));
    setImpView(impViewFromHash(hash));
    const onHash = () => {
      const next = window.location.hash;
      setTab(tabFromHash(next));
      setToolsView(toolsViewFromHash(next));
      setMoreView(moreViewFromHash(next));
      setImpView(impViewFromHash(next));
    };
    const syncOnline = () => setOnline(navigator.onLine);
    syncOnline();
    window.addEventListener('hashchange', onHash);
    window.addEventListener('online', syncOnline);
    window.addEventListener('offline', syncOnline);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('online', syncOnline);
      window.removeEventListener('offline', syncOnline);
    };
  }, []);

  useEffect(() => {
    setNotes(selected?.notes || '');
    setSymptoms(selected?.complaint || '');
    setDiagnosis(null);
    setMessage('');
    setReportOpen(false);
    setChatDraft('');
    setChatMessages(selected?.id ? loadCustomerMessages(selected.id) : []);
    const loaded = selected?.id ? loadSession(selected.id) : emptySession('');
    setSession(loaded);
    setGeneratedNotes(loaded.notes.text);
    setGeneratedReport(loaded.report.text);
    setStreaming(false);
  }, [selected?.id]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return;
    if (typeof window === 'undefined' || autoDiagnoseRef.current) return;
    if (new URLSearchParams(window.location.search).get('autodiagnose') !== '1') return;
    if (!selected?.id || !symptoms.trim() || analyzing || diagnosis) return;
    autoDiagnoseRef.current = true;
    void runDiagnosis();
  }, [selected?.id, symptoms, analyzing, diagnosis]);

  const demoRef = useRef(createBaselineReadings());

  useEffect(() => {
    if (!streaming) return undefined;
    demoRef.current = createBaselineReadings();
    const timer = window.setInterval(() => {
      demoRef.current = tickSimulatedReadings(demoRef.current);
      const snapshot = demoRef.current;
      setSession((current) => {
        const raw = snapshotToRaw(snapshot);
        let history: MeasurementSample[] = current.history;
        for (const item of Object.values(raw)) {
          if (item.value !== null) history = appendSample(history, item.key, item.value);
        }
        return saveSession({
          ...current,
          measurements: { ...current.measurements, ...raw },
          history,
        });
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [streaming]);

  function persist(next: FieldSessionState) {
    const saved = saveSession(next);
    setSession(saved);
    return saved;
  }

  function changeTab(next: FieldTechTab, hash?: string) {
    setTab(next);
    if (hash === 'live') setToolsView('live');
    if (hash === 'trends') setToolsView('trends');
    if (hash === 'repair') setMoreView('repair');
    if (hash === 'notes') setMoreView('notes');
    if (hash === 'report') setMoreView('report');
    if (hash === 'test') setImpView('next-test');
    if (hash === 'guided') setImpView('guided');
    const resolved = hash || hashForTab(next);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${resolved}`);
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
      const updated = (await response.json()) as FieldJob;
      setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)));
      setNotes(updated.notes);
      if (updates.status === 'COMPLETED') {
        const visit = addServiceVisit({
          jobId: selected.id,
          diagnosis: diagnosis?.likelyCause || selected.complaint || 'Field diagnosis',
          resolution: updates.notes || notes || 'Job completed',
          partsCost: 0,
          laborHours: 1,
          customerRating: null,
        });
        setServiceHistory((current) => [visit, ...current]);
        persist({ ...session, report: { ...session.report, finalized: true, updatedAt: new Date().toISOString() } });
      }
      setMessage(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Update could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  function handleSendChat() {
    if (!selected || !chatDraft.trim()) return;
    const entry = sendCustomerMessage(selected.id, chatDraft.trim(), true);
    setChatMessages((current) => [...current, entry]);
    setChatDraft('');
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
        body: JSON.stringify({
          jobId: selected.id,
          symptoms,
          refrigerant,
          measurements: Object.values(measurements),
          unstable: stability.state !== 'STABLE',
        }),
      });
      if (!response.ok) {
        setImpAvailable(false);
        throw new Error(online ? 'IMP unavailable.' : 'Offline — IMP cannot run until a connection returns.');
      }
      const payload = (await response.json()) as DiagnosticApiResult;
      setDiagnosis(payload);
      setImpAvailable(true);
      const nextStructured = buildStructuredDiagnosis({
        complaint: selected.complaint,
        symptoms,
        measurements: Object.values(measurements),
        refrigerantKnown: Boolean(refrigerant),
      });
      persist({ ...session, diagnosis: nextStructured, startedAt: session.startedAt || new Date().toISOString() });
      setImpView('results');
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

  function startDiagnostic() {
    if (!selected) return;
    persist({ ...session, startedAt: session.startedAt || new Date().toISOString() });
    void updateJob({ status: 'IN_PROGRESS' }, 'Diagnostic started.');
    changeTab('imp', 'diagnostics');
  }

  function resolveToken(token: string) {
    const value = token.trim();
    if (!value) {
      setScanMessage('Enter a record token.');
      return;
    }
    const match = jobs.find((job) => job.id === value || job.equipment.serial === value || job.equipment.assetId === value);
    if (match) {
      setSelectedId(match.id);
      setScanMessage(`Resolved work order ${match.id}.`);
      setScanOpen(false);
      return;
    }
    setScanMessage('No matching WISE² record. Token was not used to create a fake job.');
  }

  function addPhoto(file: File) {
    if (!selected) return;
    if (file.size > 400_000) {
      setError('Photo is too large to store locally. Attach a smaller still or use the native app.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: AttachmentRecord = {
        id: crypto.randomUUID(),
        kind: 'photo',
        name: file.name,
        associatedWith: 'work_order',
        dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
        createdAt: new Date().toISOString(),
        syncState: 'SAVED LOCALLY',
      };
      persist({ ...session, attachments: [attachment, ...session.attachments] });
      setMessage('Photo saved locally.');
    };
    reader.readAsDataURL(file);
  }

  async function addVoice() {
    if (!selected) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice capture is not available in this browser. Original audio cannot be recorded here.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const attachment: AttachmentRecord = {
            id: crypto.randomUUID(),
            kind: 'voice',
            name: `voice-${Date.now()}.webm`,
            associatedWith: 'diagnostic',
            dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
            transcript: '',
            createdAt: new Date().toISOString(),
            syncState: 'SAVED LOCALLY',
          };
          persist({ ...session, attachments: [attachment, ...session.attachments] });
          setMessage('Voice note saved locally. Add a reviewed transcript in notes if needed. Original audio is kept.');
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      window.setTimeout(() => recorder.stop(), 4000);
      setMessage('Recording a 4-second voice note…');
    } catch {
      setError('Microphone permission was not granted.');
    }
  }

  function saveManual(key: string, value: number) {
    const reading: Measurement = {
      ...emptyMeasurement(key, new Date().toISOString()),
      value,
      source: 'manual',
      status: 'valid',
    };
    persist({
      ...session,
      measurements: { ...session.measurements, [key]: reading },
      history: appendSample(session.history, key, value),
    });
  }

  const equipmentLabel = [selected?.equipment.manufacturer, selected?.equipment.model].filter(Boolean).join(' ') || 'Not identified';

  return (
    <div className="imp-app-root">
      <div className="imp-phone-shell" data-dense={tab === 'tools' || tab === 'imp'}>
        {!online ? <div className="imp-offline">OFFLINE — notes, measurements, and photos stay SAVED LOCALLY until sync is available.</div> : null}
        <StatusStrip online={online} toolsLabel={toolsLabel} impAvailable={impAvailable} syncState={session.syncState} />
        {selected ? (
          <WorkflowRail
            activeId={workflowActive}
            completed={workflowCompleted}
            onSelect={changeTab}
          />
        ) : null}

        {tab === 'dashboard' ? (
          <TechnicianDashboard
            jobs={jobs}
            loading={loading}
            selected={selected}
            startedAt={session.startedAt}
            toolsLabel={toolsLabel}
            impAvailable={impAvailable}
            online={online}
            onOpenJob={() => changeTab('jobs')}
            onResume={() => changeTab('imp')}
            onRefresh={loadJobs}
            onQuick={(action) => {
              if (action === 'scan') { setScanOpen(true); changeTab('jobs'); }
              if (action === 'tools') changeTab('tools');
              if (action === 'diagnostic') startDiagnostic();
              if (action === 'equipment') changeTab('jobs');
              if (action === 'imp') changeTab('imp');
            }}
          />
        ) : null}

        {tab === 'jobs' ? (
          <ActiveWorkOrder
            jobs={jobs}
            selected={selected}
            loading={loading}
            saving={saving}
            equipmentDraft={session.equipmentDraft}
            attachments={session.attachments}
            scanOpen={scanOpen}
            scanMessage={scanMessage}
            onSelect={setSelectedId}
            onUpdate={updateJob}
            onStartDiagnostic={startDiagnostic}
            onScan={() => { setScanOpen(true); setScanMessage(''); }}
            onCloseScan={() => setScanOpen(false)}
            onResolveToken={resolveToken}
            onEquipmentField={(key, value) => persist({ ...session, equipmentDraft: { ...session.equipmentDraft, [key]: value } })}
            onAddPhoto={addPhoto}
            onAddVoice={() => void addVoice()}
            onCall={() => undefined}
          />
        ) : null}

        {tab === 'tools' ? (
          <SmartToolsPane
            view={toolsView}
            onView={(next) => { setToolsView(next); changeTab('tools', next === 'discover' ? 'instruments' : next); }}
            tools={tools}
            measurements={measurements}
            history={session.history}
            stability={stability}
            streaming={streaming}
            scanMessage={toolScanMessage}
            onScan={() => setToolScanMessage('No Fieldpiece SDK on this web client. Use the native Field Tech app or enter a manual reading.')}
            onConnectKit={() => {
              setStreaming((value) => {
                if (value) {
                  persist({
                    ...session,
                    measurements: Object.fromEntries(
                      Object.entries(session.measurements).map(([key, item]) => [key, item.simulated ? emptyMeasurement(key) : item]),
                    ),
                  });
                }
                return !value;
              });
            }}
            onDisconnect={() => {
              setStreaming(false);
              persist({
                ...session,
                measurements: Object.fromEntries(
                  Object.entries(session.measurements).map(([key, item]) => [key, item.simulated ? emptyMeasurement(key) : item]),
                ),
              });
            }}
            onManual={saveManual}
          />
        ) : null}

        {tab === 'imp' ? (
          <ImpWorkspace
            view={diagnosis && impView === 'capture' ? 'results' : impView}
            onView={(next) => { setImpView(next); changeTab('imp', next === 'next-test' ? 'test' : next === 'guided' ? 'guided' : 'diagnostics'); }}
            selected={selected}
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            analyzing={analyzing}
            error={error}
            systemId={viewModel.systemId}
            diagnosis={diagnosis}
            viewModel={viewModel}
            structured={structured}
            measurements={measurements}
            guidedTests={session.guidedTests}
            stabilityReduced={stability.state !== 'STABLE' && stability.state !== 'WAITING'}
            onRun={runDiagnosis}
            onViewReport={() => setReportOpen(true)}
            onShareReport={shareReport}
            shareLoading={shareLoading}
            onClear={() => { setDiagnosis(null); setImpView('capture'); }}
            onSaveTest={(record: GuidedTestRecord) => persist({ ...session, guidedTests: [record, ...session.guidedTests] })}
            onStartGuided={(id) => {
              setImpView('guided');
              changeTab('imp', 'guided');
              persist(session);
              void id;
            }}
            onSaveFinding={() => {
              if (!structured) return;
              persist({ ...session, diagnosis: structured });
              setMessage('Finding saved locally.');
              changeTab('imp', 'test');
            }}
          />
        ) : null}

        {tab === 'more' ? (
          <CloseoutPane
            view={moreView}
            onView={(next) => { setMoreView(next); changeTab('more', next === 'job-closeout' ? 'more' : next); }}
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
            serviceHistory={serviceHistory}
            chatMessages={chatMessages}
            chatDraft={chatDraft}
            setChatDraft={setChatDraft}
            onSendChat={handleSendChat}
            session={session}
            generatedNotes={generatedNotes}
            generatedReport={generatedReport}
            onCaptureTestIn={() => persist({ ...session, testIn: captureSnapshot(measurements) })}
            onCaptureTestOut={() => persist({ ...session, testOut: captureSnapshot(measurements) })}
            onRepair={(kind: RepairKind, summary, repairNotes) => persist({
              ...session,
              repair: { kind, summary, notes: repairNotes, savedAt: new Date().toISOString() },
              testIn: session.testIn || captureSnapshot(measurements),
            })}
            onVerification={(value: RepairVerification) => persist({ ...session, verification: value })}
            onAcceptNotes={(text) => {
              persist({ ...session, notes: { text, accepted: true, updatedAt: new Date().toISOString() } });
              setGeneratedNotes(text);
              setMessage('Notes accepted by technician.');
            }}
            onEditNotes={(text) => {
              setGeneratedNotes(text);
              persist({ ...session, notes: { text, accepted: false, updatedAt: new Date().toISOString() } });
            }}
            onReviewReport={() => persist({ ...session, report: { ...session.report, reviewed: true, updatedAt: new Date().toISOString() } })}
            onGenerateReport={() => {
              const draftNotes = generatedNotes || generateServiceNotes({
                customerName: selected?.customerName,
                address: selected?.address,
                complaint: selected?.complaint,
                equipmentLabel,
                measurements,
                session,
              });
              const report = generateServiceReport({
                customerName: selected?.customerName,
                address: selected?.address,
                contact: selected?.customerPhone,
                workOrder: selected?.id,
                complaint: selected?.complaint,
                equipmentLabel,
                notes: draftNotes,
                session,
              });
              setGeneratedNotes(draftNotes);
              setGeneratedReport(report);
              persist({
                ...session,
                notes: { text: draftNotes, accepted: session.notes.accepted, updatedAt: new Date().toISOString() },
                report: { text: report, reviewed: false, finalized: false, updatedAt: new Date().toISOString() },
              });
              setMoreView('report');
            }}
          />
        ) : null}

        <FieldTechBottomNav active={tab} onChange={(next) => changeTab(next)} />
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
