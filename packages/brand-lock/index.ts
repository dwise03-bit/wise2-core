/**
 * WISE² Brand Lock System
 * Immutable registry of authentic brand assets with SHA-256 integrity protection
 */

export {
  type BrandName,
  type AssetType,
  type LockedAsset,
  type BrandRegistry,
  getLockedBrand,
  getLockedAsset,
  getAssetsByType,
  LOCKED_BRANDS,
  useLockedAssets,
} from './use-locked-assets';

export { default as registry } from './registry/authenticated-assets.json';
