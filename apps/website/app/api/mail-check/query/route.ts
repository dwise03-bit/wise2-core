import { NextRequest, NextResponse } from 'next/server';
import {
  mailCheckCookieName,
  openMailCheckSession,
  sealMailCheckSession,
  type MailCheckSession,
} from '@/lib/mail-check-session';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

type GmailMessage = {
  id?: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string;
  labelIds?: string[];
  payload?: { headers?: Array<{ name?: string; value?: string }> };
};

function header(message: GmailMessage, name: string) {
  return message.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

async function refreshSession(session: MailCheckSession): Promise<MailCheckSession | null> {
  if (session.expiresAt > Date.now() + 30_000) return session;
  if (!session.refreshToken) return null;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: session.refreshToken,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const tokens = await response.json() as { access_token?: string; expires_in?: number };
  if (!tokens.access_token) return null;
  return {
    ...session,
    accessToken: tokens.access_token,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
  };
}

function queryFor(action: string, requestedQuery?: string) {
  if (action === 'unread') return 'in:inbox is:unread';
  if (action === 'important') return 'in:inbox is:important';
  if (action === 'recent') return 'in:inbox newer_than:30d';
  return requestedQuery?.trim() || 'in:inbox';
}

export async function POST(request: NextRequest) {
  let body: { action?: string; query?: string; limit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const session = openMailCheckSession(request.cookies.get(mailCheckCookieName())?.value);
  if (!session) {
    return NextResponse.json({ connected: false, error: 'Connect Gmail to check mail.' }, { status: 401 });
  }

  const activeSession = await refreshSession(session);
  if (!activeSession) {
    const response = NextResponse.json({ connected: false, error: 'Gmail connection expired. Reconnect to continue.' }, { status: 401 });
    response.cookies.delete(mailCheckCookieName());
    return response;
  }

  const action = body.action || 'recent';
  const limit = Math.max(1, Math.min(Number(body.limit) || 5, 10));
  const gmailQuery = queryFor(action, body.query);

  try {
    const listResponse = await fetch(
      `${GMAIL_API}/messages?maxResults=${limit}&q=${encodeURIComponent(gmailQuery)}`,
      {
        headers: { Authorization: `Bearer ${activeSession.accessToken}` },
        cache: 'no-store',
      },
    );

    if (!listResponse.ok) throw new Error(`Gmail list failed: ${listResponse.status}`);
    const list = await listResponse.json() as {
      resultSizeEstimate?: number;
      messages?: Array<{ id?: string; threadId?: string }>;
    };

    const messages = await Promise.all((list.messages || []).filter((message) => message.id).map(async (message) => {
      const details = await fetch(
        `${GMAIL_API}/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${activeSession.accessToken}` },
          cache: 'no-store',
        },
      );
      if (!details.ok) return null;
      const item = await details.json() as GmailMessage;
      return {
        id: item.id,
        threadId: item.threadId,
        from: header(item, 'From') || 'Unknown sender',
        subject: header(item, 'Subject') || '(No subject)',
        date: header(item, 'Date') || item.internalDate || '',
        snippet: item.snippet || '',
        unread: item.labelIds?.includes('UNREAD') || false,
      };
    }));

    const response = NextResponse.json({
      connected: true,
      query: gmailQuery,
      total: list.resultSizeEstimate || 0,
      messages: messages.filter(Boolean),
    });
    if (activeSession.accessToken !== session.accessToken) {
      response.cookies.set(mailCheckCookieName(), sealMailCheckSession(activeSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }
    return response;
  } catch (error) {
    console.error('Mail Check query failed:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Unable to check Gmail right now.' }, { status: 502 });
  }
}
