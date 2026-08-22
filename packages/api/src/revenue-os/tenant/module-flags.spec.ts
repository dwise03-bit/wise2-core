import {
  defaultModulesForVertical,
  hasModule,
  resolveEnabledModules,
} from './module-flags';

describe('module-flags', () => {
  it('gives roofing tenants storm and suppliers by default', () => {
    expect(defaultModulesForVertical('roofing')).toEqual(
      expect.arrayContaining(['storm', 'suppliers', 'crm', 'jobs']),
    );
  });

  it('does not give pressure_washing storm or suppliers by default', () => {
    const modules = defaultModulesForVertical('pressure_washing');
    expect(modules).not.toContain('storm');
    expect(modules).not.toContain('suppliers');
    expect(modules).toEqual(expect.arrayContaining(['crm', 'jobs']));
  });

  it('falls back to the vertical default when enabledModules is empty', () => {
    expect(resolveEnabledModules('roofing', [])).toEqual(
      defaultModulesForVertical('roofing'),
    );
  });

  it('honors an explicit override over the vertical default', () => {
    expect(resolveEnabledModules('roofing', ['crm'])).toEqual(['crm']);
  });

  it('hasModule respects both the override and the default path', () => {
    expect(hasModule('roofing', [], 'storm')).toBe(true);
    expect(hasModule('roofing', ['crm'], 'storm')).toBe(false);
  });
});
