/**
 * WISE² Commerce System Types
 * Core data structures for AI-powered ecommerce business building
 */

// Business Models
export type BusinessModel =
  | 'subscription'
  | 'dropshipping'
  | 'pod'
  | 'digital'
  | 'hybrid'
  | 'wholesale'
  | 'private_label'
  | 'service'
  | 'ai_generated';

// Business Status
export type BusinessStatus =
  | 'idea'
  | 'researching'
  | 'validating'
  | 'building'
  | 'launching'
  | 'live'
  | 'scaling'
  | 'optimizing';

// Agent Status
export type AgentStatus =
  | 'idle'
  | 'working'
  | 'complete'
  | 'waiting_approval'
  | 'error';

// Core Business Entity
export interface Commerce {
  id: string;
  workspaceId: string;
  userId: string;

  // Basic Info
  businessName: string;
  businessModel: BusinessModel;
  status: BusinessStatus;

  // Branding
  brandName?: string;
  brandVoice?: string;
  tagline?: string;
  mission?: string;

  // Market
  targetAudience?: string;
  problemSolution?: string;
  competitiveAdvantage?: string;

  // Financial
  budget?: number;
  targetRevenueMonthly?: number;
  targetMargin?: number;

  // Timeline
  launchDate?: Date;
  timeline?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAgentRun?: Date;
}

// Questionnaire Response
export interface CommerceQuestionnaire {
  businessModel: BusinessModel;
  targetAudience: string;
  problemSolution: string;
  budget?: number;
  timeline?: string;
  existingBrand?: boolean;
  revenueGoal?: number;
  profitGoal?: number;
  lookingFor?: 'passive_income' | 'active_management';
  competitiveAdvantage?: string;
}

// Market Research
export interface MarketResearch {
  id: string;
  commerceId: string;

  topic: string;
  targetAudience?: string;

  trends: string[];
  underservedMarkets: string[];
  demandScore: number; // 0-100
  estimatedTAM: number;
  competitionLevel: 'low' | 'medium' | 'high' | 'very_high';
  recurringOpportunities: string[];

  recommendation: string;
  status: AgentStatus;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Competitor Analysis
export interface Competitor {
  name: string;
  positioning: string;
  pricing: string;
  offers: string[];
  strengths: string[];
  weaknesses: string[];
  website?: string;
  socialFollowing?: number;
}

export interface CompetitorAnalysis {
  id: string;
  commerceId: string;

  niche: string;
  competitors: Competitor[];

  competitiveAdvantages: string[];
  marketGaps: string[];
  opportunities: string[];

  recommendation: string;
  status: AgentStatus;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Customer Avatar
export interface CustomerAvatar {
  name: string;
  demographics: string;
  psychographics: string;
  painPoints: string[];
  desires: string[];
  fears: string[];
  buyingMotivations: string[];
  objections: string[];
}

export interface CustomerPsychology {
  id: string;
  commerceId: string;

  primaryAvatar: CustomerAvatar;
  secondaryAvatar?: CustomerAvatar;

  emotionalTriggers: string[];
  transformationGoals: string[];

  messagingFramework: string;
  headlineFormula: string;
  ctaFramework: string;

  status: AgentStatus;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Brand
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  palette: string[];
}

export interface BrandTypography {
  heading: string;
  body: string;
  accent: string;
}

export interface BrandArchitecture {
  id: string;
  commerceId: string;

  businessNames: string[];
  selectedName?: string;
  domains: string[];
  selectedDomain?: string;

  brandVoice: string;
  colors: BrandColors;
  typography: BrandTypography;

  positioning: string;
  mission: string;
  valueProposition: string;
  tagline: string;

  logoPrompt?: string;
  packageingConcept?: string;

  status: AgentStatus;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Product
export interface Product {
  id: string;
  commerceId: string;

  name: string;
  description: string;
  sku: string;

  costOfGoods: number;
  suggestedPrice: number;

  recurringPotential: number; // 0-100
  margins: {
    minimum: number;
    target: number;
  };

  shippingFeasibility: string;
  supplierQuality: number; // 0-100
  reviewSentiment: string;
  subscriptionCompatibility: number; // 0-100

  isValid: boolean;
  validationNotes: string;
  validationRecommendations: string[];

  status: AgentStatus;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Store
export interface StorePage {
  name: string;
  slug: string;
  content: any;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Store {
  id: string;
  commerceId: string;

  platform: 'shopify' | 'woocommerce' | 'custom';

  pages: StorePage[];

  homepage?: StorePage;
  productPages?: StorePage[];
  faqPage?: StorePage;
  aboutPage?: StorePage;
  contactPage?: StorePage;

  conversionOptimizations: string[];
  mobileOptimized: boolean;

  status: AgentStatus;
  approvedAt?: Date;
  publishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Campaign
export interface CampaignVariant {
  name: string;
  headline: string;
  subheadline: string;
  angle: string;
  primaryAvatar: string;
  secondaryAvatar?: string;
  hooks: string[];
}

export interface Campaign {
  id: string;
  commerceId: string;

  name: string;
  type: 'facebook' | 'instagram' | 'tiktok' | 'pinterest' | 'google' | 'youtube' | 'email' | 'sms';

  variants: CampaignVariant[];

  primaryAudience: string;
  secondaryAudience?: string;
  budget?: number;

  retargetingStrategy?: string;
  scalingStrategy?: string;
  testingFramework?: string;

  creatives: string[];
  copyVariations: string[];

  status: AgentStatus;
  approvedAt?: Date;
  publishedAt?: Date;

  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    roas: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Content
export type ContentType =
  | 'landing_page'
  | 'sales_page'
  | 'email'
  | 'sms'
  | 'blog'
  | 'product_description'
  | 'faq'
  | 'support_article';

export interface Content {
  id: string;
  commerceId: string;

  type: ContentType;
  title: string;
  content: string;

  psychology: {
    hooks: string[];
    angles: string[];
    emotionalTriggers: string[];
    objectionHandling: string[];
  };

  cta: {
    text: string;
    url: string;
    urgency?: string;
  };

  seoOptimized?: boolean;
  seoKeywords?: string[];

  status: AgentStatus;
  approvedAt?: Date;
  publishedAt?: Date;

  metrics?: {
    views: number;
    clicks: number;
    conversions: number;
    averageTimeOnPage: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Creative
export type CreativeType =
  | 'product_image'
  | 'lifestyle_image'
  | 'ugc'
  | 'comparison_graphic'
  | 'infographic'
  | 'short_video'
  | 'long_video'
  | 'animated_ad';

export interface Creative {
  id: string;
  commerceId: string;

  type: CreativeType;
  name: string;
  description: string;

  prompt: string;
  generatedUrl: string;

  forCampaign?: string;
  forProduct?: string;

  metrics?: {
    impressions: number;
    engagement: number;
    clicks: number;
    conversionRate: number;
  };

  status: AgentStatus;
  approvedAt?: Date;
  usedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Automation
export interface Automation {
  id: string;
  commerceId: string;

  name: string;
  type: 'email' | 'sms' | 'inventory' | 'pricing' | 'support' | 'upsell' | 'referral';

  trigger: string;
  action: string;

  enabled: boolean;
  testMode: boolean;

  metrics?: {
    triggered: number;
    completed: number;
    revenue: number;
    conversionRate: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Analytics
export interface CommerceDashboard {
  id: string;
  commerceId: string;

  // Revenue Metrics
  totalRevenue: number;
  monthlyRevenue: number;
  recurringRevenue: number;

  // Profit Metrics
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;

  // Customer Metrics
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  retentionRate: number;
  churnRate: number;

  // Economics
  cac: number; // Customer Acquisition Cost
  ltv: number; // Customer Lifetime Value
  roas: number; // Return on Ad Spend
  conversionRate: number;
  aov: number; // Average Order Value

  // Performance
  topProducts: string[];
  topChannels: string[];
  topCampaigns: string[];

  // Forecast
  forecastedRevenue: number;
  forecastedChurn: number;

  updatedAt: Date;
}

// Learning (Knowledge Loop)
export interface LearningRecord {
  id: string;
  workspaceId: string;

  type: 'winning_headline' | 'winning_ad' | 'winning_layout' | 'winning_audience' | 'winning_offer' | 'winning_funnel' | 'winning_pricing' | 'winning_creative';

  data: Record<string, any>;
  performance: {
    conversions: number;
    revenue: number;
    roi: number;
  };

  industryRelevant: string[]; // Industries this applies to
  businessModelRelevant: BusinessModel[];

  createdAt: Date;
}

// Approval Workflow
export interface ApprovalRequest {
  id: string;
  commerceId: string;

  type: 'launch_ads' | 'publish_store' | 'charge_customer' | 'order_inventory' | 'approve_copy' | 'change_pricing' | 'deploy_production';

  requestedBy: string;
  requestedAt: Date;

  data: Record<string, any>;
  recommendation: string;

  approvedBy?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;

  status: 'pending' | 'approved' | 'rejected';
}
