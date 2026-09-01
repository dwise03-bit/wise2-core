import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';

type TelnyxEvent = {
  event_type?: string;
  data?: {
    id?: string;
    event_type?: string;
    payload?: {
      call_control_id?: string;
      from?: string;
      to?: string;
      direction?: string;
      occurred_at?: string;
    };
  };
};

export class TelnyxCallAlertWebhook {
  private server: Server | null = null;

  public start(): void {
    const webhookUrl = process.env.DISCORD_WEBHOOK_CALLS;
    if (!webhookUrl) return;

    const port = Number(process.env.TELNYX_WEBHOOK_PORT || 8787);
    this.server = createServer((request, response) => this.handle(request, response));
    this.server.listen(port, () => console.log(`[Telnyx] Call alert webhook listening on :${port}`));
  }

  public stop(): void {
    this.server?.close();
    this.server = null;
  }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST' || request.url !== '/webhooks/telnyx/calls') {
      response.writeHead(404).end();
      return;
    }

    const secret = process.env.TELNYX_WEBHOOK_SECRET;
    if (secret && request.headers.authorization !== `Bearer ${secret}`) {
      response.writeHead(401).end();
      return;
    }

    try {
      const body = await this.readBody(request);
      const event = JSON.parse(body) as TelnyxEvent;
      const eventType = event.event_type || event.data?.event_type;
      if (eventType === 'call.initiated') await this.sendAlert(event);
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ received: true }));
    } catch (error) {
      console.error('[Telnyx] Invalid call webhook', error);
      response.writeHead(400).end();
    }
  }

  private async sendAlert(event: TelnyxEvent): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_CALLS;
    if (!webhookUrl) return;
    const payload = event.data?.payload || {};
    const callId = payload.call_control_id || event.data?.id || 'unknown';
    const alertUserIds = (process.env.DISCORD_CALL_ALERT_USER_IDS || process.env.DISCORD_CALL_ALERT_USER_ID || '')
      .split(',').map(id => id.trim()).filter(Boolean);
    const mentions = alertUserIds.map(id => `<@${id}>`).join(' ');
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: 'WISE² Calls',
        content: `🚨🚨🚨 ${mentions || '@everyone '}INCOMING CALL — ANSWER NOW 🚨🚨🚨`,
        allowed_mentions: alertUserIds.length ? { users: alertUserIds } : { parse: ['everyone'] },
        embeds: [{
          title: '🚨📞 INCOMING CALL — LIVE',
          description: '**CALL ALERT — PICK UP NOW**',
          color: 0xff1f3d,
          fields: [
            { name: 'From', value: payload.from || 'Unknown', inline: true },
            { name: 'To', value: payload.to || 'Unknown', inline: true },
            { name: 'Call ID', value: callId, inline: false },
          ],
          timestamp: payload.occurred_at || new Date().toISOString(),
          footer: { text: 'Telnyx · WISE² customer care' },
        }],
      }),
    });
  }

  private readBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      request.setEncoding('utf8');
      request.on('data', chunk => { body += chunk; });
      request.on('end', () => resolve(body));
      request.on('error', reject);
    });
  }
}

export default TelnyxCallAlertWebhook;
