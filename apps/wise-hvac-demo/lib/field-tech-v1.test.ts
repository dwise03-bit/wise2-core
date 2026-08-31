import assert from 'node:assert/strict';
import test from 'node:test';
import { hashForTab, tabFromHash } from './field-tech-nav.ts';
import { deriveMeasurements, emptyMeasurement, sourceLabel } from './measurements.ts';
import { saturationTempF, subcoolingF, superheatF } from './refrigerant-pt.ts';
import { assessStability } from './stability.ts';
import { buildStructuredDiagnosis, confidenceFromCompleteness, selectNextBestTest } from './imp-structured.ts';
import { buildTestComparison, generateServiceNotes } from './service-notes.ts';
import { emptySession } from './field-session.ts';

test('primary nav hashes land on TODAY by default', () => {
  assert.equal(tabFromHash(''), 'dashboard');
  assert.equal(tabFromHash('#today'), 'dashboard');
  assert.equal(tabFromHash('#work-order'), 'jobs');
  assert.equal(tabFromHash('#instruments'), 'tools');
  assert.equal(tabFromHash('#diagnostics'), 'imp');
  assert.equal(hashForTab('dashboard'), 'today');
});

test('P-T helper does not invent saturation outside the table or without refrigerant', () => {
  assert.equal(saturationTempF(undefined, 118), null);
  assert.equal(saturationTempF('R-410A', 10), null);
  assert.equal(typeof saturationTempF('R-410A', 118), 'number');
  assert.equal(superheatF('R-410A', 118, 52), Number((52 - saturationTempF('R-410A', 118)!).toFixed(1)));
  assert.equal(subcoolingF('unknown', 300, 90), null);
});

test('derived superheat is calculated and never presented as a live tool', () => {
  const raw = {
    suction_pressure: { ...emptyMeasurement('suction_pressure'), value: 118, source: 'manual' as const, status: 'valid' as const, timestamp: '2026-08-29T12:00:00.000Z' },
    suction_line_temp: { ...emptyMeasurement('suction_line_temp'), value: 52, source: 'manual' as const, status: 'valid' as const, timestamp: '2026-08-29T12:00:00.000Z' },
  };
  const derived = deriveMeasurements(raw, 'R-410A');
  assert.equal(derived.superheat.source, 'calculated');
  assert.equal(sourceLabel(derived.superheat), 'CALCULATED');
  assert.notEqual(derived.superheat.value, null);
});

test('delta-T and TESP stay unavailable without both inputs', () => {
  const derived = deriveMeasurements({
    return_db: { ...emptyMeasurement('return_db'), value: 75, source: 'manual', status: 'valid', timestamp: null },
  }, 'R-410A');
  assert.equal(derived.delta_t.value, null);
  assert.equal(derived.tesp.value, null);
});

test('stability engine uses the time series instead of a spinner', () => {
  const waiting = assessStability([], [], Date.now(), false);
  assert.equal(waiting.state, 'WAITING');

  const now = Date.parse('2026-08-29T12:01:00.000Z');
  const unstable = assessStability(
    [
      { key: 'suction_pressure', value: 110, at: now - 50_000 },
      { key: 'suction_pressure', value: 118, at: now - 20_000 },
      { key: 'suction_pressure', value: 128, at: now - 1_000 },
    ],
    ['suction_pressure'],
    now,
    true,
  );
  assert.equal(unstable.state, 'UNSTABLE');
  assert.match(unstable.reason, /suction pressure changed 18/);

  const lost = assessStability(
    [{ key: 'suction_pressure', value: 118, at: now - 20_000 }],
    ['suction_pressure'],
    now,
    true,
  );
  assert.equal(lost.state, 'LOST_SIGNAL');
});

test('IMP does not invent readings and keeps contradictory evidence', () => {
  const empty = buildStructuredDiagnosis({ complaint: '', measurements: [] });
  assert.equal(empty.primaryFinding, 'INSUFFICIENT DATA');
  assert.equal(empty.insufficientData, true);
  assert.equal(empty.supportingEvidence.length, 0);

  const result = buildStructuredDiagnosis({
    complaint: 'HIGH HEAD PRESSURE, low subcooling, frost on drier',
    refrigerantKnown: true,
    measurements: [
      { key: 'liquid_pressure', label: 'Liquid pressure', value: 248.7, unit: 'PSIG', source: 'manual', status: 'valid', timestamp: null },
      { key: 'subcooling', label: 'Subcooling', value: 14, unit: '°F', source: 'calculated', status: 'valid', timestamp: null },
    ],
  });
  assert.ok(result.contradictingEvidence.some((item) => /subcooling/i.test(item.detail)));
  assert.ok(result.nextBestTest?.test.includes('Total External Static'));
});

test('next best test asks for TESP when refrigeration exists without static', () => {
  const nbt = selectNextBestTest({
    liquid_pressure: { ...emptyMeasurement('liquid_pressure'), value: 250, source: 'manual', status: 'valid', timestamp: null },
  });
  assert.equal(nbt.id, 'tesp');
});

test('confidence drops with incomplete or contradictory data', () => {
  assert.equal(confidenceFromCompleteness({ measuredCount: 0, contradicting: 0, unstable: false }), 'low');
  assert.equal(confidenceFromCompleteness({ measuredCount: 8, contradicting: 0, unstable: false }), 'high');
  assert.equal(confidenceFromCompleteness({ measuredCount: 8, contradicting: 1, unstable: false }), 'moderate');
});

test('test-in/out comparison never labels a numeric change as verified', () => {
  const rows = buildTestComparison(
    { superheat: { ...emptyMeasurement('superheat'), value: 30, source: 'calculated', status: 'valid', timestamp: null } },
    { superheat: { ...emptyMeasurement('superheat'), value: 12, source: 'calculated', status: 'valid', timestamp: null } },
    ['superheat'],
    { superheat: { label: 'Superheat', unit: '°F' } },
  );
  assert.equal(rows[0].change, '-18');
  assert.equal(rows[0].status, 'changed');
});

test('generated notes stay drafts until accepted', () => {
  const text = generateServiceNotes({
    complaint: 'Not cooling',
    equipmentLabel: 'Carrier 48TC',
    measurements: {},
    session: emptySession('job-1'),
  });
  assert.match(text, /Not cooling/);
  assert.match(text, /Not measured/);
});
