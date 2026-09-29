import { Injectable, Logger } from '@nestjs/common';

export interface ARAnnotation {
  id: string;
  type: 'circle' | 'arrow' | 'rectangle' | 'text' | 'detection_box';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  color: string;
  text?: string;
  opacity: number;
  size?: number;
  rotation?: number;
}

export interface ARScene {
  sceneId: string;
  jobId: string;
  annotations: ARAnnotation[];
  cameraFeed: string; // WebRTC stream URL
  timestamp: Date;
  isActive: boolean;
}

export interface ARFrame {
  frameId: string;
  timestamp: Date;
  baseImage: Buffer; // Video frame
  annotations: ARAnnotation[];
  detections?: Array<{
    label: string;
    confidence: number;
    bbox: { x: number; y: number; w: number; h: number };
  }>;
}

@Injectable()
export class AREngineService {
  private readonly logger = new Logger(AREngineService.name);
  private activeScenes: Map<string, ARScene> = new Map();
  private annotationHistory: Map<string, ARAnnotation[]> = new Map();

  /**
   * Initialize AR scene for job
   */
  createARScene(jobId: string, cameraFeedUrl: string): ARScene {
    const sceneId = `ar-${jobId}-${Date.now()}`;

    const scene: ARScene = {
      sceneId,
      jobId,
      annotations: [],
      cameraFeed: cameraFeedUrl,
      timestamp: new Date(),
      isActive: true,
    };

    this.activeScenes.set(jobId, scene);
    this.annotationHistory.set(jobId, []);

    this.logger.log(`AR scene created: ${sceneId}`);
    return scene;
  }

  /**
   * Add annotation to AR scene (renders on glasses)
   */
  addAnnotation(jobId: string, annotation: ARAnnotation): boolean {
    const scene = this.activeScenes.get(jobId);
    if (!scene || !scene.isActive) {
      this.logger.warn(`Scene not found or inactive: ${jobId}`);
      return false;
    }

    scene.annotations.push(annotation);

    // Store in history for persistence
    const history = this.annotationHistory.get(jobId) || [];
    history.push(annotation);
    this.annotationHistory.set(jobId, history);

    this.logger.log(`Annotation added to scene ${jobId}: ${annotation.type}`);
    return true;
  }

  /**
   * Add AI detection box (automatic from ML model)
   */
  addDetectionBox(
    jobId: string,
    label: string,
    bbox: { x: number; y: number; w: number; h: number },
    confidence: number
  ): boolean {
    const scene = this.activeScenes.get(jobId);
    if (!scene || !scene.isActive) return false;

    // Color code by confidence
    const color = confidence > 0.9 ? '#FF0000' : confidence > 0.8 ? '#FFA500' : '#FFFF00';

    const annotation: ARAnnotation = {
      id: `det-${Date.now()}`,
      type: 'detection_box',
      x: bbox.x,
      y: bbox.y,
      x2: bbox.x + bbox.w,
      y2: bbox.y + bbox.h,
      color,
      text: `${label} (${Math.round(confidence * 100)}%)`,
      opacity: 0.7,
      size: 2,
    };

    return this.addAnnotation(jobId, annotation);
  }

  /**
   * Clear specific annotation
   */
  removeAnnotation(jobId: string, annotationId: string): boolean {
    const scene = this.activeScenes.get(jobId);
    if (!scene) return false;

    const index = scene.annotations.findIndex((a) => a.id === annotationId);
    if (index >= 0) {
      scene.annotations.splice(index, 1);
      this.logger.log(`Annotation removed: ${annotationId}`);
      return true;
    }

    return false;
  }

  /**
   * Clear all annotations from scene
   */
  clearScene(jobId: string): boolean {
    const scene = this.activeScenes.get(jobId);
    if (!scene) return false;

    scene.annotations = [];
    this.logger.log(`Scene cleared: ${jobId}`);
    return true;
  }

  /**
   * Get current AR state for rendering
   */
  getARState(jobId: string): ARScene | null {
    return this.activeScenes.get(jobId) || null;
  }

  /**
   * Export AR frame with overlays
   * In production: uses Canvas/Metal for actual rendering
   */
  async exportARFrame(jobId: string): Promise<ARFrame> {
    const scene = this.activeScenes.get(jobId);
    if (!scene) {
      throw new Error(`Scene not found: ${jobId}`);
    }

    const frameId = `frame-${jobId}-${Date.now()}`;

    // In production: fetch actual video frame from WebRTC stream
    // For demo: use placeholder
    const baseImage = Buffer.from('placeholder-video-frame');

    const frame: ARFrame = {
      frameId,
      timestamp: new Date(),
      baseImage,
      annotations: scene.annotations,
      detections: scene.annotations
        .filter((a) => a.type === 'detection_box')
        .map((a) => ({
          label: a.text || 'unknown',
          confidence: 0.85,
          bbox: { x: a.x, y: a.y, w: a.x2 ? a.x2 - a.x : 0, h: a.y2 ? a.y2 - a.y : 0 },
        })),
    };

    return frame;
  }

  /**
   * Get annotation history (for supervisor review)
   */
  getAnnotationHistory(jobId: string): ARAnnotation[] {
    return this.annotationHistory.get(jobId) || [];
  }

  /**
   * Close AR scene
   */
  closeScene(jobId: string): boolean {
    const scene = this.activeScenes.get(jobId);
    if (!scene) return false;

    scene.isActive = false;
    this.logger.log(`AR scene closed: ${jobId}`);

    // Keep history for 24 hours
    setTimeout(() => {
      this.activeScenes.delete(jobId);
      this.annotationHistory.delete(jobId);
    }, 24 * 60 * 60 * 1000);

    return true;
  }

  /**
   * Render annotation to canvas (for testing)
   */
  renderAnnotation(annotation: ARAnnotation, canvas: any): void {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.globalAlpha = annotation.opacity;
    ctx.lineWidth = annotation.size || 2;

    switch (annotation.type) {
      case 'circle': {
        const radius = Math.sqrt(
          Math.pow(annotation.x2 ? annotation.x2 - annotation.x : 0, 2) +
            Math.pow(annotation.y2 ? annotation.y2 - annotation.y : 0, 2)
        );
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      }

      case 'rectangle': {
        const w = annotation.x2 ? annotation.x2 - annotation.x : 100;
        const h = annotation.y2 ? annotation.y2 - annotation.y : 100;
        ctx.strokeRect(annotation.x, annotation.y, w, h);
        break;
      }

      case 'text': {
        ctx.font = '16px Arial';
        ctx.fillText(annotation.text || '', annotation.x, annotation.y);
        break;
      }

      case 'detection_box': {
        const w = annotation.x2 ? annotation.x2 - annotation.x : 100;
        const h = annotation.y2 ? annotation.y2 - annotation.y : 100;
        ctx.strokeRect(annotation.x, annotation.y, w, h);
        if (annotation.text) {
          ctx.font = '14px Arial';
          ctx.fillText(annotation.text, annotation.x + 5, annotation.y - 5);
        }
        break;
      }
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * Get active scene count
   */
  getActiveSceneCount(): number {
    return Array.from(this.activeScenes.values()).filter((s) => s.isActive).length;
  }
}
