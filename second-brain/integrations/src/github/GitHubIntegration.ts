import { Octokit } from 'octokit';
import pino from 'pino';

const logger = pino();

export interface GitHubEvent {
  id: string;
  type: string;
  repo: string;
  author: string;
  timestamp: number;
  data: any;
}

export interface GitHubRepo {
  owner: string;
  name: string;
}

export class GitHubIntegration {
  private octokit: Octokit;
  private connected = false;
  private repos: GitHubRepo[] = [];

  constructor(token: string) {
    if (token) {
      this.octokit = new Octokit({ auth: token });
      this.initialize();
    } else {
      logger.warn('No GitHub token provided');
    }
  }

  private async initialize(): Promise<void> {
    try {
      const user = await this.octokit.rest.users.getAuthenticated();
      this.connected = true;
      logger.info(`Connected to GitHub as ${user.data.login}`);
    } catch (error) {
      logger.error(`Failed to connect to GitHub: ${error}`);
      this.connected = false;
    }
  }

  /**
   * Sync repository to vault
   */
  async syncRepository(owner: string, repo: string): Promise<any> {
    if (!this.connected) {
      return { error: 'Not connected to GitHub' };
    }

    try {
      const repoData = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      const issues = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: 100,
      });

      const pullRequests = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 100,
      });

      return {
        repo: repoData.data,
        issues: issues.data,
        pullRequests: pullRequests.data,
      };
    } catch (error) {
      logger.error(`Failed to sync repository: ${error}`);
      return { error: String(error) };
    }
  }

  /**
   * Get repository issues
   */
  async getIssues(owner: string, repo: string, state: string = 'open'): Promise<any[]> {
    if (!this.connected) return [];

    try {
      const response = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: state as 'open' | 'closed' | 'all',
        per_page: 50,
      });

      return response.data.map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        author: issue.user?.login,
        labels: issue.labels.map((l: any) => l.name),
      }));
    } catch (error) {
      logger.error(`Failed to get issues: ${error}`);
      return [];
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(owner: string, repo: string, state: string = 'open'): Promise<any[]> {
    if (!this.connected) return [];

    try {
      const response = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: state as 'open' | 'closed' | 'all',
        per_page: 50,
      });

      return response.data.map((pr) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        author: pr.user?.login,
        head: pr.head.ref,
        base: pr.base.ref,
      }));
    } catch (error) {
      logger.error(`Failed to get pull requests: ${error}`);
      return [];
    }
  }

  /**
   * Create GitHub issue from vault document
   */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[],
  ): Promise<any> {
    if (!this.connected) return null;

    try {
      const response = await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels: labels || [],
      });

      logger.info(`Created GitHub issue: ${response.data.html_url}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create issue: ${error}`);
      return null;
    }
  }

  /**
   * Update GitHub issue
   */
  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: any,
  ): Promise<any> {
    if (!this.connected) return null;

    try {
      const response = await this.octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        ...updates,
      });

      logger.info(`Updated GitHub issue: ${issueNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update issue: ${error}`);
      return null;
    }
  }

  /**
   * Get repository contents (README, docs, etc)
   */
  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<any> {
    if (!this.connected) return null;

    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to get repository contents: ${error}`);
      return null;
    }
  }

  /**
   * Watch for repository webhooks
   */
  setupWebhook(owner: string, repo: string, webhookUrl: string): void {
    if (!this.connected) {
      logger.warn('Not connected to GitHub');
      return;
    }

    logger.info(`Setting up webhook for ${owner}/${repo} -> ${webhookUrl}`);
  }

  /**
   * Get user repositories
   */
  async getUserRepositories(): Promise<any[]> {
    if (!this.connected) return [];

    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: 'updated',
      });

      return response.data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        updated_at: repo.updated_at,
      }));
    } catch (error) {
      logger.error(`Failed to get user repositories: ${error}`);
      return [];
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
