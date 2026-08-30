import { resolveJwtSecret } from './jwt-secret';

describe('resolveJwtSecret', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns configured secret when long enough', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    expect(resolveJwtSecret()).toBe('a'.repeat(32));
  });

  it('uses dev fallback outside production', () => {
    process.env.NODE_ENV = 'development';
    expect(resolveJwtSecret()).toContain('dev-secret');
  });

  it('throws in production when unset', () => {
    process.env.NODE_ENV = 'production';
    expect(() => resolveJwtSecret()).toThrow(/JWT_SECRET must be set/);
  });
});
