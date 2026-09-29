import { boundedText, redactText } from '../../../packages/ops-protocol/src/index.js';
import type { HealthEvent } from './health.js';

/**
 * Posts health transitions to a Discord channel webhook (#fable5-activity).
 *
 * Alerts are informational by construction: the message names the command a person could
 * run, and nothing here can run it.
 */

const ICONS: Record<string, string> = { healthy: '🟢', degraded: '🟡', down: '🔴', unknown: '⚪' };

export type Notifier = (event: HealthEvent) => Promise<void>;

export function renderHealthAlert(event: HealthEvent, secrets: string[] = []): string {
  const icon = ICONS[event.to] ?? '⚪';
  const transition = event.from === 'unknown' ? `first seen **${event.to}**` : `**${event.from}** → **${event.to}**`;
  const lines = [
    `${icon} **${event.alias}** (${event.environment}) ${transition}`,
    `Observed: ${event.at}`,
  ];
  if (event.detail) lines.push(`Detail: ${boundedText(event.detail, 400)}`);
  lines.push(
    event.to === 'healthy'
      ? 'No action needed.'
      : `Suggested next step: \`/ops status ${event.alias}\` — this alert performs no remediation.`,
  );
  return redactText(lines.join('\n'), secrets);
}

export function createDiscordNotifier(options: {
  webhookUrl?: string;
  secrets?: string[];
  fetchImpl?: typeof globalThis.fetch;
  timeoutMs?: number;
  onError?: (error: Error) => void;
}): Notifier {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const secrets = options.secrets ?? [];
  return async (event: HealthEvent) => {
    if (!options.webhookUrl) return;
    try {
      await fetchImpl(options.webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: renderHealthAlert(event, secrets), allowed_mentions: { parse: [] } }),
        signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
      });
    } catch (error) {
      options.onError?.(error as Error);
    }
  };
}
