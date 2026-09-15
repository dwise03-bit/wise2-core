import {
  buildAuditXRay,
  detectRevenueLeaks,
  mapWise2Solutions,
  scoreAudit,
  type AuditAnswerMap,
} from '../consulting-audit';

const strongAnswers: AuditAnswerMap = {
  website: 4,
  brand: 4,
  crm: 4,
  communications: 4,
  sales: 4,
  reputation: 4,
  automation: 4,
  cloud: 4,
  payments: 4,
  operations: 4,
  mobileField: 4,
  aiReadiness: 4,
};

describe('WISE2 consultant audit engine', () => {
  test('scores each category on a 0-100 scale and computes the overall score', () => {
    const result = scoreAudit(strongAnswers);

    expect(result.overallScore).toBe(100);
    expect(result.categories).toHaveLength(12);
    expect(result.categories.every((category) => category.score === 100)).toBe(true);
  });

  test('clamps invalid answer values before calculating scores', () => {
    const result = scoreAudit({ ...strongAnswers, website: 9, crm: -5 });
    const website = result.categories.find((category) => category.key === 'website');
    const crm = result.categories.find((category) => category.key === 'crm');

    expect(website?.score).toBe(100);
    expect(crm?.score).toBe(0);
  });

  test('detects the largest revenue leaks first', () => {
    const result = detectRevenueLeaks({
      ...strongAnswers,
      communications: 0,
      sales: 1,
      automation: 0,
      reputation: 2,
    });

    expect(result[0].priority).toBe('critical');
    expect(result[0].annualImpactEstimate).toBeGreaterThan(0);
    expect(result.some((leak) => leak.category === 'communications')).toBe(true);
    expect(result.some((leak) => leak.category === 'automation')).toBe(true);
  });

  test('maps weak categories to WISE2 solution families', () => {
    const result = mapWise2Solutions({
      ...strongAnswers,
      crm: 0,
      communications: 0,
      automation: 1,
      cloud: 1,
    });

    expect(result.map((item) => item.solution)).toEqual(
      expect.arrayContaining(['WISE² CRM', 'WISE² AI Phone', 'WISE² Automation', 'WISE² Cloud'])
    );
  });

  test('builds one explainable xray object for web and future mobile clients', () => {
    const result = buildAuditXRay({
      ...strongAnswers,
      website: 2,
      crm: 1,
      communications: 0,
      automation: 1,
    });

    expect(result.version).toBe('2026-09-15');
    expect(result.overallScore).toBeLessThan(100);
    expect(result.revenueLeaks.length).toBeGreaterThan(0);
    expect(result.solutions.length).toBeGreaterThan(0);
    expect(result.summary).toContain('Business X-Ray');
  });
});
