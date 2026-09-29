// REAPER Provider Interfaces - M0 Foundation
// All providers are swappable; start with fixtures for M0

export interface WebsiteData {
  url: string;
  title?: string;
  description?: string;
  domain: string;
  statusCode: number;
  isAccessible: boolean;
}

export interface WebsitePage {
  path: string;
  title?: string;
  description?: string;
  h1?: string;
  content: string;
  hasContactForm: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
}

export interface SearchResult {
  businessName: string;
  website?: string;
  address?: string;
  phone?: string;
  description?: string;
  confidence: number;
}

export interface Provider {
  name: string;
  isAvailable(): Promise<boolean>;
}

export interface WebsiteProvider extends Provider {
  fetchWebsite(url: string): Promise<WebsiteData>;
  fetchPage(url: string, path: string): Promise<WebsitePage>;
  captureScreenshot(url: string, viewport: 'desktop' | 'mobile'): Promise<string>;
}

export interface SearchProvider extends Provider {
  search(query: string): Promise<SearchResult[]>;
}

export interface ReviewProvider extends Provider {
  fetchReviews(businessName: string, location?: string): Promise<{
    averageRating: number;
    reviewCount: number;
    recentReviews: Array<{ rating: number; text: string; date: Date }>;
  }>;
}

export interface SocialProvider extends Provider {
  findProfiles(businessName: string): Promise<Array<{
    platform: string;
    url: string;
    followers?: number;
  }>>;
}

// Fixture implementations for M0
export class FixtureWebsiteProvider implements WebsiteProvider {
  name = 'fixture-website';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async fetchWebsite(url: string): Promise<WebsiteData> {
    const domain = new URL(url).hostname;
    return {
      url,
      title: `${domain} - Sample Site`,
      description: 'This is a fixture website for testing',
      domain,
      statusCode: 200,
      isAccessible: true,
    };
  }

  async fetchPage(url: string, path: string): Promise<WebsitePage> {
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

  async captureScreenshot(url: string, viewport: 'desktop' | 'mobile'): Promise<string> {
    return `screenshot-${viewport}-${Date.now()}`;
  }
}

export class FixtureSearchProvider implements SearchProvider {
  name = 'fixture-search';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async search(query: string): Promise<SearchResult[]> {
    return [
      {
        businessName: query,
        website: `https://${query.toLowerCase().replace(/\s+/g, '-')}.com`,
        address: '123 Main Street, Springfield, IL 62701',
        phone: '(555) 123-4567',
        description: `Fixture result for: ${query}`,
        confidence: 85,
      },
    ];
  }
}

export class FixtureReviewProvider implements ReviewProvider {
  name = 'fixture-reviews';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async fetchReviews(
    businessName: string,
    location?: string
  ): Promise<{
    averageRating: number;
    reviewCount: number;
    recentReviews: Array<{ rating: number; text: string; date: Date }>;
  }> {
    return {
      averageRating: 4.5,
      reviewCount: 23,
      recentReviews: [
        {
          rating: 5,
          text: 'Great service! Would recommend.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          rating: 4,
          text: 'Good experience overall.',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      ],
    };
  }
}

export class FixtureSocialProvider implements SocialProvider {
  name = 'fixture-social';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async findProfiles(businessName: string): Promise<
    Array<{
      platform: string;
      url: string;
      followers?: number;
    }>
  > {
    return [
      {
        platform: 'Facebook',
        url: `https://facebook.com/${businessName.toLowerCase().replace(/\s+/g, '')}`,
        followers: 1250,
      },
      {
        platform: 'Instagram',
        url: `https://instagram.com/${businessName.toLowerCase().replace(/\s+/g, '')}`,
        followers: 850,
      },
    ];
  }
}

// Provider registry
export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();

  register(provider: Provider): void {
    this.providers.set(provider.name, provider);
  }

  get<T extends Provider>(name: string): T | undefined {
    return this.providers.get(name) as T | undefined;
  }

  getWebsiteProvider(): WebsiteProvider {
    return this.get<WebsiteProvider>('website') || new FixtureWebsiteProvider();
  }

  getSearchProvider(): SearchProvider {
    return this.get<SearchProvider>('search') || new FixtureSearchProvider();
  }

  getReviewProvider(): ReviewProvider {
    return this.get<ReviewProvider>('reviews') || new FixtureReviewProvider();
  }

  getSocialProvider(): SocialProvider {
    return this.get<SocialProvider>('social') || new FixtureSocialProvider();
  }
}

// Global registry (will be dependency-injected in production)
export const defaultRegistry = new ProviderRegistry();
defaultRegistry.register(new FixtureWebsiteProvider());
defaultRegistry.register(new FixtureSearchProvider());
defaultRegistry.register(new FixtureReviewProvider());
defaultRegistry.register(new FixtureSocialProvider());
