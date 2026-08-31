import { isMasterAccountEmail, roleForEmail } from './master-account';

describe('master account', () => {
  it('recognizes the founder email case-insensitively', () => {
    expect(isMasterAccountEmail('dwise03@gmail.com')).toBe(true);
    expect(isMasterAccountEmail('  DWISE03@GMAIL.COM  ')).toBe(true);
    expect(isMasterAccountEmail('someone@example.com')).toBe(false);
  });

  it('assigns FOUNDER only to the master email', () => {
    expect(roleForEmail('dwise03@gmail.com')).toBe('FOUNDER');
    expect(roleForEmail('tech@wise2.net')).toBe('CUSTOMER');
  });
});
