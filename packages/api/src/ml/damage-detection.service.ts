import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface DamageDetectionResult {
  detectionId: string;
  timestamp: Date;
  confidence: number;
  classification: 'working' | 'broken' | 'needs_maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: { x: number; y: number; width: number; height: number };
  description: string;
  recommendations: string[];
}

export interface DetectionModel {
  name: string;
  version: string;
  accuracy: number;
  latency: number; // ms
  supportedClasses: string[];
}

@Injectable()
export class DamageDetectionService {
  private readonly logger = new Logger(DamageDetectionService.name);
  private modelEndpoint = process.env.ML_API_ENDPOINT || 'http://localhost:8000';
  private modelVersion = 'yolov8-hvac-v1.0';
  private confidenceThreshold = 0.75;

  /**
   * Detect damage from video frame
   * Input: Base64 encoded image or URL
   * Output: Damage classification with confidence
   */
  async detectDamage(imageData: string | Buffer, jobId: string): Promise<DamageDetectionResult> {
    try {
      // Convert buffer to base64 if needed
      const base64Image = typeof imageData === 'string' ? imageData : imageData.toString('base64');

      // Call ML API
      const response = await axios.post(`${this.modelEndpoint}/detect`, {
        image: base64Image,
        model: this.modelVersion,
        confidence_threshold: this.confidenceThreshold,
      });

      const { detection, confidence, bbox, class_name } = response.data;

      // Map ML output to application types
      const classification = this.mapClassification(class_name);
      const severity = this.calculateSeverity(classification, confidence);

      const result: DamageDetectionResult = {
        detectionId: `det-${jobId}-${Date.now()}`,
        timestamp: new Date(),
        confidence,
        classification,
        severity,
        location: bbox ? { x: bbox.x, y: bbox.y, width: bbox.w, height: bbox.h } : undefined,
        description: this.generateDescription(classification, confidence),
        recommendations: this.generateRecommendations(classification, severity),
      };

      this.logger.log(
        `Damage detected: ${classification} (confidence: ${confidence.toFixed(2)})`
      );

      return result;
    } catch (error) {
      this.logger.error(`Damage detection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Batch process video frames (for recording analysis)
   */
  async analyzeRecording(recordingPath: string, jobId: string): Promise<DamageDetectionResult[]> {
    const results: DamageDetectionResult[] = [];

    try {
      // Extract frames from recording (every 30 frames = ~1s at 30fps)
      const frameInterval = 30;
      let frameCount = 0;

      // For demo: analyze single frame at middle of recording
      // In production: use FFmpeg to extract frames
      const midpointFrame = `${recordingPath}:seek=50%`; // Get 50% into video

      const detection = await this.detectDamage(midpointFrame, jobId);
      results.push(detection);

      this.logger.log(`Recording analysis complete: ${results.length} detections`);
      return results;
    } catch (error) {
      this.logger.error(`Recording analysis failed: ${error}`);
      return results;
    }
  }

  /**
   * Get available detection models
   */
  async getAvailableModels(): Promise<DetectionModel[]> {
    try {
      const response = await axios.get(`${this.modelEndpoint}/models`);
      return response.data.models;
    } catch (error) {
      this.logger.error(`Failed to fetch models: ${error}`);
      return [
        {
          name: 'yolov8-hvac',
          version: 'v1.0',
          accuracy: 0.87,
          latency: 150,
          supportedClasses: ['working', 'broken', 'needs_maintenance'],
        },
      ];
    }
  }

  /**
   * Switch detection model (edge vs cloud)
   */
  async switchModel(modelName: string, edge: boolean = false): Promise<boolean> {
    try {
      if (edge) {
        // Use on-device model (iOS/Android)
        this.modelEndpoint = 'local';
        this.modelVersion = `${modelName}-edge`;
      } else {
        // Use cloud model
        this.modelEndpoint = process.env.ML_API_ENDPOINT || 'http://localhost:8000';
        this.modelVersion = modelName;
      }

      this.logger.log(`Switched to ${edge ? 'edge' : 'cloud'} model: ${modelName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to switch model: ${error}`);
      return false;
    }
  }

  /**
   * Train custom model (async job)
   */
  async startTraining(dataset: string, epochs: number = 50): Promise<string> {
    try {
      const response = await axios.post(`${this.modelEndpoint}/train`, {
        dataset,
        epochs,
        batch_size: 32,
        learning_rate: 0.001,
      });

      const trainingJobId = response.data.job_id;
      this.logger.log(`Training started: ${trainingJobId}`);

      return trainingJobId;
    } catch (error) {
      this.logger.error(`Training start failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get training progress
   */
  async getTrainingStatus(jobId: string): Promise<{ progress: number; status: string }> {
    try {
      const response = await axios.get(`${this.modelEndpoint}/train/${jobId}`);
      return {
        progress: response.data.progress,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.error(`Failed to get training status: ${error}`);
      return { progress: 0, status: 'error' };
    }
  }

  // Helper methods
  private mapClassification(
    className: string
  ): 'working' | 'broken' | 'needs_maintenance' {
    const mapping: Record<string, 'working' | 'broken' | 'needs_maintenance'> = {
      healthy: 'working',
      working: 'working',
      damaged: 'broken',
      broken: 'broken',
      failed: 'broken',
      dirty: 'needs_maintenance',
      clogged: 'needs_maintenance',
      leaking: 'needs_maintenance',
      maintenance_required: 'needs_maintenance',
    };

    return mapping[className.toLowerCase()] || 'needs_maintenance';
  }

  private calculateSeverity(
    classification: 'working' | 'broken' | 'needs_maintenance',
    confidence: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (classification === 'working') return 'low';
    if (classification === 'needs_maintenance') {
      return confidence > 0.9 ? 'high' : 'medium';
    }
    // broken
    return confidence > 0.9 ? 'critical' : 'high';
  }

  private generateDescription(
    classification: 'working' | 'broken' | 'needs_maintenance',
    confidence: number
  ): string {
    const confidenceText = `${Math.round(confidence * 100)}% confidence`;

    switch (classification) {
      case 'working':
        return `Equipment is functioning normally (${confidenceText})`;
      case 'broken':
        return `Equipment has detected damage and requires immediate repair (${confidenceText})`;
      case 'needs_maintenance':
        return `Equipment requires maintenance to prevent future issues (${confidenceText})`;
    }
  }

  private generateRecommendations(
    classification: 'working' | 'broken' | 'needs_maintenance',
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): string[] {
    const recommendations: Record<string, string[]> = {
      working: ['Continue regular maintenance schedule'],
      needs_maintenance: [
        'Schedule maintenance within 1 week',
        'Monitor for worsening conditions',
        'Document current state for comparison',
      ],
      broken: [
        'URGENT: Contact supervisor immediately',
        'Do not operate equipment',
        'Document all damage with photos',
        'Request emergency repair service',
      ],
    };

    return recommendations[classification] || [];
  }
}
