import { displayValue, sourceLabel, type Measurement } from './measurements.ts';
import type { FieldSessionState } from './field-session.ts';

export function generateServiceNotes(input: {
  customerName?: string;
  address?: string;
  complaint?: string;
  equipmentLabel?: string;
  measurements: Record<string, Measurement>;
  session: FieldSessionState;
}): string {
  const measured = Object.values(input.measurements).filter((item) => item.value !== null);
  const lines = [
    'REASON FOR VISIT',
    input.complaint?.trim() || 'Not recorded',
    '',
    'EQUIPMENT INSPECTED',
    input.equipmentLabel?.trim() || 'Not identified',
    input.address ? `Site: ${input.address}` : '',
    '',
    'MEASUREMENTS',
    measured.length
      ? measured.map((item) => `- ${item.label}: ${displayValue(item)} ${item.unit} (${sourceLabel(item)})`).join('\n')
      : 'Not measured',
    '',
    'DIAGNOSTIC FINDINGS',
    input.session.diagnosis?.primaryFinding || 'No IMP result saved',
    input.session.diagnosis?.recommendedAction || '',
    '',
    'TESTS PERFORMED',
    input.session.guidedTests.length
      ? input.session.guidedTests.map((test) => `- ${test.testId}: ${test.result || 'indeterminate'} — ${test.actual || 'no value'} ${test.notes}`).join('\n')
      : 'None recorded',
    '',
    'REPAIR PERFORMED',
    input.session.repair?.summary || 'None recorded',
    input.session.repair?.notes || '',
    '',
    'POST-REPAIR VERIFICATION',
    input.session.verification || 'Not verified',
    '',
    'RECOMMENDATIONS',
    input.session.diagnosis?.nextBestTest
      ? `Next test if still open: ${input.session.diagnosis.nextBestTest.test}`
      : 'None',
  ];
  return lines.filter((line) => line !== undefined).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function generateServiceReport(input: {
  customerName?: string;
  address?: string;
  contact?: string;
  workOrder?: string;
  complaint?: string;
  equipmentLabel?: string;
  notes: string;
  session: FieldSessionState;
  completedAt?: string;
}): string {
  return [
    'WISE² FIELD TECH — SERVICE REPORT',
    '',
    `Work order: ${input.workOrder || '—'}`,
    `Customer / site: ${input.customerName || '—'}`,
    input.address || '',
    input.contact || '',
    `Equipment: ${input.equipmentLabel || '—'}`,
    `Complaint: ${input.complaint || '—'}`,
    '',
    input.notes,
    '',
    `IMP findings: ${input.session.diagnosis?.primaryFinding || '—'}`,
    `Repair: ${input.session.repair?.summary || '—'}`,
    `Verification: ${input.session.verification || '—'}`,
    `Completion: ${input.completedAt || 'Draft — not complete'}`,
    '',
    'This report is not final until the technician reviews and completes the job.',
  ].filter((line) => line !== undefined).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export type ComparisonStatus = 'recorded' | 'unchanged' | 'changed';

export interface ComparisonRow {
  key: string;
  label: string;
  unit: string;
  testIn: string;
  testOut: string;
  change: string;
  status: ComparisonStatus;
}

export function buildTestComparison(
  testIn: Record<string, Measurement> | null,
  testOut: Record<string, Measurement> | null,
  keys: string[],
  labels: Record<string, { label: string; unit: string }>,
): ComparisonRow[] {
  return keys.map((key) => {
    const before = testIn?.[key];
    const after = testOut?.[key];
    const inValue = before?.value ?? null;
    const outValue = after?.value ?? null;
    let change = '—';
    let status: ComparisonStatus = 'recorded';
    if (inValue === null && outValue === null) {
      change = '—';
      status = 'unchanged';
    } else if (inValue === null || outValue === null) {
      change = '—';
      status = 'recorded';
    } else {
      const delta = Number((outValue - inValue).toFixed(2));
      change = `${delta > 0 ? '+' : ''}${delta}`;
      status = delta === 0 ? 'unchanged' : 'changed';
    }
    return {
      key,
      label: labels[key]?.label || key,
      unit: labels[key]?.unit || before?.unit || after?.unit || '',
      testIn: inValue === null ? 'Not measured' : displayValue(before),
      testOut: outValue === null ? 'Not measured' : displayValue(after),
      change,
      status,
    };
  });
}
