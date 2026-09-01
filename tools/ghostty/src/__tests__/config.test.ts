import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../config.js';
describe('configuration', () => {
  it('is local first and disables automatic cloud escalation', () => {
    const c = defaultConfig();
    expect(c.localOllamaUrl).toBe('http://127.0.0.1:11434');
    expect(c.autoCloudEscalation).toBe(false);
    expect(c.roles.fast.backend).toBe('local-ollama');
    expect(c.roles.architect.backend).toBe('gpu-ollama');
  });
});
