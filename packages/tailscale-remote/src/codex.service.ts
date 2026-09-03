import { AIService } from '@wise2/ai';
import { z } from 'zod';

interface CodeCompletionRequest {
  code: string;
  language: string;
  context?: string;
}

interface CodeCompletionResponse {
  completion: string;
  language: string;
  confidence: number;
}

interface CodeGenerationRequest {
  description: string;
  language: string;
  style?: 'functional' | 'oop' | 'procedural';
}

interface CodeGenerationResponse {
  code: string;
  language: string;
  explanation: string;
}

interface CodeExplanationRequest {
  code: string;
  language: string;
}

interface CodeExplanationResponse {
  summary: string;
  details: string[];
  complexity: string;
}

export class CodexRemoteService {
  constructor(private aiService: AIService) {}

  async completeCode(
    request: CodeCompletionRequest
  ): Promise<CodeCompletionResponse> {
    const prompt = this.buildCompletionPrompt(request);

    const response = await this.aiService.generate({
      prompt,
      maxTokens: 500,
      temperature: 0.7,
      model: 'gpt-4',
    });

    return {
      completion: response,
      language: request.language,
      confidence: 0.85,
    };
  }

  async generateCode(
    request: CodeGenerationRequest
  ): Promise<CodeGenerationResponse> {
    const prompt = this.buildGenerationPrompt(request);

    const response = await this.aiService.generate({
      prompt,
      maxTokens: 1000,
      temperature: 0.8,
      model: 'gpt-4',
    });

    // Extract code block if wrapped in markdown
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    const code = codeMatch ? codeMatch[1] : response;

    return {
      code,
      language: request.language,
      explanation: this.extractExplanation(response),
    };
  }

  async explainCode(
    request: CodeExplanationRequest
  ): Promise<CodeExplanationResponse> {
    const prompt = this.buildExplanationPrompt(request);

    const response = await this.aiService.generate({
      prompt,
      maxTokens: 800,
      temperature: 0.7,
      model: 'gpt-4',
    });

    return this.parseExplanation(response);
  }

  private buildCompletionPrompt(request: CodeCompletionRequest): string {
    return `You are an expert code completion assistant. Complete the following ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.context ? `Context: ${request.context}` : ''}

Provide only the completion without explanation. Continue from where the code ends.`;
  }

  private buildGenerationPrompt(request: CodeGenerationRequest): string {
    return `Generate ${request.language} code for the following requirement:

${request.description}

Style: ${request.style || 'functional'}

Provide the code in a markdown code block with language specification.`;
  }

  private buildExplanationPrompt(request: CodeExplanationRequest): string {
    return `Explain the following ${request.language} code in detail:

\`\`\`${request.language}
${request.code}
\`\`\`

Provide:
1. A brief summary (1-2 sentences)
2. What each part does
3. Complexity analysis (time/space)

Format as JSON with keys: summary, details (array), complexity`;
  }

  private extractExplanation(response: string): string {
    const lines = response.split('\n');
    const explanationStart = lines.findIndex(
      (line) => line.includes('Explanation:') || line.includes('Explanation')
    );

    if (explanationStart >= 0) {
      return lines.slice(explanationStart + 1).join('\n').trim();
    }

    // Return lines after the code block
    const codeEndIndex = response.lastIndexOf('```');
    if (codeEndIndex >= 0) {
      return response.substring(codeEndIndex + 3).trim();
    }

    return '';
  }

  private parseExplanation(response: string): CodeExplanationResponse {
    try {
      // Try parsing as JSON if available
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          details: Array.isArray(parsed.details) ? parsed.details : [response],
          complexity: parsed.complexity || 'Unknown',
        };
      }
    } catch (error) {
      // Fall through to text parsing
    }

    // Fallback: parse as text
    const lines = response.split('\n').filter((line) => line.trim());
    return {
      summary: lines[0] || '',
      details: lines.slice(1),
      complexity: 'Unknown',
    };
  }
}
