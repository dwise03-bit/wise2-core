import { Logger } from 'pino';
import {
  GenerationResult,
  QualityEvaluation,
  BrandProfile,
  CreationRequest,
} from '../types';

export class QualityEvaluator {
  private logger: Logger;
  private acceptanceThreshold = 70;

  constructor(logger: Logger, threshold = 70) {
    this.logger = logger;
    this.acceptanceThreshold = threshold;
  }

  async evaluateGeneration(
    result: GenerationResult,
    request: CreationRequest,
    brandAssets?: any
  ): Promise<QualityEvaluation> {
    this.logger.info(
      { resultId: result.id, provider: result.metadata.provider },
      'Starting quality evaluation'
    );

    const evaluation: QualityEvaluation = {
      score: 0,
      brandAccuracy: 0,
      promptAdherence: 0,
      textAccuracy: 0,
      composition: 0,
      consistency: 0,
      photorealism: 0,
      artifacts: false,
      logoAccuracy: 0,
      commercial: false,
      feedback: '',
    };

    // Check for artifacts and major issues (would require actual ML model in production)
    evaluation.artifacts = await this.detectArtifacts(result);

    // Evaluate brand accuracy if brand assets provided
    if (brandAssets) {
      evaluation.brandAccuracy = await this.evaluateBrandAccuracy(result, brandAssets);
    } else {
      evaluation.brandAccuracy = 75; // Default if no brand assets
    }

    // Evaluate prompt adherence (heuristic-based)
    evaluation.promptAdherence = this.evaluatePromptAdherence(
      result.metadata.prompt,
      request.prompt
    );

    // Check for text accuracy
    evaluation.textAccuracy = 100; // Would require OCR in production

    // Heuristic composition score
    evaluation.composition = 75; // Default - would use image analysis

    evaluation.consistency = 80;
    evaluation.photorealism = await this.evaluatePhotorealism(result);

    // Calculate overall score
    evaluation.score = Math.round(
      (evaluation.brandAccuracy * 0.25 +
        evaluation.promptAdherence * 0.3 +
        evaluation.composition * 0.2 +
        evaluation.photorealism * 0.15 +
        evaluation.consistency * 0.1) /
        100 *
        100
    );

    // Determine commercial viability
    evaluation.commercial = evaluation.score >= this.acceptanceThreshold && !evaluation.artifacts;

    evaluation.feedback = this.generateFeedback(evaluation);

    this.logger.info(
      {
        resultId: result.id,
        score: evaluation.score,
        commercial: evaluation.commercial,
      },
      'Quality evaluation complete'
    );

    return evaluation;
  }

  private async detectArtifacts(result: GenerationResult): Promise<boolean> {
    // In production, use ML model to detect artifacts
    // For now, return false (no obvious artifacts detected)
    return false;
  }

  private async evaluateBrandAccuracy(
    result: GenerationResult,
    brandAssets: any
  ): Promise<number> {
    // In production, use vision model to check for brand colors, logos, etc.
    // For now, return a default score
    return 80;
  }

  private evaluatePromptAdherence(generatedPrompt: string, originalPrompt: string): number {
    // Simple heuristic: check for key keywords overlap
    const originalWords = originalPrompt.toLowerCase().split(/\s+/);
    const generatedWords = generatedPrompt.toLowerCase().split(/\s+/);

    const matchCount = originalWords.filter((word) => generatedWords.includes(word)).length;
    const adherence = (matchCount / Math.max(originalWords.length, 1)) * 100;

    return Math.min(100, adherence);
  }

  private async evaluatePhotorealism(result: GenerationResult): Promise<number> {
    // In production, use ML model to evaluate photorealism
    // For now, base on provider quality tier
    const providerRealism: Record<string, number> = {
      kling: 90,
      hailuo: 88,
      pixverse: 75,
      pika: 70,
      comfyui: 65,
      local_diffusion: 60,
      openai: 85,
      krea: 80,
    };

    return providerRealism[result.metadata.provider] || 70;
  }

  private generateFeedback(evaluation: QualityEvaluation): string {
    const issues: string[] = [];

    if (evaluation.brandAccuracy < 70) {
      issues.push('Brand accuracy below threshold');
    }

    if (evaluation.promptAdherence < 70) {
      issues.push('Prompt adherence issues detected');
    }

    if (evaluation.artifacts) {
      issues.push('Artifacts detected in generation');
    }

    if (evaluation.score < this.acceptanceThreshold) {
      issues.push(`Quality score ${evaluation.score} below threshold ${this.acceptanceThreshold}`);
    }

    if (issues.length === 0) {
      return 'Generation meets quality standards for commercial use';
    }

    return `Issues: ${issues.join('; ')}`;
  }

  setAcceptanceThreshold(threshold: number) {
    this.acceptanceThreshold = threshold;
  }
}
