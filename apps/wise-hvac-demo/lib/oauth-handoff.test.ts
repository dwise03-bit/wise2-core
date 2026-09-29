import assert from 'node:assert/strict';
import test from 'node:test';
import {
  consumeHandoffTicket,
  createHandoffTicket,
  fieldTechAppHandoffUrl,
  HANDOFF_TTL_MS,
} from './oauth-handoff.ts';
import { ticketFromAppUrl } from './native-google-signin.ts';

const auth = {
  user: { id: 'tech-1', email: 'tech@wise2.net', name: 'Field Tech' },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
};

test('handoff ticket is one-time and expires', () => {
  const now = 1_700_000_000_000;
  const ticket = createHandoffTicket(auth, now);
  assert.equal(consumeHandoffTicket(`${ticket}x`, now), null);
  assert.deepEqual(consumeHandoffTicket(ticket, now), auth);
  assert.equal(consumeHandoffTicket(ticket, now), null);

  const expired = createHandoffTicket(auth, now);
  assert.equal(consumeHandoffTicket(expired, now + HANDOFF_TTL_MS + 1), null);
});

test('native app URL carries the handoff ticket', () => {
  const ticket = createHandoffTicket(auth);
  const url = fieldTechAppHandoffUrl(ticket);
  assert.equal(url.startsWith('com.wise2.fieldtech://oauth/handoff?ticket='), true);
  assert.equal(ticketFromAppUrl(url), ticket);
});
