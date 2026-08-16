import express from 'express';
import pino from 'pino';
import { GitHubIntegration } from './github/GitHubIntegration.js';
import { DiscordIntegration } from './discord/DiscordIntegration.js';
import { EmailIntegration } from './email/EmailIntegration.js';
import { setupIntegrationRoutes } from './api/routes.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const PORT = process.env.INTEGRATIONS_PORT || 3004;

app.use(express.json());

// Initialize integrations
const github = new GitHubIntegration(process.env.GITHUB_TOKEN || '');
const discord = new DiscordIntegration(process.env.DISCORD_BOT_TOKEN || '');
const email = new EmailIntegration({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
});

// Setup routes
setupIntegrationRoutes(app, github, discord, email, logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    github: github.isConnected() ? 'connected' : 'disconnected',
    discord: discord.isConnected() ? 'connected' : 'disconnected',
    email: email.isConnected() ? 'connected' : 'disconnected',
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Integration Service running on port ${PORT}`);
});

export { app, github, discord, email };
