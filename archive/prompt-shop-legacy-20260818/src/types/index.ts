export interface System {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tone' | 'style' | 'structure' | 'content' | 'personality';
}

export interface InfluenceMix {
  [systemId: string]: number;
}

export interface VisualDNA {
  lineStyle: 'sharp' | 'smooth' | 'organic';
  colorPalette: 'monochrome' | 'vibrant' | 'pastel' | 'neon';
  lighting: 'harsh' | 'soft' | 'ambient' | 'dramatic';
  texture: 'smooth' | 'rough' | 'detailed' | 'minimal';
  composition: 'centered' | 'asymmetric' | 'dynamic' | 'balanced';
  mood: 'serious' | 'playful' | 'professional' | 'creative';
  depth: 'flat' | 'layered' | '3d' | 'cinematic';
  blendStrength: number;
}

export interface Build {
  id: string;
  name: string;
  description?: string;
  systems: System[];
  influence: InfluenceMix;
  visualDNA: VisualDNA;
  promptText?: string;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isFavorite?: boolean;
  version?: number;
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  build: Build;
  creator: string;
  rating?: number;
  downloads?: number;
  price?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ForemanState {
  currentState: 'idle' | 'analyzing' | 'measuring' | 'adjusting' | 'welding' | 'approving' | 'error' | 'saving' | 'exporting' | 'coffee';
  message: string;
  isAnimating: boolean;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  systems: System[];
  price: number;
  discount?: number;
  rating?: number;
  creator?: string;
  preview?: string;
  tags?: string[];
  createdAt: Date;
}

export interface Cart {
  items: Pack[];
  total: number;
  discount?: number;
}
