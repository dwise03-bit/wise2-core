export interface GPUInfo {
  model: string;
  vramTotal: number;
  vramFree: number;
  vramUsed: number;
  utilization: number;
  temperature: number;
  cudaAvailable: boolean;
  driverVersion: string;
}

export interface ModelInfo {
  name: string;
  type: 'checkpoint' | 'lora' | 'vae' | 'clip' | 'controlnet' | 'upscale';
  path: string;
  sizeGB: number;
  supportedWorkflows: string[];
  commercialUse: boolean;
  license: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'text-to-image' | 'image-edit' | 'image-variation' | 'upscale' | 'background-remove' | 'reference-driven';
  requiredNodes: string[];
  supportedModels: string[];
  defaultSettings: Record<string, any>;
  inputSchema: Record<string, any>;
}

export interface GenerationRequest {
  requestId: string;
  tenantId: string;
  customerId: string;
  brandId?: string;
  userId: string;
  type: 'text-to-image' | 'image-edit' | 'image-variation' | 'upscale' | 'background-remove' | 'reference-driven';
  prompt: string;
  negativePrompt?: string;
  referenceImages?: string[];
  width: number;
  height: number;
  aspectRatio?: string;
  steps: number;
  guidance: number;
  seed?: number;
  qualityTier: 'fast' | 'balanced' | 'quality';
  model?: string;
  workflowOverride?: Record<string, any>;
  stylePreset?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  priority: 'low' | 'normal' | 'high';
}

export interface GenerationJob {
  jobId: string;
  request: GenerationRequest;
  status: 'QUEUED' | 'PREPARING' | 'GENERATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  gpu?: string;
  vramUsed?: number;
  generationTime?: number;
  outputPath?: string;
  outputAssets: GeneratedAsset[];
  retriesLeft: number;
  logs: string[];
}

export interface GeneratedAsset {
  assetId: string;
  tenantId: string;
  customerId: string;
  jobId: string;
  type: 'image' | 'thumbnail' | 'variation';
  format: 'png' | 'jpg' | 'webp';
  path: string;
  width: number;
  height: number;
  sizeBytes: number;
  prompt: string;
  model: string;
  seed: number;
  generationTimeMs: number;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface CustomerBrandProfile {
  customerId: string;
  brandName: string;
  logoPath?: string;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
  visualStyle: string;
  ownerReference?: string;
  productReferences: string[];
  styleReferences: string[];
  negativePrompts: string[];
  defaultAspectRatios: string[];
  websiteStyle?: string;
  printStyle?: string;
  socialStyle?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  gpu: boolean;
  cuda: boolean;
  comfyui: boolean;
  mcp: boolean;
  model: string | null;
  storage: boolean;
  queue: boolean;
  database: boolean;
  checks: Record<string, any>;
  timestamp: Date;
}

export interface QueueStats {
  queued: number;
  preparing: number;
  generating: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageGenerationTime: number;
  totalJobsProcessed: number;
}

export interface ComfyUIConfig {
  binPath: string;
  workspacePath: string;
  port: number;
  host: string;
  modelsPath: string;
  outputPath: string;
  tmpPath: string;
  maxConcurrentJobs: number;
  defaultTimeout: number;
  gpuMemoryFraction: number;
}

export interface GenerationResult {
  success: boolean;
  jobId: string;
  assets: GeneratedAsset[];
  generationTime: number;
  model: string;
  seed: number;
  error?: string;
}
