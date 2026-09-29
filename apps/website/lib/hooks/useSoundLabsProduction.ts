'use client';

import { useState, useCallback } from 'react';

const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:8788';

export interface SoundLabsClient {
  email: string;
  client_id: string;
  name: string;
  plan: string;
  token?: string;
}

export interface Project {
  project_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface MusicGeneration {
  generation_id: string;
  prompt: string;
  duration: number;
  genre: string;
  status: 'pending' | 'generating' | 'complete' | 'failed';
}

export function useSoundLabsProduction() {
  const [client, setClient] = useState<SoundLabsClient | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);

  // AUTHENTICATION

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/soundlabs/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) throw new Error('Registration failed');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/soundlabs/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      const clientData: SoundLabsClient = {
        email,
        client_id: data.client_id || email.split('@')[0],
        name: data.name || email,
        plan: 'starter',
        token: data.token
      };

      setClient(clientData);
      localStorage.setItem('soundlabs_token', data.token);
      localStorage.setItem('soundlabs_client', JSON.stringify(clientData));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setClient(null);
    setProjects([]);
    setCurrentProject(null);
    localStorage.removeItem('soundlabs_token');
    localStorage.removeItem('soundlabs_client');
  }, []);

  // PROJECT MANAGEMENT

  const createProject = useCallback(async (name: string, description: string = '') => {
    if (!client?.token) {
      setError('Not authenticated');
      return null;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/soundlabs/projects/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${client.token}`
        },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) throw new Error('Project creation failed');

      const data = await res.json();
      const project: Project = {
        project_id: data.project_id,
        name,
        description,
        created_at: new Date().toISOString()
      };

      setProjects([...projects, project]);
      setCurrentProject(project);

      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Project error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client?.token, projects]);

  const listProjects = useCallback(async () => {
    if (!client?.token) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/soundlabs/projects`, {
        headers: { 'Authorization': `Bearer ${client.token}` }
      });
      if (!res.ok) throw new Error('Failed to load projects');

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load error');
    } finally {
      setIsLoading(false);
    }
  }, [client?.token]);

  // MUSIC GENERATION

  const generateMusic = useCallback(async (
    prompt: string,
    duration: number = 30,
    genre: string = 'electronic'
  ) => {
    if (!client?.token) {
      setError('Not authenticated');
      return null;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${BRIDGE_URL}/soundlabs/ai/generate?prompt=${encodeURIComponent(prompt)}&duration=${duration}&genre=${genre}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${client.token}` }
        }
      );
      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      const generation: MusicGeneration = {
        generation_id: data.generation_id,
        prompt,
        duration,
        genre,
        status: 'pending'
      };

      setGenerations([...generations, generation]);
      return generation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client?.token, generations]);

  // REAPER CONTROL

  const reaperTransport = useCallback(async (action: 'play' | 'stop' | 'record' | 'pause') => {
    if (!client?.token) {
      setError('Not authenticated');
      return false;
    }

    try {
      const res = await fetch(
        `${BRIDGE_URL}/soundlabs/reaper/transport/${action}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${client.token}` }
        }
      );
      return res.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'REAPER error');
      return false;
    }
  }, [client?.token]);

  // LIVE STREAMING

  const startStream = useCallback(async (
    platform: 'discord' | 'youtube' | 'twitch' | 'custom_rtmp',
    title: string
  ) => {
    if (!client?.token) {
      setError('Not authenticated');
      return null;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${BRIDGE_URL}/soundlabs/stream/start?platform=${platform}&title=${encodeURIComponent(title)}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${client.token}` }
        }
      );
      if (!res.ok) throw new Error('Stream start failed');

      const data = await res.json();
      return data.stream_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stream error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client?.token]);

  const stopStream = useCallback(async (streamId: string) => {
    if (!client?.token) {
      setError('Not authenticated');
      return false;
    }

    try {
      const res = await fetch(
        `${BRIDGE_URL}/soundlabs/stream/stop/${streamId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${client.token}` }
        }
      );
      return res.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stream error');
      return false;
    }
  }, [client?.token]);

  return {
    // State
    client,
    projects,
    currentProject,
    isLoading,
    error,
    generations,

    // Auth
    register,
    login,
    logout,

    // Projects
    createProject,
    listProjects,

    // Generation
    generateMusic,

    // REAPER
    reaperTransport,

    // Streaming
    startStream,
    stopStream
  };
}
