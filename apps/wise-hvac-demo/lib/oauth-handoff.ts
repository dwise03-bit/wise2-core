import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

export const HANDOFF_TTL_MS = 60 * 1000;
export const FIELD_TECH_APP_SCHEME = 'com.wise2.fieldtech';

export type HandoffAuth = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

const tickets = new Map<string, { auth: HandoffAuth; exp: number }>();

function getTicketSecret(): string {
  return (
    process.env.OAUTH_STATE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    'field-tech-handoff'
  );
}

function signTicketId(id: string): string {
  return createHmac('sha256', getTicketSecret()).update(id).digest('base64url');
}

export function createHandoffTicket(auth: HandoffAuth, now = Date.now()): string {
  const id = randomUUID();
  tickets.set(id, { auth, exp: now + HANDOFF_TTL_MS });
  return `${id}.${signTicketId(id)}`;
}

export function consumeHandoffTicket(ticket: string | null, now = Date.now()): HandoffAuth | null {
  if (!ticket) return null;
  const separator = ticket.lastIndexOf('.');
  if (separator <= 0) return null;

  const id = ticket.slice(0, separator);
  const sig = ticket.slice(separator + 1);
  const expected = signTicketId(id);
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  const stored = tickets.get(id);
  tickets.delete(id);
  if (!stored || now > stored.exp) return null;
  return stored.auth;
}

export function fieldTechAppHandoffUrl(ticket: string): string {
  return `${FIELD_TECH_APP_SCHEME}://oauth/handoff?ticket=${encodeURIComponent(ticket)}`;
}
