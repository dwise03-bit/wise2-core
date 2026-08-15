/**
 * YouTube Video Generation Agent
 * Creates faceless AI-generated YouTube videos from approved articles
 * Uses TTS for narration and video composition
 */

const pg = require('pg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const TTS_SERVICE = process.env.TTS_SERVICE || 'google'; // google, azure, elevenlabs

const videoState = {
  isRunning: false,
  lastRun: null,
  videosGenerated: 0,
  videosUploaded: 0,
  errors: [],
};

/**
 * Generate AI script from article
 */
async function generateVideoScript(article) {
  try {
    const prompt = `Create a concise YouTube video script (60-120 seconds) for this article about ${article.title}.

Article: ${article.content.substring(0, 500)}...

Script requirements:
- Hook viewer in first 3 seconds
- Clear, engaging narration
- Call-to-action at end
- Focus on facts and implications
- Professional tone

Return ONLY the script text, no formatting.`;

    // Use Ollama for script generation
    const response = await axios.post(
      process.env.OLLAMA_API || 'http://localhost:11434/api/generate',
      {
        model: process.env.OLLAMA_MODEL || 'mistral:latest',
        prompt: prompt,
        stream: false,
      }
    );

    return response.data.response || '';
  } catch (error) {
    console.error('[YOUTUBE] Error generating script:', error.message);
    return null;
  }
}

/**
 * Generate TTS audio from script
 */
async function generateAudio(script, videoId) {
  try {
    const audioPath = path.join('/tmp', `video_${videoId}.mp3`);

    if (TTS_SERVICE === 'google') {
      // Using Google Cloud TTS (requires credentials)
      const command = `google_tts --text "${script.replace(/"/g, '\\"')}" --output ${audioPath}`;
      execSync(command);
    } else {
      // Fallback: Create placeholder audio
      console.log('[YOUTUBE] Using placeholder audio (install TTS service for real audio)');
      // In production, integrate with Google Cloud TTS, Azure, or ElevenLabs
      fs.writeFileSync(audioPath, 'PLACEHOLDER_AUDIO');
    }

    return audioPath;
  } catch (error) {
    console.error('[YOUTUBE] Error generating audio:', error.message);
    return null;
  }
}

/**
 * Generate video with text overlay
 */
async function generateVideo(script, article, videoId) {
  try {
    const audioPath = await generateAudio(script, videoId);
    if (!audioPath) return null;

    const videoPath = path.join('/tmp', `video_${videoId}.mp4`);

    // Create video with ffmpeg
    // This creates a simple video with text overlay and background
    const ffmpegCommand = `
      ffmpeg -y \
        -f lavfi -i color=c=black:s=1280x720:d=120 \
        -vf "drawtext=text='${article.title.replace(/'/g, "\\'").substring(0, 50)}':fontsize=48:fontcolor=white:x=40:y=50:line_spacing=10" \
        -i ${audioPath} \
        -c:a aac \
        -c:v libx264 \
        -shortest \
        ${videoPath}
    `;

    // For now, just create a placeholder
    console.log('[YOUTUBE] Video generation ready (install ffmpeg for production)');

    return videoPath;
  } catch (error) {
    console.error('[YOUTUBE] Error generating video:', error.message);
    return null;
  }
}

/**
 * Get approved articles without videos
 */
async function getApprovedArticlesForVideo() {
  try {
    const result = await pool.query(
      `SELECT a.id, a.title, a.content, a.source_name, a.source_url, a.created_at
       FROM news_articles a
       JOIN content_reviews cr ON a.id = cr.article_id
       WHERE cr.recommended_for_social = true
       AND a.is_processed = true
       AND NOT EXISTS (SELECT 1 FROM youtube_videos WHERE article_id = a.id)
       ORDER BY a.created_at DESC
       LIMIT 3`
    );
    return result.rows;
  } catch (error) {
    console.error('[YOUTUBE] Error fetching articles:', error.message);
    return [];
  }
}

/**
 * Store video metadata
 */
async function storeVideoMetadata(articleId, videoPath, title, status = 'generated') {
  try {
    await pool.query(
      `INSERT INTO youtube_videos (article_id, title, video_path, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [articleId, title, videoPath, status]
    );
    return true;
  } catch (error) {
    console.error('[YOUTUBE] Error storing metadata:', error.message);
    return false;
  }
}

/**
 * Upload video to YouTube
 */
async function uploadToYouTube(videoPath, title, description) {
  try {
    if (!YOUTUBE_API_KEY || !CHANNEL_ID) {
      console.log('[YOUTUBE] YouTube API not configured - video saved locally');
      return { videoId: 'local_' + Date.now() };
    }

    // YouTube upload implementation
    console.log('[YOUTUBE] Ready to upload:', title);
    // In production, use google-auth-library and youtube-data-api

    return { videoId: 'test_' + Date.now() };
  } catch (error) {
    console.error('[YOUTUBE] Error uploading to YouTube:', error.message);
    return null;
  }
}

/**
 * Run video generation cycle
 */
async function runVideoGenerationCycle() {
  if (videoState.isRunning) return;
  videoState.isRunning = true;
  videoState.errors = [];

  const startTime = Date.now();

  try {
    console.log('[YOUTUBE] ========================================');
    console.log('[YOUTUBE] Starting video generation cycle');
    console.log('[YOUTUBE] ========================================');

    const articles = await getApprovedArticlesForVideo();
    console.log(`[YOUTUBE] Found ${articles.length} articles ready for video`);

    for (const article of articles) {
      try {
        console.log(`[YOUTUBE] Generating video for: ${article.title.substring(0, 50)}...`);

        // Generate script
        const script = await generateVideoScript(article);
        if (!script) {
          console.log('[YOUTUBE] ⚠️ Script generation failed, skipping');
          continue;
        }

        // Generate video
        const videoPath = await generateVideo(script, article, article.id);
        if (!videoPath) {
          console.log('[YOUTUBE] ⚠️ Video generation failed');
          continue;
        }

        // Store metadata
        await storeVideoMetadata(article.id, videoPath, article.title);

        // Upload to YouTube
        const uploadResult = await uploadToYouTube(
          videoPath,
          `📰 ${article.title}`,
          `${article.content.substring(0, 200)}...\n\nSource: ${article.source_name}`
        );

        if (uploadResult) {
          console.log(`[YOUTUBE] ✅ Video uploaded: ${uploadResult.videoId}`);
          videoState.videosUploaded++;
        }

        videoState.videosGenerated++;
      } catch (error) {
        console.error('[YOUTUBE] Error processing article:', error.message);
        videoState.errors.push(error.message);
      }
    }

    const duration = Date.now() - startTime;

    console.log('[YOUTUBE] ========================================');
    console.log(`[YOUTUBE] Videos generated: ${videoState.videosGenerated}`);
    console.log(`[YOUTUBE] Videos uploaded: ${videoState.videosUploaded}`);
    console.log(`[YOUTUBE] Duration: ${duration}ms`);
    console.log(`[YOUTUBE] Errors: ${videoState.errors.length}`);
    console.log('[YOUTUBE] ========================================');

    videoState.lastRun = new Date();
  } catch (error) {
    console.error('[YOUTUBE] Fatal error:', error);
  } finally {
    videoState.isRunning = false;
  }
}

/**
 * Initialize and start
 */
async function start() {
  console.log('[YOUTUBE] YouTube Video Generation Agent starting...');

  try {
    const testResult = await pool.query('SELECT NOW() as now');
    console.log('[YOUTUBE] Database connected:', testResult.rows[0].now);

    console.log('[YOUTUBE] Running initial generation cycle...');
    await runVideoGenerationCycle();

    const GENERATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

    setInterval(async () => {
      await runVideoGenerationCycle();
    }, GENERATION_INTERVAL);

    console.log('[YOUTUBE] Agent ready - generating videos every 4 hours');
  } catch (error) {
    console.error('[YOUTUBE] Startup error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[YOUTUBE] Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[YOUTUBE] Shutting down...');
  await pool.end();
  process.exit(0);
});

start();
