require("dotenv").config();
const pg = require("pg");
const AdvancedVideoGenerator = require("../lib/advanced-video-generator");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const generator = new AdvancedVideoGenerator();

async function processVideoQueue() {
  try {
    // Get approved articles waiting for video generation
    const articles = await pool.query(
      `SELECT na.id, na.title, na.content, na.source_name as source_url
       FROM news_articles na
       LEFT JOIN youtube_videos yv ON na.id = yv.article_id
       WHERE na.current_quality_score >= 68
       AND yv.id IS NULL
       ORDER BY na.current_quality_score DESC
       LIMIT 5`
    );

    console.log(`[VIDEO-PRO] Processing ${articles.rows.length} articles`);

    for (const article of articles.rows) {
      try {
        // 1. Generate professional script
        console.log(`[VIDEO-PRO] Generating script for article #${article.id}`);
        const { script, engagementScore } = await generator.generateProfessionalScript(article);

        if (!script || engagementScore < 50) {
          console.log(`[VIDEO-PRO] Script quality too low (${engagementScore}/100), skipping`);
          continue;
        }

        // 2. Generate professional audio
        console.log(`[VIDEO-PRO] Generating audio...`);
        const audioPath = await generator.generateProfessionalAudio(script, article.id);

        if (!audioPath) {
          console.log(`[VIDEO-PRO] Audio generation failed`);
          continue;
        }

        // 3. Generate enhanced video
        console.log(`[VIDEO-PRO] Composing video...`);
        const videoResult = await generator.generateEnhancedVideo(script, article, audioPath, article.id);

        if (!videoResult) {
          console.log(`[VIDEO-PRO] Video composition failed`);
          continue;
        }

        // 4. Optimize for YouTube
        console.log(`[VIDEO-PRO] Optimizing for YouTube...`);
        const youtubeOptimization = await generator.optimizeForYouTube(article, script);

        // 5. Validate quality
        console.log(`[VIDEO-PRO] Validating quality...`);
        const qualityMetrics = await generator.validateVideoQuality(videoResult.path, script, article);

        if (!qualityMetrics.passed) {
          console.log(`[VIDEO-PRO] Quality validation failed`);
          continue;
        }

        // Save to database with video_path
        await pool.query(
          `INSERT INTO youtube_videos
           (article_id, title, script, description, video_path, status, created_at)
           VALUES ($1, $2, $3, $4, $5, 'pending_review', NOW())
           ON CONFLICT DO NOTHING`,
          [article.id, youtubeOptimization.title, script, youtubeOptimization.description, videoResult.path]
        );

        console.log(`[VIDEO-PRO] ✅ Video #${article.id} generated → ${videoResult.path} (Quality: ${qualityMetrics.overallScore}/100)`);
      } catch (error) {
        console.error(`[VIDEO-PRO] Error processing article #${article.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error("[VIDEO-PRO] Queue processing error:", error.message);
  }
}

// Run every 30 minutes
setInterval(processVideoQueue, 1800000);
processVideoQueue();

process.on("SIGTERM", () => {
  console.log("[VIDEO-PRO] Shutting down");
  pool.end();
  process.exit(0);
});
