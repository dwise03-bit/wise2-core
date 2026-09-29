import { NextRequest, NextResponse } from 'next/server';
import { getWise2AccessToken } from '@/lib/session';
import { getJobForSession } from '@/lib/field-jobs-server';
import type { Measurement } from '@/lib/measurements';
import {
  buildStructuredDiagnosis,
  structuredToApiFields,
} from '@/lib/imp-structured';

export const dynamic = 'force-dynamic';

type DiagnosticResult = {
  likelyCause: string;
  confidence: number;
  reasoning: string;
  checks: string[];
  parts: string[];
  safety: string;
  customerSummary: string;
};

let aiUnavailableUntil = 0;

function diagnose(symptoms: string, complaint: string): DiagnosticResult {
  const text = `${symptoms} ${complaint}`.toLowerCase();

  if (/buzz|hum|won't start|not start|fan.*not/.test(text)) {
    return {
      likelyCause: 'Failed run capacitor or contactor under load',
      confidence: 88,
      reasoning: 'A buzzing outdoor unit with a no-start or weak-start condition commonly points to the start circuit before a compressor failure.',
      checks: ['Lock out power and inspect capacitor for swelling', 'Measure capacitor µF against rating', 'Check contactor voltage drop and contact condition', 'Verify compressor and fan motor amp draw after repair'],
      parts: ['Matched dual-run capacitor', '2-pole definite-purpose contactor'],
      safety: 'Disconnect and verify power, then discharge the capacitor before handling terminals.',
      customerSummary: 'The outdoor unit is receiving a call for cooling but its starting components may not be delivering stable power. We will test those components before recommending a larger repair.',
    };
  }

  if (/airflow|weak air|uneven|hot room|filter|static/.test(text)) {
    return {
      likelyCause: 'Airflow restriction or distribution imbalance',
      confidence: 82,
      reasoning: 'Uneven room temperatures and weak airflow are more consistent with filter, blower, duct, or balancing issues than a refrigerant fault.',
      checks: ['Inspect filters, evaporator coil, and blower wheel', 'Record return and supply static pressure', 'Verify blower speed and motor current', 'Inspect dampers and branch duct leakage'],
      parts: ['Correctly sized filter', 'Blower belt or motor module if readings fail'],
      safety: 'Use fall protection for rooftop access and isolate blower power before opening panels.',
      customerSummary: 'The system appears to be producing conditioned air, but it may not be moving or distributing it correctly. We will measure airflow before replacing refrigeration components.',
    };
  }

  if (/ice|frozen|low suction|low refrigerant|not cooling/.test(text)) {
    return {
      likelyCause: 'Low airflow or refrigerant-side capacity loss',
      confidence: 74,
      reasoning: 'Poor cooling can come from airflow restriction, charge loss, or metering problems. Airflow must be proven before interpreting refrigerant pressures.',
      checks: ['Confirm clean filter and correct blower operation', 'Measure indoor wet bulb and outdoor dry bulb', 'Record superheat, subcooling, and temperature split', 'Leak-check if charge is outside manufacturer target'],
      parts: ['Filter or airflow correction first', 'Leak repair materials only after confirmed leak'],
      safety: 'Do not add refrigerant without confirming airflow and locating any leak required by applicable regulations.',
      customerSummary: 'Cooling capacity is reduced. We will first confirm airflow, then use temperature and refrigerant measurements to identify whether the issue is airflow or a sealed-system fault.',
    };
  }

  return {
    likelyCause: 'Insufficient measurements for a high-confidence diagnosis',
    confidence: 45,
    reasoning: 'The reported symptoms do not yet isolate an electrical, airflow, or refrigerant subsystem.',
    checks: ['Confirm thermostat call and fault codes', 'Record line and control voltage', 'Measure return/supply temperature split', 'Inspect filter, coil, blower, and outdoor unit condition'],
    parts: ['No parts recommended until measurements are recorded'],
    safety: 'Follow lockout/tagout and manufacturer service procedures before opening energized equipment.',
    customerSummary: 'We need a few system measurements before recommending a repair. This prevents unnecessary parts replacement and gives you a defensible diagnosis.',
  };
}

function isDiagnosticResult(value: unknown): value is DiagnosticResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return typeof result.likelyCause === 'string'
    && typeof result.confidence === 'number'
    && typeof result.reasoning === 'string'
    && Array.isArray(result.checks)
    && result.checks.every((item) => typeof item === 'string')
    && Array.isArray(result.parts)
    && result.parts.every((item) => typeof item === 'string')
    && typeof result.safety === 'string'
    && typeof result.customerSummary === 'string';
}

function sanitizeMeasurements(value: unknown): Measurement[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if (typeof row.key !== 'string' || typeof row.label !== 'string' || typeof row.unit !== 'string') return [];
    const numeric = typeof row.value === 'number' && Number.isFinite(row.value) ? row.value : null;
    return [{
      key: row.key,
      label: row.label,
      value: numeric,
      unit: row.unit,
      source: row.source === 'live_tool' || row.source === 'manual' || row.source === 'calculated' || row.source === 'imported'
        ? row.source
        : 'manual',
      status: row.status === 'valid' || row.status === 'stale' || row.status === 'unavailable' || row.status === 'unstable' || row.status === 'disconnected'
        ? row.status
        : numeric === null ? 'unavailable' : 'valid',
      timestamp: typeof row.timestamp === 'string' ? row.timestamp : null,
      deviceId: typeof row.deviceId === 'string' ? row.deviceId : undefined,
      simulated: row.simulated === true,
    }];
  });
}

async function diagnoseWithAi(
  symptoms: string,
  complaint: string,
  equipment: string,
  measurements: Measurement[],
): Promise<DiagnosticResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || Date.now() < aiUnavailableUntil) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6_000);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.WISE_HVAC_AI_MODEL || 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are an HVAC field diagnostic copilot. Never invent measurements, equipment data, or work-order facts. Never treat missing, stale, demo, or calculated values as live tool readings. If data is insufficient, say INSUFFICIENT DATA and recommend the next measurement. Separate supporting evidence from contradicting evidence. Return only JSON with keys likelyCause, confidence (0-100), reasoning, checks (string array), parts (string array), safety, customerSummary.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              equipment,
              complaint,
              observedSymptomsAndMeasurements: symptoms,
              verifiedMeasurements: measurements.filter((item) => item.value !== null),
            }),
          },
        ],
      }),
    });
    if (!response.ok) {
      aiUnavailableUntil = Date.now() + 5 * 60_000;
      return null;
    }
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    const result = JSON.parse(content) as unknown;
    return isDiagnosticResult(result) ? result : null;
  } catch {
    aiUnavailableUntil = Date.now() + 5 * 60_000;
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  if (process.env.WISE_HVAC_DEMO_MODE !== 'true') {
    const accessToken = await getWise2AccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = (await request.json()) as {
      jobId?: string;
      symptoms?: string;
      measurements?: unknown;
      refrigerant?: string;
      unstable?: boolean;
    };
    if (!jobIdOk(body.jobId) || !body.symptoms?.trim()) {
      return NextResponse.json({ error: 'Job and symptoms are required' }, { status: 400 });
    }
    if (body.symptoms.length > 3000) {
      return NextResponse.json({ error: 'Symptoms must be under 3,000 characters' }, { status: 400 });
    }
    const resolved = await getJobForSession(body.jobId!);
    if (resolved.error) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }
    const job = resolved.job;
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const measurements = sanitizeMeasurements(body.measurements);
    const structured = buildStructuredDiagnosis({
      complaint: job.complaint,
      symptoms: body.symptoms,
      measurements,
      refrigerantKnown: Boolean(body.refrigerant || job.equipment.refrigerant),
    });
    const structuredFields = structuredToApiFields(structured);

    const equipment = `${job.equipment.manufacturer} ${job.equipment.model}`.trim() || 'Equipment not identified';
    const aiResult = await diagnoseWithAi(body.symptoms, job.complaint, equipment, measurements);
    const fallback = diagnose(body.symptoms, job.complaint);
    const narrative = aiResult || (structured.insufficientData ? fallback : {
      ...fallback,
      likelyCause: structured.primaryFinding,
      confidence: structuredFields.confidence,
      reasoning: structured.recommendedAction || fallback.reasoning,
      checks: structuredFields.checks.length ? structuredFields.checks : fallback.checks,
    });

    return NextResponse.json({
      ...narrative,
      ...structuredFields,
      likelyCause: structured.insufficientData ? 'INSUFFICIENT DATA' : (aiResult?.likelyCause || structured.primaryFinding),
      generatedAt: new Date().toISOString(),
      equipment,
      aiProvider: aiResult ? 'openai' : 'verified-fallback',
      disclaimer: 'AI guidance supports—not replaces—licensed technician judgment and manufacturer procedures. Calculated and demo values are not live tool readings.',
      severity: structured.insufficientData ? 'INSUFFICIENT_DATA' : undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

function jobIdOk(jobId?: string) {
  return Boolean(jobId && jobId.trim());
}
