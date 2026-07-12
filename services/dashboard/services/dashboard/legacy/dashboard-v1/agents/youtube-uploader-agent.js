// YouTube Uploader Agent — automatically uploads generated videos to YouTube
// Runs every 5 minutes, finds pending videos, uploads them

require("dotenv").config();
const pg = require("pg");
const YouTubeUploader = require("../lib/youtube-uploader");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const uploader = new YouTubeUploader();

async function uploadPendingVideos() {
  try {
    if (!uploader.isConfigured()) {
      console.log("[YT-UPLOAD] No OAuth token configured yet. Run:");
      console.log("   cd dashboard && node scripts/youtube-auth.js");
      return;
    }

    // Find videos ready for upload
    const result = await pool.query(
      `SELECT yv.id, yv.article_id, yv.title, yv.description, yv.video_path, yv.status
       FROM youtube_videos yv
       WHERE yv.status = 'ready' AND yv.video_path IS NOT NULL
       ORDER BY yv.created_at ASC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      console.log("[YT-UPLOAD] No videos ready for upload");
      return;
    }

    const video = result.rows[0];
    console.log(`\n[YT-UPLOAD] Uploading video #${video.id}...`);

    try {
      const uploadResult = await uploader.upload(video.video_path, {
        title: video.title,
        description: video.description,
        tags: ["2A", "SecondAmendment", "News", "BreakingNews"],
        privacyStatus: "public",
      });

      if (uploadResult.simulated) {
        // No OAuth — just log it
        console.log("[YT-UPLOAD] Simulated (no OAuth token)");
      } else {
        // Real upload
        await pool.query(
          `UPDATE youtube_videos
           SET status='uploaded', youtube_video_id=$1, youtube_url=$2, uploaded_at=NOW()
           WHERE id=$3`,
          [uploadResult.youtubeVideoId, uploadResult.youtubeUrl, video.id]
        );

        console.log(`[YT-UPLOAD] ✅ Video #${video.id} uploaded!`);
        console.log(`[YT-UPLOAD] URL: ${uploadResult.youtubeUrl}`);
      }
    } catch (uploadErr) {
      console.error(`[YT-UPLOAD] Upload failed: ${uploadErr.message}`);
      // Mark as failed and move on
      await pool.query(
        `UPDATE youtube_videos SET status='failed' WHERE id=$1`,
        [video.id]
      );
    }
  } catch (error) {
    console.error("[YT-UPLOAD] Error:", error.message);
  }
}

// Run every 5 minutes
const interval = setInterval(uploadPendingVideos, 300000);
uploadPendingVideos(); // First run immediately

process.on("SIGTERM", () => {
  console.log("[YT-UPLOAD] Shutting down");
  clearInterval(interval);
  pool.end();
  process.exit(0);
});
