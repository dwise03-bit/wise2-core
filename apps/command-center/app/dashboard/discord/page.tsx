'use client';

import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../../../src/components/ui';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
const BRAIN_API_URL = process.env.NEXT_PUBLIC_BRAIN_API_URL || '/brain-api';

interface DiscordStatus {
  initialized: boolean;
  connected: boolean;
  guildId?: string | null;
  commandsCount: number;
  webhookConfigured: boolean;
  webhookChannelsConfigured: number;
  channels: {
    alerts: boolean;
    builds: boolean;
    deployments: boolean;
    decisions: boolean;
  };
  defaultTenantId?: string | null;
  defaultHermesUserId?: string | null;
  oauthConfigured?: boolean;
  redirectUri?: string | null;
}

interface DiscordSetup {
  ready: boolean;
  oauth: {
    configured: boolean;
    clientIdConfigured: boolean;
    clientSecretConfigured: boolean;
    redirectUri: string;
  };
  bot: {
    configured: boolean;
    connected: boolean;
    guildId?: string | null;
  };
  webhooks: {
    configured: boolean;
    channels: {
      alerts: boolean;
      builds: boolean;
      deployments: boolean;
      decisions: boolean;
    };
  };
  commandContext: {
    tenantConfigured: boolean;
    tenantId?: string | null;
    hermesUserConfigured: boolean;
    hermesUserId?: string | null;
  };
  missing: string[];
  env: Array<{
    key: string;
    configured: boolean;
    purpose: string;
  }>;
  invite: {
    inviteUrl: string;
    message: string;
  };
}

interface DiscordSummary {
  discord: DiscordStatus;
  hermes: {
    status: string;
    endpoint?: string;
    model?: string;
    error?: string;
  };
  revenue: {
    available: boolean;
    reason?: string;
    tenantId?: string;
    kpis?: {
      newLeads?: { count?: number };
      soldThisWeek?: { amount?: number };
      jobsCompleted?: { count?: number };
      todaysAppointments?: { count?: number };
    };
    pipeline?: {
      totalPipelineValue?: number;
      conversionRate?: number;
    };
    alerts?: {
      unsoldEstimates?: number;
      customersWaiting?: number;
      maintenanceDue?: number;
      overdueFollowUps?: number;
    };
    dispatch?: {
      totalJobs?: number;
      statusCounts?: Record<string, number>;
    };
  };
  process: {
    uptimeHuman: string;
    node: string;
    pid: number;
  };
  generatedAt: string;
}

interface BrainHealth {
  overallStatus: string;
  components: {
    ai?: { status?: string };
    automation?: { status?: string };
    documents?: { status?: string };
    graph?: { status?: string };
  };
}

interface WebhookStatus {
  configured: boolean;
  channels: {
    alerts: boolean;
    builds: boolean;
    deployments: boolean;
    decisions: boolean;
  };
}

const COMMANDS = [
  { cmd: '/help', desc: 'Command reference for the WISE2 Discord bot' },
  { cmd: '/status', desc: 'Live bot, Hermes, webhook, and revenue status' },
  { cmd: '/health', desc: 'Hermes endpoint and runtime health check' },
  { cmd: '/uptime', desc: 'Bot and API uptime snapshot' },
  { cmd: '/ask', desc: 'Ask Hermes from Discord using the configured user context' },
  { cmd: '/sales', desc: 'Revenue pipeline summary from Revenue OS' },
  { cmd: '/metrics', desc: 'New leads, sold this week, jobs completed, appointments' },
  { cmd: '/alerts', desc: 'Revenue OS alert counters' },
  { cmd: '/dispatch', desc: "Today's dispatch snapshot" },
  { cmd: '/discord', desc: 'Discord integration configuration and channel status' },
  { cmd: '/deploy', desc: 'Send a deployment event to the deployments channel' },
];

export default function DiscordPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [summary, setSummary] = useState<DiscordSummary | null>(null);
  const [brainHealth, setBrainHealth] = useState<BrainHealth | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);
  const [setup, setSetup] = useState<DiscordSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [statusRes, summaryRes, setupRes, webhooksRes, brainRes] = await Promise.allSettled([
          fetch(`${API_URL}/v1/discord/status`, { headers }),
          fetch(`${API_URL}/v1/discord/summary`, { headers }),
          fetch(`${API_URL}/v1/discord/setup`, { headers }),
          fetch('/api/integrations/discord'),
          fetch(`${BRAIN_API_URL}/brain/dashboard/health`, { headers }),
        ]);

        if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
          setStatus(await statusRes.value.json());
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
          setSummary(await summaryRes.value.json());
        }

        if (setupRes.status === 'fulfilled' && setupRes.value.ok) {
          setSetup(await setupRes.value.json());
        }

        if (webhooksRes.status === 'fulfilled' && webhooksRes.value.ok) {
          setWebhookStatus(await webhooksRes.value.json());
        }

        if (brainRes.status === 'fulfilled' && brainRes.value.ok) {
          setBrainHealth(await brainRes.value.json());
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, token, user?.id]);

  const sendTest = async (channel: 'alerts' | 'deployments' | 'builds' | 'decisions' = 'alerts') => {
    if (!token || sendingTest) return;

    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/v1/discord/test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          message: `Manual Discord test from command center for ${channel}.`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setTestResult(`Sent to ${channel}`);
    } catch (error) {
      setTestResult(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setSendingTest(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const botOnline = status?.connected || summary?.discord.connected || false;
  const hermesStatus = summary?.hermes.status || 'unknown';
  const revenueReady = summary?.revenue.available || false;
  const webhookReady = webhookStatus?.configured || status?.webhookConfigured || false;
  const brainStatus = brainHealth?.overallStatus || 'unknown';
  const setupReady = setup?.ready || false;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Discord</h1>
          <p className="text-sm text-text-muted mt-1">
            Live bot, webhook, Hermes, Revenue OS, and Brain integration status
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      <Card className="p-1">
        <div className="grid grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Bot', value: loading ? '…' : botOnline ? 'Connected' : 'Offline', ok: botOnline },
            { label: 'Webhooks', value: loading ? '…' : webhookReady ? 'Configured' : 'Missing', ok: webhookReady },
            { label: 'Hermes', value: loading ? '…' : hermesStatus, ok: hermesStatus === 'online' },
            { label: 'Revenue OS', value: loading ? '…' : revenueReady ? 'Ready' : 'Not set', ok: revenueReady },
            { label: 'Second Brain', value: loading ? '…' : brainStatus, ok: brainStatus === 'healthy' },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3 border-r border-border-subtle last:border-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className={`text-sm font-semibold ${item.ok ? 'text-green-400' : 'text-amber-400'}`}>
                  {item.value}
                </span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Setup Checklist</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={setupReady ? 'success' : 'warning'}>
                {setupReady ? 'Discord Ready' : 'Setup Incomplete'}
              </Badge>
              <Badge variant={setup?.oauth.configured ? 'success' : 'warning'}>
                {setup?.oauth.configured ? 'OAuth Ready' : 'OAuth Missing'}
              </Badge>
              <Badge variant={setup?.bot.configured ? 'success' : 'warning'}>
                {setup?.bot.configured ? 'Bot Ready' : 'Bot Missing'}
              </Badge>
            </div>

            {setup?.missing && setup.missing.length > 0 ? (
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Missing Env</div>
                <div className="flex flex-wrap gap-2">
                  {setup.missing.map((key) => (
                    <Badge key={key} variant="warning" className="normal-case">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted">All required Discord setup keys are configured.</p>
            )}

            <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Redirect URI</div>
              <div className="text-xs text-text-primary break-all">{setup?.oauth.redirectUri || status?.redirectUri || '--'}</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Bot Runtime</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={botOnline ? 'success' : 'warning'}>{botOnline ? 'Bot Connected' : 'Bot Offline'}</Badge>
              <Badge variant={status?.defaultTenantId ? 'success' : 'warning'}>
                {status?.defaultTenantId ? 'Revenue Tenant Set' : 'Revenue Tenant Missing'}
              </Badge>
              <Badge variant={status?.defaultHermesUserId ? 'success' : 'warning'}>
                {status?.defaultHermesUserId ? 'Hermes User Set' : 'Hermes User Missing'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Commands</div>
                <div className="text-lg font-semibold text-text-primary mt-1">{status?.commandsCount ?? summary?.discord.commandsCount ?? '--'}</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Webhook Channels</div>
                <div className="text-lg font-semibold text-text-primary mt-1">{status?.webhookChannelsConfigured ?? '--'}</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Guild ID</div>
                <div className="text-sm font-semibold text-text-primary mt-1 break-all">{status?.guildId || '--'}</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">API Uptime</div>
                <div className="text-lg font-semibold text-text-primary mt-1">{summary?.process.uptimeHuman || '--'}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Channel Status</h2>
          <div className="space-y-2">
            {[
              { label: 'Alerts', ok: webhookStatus?.channels.alerts || status?.channels.alerts },
              { label: 'Builds', ok: webhookStatus?.channels.builds || status?.channels.builds },
              { label: 'Deployments', ok: webhookStatus?.channels.deployments || status?.channels.deployments },
              { label: 'Decisions', ok: webhookStatus?.channels.decisions || status?.channels.decisions },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-wise-black/30 px-3 py-2">
                <span className="text-sm text-text-secondary">{row.label}</span>
                <Badge variant={row.ok ? 'success' : 'neutral'}>{row.ok ? 'Configured' : 'Missing'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Setup Steps</h2>
        <div className="space-y-2 text-xs text-text-muted">
          {[
            '1. Create a Discord application and bot in the Discord Developer Portal.',
            `2. Set the OAuth redirect URI to ${setup?.oauth.redirectUri || status?.redirectUri || 'your Wise2 callback URL'}.`,
            '3. Invite the bot to the Wise2 server and capture the server ID as DISCORD_GUILD_ID.',
            '4. Create channel webhooks for alerts, builds, deployments, and decisions.',
            '5. Set DISCORD_DEFAULT_TENANT_ID so Revenue OS commands have a live tenant context.',
            '6. Set DISCORD_DEFAULT_HERMES_USER_ID so /ask can call Hermes with a real user context.',
            '7. Restart the API so the bot reconnects and re-registers slash commands.',
          ].map((step) => (
            <p key={step}>{step}</p>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Live Commands</h2>
          <div className="space-y-1">
            {COMMANDS.map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0">
                <code className="text-xs font-mono text-wise-electric bg-wise-electric/5 px-2 py-1 rounded shrink-0">
                  {cmd}
                </code>
                <span className="text-xs text-text-muted pt-1">{desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Test Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => sendTest('alerts')} disabled={sendingTest}>
              Alerts Test
            </Button>
            <Button variant="secondary" size="sm" onClick={() => sendTest('builds')} disabled={sendingTest}>
              Builds Test
            </Button>
            <Button variant="secondary" size="sm" onClick={() => sendTest('deployments')} disabled={sendingTest}>
              Deployments Test
            </Button>
            <Button variant="secondary" size="sm" onClick={() => sendTest('decisions')} disabled={sendingTest}>
              Decisions Test
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-3">
            {testResult || 'Send a real embed through the backend Discord integration.'}
          </p>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Hermes</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Status</span>
              <Badge variant={hermesStatus === 'online' ? 'success' : hermesStatus === 'degraded' ? 'warning' : 'danger'}>
                {hermesStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Model</span>
              <span className="text-text-primary">{summary?.hermes.model || '--'}</span>
            </div>
            <p className="text-xs text-text-muted break-all">{summary?.hermes.endpoint || '--'}</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Revenue OS</h2>
          {summary?.revenue.available ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">New Leads</div>
                <div className="text-lg font-semibold text-text-primary mt-1">{summary.revenue.kpis?.newLeads?.count ?? '--'}</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Pipeline</div>
                <div className="text-lg font-semibold text-text-primary mt-1">
                  ${Math.round((summary.revenue.pipeline?.totalPipelineValue || 0) / 1000)}k
                </div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Appointments</div>
                <div className="text-lg font-semibold text-text-primary mt-1">{summary.revenue.kpis?.todaysAppointments?.count ?? '--'}</div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-wise-black/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-text-muted">Alerts</div>
                <div className="text-lg font-semibold text-text-primary mt-1">
                  {(summary.revenue.alerts?.unsoldEstimates || 0) + (summary.revenue.alerts?.customersWaiting || 0)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              {summary?.revenue.reason || 'Set `DISCORD_DEFAULT_TENANT_ID` on the API to expose live Revenue OS data in Discord.'}
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Second Brain</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Overall</span>
              <Badge variant={brainStatus === 'healthy' ? 'success' : brainStatus === 'degraded' ? 'warning' : 'neutral'}>
                {brainStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Documents</span>
              <span className="text-text-primary">{brainHealth?.components.documents?.status || '--'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Graph</span>
              <span className="text-text-primary">{brainHealth?.components.graph?.status || '--'}</span>
            </div>
            <p className="text-xs text-text-muted">
              Brain health is shown in the dashboard and complements Discord bot operations.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
