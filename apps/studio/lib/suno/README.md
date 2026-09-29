# Suno API Integration Layer

Complete integration with the Suno music generation service for WISE² Creative Studio.

## Overview

This module provides:

- **SunoClient**: Direct API communication with retry logic and error handling
- **SunoGenerationQueue**: Job queue with priority support, rate limiting, and status polling
- **Mock Implementation**: Realistic mock data for MVP/testing without API access

## Quick Start

### Basic Usage

```typescript
import { sunoQueue, submitAndWaitForGeneration } from '@/lib/suno';

// Submit a generation
const { generationId } = await sunoQueue.submitGeneration(
  'user123',
  {
    prompt: 'upbeat pop track with catchy hooks',
    duration: 30,
  }
);

// Poll for completion
const result = await sunoQueue.pollUntilComplete(generationId, (progress, status) => {
  console.log(`${progress}% - ${status}`);
});

console.log('Generation complete:', result.audioUrl);
```

### With Progress Callback

```typescript
const generation = await submitAndWaitForGeneration(
  'user123',
  { prompt: 'ambient electronic music' },
  (progress, status) => {
    // Update UI with progress
    updateProgressBar(progress);
    updateStatusLabel(status);
  }
);
```

### Batch Submissions

```typescript
import { submitGenerationBatch } from '@/lib/suno';

const params = [
  { prompt: 'upbeat pop' },
  { prompt: 'ambient electronic' },
  { prompt: 'classical orchestral' },
];

const generationIds = await submitGenerationBatch('user123', params);

// Poll all generations in parallel
const results = await Promise.all(
  generationIds.map(id => sunoQueue.pollUntilComplete(id))
);
```

## Configuration

### Environment Variables

```bash
# Required: Suno API key
SUNO_API_KEY=your_api_key_here
```

### Initialize at App Startup

```typescript
// In your app initialization (e.g., app/layout.tsx)
import { initSunoClient } from '@/lib/suno';

// Initialize with env var
initSunoClient();

// Or pass config explicitly
initSunoClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.suno.ai',
  timeout: 30000,
  retries: 3,
});
```

## API Reference

### SunoGenerationQueue

#### Methods

##### `submitGeneration(userId, params, priority?): Promise<{generationId, estimatedTime}>`

Submit a generation to the queue.

**Parameters:**
- `userId` (string): User identifier for rate limiting
- `params` (SunoGenerationRequest): Generation parameters
- `priority` (number, optional): Priority 0-10 (default: 5, higher = sooner)

**Returns:**
- `generationId`: ID for tracking
- `estimatedTime`: Estimated seconds until completion

**Rate Limits:**
- Max 10 generations per day per user (MVP)
- Throws error if limit exceeded

```typescript
const { generationId, estimatedTime } = await sunoQueue.submitGeneration(
  'user123',
  {
    prompt: 'upbeat pop track',
    duration: 30,
    style: 'modern pop',
  },
  7 // high priority
);

console.log(`Submitted. ETA: ${estimatedTime}s`);
```

##### `pollUntilComplete(generationId, onProgress?): Promise<QueuedGeneration>`

Poll until generation completes or timeout (5 minutes).

**Parameters:**
- `generationId`: ID to poll
- `onProgress(progress, status)`: Optional callback with progress 0-100

**Returns:** QueuedGeneration with status and metadata

```typescript
const result = await sunoQueue.pollUntilComplete(
  'gen_1234567890',
  (progress, status) => console.log(`${progress}% - ${status}`)
);

if (result.status === 'Completed') {
  console.log('Audio URL:', result.audioUrl);
}
```

##### `getStatus(generationId): QueuedGeneration | undefined`

Get current generation status without polling.

```typescript
const gen = sunoQueue.getStatus('gen_1234567890');
if (gen) {
  console.log(`${gen.status} (${gen.progress}%)`);
}
```

##### `cancelGeneration(generationId): Promise<boolean>`

Cancel a generation if still queued/processing.

```typescript
const cancelled = await sunoQueue.cancelGeneration('gen_1234567890');
if (cancelled) {
  console.log('Generation cancelled');
}
```

##### `getUserGenerations(userId, limit?): QueuedGeneration[]`

Get user's generation history.

```typescript
const generations = sunoQueue.getUserGenerations('user123', 50);
const completed = generations.filter(g => g.status === 'Completed');
```

##### `checkRateLimit(userId): RateLimitInfo`

Check rate limit status for user.

```typescript
const limit = sunoQueue.checkRateLimit('user123');
console.log(`${limit.generationsToday}/${limit.maxGenerationsPerDay}`);

if (limit.isLimited) {
  console.log(`Rate limited until ${limit.resetTime}`);
}
```

##### `getQueueStats(): QueueStats`

Get overall queue statistics.

```typescript
const stats = sunoQueue.getQueueStats();
console.log(`Queued: ${stats.totalQueued}`);
console.log(`Processing: ${stats.totalProcessing}`);
console.log(`Avg time: ${stats.averageGenerationTime}ms`);
```

### SunoClient

Direct API client for custom implementations.

```typescript
import { getSunoClient } from '@/lib/suno';

const client = getSunoClient();

// Generate
const response = await client.generate({
  prompt: 'upbeat pop track',
  duration: 30,
});

// Check status
const status = await client.getStatus(response.id);

// Export
const exportUrl = await client.export(response.id, 'mp3', {
  bitrate: 192,
});

// Download
const audioBuffer = await client.downloadMusic(status.musicUrl!);
```

## Mock Mode (MVP/Testing)

Use mock mode to test without Suno API access.

### Enable Mock Mode

```typescript
import { initMockSunoQueue } from '@/lib/suno';

// At startup
initMockSunoQueue();

// Now all submissions use realistic mock data
// Generations complete after 30-60 seconds simulation
```

### Mock Features

- Realistic generation responses
- Simulated 30-60 second generation time
- Consistent mock data (seeded by generation ID)
- Valid WAV file headers for audio testing
- Realistic quality scores and metadata

### Testing Example

```typescript
import { initMockSunoQueue, sunoQueue } from '@/lib/suno';

describe('Music Generation', () => {
  beforeAll(() => {
    initMockSunoQueue();
  });

  it('generates music with mock API', async () => {
    const { generationId } = await sunoQueue.submitGeneration(
      'test-user',
      { prompt: 'test track' }
    );

    const result = await sunoQueue.pollUntilComplete(generationId);

    expect(result.status).toBe('Completed');
    expect(result.progress).toBe(100);
  });
});
```

## Types

### QueuedGeneration

```typescript
interface QueuedGeneration {
  id: string;
  userId: string;
  generationParams: SunoGenerationRequest;
  status: GenerationStatus; // 'Queued' | 'Generating' | 'Completed' | 'Failed' | 'Cancelled'
  progress: number; // 0-100
  priority: number; // 0-10
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  error?: string;
  estimatedTimeRemaining?: number; // seconds
}
```

### RateLimitInfo

```typescript
interface RateLimitInfo {
  userId: string;
  generationsToday: number;
  maxGenerationsPerDay: number;
  resetTime: Date;
  isLimited: boolean;
}
```

### QueueStats

```typescript
interface QueueStats {
  totalQueued: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  averageGenerationTime: number; // milliseconds
}
```

## Error Handling

### Rate Limit Error

```typescript
try {
  await sunoQueue.submitGeneration('user123', params);
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.log('User has hit daily limit');
  }
}
```

### Validation Error

```typescript
try {
  await sunoQueue.submitGeneration('user123', {
    prompt: 'too short' // Less than 10 chars
  });
} catch (error) {
  console.log('Invalid prompt:', error.message);
}
```

### Generation Failed

```typescript
try {
  await sunoQueue.pollUntilComplete(generationId);
} catch (error) {
  if (error.message.includes('Failed after')) {
    console.log('Max retries exceeded');
  }
}
```

## Architecture

### Queue Processing

1. **Submit** → Job added to queue with priority
2. **Rate Limit Check** → Validate user hasn't exceeded daily limit
3. **Dequeue** → Next highest priority job selected
4. **Process** → Submit to Suno API or mock
5. **Poll** → Check status every 2 seconds
6. **Complete** → Mark done, allow next job to process
7. **Concurrent Limit** → Max 5 parallel generations

### Retry Logic

- **Max Attempts**: 3 retries
- **Backoff**: 1s, 2s, 4s (exponential)
- **No Retry On**: Rate limit, validation errors
- **Retry On**: Network errors, timeouts, server errors

### Rate Limiting

- **Per User**: Max 10 generations/day
- **Reset**: Daily at UTC midnight
- **MVP Only**: Will be adjusted based on Suno tier
- **Tracked**: In-memory by default (consider persistent store for production)

## Constants

```typescript
import { SUNO_CONSTANTS } from '@/lib/suno';

// MAX_GENERATIONS_PER_DAY = 10 (MVP)
// POLL_INTERVAL_MS = 2000
// POLL_TIMEOUT_MS = 300000 (5 min)
// RETRY_MAX_ATTEMPTS = 3
// RETRY_BASE_DELAY_MS = 1000
```

## Database Integration

For production, store generations in database:

```typescript
// After generation completes
const generation = await sunoQueue.pollUntilComplete(generationId);

// Store in database
await db.generationHistory.create({
  id: generation.id,
  userId: generation.userId,
  prompt: generation.generationParams.prompt,
  status: generation.status,
  audioUrl: generation.audioUrl,
  completedAt: generation.completedAt,
  // ... other fields
});
```

## Debugging

### View Queue State

```typescript
import { getSunoQueueState } from '@/lib/suno';

const state = getSunoQueueState();
console.log('Queue:', state.queue);
console.log('Processing:', state.processing);
console.log('Stats:', state.stats);
```

### Enable Logging

```typescript
// Add console logging to sunoQueue methods
const gen = await sunoQueue.submitGeneration('user123', params);
console.log('Generation submitted:', gen.id);

await sunoQueue.pollUntilComplete(gen.id, (progress, status) => {
  console.log(`[${gen.id}] ${progress}% - ${status}`);
});
```

## Migration from MVP to Production

### Update Rate Limits

```typescript
// In sunoQueue.ts
const MAX_GENERATIONS_PER_DAY = 100; // Increase based on tier
```

### Use Persistent Rate Limit Store

```typescript
// Replace in-memory userGenerationStats with database query
const todayGenerations = await db.generationHistory.countByUserToday(userId);
if (todayGenerations >= maxPerDay) {
  throw new Error('Rate limited');
}
```

### Persistent Job Queue

Replace in-memory queue with Redis or database:

```typescript
// Use Bull Queue, Bee Queue, or similar
import Queue from 'bull';

const generationQueue = new Queue('generations', {
  redis: { host: 'localhost', port: 6379 }
});

generationQueue.process(async (job) => {
  // Process generation
});
```

## Support

For issues with:
- **Suno API**: Check [Suno documentation](https://docs.suno.ai)
- **Rate Limiting**: Review `MAX_GENERATIONS_PER_DAY` and reset logic
- **Mock Data**: See `sunoMock.ts` for generation simulation
- **Queue Processing**: Check `sunoQueue.ts` for job handling

## Related Files

- `apps/studio/lib/suno/sunoClient.ts` - API client
- `apps/studio/lib/suno/sunoQueue.ts` - Queue system
- `apps/studio/lib/suno/sunoMock.ts` - Mock implementation
- `apps/studio/types/suno.ts` - Type definitions
- `apps/studio/types/api.ts` - API request/response types
