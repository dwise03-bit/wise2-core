import axios, { AxiosInstance } from 'axios';

interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
}

export class CodexRemoteClient {
  private client: AxiosInstance;

  constructor(config: ClientConfig = {}) {
    const baseUrl = config.baseUrl || 'http://localhost:3009';
    const timeout = config.timeout || 30000;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async health() {
    const response = await this.client.get('/health');
    return response.data;
  }

  async tailscaleStatus() {
    const response = await this.client.get('/tailscale/status');
    return response.data;
  }

  async completeCode(
    code: string,
    language: string,
    prompt?: string
  ) {
    const response = await this.client.post('/codex/complete', {
      code,
      language,
      prompt,
    });
    return response.data;
  }

  async generateCode(
    description: string,
    language: string,
    style?: 'functional' | 'oop' | 'procedural'
  ) {
    const response = await this.client.post('/codex/generate', {
      description,
      language,
      style,
    });
    return response.data;
  }

  async explainCode(code: string, language: string) {
    const response = await this.client.post('/codex/explain', {
      code,
      language,
    });
    return response.data;
  }

  async connect() {
    const response = await this.client.post('/tailscale/connect');
    return response.data;
  }
}

// Example usage:
// const client = new CodexRemoteClient({ baseUrl: 'http://localhost:3009' });
// const completion = await client.completeCode('const x = ', 'javascript');
// console.log(completion);
