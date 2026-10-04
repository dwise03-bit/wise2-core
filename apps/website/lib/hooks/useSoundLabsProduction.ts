'use client';

import { useState, useEffect, useCallback } from 'react';

const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:8788';

// Same-origin auth (served by Next.js via nginx). Do NOT point auth at the
// bridge/localhost — that is why SoundLabs login failed in production.
const AUTH_LOGIN_URL = '/api/v1/auth/login';
const AUTH_REGISTER_URL = '/api/v1/auth/signup';

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

  const persistSession = useCallback((clientData: SoundLabsClient) => {
    setClient(clientData);
    if (clientData.token) {
      localStorage.setItem('soundlabs_token', clientData.token);
      // Mirror into the shared app token so the rest of wise2.net sees the session.
      localStorage.setItem('auth_token', clientData.token);
    }
    localStorage.setItem('soundlabs_client', JSON.stringify(clientData));
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [firstName, ...rest] = (name || '').trim().split(' ');
      const res = await fetch(AUTH_REGISTER_URL, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || email.split('@')[0],
          lastName: rest.join(' ') || 'User',
        })
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Registration failed');
      }

      const data = payload.data ?? payload;
      const clientData: SoundLabsClient = {
        email,
        client_id: data.user?.id || email.split('@')[0],
        name: name || data.user?.firstName || email,
        plan: 'starter',
        token: data.tokens?.accessToken ?? data.accessToken,
      };

      persistSession(clientData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(AUTH_LOGIN_URL, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Invalid email or password');
      }

      const data = payload.data ?? payload;
      const clientData: SoundLabsClient = {
        email,
        client_id: data.user?.id || email.split('@')[0],
        name: data.user?.firstName
          ? `${data.user.firstName}${data.user.lastName ? ' ' + data.user.lastName : ''}`
          : email,
        plan: 'starter',
        token: data.tokens?.accessToken ?? data.accessToken,
      };

      persistSession(clientData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  // Restore a persisted session on mount so a refresh does not log the user out.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('soundlabs_client');
      if (stored) {
        const parsed = JSON.parse(stored) as SoundLabsClient;
        if (parsed?.token) setClient(parsed);
      }
    } catch {
      // ignore malformed session
    }
  }, []);

  const logout = useCallback(() => {
    setClient(null);
    setProjects([]);
    setCurrentProject(null);
    setError(null);
    localStorage.removeItem('soundlabs_token');
    localStorage.removeItem('soundlabs_client');
    localStorage.removeItem('auth_token');
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
    } catch {
      // Projects live on the optional bridge backend; a missing bridge must not
      // break the signed-in dashboard. Fail soft with an empty list.
      setProjects([]);
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
