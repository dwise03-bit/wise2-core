'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { DiagnosticHeader } from './DiagnosticHeader';
import { ImpDiagnosticLoadingState, ImpDiagnosticResultsScreen } from './ImpDiagnosticResultsScreen';
import type { ImpDiagnosticViewModel, DiagnosticApiResult } from '@/lib/imp-diagnostics';
import type { FieldJob } from '@/lib/field-data';
import type { ImpView } from '@/lib/field-tech-nav';
import { GUIDED_TESTS, testsForCategory, type GuidedTestCategory, type GuidedTestRecord, type GuidedTestResult } from '@/lib/guided-tests';
import type { ImpDiagnosticResult } from '@/lib/imp-structured';
import type { Measurement } from '@/lib/measurements';
import { displayValue } from '@/lib/measurements';

export function ImpWorkspace({
  view,
  onView,
  selected,
  symptoms,
  setSymptoms,
  analyzing,
  error,
  systemId,
  diagnosis,
  viewModel,
  structured,
  measurements,
  guidedTests,
  stabilityReduced,
  onRun,
  onViewReport,
  onShareReport,
  shareLoading,
  onClear,
  onSaveTest,
  onStartGuided,
  onSaveFinding,
}: {
  view: ImpView;
  onView: (view: ImpView) => void;
  selected?: FieldJob;
  symptoms: string;
  setSymptoms: (value: string) => void;
  analyzing: boolean;
  error: string;
  systemId: string;
  diagnosis: DiagnosticApiResult | null;
  viewModel: ImpDiagnosticViewModel;
  structured: ImpDiagnosticResult | null;
  measurements: Record<string, Measurement>;
  guidedTests: GuidedTestRecord[];
  stabilityReduced: boolean;
  onRun: () => void;
  onViewReport: () => void;
  onShareReport: () => void;
  shareLoading: boolean;
  onClear: () => void;
  onSaveTest: (record: GuidedTestRecord) => void;
  onStartGuided: (id: string) => void;
  onSaveFinding: () => void;
}) {
  const next = structured?.nextBestTest || diagnosis?.nextBestTest;

  if (analyzing) return <ImpDiagnosticLoadingState systemId={systemId} />;

  return (
    <>
      {view === 'capture' && !diagnosis ? (
        <>
          <DiagnosticHeader systemId={systemId} title="IMP TECH" subtitle="FIELD COPILOT" />
          <div className="imp-scroll">
            <div className="imp-scroll-inner">
              <ImpSubnav view={view} onView={onView} />
              <section className="imp-panel imp-form">
                <h2>FIELD OBSERVATIONS</h2>
                <p className="imp-empty" style={{ textAlign: 'left', marginBottom: 10 }}>
                  {selected
                    ? `Describe verified readings and symptoms for ${selected.customerName}. IMP will not invent missing measurements.`
                    : 'No work order is assigned. IMP can still format the results screen once a job is available.'}
                </p>
                {stabilityReduced ? (
                  <div className="imp-alert">Readings are not stable. IMP may assist but confidence is reduced.</div>
                ) : null}
                <label htmlFor="symptoms" className="sr-only">Observed symptoms and measurements</label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  placeholder="Enter observed symptoms and verified measurements. Do not enter estimated values."
                />
                <MeasuredSummary measurements={measurements} />
                <button type="button" className="imp-primary" onClick={onRun} disabled={analyzing || !selected || !symptoms.trim()} aria-busy={analyzing}>
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {analyzing ? 'ANALYZING SYSTEM' : 'RUN IMP'}
                </button>
              </section>
              {error ? <div className="imp-alert" role="alert">{error}</div> : null}
            </div>
          </div>
        </>
      ) : null}

      {diagnosis && (view === 'capture' || view === 'results') ? (
        <ImpDiagnosticResultsScreen
          model={viewModel}
          onViewReport={onViewReport}
          onShareReport={onShareReport}
          shareLoading={shareLoading}
          onRunAgain={onClear}
        >
          <ImpSubnav view="results" onView={onView} />
          <StructuredBlocks structured={structured} diagnosis={diagnosis} />
        </ImpDiagnosticResultsScreen>
      ) : null}

      {view === 'next-test' ? (
        <>
          <DiagnosticHeader systemId={systemId} title="NEXT BEST TEST" subtitle="IMP TECH" />
          <div className="imp-scroll">
            <div className="imp-scroll-inner">
              <ImpSubnav view={view} onView={onView} />
              {next ? (
                <section className="imp-panel">
                  <h2>TEST</h2>
                  <p style={{ color: '#F4F7F8', fontWeight: 700 }}>{next.test}</p>
                  <h2>WHY</h2>
                  <p>{next.why}</p>
                  <h2>TOOLS</h2>
                  <p>{next.tools}</p>
                  <h2>PLACEMENT</h2>
                  <p>{next.placement}</p>
                  <h2>EXPECTED</h2>
                  <p>{next.expected}</p>
                  {next.safety ? (
                    <>
                      <h2>SAFETY</h2>
                      <p>{next.safety}</p>
                    </>
                  ) : null}
                  <p className="imp-empty" style={{ textAlign: 'left' }}>
                    Software does not replace trained judgment on hazardous electrical or mechanical systems.
                  </p>
                  <button type="button" className="imp-primary" onClick={() => onView('guided')}>GUIDE ME</button>
                  <button type="button" className="imp-ghost-btn" onClick={() => onStartGuided(next.id || 'tesp')}>START TEST</button>
                  <button type="button" className="imp-ghost-btn" onClick={onSaveFinding}>SAVE FINDING</button>
                </section>
              ) : (
                <section className="imp-panel"><p className="imp-empty">Run IMP to receive a next best test from actual evidence.</p></section>
              )}
            </div>
          </div>
        </>
      ) : null}

      {view === 'guided' ? (
        <GuidedTestsPanel
          systemId={systemId}
          measurements={measurements}
          records={guidedTests}
          onView={onView}
          onSave={onSaveTest}
        />
      ) : null}
    </>
  );
}

function ImpSubnav({ view, onView }: { view: ImpView; onView: (view: ImpView) => void }) {
  return (
    <div className="imp-subnav" data-cols="4">
      <button type="button" data-active={view === 'capture' || view === 'results'} onClick={() => onView('capture')}>IMP</button>
      <button type="button" data-active={view === 'next-test'} onClick={() => onView('next-test')}>NEXT TEST</button>
      <button type="button" data-active={view === 'guided'} onClick={() => onView('guided')}>GUIDED</button>
    </div>
  );
}

function MeasuredSummary({ measurements }: { measurements: Record<string, Measurement> }) {
  const rows = Object.values(measurements).filter((item) => item.value !== null);
  if (rows.length === 0) return <p className="imp-empty" style={{ textAlign: 'left' }}>No verified measurements in this session. Missing values stay as — / Not measured.</p>;
  return (
    <p style={{ fontSize: 12, color: '#98A2AC' }}>
      Session measurements: {rows.map((item) => `${item.label} ${displayValue(item)} ${item.unit}`).join(' · ')}
    </p>
  );
}

function StructuredBlocks({
  structured,
  diagnosis,
}: {
  structured: ImpDiagnosticResult | null;
  diagnosis: DiagnosticApiResult;
}) {
  const finding = structured?.primaryFinding || diagnosis.primaryFinding || diagnosis.likelyCause || '—';
  const confidence = structured?.confidence || diagnosis.confidenceBand;
  const supporting = structured?.supportingEvidence || diagnosis.supportingEvidence || [];
  const contradicting = structured?.contradictingEvidence || diagnosis.contradictingEvidence || [];
  const causes = structured?.probableCauses || diagnosis.probableCauses || [];
  return (
    <>
      <section className="imp-panel">
        <h2>PRIMARY FINDING</h2>
        <p style={{ color: '#F4F7F8', fontWeight: 700 }}>{finding}</p>
        <h2>CONFIDENCE</h2>
        <p>{confidence ? String(confidence).toUpperCase() : '—'}</p>
        <p className="imp-empty" style={{ textAlign: 'left' }}>
          No system-health percentage is shown. Completeness of evidence drives the confidence band.
        </p>
      </section>
      <section className="imp-panel">
        <h2>SUPPORTING EVIDENCE</h2>
        {supporting.length === 0 ? <p className="imp-empty">No supporting measurements recorded.</p> : supporting.map((item) => (
          <p key={`${item.label}-${item.detail}`} style={{ fontSize: 13 }}>{item.label}: {item.detail}</p>
        ))}
        <h2>CONTRADICTING EVIDENCE</h2>
        {contradicting.length === 0 ? <p className="imp-empty">No contradicting evidence recorded.</p> : contradicting.map((item) => (
          <p key={`${item.label}-${item.detail}`} style={{ fontSize: 13, color: '#FFB547' }}>{item.label}: {item.detail}</p>
        ))}
      </section>
      <section className="imp-panel">
        <h2>PROBABLE CAUSES</h2>
        {causes.length === 0 ? <p className="imp-empty">None ranked — insufficient isolation.</p> : causes.map((item) => (
          <p key={item.cause} style={{ fontSize: 13 }}>
            <strong style={{ color: '#F4F7F8' }}>{item.likelihood.toUpperCase()}</strong> · {item.cause}. {item.why}
          </p>
        ))}
        <h2>RECOMMENDED ACTION</h2>
        <p>{structured?.recommendedAction || diagnosis.recommendedAction || '—'}</p>
      </section>
    </>
  );
}

function GuidedTestsPanel({
  systemId,
  measurements,
  records,
  onView,
  onSave,
}: {
  systemId: string;
  measurements: Record<string, Measurement>;
  records: GuidedTestRecord[];
  onView: (view: ImpView) => void;
  onSave: (record: GuidedTestRecord) => void;
}) {
  const [category, setCategory] = useState<GuidedTestCategory>('airflow');
  const [activeId, setActiveId] = useState('tesp');
  const [actual, setActual] = useState('');
  const [result, setResult] = useState<GuidedTestResult | ''>('');
  const [notes, setNotes] = useState('');
  const active = GUIDED_TESTS.find((item) => item.id === activeId) || GUIDED_TESTS[0];
  const liveBits = active.measurementKeys.map((key) => measurements[key]).filter((item) => item?.value != null);

  return (
    <>
      <DiagnosticHeader systemId={systemId} title="GUIDED TESTS" subtitle="IMP TECH" />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <ImpSubnav view="guided" onView={onView} />
          <div className="imp-subnav" data-cols="4">
            {(['refrigeration', 'airflow', 'electrical', 'controls'] as const).map((item) => (
              <button key={item} type="button" data-active={category === item} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          {testsForCategory(category).map((test) => (
            <button key={test.id} type="button" className="imp-job-btn" data-active={activeId === test.id} onClick={() => setActiveId(test.id)}>
              <strong>{test.name}</strong>
            </button>
          ))}
          <section className="imp-panel">
            <h2>{active.name.toUpperCase()}</h2>
            <p>{active.test}</p>
            <p style={{ color: '#98A2AC', fontSize: 13 }}>{active.why}</p>
            <p style={{ fontSize: 13 }}>Tools: {active.tools}</p>
            <p style={{ fontSize: 13 }}>Placement: {active.placement}</p>
            <p style={{ fontSize: 13 }}>Expected: {active.expected}</p>
            <p style={{ fontSize: 13, color: '#FFB547' }}>{active.safety}</p>
            {liveBits.length ? (
              <p style={{ fontSize: 12, color: '#66FF78' }}>
                Session values: {liveBits.map((item) => `${item.label} ${displayValue(item)} ${item.unit}`).join(' · ')}
              </p>
            ) : (
              <p className="imp-empty" style={{ textAlign: 'left' }}>No session value for this test yet. Enter the actual measurement below.</p>
            )}
            <input className="wise-input" value={actual} onChange={(event) => setActual(event.target.value)} placeholder="Actual measurement" />
            <select className="wise-input" value={result} onChange={(event) => setResult(event.target.value as GuidedTestResult | '')}>
              <option value="">Result not set</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="indeterminate">Indeterminate</option>
            </select>
            <textarea className="wise-input" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Technician notes" />
            <button
              type="button"
              className="imp-primary"
              onClick={() => onSave({
                testId: active.id,
                actual,
                result,
                notes,
                savedAt: new Date().toISOString(),
              })}
            >
              SAVE FINDING TO IMP
            </button>
          </section>
          {records.length ? (
            <section className="imp-panel">
              <h2>SAVED TESTS</h2>
              {records.map((item) => (
                <p key={`${item.testId}-${item.savedAt}`} style={{ fontSize: 12, color: '#98A2AC' }}>
                  {item.testId}: {item.result || 'indeterminate'} · {item.actual || 'no value'}
                </p>
              ))}
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
