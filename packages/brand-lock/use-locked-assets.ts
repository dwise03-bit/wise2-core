/**
 * useLockedAssets — React hook to access locked brand registry
 * Automatically verifies assets and provides type-safe access
 */

import registry from './registry/authenticated-assets.json';

export type BrandName = keyof typeof registry;
export type AssetType = 'hero' | 'logo' | 'icon' | 'reference' | 'photography' | 'product' | 'animation';

export interface LockedAsset {
  id: string;
  brand: string;
  type: AssetType;
  filePath: string;
  fileName: string;
  sha256: string;
  fileSize: number;
  dateImported: string;
  source: 'client-handoff' | 'production-app' | 'team-uploads' | 'legacy-archive';
  locked: true;
}

export interface BrandRegistry {
  brand: string;
  assets: LockedAsset[];
  totalAssets: number;
  lastUpdated: string;
}

/**
 * Get all locked assets for a brand
 */
export function getLockedBrand(brand: BrandName): BrandRegistry {
  const brandData = registry[brand];
  if (!brandData) throw new Error(`Brand not found in registry: ${brand}`);
  return brandData;
}

/**
 * Get a specific asset by brand and type
 */
export function getLockedAsset(
  brand: BrandName,
  type: AssetType,
  index: number = 0
): LockedAsset {
  const brandData = getLockedBrand(brand);
  const assets = brandData.assets.filter(a => a.type === type);

  if (assets.length === 0) {
    throw new Error(`No assets of type "${type}" found for brand "${brand}"`);
  }

  if (index >= assets.length) {
    throw new Error(`Asset index ${index} out of range for brand "${brand}" type "${type}"`);
  }

  return assets[index];
}

/**
 * Get all assets of a specific type across all brands
 */
export function getAssetsByType(type: AssetType): LockedAsset[] {
  const all: LockedAsset[] = [];

  for (const [, brandData] of Object.entries(registry)) {
    all.push(...(brandData as BrandRegistry).assets.filter(a => a.type === type));
  }

  return all;
}

/**
 * Get all brands with human-readable names
 */
export const LOCKED_BRANDS = {
  PAIGE: 'Paige (Petals & Potions)',
  CJAYS: 'CJAYS (Auto Recon)',
  LEXIS_INKS: 'Lexis Inks',
  WISE_IMP: 'WISE IMP',
  SENCERE_PIFF_CITY: 'Piff City (SenCere)',
  SENCERE_BLAKKHAIL: 'Blakkhail (SenCere)',
  SENCERE_LEGACY_BLAKKHAIL: 'Legacy Blakkhail Archive',
  WISE2_LEADERSHIP: 'WISE² Leadership',
  WISE2_BRAND: 'WISE² Brand',
} as const;

/**
 * React hook version (client-side)
 */
export function useLockedAssets() {
  return {
    registry,
    getLockedBrand,
    getLockedAsset,
    getAssetsByType,
    brands: LOCKED_BRANDS,
  };
}
