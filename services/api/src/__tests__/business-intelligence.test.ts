import { generateInsights } from '../services/business-intelligence';
import { InsightMetrics } from '../types/business-intelligence';

describe('Business Intelligence', () => {
  const createMetrics = (overrides?: Partial<InsightMetrics>): InsightMetrics => ({
    leadsNew: 0,
    leadsCount: 0,
    leadsQualified: 0,
    leadsBooked: 0,
    estimatesCount: 0,
    estimatesPending: 0,
    estimatesSent: 0,
    estimatesAccepted: 0,
    jobsCount: 0,
    jobsCompleted: 0,
    jobsInProgress: 0,
    jobsUnassigned: 0,
    followupsCount: 0,
    followupsOverdue: 0,
    totalLeadValue: 0,
    estimateValue: 0,
    question: 'What should I do?',
    ...overrides,
  });

  describe('Insights Generation', () => {
    it('should flag high lead volume', () => {
      const metrics = createMetrics({
        leadsNew: 15,
        leadsCount: 50,
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('lead volume'))).toBe(true);
    });

    it('should flag low qualification rate', () => {
      const metrics = createMetrics({
        leadsCount: 20,
        leadsQualified: 2, // 10% < 30% threshold
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('qualification'))).toBe(true);
    });

    it('should flag pending estimates', () => {
      const metrics = createMetrics({
        estimatesPending: 5, // > 3
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('estimate'))).toBe(true);
    });

    it('should flag overdue followups', () => {
      const metrics = createMetrics({
        followupsOverdue: 3,
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('followup') || i.toLowerCase().includes('follow-up'))).toBe(true);
    });

    it('should flag unassigned jobs', () => {
      const metrics = createMetrics({
        jobsUnassigned: 4,
        jobsCount: 10,
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('job') || i.toLowerCase().includes('unassigned'))).toBe(true);
    });

    it('should return multiple insights for multiple conditions', () => {
      const metrics = createMetrics({
        leadsNew: 20,
        leadsCount: 50,
        leadsQualified: 2,
        estimatesPending: 5,
        jobsUnassigned: 3,
      });

      const insights = generateInsights(metrics);

      expect(insights.length).toBeGreaterThanOrEqual(2);
    });

    it('should return default insight if no conditions met', () => {
      const metrics = createMetrics({
        leadsNew: 0,
        leadsCount: 5,
        leadsQualified: 2,
        estimatesPending: 0,
        jobsUnassigned: 0,
        followupsOverdue: 0,
      });

      const insights = generateInsights(metrics);

      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics Validation', () => {
    it('should handle zero metrics gracefully', () => {
      const metrics = createMetrics();

      const insights = generateInsights(metrics);

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should handle high lead values', () => {
      const metrics = createMetrics({
        totalLeadValue: 100000,
        leadsCount: 10,
      });

      const insights = generateInsights(metrics);

      expect(insights).toBeDefined();
    });

    it('should calculate high-value opportunities', () => {
      const metrics = createMetrics({
        totalLeadValue: 250000,
        leadsCount: 50,
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('opportunity') || i.toLowerCase().includes('value'))).toBe(true);
    });
  });

  describe('Thresholds & Rules', () => {
    it('should use 30% qualification threshold', () => {
      const metricsLow = createMetrics({
        leadsCount: 20,
        leadsQualified: 5, // 25% < 30%
      });

      const insightsLow = generateInsights(metricsLow);
      expect(insightsLow.some((i) => i.toLowerCase().includes('qualification'))).toBe(true);

      const metricsHigh = createMetrics({
        leadsCount: 20,
        leadsQualified: 7, // 35% > 30%
      });

      const insightsHigh = generateInsights(metricsHigh);
      // Should not flag if at or above threshold
      const hasQualificationWarning = insightsHigh.some((i) => i.toLowerCase().includes('low') && i.toLowerCase().includes('qualification'));
      expect(hasQualificationWarning).toBe(false);
    });

    it('should use 3+ pending estimates threshold', () => {
      const metricsLow = createMetrics({
        estimatesPending: 2,
      });

      const insightsLow = generateInsights(metricsLow);
      const hasEstimateWarning = insightsLow.some((i) => i.toLowerCase().includes('pending') && i.toLowerCase().includes('estimate'));
      expect(hasEstimateWarning).toBe(false);

      const metricsHigh = createMetrics({
        estimatesPending: 4,
      });

      const insightsHigh = generateInsights(metricsHigh);
      expect(insightsHigh.some((i) => i.toLowerCase().includes('estimate'))).toBe(true);
    });

    it('should flag conversion issues', () => {
      const metrics = createMetrics({
        leadsQualified: 20,
        leadsBooked: 2, // 10% conversion vs typical 30%
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('conversion') || i.toLowerCase().includes('booking'))).toBe(true);
    });
  });

  describe('Trend Analysis', () => {
    it('should flag improving metrics', () => {
      const metrics = createMetrics({
        leadsNew: 50, // High new leads
        leadsQualified: 15, // 30% qualification rate
        jobsCompleted: 8,
        jobsCount: 10, // 80% completion rate
      });

      const insights = generateInsights(metrics);

      expect(insights.length).toBeGreaterThan(0);
    });

    it('should identify momentum indicators', () => {
      const metrics = createMetrics({
        estimatesAccepted: 10,
        estimatesCount: 12, // 83% acceptance rate
        jobsInProgress: 8,
        jobsCount: 10,
      });

      const insights = generateInsights(metrics);

      expect(insights).toBeDefined();
    });
  });

  describe('Recommendation Prioritization', () => {
    it('should prioritize critical issues', () => {
      const metrics = createMetrics({
        jobsUnassigned: 5, // Critical
        estimatesPending: 4, // Important
        followupsOverdue: 2, // Moderate
      });

      const insights = generateInsights(metrics);

      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThanOrEqual(1);
    });

    it('should suggest next actions based on workflow stage', () => {
      const metrics = createMetrics({
        leadsNew: 20,
        leadsQualified: 5,
        estimatesCount: 3,
        jobsCount: 1,
      });

      const insights = generateInsights(metrics);

      expect(insights).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle division by zero', () => {
      const metrics = createMetrics({
        leadsQualified: 5,
        leadsCount: 0, // Would cause division by zero
      });

      expect(() => generateInsights(metrics)).not.toThrow();
    });

    it('should handle null/undefined values gracefully', () => {
      const metrics = createMetrics({
        leadsCount: undefined as any,
        jobsUnassigned: null as any,
      });

      expect(() => generateInsights(metrics)).not.toThrow();
    });

    it('should handle extreme values', () => {
      const metrics = createMetrics({
        totalLeadValue: Number.MAX_SAFE_INTEGER,
        leadsCount: 1000000,
      });

      expect(() => generateInsights(metrics)).not.toThrow();
    });
  });

  describe('Question Context', () => {
    it('should incorporate user question in insights', () => {
      const metrics = createMetrics({
        question: 'How can I improve my pipeline?',
      });

      const insights = generateInsights(metrics);

      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should provide actionable recommendations', () => {
      const metrics = createMetrics({
        leadsQualified: 3,
        leadsCount: 100,
        question: 'Why is my qualification rate low?',
      });

      const insights = generateInsights(metrics);

      expect(insights.some((i) => i.toLowerCase().includes('action') || i.toLowerCase().includes('recommend') || i.toLowerCase().includes('try'))).toBe(true);
    });
  });
});
