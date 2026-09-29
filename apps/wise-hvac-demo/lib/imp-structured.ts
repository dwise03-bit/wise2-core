import type { Measurement } from './measurements.ts';
import { displayValue, sourceLabel } from './measurements.ts';
import { GUIDED_TESTS, type GuidedTestDefinition } from './guided-tests.ts';

export type ImpConfidence = 'high' | 'moderate' | 'low';

export interface DiagnosticEvidence {
  label: string;
  detail: string;
  key?: string;
}

export interface ProbableCause {
  cause: string;
  likelihood: 'likely' | 'possible' | 'less_likely';
  why: string;
}

export interface NextBestTest {
  id: string;
  test: string;
  why: string;
  tools: string;
  placement: string;
  expected: string;
  safety: string;
}

export interface ImpDiagnosticResult {
  primaryFinding: string;
  confidence: ImpConfidence;
  supportingEvidence: DiagnosticEvidence[];
  contradictingEvidence: DiagnosticEvidence[];
  probableCauses: ProbableCause[];
  nextBestTest?: NextBestTest;
  recommendedAction?: string;
  insufficientData: boolean;
}

export interface StructuredDiagnosisInput {
  complaint?: string;
  symptoms?: string;
  measurements?: Measurement[];
  refrigerantKnown?: boolean;
}

function hasValue(measurement: Measurement | undefined): measurement is Measurement {
  return Boolean(measurement && measurement.value !== null && Number.isFinite(measurement.value));
}

function byKey(list: Measurement[] = []): Record<string, Measurement> {
  return Object.fromEntries(list.filter((item) => item?.key).map((item) => [item.key, item]));
}

function evidenceFrom(measurement: Measurement): DiagnosticEvidence {
  return {
    key: measurement.key,
    label: measurement.label,
    detail: `${displayValue(measurement)} ${measurement.unit} (${sourceLabel(measurement)})`.trim(),
  };
}

function toNextBest(def: GuidedTestDefinition): NextBestTest {
  return {
    id: def.id,
    test: def.test,
    why: def.why,
    tools: def.tools,
    placement: def.placement,
    expected: def.expected,
    safety: def.safety,
  };
}

function countMeasured(map: Record<string, Measurement>, keys: string[]): number {
  return keys.filter((key) => hasValue(map[key])).length;
}

export function confidenceFromCompleteness(opts: {
  measuredCount: number;
  contradicting: number;
  unstable: boolean;
}): ImpConfidence {
  if (opts.measuredCount === 0) return 'low';
  if (opts.unstable || opts.contradicting > 0) return opts.measuredCount >= 6 ? 'moderate' : 'low';
  if (opts.measuredCount >= 8) return 'high';
  if (opts.measuredCount >= 4) return 'moderate';
  return 'low';
}

export function selectNextBestTest(map: Record<string, Measurement>, complaint = '', symptoms = ''): NextBestTest {
  const text = `${complaint} ${symptoms}`.toLowerCase();
  const hasRefrigeration = countMeasured(map, ['suction_pressure', 'liquid_pressure', 'superheat', 'subcooling']) > 0;
  const hasTemps = countMeasured(map, ['return_db', 'supply_db', 'delta_t']) > 0;
  const hasStatic = countMeasured(map, ['return_static', 'supply_static', 'tesp']) > 0;
  const hasElectrical = countMeasured(map, ['line_voltage', 'amperage', 'capacitance', 'control_voltage']) > 0;
  const hasLineTemps = countMeasured(map, ['suction_line_temp', 'liquid_line_temp']) === 2;
  const hasPressures = countMeasured(map, ['suction_pressure', 'liquid_pressure']) === 2;

  if (/buzz|hum|won't start|not start|no start/.test(text) && !hasElectrical) {
    return toNextBest(GUIDED_TESTS.find((item) => item.id === 'capacitor')!);
  }
  if (hasPressures && !hasLineTemps) {
    return toNextBest(GUIDED_TESTS.find((item) => item.id === 'sh-sc')!);
  }
  if ((hasRefrigeration || hasTemps) && !hasStatic) {
    return toNextBest(GUIDED_TESTS.find((item) => item.id === 'tesp')!);
  }
  if (/thermostat|no call|not calling/.test(text) && !hasValue(map.control_voltage)) {
    return toNextBest(GUIDED_TESTS.find((item) => item.id === 'thermostat')!);
  }
  if (!hasRefrigeration && !hasTemps && !hasElectrical) {
    return toNextBest(GUIDED_TESTS.find((item) => item.id === 'sh-sc')!);
  }
  return toNextBest(GUIDED_TESTS.find((item) => item.id === 'tesp')!);
}

export function buildStructuredDiagnosis(input: StructuredDiagnosisInput): ImpDiagnosticResult {
  const map = byKey(input.measurements);
  const measured = Object.values(map).filter(hasValue);
  const complaint = `${input.complaint || ''} ${input.symptoms || ''}`.trim();
  const lower = complaint.toLowerCase();
  const unstable = measured.some((item) => item.status === 'unstable' || item.status === 'stale');
  const nextBestTest = selectNextBestTest(map, input.complaint, input.symptoms);

  if (measured.length === 0 && !complaint) {
    return {
      primaryFinding: 'INSUFFICIENT DATA',
      confidence: 'low',
      supportingEvidence: [],
      contradictingEvidence: [],
      probableCauses: [],
      nextBestTest,
      recommendedAction: 'Collect verified measurements before recommending a repair.',
      insufficientData: true,
    };
  }

  const supporting: DiagnosticEvidence[] = [];
  const contradicting: DiagnosticEvidence[] = [];
  const probableCauses: ProbableCause[] = [];

  const head = map.liquid_pressure;
  const suction = map.suction_pressure;
  const subcooling = map.subcooling;
  const superheat = map.superheat;
  const deltaT = map.delta_t;
  const tes = map.tesp;

  const saysHighHead = /high head|high discharge|high liquid/.test(lower);
  const saysLowSc = /low subcool/.test(lower);
  const saysNormalSh = /normal superheat/.test(lower);
  const saysFrostDrier = /frost|drier|dryer/.test(lower);
  const saysWeakAir = /airflow|weak air|filter|hot room/.test(lower);
  const saysNoStart = /buzz|hum|won't start|not start/.test(lower);

  if (hasValue(head)) supporting.push(evidenceFrom(head));
  if (hasValue(suction)) supporting.push(evidenceFrom(suction));
  if (hasValue(subcooling)) supporting.push(evidenceFrom(subcooling));
  if (hasValue(superheat)) supporting.push(evidenceFrom(superheat));
  if (hasValue(deltaT)) supporting.push(evidenceFrom(deltaT));
  if (hasValue(tes)) supporting.push(evidenceFrom(tes));

  if (saysHighHead && saysLowSc) {
    probableCauses.push({
      cause: 'Liquid-line restriction or dirty condenser',
      likelihood: 'likely',
      why: 'The technician reported high head pressure with low subcooling. That pattern needs airflow and drier-drop confirmation before a sealed-system repair.',
    });
  }
  if (saysFrostDrier) {
    probableCauses.push({
      cause: 'Restricted filter drier',
      likelihood: 'possible',
      why: 'Frost on the liquid line drier is an observation, not a completed test. Confirm temperature drop across the drier.',
    });
  }
  if (saysWeakAir || (hasValue(deltaT) && deltaT.value !== null && deltaT.value < 14)) {
    probableCauses.push({
      cause: 'Airflow restriction',
      likelihood: hasValue(tes) ? 'possible' : 'likely',
      why: 'Temperature split and comfort complaints can come from filter, coil, or duct restriction. Static pressure has not been treated as optional.',
    });
  }
  if (saysNoStart) {
    probableCauses.push({
      cause: 'Failed run capacitor or contactor under load',
      likelihood: 'likely',
      why: 'A no-start or buzz condition is electrical until capacitor, contactor, and voltage are proven.',
    });
  }

  if (saysLowSc && hasValue(subcooling) && subcooling.value !== null && subcooling.value >= 12) {
    contradicting.push({
      label: 'Subcooling vs restriction narrative',
      detail: `Reported low subcooling, but measured subcooling is ${displayValue(subcooling)} ${subcooling.unit}. That weakens a starved-condenser/restriction-only story.`,
      key: 'subcooling',
    });
  }
  if (saysHighHead && hasValue(head) && head.value !== null && head.value < 200) {
    contradicting.push({
      label: 'Head pressure vs “high head” narrative',
      detail: `Head pressure is recorded as ${displayValue(head)} ${head.unit}. Without outdoor ambient and OEM limits, this number is not automatically a high-head fault.`,
      key: 'liquid_pressure',
    });
  }
  if (saysNormalSh && hasValue(superheat) && superheat.value !== null && (superheat.value < 5 || superheat.value > 30)) {
    contradicting.push({
      label: 'Superheat vs “normal” narrative',
      detail: `Superheat is ${displayValue(superheat)} ${superheat.unit}. That may not match a “normal superheat” description for this system.`,
      key: 'superheat',
    });
  }

  if (!input.refrigerantKnown && (hasValue(map.suction_pressure) || hasValue(map.liquid_pressure))) {
    contradicting.push({
      label: 'Refrigerant not identified',
      detail: 'Saturation, superheat, and subcooling are calculated only after the technician records the refrigerant. They are not guessed from the model number.',
    });
  }

  const uniqueCauses = probableCauses.filter(
    (cause, index) => probableCauses.findIndex((item) => item.cause === cause.cause) === index,
  );

  const insufficientData = measured.length === 0;
  const primaryFinding = insufficientData
    ? 'INSUFFICIENT DATA'
    : uniqueCauses[0]?.cause || 'Measurements recorded — no single fault isolated';

  const confidence = confidenceFromCompleteness({
    measuredCount: measured.length,
    contradicting: contradicting.length,
    unstable,
  });

  return {
    primaryFinding,
    confidence,
    supportingEvidence: supporting,
    contradictingEvidence: contradicting,
    probableCauses: uniqueCauses,
    nextBestTest,
    recommendedAction: insufficientData
      ? 'Gather the next best test result and re-run IMP. Do not replace parts on narrative alone.'
      : 'Verify the next best test before any repair. Do not treat IMP output as work authorization.',
    insufficientData,
  };
}

export function structuredToApiFields(result: ImpDiagnosticResult) {
  const confidenceMap: Record<ImpConfidence, number> = { low: 42, moderate: 68, high: 86 };
  return {
    likelyCause: result.primaryFinding,
    confidence: result.insufficientData ? 45 : confidenceMap[result.confidence],
    reasoning: [
      result.recommendedAction,
      result.contradictingEvidence.length
        ? `Contradicting evidence: ${result.contradictingEvidence.map((item) => item.detail).join(' ')}`
        : '',
    ].filter(Boolean).join(' '),
    checks: [
      result.nextBestTest?.test,
      ...result.probableCauses.map((item) => `${item.cause}: ${item.why}`),
    ].filter((item): item is string => Boolean(item)),
    faultTitle: result.primaryFinding,
    rootCause: result.primaryFinding,
    evidence: result.supportingEvidence.map((item) => ({
      label: item.label,
      value: item.detail,
    })),
    primaryFinding: result.primaryFinding,
    confidenceBand: result.confidence,
    supportingEvidence: result.supportingEvidence,
    contradictingEvidence: result.contradictingEvidence,
    probableCauses: result.probableCauses,
    nextBestTest: result.nextBestTest,
    recommendedAction: result.recommendedAction,
    insufficientData: result.insufficientData,
  };
}
