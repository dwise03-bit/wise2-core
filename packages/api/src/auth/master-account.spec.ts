import { isMasterAccountEmail, roleForEmail } from './master-account';

describe('master account', () => {
  it('recognizes the founder emails case-insensitively', () => {
    expect(isMasterAccountEmail('dwise03@gmail.com')).toBe(true);
    expect(isMasterAccountEmail('  DWISE03@GMAIL.COM  ')).toBe(true);
    expect(isMasterAccountEmail('darrinwisejr@gmail.com')).toBe(true);
    expect(isMasterAccountEmail('  DarrinWiseJr@Gmail.com ')).toBe(true);
    expect(isMasterAccountEmail('someone@example.com')).toBe(false);
    expect(isMasterAccountEmail(null)).toBe(false);
    expect(isMasterAccountEmail('')).toBe(false);
  });

  it('assigns FOUNDER only to the master emails', () => {
    expect(roleForEmail('dwise03@gmail.com')).toBe('FOUNDER');
    expect(roleForEmail('darrinwisejr@gmail.com')).toBe('FOUNDER');
    expect(roleForEmail('tech@wise2.net')).toBe('CUSTOMER');
    expect(roleForEmail(undefined)).toBe('CUSTOMER');
  });
});
