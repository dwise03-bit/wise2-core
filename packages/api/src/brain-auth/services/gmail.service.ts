import { Injectable } from '@nestjs/common';
import { GoogleOAuthService } from './google-oauth.service';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    mimeType: string;
    headers: Array<{ name: string; value: string }>;
    parts?: any[];
  };
  internalDate: string;
}

export interface GmailThread {
  id: string;
  snippet: string;
  historyId: string;
  messages: GmailMessage[];
}

@Injectable()
export class GmailService {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  /**
   * Get user's inbox messages
   */
  async getInboxMessages(userId: string, maxResults: number = 10) {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:inbox',
        maxResults,
      });

      const messages = response.data.messages || [];
      return {
        total: response.data.resultSizeEstimate || 0,
        messages: messages.map((m: any) => ({
          id: m.id,
          threadId: m.threadId,
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch inbox: ${message}`);
    }
  }

  /**
   * Get full message details
   */
  async getMessage(userId: string, messageId: string): Promise<GmailMessage> {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return response.data as GmailMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch message: ${message}`);
    }
  }

  /**
   * Extract email subject from message
   */
  private getMessageSubject(message: GmailMessage): string {
    const headers = message.payload?.headers || [];
    const subjectHeader = headers.find((h: any) => h.name === 'Subject');
    return subjectHeader?.value || '(No subject)';
  }

  /**
   * Extract sender email from message
   */
  private getMessageFrom(message: GmailMessage): string {
    const headers = message.payload?.headers || [];
    const fromHeader = headers.find((h: any) => h.name === 'From');
    return fromHeader?.value || 'Unknown sender';
  }

  /**
   * Get message body (text content)
   */
  private getMessageBody(message: GmailMessage): string {
    if (!message.payload) return '';

    const parts = message.payload.parts || [];
    const textPart = parts.find(
      (p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html',
    );

    if (textPart?.body?.data) {
      return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }

    return '';
  }

  /**
   * Get categorized inbox (unread, starred, etc.)
   */
  async getCategorizedInbox(userId: string) {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      const [unread, starred, all] = await Promise.all([
        gmail.users.messages.list({
          userId: 'me',
          q: 'is:unread in:inbox',
          maxResults: 5,
        }),
        gmail.users.messages.list({
          userId: 'me',
          q: 'is:starred in:inbox',
          maxResults: 5,
        }),
        gmail.users.messages.list({
          userId: 'me',
          q: 'in:inbox',
          maxResults: 10,
        }),
      ]);

      return {
        unread: {
          count: unread.data.resultSizeEstimate || 0,
          messages: (unread.data.messages || []).map((m: any) => m.id),
        },
        starred: {
          count: starred.data.resultSizeEstimate || 0,
          messages: (starred.data.messages || []).map((m: any) => m.id),
        },
        all: {
          count: all.data.resultSizeEstimate || 0,
          messages: (all.data.messages || []).map((m: any) => m.id),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch categorized inbox: ${message}`);
    }
  }

  /**
   * Get email thread with all messages
   */
  async getThread(userId: string, threadId: string): Promise<GmailThread> {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      const response = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      const thread = response.data as GmailThread;
      return {
        id: thread.id,
        snippet: thread.snippet,
        historyId: thread.historyId,
        messages: thread.messages || [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch thread: ${message}`);
    }
  }

  /**
   * Get message summary (subject, from, snippet)
   */
  async getMessageSummary(userId: string, messageId: string) {
    const message = await this.getMessage(userId, messageId);

    return {
      id: message.id,
      threadId: message.threadId,
      subject: this.getMessageSubject(message),
      from: this.getMessageFrom(message),
      snippet: message.snippet,
      date: message.internalDate,
      labels: message.labelIds || [],
    };
  }

  /**
   * Get recent unread messages with summaries
   */
  async getRecentUnreadSummaries(userId: string, limit: number = 5) {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread in:inbox',
        maxResults: limit,
      });

      const messages = response.data.messages || [];
      const summaries = await Promise.all(
        messages.map((m: any) => this.getMessageSummary(userId, m.id)),
      );

      return summaries;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch unread summaries: ${message}`);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(userId: string, messageId: string) {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to mark message as read: ${message}`);
    }
  }

  /**
   * Send email
   */
  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    body: string,
  ) {
    const gmail = await this.googleOAuthService.getGmailClient(userId);

    try {
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        body,
      ]
        .join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return {
        messageId: response.data.id,
        threadId: response.data.threadId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send email: ${message}`);
    }
  }
}
