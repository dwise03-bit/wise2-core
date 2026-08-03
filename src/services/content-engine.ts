/**
 * Content Engine
 * Automatically generates marketing content optimized for conversion
 */

import axios from 'axios';
import modelOrchestrator from './model-orchestrator';
import { TaskContext } from './model-orchestrator';

export type ContentType =
  | 'landing_page'
  | 'sales_page'
  | 'email_sequence'
  | 'sms_campaign'
  | 'blog_article'
  | 'product_description'
  | 'faq'
  | 'support_article';

interface ContentRequest {
  type: ContentType;
  topic: string;
  audience: string;
  businessModel: string;
  tone?: 'professional' | 'casual' | 'playful' | 'urgent';
  keywords?: string[];
  wordCount?: number;
  psychology?: {
    emotionalTriggers?: string[];
    objections?: string[];
    desiredOutcome?: string;
  };
}

interface GeneratedContent {
  type: ContentType;
  title: string;
  content: string;
  cta: {
    text: string;
    url?: string;
    urgency?: string;
  };
  seoOptimized: boolean;
  seoKeywords: string[];
  psychologyNotes: string[];
  estimatedReadTime: number;
  conversionHooks: string[];
  cost: number;
}

class ContentEngine {
  /**
   * Generate landing page content
   */
  async generateLandingPage(request: ContentRequest): Promise<GeneratedContent> {
    const prompt = this.buildLandingPagePrompt(request);
    const content = await this.generateWithOrchestrator(prompt, 'documentation');

    return {
      type: 'landing_page',
      title: `Landing Page: ${request.topic}`,
      content: content.response,
      cta: {
        text: 'Start Free Trial',
        urgency: 'Limited spots available',
      },
      seoOptimized: true,
      seoKeywords: request.keywords || [],
      psychologyNotes: [
        'Hook above fold',
        'Problem-focused',
        'Social proof included',
        'Strong CTA',
      ],
      estimatedReadTime: 3,
      conversionHooks: [
        'Problem statement (resonate)',
        'Breakthrough claim (hope)',
        'Proof elements (trust)',
        'Call to action (action)',
        'Scarcity/urgency (now)',
      ],
      cost: content.cost,
    };
  }

  /**
   * Generate sales page content
   */
  async generateSalesPage(request: ContentRequest): Promise<GeneratedContent> {
    const prompt = this.buildSalesPagePrompt(request);
    const content = await this.generateWithOrchestrator(prompt, 'documentation');

    return {
      type: 'sales_page',
      title: `Sales Page: ${request.topic}`,
      content: content.response,
      cta: {
        text: 'Buy Now',
        urgency: 'Only 3 left in stock',
      },
      seoOptimized: true,
      seoKeywords: request.keywords || [],
      psychologyNotes: [
        'Benefits-focused',
        'Objection handling',
        'Risk reversal',
        'Multiple CTAs',
      ],
      estimatedReadTime: 8,
      conversionHooks: [
        'Agitate the problem',
        'Solution narrative',
        'Feature to benefit mapping',
        'Testimonials/proof',
        'Money-back guarantee',
        'Urgency/scarcity',
      ],
      cost: content.cost,
    };
  }

  /**
   * Generate email sequence
   */
  async generateEmailSequence(request: ContentRequest): Promise<GeneratedContent[]> {
    const sequences = [
      { name: 'Welcome Email', template: 'welcome' },
      { name: 'Value Email #1', template: 'value' },
      { name: 'Value Email #2', template: 'value' },
      { name: 'Objection Handler', template: 'objection' },
      { name: 'Limited Offer', template: 'offer' },
    ];

    const emails: GeneratedContent[] = [];

    for (const sequence of sequences) {
      const prompt = this.buildEmailPrompt(request, sequence.template);
      const content = await this.generateWithOrchestrator(prompt, 'documentation');

      emails.push({
        type: 'email_sequence',
        title: `${sequence.name} - ${request.topic}`,
        content: content.response,
        cta: {
          text: 'Click here',
        },
        seoOptimized: false,
        seoKeywords: [],
        psychologyNotes: [
          'Personalization',
          'Emotional hook',
          'Clear benefit',
          'Single CTA',
        ],
        estimatedReadTime: 2,
        conversionHooks: [
          'Subject line hook',
          'Opening curiosity',
          'Core message',
          'Social proof',
          'Call to action',
        ],
        cost: content.cost,
      });
    }

    return emails;
  }

  /**
   * Generate blog article
   */
  async generateBlogArticle(request: ContentRequest): Promise<GeneratedContent> {
    const prompt = this.buildBlogPrompt(request);
    const content = await this.generateWithOrchestrator(prompt, 'documentation');

    return {
      type: 'blog_article',
      title: `Blog: ${request.topic}`,
      content: content.response,
      cta: {
        text: 'Learn More',
      },
      seoOptimized: true,
      seoKeywords: request.keywords || [],
      psychologyNotes: [
        'Authority building',
        'Educational value',
        'Searchable',
        'Shareable',
      ],
      estimatedReadTime: 5,
      conversionHooks: [
        'Curiosity headline',
        'Clear structure (H1-H3)',
        'Data/research',
        'Action items',
        'Internal link',
      ],
      cost: content.cost,
    };
  }

  /**
   * Generate product description
   */
  async generateProductDescription(request: ContentRequest): Promise<GeneratedContent> {
    const prompt = this.buildProductDescriptionPrompt(request);
    const content = await this.generateWithOrchestrator(prompt, 'documentation');

    return {
      type: 'product_description',
      title: `Product Description: ${request.topic}`,
      content: content.response,
      cta: {
        text: 'Add to Cart',
      },
      seoOptimized: true,
      seoKeywords: request.keywords || [],
      psychologyNotes: [
        'Benefits over features',
        'Transformation focus',
        'Objection handling',
        'Social proof',
      ],
      estimatedReadTime: 2,
      conversionHooks: [
        'Problem stated',
        'Solution demonstrated',
        'Benefits listed',
        'Proof/reviews',
        'Urgency (low stock)',
        'CTA button',
      ],
      cost: content.cost,
    };
  }

  /**
   * Generate FAQ page
   */
  async generateFAQ(request: ContentRequest): Promise<GeneratedContent> {
    const prompt = this.buildFAQPrompt(request);
    const content = await this.generateWithOrchestrator(prompt, 'documentation');

    return {
      type: 'faq',
      title: `FAQ: ${request.topic}`,
      content: content.response,
      cta: {
        text: 'Still have questions?',
      },
      seoOptimized: true,
      seoKeywords: request.keywords || [],
      psychologyNotes: [
        'Objection handling',
        'Trust building',
        'Clarification',
        'Ease concerns',
      ],
      estimatedReadTime: 4,
      conversionHooks: [
        'Top objections addressed',
        'Guarantees clarified',
        'Timeline explained',
        'Money-back guarantee details',
        'Contact info provided',
      ],
      cost: content.cost,
    };
  }

  /**
   * Private: Build landing page prompt
   */
  private buildLandingPagePrompt(request: ContentRequest): string {
    return `Create a high-converting landing page for: ${request.topic}

Target audience: ${request.audience}
Business model: ${request.businessModel}
Tone: ${request.tone || 'professional'}

Structure:
1. Hero section (headline + subheadline)
2. Problem statement (3 pain points)
3. Solution section (how it works)
4. Benefits (top 3 transformation results)
5. Social proof (testimonials, numbers)
6. FAQ (3 common objections)
7. Call to action (urgent, clear)
8. Trust signals (guarantee, security, etc)

${request.psychology ? `Psychological triggers to include: ${request.psychology.emotionalTriggers?.join(', ')}` : ''}

Requirements:
- Mobile-responsive structure
- Scannable format (short paragraphs)
- Emotional + logical appeals
- Multiple CTAs
- Clear value proposition above fold
- Urgency/scarcity element`;
  }

  /**
   * Private: Build sales page prompt
   */
  private buildSalesPagePrompt(request: ContentRequest): string {
    return `Create a persuasive sales page for: ${request.topic}

Target audience: ${request.audience}
Business model: ${request.businessModel}

Structure:
1. Headline (curiosity + benefit)
2. Subheadline (clarify promise)
3. Problem/pain agitation
4. Solution narrative
5. Features → benefits translation
6. Detailed benefits (8-12 items)
7. Objection handling section
8. Comparison chart (vs alternatives)
9. Testimonials + case studies
10. Limited offer section
11. Money-back guarantee
12. Final CTA (button + text)

${request.psychology ? `Emotional triggers: ${request.psychology.emotionalTriggers?.join(', ')}` : ''}

Focus on:
- Transformation promised
- Risk reversal
- Proof elements
- Urgency/scarcity
- Authority/credibility`;
  }

  /**
   * Private: Build email prompt
   */
  private buildEmailPrompt(
    request: ContentRequest,
    template: 'welcome' | 'value' | 'objection' | 'offer'
  ): string {
    const templates = {
      welcome: `Welcome email that:
- Introduces yourself/brand
- Sets expectations
- Provides immediate value
- Builds rapport
- Single clear CTA`,
      value: `Value email that:
- Solves a specific problem
- Educates or entertains
- Builds authority
- Weak CTA (soft sell)`,
      objection: `Objection-handling email that:
- Addresses common concerns
- Provides proof
- Guarantees safety
- Builds confidence`,
      offer: `Limited offer email that:
- Creates urgency (time/quantity)
- Reminds of benefits
- Strong CTA
- Scarcity language`,
    };

    return `Create ${templates[template]} for ${request.topic}

Audience: ${request.audience}
Tone: ${request.tone || 'conversational'}

Email requirements:
- Subject line (curiosity-driven)
- Body (2-3 short paragraphs)
- Single main CTA
- P.S. (optional urgency)
- Preview text optimized

${request.psychology ? `Emotional angle: ${request.psychology.emotionalTriggers?.[0]}` : ''}`;
  }

  /**
   * Private: Build blog prompt
   */
  private buildBlogPrompt(request: ContentRequest): string {
    return `Write a blog article about: ${request.topic}

Target audience: ${request.audience}
Business context: ${request.businessModel}
Target length: ${request.wordCount || 1200} words

Structure:
1. Compelling headline
2. Introduction (hook + what you'll learn)
3. 4-6 main sections with H2 headers
4. Key takeaways box
5. Call to action
6. Conclusion

SEO optimization:
- Primary keyword: ${request.keywords?.[0] || request.topic}
- Secondary keywords: ${request.keywords?.slice(1).join(', ')}
- Internal links: [2-3 to other pages]
- External links: [1-2 to authoritative sources]

Tone: ${request.tone || 'informative'}
Focus on value first, product second`;
  }

  /**
   * Private: Build product description prompt
   */
  private buildProductDescriptionPrompt(request: ContentRequest): string {
    return `Write a product description for: ${request.topic}

Target customer: ${request.audience}
Business model: ${request.businessModel}

Must include:
- Headline (benefit-focused)
- 2-3 sentence teaser
- Problem this solves
- How it works (transformation)
- Top benefits (3-5)
- Features (with benefit translation)
- Proof elements
- Guarantee/return policy
- Call to action

${request.psychology?.desiredOutcome ? `Customer's desired outcome: ${request.psychology.desiredOutcome}` : ''}

Psychology hooks:
- Transformation promise
- Social proof
- Scarcity/urgency
- Risk reversal
- Urgency (stock level)`;
  }

  /**
   * Private: Build FAQ prompt
   */
  private buildFAQPrompt(request: ContentRequest): string {
    return `Create FAQ for: ${request.topic}

Common objections to address:
${request.psychology?.objections?.map((o) => `- ${o}`).join('\n') || '- Price\n- Results timeline\n- Guarantee details'}

Each Q&A must:
- Address specific concern
- Build trust
- Reassure customer
- Support conversion

Format: 8-12 Q&A pairs

Include:
- "Will this work for me?"
- "How long until results?"
- "What if I'm not satisfied?"
- "Is it secure/safe?"
- "[Industry-specific concern]"

Tone: friendly, expert, reassuring`;
  }

  /**
   * Generate with Model Orchestrator
   */
  private async generateWithOrchestrator(
    prompt: string,
    category: any
  ): Promise<{ response: string; cost: number }> {
    try {
      const context: TaskContext = {
        category,
        complexity: 'medium',
        contextSize: 2000,
        latencySensitive: false,
        costSensitive: true, // Prefer free models for content
        quality: 'good',
      };

      const result = await modelOrchestrator.executeWithFallback(prompt, context);

      return {
        response: result.response,
        cost: result.cost,
      };
    } catch (error) {
      console.error('Content generation failed:', error);
      throw error;
    }
  }
}

export default new ContentEngine();
