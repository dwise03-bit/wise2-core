'use strict';

require('dotenv').config({ path: '/home/dwise/wise2-core/.env' });

const { Queue, Worker } = require('bullmq');
const fetch = require('node-fetch');

// ── Configuration ─────────────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const COMMAND_CENTER_URL = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';
const JWT_SECRET = process.env.JWT_SECRET;
const LOG_PREFIX = '[worker-content]';

const redis = new URL(REDIS_URL);
const redisConfig = {
  host: redis.hostname,
  port: parseInt(redis.port) || 6379,
  password: redis.password || process.env.REDIS_PASSWORD,
};

console.log(`${LOG_PREFIX} Connecting to Redis: ${redisConfig.host}:${redisConfig.port}`);

// ── Queues ────────────────────────────────────────────────────────────────────
const queues = {
  research: new Queue('content:research', { connection: redisConfig }),
  script: new Queue('content:script', { connection: redisConfig }),
  voice: new Queue('content:voice', { connection: redisConfig }),
  image: new Queue('content:image', { connection: redisConfig }),
  video: new Queue('content:video', { connection: redisConfig }),
  publish: new Queue('content:publish', { connection: redisConfig }),
};

// ── Workers ───────────────────────────────────────────────────────────────────
const workers = {
  research: new Worker('content:research', processResearch, {
    connection: redisConfig,
    concurrency: 3,
  }),

  script: new Worker('content:script', processScript, {
    connection: redisConfig,
    concurrency: 3,
  }),

  voice: new Worker('content:voice', processVoice, {
    connection: redisConfig,
    concurrency: 2,
  }),

  image: new Worker('content:image', processImage, {
    connection: redisConfig,
    concurrency: 3,
  }),

  video: new Worker('content:video', processVideo, {
    connection: redisConfig,
    concurrency: 1,  // Limited concurrency for FFmpeg
  }),

  publish: new Worker('content:publish', processPublish, {
    connection: redisConfig,
    concurrency: 2,
  }),
};

// ── Job Processors ────────────────────────────────────────────────────────────

async function processResearch(job) {
  console.log(`${LOG_PREFIX} [research] Processing job ${job.id}`);
  const { projectId, topic, brand } = job.data;

  try {
    // 1. Update project status
    await updateProjectStatus(projectId, 'research_pending');

    // 2. Call AI provider to research topic (mock for now)
    const research = await mockResearchTopic(topic, brand);
    console.log(`${LOG_PREFIX} [research] Generated research for "${topic}"`);

    // 3. Update project status
    await updateProjectStatus(projectId, 'research_complete');

    // 4. Enqueue script generation job
    await queues.script.add('generate', {
      projectId,
      research,
      brand,
      topic,
    });

    // 5. Publish event
    await publishEvent({
      type: 'content.research.complete',
      severity: 'info',
      source: 'wise-worker',
      title: 'Content research complete',
      meta: { projectId, topic },
    });

    return { success: true, projectId, research };
  } catch (err) {
    console.error(`${LOG_PREFIX} [research] Job ${job.id} failed:`, err.message);
    await updateProjectStatus(projectId, 'failed');
    throw err;
  }
}

async function processScript(job) {
  console.log(`${LOG_PREFIX} [script] Processing job ${job.id}`);
  const { projectId, research, brand } = job.data;

  try {
    await updateProjectStatus(projectId, 'script_pending');

    // Mock script generation (in production, call Claude/OpenAI)
    const script = await mockGenerateScript(research, brand);
    console.log(`${LOG_PREFIX} [script] Generated script for project ${projectId}`);

    await updateProjectStatus(projectId, 'script_ready');

    // Enqueue voice generation
    await queues.voice.add('generate', { projectId, script, brand });

    // Publish event for Discord approval embed
    await publishEvent({
      type: 'content.script.ready',
      severity: 'info',
      source: 'wise-worker',
      title: 'Script ready for approval',
      meta: { projectId },
    });

    return { success: true, projectId, script };
  } catch (err) {
    console.error(`${LOG_PREFIX} [script] Job ${job.id} failed:`, err.message);
    await updateProjectStatus(projectId, 'failed');
    throw err;
  }
}

async function processVoice(job) {
  console.log(`${LOG_PREFIX} [voice] Processing job ${job.id}`);
  const { projectId, script, brand } = job.data;

  try {
    await updateProjectStatus(projectId, 'voice_pending');

    // Mock voiceover generation (in production, call ElevenLabs)
    const voiceUrl = await mockGenerateVoice(script, brand);
    console.log(`${LOG_PREFIX} [voice] Generated voiceover for project ${projectId}`);

    await updateProjectStatus(projectId, 'voice_ready');

    await publishEvent({
      type: 'content.voice.ready',
      severity: 'info',
      source: 'wise-worker',
      title: 'Voiceover generated',
      meta: { projectId },
    });

    return { success: true, projectId, voiceUrl };
  } catch (err) {
    console.error(`${LOG_PREFIX} [voice] Job ${job.id} failed:`, err.message);
    await updateProjectStatus(projectId, 'failed');
    throw err;
  }
}

async function processImage(job) {
  console.log(`${LOG_PREFIX} [image] Processing job ${job.id}`);
  const { projectId, topic, brand } = job.data;

  try {
    await updateProjectStatus(projectId, 'visuals_pending');

    // Mock image generation (in production, call FAL/OpenAI)
    const imageUrl = await mockGenerateImage(topic, brand);
    console.log(`${LOG_PREFIX} [image] Generated image for project ${projectId}`);

    await updateProjectStatus(projectId, 'visuals_ready');

    await publishEvent({
      type: 'content.visuals.ready',
      severity: 'info',
      source: 'wise-worker',
      title: 'Visuals generated',
      meta: { projectId },
    });

    return { success: true, projectId, imageUrl };
  } catch (err) {
    console.error(`${LOG_PREFIX} [image] Job ${job.id} failed:`, err.message);
    await updateProjectStatus(projectId, 'failed');
    throw err;
  }
}

async function processVideo(job) {
  console.log(`${LOG_PREFIX} [video] Processing job ${job.id}`);
  const { projectId, manifest } = job.data;

  try {
    await updateProjectStatus(projectId, 'rendering');

    // Mock video assembly (in production, call FFmpeg assembler)
    const videoUrl = await mockAssembleVideo(projectId, manifest);
    console.log(`${LOG_PREFIX} [video] Assembled video for project ${projectId}`);

    await updateProjectStatus(projectId, 'preview_ready');

    await publishEvent({
      type: 'content.video.ready',
      severity: 'info',
      source: 'wise-worker',
      title: 'Video ready for approval',
      meta: { projectId, videoUrl },
    });

    return { success: true, projectId, videoUrl };
  } catch (err) {
    console.error(`${LOG_PREFIX} [video] Job ${job.id} failed:`, err.message);
    await updateProjectStatus(projectId, 'failed');
    throw err;
  }
}

async function processPublish(job) {
  console.log(`${LOG_PREFIX} [publish] Processing job ${job.id}`);
  const { publishJobId, projectId, platform } = job.data;

  try {
    // Mock publishing (in production, call platform APIs or generate download package)
    const result = await mockPublishContent(projectId, platform);
    console.log(`${LOG_PREFIX} [publish] Published to ${platform} for project ${projectId}`);

    await publishEvent({
      type: 'content.published',
      severity: 'success',
      source: 'wise-worker',
      title: 'Content published',
      meta: { projectId, platform, postUrl: result.postUrl },
    });

    return { success: true, projectId, platform, postUrl: result.postUrl };
  } catch (err) {
    console.error(`${LOG_PREFIX} [publish] Job ${job.id} failed:`, err.message);
    throw err;
  }
}

// ── Helper Functions ──────────────────────────────────────────────────────────

async function updateProjectStatus(projectId, status) {
  try {
    await fetch(`${COMMAND_CENTER_URL}/api/content/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      timeout: 5000,
    });
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to update project status:`, err.message);
  }
}

async function publishEvent(event) {
  try {
    await fetch(`${COMMAND_CENTER_URL}/api/events/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-events-key': process.env.EVENTS_SECRET || '' },
      body: JSON.stringify(event),
      timeout: 3000,
    });
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to publish event:`, err.message);
  }
}

// ── Mock AI/Content Functions ─────────────────────────────────────────────────

async function mockResearchTopic(topic, brand) {
  return `Research findings for "${topic}" in ${brand} context. Key points: 1) Market trends, 2) Audience interests, 3) Related topics.`;
}

async function mockGenerateScript(research, brand) {
  return `[Hook] Did you know? [Body] ${research.slice(0, 100)}... [CTA] Learn more about ${brand}. [Duration: 60 seconds]`;
}

async function mockGenerateVoice(script, brand) {
  return `https://storage.wise2.net/voice/${Date.now()}.mp3`;
}

async function mockGenerateImage(topic, brand) {
  return `https://storage.wise2.net/images/${Date.now()}.jpg`;
}

async function mockAssembleVideo(projectId, manifest) {
  return `https://storage.wise2.net/videos/${projectId}.mp4`;
}

async function mockPublishContent(projectId, platform) {
  return {
    postUrl: `https://${platform}.com/posts/${projectId}`,
    postId: `${platform}_${projectId}`,
  };
}

// ── Event Handlers ────────────────────────────────────────────────────────────

Object.entries(workers).forEach(([name, worker]) => {
  worker.on('completed', (job) => {
    console.log(`${LOG_PREFIX} [${name}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`${LOG_PREFIX} [${name}] Job ${job.id} failed:`, err.message);
    if (job.attemptsMade >= job.opts.attempts) {
      console.error(`${LOG_PREFIX} [${name}] Job ${job.id} exceeded max retries, moving to dead-letter`);
    }
  });

  worker.on('error', (err) => {
    console.error(`${LOG_PREFIX} [${name}] Worker error:`, err.message);
  });
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────

async function shutdown() {
  console.log(`${LOG_PREFIX} Shutting down gracefully...`);
  for (const worker of Object.values(workers)) {
    await worker.close();
  }
  for (const queue of Object.values(queues)) {
    await queue.close();
  }
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ── Health Check ──────────────────────────────────────────────────────────────

setInterval(async () => {
  try {
    const counts = {};
    for (const [name, queue] of Object.entries(queues)) {
      counts[name] = await queue.count();
    }
    console.log(`${LOG_PREFIX} Queue status:`, counts);
  } catch (err) {
    console.error(`${LOG_PREFIX} Health check failed:`, err.message);
  }
}, 60000); // Every 60 seconds

console.log(`${LOG_PREFIX} Worker started. Monitoring queues: ${Object.keys(queues).join(', ')}`);
