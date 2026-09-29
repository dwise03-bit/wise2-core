import { describe, expect, it } from 'vitest';
import { findTarget, parseTargets, publicTarget, publicTargets } from '../registry.js';
import { TARGETS } from './helpers.js';

const raw = [
  {
    alias: 'wise2-core',
    address: '100.64.0.10',
    transport: 'control-bridge',
    controlPort: 3099,
    environment: 'production',
    allowedProfiles: ['status', 'restart'],
    healthCheckProfile: 'status',
  },
];

describe('parseTargets', () => {
  it('parses a valid registry', () => {
    const result = parseTargets(raw);
    expect(result.ok && result.value[0]?.alias).toBe('wise2-core');
  });

  it('defaults the health check profile to status', () => {
    const result = parseTargets([{ ...raw[0], healthCheckProfile: undefined }]);
    expect(result.ok && result.value[0]?.healthCheckProfile).toBe('status');
  });

  it.each([
    ['a non-array registry', {}],
    ['an invalid alias', [{ ...raw[0], alias: 'WISE2 Core' }]],
    ['a duplicate alias', [raw[0], raw[0]]],
    ['a missing address', [{ ...raw[0], address: '' }]],
    ['an invalid transport', [{ ...raw[0], transport: 'telnet' }]],
    ['an invalid environment', [{ ...raw[0], environment: 'prod' }]],
    ['an empty profile list', [{ ...raw[0], allowedProfiles: [] }]],
    ['a write health check profile', [{ ...raw[0], healthCheckProfile: 'restart' }]],
    ['an ssh target with no user', [{ ...raw[0], transport: 'ssh', sshUser: undefined }]],
  ])('rejects %s', (_label, input) => {
    expect(parseTargets(input).ok).toBe(false);
  });

  it('rejects a target that allows a profile outside the registry', () => {
    expect(parseTargets([{ ...raw[0], allowedProfiles: ['status', 'exec'] }]))
      .toMatchObject({ ok: false, code: 'PROFILE_UNKNOWN' });
  });
});

describe('publicTarget', () => {
  it('never exposes an address, ssh user, key reference, or port', () => {
    const rendered = JSON.stringify(publicTargets([
      { ...TARGETS[0]!, sshUser: 'dwise', sshKeyRef: '~/.ssh/wise2-ops' },
    ]));
    expect(rendered).not.toContain('100.64');
    expect(rendered).not.toContain('dwise');
    expect(rendered).not.toContain('wise2-ops');
    expect(rendered).not.toContain('3099');
    expect(rendered).toContain('wise2-core');
  });

  it('keeps the fields Discord needs', () => {
    expect(publicTarget(TARGETS[0]!)).toMatchObject({ alias: 'wise2-core', environment: 'production', transport: 'control-bridge' });
  });
});

describe('findTarget', () => {
  it('returns undefined for an unknown alias', () => {
    expect(findTarget(TARGETS, 'wise2-ghost')).toBeUndefined();
  });
});

describe('baseUrl', () => {
  it('accepts a tailscale serve origin and trims a trailing slash', () => {
    const result = parseTargets([{ ...raw[0], baseUrl: 'https://gpu-nmls-1.tail44396d.ts.net/' }]);
    expect(result.ok && result.value[0]?.baseUrl).toBe('https://gpu-nmls-1.tail44396d.ts.net');
  });

  it.each([
    ['a non-URL', 'not a url'],
    ['embedded credentials', 'https://user:pass@host.ts.net'],
    ['a path', 'https://host.ts.net/v1/control'],
    ['a query', 'https://host.ts.net/?token=abc'],
    ['a non-http scheme', 'ssh://host.ts.net'],
  ])('rejects %s', (_label, baseUrl) => {
    expect(parseTargets([{ ...raw[0], baseUrl }]).ok).toBe(false);
  });
});
