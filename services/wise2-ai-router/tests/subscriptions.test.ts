import { ROUTING_POLICY, SUBSCRIPTION_RESOURCES } from '../src/subscriptions';

describe('WISE2 subscription resource policy', () => {
  test('keeps metered API disabled by default', () => {
    expect(ROUTING_POLICY.meteredApiDefault).toBe(false);
  });

  test('includes the requested AI coding lanes', () => {
    const ids = SUBSCRIPTION_RESOURCES.map((resource) => resource.id);
    expect(ids).toEqual(expect.arrayContaining([
      'copilot', 'cursor', 'gemini', 'codex', 'claude-a', 'claude-b', 'cloudflare',
    ]));
  });

  test('does not silently rotate Claude identities', () => {
    expect(ROUTING_POLICY.rules.join(' ')).toMatch(/never auto-rotate/i);
  });
});
