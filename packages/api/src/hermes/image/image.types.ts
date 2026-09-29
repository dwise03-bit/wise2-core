export type ImageAssetRole = 'LOCKED' | 'EDITABLE' | 'NEW';

export interface ImageReferenceAsset {
  id: string;
  url: string;
  role?: ImageAssetRole;
  kind?: 'person' | 'logo' | 'hardware' | 'screenshot' | 'approved-art' | 'other';
  label?: string;
}

export interface HermesImageRequest {
  instruction: string;
  references?: ImageReferenceAsset[];
  deliverToDiscord?: boolean;
  discordChannel?: 'builds' | 'alerts' | 'decisions' | 'images';
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
}

export interface HermesImageResult {
  jobId: string;
  status: 'completed' | 'failed';
  imageUrl?: string;
  provider?: string;
  lockedAssetIds: string[];
  instruction: string;
  error?: string;
}

export interface ImageProviderRequest {
  prompt: string;
  references: Array<{ id: string; url: string; role: ImageAssetRole; kind?: string }>;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
}

export interface ImageProviderResponse {
  imageUrl: string;
  provider: string;
  preservedReferenceIds?: string[];
  preservationGuaranteed?: boolean;
}
