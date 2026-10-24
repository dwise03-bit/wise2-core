import { AUDIT_CATEGORIES, calculateEvidenceScore, type EvidenceFinding } from './audit-evidence';

const complete: EvidenceFinding[] = AUDIT_CATEGORIES.map((category) => ({
  category, score: 80, source: 'https://example.com/evidence', observedAt: '2026-10-24T00:00:00Z',
  verifiedBy: 'auditor-1', status: 'VERIFIED',
}));

describe('calculateEvidenceScore', () => {
  it('does not score an intake without evidence', () => {
    expect(calculateEvidenceScore([])).toMatchObject({ score: null, status: 'UNSCORED', verifiedCategories: 0 });
  });
  it('requires all audit categories', () => {
    expect(calculateEvidenceScore(complete.slice(0, -1))).toMatchObject({ score: null, verifiedCategories: 7 });
  });
  it('calculates an equal-weight score from verified evidence', () => {
    expect(calculateEvidenceScore(complete)).toMatchObject({ score: 80, status: 'SCORED', verifiedCategories: 8 });
  });
  it('rejects unverified or unsupported findings', () => {
    const invalid = [{ ...complete[0], status: 'UNVERIFIED' as const }, { ...complete[1], score: 101 }];
    expect(calculateEvidenceScore([...complete.slice(2), ...invalid])).toMatchObject({ score: null, verifiedCategories: 6 });
  });
  it('does not let duplicate findings increase category weight', () => {
    expect(calculateEvidenceScore([...complete, { ...complete[0], score: 100 }]).score).toBe(81);
  });
});
