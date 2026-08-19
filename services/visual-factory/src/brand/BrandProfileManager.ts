import { Logger } from 'winston';
import { CustomerBrandProfile } from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class BrandProfileManager {
  private basePath: string;
  private logger: Logger;
  private cache: Map<string, CustomerBrandProfile>;

  constructor(basePath: string, logger: Logger) {
    this.basePath = basePath;
    this.logger = logger;
    this.cache = new Map();
  }

  async loadBrandProfile(customerId: string, brandId: string): Promise<CustomerBrandProfile> {
    const cacheKey = `${customerId}:${brandId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const profilePath = path.join(this.basePath, 'tenants', customerId, brandId, 'brand.json');

    try {
      const content = await fs.readFile(profilePath, 'utf-8');
      const profile = JSON.parse(content) as CustomerBrandProfile;
      this.cache.set(cacheKey, profile);
      return profile;
    } catch (error) {
      this.logger.warn(`Brand profile not found: ${profilePath}`, error);
      // Return a default empty profile
      return this.getDefaultProfile(customerId, brandId);
    }
  }

  async saveBrandProfile(profile: CustomerBrandProfile): Promise<void> {
    const profileDir = path.join(this.basePath, 'tenants', profile.customerId, 'brand');
    const profilePath = path.join(profileDir, 'brand.json');

    try {
      await fs.mkdir(profileDir, { recursive: true });
      await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');

      // Update cache
      const cacheKey = `${profile.customerId}:${profile.brandName}`;
      this.cache.set(cacheKey, profile);

      this.logger.info(`Brand profile saved: ${profilePath}`);
    } catch (error) {
      this.logger.error(`Failed to save brand profile: ${profilePath}`, error);
      throw error;
    }
  }

  private getDefaultProfile(customerId: string, brandId: string): CustomerBrandProfile {
    return {
      customerId,
      brandName: brandId,
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#00FF00',
      },
      visualStyle: 'professional, premium, commercial',
      productReferences: [],
      styleReferences: [],
      negativePrompts: [],
      defaultAspectRatios: ['16:9', '4:3', '1:1'],
    };
  }

  getWISE2Profile(): CustomerBrandProfile {
    return {
      customerId: 'wise2-system',
      brandName: 'WISE²',
      colors: {
        primary: '#0a0a0a',
        secondary: '#1a1a2e',
        accent: '#00ff00',
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Courier New',
      },
      visualStyle:
        'dark black navy command center, premium technology aesthetic, chrome metallic WISE² treatment, neon green accents, controlled neon highlights, high contrast, cinematic depth, clean interface lighting, sharp premium commercial advertising quality, futuristic, strong central focal point, professional composition, premium product visualization',
      negativePrompts: [
        'cheap AI art',
        'generic cyberpunk clutter',
        'unreadable typography',
        'excessive neon',
        'poor anatomy',
        'warped logos',
        'fake text',
        'watermarks',
        'duplicate objects',
        'extra fingers',
      ],
      defaultAspectRatios: ['16:9', '1:1', '3:4'],
      websiteStyle:
        'minimalist, dark theme, premium, tech-forward, high contrast, clean spacing, professional layout',
      printStyle:
        'commercial print quality, sharp typography, professional layout, color-accurate, high DPI ready',
      socialStyle:
        'attention-grabbing, vibrant, mobile-optimized, strong contrast, clear focal point, 15-30 second visual impact',
      productReferences: [],
      styleReferences: [],
    };
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    this.logger.info('Brand profile cache cleared');
  }

  getCachedProfiles(): CustomerBrandProfile[] {
    return Array.from(this.cache.values());
  }
}
