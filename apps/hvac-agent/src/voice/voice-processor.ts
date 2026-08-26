import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export class VoiceProcessor {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Save buffer to temp file (Whisper API requires file)
      const tempFile = path.join('/tmp', `audio-${Date.now()}.wav`);
      fs.writeFileSync(tempFile, audioBuffer);

      // Transcribe using Whisper
      const transcript = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFile),
        model: 'whisper-1',
        language: 'en',
      });

      // Clean up temp file
      fs.unlinkSync(tempFile);

      return transcript.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async synthesizeToSpeech(text: string): Promise<Buffer> {
    try {
      // Use OpenAI TTS API for natural voice response
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'onyx', // Professional, neutral tone
        input: text,
        speed: 1.0,
      });

      // Convert response to buffer
      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error('TTS error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async realTimeTranscribe(
    audioBuffer: Buffer,
    onPartialTranscript: (text: string) => void
  ): Promise<string> {
    // For real-time, we'd use a different approach (streaming transcription)
    // For now, use batch transcription
    return this.transcribeAudio(audioBuffer);
  }
}
