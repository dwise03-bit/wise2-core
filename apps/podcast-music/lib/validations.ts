import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Podcast Project Schemas
export const createPodcastProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  podcastName: z.string().min(1, 'Podcast name is required'),
  podcastCategory: z.string().optional(),
  episodeNumber: z.number().int().positive().optional(),
  releaseDate: z.date().optional(),
  mood: z.string().optional(),
  duration: z.number().int().positive().optional(),
  genre: z.string().optional(),
});

export const updatePodcastProjectSchema = createPodcastProjectSchema.partial();

export const listPodcastProjectsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  status: z.enum([
    'DRAFT',
    'GENERATING',
    'READY',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
  ]).optional(),
});

// Audio Generation Schemas
export const generateAudioSchema = z.object({
  podcastProjectId: z.string().cuid('Invalid project ID'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  aiModel: z.string().default('default'),
  seed: z.number().int().optional(),
});

// Subscription/Billing Schemas
export const createSubscriptionSchema = z.object({
  paymentMethodId: z.string(),
  priceId: z.string().optional(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
});

// Download Audio Schema
export const downloadAudioSchema = z.object({
  audioGenerationId: z.string().cuid('Invalid audio generation ID'),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreatePodcastProjectInput = z.infer<typeof createPodcastProjectSchema>;
export type UpdatePodcastProjectInput = z.infer<typeof updatePodcastProjectSchema>;
export type ListPodcastProjectsInput = z.infer<typeof listPodcastProjectsSchema>;
export type GenerateAudioInput = z.infer<typeof generateAudioSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type DownloadAudioInput = z.infer<typeof downloadAudioSchema>;
