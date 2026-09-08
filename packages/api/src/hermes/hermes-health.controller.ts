import { Controller, Get, HttpCode } from '@nestjs/common';
import { HermesGenerationResolver } from './hermes-generation.config';

@Controller('v1/hermes')
export class HermesHealthController {
  @Get('health')
  @HttpCode(200)
  async getHealth() {
    const config = HermesGenerationResolver.resolve('fast');
    const configuredEndpoint =
      process.env.HERMES_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434';

    let ollamaStatus = 'unknown';
    let ollamaError: string | undefined;

    try {
      const tagsUrl = configuredEndpoint.includes('/v1/chat/completions')
        ? configuredEndpoint.replace('/v1/chat/completions', '/v1/models')
        : `${configuredEndpoint.replace(/\/+$/, '')}/api/tags`;
      const response = await fetch(tagsUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      ollamaStatus = response.ok ? 'online' : 'error';
      if (!response.ok) ollamaError = `HTTP ${response.status}`;
    } catch (error) {
      ollamaStatus = 'offline';
      ollamaError = error instanceof Error ? error.message : 'unknown error';
    }

    return {
      status: ollamaStatus === 'online' ? 'online' : 'degraded',
      provider: config.provider,
      model: config.model,
      ollama: { status: ollamaStatus, error: ollamaError, endpoint: configuredEndpoint },
      profile: 'fast',
      context: config.fast.numCtx,
      predictTokens: config.fast.numPredict,
      think: config.fast.think,
    };
  }
}
