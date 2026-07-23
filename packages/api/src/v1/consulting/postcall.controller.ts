import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostCallSummaryService } from './postcall.service';
import { JwtAuthGuard } from '@app/common/guards/jwt.guard';

@Controller('v1/consulting/post-call')
@UseGuards(JwtAuthGuard)
export class PostCallController {
  constructor(private postCallSummaryService: PostCallSummaryService) {}

  /**
   * Get post-call summary for a booking
   * GET /v1/consulting/post-call/:bookingId
   */
  @Get(':bookingId')
  async getPostCallSummary(
    @Param('bookingId') bookingId: string,
    @Request() req: any,
  ) {
    const summary = await this.postCallSummaryService.getPostCallSummary(bookingId);
    return {
      status: 'success',
      data: summary,
    };
  }

  /**
   * Get action item completion statistics
   * GET /v1/consulting/post-call/:bookingId/stats
   */
  @Get(':bookingId/stats')
  async getActionItemStats(
    @Param('bookingId') bookingId: string,
    @Request() req: any,
  ) {
    const stats = await this.postCallSummaryService.getActionItemStats(bookingId);
    return {
      status: 'success',
      data: stats,
    };
  }

  /**
   * Mark action item as completed
   * PATCH /v1/consulting/post-call/action-items/:actionItemId/complete
   */
  @Patch('action-items/:actionItemId/complete')
  @HttpCode(HttpStatus.OK)
  async completeActionItem(
    @Param('actionItemId') actionItemId: string,
    @Request() req: any,
  ) {
    await this.postCallSummaryService.completeActionItem(actionItemId);
    return {
      status: 'success',
      message: 'Action item marked as completed',
    };
  }

  /**
   * Update action item details
   * PATCH /v1/consulting/post-call/action-items/:actionItemId
   */
  @Patch('action-items/:actionItemId')
  async updateActionItem(
    @Param('actionItemId') actionItemId: string,
    @Body()
    updateData: {
      title?: string;
      description?: string;
      owner?: string;
      dueDate?: string;
      completed?: boolean;
    },
    @Request() req: any,
  ) {
    const data = {
      ...updateData,
      dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
    };

    const updatedItem = await this.postCallSummaryService.updateActionItem(
      actionItemId,
      data,
    );

    return {
      status: 'success',
      data: updatedItem,
    };
  }

  /**
   * Trigger manual post-call processing for a booking
   * POST /v1/consulting/post-call/:bookingId/process
   * (Useful for testing or manual triggering)
   */
  @Patch(':bookingId/process')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerPostCallProcessing(
    @Param('bookingId') bookingId: string,
    @Request() req: any,
  ) {
    await this.postCallSummaryService.processPostCallSummary(bookingId);
    return {
      status: 'success',
      message: 'Post-call processing initiated',
    };
  }
}
