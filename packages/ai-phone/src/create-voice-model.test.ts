import { createVoiceModel } from './openai-realtime-provider';
import { VoiceModelMock } from './voice-model-mock';
import { CallSessionManager } from './call-session';

describe('createVoiceModel', () => {
  const original = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (original === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = original;
  });

  it('returns the mock provider when no API key is set', () => {
    delete process.env.OPENAI_API_KEY;
    const model = createVoiceModel();
    expect(model).toBeInstanceOf(VoiceModelMock);
    expect(model.name).toContain('Mock');
  });
});

describe('CallSessionManager', () => {
  it('indexes sessions by call id', () => {
    const manager = new CallSessionManager();
    const session = manager.createSession('CA123', 'tenant-1', []);
    expect(manager.getSessionByCallId('CA123')?.sessionId).toBe(session.sessionId);
    manager.deleteSession(session.sessionId);
    expect(manager.getSessionByCallId('CA123')).toBeUndefined();
  });
});
