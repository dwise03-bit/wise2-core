import { v4 as uuid } from 'uuid';

export interface Recording {
  id: string;
  callId: string;
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  format: 'wav' | 'mp3' | 'ogg';
  size?: number; // bytes
  status: 'recording' | 'processing' | 'completed' | 'failed';
  transcription?: string;
  transcriptionStatus: 'pending' | 'completed' | 'failed';
  storageUrl?: string;
  metadata: Record<string, unknown>;
}

export interface TranscriptionResult {
  id: string;
  recordingId: string;
  text: string;
  confidence: number;
  segments: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  language: string;
}

export class CallRecordingService {
  private recordings = new Map<string, Recording>();
  private transcriptions = new Map<string, TranscriptionResult>();

  async startRecording(callId: string, sessionId: string): Promise<Recording> {
    const recordingId = uuid();

    const recording: Recording = {
      id: recordingId,
      callId,
      sessionId,
      startedAt: new Date(),
      format: 'wav',
      status: 'recording',
      transcriptionStatus: 'pending',
      metadata: {
        startTime: new Date().toISOString(),
      },
    };

    this.recordings.set(recordingId, recording);
    console.log(`🎙️  Started recording for call ${callId} (${recordingId})`);

    return recording;
  }

  async stopRecording(recordingId: string): Promise<Recording> {
    const recording = this.recordings.get(recordingId);
    if (!recording) throw new Error(`Recording ${recordingId} not found`);

    recording.endedAt = new Date();
    recording.duration = recording.endedAt.getTime() - recording.startedAt.getTime();
    recording.status = 'processing';
    recording.size = Math.floor(Math.random() * 5000000) + 1000000; // 1-5 MB mock

    this.recordings.set(recordingId, recording);
    console.log(
      `⏹️  Stopped recording ${recordingId} (${recording.duration}ms, ~${(recording.size / 1000000).toFixed(1)}MB)`
    );

    // Queue transcription
    await this.transcribeRecording(recordingId);

    return recording;
  }

  async transcribeRecording(recordingId: string): Promise<TranscriptionResult> {
    const recording = this.recordings.get(recordingId);
    if (!recording) throw new Error(`Recording ${recordingId} not found`);

    console.log(`📝 Transcribing recording ${recordingId}...`);

    // Mock transcription (in production, send to OpenAI Whisper API)
    const transcription: TranscriptionResult = {
      id: uuid(),
      recordingId,
      text: 'Thank you for calling. The customer confirmed their appointment for Thursday at 2 PM. They requested an invoice to be emailed.',
      confidence: 0.94,
      segments: [
        {
          text: 'Thank you for calling.',
          start: 0,
          end: 1200,
          confidence: 0.96,
        },
        {
          text: 'The customer confirmed their appointment for Thursday at 2 PM.',
          start: 1200,
          end: 4500,
          confidence: 0.92,
        },
        {
          text: 'They requested an invoice to be emailed.',
          start: 4500,
          end: 6000,
          confidence: 0.90,
        },
      ],
      language: 'en',
    };

    this.transcriptions.set(recordingId, transcription);

    // Update recording with transcription
    recording.transcription = transcription.text;
    recording.transcriptionStatus = 'completed';
    recording.status = 'completed';
    recording.storageUrl = `s3://wise2-recordings/${recordingId}.wav`;

    this.recordings.set(recordingId, recording);

    console.log(
      `✅ Transcription complete: "${transcription.text.substring(0, 50)}..."`
    );

    return transcription;
  }

  async getRecording(recordingId: string): Promise<Recording | null> {
    return this.recordings.get(recordingId) || null;
  }

  async getTranscription(recordingId: string): Promise<TranscriptionResult | null> {
    return this.transcriptions.get(recordingId) || null;
  }

  async listRecordings(callId: string): Promise<Recording[]> {
    const recordings = Array.from(this.recordings.values()).filter(
      (r) => r.callId === callId
    );
    return recordings;
  }

  async deleteRecording(recordingId: string): Promise<void> {
    const recording = this.recordings.get(recordingId);
    if (!recording) throw new Error(`Recording ${recordingId} not found`);

    // Delete from storage (mock)
    console.log(
      `🗑️  Deleted recording ${recordingId} from ${recording.storageUrl}`
    );

    this.recordings.delete(recordingId);
    this.transcriptions.delete(recordingId);
  }

  getStats(): {
    totalRecordings: number;
    totalDuration: number;
    totalSize: number;
    avgConfidence: number;
  } {
    const recordings = Array.from(this.recordings.values());

    const totalDuration = recordings.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalSize = recordings.reduce((sum, r) => sum + (r.size || 0), 0);
    const avgConfidence =
      recordings.length > 0
        ? Array.from(this.transcriptions.values()).reduce(
            (sum, t) => sum + t.confidence,
            0
          ) / Math.max(this.transcriptions.size, 1)
        : 0;

    return {
      totalRecordings: recordings.length,
      totalDuration,
      totalSize,
      avgConfidence,
    };
  }
}
