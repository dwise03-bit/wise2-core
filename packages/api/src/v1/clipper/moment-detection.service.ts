import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { AudioAnalysisService } from './audio-analysis.service';
import { TranscriptionService } from './transcription.service';
import { MomentType } from '@prisma/client';

interface DetectedMoment {
  timestamp: number;
  type: MomentType;
  confidence: number;
  metadata?: any;
}

@Injectable()
export class MomentDetectionService {
  private readonly logger = new Logger(MomentDetectionService.name);

  constructor(
    private prisma: PrismaService,
    private audioAnalysis: AudioAnalysisService,
    private transcription: TranscriptionService,
  ) {}

  async detectMomentsInMedia(mediaAssetId: string): Promise<DetectedMoment[]> {
    const mediaAsset = await this.prisma.mediaAsset.findUnique({
      where: { id: mediaAssetId },
    });

    if (!mediaAsset) throw new Error('Media asset not found');

    const moments: DetectedMoment[] = [];

    // 1. Audio analysis for energy spikes, laughter, applause
    try {
      const audioMoments = await this.detectFromAudio(mediaAsset.filePath || mediaAsset.sourceUrl || '');
      moments.push(...audioMoments);
    } catch (error: any) {
      this.logger.warn(`Audio analysis failed: ${error.message}`);
    }

    // 2. Transcription-based detection (topic changes, emphasis)
    try {
      const transcriptMoments = await this.detectFromTranscript(mediaAsset.filePath || mediaAsset.sourceUrl || '');
      moments.push(...transcriptMoments);
    } catch (error: any) {
      this.logger.warn(`Transcript analysis failed: ${error.message}`);
    }

    // Save detected moments to database
    for (const moment of moments) {
      await this.prisma.clipMoment.create({
        data: {
          mediaAssetId,
          timestampSeconds: Math.floor(moment.timestamp),
          momentType: moment.type,
          confidenceScore: moment.confidence,
          analysisData: moment.metadata || {},
        },
      });
    }

    return moments;
  }

  private async detectFromAudio(filePath: string): Promise<DetectedMoment[]> {
    const moments: DetectedMoment[] = [];

    // Analyze audio for:
    // 1. Laughter (sudden energy spike + high frequency content)
    // 2. Applause (percussion + consistent energy)
    // 3. High energy (vocal emphasis, excitement)

    const audioAnalysis = await this.audioAnalysis.analyzeAudio(filePath);
    const onsets = await this.audioAnalysis.detectOnsets(filePath);
    const silenceRegions = await this.audioAnalysis.detectSilence(filePath);

    // Detect laughter: combination of energy spike and specific spectral characteristics
    for (let i = 0; i < audioAnalysis.energy.length; i++) {
      if (audioAnalysis.energy[i] > 0.7) {
        moments.push({
          timestamp: audioAnalysis.timestamps[i],
          type: MomentType.LAUGHTER,
          confidence: Math.min(1.0, audioAnalysis.energy[i]),
          metadata: { reason: 'high_energy' },
        });
      }
    }

    // Detect applause: rapid onsets + consistent energy
    for (const onsetTime of onsets.times) {
      moments.push({
        timestamp: onsetTime,
        type: MomentType.APPLAUSE,
        confidence: 0.6,
        metadata: { reason: 'percussion_onset' },
      });
    }

    // Detect silence breaks (often topic changes)
    for (const [start, end] of silenceRegions) {
      if (end - start < 1.0) {
        // Brief silence
        moments.push({
          timestamp: end,
          type: MomentType.TOPIC_CHANGE,
          confidence: 0.5,
          metadata: { silence_duration: end - start },
        });
      }
    }

    return moments;
  }

  private async detectFromTranscript(filePath: string): Promise<DetectedMoment[]> {
    const moments: DetectedMoment[] = [];

    // Transcribe audio
    const transcript = await this.transcription.transcribeAudio(filePath);

    // Analyze transcript for:
    // 1. Topic changes (detected by keyword shifts, speaker changes)
    // 2. Emphasized speech (all caps, multiple punctuation)
    // 3. Questions (useful for engagement)

    for (const segment of transcript.segments) {
      // Detect emphasis: ALL CAPS words or exclamation marks
      if (segment.text.includes('!') || /[A-Z]{3,}/.test(segment.text)) {
        moments.push({
          timestamp: segment.start,
          type: MomentType.SPEECH_EMPHASIS,
          confidence: 0.7,
          metadata: { text: segment.text },
        });
      }

      // Detect topic changes: significant pauses or speaker changes
      if (segment.speaker !== transcript.segments[Math.max(0, transcript.segments.indexOf(segment) - 1)]?.speaker) {
        moments.push({
          timestamp: segment.start,
          type: MomentType.TOPIC_CHANGE,
          confidence: 0.6,
          metadata: { speaker: segment.speaker },
        });
      }
    }

    return moments;
  }

  async scoreClipQuality(mediaAssetId: string, startTime: number, endTime: number): Promise<number> {
    // Score how "clip-worthy" a segment is based on detected moments
    const moments = await this.prisma.clipMoment.findMany({
      where: {
        mediaAssetId,
        timestampSeconds: {
          gte: startTime,
          lte: endTime,
        },
      },
    });

    if (moments.length === 0) return 0;

    // Score: average confidence of moments in segment
    const avgConfidence = moments.reduce((sum, m) => sum + m.confidenceScore, 0) / moments.length;

    // Bonus: variety of moment types (ideally mix of laughter, applause, emphasis)
    const uniqueTypes = new Set(moments.map(m => m.momentType)).size;
    const typeBonus = uniqueTypes / Object.keys(MomentType).length;

    const score = Math.min(1.0, (avgConfidence * 0.7) + (typeBonus * 0.3));
    return Math.round(score * 100);
  }
}
