import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createOAuthState,
  OAUTH_STATE_TTL_MS,
  signedOAuthStateIsNative,
  verifySignedOAuthState,
} from './oauth-state.ts';

const SECRET = 'hvac-oauth-state-test-secret';

test('signed OAuth state verifies without a cookie', () => {
  const previous = process.env.OAUTH_STATE_SECRET;
  process.env.OAUTH_STATE_SECRET = SECRET;
  try {
    const state = createOAuthState('google', 1_700_000_000_000);
    assert.equal(verifySignedOAuthState('google', state, 1_700_000_000_000), true);
    assert.equal(state.includes('google:'), false);
  } finally {
    if (previous === undefined) delete process.env.OAUTH_STATE_SECRET;
    else process.env.OAUTH_STATE_SECRET = previous;
  }
});

test('signed OAuth state can mark a native Field Tech handoff', () => {
  const previous = process.env.OAUTH_STATE_SECRET;
  process.env.OAUTH_STATE_SECRET = SECRET;
  try {
    const issued = 1_700_000_000_000;
    const web = createOAuthState('google', issued);
    const native = createOAuthState('google', issued, { native: true });
    assert.equal(verifySignedOAuthState('google', native, issued), true);
    assert.equal(signedOAuthStateIsNative(native), true);
    assert.equal(signedOAuthStateIsNative(web), false);
  } finally {
    if (previous === undefined) delete process.env.OAUTH_STATE_SECRET;
    else process.env.OAUTH_STATE_SECRET = previous;
  }
});

test('signed OAuth state rejects tampering, expiry, and the wrong provider', () => {
  const previous = process.env.OAUTH_STATE_SECRET;
  process.env.OAUTH_STATE_SECRET = SECRET;
  try {
    const issued = 1_700_000_000_000;
    const state = createOAuthState('google', issued);
    assert.equal(verifySignedOAuthState('google', `${state}x`, issued), false);
    assert.equal(verifySignedOAuthState('google', state, issued + OAUTH_STATE_TTL_MS + 1), false);
    assert.equal(verifySignedOAuthState('google', 'google:legacy-cookie-only', issued), false);
  } finally {
    if (previous === undefined) delete process.env.OAUTH_STATE_SECRET;
    else process.env.OAUTH_STATE_SECRET = previous;
  }
});
