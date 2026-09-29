// REAPER Evidence Collector - M1
// Converts raw crawl data into typed evidence

import { CrawlResult } from '../crawler/website-crawler';

export interface Evidence {
  sourceType: string;
  sourceValue: string;
  observation: string;
  confidence: number;
  timestamp: Date;
}

/**
 * Collects evidence from crawl results
 * Evidence is the raw material for finding generation
 */
export class EvidenceCollector {
  /**
   * Extract evidence from website crawl results
   */
  collectFromCrawl(crawlResult: CrawlResult): Evidence[] {
    const evidence: Evidence[] = [];

    // HTTP/Accessibility evidence
    evidence.push({
      sourceType: 'HTTP_STATUS',
      sourceValue: crawlResult.statusCode.toString(),
      observation: `Website returned HTTP ${crawlResult.statusCode}`,
      confidence: 100,
      timestamp: new Date(),
    });

    // Page count evidence
    evidence.push({
      sourceType: 'PAGE_COUNT',
      sourceValue: crawlResult.pages.length.toString(),
      observation: `Website has ${crawlResult.pages.length} crawlable pages`,
      confidence: 90,
      timestamp: new Date(),
    });

    // Contact form evidence
    const hasContactForm = crawlResult.pages.some((p) => p.hasContactForm);
    if (hasContactForm) {
      evidence.push({
        sourceType: 'CONTACT_FORM',
        sourceValue: 'true',
        observation: 'Website has a contact form on at least one page',
        confidence: 95,
        timestamp: new Date(),
      });
    } else {
      evidence.push({
        sourceType: 'CONTACT_FORM',
        sourceValue: 'false',
        observation: 'Website has no contact form detected',
        confidence: 70,
        timestamp: new Date(),
      });
    }

    // Phone evidence
    const hasPhone = crawlResult.pages.some((p) => p.hasPhone);
    evidence.push({
      sourceType: 'PHONE_LISTED',
      sourceValue: hasPhone ? 'true' : 'false',
      observation: hasPhone
        ? 'Website displays phone number'
        : 'No phone number found',
      confidence: 80,
      timestamp: new Date(),
    });

    // Email evidence
    const hasEmail = crawlResult.pages.some((p) => p.hasEmail);
    evidence.push({
      sourceType: 'EMAIL_LISTED',
      sourceValue: hasEmail ? 'true' : 'false',
      observation: hasEmail
        ? 'Website displays email address'
        : 'No email address found',
      confidence: 80,
      timestamp: new Date(),
    });

    // Performance evidence
    evidence.push({
      sourceType: 'LOAD_TIME',
      sourceValue: crawlResult.performance.loadTime.toString(),
      observation: `Website loads in ${crawlResult.performance.loadTime}ms`,
      confidence: 100,
      timestamp: new Date(),
    });

    // Mobile readiness evidence
    const hasMobileScreenshot = !!crawlResult.screenshots.mobile;
    evidence.push({
      sourceType: 'MOBILE_RESPONSIVE',
      sourceValue: hasMobileScreenshot ? 'detected' : 'unknown',
      observation: hasMobileScreenshot
        ? 'Mobile screenshot captured successfully'
        : 'Mobile responsiveness unknown',
      confidence: hasMobileScreenshot ? 85 : 50,
      timestamp: new Date(),
    });

    // SSL/HTTPS evidence
    const isHttps = crawlResult.url.startsWith('https');
    evidence.push({
      sourceType: 'HTTPS',
      sourceValue: isHttps ? 'true' : 'false',
      observation: isHttps
        ? 'Website uses HTTPS (secure)'
        : 'Website uses HTTP (not secure)',
      confidence: 100,
      timestamp: new Date(),
    });

    // Title/metadata evidence
    if (crawlResult.title) {
      evidence.push({
        sourceType: 'PAGE_TITLE',
        sourceValue: crawlResult.title,
        observation: `Page title indicates: ${crawlResult.title}`,
        confidence: 90,
        timestamp: new Date(),
      });
    }

    // Description evidence
    if (crawlResult.description) {
      evidence.push({
        sourceType: 'META_DESCRIPTION',
        sourceValue: crawlResult.description,
        observation: `Meta description: ${crawlResult.description}`,
        confidence: 85,
        timestamp: new Date(),
      });
    }

    return evidence;
  }

  /**
   * Score evidence based on quality and completeness
   */
  scoreEvidence(evidence: Evidence[]): number {
    if (evidence.length === 0) return 0;

    const totalConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0);
    const avgConfidence = totalConfidence / evidence.length;

    // Normalized to 0-100
    return Math.round(avgConfidence);
  }

  /**
   * Identify evidence gaps
   */
  identifyGaps(evidence: Evidence[]): string[] {
    const sourceTypes = new Set(evidence.map((e) => e.sourceType));
    const gaps: string[] = [];

    const expectedTypes = [
      'HTTP_STATUS',
      'PAGE_COUNT',
      'CONTACT_FORM',
      'PHONE_LISTED',
      'EMAIL_LISTED',
      'LOAD_TIME',
      'MOBILE_RESPONSIVE',
      'HTTPS',
    ];

    for (const type of expectedTypes) {
      if (!sourceTypes.has(type)) {
        gaps.push(`Missing evidence type: ${type}`);
      }
    }

    // Check for low-confidence evidence
    const lowConfidence = evidence.filter((e) => e.confidence < 70);
    if (lowConfidence.length > 0) {
      gaps.push(
        `${lowConfidence.length} evidence points have low confidence (<70%)`
      );
    }

    return gaps;
  }
}
