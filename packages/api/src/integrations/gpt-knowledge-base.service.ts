import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface KnowledgeContext {
  query: string;
  context: string[];
  sources: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
}

interface DocumentReference {
  id: string;
  title: string;
  url: string;
  category: string;
  relevance: number;
}

@Injectable()
export class GPTKnowledgeBaseService {
  private readonly logger = new Logger(GPTKnowledgeBaseService.name);
  private hermesUrl: string;

  constructor(private configService: ConfigService) {
    this.hermesUrl = this.configService.get('HERMES_BASE_URL') || 'http://localhost:3012';
  }

  /**
   * Query the knowledge base for relevant context
   */
  async queryContext(query: string, limit: number = 5): Promise<KnowledgeContext> {
    try {
      const response = await axios.post(
        `${this.hermesUrl}/brain-api/query`,
        {
          query,
          limit,
          includeContext: true,
          includeSources: true,
        },
        {
          timeout: 5000,
        }
      );

      return {
        query,
        context: response.data.context || [],
        sources: response.data.sources || [],
      };
    } catch (error) {
      this.logger.warn(`Failed to query knowledge base: ${error}`);
      return {
        query,
        context: [],
        sources: [],
      };
    }
  }

  /**
   * Get documentation links related to a topic
   */
  async getDocumentationLinks(topic: string): Promise<DocumentReference[]> {
    try {
      const response = await axios.post(
        `${this.hermesUrl}/brain-api/search`,
        {
          topic,
          type: 'documentation',
          limit: 10,
        },
        {
          timeout: 5000,
        }
      );

      return response.data.documents || [];
    } catch (error) {
      this.logger.warn(`Failed to fetch documentation links: ${error}`);
      return [];
    }
  }

  /**
   * Get GPT-specific knowledge base context
   */
  async getGPTContext(tenantId: string): Promise<{
    instructions: string;
    documentation: DocumentReference[];
    recentUpdates: string[];
  }> {
    try {
      const [docs, updates] = await Promise.all([
        this.getDocumentationLinks('WISE² operations'),
        this.getRecentUpdates(tenantId),
      ]);

      const instructions = `You are the WISE² Command Center assistant. You have access to:
- Real-time business metrics and analytics
- Operations documentation and guides
- User-specific business data
- Historical trends and forecasts

Always:
1. Reference available data when answering questions
2. Link to relevant documentation for complex topics
3. Provide actionable recommendations
4. Consider context from the knowledge base
5. Acknowledge limitations if data is unavailable`;

      return {
        instructions,
        documentation: docs,
        recentUpdates: updates,
      };
    } catch (error) {
      this.logger.error(`Failed to get GPT context: ${error}`);
      return {
        instructions: '',
        documentation: [],
        recentUpdates: [],
      };
    }
  }

  /**
   * Update knowledge base with new information
   */
  async addKnowledge(data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    source?: string;
  }): Promise<boolean> {
    try {
      await axios.post(
        `${this.hermesUrl}/brain-api/update`,
        {
          ...data,
          timestamp: new Date(),
        },
        {
          timeout: 5000,
        }
      );

      this.logger.debug(`Knowledge added: ${data.title}`);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to add knowledge: ${error}`);
      return false;
    }
  }

  /**
   * Link GPT responses back to knowledge base
   */
  async linkResponse(data: {
    gptQuery: string;
    gptResponse: string;
    relevantDocuments: DocumentReference[];
    userFeedback?: 'helpful' | 'not_helpful';
  }): Promise<void> {
    try {
      await this.addKnowledge({
        title: `GPT Response: ${data.gptQuery.substring(0, 50)}...`,
        content: data.gptResponse,
        category: 'gpt_response',
        tags: ['gpt', 'command_center', ...data.relevantDocuments.map((d) => d.category)],
        source: 'command_center_gpt',
      });
    } catch (error) {
      this.logger.warn(`Failed to link response: ${error}`);
    }
  }

  /**
   * Get recent knowledge base updates
   */
  private async getRecentUpdates(tenantId: string): Promise<string[]> {
    try {
      const response = await axios.get(
        `${this.hermesUrl}/brain-api/recent`,
        {
          params: { tenant: tenantId, limit: 5 },
          timeout: 5000,
        }
      );

      return response.data.updates || [];
    } catch (error) {
      this.logger.warn(`Failed to fetch recent updates: ${error}`);
      return [];
    }
  }

  /**
   * Generate context summary for GPT
   */
  async generateContextSummary(tenantId: string, topic: string): Promise<string> {
    try {
      const context = await this.queryContext(topic, 3);
      const docs = await this.getDocumentationLinks(topic);

      let summary = '';

      if (context.context.length > 0) {
        summary += `**Relevant Information:**\n${context.context.join('\n')}\n\n`;
      }

      if (docs.length > 0) {
        summary += `**Reference Materials:**\n`;
        docs.forEach((doc) => {
          summary += `- [${doc.title}](${doc.url})\n`;
        });
      }

      return summary || `No specific information found for: ${topic}`;
    } catch (error) {
      this.logger.warn(`Failed to generate context summary: ${error}`);
      return '';
    }
  }
}
