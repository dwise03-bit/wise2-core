#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function postVideoToDiscord() {
  console.log('🚀 Uploading Knight Wing video to Discord...');
  console.log('='.repeat(60));

  const webhookUrl = process.env.DISCORD_WEBHOOK_IMAGES || process.argv[2];

  if (!webhookUrl) {
    console.error('❌ Error: No Discord webhook URL provided');
    process.exit(1);
  }

  const videoPath = path.join(
    __dirname,
    '../apps/website/public/assets/animations/knight_wing_30s.mp4'
  );

  if (!fs.existsSync(videoPath)) {
    console.error(`❌ Video file not found: ${videoPath}`);
    process.exit(1);
  }

  const videoBuffer = fs.readFileSync(videoPath);
  const videoSize = (videoBuffer.length / 1024).toFixed(1);

  console.log(`📹 Video: knight_wing_30s.mp4 (${videoSize} KB)`);
  console.log('');

  try {
    // First post the embed
    console.log('📤 Sending embed message...');
    await postEmbed(webhookUrl);
    console.log('✅ Embed posted');

    // Then upload the video file
    console.log('📹 Uploading video file...');
    await uploadVideoFile(webhookUrl, videoBuffer);
    console.log('✅ Video file uploaded');

    console.log('');
    console.log('🎉 Knight Wing video successfully delivered to Discord!');
    console.log('📍 Check your Discord #images channel');
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

function postEmbed(webhookUrl) {
  return new Promise((resolve, reject) => {
    const payload = {
      content: '🎬 **Knight Wing Viral Ad - Ready to Ship**',
      embeds: [
        {
          title: '✅ 30-Second Professional Video Generated',
          description:
            'High-quality MP4 animation ready for Facebook viral distribution, YouTube, TikTok, and all social platforms.',
          color: 16711710,
          fields: [
            {
              name: '📊 Video Specifications',
              value:
                '• **Format**: MP4 (h264 codec)\n• **Resolution**: 1080×1080 (square format)\n• **Duration**: 30 seconds @ 30 fps\n• **File Size**: 187 KB\n• **Bitrate**: 51.1 kbps\n• **Color Depth**: 8-bit YUV420',
              inline: false
            },
            {
              name: '🎞️ Animation Sequence',
              value:
                '**Phase 1** (0-8s) 🔴 Headlight Pulse\nRed neon glow pulses on tactical vehicle headlights\n\n**Phase 2** (8-16s) 🔵 Dashboard Tech Activation\nBlue dashboard illuminates with neon green scan lines\n\n**Phase 3** (16-24s) 🟦 Operator Focus\nSilhouette of tactical operator glows blue against NYC skyline\n\n**Phase 4** (24-30s) 💥 Logo Reveal\nRed accent overlay, "KNIGHT WING" fades in with tagline "STAY READY. STAY WISE."',
              inline: false
            },
            {
              name: '🚀 Distribution Ready',
              value:
                '✅ Facebook Viral (square)\n✅ Instagram Reels/Stories\n✅ TikTok\n✅ YouTube Shorts\n✅ Twitter/X Video\n✅ LinkedIn Video',
              inline: true
            },
            {
              name: '🛠️ Generation Details',
              value:
                'Generated with Node.js Canvas + ffmpeg-static\nFree, open-source tools\nNo licensing restrictions\nReady for commercial use',
              inline: true
            }
          ],
          image: {
            url: 'https://wisedefensellc.com/assets/animations/nightwing-design.png'
          },
          footer: {
            text: 'Knight Wing Campaign | Delivered via Hermes Image Orchestrator'
          }
        }
      ]
    };

    const jsonPayload = JSON.stringify(payload);
    const url = new URL(webhookUrl);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonPayload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(jsonPayload);
    req.end();
  });
}

function uploadVideoFile(webhookUrl, videoBuffer) {
  return new Promise((resolve, reject) => {
    const boundary = randomBytes(16).toString('hex');
    const CRLF = '\r\n';

    // Build multipart form data
    let body = '';

    // Add content field
    body += `--${boundary}${CRLF}`;
    body += `Content-Disposition: form-data; name="content"${CRLF}${CRLF}`;
    body += `🎬 **Knight Wing Video File - 30 Second Animation**${CRLF}`;

    // Add file field
    body += `--${boundary}${CRLF}`;
    body += `Content-Disposition: form-data; name="file"; filename="knight_wing_30s.mp4"${CRLF}`;
    body += `Content-Type: video/mp4${CRLF}${CRLF}`;

    const bodyStart = Buffer.from(body);
    const bodyEnd = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);

    const totalLength =
      bodyStart.length + videoBuffer.length + bodyEnd.length;

    const url = new URL(webhookUrl);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);

    req.write(bodyStart);
    req.write(videoBuffer);
    req.write(bodyEnd);
    req.end();
  });
}

postVideoToDiscord();
