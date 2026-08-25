#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function postToDiscord() {
  console.log('🚀 Posting Knight Wing video to Discord...');
  console.log('='.repeat(60));

  // Get webhook URL from environment or command line
  const webhookUrl = process.env.DISCORD_WEBHOOK_IMAGES || process.argv[2];

  if (!webhookUrl) {
    console.error('❌ Error: No Discord webhook URL provided');
    console.error('');
    console.error('Usage:');
    console.error('  DISCORD_WEBHOOK_IMAGES=<url> node scripts/post-video-to-discord.mjs');
    console.error('  OR');
    console.error('  node scripts/post-video-to-discord.mjs <webhook-url>');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/post-video-to-discord.mjs https://discord.com/api/webhooks/...');
    process.exit(1);
  }

  // Video file path
  const videoPath = path.join(
    __dirname,
    '../apps/website/public/assets/animations/knight_wing_30s.mp4'
  );

  if (!fs.existsSync(videoPath)) {
    console.error(`❌ Video file not found: ${videoPath}`);
    process.exit(1);
  }

  const videoSize = (fs.statSync(videoPath).size / 1024).toFixed(1);

  console.log(`📹 Video: knight_wing_30s.mp4 (${videoSize} KB)`);
  console.log('');

  // Create embed message
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
            name: '📦 Asset Location',
            value:
              '`apps/website/public/assets/animations/knight_wing_30s.mp4`',
            inline: true
          },
          {
            name: '🛠️ Generation Details',
            value:
              'Generated with Node.js Canvas + ffmpeg-static\nFree, open-source tools\nNo licensing restrictions\nReady for commercial use',
            inline: false
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

  try {
    await sendToDiscord(webhookUrl, payload);
    console.log('✅ Message posted successfully to Discord!');
    console.log('');
    console.log('📍 Check your Discord #images channel');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Download knight_wing_30s.mp4 from project assets');
    console.log('  2. Upload to social media platforms');
    console.log('  3. Share campaign link: https://wisedefensellc.com/assets/animations/knight_wing_30s.mp4');
  } catch (error) {
    console.error('❌ Failed to post:', error.message);
    process.exit(1);
  }
}

function sendToDiscord(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const jsonPayload = JSON.stringify(payload);

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

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(
            new Error(`Discord API returned ${res.statusCode}: ${data}`)
          );
        }
      });
    });

    req.on('error', reject);
    req.write(jsonPayload);
    req.end();
  });
}

postToDiscord();
