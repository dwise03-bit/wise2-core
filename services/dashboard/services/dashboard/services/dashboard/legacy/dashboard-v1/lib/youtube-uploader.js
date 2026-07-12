// YouTube Uploader — uploads generated MP4s via YouTube Data API v3
// Requires: YOUTUBE_API_KEY + YOUTUBE_OAUTH_TOKEN (OAuth2 access token)

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

class YouTubeUploader {
  constructor() {
    this.oauthToken = process.env.YOUTUBE_OAUTH_TOKEN;
    this.channelId = process.env.YOUTUBE_CHANNEL_ID;
  }

  isConfigured() {
    return !!this.oauthToken;
  }

  // Upload a video file to YouTube
  async upload(videoPath, metadata) {
    if (!this.isConfigured()) {
      console.log("[YOUTUBE-UPLOAD] No OAuth token — skipping real upload, logging to DB only");
      return { simulated: true, youtubeVideoId: null, youtubeUrl: null };
    }

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const fileSize = fs.statSync(videoPath).size;
    console.log(`[YOUTUBE-UPLOAD] Uploading ${path.basename(videoPath)} (${(fileSize / 1024).toFixed(0)} KB)`);

    // Step 1: Initiate resumable upload session
    const initRes = await axios.post(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          categoryId: "25", // News & Politics
        },
        status: {
          privacyStatus: metadata.privacyStatus || "public",
          selfDeclaredMadeForKids: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.oauthToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/mp4",
          "X-Upload-Content-Length": fileSize,
        },
      }
    );

    const uploadUrl = initRes.headers.location;
    if (!uploadUrl) throw new Error("No upload URL returned from YouTube");

    // Step 2: Upload the file
    const videoStream = fs.createReadStream(videoPath);
    const uploadRes = await axios.put(uploadUrl, videoStream, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": fileSize,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const videoId = uploadRes.data.id;
    const videoUrl = `https://youtube.com/watch?v=${videoId}`;

    console.log(`[YOUTUBE-UPLOAD] ✅ Uploaded! ID: ${videoId}`);
    console.log(`[YOUTUBE-UPLOAD] URL: ${videoUrl}`);

    return { simulated: false, youtubeVideoId: videoId, youtubeUrl: videoUrl };
  }

  // Set thumbnail for an uploaded video (requires separate OAuth scope)
  async setThumbnail(videoId, thumbnailPath) {
    if (!this.isConfigured() || !fs.existsSync(thumbnailPath)) return false;

    try {
      const form = new FormData();
      form.append("image", fs.createReadStream(thumbnailPath));

      await axios.post(
        `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${this.oauthToken}`,
            ...form.getHeaders(),
          },
        }
      );
      console.log(`[YOUTUBE-UPLOAD] Thumbnail set for ${videoId}`);
      return true;
    } catch (err) {
      console.error("[YOUTUBE-UPLOAD] Thumbnail error:", err.message);
      return false;
    }
  }

  // Get OAuth setup instructions
  static getOAuthInstructions() {
    return `
YouTube OAuth2 Setup (one-time):
══════════════════════════════════════════════
1. Go to: https://console.cloud.google.com
2. Select your project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Desktop app type)
4. Download client_secrets.json to VPS dashboard/
5. Run: node dashboard/scripts/youtube-auth.js
6. Follow the URL, authorize, paste the code
7. Token saved to .env as YOUTUBE_OAUTH_TOKEN

Or use a service account with domain-wide delegation.
══════════════════════════════════════════════`;
  }
}

module.exports = YouTubeUploader;
