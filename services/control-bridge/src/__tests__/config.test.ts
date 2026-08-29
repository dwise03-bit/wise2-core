import { describe, expect, it } from 'vitest';
import { loadConfig } from '../config.js';

describe('loadConfig', () => {
  it('requires a bearer token', () => {
    expect(() => loadConfig({})).toThrow('WISE2_CONTROL_TOKEN is required');
  });
  it('defaults to localhost port 3099', () => {
    const config = loadConfig({ WISE2_CONTROL_TOKEN: 'test-token' });
    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(3099);
  });
});
