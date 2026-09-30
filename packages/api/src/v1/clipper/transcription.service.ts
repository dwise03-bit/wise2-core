import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

export interface TranscriptSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
  speaker?: string;
}

export interface TranscriptResult {
  text: string;
  language: string;
  segments: TranscriptSegment[];
  duration: number;
}

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly openaiApiKey = process.env.OPENAI_API_KEY;
  private readonly whisperModel = 'whisper-1';
  private readonly openaiApiUrl = 'https://api.openai.com/v1/audio/transcriptions';

  async transcribeAudio(audioFilePath: string): Promise<TranscriptResult> {
    if (!this.openaiApiKey) {
      this.logger.warn('OpenAI API key not configured, returning empty transcript');
      return { text: '', language: 'unknown', segments: [], duration: 0 };
    }

    try {
      const fileStream = fs.createReadStream(audioFilePath);
      const formData = new FormData();

      formData.append('file', fileStream);
      formData.append('model', this.whisperModel);
      formData.append('language', 'en'); // Default to English
      formData.append('response_format', 'verbose_json'); // Get detailed output

      const response = await axios.post(this.openaiApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
      });

      this.logger.log(`Transcription complete: ${audioFilePath}`);

      return {
        text: response.data.text,
        language: response.data.language || 'en',
        segments: (response.data.segments || []).map((seg: any) => ({
          id: seg.id,
          seek: seg.seek,
          start: seg.start,
          end: seg.end,
          text: seg.text,
          tokens: seg.tokens,
          temperature: seg.temperature,
          avg_logprob: seg.avg_logprob,
          compression_ratio: seg.compression_ratio,
          no_speech_prob: seg.no_speech_prob,
        })),
        duration: response.data.duration || 0,
      };
    } catch (error) {
      this.logger.error(`Transcription failed: ${error.message}`);
      throw error;
    }
  }

  async getTranscriptSummary(transcript: TranscriptResult): Promise<string> {
    // TODO: Use Claude API to summarize transcript
    // This would be useful for generating clip descriptions

    if (transcript.segments.length === 0) {
      return '';
    }

    // For now, just return first few sentences
    const text = transcript.text;
    const sentences = text.split(/[.!?]+/).slice(0, 3).join('. ');
    return sentences + '.';
  }

  async extractKeywords(transcript: TranscriptResult): Promise<string[]> {
    // Extract important keywords/phrases from transcript
    // Could use NLP or Claude API for better results

    const keywords: string[] = [];

    // Simple regex-based keyword extraction
    const text = transcript.text.toLowerCase();

    // Extract capitalized phrases (likely proper nouns)
    const properNouns = transcript.text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [];
    keywords.push(...new Set(properNouns));

    // Extract common phrases
    const phrases = text.match(/\b(?:about|regarding|discussing|talking|focusing|looking at)\s+([^.]+)/g) || [];
    keywords.push(...phrases.map(p => p.replace(/^(about|regarding|discussing|talking|focusing|looking at)\s+/, '')));

    return [...new Set(keywords)].slice(0, 10);
  }

  async getSegmentSpeaker(segment: TranscriptSegment): Promise<string> {
    // Detect speaker from segment
    // Could use speaker diarization for multi-speaker content

    // For MVP, just return "Speaker" or "Unknown"
    return segment.speaker || 'Speaker';
  }
}
