import { BotBase } from '../BotBase.js';
import { EmbedBuilder, ChannelType } from 'discord.js';
import axios from 'axios';
import pino from 'pino';

const logger = pino();

export class GitHubBot extends BotBase {
  private githubToken: string;
  private githubAPI = 'https://api.github.com';

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.githubToken = process.env.GITHUB_TOKEN || '';
    this.registerCommands();
  }

  getBotName(): string {
    return 'GitHubBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'gh-sync',
      description: 'Sync repository',
      usage: '!gh-sync <owner>/<repo>',
      execute: async (args, context) => {
        const repo = args.join('/');
        if (!repo) {
          await context.message.reply('❌ Usage: `!gh-sync owner/repo`');
          return;
        }
        await this.syncRepository(repo, context.message);
      },
    });

    this.registerCommand({
      name: 'gh-issues',
      description: 'Show open issues',
      usage: '!gh-issues <owner>/<repo>',
      execute: async (args, context) => {
        const repo = args.join('/');
        if (!repo) {
          await context.message.reply('❌ Usage: `!gh-issues owner/repo`');
          return;
        }
        await this.showIssues(repo, context.message);
      },
    });

    this.registerCommand({
      name: 'gh-prs',
      description: 'Show pull requests',
      usage: '!gh-prs <owner>/<repo>',
      execute: async (args, context) => {
        const repo = args.join('/');
        if (!repo) {
          await context.message.reply('❌ Usage: `!gh-prs owner/repo`');
          return;
        }
        await this.showPullRequests(repo, context.message);
      },
    });

    this.registerCommand({
      name: 'gh-status',
      description: 'Repository status',
      usage: '!gh-status <owner>/<repo>',
      execute: async (args, context) => {
        const repo = args.join('/');
        if (!repo) {
          await context.message.reply('❌ Usage: `!gh-status owner/repo`');
          return;
        }
        await this.showStatus(repo, context.message);
      },
    });
  }

  private async syncRepository(repo: string, message: any): Promise<void> {
    try {
      const [owner, repoName] = repo.split('/');

      const repoData = await axios.get(`${this.githubAPI}/repos/${owner}/${repoName}`, {
        headers: { Authorization: `token ${this.githubToken}` },
      });

      const embed = new EmbedBuilder()
        .setColor(0x39ff14)
        .setTitle(`✅ ${repoName} Synced`)
        .setDescription(repoData.data.description || 'No description')
        .addFields(
          {
            name: 'Stars',
            value: `${repoData.data.stargazers_count}`,
            inline: true,
          },
          {
            name: 'Forks',
            value: `${repoData.data.forks_count}`,
            inline: true,
          },
          {
            name: 'Language',
            value: repoData.data.language || 'N/A',
            inline: true,
          },
        );

      await message.reply({ embeds: [embed] });
      logger.info(`Synced repository: ${owner}/${repoName}`);
    } catch (error) {
      await message.reply(`❌ Failed to sync repository: ${error}`);
      logger.error(`GitHub sync error: ${error}`);
    }
  }

  private async showIssues(repo: string, message: any): Promise<void> {
    try {
      const [owner, repoName] = repo.split('/');

      const issues = await axios.get(
        `${this.githubAPI}/repos/${owner}/${repoName}/issues?state=open&per_page=5`,
        {
          headers: { Authorization: `token ${this.githubToken}` },
        },
      );

      const fields = issues.data.slice(0, 5).map((issue: any) => ({
        name: `#${issue.number}: ${issue.title}`,
        value: `By ${issue.user.login} • ${issue.comments} comments`,
        inline: false,
      }));

      const embed = new EmbedBuilder()
        .setColor(0xff3333)
        .setTitle(`🐛 Open Issues - ${repoName}`)
        .addFields(...(fields.length > 0 ? fields : [{ name: 'No open issues', value: '✅' }]))
        .setFooter({ text: `Total: ${issues.data.length}` });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed to fetch issues: ${error}`);
      logger.error(`GitHub issues error: ${error}`);
    }
  }

  private async showPullRequests(repo: string, message: any): Promise<void> {
    try {
      const [owner, repoName] = repo.split('/');

      const prs = await axios.get(
        `${this.githubAPI}/repos/${owner}/${repoName}/pulls?state=open&per_page=5`,
        {
          headers: { Authorization: `token ${this.githubToken}` },
        },
      );

      const fields = prs.data.slice(0, 5).map((pr: any) => ({
        name: `#${pr.number}: ${pr.title}`,
        value: `By ${pr.user.login} • ${pr.reviews_comments} reviews`,
        inline: false,
      }));

      const embed = new EmbedBuilder()
        .setColor(0x00cc00)
        .setTitle(`📝 Pull Requests - ${repoName}`)
        .addFields(...(fields.length > 0 ? fields : [{ name: 'No open PRs', value: '✅' }]))
        .setFooter({ text: `Total: ${prs.data.length}` });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed to fetch PRs: ${error}`);
      logger.error(`GitHub PRs error: ${error}`);
    }
  }

  private async showStatus(repo: string, message: any): Promise<void> {
    try {
      const [owner, repoName] = repo.split('/');

      const repoData = await axios.get(`${this.githubAPI}/repos/${owner}/${repoName}`, {
        headers: { Authorization: `token ${this.githubToken}` },
      });

      const embed = new EmbedBuilder()
        .setColor(0x39ff14)
        .setTitle(`📊 ${repoName} Status`)
        .addFields(
          {
            name: 'Visibility',
            value: repoData.data.private ? 'Private' : 'Public',
            inline: true,
          },
          {
            name: 'Default Branch',
            value: repoData.data.default_branch,
            inline: true,
          },
          {
            name: 'Last Updated',
            value: `<t:${Math.floor(new Date(repoData.data.updated_at).getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: 'Topics',
            value: repoData.data.topics?.join(', ') || 'None',
            inline: false,
          },
        );

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed to get status: ${error}`);
      logger.error(`GitHub status error: ${error}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new GitHubBot();
  bot.connect();
}

export default GitHubBot;
