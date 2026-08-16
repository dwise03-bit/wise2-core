# Frontend Integration Guide

How to use the Suno + OBS API from frontend components.

---

## Setup

### 1. Ensure Authentication

The API endpoints require a valid JWT token. Use the existing auth system:

```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <YourComponent />;
}
```

### 2. Get Auth Token

```typescript
const token = localStorage.getItem('accessToken');
```

---

## Suno Integration Examples

### Generate Music

```typescript
import { useState } from 'react';
import { SunoGenerationRequest, SunoGenerationResponse } from '@/types/api';

export function GenerateMusicForm() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/suno/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          style: 'EDM',
          duration: 180,
        } as SunoGenerationRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate');
      }

      const { data } = await response.json();
      setGenerationId(data.id);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerate}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the music you want to generate..."
        minLength={10}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {generationId && <p>Generation ID: {generationId}</p>}
    </form>
  );
}
```

### Poll Generation Status

```typescript
import { useEffect, useState } from 'react';
import { SunoStatusResponse } from '@/types/api';

export function GenerationProgressMonitor({ generationId }: { generationId: string }) {
  const [status, setStatus] = useState<SunoStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generationId) return;

    const token = localStorage.getItem('accessToken');
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/suno/status/${generationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const { data } = await response.json();
        setStatus(data);

        // Stop polling when complete
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [generationId]);

  if (!status) return <div>Loading...</div>;

  return (
    <div>
      <p>Status: {status.status}</p>
      {status.progress && <div style={{ width: `${status.progress}%`, background: 'blue', height: '20px' }} />}
      {status.status === 'completed' && status.musicUrl && (
        <audio controls src={status.musicUrl} />
      )}
      {status.status === 'failed' && <p style={{ color: 'red' }}>Generation failed</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Music History

```typescript
import { useEffect, useState } from 'react';
import { SunoHistoryResponse } from '@/types/api';

export function MusicHistory() {
  const [history, setHistory] = useState<SunoHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: '10',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        const response = await fetch(`/api/suno/history?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch history');

        const { data } = await response.json();
        setHistory(data);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  if (loading) return <div>Loading...</div>;
  if (!history) return <div>No history</div>;

  return (
    <div>
      <h2>Music History</h2>
      <ul>
        {history.items.map((item) => (
          <li key={item.id}>
            <p>{item.prompt}</p>
            <p>Status: {item.status}</p>
            {item.musicUrl && <audio controls src={item.musicUrl} />}
            <button onClick={() => downloadMusic(item.id)}>Download</button>
          </li>
        ))}
      </ul>
      
      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={!history.hasMore}>
          Next
        </button>
      </div>
    </div>
  );
}

async function downloadMusic(generationId: string) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/suno/export/${generationId}?format=mp3`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to export');

  const { data } = await response.json();
  window.open(data.downloadUrl, '_blank');
}
```

---

## OBS Integration Examples

### Scene Manager

```typescript
import { useEffect, useState } from 'react';
import { ObsScene } from '@/types/api';

export function SceneManager() {
  const [scenes, setScenes] = useState<ObsScene[]>([]);
  const [newSceneName, setNewSceneName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/obs/scenes', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const { data } = await response.json();
    setScenes(data);
    setLoading(false);
  };

  const handleCreateScene = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    const response = await fetch('/api/obs/scenes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newSceneName }),
    });

    if (response.ok) {
      setNewSceneName('');
      fetchScenes();
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/obs/scenes/${sceneId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchScenes();
  };

  if (loading) return <div>Loading scenes...</div>;

  return (
    <div>
      <h2>OBS Scenes</h2>
      
      <form onSubmit={handleCreateScene}>
        <input
          type="text"
          value={newSceneName}
          onChange={(e) => setNewSceneName(e.target.value)}
          placeholder="New scene name"
          required
        />
        <button type="submit">Create Scene</button>
      </form>

      <ul>
        {scenes.map((scene) => (
          <li key={scene.id}>
            <span>{scene.name}</span>
            <button onClick={() => handleDeleteScene(scene.id)}>Delete</button>
            <SceneSources sceneId={scene.id} sceneName={scene.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Scene Sources

```typescript
import { useEffect, useState } from 'react';
import { ObsSource } from '@/types/api';

export function SceneSources({
  sceneId,
  sceneName,
}: {
  sceneId: string;
  sceneName: string;
}) {
  const [sources, setSources] = useState<ObsSource[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSources();
  }, [sceneId]);

  const fetchSources = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/obs/scenes/${sceneId}/sources`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const { data } = await response.json();
    setSources(data);
  };

  const handleAddSource = async (name: string, type: string) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/obs/scenes/${sceneId}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, type }),
    });
    setShowAddForm(false);
    fetchSources();
  };

  return (
    <div style={{ marginLeft: '20px', marginTop: '10px' }}>
      <h4>Sources</h4>
      <ul>
        {sources.map((source) => (
          <li key={source.id}>
            <span>{source.name} ({source.type})</span>
            {source.enabled ? '✓' : '✗'}
          </li>
        ))}
      </ul>
      
      {showAddForm && (
        <AddSourceForm
          onAdd={handleAddSource}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      <button onClick={() => setShowAddForm(true)}>Add Source</button>
    </div>
  );
}

function AddSourceForm({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string, type: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'video' | 'audio' | 'text'>('video');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(name, type);
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Source name"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="video">Video</option>
        <option value="audio">Audio</option>
        <option value="text">Text</option>
      </select>
      <button type="submit">Add</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

### Stream Control

```typescript
import { useEffect, useState } from 'react';
import { ObsStreamStats } from '@/types/api';

export function StreamControl() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [stats, setStats] = useState<ObsStreamStats | null>(null);

  useEffect(() => {
    // Poll stats every 2 seconds if streaming
    if (!isStreaming) return;

    const token = localStorage.getItem('accessToken');
    const interval = setInterval(async () => {
      const response = await fetch('/api/obs/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const { data } = await response.json();
      setStats(data);
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleStartStream = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/obs/stream/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        serviceUrl: 'rtmps://live.twitch.tv/app',
        streamKey: process.env.NEXT_PUBLIC_STREAM_KEY || '',
      }),
    });

    if (response.ok) {
      setIsStreaming(true);
    }
  };

  const handleStopStream = async () => {
    const token = localStorage.getItem('accessToken');
    await fetch('/api/obs/stream/stop', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setIsStreaming(false);
    setStats(null);
  };

  return (
    <div>
      <h2>Stream Control</h2>
      
      {isStreaming ? (
        <>
          <button onClick={handleStopStream} style={{ background: 'red', color: 'white' }}>
            Stop Stream
          </button>
          
          {stats && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
              <p>Status: <strong style={{ color: 'green' }}>LIVE</strong></p>
              <p>Duration: {stats.duration}s</p>
              <p>Bitrate: {stats.bitrate} kbps</p>
              <p>FPS: {stats.fps}</p>
              <p>CPU: {stats.cpuUsage}%</p>
              <p>Memory: {stats.memoryUsage}%</p>
              <p>Dropped Frames: {stats.droppedFrames}</p>
            </div>
          )}
        </>
      ) : (
        <button onClick={handleStartStream} style={{ background: 'green', color: 'white' }}>
          Start Stream
        </button>
      )}
    </div>
  );
}
```

---

## Custom Hook for API Calls

Create a reusable hook for API interactions:

```typescript
// hooks/useApiClient.ts
import { useCallback } from 'react';

export function useApiClient() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const call = useCallback(
    async <T,>(
      path: string,
      options: RequestInit = {}
    ): Promise<T> => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(path, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API error');
      }

      const result = await response.json();
      return result.data;
    },
    [token]
  );

  return { call };
}
```

Usage:

```typescript
export function MyComponent() {
  const { call } = useApiClient();
  const [loading, setLoading] = useState(false);

  const generateMusic = async (prompt: string) => {
    setLoading(true);
    try {
      const result = await call('/api/suno/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      console.log('Generation ID:', result.id);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={() => generateMusic('Uplifting EDM')}>Generate</button>;
}
```

---

## Error Handling Pattern

```typescript
async function handleApiCall<T>(
  fn: () => Promise<T>,
  onError?: (error: string) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    onError?.(message);
    console.error('API Error:', message);
    return null;
  }
}

// Usage
const result = await handleApiCall(
  () => fetch('/api/suno/generate', { method: 'POST' }),
  (error) => toast.error(`Failed to generate: ${error}`)
);
```

---

## TypeScript Strict Mode

All examples are fully typed. Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

---

## Testing Components

Use mock fetch for unit tests:

```typescript
// __tests__/GenerateMusicForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GenerateMusicForm } from '@/components/GenerateMusicForm';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { id: 'gen_123', status: 'pending' },
      }),
    })
  ) as jest.Mock;
});

test('generates music on form submit', async () => {
  render(<GenerateMusicForm />);
  
  const textarea = screen.getByPlaceholderText(/Describe/);
  fireEvent.change(textarea, { target: { value: 'test prompt' } });
  
  const button = screen.getByText('Generate');
  fireEvent.click(button);
  
  await screen.findByText(/Generation ID: gen_123/);
  expect(global.fetch).toHaveBeenCalledWith(
    '/api/suno/generate',
    expect.objectContaining({ method: 'POST' })
  );
});
```

---

## Debugging Tips

1. **Check Network Tab**: Verify requests go to correct endpoints
2. **Console Logs**: Add logging around API calls
3. **Token Validity**: Check token isn't expired
4. **CORS**: Verify `NEXT_PUBLIC_APP_URL` env var is set
5. **API Response**: Log full response before parsing

```typescript
const response = await fetch('/api/suno/generate', options);
console.log('Response status:', response.status);
console.log('Response headers:', response.headers);
const data = await response.json();
console.log('Response body:', data);
```

---

## Next Steps

1. Copy these patterns into your components
2. Replace mock data with real API calls
3. Add loading states and error handling
4. Add toast notifications for user feedback
5. Implement caching for frequently accessed data

---

**Last Updated**: 2026-07-24
