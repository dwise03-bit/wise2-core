import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoExtractorService {
  private readonly outputDir = './uploads/clips';

  constructor() {
    this.ensureOutputDir();
  }

  private ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async extractClip(
    sourceFile: string,
    startTimeSeconds: number,
    endTimeSeconds: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFile = path.join(
        this.outputDir,
        `clip-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`,
      );

      const durationSeconds = endTimeSeconds - startTimeSeconds;

      // Use GPU encoding (NVIDIA NVENC) if available, fallback to CPU
      ffmpeg(sourceFile)
        .inputOptions([`-ss ${startTimeSeconds}`])
        .outputOptions([
          `-t ${durationSeconds}`,
          '-c:v h264_nvenc', // NVIDIA GPU encoding (fallback to libx264 if not available)
          '-preset fast', // Quality/speed balance
          '-b:v 4500k', // Video bitrate
          '-c:a aac', // Audio codec
          '-b:a 128k', // Audio bitrate
        ])
        .on('error', (error) => {
          // If GPU encoding fails, try CPU encoding
          this.extractClipCpu(sourceFile, startTimeSeconds, endTimeSeconds, outputFile)
            .then(resolve)
            .catch(reject);
        })
        .on('end', () => {
          resolve(outputFile);
        })
        .save(outputFile);
    });
  }

  private async extractClipCpu(
    sourceFile: string,
    startTimeSeconds: number,
    endTimeSeconds: number,
    outputFile: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const durationSeconds = endTimeSeconds - startTimeSeconds;

      ffmpeg(sourceFile)
        .inputOptions([`-ss ${startTimeSeconds}`])
        .outputOptions([
          `-t ${durationSeconds}`,
          '-c:v libx264', // CPU-based H.264 encoding
          '-crf 23', // Quality (lower = better)
          '-b:v 4500k', // Video bitrate
          '-c:a aac', // Audio codec
          '-b:a 128k', // Audio bitrate
        ])
        .on('error', (error) => {
          reject(new Error(`Video extraction failed: ${error.message}`));
        })
        .on('end', () => {
          resolve(outputFile);
        })
        .save(outputFile);
    });
  }

  async optimizeForPlatform(
    sourceFile: string,
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter',
  ): Promise<{ file: string; resolution: string; bitrate: string }> {
    const specs = this.getPlatformSpecs(platform);
    const outputFile = path.join(
      this.outputDir,
      `${platform}-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`,
    );

    return new Promise((resolve, reject) => {
      ffmpeg(sourceFile)
        .outputOptions([
          `-vf scale=${specs.resolution}`,
          `-c:v h264_nvenc`,
          `-b:v ${specs.bitrate}`,
          `-c:a aac`,
          `-b:a 128k`,
        ])
        .on('error', reject)
        .on('end', () => {
          resolve({
            file: outputFile,
            resolution: specs.resolution,
            bitrate: specs.bitrate,
          });
        })
        .save(outputFile);
    });
  }

  private getPlatformSpecs(platform: string): { resolution: string; bitrate: string } {
    const specs = {
      instagram: { resolution: '1080x1350', bitrate: '3000k' }, // Vertical Reels
      tiktok: { resolution: '1080x1920', bitrate: '2500k' }, // Vertical
      youtube: { resolution: '1280x720', bitrate: '4500k' }, // 720p Shorts
      twitter: { resolution: '1200x675', bitrate: '3000k' }, // Horizontal
      default: { resolution: '1280x720', bitrate: '4500k' },
    };

    return specs[platform] || specs.default;
  }

  async getVideoMetadata(filePath: string): Promise<{ duration: number; resolution: string }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) reject(error);

        const stream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!stream) reject(new Error('No video stream found'));

        resolve({
          duration: metadata.format.duration || 0,
          resolution: `${stream.width}x${stream.height}`,
        });
      });
    });
  }
}
