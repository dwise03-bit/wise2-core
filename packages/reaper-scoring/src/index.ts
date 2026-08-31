// REAPER Scoring Engine - M0 Foundation

import { ScoreComponent, ScoreResult, ScoreType } from '@wise2/reaper-domain';

export interface ScoringInput {
  components: Record<string, number>;
  confidences: Record<string, number>;
  weights: Record<string, number>;
}

export interface ScoringConfig {
  type: ScoreType;
  weights: Record<string, number>;
}

/**
 * Calculate a weighted score from components
 * Treats UNKNOWN values as reducing confidence, not raw score
 */
export function calculateScore(input: ScoringInput): {
  rawScore: number;
  confidence: number;
  components: ScoreComponent[];
} {
  const { components, confidences, weights } = input;

  let totalWeight = 0;
  let weightedSum = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  const scoreComponents: ScoreComponent[] = [];

  for (const [key, weight] of Object.entries(weights)) {
    const value = components[key] ?? 0;
    const confidence = confidences[key] ?? 0;

    if (confidence > 0) {
      weightedSum += value * weight;
      totalWeight += weight;
      totalConfidence += confidence;
      confidenceCount += 1;

      scoreComponents.push({
        name: key,
        weight,
        value,
        confidence,
      });
    }
  }

  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
  const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 60;

  // Base confidence: 60% + (avgConfidence / 100 * 40%)
  const finalConfidence = Math.round(60 + (avgConfidence / 100) * 40);

  return {
    rawScore: Math.round(rawScore),
    confidence: finalConfidence,
    components: scoreComponents,
  };
}

/**
 * Website Score = 0.15 UX + 0.15 MOBILE + 0.15 CONVERSION + 0.10 PERFORMANCE
 *                 + 0.10 TRUST + 0.10 CONTENT + 0.10 TECHNICAL + 0.10 STRUCTURE
 *                 + 0.05 ACCESSIBILITY
 */
export const WEBSITE_SCORE_WEIGHTS: Record<string, number> = {
  UX: 0.15,
  MOBILE: 0.15,
  CONVERSION: 0.15,
  PERFORMANCE: 0.1,
  TRUST: 0.1,
  CONTENT: 0.1,
  TECHNICAL: 0.1,
  STRUCTURE: 0.1,
  ACCESSIBILITY: 0.05,
};

/**
 * Business Health Score = 0.30 REPUTATION + 0.20 BUSINESS_ACTIVITY
 *                         + 0.15 MARKET_PRESENCE + 0.15 CUSTOMER_PROOF
 *                         + 0.10 SERVICE_CLARITY + 0.10 LONGEVITY_SIGNAL
 */
export const BUSINESS_HEALTH_WEIGHTS: Record<string, number> = {
  REPUTATION: 0.3,
  BUSINESS_ACTIVITY: 0.2,
  MARKET_PRESENCE: 0.15,
  CUSTOMER_PROOF: 0.15,
  SERVICE_CLARITY: 0.1,
  LONGEVITY_SIGNAL: 0.1,
};

/**
 * Digital Execution Score = 0.18 WEBSITE + 0.14 BRAND + 0.12 SEO
 *                           + 0.12 SOCIAL + 0.10 CONTENT + 0.12 CONVERSION
 *                           + 0.08 AUTOMATION + 0.08 TRUST + 0.06 COMPETITIVE_POSITION
 */
export const DIGITAL_EXECUTION_WEIGHTS: Record<string, number> = {
  WEBSITE: 0.18,
  BRAND: 0.14,
  SEO: 0.12,
  SOCIAL: 0.12,
  CONTENT: 0.1,
  CONVERSION: 0.12,
  AUTOMATION: 0.08,
  TRUST: 0.08,
  COMPETITIVE_POSITION: 0.06,
};

/**
 * Growth Potential Score = 0.20 MARKET_OPPORTUNITY + 0.20 DIGITAL_GAP
 *                          + 0.15 REPUTATION_STRENGTH + 0.15 SERVICE_EXPANSION
 *                          + 0.10 COMPETITOR_GAP + 0.10 CONTENT_OPPORTUNITY
 *                          + 0.10 AUTOMATION_OPPORTUNITY
 *
 * Digital Gap = 100 - Digital Execution
 */
export const GROWTH_POTENTIAL_WEIGHTS: Record<string, number> = {
  MARKET_OPPORTUNITY: 0.2,
  DIGITAL_GAP: 0.2,
  REPUTATION_STRENGTH: 0.15,
  SERVICE_EXPANSION: 0.15,
  COMPETITOR_GAP: 0.1,
  CONTENT_OPPORTUNITY: 0.1,
  AUTOMATION_OPPORTUNITY: 0.1,
};

/**
 * REAPER Opportunity Score = 0.25 BUSINESS_HEALTH + 0.25 DIGITAL_GAP
 *                            + 0.20 GROWTH_POTENTIAL + 0.10 COMPETITIVE_GAP
 *                            + 0.10 PROJECT_SCOPE_POTENTIAL + 0.10 BUYER_READINESS_SIGNAL
 *
 * Confidence factor: 0.60 + (OverallConfidence / 100 × 0.40)
 */
export const REAPER_OPPORTUNITY_WEIGHTS: Record<string, number> = {
  BUSINESS_HEALTH: 0.25,
  DIGITAL_GAP: 0.25,
  GROWTH_POTENTIAL: 0.2,
  COMPETITIVE_GAP: 0.1,
  PROJECT_SCOPE_POTENTIAL: 0.1,
  BUYER_READINESS_SIGNAL: 0.1,
};

export function getWeightsForScore(scoreType: ScoreType): Record<string, number> {
  const weights: Record<ScoreType, Record<string, number>> = {
    WEBSITE: WEBSITE_SCORE_WEIGHTS,
    BRAND: { CONSISTENCY: 0.2, PROFESSIONALISM: 0.2, DISTINCTIVENESS: 0.15, MEMORABILITY: 0.15, MODERNITY: 0.1, MESSAGE_CLARITY: 0.1, SCALABILITY: 0.1 },
    SEO: { TECHNICAL_SEO: 0.2, PAGE_METADATA: 0.15, CONTENT_RELEVANCE: 0.15, LOCAL_SEO: 0.15, STRUCTURED_DATA: 0.1, INTERNAL_STRUCTURE: 0.1, INDEXABILITY: 0.1, CONTENT_DEPTH: 0.05 },
    SOCIAL: { PROFILE_COMPLETENESS: 0.15, ACTIVITY: 0.2, CONSISTENCY: 0.15, CONTENT_QUALITY: 0.15, VIDEO_USAGE: 0.1, ENGAGEMENT_SIGNAL: 0.1, CTA_USAGE: 0.1, PLATFORM_COVERAGE: 0.05 },
    REPUTATION: { RATING_SCORE: 0.3, REVIEW_VOLUME: 0.2, REVIEW_RECENCY: 0.15, REVIEW_VELOCITY: 0.1, OWNER_RESPONSE: 0.15, SENTIMENT_STABILITY: 0.1 },
    CONVERSION: { CTA_CLARITY: 0.2, CONTACT_EASE: 0.15, LEAD_CAPTURE: 0.15, BOOKING: 0.1, TRUST_ELEMENTS: 0.1, OFFER_CLARITY: 0.1, FOLLOW_UP_READINESS: 0.1, CUSTOMER_JOURNEY: 0.1 },
    BUSINESS_HEALTH: BUSINESS_HEALTH_WEIGHTS,
    DIGITAL_EXECUTION: DIGITAL_EXECUTION_WEIGHTS,
    GROWTH_POTENTIAL: GROWTH_POTENTIAL_WEIGHTS,
    REAPER_OPPORTUNITY: REAPER_OPPORTUNITY_WEIGHTS,
  };

  return weights[scoreType] || {};
}

export function formatScoreResult(input: ScoringInput, scoreType: ScoreType): ScoreResult {
  const weights = getWeightsForScore(scoreType);
  const result = calculateScore({
    components: input.components,
    confidences: input.confidences,
    weights,
  });

  return {
    id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    scoreType,
    rawScore: result.rawScore,
    confidence: result.confidence,
    components: result.components,
    reasoning: `Calculated ${scoreType} score from ${result.components.length} components with ${result.confidence}% confidence`,
    version: 1,
    calculatedAt: new Date(),
  };
}
