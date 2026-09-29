'use strict';

/**
 * WISE² Content Studio Worker Service Test
 * Tests BullMQ queues, job processing, and mock implementations
 */

// Environment loaded from system/process

const { Queue, Worker } = require('bullmq');

console.log('🤖 WISE² Content Studio Worker Service Test\n');
console.log('=' .repeat(70));

// ── Configuration ─────────────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_CONFIG = {
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

console.log('\n📋 TEST CONFIGURATION');
console.log('-'.repeat(70));
console.log(`Redis URL: ${REDIS_URL}`);
console.log(`Redis Host: ${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`);
console.log(`Redis Auth: ${REDIS_CONFIG.password ? 'Enabled' : 'Disabled'}\n`);

// ── Test 1: Redis Connection ──────────────────────────────────────────────────
console.log('✅ TEST 1: Redis Connection');
console.log('-'.repeat(70));

async function testRedisConnection() {
  try {
    const testQueue = new Queue('test-connection', { connection: REDIS_CONFIG });
    await testQueue.client.ping();
    console.log('✅ Redis connection successful');
    await testQueue.close();
    return true;
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
    console.log('\n⚠️  Redis is not running. Start Redis with:');
    console.log('   redis-server');
    return false;
  }
}

// ── Test 2: Queue Creation ────────────────────────────────────────────────────
async function testQueueCreation() {
  console.log('\n✅ TEST 2: Queue Creation');
  console.log('-'.repeat(70));

  const queueNames = ['research', 'script', 'voice', 'image', 'video', 'publish'];
  const queues = {};

  try {
    for (const name of queueNames) {
      queues[name] = new Queue(`content:${name}`, { connection: REDIS_CONFIG });
      console.log(`✅ Created queue: content:${name}`);
    }

    console.log(`\n✅ Total queues created: ${Object.keys(queues).length}`);

    // Clean up
    for (const queue of Object.values(queues)) {
      await queue.close();
    }
    return true;
  } catch (err) {
    console.error('❌ Queue creation failed:', err.message);
    return false;
  }
}

// ── Test 3: Job Enqueuing ────────────────────────────────────────────────────
async function testJobEnqueuing() {
  console.log('\n✅ TEST 3: Job Enqueuing');
  console.log('-'.repeat(70));

  const testJobs = [
    {
      queueName: 'content:research',
      jobData: {
        projectId: 'proj_123abc',
        topic: 'AI Automation in Business',
        brand: 'wise2',
      },
      description: 'Research job',
    },
    {
      queueName: 'content:script',
      jobData: {
        projectId: 'proj_123abc',
        research: 'Research findings about AI automation',
        brand: 'wise2',
      },
      description: 'Script generation job',
    },
    {
      queueName: 'content:voice',
      jobData: {
        projectId: 'proj_123abc',
        script: '[Hook] Did you know...',
        brand: 'wise2',
      },
      description: 'Voice generation job',
    },
    {
      queueName: 'content:image',
      jobData: {
        projectId: 'proj_123abc',
        topic: 'AI Automation',
        brand: 'wise2',
      },
      description: 'Image generation job',
    },
    {
      queueName: 'content:video',
      jobData: {
        projectId: 'proj_123abc',
        manifest: {
          width: 1080,
          height: 1920,
          fps: 30,
          scenes: [],
        },
      },
      description: 'Video assembly job',
    },
    {
      queueName: 'content:publish',
      jobData: {
        publishJobId: 'pub_789xyz',
        projectId: 'proj_123abc',
        platform: 'tiktok',
      },
      description: 'Publishing job',
    },
  ];

  const queues = {};
  const jobIds = [];

  try {
    // Create queues and enqueue jobs
    for (const testJob of testJobs) {
      if (!queues[testJob.queueName]) {
        queues[testJob.queueName] = new Queue(testJob.queueName, { connection: REDIS_CONFIG });
      }

      const queue = queues[testJob.queueName];
      const job = await queue.add('process', testJob.jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      jobIds.push({
        id: job.id,
        queue: testJob.queueName,
        description: testJob.description,
      });

      console.log(`✅ Enqueued: ${testJob.description} (ID: ${job.id})`);
    }

    console.log(`\n✅ Total jobs enqueued: ${jobIds.length}`);

    // Show job data
    console.log('\n📊 Job Details:');
    for (const jobInfo of jobIds) {
      const queue = queues[jobInfo.queue];
      const job = await queue.getJob(jobInfo.id);
      if (job) {
        console.log(`\n  Job ID: ${jobInfo.id}`);
        console.log(`  Queue: ${jobInfo.queue}`);
        console.log(`  State: ${await job.getState()}`);
        console.log(`  Data: ${JSON.stringify(job.data, null, 2).split('\n').join('\n    ')}`);
      }
    }

    // Clean up queues
    for (const queue of Object.values(queues)) {
      await queue.close();
    }

    return true;
  } catch (err) {
    console.error('❌ Job enqueuing failed:', err.message);
    return false;
  }
}

// ── Test 4: Job Processing Simulation ─────────────────────────────────────────
async function testJobProcessing() {
  console.log('\n✅ TEST 4: Job Processing Simulation');
  console.log('-'.repeat(70));

  try {
    // Create a test queue
    const queue = new Queue('content:test', { connection: REDIS_CONFIG });

    // Define a test processor
    const worker = new Worker('content:test', async (job) => {
      console.log(`\n  Processing job: ${job.id}`);
      console.log(`  Data: ${JSON.stringify(job.data)}`);

      // Simulate processing
      await new Promise(r => setTimeout(r, 500));

      return {
        success: true,
        jobId: job.id,
        processedAt: new Date().toISOString(),
        result: `Processed data for ${job.data.topic || 'unknown topic'}`,
      };
    }, { connection: REDIS_CONFIG });

    // Add a test job
    const testJob = await queue.add('test', {
      topic: 'Test Content',
      brand: 'wise2',
    });

    console.log(`✅ Created test job: ${testJob.id}`);
    console.log('⏳ Processing job...');

    // Wait for job completion
    const result = await testJob.waitUntilFinished(worker.events, 5000);

    console.log('✅ Job processing completed');
    console.log(`   Result: ${JSON.stringify(result, null, 2).split('\n').join('\n   ')}`);

    // Cleanup
    await worker.close();
    await queue.close();
    return true;
  } catch (err) {
    console.error('❌ Job processing test failed:', err.message);
    if (err.message.includes('timeout')) {
      console.log('⚠️  Job processing timed out - Redis may be slow or unavailable');
    }
    return false;
  }
}

// ── Test 5: Mock Implementations ──────────────────────────────────────────────
console.log('\n✅ TEST 5: Mock Job Implementations');
console.log('-'.repeat(70));

async function testMockImplementations() {
  // Mock implementations from worker-content.js
  const mocks = {
    research: async (topic, brand) => {
      return `Research findings for "${topic}" in ${brand} context. Key points: 1) Market trends, 2) Audience interests, 3) Related topics.`;
    },
    script: async (research, brand) => {
      return `[Hook] Did you know? [Body] ${research.slice(0, 100)}... [CTA] Learn more about ${brand}. [Duration: 60 seconds]`;
    },
    voice: async (script, brand) => {
      return `https://storage.wise2.net/voice/${Date.now()}.mp3`;
    },
    image: async (topic, brand) => {
      return `https://storage.wise2.net/images/${Date.now()}.jpg`;
    },
    video: async (projectId) => {
      return `https://storage.wise2.net/videos/${projectId}.mp4`;
    },
    publish: async (projectId, platform) => {
      return {
        postUrl: `https://${platform}.com/posts/${projectId}`,
        postId: `${platform}_${projectId}`,
      };
    },
  };

  for (const [key, fn] of Object.entries(mocks)) {
    try {
      let result;
      switch (key) {
        case 'research':
          result = await fn('AI Automation', 'wise2');
          break;
        case 'script':
          result = await fn('Research data here', 'wise2');
          break;
        case 'voice':
          result = await fn('Test script', 'wise2');
          break;
        case 'image':
          result = await fn('AI Topic', 'wise2');
          break;
        case 'video':
          result = await fn('proj_test_123');
          break;
        case 'publish':
          result = await fn('proj_test_123', 'tiktok');
          break;
      }

      console.log(`✅ Mock ${key}: ${typeof result === 'object' ? JSON.stringify(result) : result.slice(0, 60)}`);
    } catch (err) {
      console.error(`❌ Mock ${key} failed:`, err.message);
    }
  }

  return true;
}

// ── Main Test Runner ──────────────────────────────────────────────────────────
async function runTests() {
  const results = [];

  // Test 1: Redis Connection
  const redisOk = await testRedisConnection();
  results.push({ name: 'Redis Connection', passed: redisOk });

  if (!redisOk) {
    console.log('\n❌ Cannot proceed - Redis is required');
    console.log('\nTo fix: Start Redis server');
    console.log('  macOS: brew services start redis');
    console.log('  Docker: docker run -d -p 6379:6379 redis:7-alpine');
    console.log('  Linux: systemctl start redis-server\n');
    return;
  }

  // Test 2: Queue Creation
  const queuesOk = await testQueueCreation();
  results.push({ name: 'Queue Creation', passed: queuesOk });

  // Test 3: Job Enqueuing
  const enqueueOk = await testJobEnqueuing();
  results.push({ name: 'Job Enqueuing', passed: enqueueOk });

  // Test 4: Job Processing
  const processingOk = await testJobProcessing();
  results.push({ name: 'Job Processing', passed: processingOk });

  // Test 5: Mocks
  const mocksOk = await testMockImplementations();
  results.push({ name: 'Mock Implementations', passed: mocksOk });

  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('\n📊 TEST SUMMARY\n');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
  });

  console.log(`\n${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('🎉 All worker service tests passed! Ready for deployment.\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. Check errors above.\n`);
  }

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
