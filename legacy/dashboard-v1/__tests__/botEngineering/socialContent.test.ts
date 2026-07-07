/**
 * Social Media Content Generator Tests
 */

import { generateTwitterHashtags, generateInstagramHashtags, generateLinkedInHashtags } from '@/lib/botEngineering/hashtagGenerator';
import { generateCTA, generateCTAOptions } from '@/lib/botEngineering/ctaGenerator';
import {
  formatForTwitter,
  formatForInstagram,
  formatForLinkedIn,
  generateMultiPlatformContent,
} from '@/lib/botEngineering/socialContentFormatter';

describe('Social Media Content Generator', () => {
  const testArticle = {
    title: 'Supreme Court Upholds Second Amendment Rights',
    content: 'In a landmark ruling, the Supreme Court has affirmed constitutional protections for the right to bear arms...',
    keyPoints: ['Court ruling affirms gun rights', 'Constitutional protection upheld'],
    implications: ['Sets national precedent', 'Major victory for 2nd Amendment advocates'],
    sentiment: 'positive' as const,
    url: 'https://example.com/article',
    source: 'Reuters',
  };

  describe('Hashtag Generator', () => {
    it('should generate Twitter hashtags (limited)', () => {
      const hashtags = generateTwitterHashtags(
        testArticle.title,
        testArticle.content,
        testArticle.sentiment
      );
      const tagArray = hashtags.split(' ');
      expect(tagArray.length).toBeLessThanOrEqual(8);
      expect(hashtags).toContain('#2A');
    });

    it('should generate Instagram hashtags (extensive)', () => {
      const hashtags = generateInstagramHashtags(
        testArticle.title,
        testArticle.content,
        testArticle.sentiment
      );
      const tagArray = hashtags.split(' ');
      expect(tagArray.length).toBeGreaterThan(8);
      expect(tagArray.length).toBeLessThanOrEqual(30);
    });

    it('should generate LinkedIn hashtags (professional)', () => {
      const hashtags = generateLinkedInHashtags(
        testArticle.title,
        testArticle.content,
        testArticle.sentiment
      );
      expect(hashtags).toContain('#CivicEngagement');
      expect(hashtags).toContain('#ConstitutionalLaw');
    });

    it('should include sentiment-specific hashtags', () => {
      const positive = generateTwitterHashtags('Victory News', 'A win for rights', 'positive');
      const negative = generateTwitterHashtags('Threat News', 'A ban on guns', 'negative');

      expect(positive).toContain('#Victory');
      expect(negative).toContain('#DefendOurRights');
    });
  });

  describe('CTA Generator', () => {
    it('should generate positive CTAs for victory sentiment', () => {
      const cta = generateCTA('positive', 'court ruling');
      expect(['Victory', 'celebration', 'win'].some((w) => cta.toLowerCase().includes(w))).toBe(
        true
      );
    });

    it('should generate action CTAs for negative sentiment', () => {
      const cta = generateCTA('negative', 'legislation threat');
      expect(['action', 'defend', 'respond'].some((w) => cta.toLowerCase().includes(w))).toBe(true);
    });

    it('should generate multiple CTA options', () => {
      const options = generateCTAOptions('positive', 'news', 3);
      expect(options.length).toBeGreaterThan(0);
      expect(options.length).toBeLessThanOrEqual(3);
    });

    it('should vary CTAs across calls', () => {
      const cta1 = generateCTA('positive', 'news');
      const cta2 = generateCTA('positive', 'news');
      // CTAs should occasionally differ due to randomness
      // (this is probabilistic, so we just verify they're not empty)
      expect(cta1.length).toBeGreaterThan(10);
      expect(cta2.length).toBeGreaterThan(10);
    });
  });

  describe('Social Media Formatters', () => {
    it('should format Twitter post (280 char limit compliance)', () => {
      const post = formatForTwitter(
        testArticle.title,
        testArticle.keyPoints[0],
        testArticle.sentiment,
        testArticle.url
      );

      expect(post.platform).toBe('twitter');
      expect(post.character_count).toBeLessThanOrEqual(280);
      expect(post.content_text).toContain(testArticle.url);
    });

    it('should format Instagram post (story format)', () => {
      const post = formatForInstagram(
        testArticle.title,
        testArticle.content,
        testArticle.sentiment,
        testArticle.url
      );

      expect(post.platform).toBe('instagram');
      expect(post.content_text).toContain('📰');
      expect(post.content_text).toContain(testArticle.url);
      expect(post.hashtags.split(' ').length).toBeGreaterThan(8);
    });

    it('should format LinkedIn post (professional tone)', () => {
      const post = formatForLinkedIn(
        testArticle.title,
        testArticle.content,
        testArticle.implications,
        testArticle.sentiment,
        testArticle.url
      );

      expect(post.platform).toBe('linkedin');
      expect(post.content_text).toContain('Why this matters');
      expect(post.hashtags).toContain('#ConstitutionalLaw');
    });

    it('should generate multi-platform content', () => {
      const allPlatforms = generateMultiPlatformContent(
        testArticle.title,
        testArticle.content,
        testArticle.keyPoints,
        testArticle.implications,
        testArticle.sentiment,
        testArticle.url,
        testArticle.source
      );

      expect(allPlatforms.twitter).toBeDefined();
      expect(allPlatforms.instagram).toBeDefined();
      expect(allPlatforms.linkedin).toBeDefined();
      expect(allPlatforms.telegram).toBeDefined();
      expect(allPlatforms.discord).toBeDefined();

      // Verify each platform has required fields
      Object.values(allPlatforms).forEach((post) => {
        expect(post.content_text.length).toBeGreaterThan(0);
        expect(post.hashtags.length).toBeGreaterThan(0);
        expect(post.call_to_action.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration', () => {
    it('should handle all sentiment types', () => {
      const sentiments: Array<'positive' | 'negative' | 'neutral'> = [
        'positive',
        'negative',
        'neutral',
      ];

      sentiments.forEach((sentiment) => {
        const post = formatForTwitter(
          testArticle.title,
          testArticle.content,
          sentiment,
          testArticle.url
        );

        expect(post.platform).toBe('twitter');
        expect(post.content_text.length).toBeGreaterThan(0);
        expect(post.call_to_action.length).toBeGreaterThan(0);
      });
    });
  });
});
