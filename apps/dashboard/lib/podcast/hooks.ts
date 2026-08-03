'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  podcastApi,
  PodcastProject,
  SubscriptionPlan,
  handleApiError,
} from './api-client';

interface UseProjectsReturn {
  projects: PodcastProject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<PodcastProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await podcastApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { projects, isLoading, error, refetch };
}

interface UseProjectReturn {
  project: PodcastProject | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  updateProject: (data: Partial<PodcastProject>) => Promise<void>;
  deleteProject: () => Promise<void>;
  generateAudio: () => Promise<void>;
  getStatus: () => Promise<{ status: string; progress: number }>;
}

export function useProject(projectId: string | null): UseProjectReturn {
  const [project, setProject] = useState<PodcastProject | null>(null);
  const [isLoading, setIsLoading] = useState(!!projectId);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await podcastApi.getProject(projectId);
        setProject(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const updateProject = useCallback(
    async (data: Partial<PodcastProject>) => {
      if (!projectId) return;
      setIsUpdating(true);
      setError(null);
      try {
        const { data: updated } = await podcastApi.updateProject(projectId, data);
        setProject(updated);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsUpdating(false);
      }
    },
    [projectId]
  );

  const deleteProjectFn = useCallback(async () => {
    if (!projectId) return;
    setIsUpdating(true);
    setError(null);
    try {
      await podcastApi.deleteProject(projectId);
      setProject(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsUpdating(false);
    }
  }, [projectId]);

  const generateAudioFn = useCallback(async () => {
    if (!projectId) return;
    setIsUpdating(true);
    setError(null);
    try {
      const { data } = await podcastApi.generateAudio(projectId);
      setProject(
        (prev) =>
          prev && {
            ...prev,
            status: 'generating',
            audioUrl: data.audioUrl,
          }
      );
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsUpdating(false);
    }
  }, [projectId]);

  const getStatus = useCallback(async () => {
    if (!projectId) return { status: '', progress: 0 };
    try {
      const { data } = await podcastApi.getGenerationStatus(projectId);
      return data;
    } catch (err) {
      setError(handleApiError(err));
      return { status: 'error', progress: 0 };
    }
  }, [projectId]);

  return {
    project,
    isLoading,
    error,
    isUpdating,
    updateProject,
    deleteProject: deleteProjectFn,
    generateAudio: generateAudioFn,
    getStatus,
  };
}

interface UseSubscriptionReturn {
  plans: SubscriptionPlan[];
  currentPlan: { planId: string; status: string; expiresAt: string } | null;
  isLoading: boolean;
  error: string | null;
  createCheckout: (planId: string) => Promise<string>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<{
    planId: string;
    status: string;
    expiresAt: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [plansRes, currentRes] = await Promise.all([
          podcastApi.getSubscriptionPlans(),
          podcastApi.getCurrentSubscription(),
        ]);
        setPlans(plansRes.data);
        setCurrentPlan(currentRes.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const createCheckout = useCallback(async (planId: string): Promise<string> => {
    try {
      const { data } = await podcastApi.createCheckoutSession(planId);
      return data.checkoutUrl;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    }
  }, []);

  return { plans, currentPlan, isLoading, error, createCheckout };
}

interface UseUserStatsReturn {
  generationsUsed: number;
  generationsLimit: number;
  storageUsed: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserStats(): UseUserStatsReturn {
  const [stats, setStats] = useState({
    generationsUsed: 0,
    generationsLimit: 10,
    storageUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await podcastApi.getUserStats();
      setStats(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...stats, isLoading, error, refetch };
}
