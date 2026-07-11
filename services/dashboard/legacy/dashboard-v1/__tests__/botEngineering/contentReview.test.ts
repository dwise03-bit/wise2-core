/**
 * Content Review Engine Tests
 */

import { calculateRelevanceScore, getRelevanceCategory } from '@/lib/botEngineering/relevanceScorer';
import { analyzeSentiment, analyzeTone } from '@/lib/botEngineering/sentimentAnalyzer';
import { extractKeyPoints, extractImplications } from '@/lib/botEngineering/keyPointsExtractor';

describe('Content Review Engine', () => {
  describe('Relevance Scorer', () => {
    it('should score high relevance for 2nd Amendment articles', () => {
      const title = 'Supreme Court Upholds Second Amendment Rights';
      const content =
        'The Supreme Court today affirmed that the Second Amendment protects individual gun rights...';
      const score = calculateRelevanceScore(title, content);
      expect(score).toBeGreaterThan(0.7);
    });

    it('should score low relevance for non-2A articles', () => {
      const title = 'New Pizza Restaurant Opens Downtown';
      const content = 'A new Italian restaurant serves authentic pizzas in the downtown area...';
      const score = calculateRelevanceScore(title, content);
      expect(score).toBeLessThan(0.4);
    });

    it('should categorize relevance correctly', () => {
      expect(getRelevanceCategory(0.85)).toBe('HIGHLY_RELEVANT');
      expect(getRelevanceCategory(0.65)).toBe('RELEVANT');
      expect(getRelevanceCategory(0.45)).toBe('SOMEWHAT_RELEVANT');
      expect(getRelevanceCategory(0.25)).toBe('LOOSELY_RELATED');
      expect(getRelevanceCategory(0.1)).toBe('NOT_RELEVANT');
    });

    it('should boost score for credible sources', () => {
      const title = 'Gun Rights Discussion';
      const content = 'An article about constitutional rights...';
      const score1 = calculateRelevanceScore(title, content, 'Reuters');
      const score2 = calculateRelevanceScore(title, content, 'Unknown Blog');
      expect(score1).toBeGreaterThan(score2);
    });
  });

  describe('Sentiment Analyzer', () => {
    it('should detect positive sentiment for pro-2A content', () => {
      const title = 'Gun Rights Victory in Court';
      const content = 'The court upheld constitutional protections for firearm ownership...';
      const result = analyzeSentiment(title, content);
      expect(result.sentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect negative sentiment for anti-gun content', () => {
      const title = 'New Gun Control Legislation Passes';
      const content = 'Congress passed restrictions on firearm sales and ammunition purchases...';
      const result = analyzeSentiment(title, content);
      expect(result.sentiment).toBe('negative');
      expect(result.score).toBeLessThan(0);
    });

    it('should detect neutral sentiment for balanced reporting', () => {
      const title = 'Senate Debates Gun Policy';
      const content = 'According to reports, the Senate studied various perspectives on gun regulations...';
      const result = analyzeSentiment(title, content);
      expect(result.sentiment).toBe('neutral');
    });

    it('should analyze tone and bias correctly', () => {
      const positive = {
        title: 'Supreme Court Protects Gun Rights',
        content: 'Freedom and constitutional protections affirmed...',
      };
      const negative = {
        title: 'Deadly Gun Violence Crisis',
        content: 'Tragedy strikes again as attacks continue...',
      };

      const positiveTone = analyzeTone(positive.title, positive.content);
      expect(positiveTone.bias).toBe('pro-2a');

      const negativeTone = analyzeTone(negative.title, negative.content);
      expect(negativeTone.bias).toBe('anti-gun');
    });
  });

  describe('Key Points Extractor', () => {
    it('should extract key points from article', () => {
      const title = 'Supreme Court Rules on Second Amendment Case';
      const content =
        'In a landmark decision, the Supreme Court today ruled in favor of gun rights. The ruling affects millions of citizens. This decision overturns previous restrictions on firearm ownership.';
      const points = extractKeyPoints(title, content, 3);

      expect(points.length).toBeGreaterThan(0);
      expect(points.length).toBeLessThanOrEqual(3);
    });

    it('should identify court ruling key points', () => {
      const title = 'Court Strikes Down Gun Ban';
      const content = 'A federal court has struck down the ban on semiautomatic weapons...';
      const points = extractKeyPoints(title, content);

      const hasCourtPoint = points.some((p) => /court|ruling|decision/i.test(p));
      expect(hasCourtPoint).toBe(true);
    });

    it('should extract implications from article', () => {
      const title = 'Supreme Court Takes Up Second Amendment Case';
      const content = 'The Supreme Court will hear arguments about state restrictions on carry permits...';
      const implications = extractImplications(title, content, 'neutral');

      expect(implications.length).toBeGreaterThan(0);
      expect(implications.some((i) => /precedent|national/i.test(i))).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should handle complete review workflow', () => {
      const title = '2nd Amendment Victory: Appeals Court Upholds Gun Rights';
      const content = `
        In a significant decision, the federal appeals court today upheld constitutional protections
        for the right to bear arms. The ruling affirms that citizens have fundamental rights to own
        firearms. This victory for gun rights advocates comes after years of legal battles.
      `;

      const relevance = calculateRelevanceScore(title, content, 'AP News');
      const sentiment = analyzeSentiment(title, content);
      const keyPoints = extractKeyPoints(title, content);
      const implications = extractImplications(title, content, sentiment.sentiment);

      expect(relevance).toBeGreaterThan(0.7);
      expect(sentiment.sentiment).toBe('positive');
      expect(keyPoints.length).toBeGreaterThan(0);
      expect(implications.length).toBeGreaterThan(0);
    });
  });
});
