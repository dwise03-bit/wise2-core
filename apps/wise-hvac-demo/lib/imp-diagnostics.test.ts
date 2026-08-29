import assert from 'node:assert/strict';
import test from 'node:test';
import {
  actionIconFromText,
  classifyConfidence,
  formatMetricValue,
  normalizeConfidence,
  parseMeasurementsFromText,
  parseMetricSeverity,
  resolveSystemId,
  toImpDiagnosticViewModel,
} from './imp-diagnostics.ts';

test('formatMetricValue never emits null, undefined, or NaN', () => {
  assert.equal(formatMetricValue(null), '—');
  assert.equal(formatMetricValue(undefined), '—');
  assert.equal(formatMetricValue(Number.NaN), '—');
  assert.equal(formatMetricValue('undefined'), '—');
  assert.equal(formatMetricValue(248.7), '248.7');
  assert.equal(formatMetricValue(17), '17');
});

test('normalizeConfidence accepts 0-1 and 0-100', () => {
  assert.equal(normalizeConfidence(0.92), 92);
  assert.equal(normalizeConfidence(92), 92);
  assert.equal(normalizeConfidence(Number.NaN), null);
  assert.equal(normalizeConfidence(150), null);
});

test('classifyConfidence uses specified bands', () => {
  assert.equal(classifyConfidence(0), 'LOW');
  assert.equal(classifyConfidence(49), 'LOW');
  assert.equal(classifyConfidence(50), 'MODERATE');
  assert.equal(classifyConfidence(74), 'MODERATE');
  assert.equal(classifyConfidence(75), 'HIGH');
  assert.equal(classifyConfidence(89), 'HIGH');
  assert.equal(classifyConfidence(90), 'VERY HIGH');
  assert.equal(classifyConfidence(100), 'VERY HIGH');
  assert.equal(classifyConfidence(null), null);
});

test('resolveSystemId prefers equipment identifiers', () => {
  assert.equal(resolveSystemId({ equipment: { serial: 'RTU-1A', model: '48TC' } }), 'RTU-1A');
  assert.equal(resolveSystemId({ equipment: { model: 'AHU-2' } }), 'AHU-2');
  assert.equal(resolveSystemId({}), '—');
});

test('parseMeasurementsFromText extracts HVAC instrument values', () => {
  const parsed = parseMeasurementsFromText(
    'HIGH HEAD PRESSURE 248.7 PSIG, low subcooling 8.6°F, normal superheat 11.2, airflow ΔT 17°F',
  );
  assert.equal(parsed.length, 4);
  assert.equal(parsed[0]?.value, '248.7');
  assert.equal(parsed[1]?.value, '8.6');
  assert.equal(parsed[2]?.value, '11.2');
  assert.equal(parsed[3]?.value, '17');
});

test('adapter maps API diagnosis without inventing values', () => {
  const model = toImpDiagnosticViewModel(
    {
      likelyCause: 'Restricted Liquid Line',
      confidence: 92,
      reasoning: 'Likely due to moisture or debris in filter drier.',
      checks: [
        'Recover refrigerant',
        'Replace filter drier',
        'Evacuate system to 500 microns',
        'Recharge by weight',
        'Verify system operation',
      ],
      parts: ['Filter drier'],
      safety: 'Recover before opening the sealed system.',
      customerSummary: 'A restriction is limiting refrigerant flow.',
    },
    { equipment: { serial: 'RTU-1A', manufacturer: 'Carrier', model: '48TC' } },
    {
      symptoms: 'HIGH HEAD PRESSURE 248.7 PSIG. Low subcooling 8.6°F. Normal superheat 11.2°F. Airflow ΔT 17°F.',
    },
  );

  assert.equal(model.systemId, 'RTU-1A');
  assert.equal(model.faultName, 'Restricted Liquid Line');
  assert.equal(model.heroTitle, 'CONFIRMED FAULT');
  assert.equal(model.confidence, 92);
  assert.equal(model.confidenceBand, 'VERY HIGH');
  assert.equal(model.recommendations.length, 5);
  assert.equal(model.recommendations[1]?.icon, 'filter');
  assert.equal(model.evidence[0]?.value, '248.7');
  assert.equal(model.evidence[0]?.severity, 'HIGH');
  assert.equal(model.evidence[1]?.severity, 'LOW');
});

test('missing diagnosis fails gracefully', () => {
  const model = toImpDiagnosticViewModel(null, null);
  assert.equal(model.hasDiagnosis, false);
  assert.equal(model.systemId, '—');
  assert.equal(model.confidenceLabel, '—');
  assert.equal(model.severity, 'INSUFFICIENT_DATA');
  assert.equal(model.evidence.length, 4);
  assert.ok(model.evidence.every((item) => item.value === '—'));
});

test('insufficient-data diagnoses do not use fault red copy', () => {
  const model = toImpDiagnosticViewModel({
    likelyCause: 'Insufficient measurements for a high-confidence diagnosis',
    confidence: 45,
    reasoning: 'Need more readings.',
    checks: ['Record temperature split'],
    parts: [],
    safety: 'Lockout/tagout',
    customerSummary: 'More measurements required.',
  });
  assert.equal(model.severity, 'INSUFFICIENT_DATA');
  assert.equal(model.heroTitle, 'INSUFFICIENT DATA');
  assert.equal(model.confidenceBand, 'LOW');
});

test('action and metric severity helpers stay explicit', () => {
  assert.equal(actionIconFromText('Recover refrigerant'), 'cylinder');
  assert.equal(actionIconFromText('Evacuate system to 500 microns'), 'vacuum');
  assert.equal(parseMetricSeverity('HIGH'), 'HIGH');
  assert.equal(parseMetricSeverity('chartreuse'), 'UNKNOWN');
});

test('evidence grid keeps four standard slots and appends extras', () => {
  const model = toImpDiagnosticViewModel({
    likelyCause: 'Restricted Liquid Line',
    confidence: 92,
    reasoning: 'Likely due to moisture or debris in filter drier.',
    checks: ['Recover refrigerant'],
    parts: [],
    safety: 'Recover first.',
    customerSummary: 'Restriction found.',
    evidence: [
      { label: 'HEAD PRESSURE', value: 248.7, unit: 'PSIG', severity: 'HIGH' },
      { label: 'SUBCOOLING', value: 8.6, unit: '°F', severity: 'LOW' },
      { label: 'SUPERHEAT', value: 11.2, unit: '°F', severity: 'NORMAL' },
      { label: 'AIRFLOW', value: 17, unit: '°F', severity: 'NORMAL' },
      { label: 'COMPRESSOR AMPS', value: 18.4, unit: 'A', severity: 'NORMAL' },
      { label: 'VOLTAGE L1', value: 239, unit: 'V', severity: 'NORMAL' },
      { label: 'VOLTAGE L2', value: 241, unit: 'V', severity: 'NORMAL' },
      { label: 'OUTDOOR DB', value: 94, unit: '°F', severity: 'WARNING' },
    ],
  });
  assert.equal(model.evidence.length, 8);
  assert.equal(model.evidence[0]?.severity, 'HIGH');
  assert.equal(model.normalEvidenceCount, 5);
});

test('three evidence values still render four cards with a graceful gap', () => {
  const model = toImpDiagnosticViewModel({
    likelyCause: 'Restricted Liquid Line',
    confidence: 80,
    reasoning: 'Need airflow confirmation.',
    checks: [],
    parts: [],
    safety: 'Lockout.',
    customerSummary: 'More data needed.',
    evidence: [
      { label: 'HEAD PRESSURE', value: 248.7, unit: 'PSIG', severity: 'HIGH' },
      { label: 'SUBCOOLING', value: 8.6, unit: '°F', severity: 'LOW' },
      { label: 'SUPERHEAT', value: 11.2, unit: '°F', severity: 'NORMAL' },
    ],
  });
  assert.equal(model.evidence.length, 4);
  assert.equal(model.evidence[3]?.value, '—');
  assert.equal(model.evidence[3]?.severity, 'UNKNOWN');
});
