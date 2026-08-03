import { NextRequest } from 'next/server';
import { eventBus, LiveEvent } from '../../../src/events/eventBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: LiveEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // client gone
        }
      };

      // Initial connection event
      const connectedEvent: LiveEvent = {
        id: 'conn-' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'stream.connected',
        severity: 'info',
        source: 'command-center',
        title: 'Live Ops Connected',
        message: 'Real-time event stream established',
      };
      send(connectedEvent);

      eventBus.on('live-event', send);

      // Heartbeat every 25s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        eventBus.off('live-event', send);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
