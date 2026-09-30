import { Injectable, Logger } from '@nestjs/common';
import { TranscriptionService, TranscriptResult } from './transcription.service';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

interface CaptionTrack {
  format: 'vtt' | 'srt' | 'ass';
  content: string;
}

@Injectable()
export class CaptionGeneratorService {
  private readonly logger = new Logger(CaptionGeneratorService.name);

  constructor(private transcription: TranscriptionService) {}

  async generateCaptions(transcript: TranscriptResult, format: 'vtt' | 'srt' | 'ass' = 'vtt'): Promise<CaptionTrack> {
    if (format === 'vtt') {
      return this.generateVTT(transcript);
    } else if (format === 'srt') {
      return this.generateSRT(transcript);
    } else if (format === 'ass') {
      return this.generateASS(transcript);
    }

    throw new Error(`Unsupported caption format: ${format}`);
  }

  private generateVTT(transcript: TranscriptResult): CaptionTrack {
    let vtt = 'WEBVTT\n\n';

    for (const segment of transcript.segments) {
      const startTime = this.formatTimecode(segment.start, 'vtt');
      const endTime = this.formatTimecode(segment.end, 'vtt');
      vtt += `${startTime} --> ${endTime}\n${segment.text}\n\n`;
    }

    return { format: 'vtt', content: vtt };
  }

  private generateSRT(transcript: TranscriptResult): CaptionTrack {
    let srt = '';
    let counter = 1;

    for (const segment of transcript.segments) {
      const startTime = this.formatTimecode(segment.start, 'srt');
      const endTime = this.formatTimecode(segment.end, 'srt');
      srt += `${counter}\n${startTime} --> ${endTime}\n${segment.text}\n\n`;
      counter++;
    }

    return { format: 'srt', content: srt };
  }

  private generateASS(transcript: TranscriptResult): CaptionTrack {
    let ass = `[Script Info]
Title: Generated Captions
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    for (const segment of transcript.segments) {
      const startTime = this.formatTimecode(segment.start, 'ass');
      const endTime = this.formatTimecode(segment.end, 'ass');
      ass += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${segment.text}\n`;
    }

    return { format: 'ass', content: ass };
  }

  private formatTimecode(seconds: number, format: 'vtt' | 'srt' | 'ass'): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    if (format === 'vtt') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    } else if (format === 'srt') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    } else if (format === 'ass') {
      // ASS format: h:mm:ss.cc (centiseconds)
      const centisecs = Math.floor((seconds % 1) * 100);
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centisecs).padStart(2, '0')}`;
    }

    throw new Error(`Unknown format: ${format}`);
  }

  async addCaptionsToVideo(videoPath: string, transcript: TranscriptResult, outputPath: string): Promise<void> {
    const captionTrack = await this.generateCaptions(transcript, 'ass');
    const captionFile = `${videoPath}.ass`;

    // Write caption file
    fs.writeFileSync(captionFile, captionTrack.content);

    this.logger.log(`Adding captions to video: ${videoPath}`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          `-vf "ass=${captionFile.replace(/\\/g, '\\\\')}"`, // Escape for FFmpeg
          '-c:v libx264',
          '-c:a copy', // Copy audio without re-encoding
        ])
        .on('error', (error) => {
          fs.unlinkSync(captionFile); // Clean up caption file
          reject(new Error(`Caption overlay failed: ${error.message}`));
        })
        .on('end', () => {
          fs.unlinkSync(captionFile); // Clean up caption file
          this.logger.log(`Captions added successfully: ${outputPath}`);
          resolve();
        })
        .save(outputPath);
    });
  }

  async generateClipCaption(transcript: TranscriptResult, startTime: number, endTime: number): Promise<string> {
    // Generate a short caption/description for a clip based on its segment
    const relevantSegments = transcript.segments.filter(
      seg => seg.start >= startTime && seg.end <= endTime,
    );

    if (relevantSegments.length === 0) {
      return 'Check this out!';
    }

    // Combine text from relevant segments
    const text = relevantSegments.map(seg => seg.text).join(' ');

    // Keep it short (Twitter/TikTok friendly)
    if (text.length > 140) {
      return text.substring(0, 137) + '...';
    }

    return text;
  }
}
