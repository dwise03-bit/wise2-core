import { Logger } from '@nestjs/common';

export interface TwentyIClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class TwentyIClient {
  private readonly logger = new Logger(TwentyIClient.name);
  private readonly baseUrl: string;
  private readonly bearerToken: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: TwentyIClientOptions) {
    const apiKey = options.apiKey.trim();
    if (!apiKey) {
      throw new Error('TWENTYI_API_KEY is required');
    }

    this.baseUrl = (options.baseUrl ?? 'https://api.20i.com/').replace(/\/?$/, '/');
    this.bearerToken = Buffer.from(apiKey, 'utf8').toString('base64');
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const normalizedPath = path.replace(/^\//, '');
    const url = `${this.baseUrl}${normalizedPath}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      const payload = text ? safeJsonParse(text) : null;

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload && 'error' in payload
            ? JSON.stringify((payload as { error?: unknown }).error)
            : text || response.statusText;
        this.logger.error(`20i ${method} ${normalizedPath} failed (${response.status})`);
        throw new Error(`20i API ${response.status}: ${message}`);
      }

      return payload as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
