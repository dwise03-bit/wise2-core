/**
 * WISE² OSS Toolkit — Phase 3: Langfuse LLM Observability
 *
 * NestJS instrumentation for tracing LLM calls (Hermes, Second Brain, any future
 * Ollama/OpenAI-backed service) with Langfuse: token usage, latency, and errors.
 *
 * NOT WIRED IN YET — this file is generated ahead of deployment. Integration points:
 *   1. `npm install langfuse` in packages/api (not yet a dependency).
 *   2. Add LangfuseModule to packages/api/src/app.module.ts imports.
 *   3. Inject LangfuseService into HermesService (packages/api/src/hermes/hermes.service.ts)
 *      and wrap the body of `chat()` (line ~345) with `withTrace(...)` as shown below.
 *   4. Set env vars in .env.production:
 *        LANGFUSE_HOST=https://langfuse.wise2.net   (or http://localhost:3002 locally)
 *        LANGFUSE_PUBLIC_KEY=pk-lf-...
 *        LANGFUSE_SECRET_KEY=sk-lf-...
 *      (generate keys from the Langfuse UI after docker-compose.phase3-ai-ops.yml is deployed)
 *
 * Example usage inside HermesService.chat():
 *
 *   async chat(tenantUserId: string, dto: HermesChatDto) {
 *     return this.langfuse.withTrace(
 *       { name: 'hermes.chat', userId: tenantUserId, input: dto },
 *       async (span) => {
 *         const result = await this.callOllama(dto);
 *         span.setUsage({ promptTokens: result.promptTokens, completionTokens: result.completionTokens });
 *         return result;
 *       },
 *     );
 *   }
 */

import { Injectable, Logger, Module, Global } from '@nestjs/common';

// --- Minimal structural types so this file compiles before `langfuse` is installed. ---
// Once `npm install langfuse` is run, replace these with:
//   import { Langfuse, LangfuseTraceClient, LangfuseSpanClient } from 'langfuse';
interface LangfuseUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  unit?: 'TOKENS' | 'CHARACTERS';
}

interface LangfuseSpanHandle {
  setUsage(usage: LangfuseUsage): void;
  setOutput(output: unknown): void;
  end(): void;
}

interface LangfuseTraceOptions {
  name: string;
  userId?: string;
  sessionId?: string;
  input?: unknown;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

/**
 * LangfuseService — thin wrapper so callers never touch the Langfuse SDK directly.
 * If Langfuse is unreachable or disabled, calls degrade to plain execution
 * (observability must never take down a production request path).
 */
@Injectable()
export class LangfuseService {
  private readonly logger = new Logger('LangfuseService');
  private client: LangfuseClientLike | null = null;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env.LANGFUSE_ENABLED !== 'false' && !!process.env.LANGFUSE_SECRET_KEY;

    if (!this.enabled) {
      this.logger.warn(
        'Langfuse disabled (missing LANGFUSE_SECRET_KEY or LANGFUSE_ENABLED=false) — LLM calls will run unobserved.',
      );
      return;
    }

    try {
      // Lazy require so the package is optional until `npm install langfuse` is run.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Langfuse } = require('langfuse');
      this.client = new Langfuse({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_HOST || 'http://localhost:3002',
      });
      this.logger.log(`Langfuse client initialized (host: ${process.env.LANGFUSE_HOST || 'http://localhost:3002'})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to initialize Langfuse client — falling back to unobserved mode: ${message}`);
      this.client = null;
    }
  }

  /**
   * Wrap an async LLM call with a Langfuse trace + span. Tracks latency automatically,
   * records errors, and lets the caller attach token usage via span.setUsage(...).
   *
   * Never throws due to observability failures — only rethrows errors from `fn` itself.
   */
  async withTrace<T>(
    options: LangfuseTraceOptions,
    fn: (span: LangfuseSpanHandle) => Promise<T>,
  ): Promise<T> {
    if (!this.enabled || !this.client) {
      return fn(noopSpan);
    }

    const startedAt = Date.now();
    let trace: LangfuseTraceLike | undefined;
    let span: LangfuseSpanLike | undefined;

    try {
      trace = this.client.trace({
        name: options.name,
        userId: options.userId,
        sessionId: options.sessionId,
        input: options.input,
        metadata: options.metadata,
        tags: options.tags,
      });
      span = trace.span({ name: `${options.name}.execution`, input: options.input });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Langfuse trace setup failed (continuing unobserved): ${message}`);
      return fn(noopSpan);
    }

    const handle: LangfuseSpanHandle = {
      setUsage: (usage) => {
        try {
          span?.update({ usage });
        } catch {
          /* observability must never break the request */
        }
      },
      setOutput: (output) => {
        try {
          span?.update({ output });
        } catch {
          /* observability must never break the request */
        }
      },
      end: () => {
        try {
          span?.end();
        } catch {
          /* observability must never break the request */
        }
      },
    };

    try {
      const result = await fn(handle);
      const latencyMs = Date.now() - startedAt;
      try {
        span?.update({ output: result, metadata: { latencyMs } });
        span?.end();
        trace?.update({ output: result });
      } catch {
        /* swallow — tracing is best-effort */
      }
      return result;
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : String(error);
      try {
        span?.update({ level: 'ERROR', statusMessage: message, metadata: { latencyMs } });
        span?.end();
        trace?.update({ output: { error: message } });
      } catch {
        /* swallow — tracing is best-effort */
      }
      throw error;
    } finally {
      try {
        await this.client?.flushAsync?.();
      } catch {
        /* best-effort flush */
      }
    }
  }
}

// --- Structural types for the lazy-loaded `langfuse` SDK client ---
interface LangfuseSpanLike {
  update(data: Record<string, unknown>): void;
  end(): void;
}
interface LangfuseTraceLike {
  span(data: Record<string, unknown>): LangfuseSpanLike;
  update(data: Record<string, unknown>): void;
}
interface LangfuseClientLike {
  trace(data: Record<string, unknown>): LangfuseTraceLike;
  flushAsync?: () => Promise<void>;
}

const noopSpan: LangfuseSpanHandle = {
  setUsage: () => undefined,
  setOutput: () => undefined,
  end: () => undefined,
};

/**
 * Global module so LangfuseService can be injected anywhere (HermesService,
 * future Second Brain NestJS proxy, etc.) without re-declaring it per-module.
 * Add `LangfuseModule` to packages/api/src/app.module.ts imports to activate.
 */
@Global()
@Module({
  providers: [LangfuseService],
  exports: [LangfuseService],
})
export class LangfuseModule {}
