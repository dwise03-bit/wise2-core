// REAPER Finding Rules Engine - M1
// Rule-based finding generation from evidence

import { Evidence } from '../evidence/evidence-collector';

export interface Finding {
  category: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  recommendation?: string;
  affectedArea: string;
  confidence: number;
}

export interface Rule {
  id: string;
  name: string;
  category: string;
  condition: (evidence: Evidence[]) => boolean;
  findingGenerator: (evidence: Evidence[]) => Finding | null;
}

/**
 * Rule-based finding generation engine
 * Converts evidence into actionable findings
 */
export class FindingRulesEngine {
  private rules: Map<string, Rule> = new Map();

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * Register a custom rule
   */
  registerRule(rule: Rule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Generate findings from evidence
   */
  generateFindings(evidence: Evidence[]): Finding[] {
    const findings: Finding[] = [];

    for (const rule of this.rules.values()) {
      if (rule.condition(evidence)) {
        const finding = rule.findingGenerator(evidence);
        if (finding) {
          findings.push(finding);
        }
      }
    }

    return findings.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  // ============================================================
  // DEFAULT RULES
  // ============================================================

  private registerDefaultRules(): void {
    // Rule 1: No contact form
    this.registerRule({
      id: 'no-contact-form',
      name: 'Missing Contact Form',
      category: 'CONVERSION',
      condition: (evidence) => {
        const contactFormEv = evidence.find((e) => e.sourceType === 'CONTACT_FORM');
        return contactFormEv?.sourceValue === 'false';
      },
      findingGenerator: (evidence) => ({
        category: 'CONVERSION',
        severity: 'WARNING',
        title: 'No Contact Form Detected',
        description:
          'Website does not have a contact form, making it difficult for visitors to reach out',
        recommendation:
          'Add a contact form to homepage or dedicated contact page to capture leads',
        affectedArea: 'Lead Capture',
        confidence: 85,
      }),
    });

    // Rule 2: No phone number
    this.registerRule({
      id: 'no-phone',
      name: 'Missing Phone Number',
      category: 'TRUST',
      condition: (evidence) => {
        const phoneEv = evidence.find((e) => e.sourceType === 'PHONE_LISTED');
        return phoneEv?.sourceValue === 'false';
      },
      findingGenerator: (evidence) => ({
        category: 'TRUST',
        severity: 'WARNING',
        title: 'No Phone Number Listed',
        description:
          'Website does not display a phone number, reducing trust and accessibility',
        recommendation:
          'Add phone number prominently in header or footer; include WhatsApp business link',
        affectedArea: 'Trust Signals',
        confidence: 90,
      }),
    });

    // Rule 3: No email address
    this.registerRule({
      id: 'no-email',
      name: 'Missing Email Address',
      category: 'TRUST',
      condition: (evidence) => {
        const emailEv = evidence.find((e) => e.sourceType === 'EMAIL_LISTED');
        return emailEv?.sourceValue === 'false';
      },
      findingGenerator: (evidence) => ({
        category: 'TRUST',
        severity: 'INFO',
        title: 'No Email Address Listed',
        description: 'Website does not display an email address',
        recommendation:
          'Add email address (support@, hello@, or contact@) to website',
        affectedArea: 'Accessibility',
        confidence: 85,
      }),
    });

    // Rule 4: Slow load time
    this.registerRule({
      id: 'slow-load-time',
      name: 'Slow Load Time',
      category: 'PERFORMANCE',
      condition: (evidence) => {
        const loadTimeEv = evidence.find((e) => e.sourceType === 'LOAD_TIME');
        if (!loadTimeEv) return false;
        const loadTime = parseInt(loadTimeEv.sourceValue);
        return loadTime > 3000; // > 3 seconds
      },
      findingGenerator: (evidence) => {
        const loadTimeEv = evidence.find((e) => e.sourceType === 'LOAD_TIME');
        const loadTime = loadTimeEv ? parseInt(loadTimeEv.sourceValue) : 0;

        return {
          category: 'PERFORMANCE',
          severity: loadTime > 5000 ? 'CRITICAL' : 'WARNING',
          title: `Slow Page Load (${loadTime}ms)`,
          description: `Website takes ${loadTime}ms to fully load, which impacts user experience and SEO`,
          recommendation:
            'Optimize images, minify CSS/JS, enable caching, use CDN, and consider async loading',
          affectedArea: 'Performance & SEO',
          confidence: 95,
        };
      },
    });

    // Rule 5: Not HTTPS
    this.registerRule({
      id: 'no-https',
      name: 'Not Using HTTPS',
      category: 'SECURITY',
      condition: (evidence) => {
        const httpsEv = evidence.find((e) => e.sourceType === 'HTTPS');
        return httpsEv?.sourceValue === 'false';
      },
      findingGenerator: (evidence) => ({
        category: 'SECURITY',
        severity: 'CRITICAL',
        title: 'Website Not Using HTTPS',
        description:
          'Website uses unencrypted HTTP, which is a major security risk and SEO penalty',
        recommendation:
          'Immediately migrate to HTTPS with valid SSL certificate (Let\'s Encrypt is free)',
        affectedArea: 'Security & SEO',
        confidence: 100,
      }),
    });

    // Rule 6: Low page count
    this.registerRule({
      id: 'low-page-count',
      name: 'Minimal Content',
      category: 'CONTENT',
      condition: (evidence) => {
        const pageCountEv = evidence.find((e) => e.sourceType === 'PAGE_COUNT');
        if (!pageCountEv) return false;
        const pageCount = parseInt(pageCountEv.sourceValue);
        return pageCount < 3;
      },
      findingGenerator: (evidence) => {
        const pageCountEv = evidence.find((e) => e.sourceType === 'PAGE_COUNT');
        const pageCount = pageCountEv ? parseInt(pageCountEv.sourceValue) : 0;

        return {
          category: 'CONTENT',
          severity: 'WARNING',
          title: `Minimal Content (${pageCount} pages)`,
          description:
            'Website has very few pages, limiting information availability and SEO potential',
          recommendation:
            'Create dedicated pages for services, team, blog, testimonials, and FAQ',
          affectedArea: 'Content & SEO',
          confidence: 80,
        };
      },
    });

    // Rule 7: No page title
    this.registerRule({
      id: 'missing-page-title',
      name: 'Missing Page Title',
      category: 'SEO',
      condition: (evidence) => {
        return !evidence.find((e) => e.sourceType === 'PAGE_TITLE');
      },
      findingGenerator: (evidence) => ({
        category: 'SEO',
        severity: 'WARNING',
        title: 'Missing or Generic Page Title',
        description: 'Page title is missing or does not describe content',
        recommendation:
          'Create descriptive, keyword-rich titles (50-60 characters) for all pages',
        affectedArea: 'SEO & Branding',
        confidence: 90,
      }),
    });
  }
}
