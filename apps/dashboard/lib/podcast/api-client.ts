import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PodcastProject {
  id: string;
  name: string;
  episodeNumber: number;
  template: 'intro' | 'outro' | 'transition';
  mood: 'upbeat' | 'calm' | 'dramatic';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationRequest {
  projectName: string;
  episodeNumber: number;
  template: 'intro' | 'outro' | 'transition';
  mood: 'upbeat' | 'calm' | 'dramatic';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  generationsPerMonth: number;
  features: string[];
}

export const podcastApi = {
  // Projects
  getProjects: () => apiClient.get<PodcastProject[]>('/podcast/projects'),
  getProject: (id: string) => apiClient.get<PodcastProject>(`/podcast/projects/${id}`),
  createProject: (data: GenerationRequest) =>
    apiClient.post<PodcastProject>('/podcast/projects', data),
  updateProject: (id: string, data: Partial<GenerationRequest>) =>
    apiClient.put<PodcastProject>(`/podcast/projects/${id}`, data),
  deleteProject: (id: string) => apiClient.delete(`/podcast/projects/${id}`),

  // Generation
  generateAudio: (projectId: string) =>
    apiClient.post<{ status: string; audioUrl: string }>(`/podcast/projects/${projectId}/generate`),
  getGenerationStatus: (projectId: string) =>
    apiClient.get<{ status: string; progress: number }>(`/podcast/projects/${projectId}/status`),

  // Downloads
  downloadAudio: (projectId: string) =>
    apiClient.get(`/podcast/projects/${projectId}/download`, { responseType: 'blob' }),

  // Subscription
  getSubscriptionPlans: () => apiClient.get<SubscriptionPlan[]>('/podcast/subscription/plans'),
  getCurrentSubscription: () =>
    apiClient.get<{ planId: string; status: string; expiresAt: string }>('/podcast/subscription/current'),
  createCheckoutSession: (planId: string) =>
    apiClient.post<{ checkoutUrl: string }>('/podcast/subscription/checkout', { planId }),

  // User stats
  getUserStats: () =>
    apiClient.get<{ generationsUsed: number; generationsLimit: number; storageUsed: number }>('/podcast/stats'),
};

export type ApiError = AxiosError<{ message: string; code?: string }>;

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};
