import { describe, expect, it } from 'vitest';
import { constantTimeTokenEqual, extractBearer } from '../auth.js';

describe('auth helpers', () => {
  it('extracts bearer tokens', () => {
    expect(extractBearer('Bearer abc')).toBe('abc');
    expect(extractBearer('Basic abc')).toBeNull();
  });

  it('uses exact constant-time token matching semantics', () => {
    expect(constantTimeTokenEqual('abc', 'abc')).toBe(true);
    expect(constantTimeTokenEqual('abc', 'abd')).toBe(false);
    expect(constantTimeTokenEqual('abc', 'abcd')).toBe(false);
  });
});
