export type AuditCategoryKey =
  | 'website'
  | 'brand'
  | 'crm'
  | 'communications'
  | 'sales'
  | 'reputation'
  | 'automation'
  | 'cloud'
  | 'payments'
  | 'operations'
  | 'mobileField'
  | 'aiReadiness';

export type AuditAnswerMap = Record<AuditCategoryKey, number>;

export interface AuditCategoryScore {
  key: AuditCategoryKey;
  label: string;
  score: number;
  explanation: string;
}

export interface RevenueLeak {
  category: AuditCategoryKey;
  title: string;
  priority: 'critical' | 'high' | 'medium';
  annualImpactEstimate: number;
  rationale: string;
}

export interface SolutionRecommendation {
  category: AuditCategoryKey;
  solution: string;
  rationale: string;
  priority: 'must-have' | 'recommended';
}

export interface AuditXRayResult {
  version: '2026-09-15';
  overallScore: number;
  categories: AuditCategoryScore[];
  revenueLeaks: RevenueLeak[];
  totalAnnualOpportunityEstimate: number;
  solutions: SolutionRecommendation[];
  summary: string;
}

const categoryConfig: Record<AuditCategoryKey, { label: string; solution: string; impact: number }> = {
  website: { label: 'Website / Digital Presence', solution: 'WISE² Web', impact: 12000 },
  brand: { label: 'Brand / Creative', solution: 'SenCere Creative', impact: 8000 },
  crm: { label: 'CRM / Customer Data', solution: 'WISE² CRM', impact: 18000 },
  communications: { label: 'AI Phone / Communications', solution: 'WISE² AI Phone', impact: 24000 },
  sales: { label: 'Lead Generation / Sales', solution: 'WISE² Sales Automation', impact: 22000 },
  reputation: { label: 'Reputation / Reviews', solution: 'WISE² Reputation', impact: 9000 },
  automation: { label: 'Automation / Workflow', solution: 'WISE² Automation', impact: 15000 },
  cloud: { label: 'Hosting / Cloud', solution: 'WISE² Cloud', impact: 7000 },
  payments: { label: 'Payments / Billing', solution: 'WISE² Payments', impact: 10000 },
  operations: { label: 'Operations', solution: 'WISE² Command Center', impact: 14000 },
  mobileField: { label: 'Mobile / Field Enablement', solution: 'WISE² Field OS', impact: 12000 },
  aiReadiness: { label: 'AI Readiness', solution: 'WISE² Context Engine', impact: 11000 },
};

const categoryKeys = Object.keys(categoryConfig) as AuditCategoryKey[];

function normalizeAnswer(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(4, value));
}

function categoryScore(value: number): number {
  return Math.round((normalizeAnswer(value) / 4) * 100);
}

export function scoreAudit(answers: AuditAnswerMap): Pick<AuditXRayResult, 'overallScore' | 'categories'> {
  const categories = categoryKeys.map((key) => {
    const score = categoryScore(answers[key]);
    return {
      key,
      label: categoryConfig[key].label,
      score,
      explanation:
        score >= 75
          ? 'Strong foundation; optimize and integrate.'
          : score >= 50
            ? 'Working foundation with measurable improvement opportunity.'
            : 'Material gap requiring consultant review and remediation.',
    } satisfies AuditCategoryScore;
  });

  const overallScore = Math.round(
    categories.reduce((total, category) => total + category.score, 0) / categories.length
  );

  return { overallScore, categories };
}

export function detectRevenueLeaks(answers: AuditAnswerMap): RevenueLeak[] {
  return categoryKeys
    .map((key) => {
      const score = categoryScore(answers[key]);
      if (score >= 75) return null;
      const severityMultiplier = (100 - score) / 100;
      const annualImpactEstimate = Math.round(categoryConfig[key].impact * severityMultiplier);
      const priority: RevenueLeak['priority'] = score <= 25 ? 'critical' : score <= 50 ? 'high' : 'medium';
      return {
        category: key,
        title: `${categoryConfig[key].label} opportunity`,
        priority,
        annualImpactEstimate,
        rationale: `${categoryConfig[key].label} scored ${score}/100; estimate is directional and must be validated with the client.`,
      } satisfies RevenueLeak;
    })
    .filter((leak): leak is RevenueLeak => Boolean(leak))
    .sort((a, b) => b.annualImpactEstimate - a.annualImpactEstimate);
}

export function mapWise2Solutions(answers: AuditAnswerMap): SolutionRecommendation[] {
  return categoryKeys
    .map((key) => {
      const score = categoryScore(answers[key]);
      if (score >= 75) return null;
      return {
        category: key,
        solution: categoryConfig[key].solution,
        rationale: `${categoryConfig[key].label} scored ${score}/100 and maps to ${categoryConfig[key].solution}.`,
        priority: score <= 25 ? 'must-have' : 'recommended',
      } satisfies SolutionRecommendation;
    })
    .filter((item): item is SolutionRecommendation => Boolean(item));
}

export function buildAuditXRay(answers: AuditAnswerMap): AuditXRayResult {
  const { overallScore, categories } = scoreAudit(answers);
  const revenueLeaks = detectRevenueLeaks(answers);
  const solutions = mapWise2Solutions(answers);
  const totalAnnualOpportunityEstimate = revenueLeaks.reduce(
    (total, leak) => total + leak.annualImpactEstimate,
    0
  );

  return {
    version: '2026-09-15',
    overallScore,
    categories,
    revenueLeaks,
    totalAnnualOpportunityEstimate,
    solutions,
    summary: `WISE² Business X-Ray score ${overallScore}/100 with ${revenueLeaks.length} measurable opportunity areas for consultant review.`,
  };
}
