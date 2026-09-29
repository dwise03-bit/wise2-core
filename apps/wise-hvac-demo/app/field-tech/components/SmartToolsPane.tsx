'use client';

import { useMemo, useState } from 'react';
import { Bluetooth, Radio, Wifi } from 'lucide-react';
import { FieldHeader } from './FieldChrome';
import {
  MEASUREMENT_CATALOG,
  TOOL_ROLES,
  TREND_RANGES,
  TREND_SERIES,
  displayValue,
  samplesForRange,
  sourceLabel,
  type Measurement,
  type MeasurementSample,
  type ToolCard,
} from '@/lib/measurements';
import type { ToolsView } from '@/lib/field-tech-nav';
import type { StabilityResult } from '@/lib/stability';

const SERIES_COLORS: Record<string, string> = {
  suction_pressure: '#4995ff',
  liquid_pressure: '#ff564c',
  suction_line_temp: '#66ff78',
  liquid_line_temp: '#ffb547',
  superheat: '#7cff87',
  subcooling: '#98a2ac',
  delta_t: '#f4f7f8',
  tesp: '#4995ff',
  amperage: '#ffb547',
};

export function SmartToolsPane({
  view,
  onView,
  tools,
  measurements,
  history,
  stability,
  streaming,
  scanMessage,
  onScan,
  onConnectKit,
  onDisconnect,
  onManual,
}: {
  view: ToolsView;
  onView: (view: ToolsView) => void;
  tools: ToolCard[];
  measurements: Record<string, Measurement>;
  history: MeasurementSample[];
  stability: StabilityResult;
  streaming: boolean;
  scanMessage: string;
  onScan: () => void;
  onConnectKit: () => void;
  onDisconnect: () => void;
  onManual: (key: string, value: number) => void;
}) {
  const [manualKey, setManualKey] = useState('return_db');
  const [manualValue, setManualValue] = useState('');
  const [rangeId, setRangeId] = useState('5m');
  const [enabled, setEnabled] = useState<string[]>(['suction_pressure', 'liquid_pressure', 'superheat', 'subcooling']);
  const range = TREND_RANGES.find((item) => item.id === rangeId) || TREND_RANGES[1];
  const groups = useMemo(() => ({
    refrigeration: MEASUREMENT_CATALOG.filter((item) => item.group === 'refrigeration'),
    air: MEASUREMENT_CATALOG.filter((item) => item.group === 'air'),
    airflow: MEASUREMENT_CATALOG.filter((item) => item.group === 'airflow'),
    electrical: MEASUREMENT_CATALOG.filter((item) => item.group === 'electrical'),
  }), []);

  return (
    <>
      <FieldHeader title="TOOLS" subtitle="SMART TOOLS" badgeLabel="BRIDGE" badgeValue={streaming ? 'DEMO' : 'OFF'} />
      <div className="imp-scroll">
        <div className="imp-scroll-inner" id="instruments">
          <div className="imp-subnav">
            <button type="button" data-active={view === 'discover'} onClick={() => onView('discover')}>DISCOVER</button>
            <button type="button" data-active={view === 'live'} onClick={() => onView('live')}>LIVE</button>
            <button type="button" data-active={view === 'trends'} onClick={() => onView('trends')}>TRENDS</button>
          </div>
          <p className="imp-chip" data-warn={stability.state !== 'STABLE'} data-ok={stability.state === 'STABLE'} data-bad={stability.state === 'UNSTABLE' || stability.state === 'LOST_SIGNAL'}>
            {stability.reason}
          </p>

          {view === 'discover' ? (
            <>
              <section className="imp-panel">
                <h2>FIELDPIECE / WISE² SMART TOOLS</h2>
                <p className="imp-empty" style={{ textAlign: 'left' }}>
                  This web client does not include a Fieldpiece SDK. Bluetooth capture runs in the native Field Tech app.
                  The optional demo stream only previews gauge layout and is never labeled LIVE TOOL.
                </p>
                {scanMessage ? <div className="imp-alert">{scanMessage}</div> : null}
                <div style={{ display: 'grid', gap: 8 }}>
                  <button type="button" className="imp-primary" onClick={onScan}><Radio className="h-4 w-4" />SCAN FOR TOOLS</button>
                  <button type="button" className="imp-ghost-btn" onClick={onConnectKit}><Wifi className="h-4 w-4" />{streaming ? 'STOP DEMO STREAM' : 'CONNECT TEST KIT'}</button>
                  <button type="button" className="imp-ghost-btn" onClick={onDisconnect} disabled={!streaming}>DISCONNECT</button>
                  <a className="imp-ghost-btn" href={`${process.env.NEXT_PUBLIC_BASE_PATH || '/wise-hvac-demo'}/download`}>
                    <Bluetooth className="h-4 w-4" />OPEN FIELD APP
                  </a>
                </div>
              </section>
              {tools.map((tool) => (
                <article key={tool.id} className="imp-tool-card">
                  <small>{tool.type.toUpperCase()}</small>
                  <strong>{tool.deviceName}</strong>
                  <p style={{ margin: '4px 0', color: '#98A2AC', fontSize: 12 }}>{tool.assignedRole}</p>
                  <p style={{ fontSize: 12, color: '#98A2AC' }}>
                    {tool.connection.replace('_', ' ')} · signal {tool.signalQuality} · battery {tool.battery === null ? '—' : `${tool.battery}%`}
                  </p>
                  <p style={{ fontSize: 22, margin: '8px 0 0', color: '#F4F7F8' }}>
                    {tool.liveValue === null ? '—' : tool.liveValue.toFixed(1)} <span style={{ fontSize: 12, color: '#66717A' }}>{tool.unit}</span>
                  </p>
                  <span className="imp-source">{tool.lastUpdate ? new Date(tool.lastUpdate).toLocaleTimeString() : 'Waiting for sensor'}</span>
                </article>
              ))}
              <section className="imp-panel">
                <h2>MANUAL ENTRY</h2>
                <p className="imp-empty" style={{ textAlign: 'left' }}>Manual values are stored as MANUAL, never as live tool readings.</p>
                <select className="wise-input" value={manualKey} onChange={(event) => setManualKey(event.target.value)}>
                  {MEASUREMENT_CATALOG.filter((item) => !['suction_sat', 'liquid_sat', 'superheat', 'subcooling', 'delta_t', 'tesp'].includes(item.key)).map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
                <input className="wise-input" inputMode="decimal" value={manualValue} onChange={(event) => setManualValue(event.target.value)} placeholder="Verified reading" />
                <button
                  type="button"
                  className="imp-primary"
                  onClick={() => {
                    const numeric = Number(manualValue);
                    if (!Number.isFinite(numeric)) return;
                    onManual(manualKey, numeric);
                    setManualValue('');
                  }}
                >
                  SAVE MANUAL READING
                </button>
              </section>
            </>
          ) : null}

          {view === 'live' ? (
            <>
              {(['refrigeration', 'air', 'airflow', 'electrical'] as const).map((group) => (
                <section key={group} className="imp-panel">
                  <h2>{group.toUpperCase()}</h2>
                  <div className="imp-evidence-grid">
                    {groups[group].map((item) => {
                      const reading = measurements[item.key];
                      return (
                        <article key={item.key} className="imp-measure-card">
                          <small>{item.label.toUpperCase()}</small>
                          <strong>{displayValue(reading)}</strong>
                          <span className="imp-source">{reading ? `${sourceLabel(reading)} · ${item.unit}` : 'Not measured'}</span>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </>
          ) : null}

          {view === 'trends' ? (
            <section className="imp-panel">
              <h2>LIVE TRENDS</h2>
              <div className="imp-subnav" data-cols="4">
                {TREND_RANGES.map((item) => (
                  <button key={item.id} type="button" data-active={rangeId === item.id} onClick={() => setRangeId(item.id)}>{item.label}</button>
                ))}
              </div>
              <TrendSvg history={history} enabled={enabled} rangeMs={range.ms} measurements={measurements} />
              <div className="imp-legend">
                {TREND_SERIES.map((key) => {
                  const meta = MEASUREMENT_CATALOG.find((item) => item.key === key);
                  const reading = measurements[key];
                  const on = enabled.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      data-on={on}
                      onClick={() => setEnabled((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))}
                    >
                      {meta?.label} {displayValue(reading)} {meta?.unit}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}

function TrendSvg({
  history,
  enabled,
  rangeMs,
  measurements,
}: {
  history: MeasurementSample[];
  enabled: string[];
  rangeMs: number | null;
  measurements: Record<string, Measurement>;
}) {
  const now = Date.now();
  const width = 320;
  const height = 92;
  if (enabled.length === 0) {
    return <p className="imp-empty">Select at least one series.</p>;
  }
  return (
    <svg className="imp-trend" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Measurement trends">
      {enabled.map((key) => {
        const samples = samplesForRange(history, key, rangeMs, now);
        if (samples.length < 2) return null;
        const values = samples.map((sample) => sample.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const span = max - min || 1;
        const start = samples[0].at;
        const end = samples[samples.length - 1].at;
        const timeSpan = Math.max(end - start, 1);
        const d = samples.map((sample, index) => {
          const x = ((sample.at - start) / timeSpan) * (width - 8) + 4;
          const y = height - 8 - ((sample.value - min) / span) * (height - 16);
          return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
        return <path key={key} d={d} fill="none" stroke={SERIES_COLORS[key] || '#4995ff'} strokeWidth="1.6" />;
      })}
      {enabled.every((key) => samplesForRange(history, key, rangeMs, now).length < 2) ? (
        <text x="12" y="48" fill="#66717A" fontSize="12">Not enough samples for a trend.</text>
      ) : null}
      {Object.keys(measurements).length === 0 ? null : null}
    </svg>
  );
}
