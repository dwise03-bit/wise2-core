// REAPER Website Crawler - M1
// Playwright-based website analysis and content extraction

import { WebsiteData, WebsitePage } from '@wise2/reaper-domain';

export interface CrawlOptions {
  timeout?: number;
  headless?: boolean;
  userAgent?: string;
}

export interface CrawlResult {
  url: string;
  statusCode: number;
  isAccessible: boolean;
  title?: string;
  description?: string;
  pages: WebsitePage[];
  screenshots: {
    desktop?: string;
    mobile?: string;
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
  };
  errors: string[];
}

/**
 * Website crawler using Playwright (real implementation in M1)
 * M0 returns fixtures; M1 will use actual browser automation
 */
export class WebsiteCrawler {
  private timeout: number;
  private headless: boolean;
  private userAgent: string;

  constructor(options: CrawlOptions = {}) {
    this.timeout = options.timeout || 30000;
    this.headless = options.headless !== false;
    this.userAgent =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  /**
   * Crawl a website and extract key pages
   * M1: Implement with actual Playwright browser
   */
  async crawl(url: string): Promise<CrawlResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // M1: Actual implementation would use:
      // const browser = await chromium.launch({ headless: this.headless });
      // const page = await browser.newPage();
      // await page.goto(url, { waitUntil: 'networkidle' });

      // For M0, return fixture result
      return this.createFixtureResult(url, startTime);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : 'Unknown crawl error'
      );
      return this.createErrorResult(url, startTime, errors);
    }
  }

  /**
   * M1: Crawl specific page and extract content
   */
  async crawlPage(url: string, path: string = '/'): Promise<WebsitePage> {
    // M1: Use Playwright to fetch and analyze page
    // For M0, return fixture
    return {
      path,
      title: `Page: ${path}`,
      description: 'Sample page content',
      h1: `Welcome to ${path}`,
      content: 'This is sample page content for testing.',
      hasContactForm: path === '/contact',
      hasPhone: true,
      hasEmail: true,
    };
  }

  /**
   * M1: Capture desktop screenshot
   */
  async captureDesktopScreenshot(url: string): Promise<string> {
    // M1: Use Playwright to capture viewport 1920x1080
    // Return base64 encoded PNG
    return `screenshot-desktop-${Date.now()}`;
  }

  /**
   * M1: Capture mobile screenshot
   */
  async captureMobileScreenshot(url: string): Promise<string> {
    // M1: Use Playwright to capture viewport 375x667
    return `screenshot-mobile-${Date.now()}`;
  }

  /**
   * M1: Analyze page for accessibility issues
   */
  async analyzeAccessibility(url: string): Promise<{
    score: number;
    issues: string[];
  }> {
    // M1: Run axe-core or similar accessibility scanner
    return {
      score: 85,
      issues: [
        'Missing alt text on 3 images',
        'Low contrast ratio on button',
      ],
    };
  }

  /**
   * M1: Analyze page performance metrics
   */
  async analyzePerformance(url: string): Promise<{
    loadTime: number;
    domContentLoaded: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  }> {
    // M1: Use Playwright metrics
    return {
      loadTime: 2350,
      domContentLoaded: 1200,
      largestContentfulPaint: 1800,
      cumulativeLayoutShift: 0.05,
    };
  }

  // ============================================================
  // FIXTURE HELPERS (M0)
  // ============================================================

  private createFixtureResult(url: string, startTime: number): CrawlResult {
    const domain = new URL(url).hostname;
    const loadTime = Date.now() - startTime;

    return {
      url,
      statusCode: 200,
      isAccessible: true,
      title: `${domain} - Sample Website`,
      description: 'This is a fixture website for REAPER M0 testing',
      pages: [
        {
          path: '/',
          title: `${domain} - Home`,
          description: 'Home page',
          h1: `Welcome to ${domain}`,
          content: 'Homepage content for fixture',
          hasContactForm: false,
          hasPhone: true,
          hasEmail: true,
        },
        {
          path: '/contact',
          title: 'Contact Us',
          description: 'Contact page',
          h1: 'Get in Touch',
          content: 'Contact form and information',
          hasContactForm: true,
          hasPhone: true,
          hasEmail: true,
        },
        {
          path: '/services',
          title: 'Our Services',
          description: 'Services offered',
          h1: 'Services',
          content: 'Service descriptions',
          hasContactForm: false,
          hasPhone: false,
          hasEmail: false,
        },
      ],
      screenshots: {
        desktop: `data:image/png;base64,fixture-desktop-${Date.now()}`,
        mobile: `data:image/png;base64,fixture-mobile-${Date.now()}`,
      },
      performance: {
        loadTime,
        domContentLoaded: Math.round(loadTime * 0.6),
      },
      errors: [],
    };
  }

  private createErrorResult(
    url: string,
    startTime: number,
    errors: string[]
  ): CrawlResult {
    return {
      url,
      statusCode: 0,
      isAccessible: false,
      pages: [],
      screenshots: {},
      performance: {
        loadTime: Date.now() - startTime,
        domContentLoaded: 0,
      },
      errors,
    };
  }
}
