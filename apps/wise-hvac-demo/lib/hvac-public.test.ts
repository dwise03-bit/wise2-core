import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeUrl, ticketFromAppUrl } from './native-google-signin.ts';
import { fieldUrl } from './field-api.ts';
import { HVAC_BASE_PATH, hvacAppUrl, hvacPublicUrl } from './hvac-public.ts';

test('HVAC public host is the live API origin, not the app UI origin', () => {
  assert.equal(hvacPublicUrl(), 'https://hvac.wise2.net');
  assert.equal(hvacAppUrl('/api/field/jobs'), 'https://hvac.wise2.net/wise-hvac-demo/api/field/jobs');
  assert.equal(HVAC_BASE_PATH, '/wise-hvac-demo');
});

test('native Google authorize stays on the HVAC API host', () => {
  assert.equal(
    authorizeUrl(true),
    'https://hvac.wise2.net/wise-hvac-demo/api/auth/google/authorize?native=1',
  );
  assert.equal(authorizeUrl(false), '/wise-hvac-demo/api/auth/google/authorize');
});

test('native field URLs are remote JSON endpoints', () => {
  assert.equal(fieldUrl('/field/jobs', true), 'https://hvac.wise2.net/wise-hvac-demo/api/field/jobs');
  assert.match(fieldUrl('/field/jobs', false), /\/api\/field\/jobs$/);
});

test('custom scheme handoff still carries the ticket', () => {
  const url = 'com.wise2.fieldtech://oauth/handoff?ticket=abc.def';
  assert.equal(ticketFromAppUrl(url), 'abc.def');
});
