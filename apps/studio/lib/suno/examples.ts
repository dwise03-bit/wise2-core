/**
 * Suno Integration Examples
 *
 * Real-world usage examples for the Suno API integration layer.
 * Copy and adapt these patterns for your use cases.
 */

import {
  sunoQueue,
  submitAndWaitForGeneration,
  submitGenerationBatch,
  getSunoClient,
  initMockSunoQueue,
  getSunoQueueState,
  getSunoQueueStats,
} from './index';

import type {
  SunoGenerationRequest,
  QueuedGeneration,
  RateLimitInfo,
} from './index';

// ============================================================================
// EXAMPLE 1: Simple Generation
// ============================================================================

/**
 * Submit a single generation and wait for completion
 */
export async function example1_simpleGeneration() {
  const userId = 'user@example.com';

  // Submit generation
  const { generationId, estimatedTime } = await sunoQueue.submitGeneration(
    userId,
    {
      prompt: 'upbeat pop track with catchy hooks and modern production',
      duration: 30,
      style: 'pop',
    }
  );

  console.log(`Generation submitted: ${generationId}`);
  console.log(`Estimated time: ${estimatedTime}s`);

  // Wait for completion
  const result = await sunoQueue.pollUntilComplete(generationId);

  console.log(`Status: ${result.status}`);
  console.log(`Duration: ${result.completedAt ? 'Completed' : 'Pending'}`);

  return result;
}

// ============================================================================
// EXAMPLE 2: Generation with Progress Tracking
// ============================================================================

/**
 * Submit generation with real-time progress updates
 */
export async function example2_progressTracking() {
  console.log('Generating music with progress tracking...\n');

  const result = await submitAndWaitForGeneration(
    'user@example.com',
    {
      prompt: 'ambient electronic music with atmospheric pads',
      duration: 60,
    },
    (progress, status) => {
      // This callback fires on each status check (every 2 seconds)
      const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
      console.log(`[${bar}] ${progress}% - ${status}`);
    }
  );

  console.log(`\nGeneration complete!`);
  return result;
}

// ============================================================================
// EXAMPLE 3: Batch Generation
// ============================================================================

/**
 * Submit multiple generations in parallel
 */
export async function example3_batchGeneration() {
  const userId = 'user@example.com';

  const generationPrompts: SunoGenerationRequest[] = [
    {
      prompt: 'upbeat pop track with catchy hooks',
      duration: 30,
      style: 'pop',
    },
    {
      prompt: 'ambient electronic music for relaxation',
      duration: 60,
      style: 'ambient',
    },
    {
      prompt: 'high-energy hip-hop with strong bass',
      duration: 30,
      style: 'hip-hop',
    },
  ];

  console.log(`Submitting ${generationPrompts.length} generations...`);

  // Submit all at once
  const generationIds = await submitGenerationBatch(userId, generationPrompts);

  console.log(`Submitted: ${generationIds.join(', ')}\n`);

  // Wait for all to complete
  const results = await Promise.all(
    generationIds.map((id) =>
      sunoQueue.pollUntilComplete(id, (progress, status) => {
        console.log(`[${id}] ${progress}% - ${status}`);
      })
    )
  );

  console.log(`\nAll generations complete!`);
  return results;
}

// ============================================================================
// EXAMPLE 4: Priority-Based Submission
// ============================================================================

/**
 * Submit generations with different priorities
 */
export async function example4_prioritySubmission() {
  const userId = 'user@example.com';

  // Submit low priority background generation
  const bgGenId = (
    await sunoQueue.submitGeneration(
      userId,
      {
        prompt: 'background music for streaming',
        duration: 60,
      },
      1 // Low priority
    )
  ).generationId;

  // Submit urgent generation for user
  const urgentGenId = (
    await sunoQueue.submitGeneration(
      userId,
      {
        prompt: 'special event track needed now',
        duration: 30,
      },
      10 // High priority
    )
  ).generationId;

  console.log('Submitted:');
  console.log(`  - Background (priority 1): ${bgGenId}`);
  console.log(`  - Urgent (priority 10): ${urgentGenId}`);

  // The urgent generation will process first even if submitted second
  return { bgGenId, urgentGenId };
}

// ============================================================================
// EXAMPLE 5: Rate Limit Checking
// ============================================================================

/**
 * Check and handle rate limits
 */
export async function example5_rateLimitChecking() {
  const userId = 'user@example.com';

  // Check rate limit before submitting
  const rateLimit = sunoQueue.checkRateLimit(userId);

  console.log(`Rate limit info for ${userId}:`);
  console.log(`  - Generated today: ${rateLimit.generationsToday}/${rateLimit.maxGenerationsPerDay}`);
  console.log(`  - Is limited: ${rateLimit.isLimited}`);
  console.log(`  - Resets at: ${rateLimit.resetTime.toISOString()}`);

  // Conditionally submit based on limit
  if (rateLimit.isLimited) {
    console.log('\nRate limit exceeded!');
    console.log(`Please try again after ${rateLimit.resetTime.toLocaleString()}`);
    return null;
  }

  // Submit if not limited
  const result = await sunoQueue.submitGeneration(userId, {
    prompt: 'test generation',
    duration: 30,
  });

  console.log(`\nGeneration submitted: ${result.generationId}`);
  return result;
}

// ============================================================================
// EXAMPLE 6: User Generation History
// ============================================================================

/**
 * Retrieve user's generation history
 */
export async function example6_userHistory() {
  const userId = 'user@example.com';

  // Get last 50 generations
  const generations = sunoQueue.getUserGenerations(userId, 50);

  console.log(`Generations for ${userId}:\n`);

  // Group by status
  const byStatus = generations.reduce(
    (acc, gen) => {
      acc[gen.status] = (acc[gen.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('By status:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}`);
  });

  // Show recent completions
  const completed = generations
    .filter((g) => g.status === 'Completed')
    .slice(0, 5);

  if (completed.length > 0) {
    console.log('\nRecent completions:');
    completed.forEach((gen) => {
      console.log(`  - ${gen.generationParams.prompt.substring(0, 50)}...`);
      console.log(`    Generated: ${gen.createdAt.toLocaleString()}`);
    });
  }

  return generations;
}

// ============================================================================
// EXAMPLE 7: Generation Cancellation
// ============================================================================

/**
 * Submit and then cancel a generation
 */
export async function example7_cancellation() {
  const userId = 'user@example.com';

  // Submit a generation
  const { generationId } = await sunoQueue.submitGeneration(userId, {
    prompt: 'long ambient track',
    duration: 120, // Very long
  });

  console.log(`Generation submitted: ${generationId}`);

  // Wait a bit, then cancel
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const cancelled = await sunoQueue.cancelGeneration(generationId);

  if (cancelled) {
    console.log(`Generation cancelled: ${generationId}`);
  } else {
    console.log(`Could not cancel (already completed or failed)`);
  }

  return cancelled;
}

// ============================================================================
// EXAMPLE 8: Queue Statistics
// ============================================================================

/**
 * Monitor queue statistics
 */
export async function example8_queueStats() {
  // Simulate some activity
  const userId = 'user@example.com';

  for (let i = 0; i < 3; i++) {
    await sunoQueue.submitGeneration(userId, {
      prompt: `generation ${i + 1}`,
      duration: 30,
    });
  }

  // Check stats
  const stats = sunoQueue.getQueueStats();

  console.log('Queue Statistics:\n');
  console.log(`  Queued: ${stats.totalQueued}`);
  console.log(`  Processing: ${stats.totalProcessing}`);
  console.log(`  Completed: ${stats.totalCompleted}`);
  console.log(`  Failed: ${stats.totalFailed}`);
  console.log(`  Avg generation time: ${stats.averageGenerationTime}ms`);

  return stats;
}

// ============================================================================
// EXAMPLE 9: Direct API Client Usage
// ============================================================================

/**
 * Use the Suno client directly for advanced use cases
 */
export async function example9_directApiUsage() {
  const client = getSunoClient();

  // Generate
  const response = await client.generate({
    prompt: 'upbeat pop track',
    duration: 30,
  });

  console.log(`Generation started: ${response.id}`);

  // Poll for status
  let status = await client.getStatus(response.id);
  console.log(`Initial status: ${status.status}`);

  // Simulate waiting
  await new Promise((resolve) => setTimeout(resolve, 5000));

  status = await client.getStatus(response.id);
  console.log(`Updated status: ${status.status}`);
  console.log(`Progress: ${status.progress}%`);

  // Export when complete
  if (status.musicUrl) {
    const exportResult = await client.export(response.id, 'mp3', {
      bitrate: 192,
    });

    console.log(`Export URL: ${exportResult.downloadUrl}`);
    console.log(`Expires in: ${exportResult.expiresIn}s`);
  }

  return response;
}

// ============================================================================
// EXAMPLE 10: Mock Mode Testing
// ============================================================================

/**
 * Test with mock mode (no real API needed)
 */
export async function example10_mockModeTesting() {
  // Enable mock mode
  initMockSunoQueue();
  console.log('Mock mode enabled\n');

  const userId = 'test-user';

  // Submit generations (uses mock data)
  for (let i = 0; i < 3; i++) {
    const { generationId } = await sunoQueue.submitGeneration(userId, {
      prompt: `test generation ${i + 1}`,
      duration: 30,
    });

    console.log(`Submitted (mock): ${generationId}`);
  }

  // Check queue state
  const state = getSunoQueueState();
  console.log(`\nQueue items: ${state.queue.length}`);

  // Get stats
  const stats = getSunoQueueStats();
  console.log(`Queued: ${stats.totalQueued}`);
  console.log(`Processing: ${stats.totalProcessing}`);

  return state;
}

// ============================================================================
// EXAMPLE 11: Error Handling
// ============================================================================

/**
 * Proper error handling patterns
 */
export async function example11_errorHandling() {
  const userId = 'user@example.com';

  try {
    // Try to submit with invalid prompt
    await sunoQueue.submitGeneration(userId, {
      prompt: 'short', // Too short!
      duration: 30,
    });
  } catch (error) {
    console.log('Validation error caught:');
    console.log(`  ${(error as Error).message}\n`);
  }

  try {
    // Check rate limit and handle gracefully
    const rateLimit = sunoQueue.checkRateLimit(userId);

    if (rateLimit.isLimited) {
      throw new Error(
        `Rate limited. Reset at ${rateLimit.resetTime.toLocaleString()}`
      );
    }

    const result = await sunoQueue.submitGeneration(userId, {
      prompt: 'valid generation prompt here',
      duration: 30,
    });

    console.log(`Successfully submitted: ${result.generationId}`);
  } catch (error) {
    console.log('Rate limit error caught:');
    console.log(`  ${(error as Error).message}\n`);
  }
}

// ============================================================================
// EXAMPLE 12: Custom Status Monitoring
// ============================================================================

/**
 * Implement custom monitoring and logging
 */
export async function example12_customMonitoring() {
  const userId = 'user@example.com';

  class GenerationMonitor {
    private startTime = Date.now();
    private lastProgress = 0;

    onProgress(progress: number, status: string) {
      const elapsed = Math.round((Date.now() - this.startTime) / 1000);
      const increment = progress - this.lastProgress;
      const rate = increment > 0 ? `+${increment}%` : '---';

      console.log(
        `[${elapsed.toString().padStart(3)}s] ${status.padEnd(12)} ${progress.toString().padStart(3)}% ${rate}`
      );

      this.lastProgress = progress;
    }
  }

  const monitor = new GenerationMonitor();

  const result = await submitAndWaitForGeneration(
    userId,
    {
      prompt: 'upbeat pop with modern production',
      duration: 30,
    },
    (progress, status) => monitor.onProgress(progress, status)
  );

  console.log(`\nCompleted: ${result.status}`);
  return result;
}

// ============================================================================
// MAIN: Run Examples
// ============================================================================

/**
 * Run all examples (comment out as needed)
 */
export async function runAllExamples() {
  console.log('='.repeat(60));
  console.log('SUNO INTEGRATION EXAMPLES');
  console.log('='.repeat(60));

  const examples = [
    { name: 'Simple Generation', fn: example1_simpleGeneration },
    { name: 'Progress Tracking', fn: example2_progressTracking },
    { name: 'Batch Generation', fn: example3_batchGeneration },
    { name: 'Priority Submission', fn: example4_prioritySubmission },
    { name: 'Rate Limit Checking', fn: example5_rateLimitChecking },
    { name: 'User History', fn: example6_userHistory },
    { name: 'Cancellation', fn: example7_cancellation },
    { name: 'Queue Stats', fn: example8_queueStats },
    { name: 'Direct API Usage', fn: example9_directApiUsage },
    { name: 'Mock Mode Testing', fn: example10_mockModeTesting },
    { name: 'Error Handling', fn: example11_errorHandling },
    { name: 'Custom Monitoring', fn: example12_customMonitoring },
  ];

  for (const example of examples) {
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`EXAMPLE: ${example.name}`);
    console.log('='.repeat(60));

    try {
      await example.fn();
    } catch (error) {
      console.error(`Error in ${example.name}:`, error);
    }
  }
}
