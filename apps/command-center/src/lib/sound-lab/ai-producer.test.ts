import { proposeProduction } from './ai-producer';

describe('AI Producer mapper', () => {
  it('proposes a vocal cleanup chain', () => {
    const p = proposeProduction('Clean this vocal and remove background noise');
    expect(p.blocked).toBeUndefined();
    expect(p.trackHint).toBe('vocal');
    expect(p.effects.length).toBeGreaterThan(0);
  });

  it('does not fake stem separation', () => {
    const p = proposeProduction('Separate the vocals');
    expect(p.blocked).toMatch(/Stem separation/);
    expect(p.effects).toHaveLength(0);
  });

  it('maps streaming master requests', () => {
    const p = proposeProduction('Master this for streaming');
    expect(p.trackHint).toBe('master');
    expect(p.effects.some((e) => e.type === 'limiter')).toBe(true);
  });
});
