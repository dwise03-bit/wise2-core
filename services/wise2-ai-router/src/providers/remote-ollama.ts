import axios, { AxiosRequestConfig } from 'axios';
import { OllamaProvider } from './ollama';
import { AIRequest, Model } from '../types/request';

export interface RemoteOllamaOptions {
  name: string;
  baseUrl: string;
  modelPriority?: string[];
  bearerToken?: string;
  timeoutMs?: number;
}

/** Remote Ollama-compatible zero-cost provider for ephemeral/cloud GPU nodes. */
export class RemoteOllamaProvider extends OllamaProvider {
  name: string;
  private remoteBaseUrl: string;
  private bearerToken?: string;
  private remoteTimeout: number;

  constructor(options: RemoteOllamaOptions) {
    super(options.baseUrl, options.modelPriority || []);
    this.name = options.name;
    this.remoteBaseUrl = options.baseUrl.replace(/\/$/, '');
    this.bearerToken = options.bearerToken;
    this.remoteTimeout = options.timeoutMs || 30000;
  }

  private requestConfig(timeout = this.remoteTimeout): AxiosRequestConfig {
    return {
      timeout,
      headers: this.bearerToken ? { Authorization: `Bearer ${this.bearerToken}` } : undefined,
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.remoteBaseUrl}/api/tags`, this.requestConfig());
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Model[]> {
    try {
      const response = await axios.get(`${this.remoteBaseUrl}/api/tags`, this.requestConfig());
      return (response.data?.models || []).map((m: any, index: number) => {
        const id = m.name || m.model;
        return {
          id,
          name: id,
          provider: this.name,
          contextWindow: m.details?.context_length || 4096,
          capabilities: this.capabilities(id),
          priority: index,
          healthy: true,
          lastHealthCheck: new Date(),
        } as Model;
      });
    } catch {
      return [];
    }
  }

  async generate(request: AIRequest): Promise<string> {
    this.validateRequest(request);
    const models = await this.listModels();
    const required = request.capabilities_required || [];
    const model = models.find((m) => required.every((cap) => m.capabilities.includes(cap))) || models[0];
    if (!model) throw new Error(`No suitable ${this.name} model available`);

    const prompt = request.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    try {
      const response = await axios.post(
        `${this.remoteBaseUrl}/api/generate`,
        { model: model.id, prompt, stream: false, temperature: 0.7, top_p: 0.9, top_k: 40 },
        this.requestConfig(request.max_tokens ? Math.max(this.remoteTimeout, request.max_tokens * 10) : 60000)
      );
      return response.data?.response || '';
    } catch (error) {
      if (axios.isAxiosError(error)) throw new Error(`${this.name} inference failed: ${error.message}`);
      throw error;
    }
  }

  private capabilities(modelId: string): string[] {
    const id = modelId.toLowerCase();
    const caps = ['chat', 'summarization'];
    if (id.includes('coder') || id.includes('code')) caps.push('code-gen', 'code-analysis');
    if (id.includes('qwen') || id.includes('mistral') || id.includes('gemma')) caps.push('reasoning', 'analysis');
    return Array.from(new Set(caps));
  }
}
