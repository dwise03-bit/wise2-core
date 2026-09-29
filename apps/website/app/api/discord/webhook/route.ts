import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Webhook receiver for GitHub events
 * Forwards events to Discord channels for visibility
 *
 * Supported events:
 * - push: Code pushed to repository
 * - pull_request: PR created, merged, or updated
 * - workflow_run: GitHub Actions workflow completed
 * - release: New release published
 */

const WEBHOOK_URLS = {
  builds: process.env.DISCORD_WEBHOOK_BUILDS,
  deployments: process.env.DISCORD_WEBHOOK_DEPLOYMENTS,
  alerts: process.env.DISCORD_WEBHOOK_ALERTS,
  decisions: process.env.DISCORD_WEBHOOK_DECISIONS,
};

interface GitHubEvent {
  [key: string]: any;
}

async function sendDiscordMessage(
  webhookUrl: string | undefined,
  embeds: any[]
) {
  if (!webhookUrl) {
    console.warn('Webhook URL not configured');
    return;
  }

  try {
    await axios.post(webhookUrl, { embeds });
  } catch (error) {
    console.error('Failed to send Discord message:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: GitHubEvent = await request.json();
    const githubEvent = request.headers.get('x-github-event');

    console.log('GitHub webhook received:', githubEvent);

    // Handle push events
    if (githubEvent === 'push') {
      const { ref, commits, pusher } = payload;
      const branch = ref?.split('/').pop() || 'unknown';
      const commitCount = commits?.length || 0;

      const embed = {
        title: `Push to ${branch}`,
        color: 0x0099ff,
        fields: [
          {
            name: 'Commits',
            value: commitCount.toString(),
            inline: true,
          },
          {
            name: 'Author',
            value: pusher?.name || 'Unknown',
            inline: true,
          },
          {
            name: 'Latest Message',
            value:
              commits?.[commits.length - 1]?.message?.split('\n')[0] || 'No message',
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'GitHub' },
      };

      await sendDiscordMessage(WEBHOOK_URLS.builds, [embed]);
    }

    // Handle pull request events
    if (githubEvent === 'pull_request') {
      const { action, pull_request } = payload;
      const actionUpper = action?.toUpperCase() || 'UPDATED';
      const colorMap: Record<string, number> = {
        OPENED: 0x00aa00,
        CLOSED: 0xaa0000,
        MERGED: 0x0099ff,
        UPDATED: 0xffaa00,
      };

      const embed = {
        title: `PR ${actionUpper}: ${pull_request?.title}`,
        description: pull_request?.body?.slice(0, 200) || '',
        url: pull_request?.html_url,
        color: colorMap[actionUpper] || 0x888888,
        fields: [
          {
            name: 'Author',
            value: pull_request?.user?.login || 'Unknown',
            inline: true,
          },
          {
            name: 'Branch',
            value: `${pull_request?.head?.ref} → ${pull_request?.base?.ref}`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'GitHub' },
      };

      await sendDiscordMessage(WEBHOOK_URLS.builds, [embed]);
    }

    // Handle workflow events (GitHub Actions)
    if (githubEvent === 'workflow_run') {
      const { action, workflow_run, workflow } = payload;
      const { name, conclusion, status, html_url } = workflow_run;

      const statusColors: Record<string, number> = {
        success: 0x00aa00,
        failure: 0xaa0000,
        cancelled: 0x888888,
        skipped: 0x888888,
      };

      const embed = {
        title: `Workflow: ${name}`,
        description: `Status: **${conclusion || status}**`,
        url: html_url,
        color: statusColors[conclusion || status] || 0xffaa00,
        fields: [
          {
            name: 'Workflow',
            value: workflow?.name || 'Unknown',
            inline: true,
          },
          {
            name: 'Run ID',
            value: workflow_run?.id?.toString() || 'Unknown',
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'GitHub Actions' },
      };

      const webhookUrl =
        conclusion === 'success' ? WEBHOOK_URLS.deployments : WEBHOOK_URLS.alerts;
      await sendDiscordMessage(webhookUrl, [embed]);
    }

    // Handle release events
    if (githubEvent === 'release') {
      const { action, release } = payload;
      const { tag_name, name, body, author, html_url } = release;

      const embed = {
        title: `Release: ${name || tag_name}`,
        description: body?.slice(0, 200) || 'No description',
        url: html_url,
        color: 0x00aa00,
        fields: [
          {
            name: 'Tag',
            value: tag_name,
            inline: true,
          },
          {
            name: 'Author',
            value: author?.login || 'Unknown',
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'GitHub' },
      };

      await sendDiscordMessage(WEBHOOK_URLS.deployments, [embed]);
    }

    return NextResponse.json({ ok: true, event: githubEvent });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Discord expects a 200 response quickly
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
