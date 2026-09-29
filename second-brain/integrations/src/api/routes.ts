import { Express, Request, Response } from 'express';
import { GitHubIntegration } from '../github/GitHubIntegration.js';
import { DiscordIntegration } from '../discord/DiscordIntegration.js';
import { EmailIntegration } from '../email/EmailIntegration.js';
import type { Logger } from 'pino';

export function setupIntegrationRoutes(
  app: Express,
  github: GitHubIntegration,
  discord: DiscordIntegration,
  email: EmailIntegration,
  logger: Logger,
): void {
  // GitHub routes
  app.get('/github/repositories', async (req: Request, res: Response) => {
    try {
      const repos = await github.getUserRepositories();
      res.json({ repositories: repos });
    } catch (error) {
      logger.error(`Error fetching repositories: ${error}`);
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  });

  app.get('/github/sync/:owner/:repo', async (req: Request, res: Response) => {
    const { owner, repo } = req.params;

    try {
      const syncData = await github.syncRepository(owner, repo);
      res.json(syncData);
    } catch (error) {
      logger.error(`Error syncing repository: ${error}`);
      res.status(500).json({ error: 'Failed to sync repository' });
    }
  });

  app.get('/github/issues/:owner/:repo', async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const { state } = req.query;

    try {
      const issues = await github.getIssues(owner, repo, state as string);
      res.json({ owner, repo, issues });
    } catch (error) {
      logger.error(`Error fetching issues: ${error}`);
      res.status(500).json({ error: 'Failed to fetch issues' });
    }
  });

  app.post('/github/issues/:owner/:repo', async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const { title, body, labels } = req.body;

    if (!title || !body) {
      res.status(400).json({ error: 'title and body required' });
      return;
    }

    try {
      const issue = await github.createIssue(owner, repo, title, body, labels);
      res.status(201).json(issue);
    } catch (error) {
      logger.error(`Error creating issue: ${error}`);
      res.status(500).json({ error: 'Failed to create issue' });
    }
  });

  // Discord routes
  app.post('/discord/message', async (req: Request, res: Response) => {
    const { channelId, content } = req.body;

    if (!channelId || !content) {
      res.status(400).json({ error: 'channelId and content required' });
      return;
    }

    try {
      const message = await discord.sendMessage(channelId, content);
      res.status(201).json(message);
    } catch (error) {
      logger.error(`Error sending Discord message: ${error}`);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.post('/discord/embed', async (req: Request, res: Response) => {
    const { channelId, embed } = req.body;

    if (!channelId || !embed) {
      res.status(400).json({ error: 'channelId and embed required' });
      return;
    }

    try {
      const message = await discord.sendEmbed(channelId, embed);
      res.status(201).json(message);
    } catch (error) {
      logger.error(`Error sending Discord embed: ${error}`);
      res.status(500).json({ error: 'Failed to send embed' });
    }
  });

  app.post('/discord/dm', async (req: Request, res: Response) => {
    const { userId, content } = req.body;

    if (!userId || !content) {
      res.status(400).json({ error: 'userId and content required' });
      return;
    }

    try {
      const message = await discord.sendDM(userId, content);
      res.status(201).json(message);
    } catch (error) {
      logger.error(`Error sending Discord DM: ${error}`);
      res.status(500).json({ error: 'Failed to send DM' });
    }
  });

  app.get('/discord/guild/:guildId/members', async (req: Request, res: Response) => {
    const { guildId } = req.params;

    try {
      const members = await discord.getGuildMembers(guildId);
      res.json({ guildId, members });
    } catch (error) {
      logger.error(`Error fetching guild members: ${error}`);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  });

  app.get('/discord/guild/:guildId/channels', async (req: Request, res: Response) => {
    const { guildId } = req.params;

    try {
      const channels = await discord.getGuildChannels(guildId);
      res.json({ guildId, channels });
    } catch (error) {
      logger.error(`Error fetching guild channels: ${error}`);
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  });

  // Email routes
  app.post('/email/send', async (req: Request, res: Response) => {
    const { to, subject, html, text } = req.body;

    if (!to || !subject) {
      res.status(400).json({ error: 'to and subject required' });
      return;
    }

    try {
      const result = await email.sendEmail({ to, subject, html, text });
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  app.post('/email/notify-vault-change', async (req: Request, res: Response) => {
    const { recipientEmail, documentTitle, changeType, author } = req.body;

    if (!recipientEmail || !documentTitle || !changeType || !author) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const result = await email.notifyVaultChange(
        recipientEmail,
        documentTitle,
        changeType,
        author,
      );
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Error sending notification: ${error}`);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  app.post('/email/alert', async (req: Request, res: Response) => {
    const { recipientEmail, title, message, severity } = req.body;

    if (!recipientEmail || !title || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const result = await email.sendAlert(
        recipientEmail,
        title,
        message,
        severity || 'info',
      );
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Error sending alert: ${error}`);
      res.status(500).json({ error: 'Failed to send alert' });
    }
  });
}
