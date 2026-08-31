import { describe, expect, it } from 'vitest';
import { defaultConfig } from '../config.js';
import { resolveRoute } from '../router.js';
describe('routing', () => {
  it('keeps normal code work local', () => expect(resolveRoute('code', defaultConfig()).backend).toBe('local-ollama'));
  it('uses configured GPU only for GPU roles', () => expect(resolveRoute('architect', defaultConfig()).backend).toBe('gpu-ollama'));
  it('never selects a cloud backend', () => expect(['local-ollama', 'gpu-ollama', 'hermes']).toContain(resolveRoute('code', defaultConfig()).backend));
});
