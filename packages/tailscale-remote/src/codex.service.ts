import axios from 'axios';

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
  private apiKey: string;
  private model: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string, model: string = 'gpt-4') {
    if (!apiKey || apiKey.trim() === '') {
      console.warn('⚠️ Warning: OPENAI_API_KEY is not set. Code operations will fail.');
      console.warn('Set OPENAI_API_KEY in your .env file to enable Codex features.');
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callOpenAI(prompt: string, temperature: number = 0.7, maxTokens: number = 500): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.');
    }
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to call OpenAI API');
    }
  }

  async completeCode(
    request: CodeCompletionRequest
  ): Promise<CodeCompletionResponse> {
    const prompt = this.buildCompletionPrompt(request);
    const completion = await this.callOpenAI(prompt, 0.7, 500);

    return {
      completion,
      language: request.language,
      confidence: 0.85,
    };
  }

  async generateCode(
    request: CodeGenerationRequest
  ): Promise<CodeGenerationResponse> {
    const prompt = this.buildGenerationPrompt(request);
    const text = await this.callOpenAI(prompt, 0.8, 1000);

    // Extract code block if wrapped in markdown
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)\n```/);
    const code = codeMatch ? codeMatch[1] : text;

    return {
      code,
      language: request.language,
      explanation: this.extractExplanation(text),
    };
  }

  async explainCode(
    request: CodeExplanationRequest
  ): Promise<CodeExplanationResponse> {
    const prompt = this.buildExplanationPrompt(request);
    const text = await this.callOpenAI(prompt, 0.7, 800);

    return this.parseExplanation(text);
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
