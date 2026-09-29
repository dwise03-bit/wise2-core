'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, Input } from '../../../../src/components/ui';

interface Profile {
  id: string;
  name: string;
  summary: string;
}

interface FieldRow {
  envVariable: string;
  name: string;
  serviceId: string;
  serviceName: string;
  required: boolean;
  status: 'missing' | 'configured' | 'skipped';
  masked?: string;
}

interface NextPrompt {
  done: boolean;
  remainingRequired: number;
  remainingOptional: number;
  required?: boolean;
  serviceName?: string;
  field?: {
    envVariable: string;
    name: string;
    docsUrl: string;
    clientSteps: string[];
  };
}

interface KeysPayload {
  client?: string;
  profile?: string;
  vaultPath?: string;
  requiredTotal?: number;
  requiredConfigured?: number;
  optionalTotal?: number;
  optionalConfigured?: number;
  skipped?: number;
  complete?: boolean;
  fields?: FieldRow[];
  next?: NextPrompt;
  error?: string;
  profiles?: Profile[];
}

const DEFAULT_PROFILES: Profile[] = [
  { id: 'core', name: 'Core business', summary: 'Payments, Google login, Discord, and email.' },
  { id: 'phone', name: 'Phone + AI', summary: 'Core keys plus Twilio and OpenAI.' },
  { id: 'field-service', name: 'Field service', summary: 'Phone plus Jobber.' },
  { id: 'hvac', name: 'HVAC / Get Down', summary: 'Same as field service.' },
  { id: 'studio', name: 'Studio / live', summary: 'YouTube, Twitch, and music keys.' },
  { id: 'full', name: 'Full stack', summary: 'Every client-facing integration.' },
];

export default function ApiKeysPage() {
  const [client, setClient] = useState('default');
  const [profile, setProfile] = useState('core');
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [payload, setPayload] = useState<KeysPayload | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const query = useMemo(
    () => `client=${encodeURIComponent(client || 'default')}&profile=${encodeURIComponent(profile)}`,
    [client, profile],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/integrations/keys?${query}`, { credentials: 'include' });
      const data = (await res.json()) as KeysPayload;
      if (!res.ok) throw new Error(data.error || 'Could not load keys');
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load keys');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetch('/api/integrations/keys?catalog=1', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: KeysPayload) => {
        if (Array.isArray(data.profiles) && data.profiles.length) {
          setProfiles(data.profiles);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const next = payload?.next;
  const fields = payload?.fields ?? [];

  async function submit(action: 'store' | 'skip', event?: FormEvent) {
    event?.preventDefault();
    if (!next?.field) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/integrations/keys', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          client,
          profile,
          envVariable: next.field.envVariable,
          value: action === 'store' ? value : undefined,
        }),
      });
      const data = (await res.json()) as KeysPayload & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not save key');
      setPayload(data);
      setValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save key');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
          <Link href="/dashboard/settings" className="hover:text-wise-electric">Settings</Link>
          {' / '}API Keys
        </p>
        <h1 className="wise-page-title">Client API keys</h1>
        <p className="wise-page-subtitle">
          Walk a client through one key at a time. Values are stored privately and never shown in full.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Client slug"
            value={client}
            onChange={(event) => setClient(event.target.value.toLowerCase())}
            placeholder="getdown"
            helperText="Letters, numbers, and hyphens."
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary block" htmlFor="api-key-profile">
              Profile
            </label>
            <select
              id="api-key-profile"
              className="wise-input"
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
            >
              {profiles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-muted">
              {profiles.find((item) => item.id === profile)?.summary}
            </p>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={() => void refresh()} disabled={loading}>
              Refresh status
            </Button>
          </div>
        </div>

        {payload && (
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span>Required {payload.requiredConfigured}/{payload.requiredTotal}</span>
            <span>Optional {payload.optionalConfigured}/{payload.optionalTotal}</span>
            <span>Skipped {payload.skipped}</span>
          </div>
        )}
      </Card>

      {error && (
        <Card className="p-4 border-danger/30">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Card className="p-5 lg:col-span-3 space-y-4">
          {loading && !payload ? (
            <p className="text-sm text-text-muted">Loading…</p>
          ) : next?.done || !next?.field ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-text-primary">This profile is complete</h2>
              <p className="text-sm text-text-muted">
                Required keys are stored or skipped. You can switch profiles or come back later to fill optional keys.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(event) => void submit('store', event)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">
                    {next.serviceName} · {next.required ? 'Required' : 'Optional'}
                  </p>
                  <h2 className="text-lg font-semibold text-text-primary">{next.field.name}</h2>
                </div>
                <Badge variant={next.required ? 'warning' : 'neutral'}>
                  {next.remainingRequired} required left
                </Badge>
              </div>
              <ol className="space-y-2 text-sm text-text-secondary list-decimal pl-5">
                {next.field.clientSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                href={next.field.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-wise-electric hover:underline"
              >
                Open {next.serviceName} docs
              </a>
              <Input
                label={next.field.envVariable}
                type="password"
                autoComplete="off"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Paste the key. It will not be shown again."
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" isLoading={saving} disabled={!value.trim()}>
                  Save key
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={() => void submit('skip')}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Checklist</h2>
          <ul className="space-y-2">
            {fields.map((field) => (
              <li key={field.envVariable} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-text-primary">{field.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {field.serviceName}
                    {field.masked ? ` · ${field.masked}` : ''}
                  </p>
                </div>
                <Badge
                  variant={
                    field.status === 'configured'
                      ? 'success'
                      : field.status === 'skipped'
                        ? 'neutral'
                        : field.required
                          ? 'warning'
                          : 'info'
                  }
                >
                  {field.status === 'configured' ? 'Set' : field.status === 'skipped' ? 'Skip' : 'Need'}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
