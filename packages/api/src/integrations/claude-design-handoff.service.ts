import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface DesignBriefInput {
  userId: string;
  title: string;
  description: string;
  designType: 'LANDING_PAGE' | 'DASHBOARD' | 'MOBILE_APP' | 'COMPONENT' | 'REDESIGN' | 'OTHER';
  referenceImages?: string[];
  designAssets?: string[];
  brandGuide?: string;
  briefJson?: any;
  submittedBy?: string;
}

interface DesignBriefResponse {
  id: string;
  userId: string;
  title: string;
  designType: string;
  status: string;
  claudeUrl?: string;
  claudeNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DesignBriefUpdate {
  status?: string;
  claudeNotes?: string;
  claudeStatus?: string;
  claudeUrl?: string;
  feedback?: string;
}

@Injectable()
export class ClaudeDesignHandoffService {
  private readonly logger = new Logger(ClaudeDesignHandoffService.name);
  private apiBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiBaseUrl = this.configService.get('API_BASE_URL') || 'http://localhost:3010';
  }

  /**
   * Submit a design brief from ChatGPT to Claude
   */
  async submitDesignBrief(input: DesignBriefInput): Promise<DesignBriefResponse> {
    try {
      if (!input.userId || !input.title || !input.description) {
        throw new BadRequestException('userId, title, and description are required');
      }

      // Call internal API to create design brief
      const response = await axios.post(
        `${this.apiBaseUrl}/api/design-briefs`,
        {
          userId: input.userId,
          title: input.title,
          description: input.description,
          designType: input.designType || 'OTHER',
          referenceImages: input.referenceImages,
          designAssets: input.designAssets,
          brandGuide: input.brandGuide,
          briefJson: input.briefJson,
          submittedBy: input.submittedBy || 'chatgpt-plugin',
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'X-Design-Handoff': 'chatgpt-plugin',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to submit design brief: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get a specific design brief
   */
  async getDesignBrief(briefId: string, userId: string): Promise<DesignBriefResponse> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/design-briefs/${briefId}`, {
        params: { userId },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Design brief ${briefId} not found`);
      }
      this.logger.error(`Failed to get design brief: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * List design briefs for a user
   */
  async listDesignBriefs(userId: string, status?: string, designType?: string): Promise<DesignBriefResponse[]> {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (designType) params.designType = designType;

      const response = await axios.get(`${this.apiBaseUrl}/api/design-briefs`, {
        params: {
          userId,
          ...params,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list design briefs: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Update a design brief (Claude updates status and adds notes)
   */
  async updateDesignBrief(briefId: string, update: DesignBriefUpdate): Promise<DesignBriefResponse> {
    try {
      const response = await axios.patch(
        `${this.apiBaseUrl}/api/design-briefs/${briefId}`,
        {
          status: update.status,
          claudeNotes: update.claudeNotes,
          claudeStatus: update.claudeStatus,
          claudeUrl: update.claudeUrl,
          feedback: update.feedback,
        },
        {
          timeout: 5000,
          headers: {
            'X-Design-Handoff': 'claude-design-system',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update design brief: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Mark a design brief as in progress
   */
  async markInProgress(briefId: string, claudeUrl?: string): Promise<DesignBriefResponse> {
    return this.updateDesignBrief(briefId, {
      status: 'IN_PROGRESS',
      claudeStatus: 'working',
      claudeUrl,
    });
  }

  /**
   * Mark a design brief as completed with artifact URL
   */
  async markCompleted(briefId: string, claudeUrl: string, notes: string): Promise<DesignBriefResponse> {
    return this.updateDesignBrief(briefId, {
      status: 'COMPLETED',
      claudeStatus: 'completed',
      claudeUrl,
      claudeNotes: notes,
    });
  }

  /**
   * Request review from ChatGPT for a design
   */
  async requestReview(briefId: string, notes: string): Promise<DesignBriefResponse> {
    return this.updateDesignBrief(briefId, {
      status: 'REVIEW_REQUESTED',
      claudeStatus: 'awaiting_review',
      claudeNotes: notes,
    });
  }

  /**
   * Get pending briefs for Claude (all briefs awaiting work)
   */
  async getPendingBriefs(): Promise<DesignBriefResponse[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/design-briefs/pending`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get pending briefs: ${error.message}`, error);
      return [];
    }
  }

  /**
   * Get brief statistics (for dashboard)
   */
  async getBriefStats(): Promise<{
    total: number;
    submitted: number;
    inProgress: number;
    completed: number;
    pending: number;
  }> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/design-briefs/stats`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get brief stats: ${error.message}`, error);
      return { total: 0, submitted: 0, inProgress: 0, completed: 0, pending: 0 };
    }
  }
}
