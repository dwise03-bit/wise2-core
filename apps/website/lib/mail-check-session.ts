import crypto from 'crypto';

export type MailCheckSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  email?: string;
};

const COOKIE_NAME = 'wise2_mail_check';
const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const value = process.env.MAIL_CHECK_SESSION_SECRET || '';
  const key = /^[a-f0-9]{64}$/i.test(value)
    ? Buffer.from(value, 'hex')
    : Buffer.from(value, 'base64');

  if (key.length !== 32) {
    throw new Error('Mail Check is not configured.');
  }

  return key;
}

export function mailCheckCookieName() {
  return COOKIE_NAME;
}

export function sealMailCheckSession(session: MailCheckSession): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function openMailCheckSession(value?: string): MailCheckSession | null {
  if (!value) return null;

  try {
    const payload = Buffer.from(value, 'base64url');
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);
    const raw = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    const session = JSON.parse(raw) as MailCheckSession;

    return session.accessToken && Number.isFinite(session.expiresAt) ? session : null;
  } catch {
    return null;
  }
}
