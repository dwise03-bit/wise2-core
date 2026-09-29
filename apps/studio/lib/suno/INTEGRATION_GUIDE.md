# Suno Integration Guide for Creative Studio

Quick integration guide for using the Suno music generation system in WISE² Creative Studio components.

## Installation

No additional packages needed. The integration is built into `lib/suno/`.

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
SUNO_API_KEY=your_actual_suno_api_key_here
```

For MVP/testing without API:

```bash
# Optional, defaults to mock if API key not present
SUNO_API_KEY=demo_key_for_testing
```

### 2. Application Initialization

In `app/providers.tsx` or similar startup file:

```typescript
'use client';

import { useEffect } from 'react';
import { initSunoClient } from '@/lib/suno';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Suno client
    try {
      initSunoClient();
    } catch (error) {
      console.warn('Suno API key not configured:', error);
      // In MVP, mock mode will be used
    }
  }, []);

  return <>{children}</>;
}
```

## Component Usage

### Basic Component: Generation Form

```typescript
// components/MusicGenerationForm.tsx
'use client';

import { useState } from 'react';
import { sunoQueue } from '@/lib/suno';

export function MusicGenerationForm({ userId }: { userId: string }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setGenerating(true);

      // Submit generation
      const { generationId, estimatedTime } = await sunoQueue.submitGeneration(
        userId,
        {
          prompt,
          duration: 30,
        }
      );

      console.log(`Generation submitted: ${generationId}`);
      console.log(`Estimated time: ${estimatedTime}s`);

      // Wait for completion with progress updates
      const result = await sunoQueue.pollUntilComplete(
        generationId,
        (p, s) => {
          setProgress(p);
          setStatus(s);
        }
      );

      console.log('Generation complete:', result);
      alert(`Success! Status: ${result.status}`);
    } catch (error) {
      alert(`Generation failed: ${(error as Error).message}`);
    } finally {
      setGenerating(false);
      setProgress(0);
      setStatus('');
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the music you want to generate..."
        className="w-full p-2 border rounded"
        disabled={generating}
        rows={3}
      />

      <button
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {generating ? `Generating... ${progress}%` : 'Generate Music'}
      </button>

      {status && <p className="text-sm text-gray-600">Status: {status}</p>}

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

### Advanced Component: Generation History

```typescript
// components/GenerationHistory.tsx
'use client';

import { useEffect, useState } from 'react';
import { sunoQueue } from '@/lib/suno';
import type { QueuedGeneration } from '@/lib/suno';

export function GenerationHistory({ userId }: { userId: string }) {
  const [generations, setGenerations] = useState<QueuedGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load history
    const history = sunoQueue.getUserGenerations(userId, 50);
    setGenerations(history);
    setLoading(false);
  }, [userId]);

  const handleCancel = async (generationId: string) => {
    const cancelled = await sunoQueue.cancelGeneration(generationId);
    if (cancelled) {
      // Update UI
      setGenerations(generations.filter((g) => g.id !== generationId));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Generation History</h2>

      {generations.length === 0 ? (
        <p className="text-gray-600">No generations yet</p>
      ) : (
        <div className="space-y-2">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">
                    {gen.generationParams.prompt.substring(0, 50)}...
                  </p>
                  <p className="text-sm text-gray-600">
                    {gen.createdAt.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {gen.status}{' '}
                    {gen.progress > 0 && `(${gen.progress}%)`}
                  </p>
                </div>

                {gen.status === 'Queued' || gen.status === 'Generating' ? (
                  <button
                    onClick={() => handleCancel(gen.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Cancel
                  </button>
                ) : gen.status === 'Completed' ? (
                  <a
                    href={gen.audioUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded"
                  >
                    Download
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Advanced Component: Rate Limit Status

```typescript
// components/RateLimitStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { sunoQueue } from '@/lib/suno';
import type { RateLimitInfo } from '@/lib/suno';

export function RateLimitStatus({ userId }: { userId: string }) {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  useEffect(() => {
    const limit = sunoQueue.checkRateLimit(userId);
    setRateLimit(limit);
  }, [userId]);

  if (!rateLimit) return null;

  const remaining = rateLimit.maxGenerationsPerDay - rateLimit.generationsToday;
  const percentage = (rateLimit.generationsToday / rateLimit.maxGenerationsPerDay) * 100;

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-bold text-blue-900 mb-2">Daily Limit</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {rateLimit.generationsToday}/{rateLimit.maxGenerationsPerDay} used
          </span>
          <span className="text-gray-600">
            {remaining} remaining
          </span>
        </div>

        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage > 80 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {rateLimit.isLimited && (
          <p className="text-sm text-red-600 font-medium">
            Limit exceeded. Resets at {rateLimit.resetTime.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Hook: Use Generation

Create a custom hook for easier integration:

```typescript
// hooks/useMusicalGeneration.ts
import { useState, useCallback } from 'react';
import { sunoQueue } from '@/lib/suno';
import type { GenerationStatus, SunoGenerationRequest, QueuedGeneration } from '@/lib/suno';

interface UseGenerationReturn {
  submit: (params: SunoGenerationRequest) => Promise<string>;
  cancel: (generationId: string) => Promise<boolean>;
  getStatus: (generationId: string) => QueuedGeneration | undefined;
  generating: boolean;
  progress: number;
  error: string | null;
}

export function useMusicalGeneration(userId: string): UseGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (params: SunoGenerationRequest): Promise<string> => {
      setGenerating(true);
      setError(null);
      setProgress(0);

      try {
        const { generationId, estimatedTime } = await sunoQueue.submitGeneration(
          userId,
          params
        );

        // Optionally wait for completion
        await sunoQueue.pollUntilComplete(generationId, (p) => {
          setProgress(p);
        });

        return generationId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [userId]
  );

  const cancel = useCallback(async (generationId: string) => {
    return sunoQueue.cancelGeneration(generationId);
  }, []);

  const getStatus = useCallback((generationId: string) => {
    return sunoQueue.getStatus(generationId);
  }, []);

  return {
    submit,
    cancel,
    getStatus,
    generating,
    progress,
    error,
  };
}

// Usage in component:
export function MyComponent({ userId }: { userId: string }) {
  const { submit, progress, error } = useMusicalGeneration(userId);

  const handleGenerate = async () => {
    await submit({
      prompt: 'upbeat pop music',
      duration: 30,
    });
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      <p>Progress: {progress}%</p>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

## Page Integration

### Full Generation Page

```typescript
// app/studio/generate/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { MusicGenerationForm } from '@/components/MusicGenerationForm';
import { GenerationHistory } from '@/components/GenerationHistory';
import { RateLimitStatus } from '@/components/RateLimitStatus';

export default function GeneratePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-4xl font-bold">Music Generation Studio</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-4">Generate Music</h2>
            <MusicGenerationForm userId={user.id} />
          </section>

          <section className="bg-white rounded-lg p-6 shadow">
            <GenerationHistory userId={user.id} />
          </section>
        </div>

        <div className="space-y-4">
          <RateLimitStatus userId={user.id} />

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold mb-2">Tips</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• Use descriptive prompts (10+ characters)</li>
              <li>• Include genre and mood for better results</li>
              <li>• Longer descriptions = better results</li>
              <li>• Try different variations of the same idea</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## API Route Integration

### Generation API Route

```typescript
// app/api/studio/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sunoQueue } from '@/lib/suno';
import { getUserIdFromAuth } from '@/lib/auth'; // Your auth util

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { prompt, duration = 30 } = await request.json();

    if (!prompt || prompt.length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Submit to queue
    const { generationId, estimatedTime } = await sunoQueue.submitGeneration(
      userId,
      { prompt, duration }
    );

    return NextResponse.json({
      generationId,
      estimatedTime,
      status: 'queued',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Rate limit')) {
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
```

### Status Check API Route

```typescript
// app/api/studio/generate/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sunoQueue } from '@/lib/suno';
import { getUserIdFromAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const generation = sunoQueue.getStatus(params.id);
    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      progress: generation.progress,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt,
      audioUrl: generation.audioUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### "Cannot find module '@/lib/suno'"

- Ensure the `suno` folder is in `/apps/studio/lib/`
- Check `tsconfig.json` path aliases are configured
- Run `npm install` or restart dev server

### "Suno API key not found"

- Add `SUNO_API_KEY` to `.env.local`
- Restart development server
- Check key format (should start with actual key or "demo_" for mock)

### Generations stuck in "Queued"

- Check `MAX_GENERATIONS_PER_DAY` rate limit
- Check queue stats with `getSunoQueueStats()`
- Verify API connectivity with `client.healthCheck()`
- Use mock mode to test without API

### High latency/slow generation

- This is normal; Suno takes 30-60 seconds
- Use progress callbacks to show user feedback
- Set reasonable expectations in UI

## Best Practices

### Error Handling

```typescript
try {
  await sunoQueue.submitGeneration(userId, params);
} catch (error) {
  if ((error as Error).message.includes('Rate limit')) {
    // Show rate limit message
  } else if ((error as Error).message.includes('Prompt')) {
    // Show validation error
  } else {
    // Show generic error
  }
}
```

### Progress Feedback

Always show progress to users:

```typescript
await sunoQueue.pollUntilComplete(generationId, (progress, status) => {
  updateProgressBar(progress); // 0-100
  updateStatusLabel(status);   // Queued, Generating, Completed, Failed
});
```

### Rate Limit UX

Always check rate limit before generating:

```typescript
const limit = sunoQueue.checkRateLimit(userId);
if (limit.isLimited) {
  showModal(`Daily limit reached. Resets at ${limit.resetTime}`);
  disableGenerateButton();
}
```

### Batch Operations

For multiple generations:

```typescript
const ids = await submitGenerationBatch(userId, [
  { prompt: 'track 1' },
  { prompt: 'track 2' },
  { prompt: 'track 3' },
]);

// Poll all in parallel
const results = await Promise.all(
  ids.map(id => sunoQueue.pollUntilComplete(id))
);
```

## Related Documentation

- [Suno API Docs](https://docs.suno.ai)
- [README.md](./README.md) - Comprehensive API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [examples.ts](./examples.ts) - 12 real-world examples

---

**Last Updated**: July 24, 2026  
**Version**: 1.0 MVP
