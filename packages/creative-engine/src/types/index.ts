export enum GenerationType {
  IMAGE = 'image',
  VIDEO = 'video',
  IMAGE_TO_VIDEO = 'image_to_video',
  TEXT = 'text',
}

export enum BrandProfile {
  WISE2_CORE = 'wise2-core',
  WISE2_HVAC = 'wise2-hvac',
  WISE_DEFENSE = 'wise-defense',
  WISE2_SOUNDLAB = 'wise2-soundlab',
  WISE2_TRADING = 'wise2-trading',
}

export enum ProviderType {
  // Image
  KREA = 'krea',
  KLING = 'kling',
  HAILUO = 'hailuo',
  PIXVERSE = 'pixverse',
  PIKA = 'pika',
  OPENAI = 'openai',
  HIGGSFIELD = 'higgsfield',

  // Local
  COMFYUI = 'comfyui',
  LOCAL_DIFFUSION = 'local_diffusion',
}

export interface CreationRequest {
  id: string;
  type: GenerationType;
  brand: BrandProfile;
  prompt: string;
  style?: string;
  count?: number;
  duration?: number; // seconds, for video
  quality?: 'draft' | 'standard' | 'premium';
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface GenerationJob {
  id: string;
  request: CreationRequest;
  status: 'queued' | 'generating' | 'quality_check' | 'enhancing' | 'complete' | 'failed';
  progress: number; // 0-100
  provider: ProviderType;
  estimatedCost: number;
  actualCost: number;
  results: GenerationResult[];
  qualityScore: number;
  errors: string[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface GenerationResult {
  id: string;
  url: string;
  format: 'jpg' | 'png' | 'mp4' | 'webm';
  size: {
    width: number;
    height: number;
    duration?: number; // seconds
  };
  metadata: {
    model: string;
    provider: ProviderType;
    prompt: string;
    generatedAt: Date;
  };
}

export interface QualityEvaluation {
  score: number; // 0-100
  brandAccuracy: number;
  promptAdherence: number;
  textAccuracy: number;
  composition: number;
  consistency: number;
  photorealism: number;
  artifacts: boolean;
  logoAccuracy: number;
  commercial: boolean;
  feedback: string;
}

export interface ProviderCredits {
  provider: ProviderType;
  freeCredits: number;
  paidCredits: number;
  resetDate?: Date;
  lastUpdated: Date;
}

export interface CreditWallet {
  userId: string;
  totalFreeCredits: number;
  totalPaidCredits: number;
  monthlyCost: number;
  estimatedRetailValue: number;
  providers: ProviderCredits[];
  generationCount: number;
  successCount: number;
  failedCount: number;
  lastUpdated: Date;
}

export interface BrandAssets {
  brand: BrandProfile;
  logos: string[];
  referenceImages: string[];
  colors: string[];
  typography: string;
  approvedLayouts: string[];
  productReferences: string[];
  characterReferences: string[];
}

export interface ProviderAdapter {
  name: ProviderType;
  generateImage(request: ImageGenerationRequest): Promise<GenerationResult[]>;
  generateVideo(request: VideoGenerationRequest): Promise<GenerationResult[]>;
  imageToVideo(request: ImageToVideoRequest): Promise<GenerationResult[]>;
  getCredits(): Promise<ProviderCredits>;
  getStatus(): Promise<{ online: boolean; rateLimitRemaining?: number }>;
  estimateCost(request: CreationRequest): Promise<number>;
}

export interface ImageGenerationRequest extends CreationRequest {
  type: GenerationType.IMAGE;
  style: string;
  count: number;
}

export interface VideoGenerationRequest extends CreationRequest {
  type: GenerationType.VIDEO;
  duration: number;
}

export interface ImageToVideoRequest extends CreationRequest {
  type: GenerationType.IMAGE_TO_VIDEO;
  imageUrl: string;
  duration: number;
}
