import { buildProspectPayload, type IntakeSubmission } from '../intake-mapping';

function validSubmission(overrides: Partial<IntakeSubmission> = {}): IntakeSubmission {
  return {
    categoryId: 'website-build',
    contactName: 'Jordan Lee',
    email: 'jordan@example.com',
    answers: [
      { question: 'What are you trying to build or solve?', answer: 'A new marketing site for my studio.' },
      { question: 'Do you have anything in place already?', answer: 'Just a logo so far.' },
    ],
    ...overrides,
  };
}

describe('buildProspectPayload — conversational intake → prospect record', () => {
  it('maps a complete, valid submission into the expected prospect payload shape', () => {
    const result = buildProspectPayload(validSubmission());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.contactName).toBe('Jordan Lee');
    expect(result.payload.email).toBe('jordan@example.com');
    expect(result.payload.leadSource).toBe('wise-imp');
    expect(result.payload.tags).toEqual(['source:wise-imp', 'category:website-build']);
    expect(result.payload.primaryProblem).toBe('A new marketing site for my studio.');
  });

  it('defaults businessName to contactName when none is supplied', () => {
    const result = buildProspectPayload(validSubmission({ businessName: undefined }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.businessName).toBe('Jordan Lee');
  });

  it('uses a supplied businessName over contactName when present', () => {
    const result = buildProspectPayload(validSubmission({ businessName: 'Lee Studio' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.businessName).toBe('Lee Studio');
  });

  it('folds every Q&A pair into notes, in order, none dropped', () => {
    const result = buildProspectPayload(validSubmission());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.notes).toContain('Q: What are you trying to build or solve?');
    expect(result.payload.notes).toContain('A: A new marketing site for my studio.');
    expect(result.payload.notes).toContain('Q: Do you have anything in place already?');
    expect(result.payload.notes).toContain('A: Just a logo so far.');
  });

  it('trims whitespace from contact fields', () => {
    const result = buildProspectPayload(
      validSubmission({ contactName: '  Jordan Lee  ', email: '  jordan@example.com  ' }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.contactName).toBe('Jordan Lee');
    expect(result.payload.email).toBe('jordan@example.com');
  });

  it('rejects an unknown category id rather than silently mapping it through', () => {
    const result = buildProspectPayload(validSubmission({ categoryId: 'not-a-real-category' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/category/i);
  });

  it('rejects a missing contact name', () => {
    const result = buildProspectPayload(validSubmission({ contactName: '' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a missing email', () => {
    const result = buildProspectPayload(validSubmission({ email: '' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = buildProspectPayload(validSubmission({ email: 'not-an-email' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a submission with zero answers — nothing to build a lead record from', () => {
    const result = buildProspectPayload(validSubmission({ answers: [] }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/answers/i);
  });

  it('falls back to the category description as primaryProblem if the first answer is blank', () => {
    const result = buildProspectPayload(
      validSubmission({ answers: [{ question: 'What are you trying to build or solve?', answer: '   ' }] }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.primaryProblem.length).toBeGreaterThan(0);
    expect(result.payload.primaryProblem).not.toBe('   ');
  });
});
