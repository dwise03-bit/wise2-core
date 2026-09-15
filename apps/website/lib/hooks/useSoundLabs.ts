import { useState, useCallback, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  mixerState?: Record<string, any>;
  createdAt: string;
  recordings?: any[];
}

interface GenerateMusicParams {
  prompt: string;
  duration?: number;
  genre?: string;
  mood?: string;
  tempo?: number;
}

interface GenerateMusicResult {
  generationId: string;
  prompt: string;
  duration: number;
  downloadPath: string;
  timestamp: string;
}

export function useSoundLabs() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/auth/me`, {
          credentials: 'include',
        });
        setIsAuthenticated(res.ok);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Load projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/sound-labs/me/projects`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create project
  const createProject = useCallback(
    async (name: string, description?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/v1/sound-labs/me/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
        const data = await res.json();
        setCurrentProject(data.project);
        await loadProjects();
        return data.project;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create project');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadProjects]
  );

  // Load project details
  const loadProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/v1/sound-labs/me/projects/${projectId}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Failed to load project: ${res.status}`);
      const data = await res.json();
      setCurrentProject(data.project);
      return data.project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate music
  const generateMusic = useCallback(
    async (projectId: string, params: GenerateMusicParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/v1/sound-labs/me/projects/${projectId}/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(params),
          }
        );
        if (!res.ok) throw new Error(`Failed to generate music: ${res.status}`);
        const data = await res.json();
        return data as GenerateMusicResult;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate music');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update project mixer state
  const updateMixerState = useCallback(
    async (projectId: string, mixerState: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/v1/sound-labs/me/projects/${projectId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ mixerState }),
          }
        );
        if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
        const data = await res.json();
        setCurrentProject(data.project);
        return data.project;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update project'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    projects,
    currentProject,
    loading,
    error,
    isAuthenticated,
    loadProjects,
    createProject,
    loadProject,
    generateMusic,
    updateMixerState,
  };
}
