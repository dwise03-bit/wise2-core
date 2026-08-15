/**
 * PM2 Configuration File
 *
 * This file configures PM2 process management for background agents.
 * Deploy with: pm2 start ecosystem.config.js
 *
 * Agents in this project:
 * - scheduler-agent: Sends reminder emails and cancellation notifications
 * - engagement-agent: Tracks user engagement and member progress
 * - news-scraper: Scrapes 2nd Amendment news every 4 hours
 * - content-reviewer: Reviews scraped articles for relevance and sentiment
 * - social-media-agent: Generates and posts social media content
 * - telegram-bot: Sends Telegram notifications and tips
 * - discord-bot: Discord server integration and commands
 */

// Load .env file before configuring apps
const fs = require('fs');
const path = require('path');
const dotenvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(dotenvPath)) {
  const envFile = fs.readFileSync(dotenvPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && key.trim() && !process.env[key.trim()]) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

module.exports = {
  apps: [
    {
      name: 'scheduler-agent',
      script: './agents/scheduler-agent.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'engagement-agent',
      script: './agents/engagement-agent.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'news-scraper',
      script: './agents/news-scraper.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        NEWS_API_KEY: process.env.NEWS_API_KEY,
      },
    },
    {
      name: 'content-reviewer',
      script: './agents/content-reviewer.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      },
    },
    {
      name: 'social-media-agent',
      script: './agents/social-media-agent.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        OLLAMA_API: process.env.OLLAMA_API || 'http://localhost:11434/api/generate',
        OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama2',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
        TWITTER_API_KEY: process.env.TWITTER_API_KEY,
        TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
        INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
        INSTAGRAM_BUSINESS_ACCOUNT_ID: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
        LINKEDIN_ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN,
        LINKEDIN_ORG_ID: process.env.LINKEDIN_ORG_ID,
      },
    },
    {
      name: 'discord-alerts',
      script: './agents/discord-alerts.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        DISCORD_NEWS_WEBHOOK_URL: process.env.DISCORD_NEWS_WEBHOOK_URL,
        DISCORD_BREAKING_NEWS_WEBHOOK_URL: process.env.DISCORD_BREAKING_NEWS_WEBHOOK_URL,
        DISCORD_2A_ROLE_ID: process.env.DISCORD_2A_ROLE_ID,
        DISCORD_ALERT_ROLE_ID: process.env.DISCORD_ALERT_ROLE_ID,
        DISCORD_BREAKING_NEWS_ROLE_ID: process.env.DISCORD_BREAKING_NEWS_ROLE_ID,
      },
    },
    {
      name: 'discord-approval-workflow',
      script: './agents/discord-approval-workflow.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        DISCORD_NEWS_WEBHOOK_URL: process.env.DISCORD_NEWS_WEBHOOK_URL,
        DISCORD_APPROVAL_CHANNEL_ID: process.env.DISCORD_APPROVAL_CHANNEL_ID,
      },
    },
    {
      name: 'youtube-video-agent',
      script: './agents/youtube-video-agent.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        OLLAMA_API: process.env.OLLAMA_API || 'http://localhost:11434/api/generate',
        OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'mistral:latest',
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
        YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
        TTS_SERVICE: process.env.TTS_SERVICE || 'google',
      },
    },
    {
      name: 'discord-content-bot',
      script: './agents/discord-content-bot.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
        DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
        DISCORD_APPROVAL_CHANNEL_ID: process.env.DISCORD_APPROVAL_CHANNEL_ID,
      },
    },
    {
      name: 'submission-api',
      script: './agents/submission-api.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      },
    },
    {
      name: 'quality-scoring-agent',
      script: './agents/quality-scoring-agent.js',
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'mistral',
      },
    },
    // {
    //   name: 'telegram-bot',
    //   script: './agents/telegram-bot.js',
    //   instances: 1,
    //   exec_mode: 'fork',
    // },
    // {
    //   name: 'discord-bot',
    //   script: './agents/discord-bot.js',
    //   instances: 1,
    //   exec_mode: 'fork',
    // },
  ],
};
