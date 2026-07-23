import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { QueueService, JobType } from '@app/queue/queue.service';
import Anthropic from '@anthropic-ai/sdk';
import { google } from 'googleapis';
import { differenceInHours, addHours, formatDistanceToNow } from 'date-fns';

/**
 * Post-Call Summary Service
 * Handles automated post-call processing:
 * - Fetches Google Meet recording and transcript
 * - Generates AI summary using Claude
 * - Sends branded email to user
 * - Notifies consultant
 * - Stores summary in database
 * - Includes retry logic and error handling
 */
@Injectable()
export class PostCallSummaryService {
  private readonly logger = new Logger('PostCallSummaryService');
  private anthropic: Anthropic;
  private calendar: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    private queueService: QueueService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });

    // Initialize Google Calendar API
    this.initializeGoogleCalendar();
  }

  /**
   * Initialize Google Calendar API client
   */
  private initializeGoogleCalendar() {
    try {
      const credentials = JSON.parse(
        this.configService.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '{}',
      );

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.logger.log('✅ Google Calendar API initialized');
    } catch (error) {
      this.logger.warn('⚠️ Google Calendar API initialization failed - will retry at job time', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check if booking qualifies for post-call summary
   * Should run 2-3 hours after booking end time
   */
  async checkAndProcessPastBookings(): Promise<number> {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    // Find completed bookings without summaries
    const completedBookings = await this.prisma.booking.findMany({
      where: {
        status: 'completed',
        endTime: {
          gte: threeHoursAgo,
          lte: twoHoursAgo,
        },
        postCallSummary: null,
      },
      include: {
        user: true,
        consultant: true,
        service: true,
      },
    });

    this.logger.log(`Found ${completedBookings.length} bookings ready for post-call processing`);

    let processedCount = 0;
    for (const booking of completedBookings) {
      try {
        await this.schedulePostCallProcessing(booking);
        processedCount++;
      } catch (error) {
        this.logger.error(`Failed to schedule processing for booking ${booking.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return processedCount;
  }

  /**
   * Schedule post-call processing via queue
   */
  async schedulePostCallProcessing(booking: any): Promise<void> {
    await this.queueService.enqueueJob(
      JobType.PROCESS_POST_CALL_SUMMARY,
      {
        bookingId: booking.id,
      },
      {
        priority: 70, // High priority
        maxRetries: 3,
      },
    );

    this.logger.log(`📅 Scheduled post-call processing for booking ${booking.id}`);
  }

  /**
   * Main processing function - called by queue worker
   */
  async processPostCallSummary(bookingId: string): Promise<void> {
    this.logger.log(`🔄 Processing post-call summary for booking: ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        consultant: true,
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found: ${bookingId}`);
    }

    if (booking.postCallSummary) {
      this.logger.log(`⏭️ Summary already exists for booking ${bookingId}`);
      return;
    }

    try {
      // Step 1: Fetch recording and transcript
      this.logger.log('📹 Fetching Google Meet recording...');
      const { recordingUrl, transcript } = await this.fetchMeetingRecording(booking);

      // Step 2: Generate AI summary
      this.logger.log('🤖 Generating AI summary with Claude...');
      const { summary, actionItems, followUpDate } = await this.generateAISummary(
        booking,
        transcript,
      );

      // Step 3: Store in database
      this.logger.log('💾 Storing summary in database...');
      const postCallSummary = await this.prisma.postCallSummary.create({
        data: {
          bookingId,
          recordingUrl,
          transcript,
          summary,
          followUpDate,
          actionItems: {
            create: actionItems,
          },
        },
        include: {
          actionItems: true,
        },
      });

      // Step 4: Send branded email to user
      this.logger.log('📧 Sending branded email to user...');
      await this.sendPostCallEmail(booking, postCallSummary);

      // Step 5: Notify consultant
      this.logger.log('🔔 Notifying consultant...');
      await this.notifyConsultant(booking, postCallSummary);

      // Step 6: Mark summary as sent
      await this.prisma.postCallSummary.update({
        where: { id: postCallSummary.id },
        data: { sentAt: new Date() },
      });

      this.logger.log(`✅ Post-call summary completed for booking: ${bookingId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to process post-call summary for booking ${bookingId}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Queue for retry via job queue
      await this.queueService.enqueueJob(
        JobType.PROCESS_POST_CALL_SUMMARY,
        { bookingId, retryAttempt: (arguments[1] || 0) + 1 },
        {
          priority: 50,
          maxRetries: 3,
        },
      );

      throw error;
    }
  }

  /**
   * Fetch Google Meet recording and transcript
   */
  private async fetchMeetingRecording(booking: any): Promise<{
    recordingUrl: string | null;
    transcript: string | null;
  }> {
    try {
      // If meeting link doesn't exist, return nulls
      if (!booking.meetingLink) {
        this.logger.warn(`No meeting link for booking ${booking.id}`);
        return { recordingUrl: null, transcript: null };
      }

      // Extract meeting ID from Google Meet link
      const meetingId = this.extractMeetingId(booking.meetingLink);
      if (!meetingId) {
        this.logger.warn(`Could not extract meeting ID from link: ${booking.meetingLink}`);
        return { recordingUrl: null, transcript: null };
      }

      // Search for recordings in Google Drive
      const recordingUrl = await this.findRecordingInDrive(meetingId, booking.startTime);

      // Fetch transcript from Google Meet if available
      const transcript = await this.fetchTranscript(booking);

      return { recordingUrl, transcript };
    } catch (error) {
      this.logger.error('Failed to fetch meeting recording', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { recordingUrl: null, transcript: null };
    }
  }

  /**
   * Extract meeting ID from Google Meet link
   */
  private extractMeetingId(meetingLink: string): string | null {
    // Format: https://meet.google.com/abc-defg-hij
    const match = meetingLink.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    return match ? match[1] : null;
  }

  /**
   * Find recording in Google Drive for a meeting
   */
  private async findRecordingInDrive(
    meetingId: string,
    startTime: Date,
  ): Promise<string | null> {
    try {
      // Search for video files created around meeting time
      const startDate = new Date(startTime.getTime() - 1 * 60 * 60 * 1000); // 1 hour before
      const endDate = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours after

      if (!this.calendar) {
        this.logger.warn('Google Calendar API not initialized, skipping recording fetch');
        return null;
      }

      const drive = google.drive({ version: 'v3', auth: this.calendar.context.auth });

      const response = await drive.files.list({
        q: `mimeType='video/mp4' and createdTime>='${startDate.toISOString()}' and createdTime<='${endDate.toISOString()}'`,
        fields: 'files(id, name, webViewLink, createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 5,
      });

      if (response.data.files && response.data.files.length > 0) {
        const recording = response.data.files[0];
        this.logger.log(`Found recording: ${recording.name}`, {
          fileId: recording.id,
          createdTime: recording.createdTime,
        });
        return recording.webViewLink || `https://drive.google.com/file/d/${recording.id}/view`;
      }

      this.logger.warn('No recording found in Google Drive');
      return null;
    } catch (error) {
      this.logger.error('Failed to search Google Drive for recordings', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Fetch transcript from Google Meet
   * Note: Google Meet auto-generates transcripts for recordings
   */
  private async fetchTranscript(booking: any): Promise<string | null> {
    try {
      // Check if transcript exists in booking metadata or Calendar event
      // This would need the actual transcript from Meet which requires Google Meet API access
      // As a fallback, we can use the booking notes or return null if not available

      this.logger.log('Checking for transcript availability...');

      // TODO: Implement actual transcript fetching from Google Meet API
      // For now, return null - will be populated once Meet API access is available

      return null;
    } catch (error) {
      this.logger.error('Failed to fetch transcript', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Generate AI summary using Claude API
   */
  private async generateAISummary(
    booking: any,
    transcript: string | null,
  ): Promise<{
    summary: string;
    actionItems: Array<{ title: string; description: string; owner: string; dueDate: Date }>;
    followUpDate: Date;
  }> {
    const content = transcript || booking.notes || 'No transcript or notes available';

    const prompt = `You are a professional business consultant helping create post-call summaries.

Booking Details:
- Service: ${booking.service.name}
- Duration: ${booking.durationHours} hours
- Date: ${booking.startTime.toLocaleDateString()}
- Consultant: ${booking.consultant.name}
- Client: ${booking.user.name}

Transcript/Notes:
${content}

Please provide:
1. A 2-3 sentence executive summary of key discussion points
2. A list of action items with owners (either "user" or "consultant")
3. A recommended follow-up date

Format your response as JSON with this structure:
{
  "summary": "...",
  "actionItems": [
    {
      "title": "Action item title",
      "description": "Brief description",
      "owner": "user" or "consultant",
      "dueDays": 7
    }
  ],
  "followUpDays": 14
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText =
        response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse Claude response as JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Convert action items with relative dates
      const actionItems = (parsed.actionItems || []).map(
        (item: {
          title: string;
          description?: string;
          owner: string;
          dueDays: number;
        }) => ({
          title: item.title,
          description: item.description || null,
          owner: item.owner,
          dueDate: addHours(new Date(), item.dueDays * 24),
        }),
      );

      const followUpDate = addHours(new Date(), (parsed.followUpDays || 14) * 24);

      this.logger.log('✅ AI summary generated', {
        summary: parsed.summary.substring(0, 100),
        actionItemCount: actionItems.length,
        followUpDate,
      });

      return {
        summary: parsed.summary,
        actionItems,
        followUpDate,
      };
    } catch (error) {
      this.logger.error('Failed to generate AI summary', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Fallback summary
      return {
        summary: `Meeting held on ${booking.startTime.toLocaleDateString()} with ${booking.consultant.name}. ${booking.durationHours} hours of consulting session.`,
        actionItems: [],
        followUpDate: addHours(new Date(), 14 * 24),
      };
    }
  }

  /**
   * Send branded email to user with summary and action items
   */
  private async sendPostCallEmail(booking: any, summary: any): Promise<void> {
    const actionItemsHtml = summary.actionItems
      .map(
        (item: any) => `
      <li>
        <strong>${item.title}</strong> (Owner: ${item.owner === 'user' ? booking.user.name : booking.consultant.name})
        ${item.description ? `<br><small>${item.description}</small>` : ''}
        <br><small>Due: ${item.dueDate.toLocaleDateString()}</small>
      </li>
    `,
      )
      .join('');

    const template = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">📋 Post-Call Summary</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your consulting session</p>
      </div>

      <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="margin-top: 0; color: #111827;">Session Overview</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          <strong>Consultant:</strong> ${booking.consultant.name}<br>
          <strong>Service:</strong> ${booking.service.name}<br>
          <strong>Date:</strong> ${booking.startTime.toLocaleDateString()} at ${booking.startTime.toLocaleTimeString()}<br>
          <strong>Duration:</strong> ${booking.durationHours} hours
        </p>

        <h2 style="color: #111827; margin-top: 30px;">Summary</h2>
        <p style="color: #4b5563; line-height: 1.6; background: #f9fafb; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px;">
          ${summary.summary}
        </p>

        ${summary.actionItems.length > 0 ? `
        <h2 style="color: #111827; margin-top: 30px;">Action Items</h2>
        <ul style="color: #4b5563; line-height: 1.8;">
          ${actionItemsHtml}
        </ul>
        ` : ''}

        <h2 style="color: #111827; margin-top: 30px;">Next Steps</h2>
        <p style="color: #4b5563; margin-bottom: 15px;">
          Your recommended follow-up date is <strong>${summary.followUpDate.toLocaleDateString()}</strong>.
        </p>

        <div style="display: flex; gap: 12px; margin: 30px 0;">
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard/bookings/${booking.id}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            View on Dashboard
          </a>
          ${summary.recordingUrl ? `
          <a href="${summary.recordingUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Watch Recording
          </a>
          ` : ''}
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard/bookings/schedule" style="background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
            Schedule Follow-up
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Questions? <a href="mailto:support@wise2.io" style="color: #667eea; text-decoration: none;">Contact support</a>
        </p>
      </div>
    </div>
    `;

    try {
      await this.emailService.sendPostCallSummary({
        email: booking.user.email,
        name: booking.user.name,
        summary: summary.summary,
        actionItemsCount: summary.actionItems.length,
        followUpDate: summary.followUpDate,
        recordingLink: summary.recordingUrl,
        dashboardLink: `${this.configService.get('FRONTEND_URL')}/dashboard/bookings/${booking.id}`,
        template,
      });

      this.logger.log(`✅ Post-call email sent to ${booking.user.email}`);
    } catch (error) {
      this.logger.error('Failed to send post-call email', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Notify consultant with user email and key takeaways
   */
  private async notifyConsultant(booking: any, summary: any): Promise<void> {
    const keyTakeaways = summary.actionItems
      .slice(0, 3)
      .map((item: any) => `• ${item.title}`)
      .join('\n');

    const template = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Post-Call Summary Created</h2>
      <p><strong>Client:</strong> ${booking.user.name} (${booking.user.email})</p>
      <p><strong>Service:</strong> ${booking.service.name}</p>
      <p><strong>Date:</strong> ${booking.startTime.toLocaleDateString()}</p>

      <h3>Key Takeaways</h3>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px;">${keyTakeaways || 'No action items'}</pre>

      <p>
        <a href="${this.configService.get('FRONTEND_URL')}/dashboard/bookings/${booking.id}">View Full Summary</a>
      </p>
    </div>
    `;

    try {
      await this.emailService.send({
        to: booking.consultant.email,
        subject: `Post-Call Summary: ${booking.user.name} - ${booking.service.name}`,
        template,
      });

      this.logger.log(`✅ Consultant notification sent to ${booking.consultant.email}`);
    } catch (error) {
      this.logger.error('Failed to notify consultant', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - consultant notification is secondary
    }
  }

  /**
   * Retrieve post-call summary for a booking
   */
  async getPostCallSummary(bookingId: string) {
    const summary = await this.prisma.postCallSummary.findUnique({
      where: { bookingId },
      include: {
        actionItems: true,
      },
    });

    if (!summary) {
      throw new NotFoundException('Post-call summary not found');
    }

    return summary;
  }

  /**
   * Mark action item as completed
   */
  async completeActionItem(actionItemId: string): Promise<void> {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: { id: actionItemId },
    });

    if (!actionItem) {
      throw new NotFoundException('Action item not found');
    }

    await this.prisma.actionItem.update({
      where: { id: actionItemId },
      data: { completed: true },
    });

    this.logger.log(`✅ Action item marked complete: ${actionItemId}`);
  }

  /**
   * Update action item details
   */
  async updateActionItem(
    actionItemId: string,
    data: {
      title?: string;
      description?: string;
      owner?: string;
      dueDate?: Date;
      completed?: boolean;
    },
  ): Promise<any> {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: { id: actionItemId },
    });

    if (!actionItem) {
      throw new NotFoundException('Action item not found');
    }

    return this.prisma.actionItem.update({
      where: { id: actionItemId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.owner && { owner: data.owner }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.completed !== undefined && { completed: data.completed }),
      },
    });
  }

  /**
   * Get statistics on action item completion
   */
  async getActionItemStats(bookingId: string) {
    const summary = await this.prisma.postCallSummary.findUnique({
      where: { bookingId },
      include: {
        actionItems: true,
      },
    });

    if (!summary) {
      throw new NotFoundException('Post-call summary not found');
    }

    const total = summary.actionItems.length;
    const completed = summary.actionItems.filter((item) => item.completed).length;
    const userItems = summary.actionItems.filter((item) => item.owner === 'user');
    const consultantItems = summary.actionItems.filter(
      (item) => item.owner === 'consultant',
    );

    return {
      total,
      completed,
      remaining: total - completed,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      userOwned: userItems.length,
      consultantOwned: consultantItems.length,
      overdueDates: summary.actionItems.filter(
        (item) => !item.completed && item.dueDate && new Date() > item.dueDate,
      ),
    };
  }
}
