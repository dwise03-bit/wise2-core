import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { GmailService } from '../services/gmail.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/gmail')
@UseGuards(JwtGuard, PermissionGuard)
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  /**
   * Get user's inbox messages
   */
  @Get('inbox')
  @RequirePermission('read_documents')
  async getInbox(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const maxResults = limit ? Math.min(parseInt(limit, 10), 50) : 10;

    const inbox = await this.gmailService.getInboxMessages(userId, maxResults);

    return {
      total: inbox.total,
      messages: inbox.messages,
    };
  }

  /**
   * Get categorized inbox view
   */
  @Get('inbox/categorized')
  @RequirePermission('read_documents')
  async getCategorizedInbox(@Request() req) {
    const userId = req.user.sub;

    const categorized = await this.gmailService.getCategorizedInbox(userId);

    return categorized;
  }

  /**
   * Get message details
   */
  @Get('messages/:messageId')
  @RequirePermission('read_documents')
  async getMessage(
    @Request() req,
    @Query('messageId') messageId?: string,
  ) {
    if (!messageId) {
      throw new BadRequestException('messageId query parameter required');
    }

    const userId = req.user.sub;
    const message = await this.gmailService.getMessage(userId, messageId);

    return message;
  }

  /**
   * Get message summary (subject, from, snippet)
   */
  @Get('messages/:messageId/summary')
  @RequirePermission('read_documents')
  async getMessageSummary(
    @Request() req,
    @Query('messageId') messageId?: string,
  ) {
    if (!messageId) {
      throw new BadRequestException('messageId query parameter required');
    }

    const userId = req.user.sub;
    const summary = await this.gmailService.getMessageSummary(userId, messageId);

    return summary;
  }

  /**
   * Get recent unread messages
   */
  @Get('unread')
  @RequirePermission('read_documents')
  async getUnreadMessages(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const maxResults = limit ? Math.min(parseInt(limit, 10), 20) : 5;

    const unread = await this.gmailService.getRecentUnreadSummaries(
      userId,
      maxResults,
    );

    return {
      count: unread.length,
      messages: unread,
    };
  }

  /**
   * Get thread/conversation
   */
  @Get('threads/:threadId')
  @RequirePermission('read_documents')
  async getThread(
    @Request() req,
    @Query('threadId') threadId?: string,
  ) {
    if (!threadId) {
      throw new BadRequestException('threadId query parameter required');
    }

    const userId = req.user.sub;
    const thread = await this.gmailService.getThread(userId, threadId);

    return thread;
  }

  /**
   * Mark message as read
   */
  @Post('messages/:messageId/mark-read')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Request() req,
    @Query('messageId') messageId?: string,
  ) {
    if (!messageId) {
      throw new BadRequestException('messageId query parameter required');
    }

    const userId = req.user.sub;
    await this.gmailService.markAsRead(userId, messageId);

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Send email
   */
  @Post('send')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async sendEmail(
    @Request() req,
    @Body() body: { to: string; subject: string; body: string },
  ) {
    if (!body.to || !body.subject || !body.body) {
      throw new BadRequestException('to, subject, and body are required');
    }

    const userId = req.user.sub;
    const result = await this.gmailService.sendEmail(
      userId,
      body.to,
      body.subject,
      body.body,
    );

    return {
      success: true,
      messageId: result.messageId,
      threadId: result.threadId,
    };
  }
}
