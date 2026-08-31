import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getFieldJob } from '@/lib/field-data';

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

async function diagnoseWithAi(symptoms: string, complaint: string, equipment: string): Promise<DiagnosticResult | null> {
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
            content: 'You are an HVAC field diagnostic copilot. Never invent measurements. Separate likely causes from verified facts. Prioritize electrical safety, lockout/tagout, airflow verification before refrigerant conclusions, and manufacturer procedures. Return JSON with keys likelyCause, confidence (0-100), reasoning, checks (string array), parts (string array), safety, customerSummary. Optional keys: severity (NORMAL|WARNING|FAULT|CRITICAL|INSUFFICIENT_DATA), evidence (array of {label, value, unit, severity: NORMAL|LOW|HIGH|WARNING|UNKNOWN}). Only include evidence values that appear in the technician input.',
          },
          { role: 'user', content: JSON.stringify({ equipment, complaint, observedSymptomsAndMeasurements: symptoms }) },
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
  if (process.env.WISE_HVAC_DEMO_MODE === 'false') {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jobId, symptoms } = (await request.json()) as { jobId?: string; symptoms?: string };
    if (!jobId || !symptoms?.trim()) {
      return NextResponse.json({ error: 'Job and symptoms are required' }, { status: 400 });
    }
    if (symptoms.length > 3000) {
      return NextResponse.json({ error: 'Symptoms must be under 3,000 characters' }, { status: 400 });
    }
    const job = getFieldJob(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const equipment = `${job.equipment.manufacturer} ${job.equipment.model}`;
    const aiResult = await diagnoseWithAi(symptoms, job.complaint, equipment);
    return NextResponse.json({
      ...(aiResult || diagnose(symptoms, job.complaint)),
      generatedAt: new Date().toISOString(),
      equipment,
      aiProvider: aiResult ? 'openai' : 'verified-fallback',
      disclaimer: 'AI guidance supports—not replaces—licensed technician judgment and manufacturer procedures.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
