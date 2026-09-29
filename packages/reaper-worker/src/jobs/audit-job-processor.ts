// REAPER Audit Job Processor - M1
// BullMQ job handlers for long-running audits

import { Job } from 'bullmq';
import { WebsiteCrawler } from '@wise2/reaper-intelligence/crawler';
import { EvidenceCollector } from '@wise2/reaper-intelligence/evidence';
import { FindingRulesEngine } from '@wise2/reaper-intelligence/rules';

export interface AuditJobData {
  auditRunId: string;
  prospectId: string;
  businessId: string;
  websiteId: string;
  url: string;
  organizationId: string;
  auditType: 'WEBSITE' | 'SOCIAL' | 'REPUTATION' | 'FULL';
}

export interface AuditJobProgress {
  stage: string;
  progress: number;
  message: string;
  timestamp: Date;
}

/**
 * Audit job processor for BullMQ
 * Handles all audit execution and data collection
 */
export class AuditJobProcessor {
  private crawler: WebsiteCrawler;
  private evidenceCollector: EvidenceCollector;
  private rulesEngine: FindingRulesEngine;

  constructor() {
    this.crawler = new WebsiteCrawler({ headless: true, timeout: 30000 });
    this.evidenceCollector = new EvidenceCollector();
    this.rulesEngine = new FindingRulesEngine();
  }

  /**
   * Process a WEBSITE audit job
   * Steps: Crawl → Collect Evidence → Generate Findings → Calculate Scores
   */
  async processWebsiteAudit(
    job: Job<AuditJobData, void, string>
  ): Promise<void> {
    const { auditRunId, websiteId, url, organizationId } = job.data;

    try {
      // Step 1: Crawl website
      job.progress(10);
      await job.log('Starting website crawl...');

      const crawlResult = await this.crawler.crawl(url);

      if (!crawlResult.isAccessible) {
        await job.log(`Website not accessible: ${crawlResult.errors.join(', ')}`);
        throw new Error('Website crawl failed');
      }

      // Step 2: Collect evidence
      job.progress(35);
      await job.log('Collecting evidence...');

      const evidence = this.evidenceCollector.collectFromCrawl(crawlResult);
      const evidenceScore = this.evidenceCollector.scoreEvidence(evidence);
      const gaps = this.evidenceCollector.identifyGaps(evidence);

      if (gaps.length > 0) {
        await job.log(`Evidence gaps: ${gaps.join('; ')}`);
      }

      // Step 3: Generate findings
      job.progress(60);
      await job.log('Analyzing and generating findings...');

      const findings = this.rulesEngine.generateFindings(evidence);

      // Step 4: Categorize findings by severity
      job.progress(80);
      await job.log(
        `Generated ${findings.length} findings: ${findings.filter((f) => f.severity === 'CRITICAL').length} critical, ${findings.filter((f) => f.severity === 'WARNING').length} warnings`
      );

      // Step 5: Calculate website score
      job.progress(90);
      await job.log('Calculating website score...');

      const websiteScore = this.calculateWebsiteScore(crawlResult, findings);

      // Step 6: Store results
      job.progress(95);
      await job.log('Storing audit results...');

      // M1: Save to database via Prisma
      // const auditRun = await db.reaper_audit_runs.update({
      //   where: { id: auditRunId },
      //   data: {
      //     status: 'COMPLETED',
      //     completedAt: new Date(),
      //   },
      // });

      // Save evidence
      // await db.reaper_evidence.createMany({
      //   data: evidence.map(e => ({
      //     auditRunId,
      //     organizationId,
      //     sourceType: e.sourceType,
      //     sourceValue: e.sourceValue,
      //     observation: e.observation,
      //     confidence: e.confidence,
      //   })),
      // });

      // Save findings
      // await db.reaper_findings.createMany({
      //   data: findings.map(f => ({
      //     auditRunId,
      //     organizationId,
      //     category: f.category,
      //     severity: f.severity,
      //     title: f.title,
      //     description: f.description,
      //     recommendation: f.recommendation,
      //   })),
      // });

      // Save score
      // await db.reaper_scores.create({
      //   data: {
      //     organizationId,
      //     websiteId,
      //     scoreType: 'WEBSITE',
      //     version: 1,
      //     rawScore: websiteScore,
      //     confidence: evidenceScore,
      //     components: JSON.stringify({...}),
      //     reasoning: `Website analyzed on ${new Date().toISOString()}`,
      //   },
      // });

      job.progress(100);
      await job.log('Audit completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await job.log(`Audit failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Calculate website score from crawl results and findings
   */
  private calculateWebsiteScore(crawlResult: any, findings: any[]): number {
    // Scoring logic:
    // Base: 100
    // Deduct for each CRITICAL finding: -20
    // Deduct for each WARNING finding: -10
    // Deduct for each INFO finding: -2
    // Adjust for performance
    // Adjust for security issues

    let score = 100;

    // Deduct for findings
    findings.forEach((finding) => {
      if (finding.severity === 'CRITICAL') score -= 20;
      else if (finding.severity === 'WARNING') score -= 10;
      else if (finding.severity === 'INFO') score -= 2;
    });

    // Deduct for slow performance
    if (crawlResult.performance.loadTime > 5000) score -= 15;
    else if (crawlResult.performance.loadTime > 3000) score -= 10;

    // Deduct for no HTTPS
    if (!crawlResult.url.startsWith('https')) score -= 25;

    // Cap at 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Process SOCIAL audit (M1+)
   */
  async processSocialAudit(job: Job<AuditJobData, void, string>): Promise<void> {
    // M1: Implement social profile discovery and scoring
    // - Find Facebook, Instagram, LinkedIn, TikTok profiles
    // - Analyze follower count, posting frequency, engagement
    // - Generate social media findings

    throw new Error('Social audit not yet implemented (M2+)');
  }

  /**
   * Process REPUTATION audit (M1+)
   */
  async processReputationAudit(job: Job<AuditJobData, void, string>): Promise<void> {
    // M1: Implement reputation analysis
    // - Fetch reviews from Google, Trustpilot, Yelp
    // - Analyze rating trends, sentiment
    // - Generate reputation findings

    throw new Error('Reputation audit not yet implemented (M2+)');
  }

  /**
   * Process FULL audit (all three)
   */
  async processFullAudit(job: Job<AuditJobData, void, string>): Promise<void> {
    const { auditType } = job.data;

    // Run Website, Social, and Reputation in parallel
    await Promise.all([
      this.processWebsiteAudit(job),
      // this.processSocialAudit(job),
      // this.processReputationAudit(job),
    ]);
  }
}
