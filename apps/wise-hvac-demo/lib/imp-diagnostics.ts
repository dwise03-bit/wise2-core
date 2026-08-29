export type FaultSeverity =
  | 'NORMAL'
  | 'WARNING'
  | 'FAULT'
  | 'CRITICAL'
  | 'INSUFFICIENT_DATA';

export type MetricSeverity = 'NORMAL' | 'LOW' | 'HIGH' | 'WARNING' | 'UNKNOWN';

export type MetricIconKey =
  | 'gauge'
  | 'snowflake'
  | 'flame'
  | 'wind'
  | 'activity'
  | 'generic';

export type ActionIconKey =
  | 'cylinder'
  | 'filter'
  | 'vacuum'
  | 'scale'
  | 'shield'
  | 'wrench';

export type ConfidenceBand = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';

export type DiagnosticEvidenceInput = {
  label?: string;
  name?: string;
  value?: number | string | null;
  unit?: string;
  status?: string;
  severity?: string;
  icon?: string;
  expectedRange?: string;
  rawValue?: number | string | null;
};

export type DiagnosticApiResult = {
  likelyCause?: string;
  confidence?: number;
  reasoning?: string;
  checks?: string[];
  parts?: string[];
  safety?: string;
  customerSummary?: string;
  disclaimer?: string;
  generatedAt?: string;
  equipment?: string;
  aiProvider?: string;
  evidence?: DiagnosticEvidenceInput[];
  recommendations?: string[];
  severity?: string;
  faultTitle?: string;
  rootCause?: string;
  explanation?: string;
  primaryFinding?: string;
  confidenceBand?: 'high' | 'moderate' | 'low';
  supportingEvidence?: Array<{ label: string; detail: string; key?: string }>;
  contradictingEvidence?: Array<{ label: string; detail: string; key?: string }>;
  probableCauses?: Array<{ cause: string; likelihood: string; why: string }>;
  nextBestTest?: {
    id?: string;
    test: string;
    why: string;
    tools: string;
    placement: string;
    expected: string;
    safety?: string;
  };
  recommendedAction?: string;
  insufficientData?: boolean;
};

export type FieldEquipmentLike = {
  manufacturer?: string;
  model?: string;
  serial?: string;
  unitTag?: string;
  systemId?: string;
};

export type FieldJobLike = {
  id?: string;
  customerName?: string;
  complaint?: string;
  address?: string;
  equipment?: FieldEquipmentLike;
};

export type DiagnosticMetricCardModel = {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: MetricSeverity;
  icon: MetricIconKey;
  severity: MetricSeverity;
  expectedRange: string;
  rawValue: number | string | null;
};

export type RecommendedActionModel = {
  id: string;
  index: number;
  instruction: string;
  icon: ActionIconKey;
};

export type ImpDiagnosticViewModel = {
  systemId: string;
  equipmentLabel: string;
  severity: FaultSeverity;
  heroEyebrow: string;
  heroTitle: string;
  faultName: string;
  explanation: string;
  confidence: number | null;
  confidenceLabel: string;
  confidenceBand: ConfidenceBand | null;
  evidence: DiagnosticMetricCardModel[];
  normalEvidenceCount: number;
  recommendations: RecommendedActionModel[];
  parts: string[];
  safety: string;
  customerSummary: string;
  disclaimer: string;
  generatedAt: string;
  hasDiagnosis: boolean;
};

const MISSING = '—';
const NOT_AVAILABLE = 'Not available';

const STANDARD_METRICS: Array<{
  id: string;
  label: string;
  icon: MetricIconKey;
  unit: string;
  match: RegExp;
}> = [
  {
    id: 'head-pressure',
    label: 'HEAD PRESSURE',
    icon: 'gauge',
    unit: 'PSIG',
    match: /head|high[\s-]?side|discharge|psig|pressure/,
  },
  {
    id: 'subcooling',
    label: 'SUBCOOLING',
    icon: 'snowflake',
    unit: '°F',
    match: /subcool/,
  },
  {
    id: 'superheat',
    label: 'SUPERHEAT',
    icon: 'flame',
    unit: '°F',
    match: /superheat/,
  },
  {
    id: 'airflow',
    label: 'AIRFLOW',
    icon: 'wind',
    unit: '°F',
    match: /airflow|delta|split|supply|return/,
  },
];

export function formatMetricValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return MISSING;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return MISSING;
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  const trimmed = String(value).trim();
  if (!trimmed || /^nan$/i.test(trimmed) || trimmed === 'undefined' || trimmed === 'null') {
    return MISSING;
  }
  const numeric = Number(trimmed);
  if (trimmed !== '' && Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
  }
  return trimmed;
}

export function normalizeConfidence(raw: unknown): number | null {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
  if (raw >= 0 && raw <= 1) return Math.round(raw * 100);
  if (raw >= 0 && raw <= 100) return Math.round(raw);
  return null;
}

export function classifyConfidence(confidence: number | null): ConfidenceBand | null {
  if (confidence === null) return null;
  if (confidence < 50) return 'LOW';
  if (confidence < 75) return 'MODERATE';
  if (confidence < 90) return 'HIGH';
  return 'VERY HIGH';
}

export function resolveSystemId(job?: FieldJobLike | null): string {
  const equipment = job?.equipment;
  const candidates = [
    equipment?.systemId,
    equipment?.unitTag,
    equipment?.serial,
    equipment?.model,
  ];
  for (const candidate of candidates) {
    const value = String(candidate || '').trim();
    if (value) return value;
  }
  return MISSING;
}

function cleanText(value: unknown, fallback = MISSING): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function parseSeverity(value: unknown): FaultSeverity | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized === 'NORMAL' || normalized === 'OK' || normalized === 'HEALTHY') return 'NORMAL';
  if (normalized === 'WARNING' || normalized === 'ATTENTION') return 'WARNING';
  if (normalized === 'FAULT' || normalized === 'CONFIRMED_FAULT' || normalized === 'FAILED') return 'FAULT';
  if (normalized === 'CRITICAL' || normalized === 'DANGER') return 'CRITICAL';
  if (
    normalized === 'INSUFFICIENT_DATA'
    || normalized === 'UNKNOWN'
    || normalized === 'INCONCLUSIVE'
  ) {
    return 'INSUFFICIENT_DATA';
  }
  return null;
}

function inferFaultSeverity(result: DiagnosticApiResult, confidence: number | null): FaultSeverity {
  const explicit = parseSeverity(result.severity);
  if (explicit) return explicit;

  const blob = `${result.likelyCause || ''} ${result.faultTitle || ''} ${result.reasoning || ''}`.toLowerCase();
  if (/insufficient|inconclusive|not enough|cannot isolate|unknown/.test(blob) || (confidence !== null && confidence < 50)) {
    return 'INSUFFICIENT_DATA';
  }
  if (/normal operation|operating normally|no fault|within spec/.test(blob)) return 'NORMAL';
  if (/critical|unsafe|immediate|fire|shock|carbon monoxide/.test(blob)) return 'CRITICAL';
  if (/warning|monitor|attention|degraded/.test(blob) && (confidence === null || confidence < 75)) {
    return 'WARNING';
  }
  return 'FAULT';
}

function heroCopy(severity: FaultSeverity): { eyebrow: string; title: string } {
  switch (severity) {
    case 'NORMAL':
      return { eyebrow: 'SYSTEM STATUS', title: 'NORMAL OPERATION' };
    case 'WARNING':
      return { eyebrow: 'ATTENTION REQUIRED', title: 'WARNING' };
    case 'CRITICAL':
      return { eyebrow: 'ROOT CAUSE IDENTIFIED', title: 'CRITICAL FAULT' };
    case 'INSUFFICIENT_DATA':
      return { eyebrow: 'DIAGNOSTIC LIMIT', title: 'INSUFFICIENT DATA' };
    default:
      return { eyebrow: 'ROOT CAUSE IDENTIFIED', title: 'CONFIRMED FAULT' };
  }
}

export function parseMetricSeverity(value: unknown): MetricSeverity {
  if (typeof value !== 'string') return 'UNKNOWN';
  const normalized = value.trim().toUpperCase();
  if (normalized === 'NORMAL' || normalized === 'OK') return 'NORMAL';
  if (normalized === 'LOW') return 'LOW';
  if (normalized === 'HIGH') return 'HIGH';
  if (normalized === 'WARNING' || normalized === 'AMBER') return 'WARNING';
  return 'UNKNOWN';
}

function inferMetricSeverityFromLabel(label: string): MetricSeverity {
  const upper = label.toUpperCase();
  if (/\bHIGH\b/.test(upper)) return 'HIGH';
  if (/\bLOW\b/.test(upper)) return 'LOW';
  if (/\bWARNING\b/.test(upper)) return 'WARNING';
  if (/\bNORMAL\b/.test(upper)) return 'NORMAL';
  return 'UNKNOWN';
}

function metricIconFromText(text: string): MetricIconKey {
  const blob = text.toLowerCase();
  if (/pressure|head|psig|gauge/.test(blob)) return 'gauge';
  if (/subcool|liquid/.test(blob)) return 'snowflake';
  if (/superheat|suction|flame/.test(blob)) return 'flame';
  if (/airflow|delta|wind|cfm/.test(blob)) return 'wind';
  if (/amp|volt|hertz/.test(blob)) return 'activity';
  return 'generic';
}

export function actionIconFromText(text: string): ActionIconKey {
  const blob = text.toLowerCase();
  if (/recover|refrigerant|cylinder/.test(blob)) return 'cylinder';
  if (/filter|drier|dryer/.test(blob)) return 'filter';
  if (/evacuat|vacuum|micron/.test(blob)) return 'vacuum';
  if (/recharge|weigh|charge/.test(blob)) return 'scale';
  if (/verify|confirm|operation|inspect/.test(blob)) return 'shield';
  return 'wrench';
}

export function parseMeasurementsFromText(text: string): DiagnosticEvidenceInput[] {
  if (!text.trim()) return [];
  const found: DiagnosticEvidenceInput[] = [];

  const patterns: Array<{ label: string; unit: string; regex: RegExp; icon: MetricIconKey }> = [
    {
      label: 'HEAD PRESSURE',
      unit: 'PSIG',
      icon: 'gauge',
      regex: /(high|low|normal|warning)?\s*(?:head(?:\s+pressure)?|high[\s-]?side|discharge(?:\s+pressure)?)\s*[:=]?\s*(high|low|normal|warning)?\s*(-?\d+(?:\.\d+)?)\s*(psig|psi)?/i,
    },
    {
      label: 'SUBCOOLING',
      unit: '°F',
      icon: 'snowflake',
      regex: /(high|low|normal|warning)?\s*subcooling\s*[:=]?\s*(high|low|normal|warning)?\s*(-?\d+(?:\.\d+)?)\s*°?f?/i,
    },
    {
      label: 'SUPERHEAT',
      unit: '°F',
      icon: 'flame',
      regex: /(high|low|normal|warning)?\s*superheat\s*[:=]?\s*(high|low|normal|warning)?\s*(-?\d+(?:\.\d+)?)\s*°?f?/i,
    },
    {
      label: 'AIRFLOW',
      unit: '°F',
      icon: 'wind',
      regex: /(high|low|normal|warning)?\s*(?:airflow|delta\s*t|Δt|temp(?:erature)?\s*split)\s*[:=]?\s*(high|low|normal|warning)?\s*(?:Δt\s*)?(-?\d+(?:\.\d+)?)\s*°?f?/i,
    },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const statusWord = match[1] || match[2];
    const numeric = match[3];
    const unitToken = match[4];
    found.push({
      label: statusWord ? `${statusWord.toUpperCase()} ${pattern.label}` : pattern.label,
      value: numeric,
      unit: unitToken ? String(unitToken).toUpperCase() : pattern.unit,
      severity: statusWord,
      icon: pattern.icon,
      rawValue: numeric,
    });
  }

  return found;
}

function toMetricCard(input: DiagnosticEvidenceInput, index: number): DiagnosticMetricCardModel {
  const label = cleanText(input.label || input.name, `METRIC ${index + 1}`).toUpperCase();
  const explicitSeverity = parseMetricSeverity(input.severity || input.status);
  const severity = explicitSeverity === 'UNKNOWN' ? inferMetricSeverityFromLabel(label) : explicitSeverity;
  const raw = input.rawValue ?? input.value ?? null;
  const value = formatMetricValue(raw);
  const unit = cleanText(input.unit, '');
  return {
    id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
    label,
    value,
    unit,
    status: severity,
    icon: metricIconFromText(`${label} ${input.icon || ''}`),
    severity,
    expectedRange: cleanText(input.expectedRange, NOT_AVAILABLE),
    rawValue: raw,
  };
}

function mergeEvidence(
  apiEvidence: DiagnosticEvidenceInput[] | undefined,
  parsed: DiagnosticEvidenceInput[],
): DiagnosticMetricCardModel[] {
  const incoming = [...(apiEvidence || []), ...parsed]
    .filter((item) => item && (item.label || item.name || item.value !== undefined));

  if (incoming.length === 0) {
    return STANDARD_METRICS.map((metric, index) => ({
      id: metric.id,
      label: metric.label,
      value: MISSING,
      unit: metric.unit,
      status: 'UNKNOWN' as const,
      icon: metric.icon,
      severity: 'UNKNOWN' as const,
      expectedRange: NOT_AVAILABLE,
      rawValue: null,
    }));
  }

  const cards = incoming.map((item, index) => toMetricCard(item, index));
  const used = new Set<string>();
  const slotted: DiagnosticMetricCardModel[] = [];

  for (const standard of STANDARD_METRICS) {
    const match = cards.find((card) => !used.has(card.id) && standard.match.test(card.label.toLowerCase()));
    if (match) {
      used.add(match.id);
      const value =
        standard.id === 'airflow' && match.value !== '—' && !String(match.value).includes('Δ')
          ? `ΔT ${match.value}`
          : match.value;
      slotted.push({
        ...match,
        value,
        icon: standard.icon,
        unit: match.unit || standard.unit,
        label: match.label.includes(standard.label) ? match.label : standard.label,
      });
    } else {
      slotted.push({
        id: standard.id,
        label: standard.label,
        value: MISSING,
        unit: standard.unit,
        status: 'UNKNOWN',
        icon: standard.icon,
        severity: 'UNKNOWN',
        expectedRange: NOT_AVAILABLE,
        rawValue: null,
      });
    }
  }

  const extras = cards.filter((card) => !used.has(card.id));
  return [...slotted, ...extras];
}

export function toImpDiagnosticViewModel(
  result: DiagnosticApiResult | null | undefined,
  job?: FieldJobLike | null,
  extras?: { symptoms?: string },
): ImpDiagnosticViewModel {
  const hasDiagnosis = Boolean(result);
  const confidence = normalizeConfidence(result?.confidence);
  const severity = hasDiagnosis
    ? inferFaultSeverity(result || {}, confidence)
    : 'INSUFFICIENT_DATA';
  const hero = heroCopy(severity);
  const faultName = cleanText(
    result?.rootCause || result?.likelyCause,
    hasDiagnosis ? NOT_AVAILABLE : 'No diagnosis',
  );
  const explanation = cleanText(
    result?.explanation || result?.reasoning,
    hasDiagnosis ? NOT_AVAILABLE : 'Run an analysis to populate IMP diagnostic results.',
  );
  const parsed = parseMeasurementsFromText(
    `${extras?.symptoms || ''} ${result?.reasoning || ''} ${result?.likelyCause || ''}`,
  );
  const evidence = mergeEvidence(result?.evidence, parsed);
  const recommendationsSource = (result?.recommendations?.length ? result.recommendations : result?.checks) || [];
  const recommendations = recommendationsSource
    .map((instruction) => cleanText(instruction, ''))
    .filter(Boolean)
    .map((instruction, index) => ({
      id: `action-${index}`,
      index: index + 1,
      instruction,
      icon: actionIconFromText(instruction),
    }));

  const band = classifyConfidence(confidence);
  const equipmentLabel = cleanText(
    result?.equipment || [job?.equipment?.manufacturer, job?.equipment?.model].filter(Boolean).join(' '),
    NOT_AVAILABLE,
  );

  return {
    systemId: resolveSystemId(job),
    equipmentLabel,
    severity,
    heroEyebrow: hero.eyebrow,
    heroTitle: hero.title,
    faultName,
    explanation,
    confidence,
    confidenceLabel: confidence === null ? MISSING : `${confidence}%`,
    confidenceBand: band,
    evidence,
    normalEvidenceCount: evidence.filter((item) => item.severity === 'NORMAL').length,
    recommendations,
    parts: (result?.parts || []).map((item) => cleanText(item, '')).filter(Boolean),
    safety: cleanText(result?.safety, NOT_AVAILABLE),
    customerSummary: cleanText(result?.customerSummary, NOT_AVAILABLE),
    disclaimer: cleanText(
      result?.disclaimer,
      'AI guidance supports, not replaces, licensed technician judgment and manufacturer procedures.',
    ),
    generatedAt: cleanText(result?.generatedAt, ''),
    hasDiagnosis,
  };
}

export function formatShareText(model: ImpDiagnosticViewModel, job?: FieldJobLike | null): string {
  const lines = [
    `WISE² IMP Tech diagnostic report`,
    `System ID: ${model.systemId}`,
    job?.customerName ? `Customer: ${job.customerName}` : '',
    `Status: ${model.heroTitle}`,
    `Finding: ${model.faultName}`,
    `Confidence: ${model.confidenceLabel}${model.confidenceBand ? ` (${model.confidenceBand})` : ''}`,
    `Explanation: ${model.explanation}`,
    '',
    'Evidence:',
    ...model.evidence.map((item) => `- ${item.label}: ${item.value} ${item.unit} (${item.status})`.replace(/\s+/g, ' ').trim()),
    '',
    'Recommended action:',
    ...model.recommendations.map((item) => `${item.index}. ${item.instruction}`),
    '',
    model.disclaimer,
  ];
  return lines.filter((line) => line !== '').join('\n');
}

export function formatReportTitle(model: ImpDiagnosticViewModel): string {
  return `WISE² IMP diagnostic — ${model.systemId} — ${model.faultName}`;
}
