/**
 * Evidence-backed business audit scoring.
 * Intake responses and AI suggestions must never be treated as verified findings.
 */
export const AUDIT_CATEGORIES = [
  'website', 'seo', 'security', 'operations', 'revenue', 'automation', 'brand', 'infrastructure',
] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];
export type EvidenceFinding = {
  category: AuditCategory;
  score: number;
  source: string;
  observedAt: string;
  verifiedBy: string;
  status: 'VERIFIED' | 'UNVERIFIED';
};
export type EvidenceScore = {
  score: number | null;
  status: 'SCORED' | 'UNSCORED';
  verifiedCategories: number;
  missingCategories: AuditCategory[];
};
export function calculateEvidenceScore(findings: readonly EvidenceFinding[]): EvidenceScore {
  const verified = new Map<AuditCategory, number[]>();
  for (const finding of findings) {
    if (finding.status !== 'VERIFIED') continue;
    if (!AUDIT_CATEGORIES.includes(finding.category)) continue;
    if (!finding.source.trim() || !finding.verifiedBy.trim()) continue;
    if (!Number.isFinite(finding.score) || finding.score < 0 || finding.score > 100) continue;
    if (!Number.isFinite(Date.parse(finding.observedAt))) continue;
    const scores = verified.get(finding.category) ?? [];
    scores.push(finding.score);
    verified.set(finding.category, scores);
  }
  const missingCategories = AUDIT_CATEGORIES.filter((category) => !verified.has(category));
  if (missingCategories.length) return { score: null, status: 'UNSCORED', verifiedCategories: verified.size, missingCategories };
  const categoryMeans = AUDIT_CATEGORIES.map((category) => {
    const scores = verified.get(category)!;
    return scores.reduce((sum, value) => sum + value, 0) / scores.length;
  });
  return {
    score: Math.round(categoryMeans.reduce((sum, value) => sum + value, 0) / categoryMeans.length),
    status: 'SCORED',
    verifiedCategories: verified.size,
    missingCategories: [],
  };
}
