import { HermesGenerationResolver } from './hermes-generation.config';

describe('HermesGenerationResolver', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('resolve', () => {
    it('should resolve FAST profile with default settings', () => {
      process.env.OLLAMA_CHAT_MODEL = 'wise2:latest';
      process.env.HERMES_FAST_THINK = 'false';
      process.env.HERMES_FAST_NUM_CTX = '4096';
      process.env.HERMES_FAST_NUM_PREDICT = '1024';

      const config = HermesGenerationResolver.resolve('fast');

      expect(config.profile).toBe('fast');
      expect(config.model).toBe('wise2:latest');
      expect(config.selectedSettings.think).toBe(false);
      expect(config.selectedSettings.numCtx).toBe(4096);
      expect(config.selectedSettings.numPredict).toBe(1024);
    });

    it('should resolve DEEP profile with larger context', () => {
      process.env.OLLAMA_CHAT_MODEL = 'wise2:latest';
      process.env.HERMES_DEEP_THINK = 'true';
      process.env.HERMES_DEEP_NUM_CTX = '16384';
      process.env.HERMES_DEEP_NUM_PREDICT = '2048';

      const config = HermesGenerationResolver.resolve('deep');

      expect(config.profile).toBe('deep');
      expect(config.selectedSettings.think).toBe(true);
      expect(config.selectedSettings.numCtx).toBe(16384);
      expect(config.selectedSettings.numPredict).toBe(2048);
    });

    it('should default to wise2:latest model', () => {
      const config = HermesGenerationResolver.resolve('fast');

      expect(config.model).toBe('wise2:latest');
    });

    it('should respect OLLAMA_CHAT_MODEL env var', () => {
      process.env.OLLAMA_CHAT_MODEL = 'qwen:7b';

      const config = HermesGenerationResolver.resolve('fast');

      expect(config.model).toBe('qwen:7b');
    });

    it('should detect Ollama provider by default', () => {
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434';

      const config = HermesGenerationResolver.resolve('fast');

      expect(config.provider).toBe('ollama');
    });

    it('should detect OpenAI-compatible provider', () => {
      process.env.HERMES_ENDPOINT = 'http://localhost:8000/v1/chat/completions';

      const config = HermesGenerationResolver.resolve('fast');

      expect(config.provider).toBe('openai-compatible');
    });
  });

  describe('autoClassify', () => {
    it('should classify simple question as FAST', () => {
      const profile = HermesGenerationResolver.autoClassify(
        'What is the status?',
        2,
        'executive',
      );

      expect(profile).toBe('fast');
    });

    it('should classify explicit deep request as DEEP', () => {
      const profile = HermesGenerationResolver.autoClassify(
        'Please analyze deeply the entire system architecture',
        0,
        'systems',
      );

      expect(profile).toBe('deep');
    });

    it('should classify long message + long conversation as DEEP', () => {
      const longMessage =
        'This is a very long message that discusses multiple aspects of the system in detail. ' +
        'It covers architecture, performance, and scalability concerns. ' +
        'The user wants a comprehensive analysis that requires context and reasoning.';

      const profile = HermesGenerationResolver.autoClassify(longMessage, 15, 'systems');

      expect(profile).toBe('deep');
    });

    it('should respect explicit FAST keyword override', () => {
      const profile = HermesGenerationResolver.autoClassify(
        'Quick summary of the architecture',
        10,
        'systems',
      );

      // 'Quick' keyword should indicate FAST despite long conversation
      expect(profile).toBe('fast');
    });

    it('should classify audit mode with very long conversation as DEEP', () => {
      const profile = HermesGenerationResolver.autoClassify(
        'What should we investigate next based on our findings?',
        10,
        'audit',
      );

      expect(profile).toBe('deep');
    });

    it('should default to FAST for borderline cases', () => {
      const profile = HermesGenerationResolver.autoClassify(
        'Tell me about the project status',
        3,
        'executive',
      );

      expect(profile).toBe('fast');
    });
  });

  describe('buildOllamaBody', () => {
    it('should build request body for Ollama native endpoint', () => {
      const body = HermesGenerationResolver.buildOllamaBody(
        'wise2:latest',
        'You are helpful.',
        [{ role: 'user', content: 'Hello' }],
        'What is 2+2?',
        {
          think: false,
          numCtx: 4096,
          numPredict: 1024,
          timeoutMs: 90000,
        },
      );

      expect(body.model).toBe('wise2:latest');
      expect(body.stream).toBe(false);
      expect(body.think).toBe(false);
      const options = body.options as any;
      expect(options.num_ctx).toBe(4096);
      expect(options.num_predict).toBe(1024);
      expect((body.messages as any[]).length).toBe(3); // system, user, new user
    });
  });

  describe('buildOpenAiBody', () => {
    it('should build request body for OpenAI-compatible endpoint', () => {
      const body = HermesGenerationResolver.buildOpenAiBody(
        'wise2:latest',
        'You are helpful.',
        [{ role: 'user', content: 'Hello' }],
        'What is 2+2?',
      );

      expect(body.model).toBe('wise2:latest');
      expect(body.stream).toBe(false);
      expect((body as any).think).toBeUndefined();
      expect((body as any).options).toBeUndefined();
      expect((body.messages as any[]).length).toBe(3);
    });
  });
});
