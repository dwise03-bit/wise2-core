/**
 * Sentiment Analyzer
 * Analyzes article sentiment regarding 2nd Amendment topics
 */

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 (very negative) to +1 (very positive)
  confidence: number; // 0-1
  keywords: string[];
}

// Positive indicators (pro-2A, pro-rights)
const POSITIVE_KEYWORDS = [
  'right',
  'rights',
  'freedom',
  'liberty',
  'constitutional',
  'protection',
  'defend',
  'defense',
  'victory',
  'wins',
  'success',
  'upholds',
  'affirms',
  'supports',
  'citizens',
  'patriot',
];

// Negative indicators (anti-gun, restrictions)
const NEGATIVE_KEYWORDS = [
  'ban',
  'restriction',
  'control',
  'violence',
  'deaths',
  'tragedy',
  'dangerous',
  'threat',
  'prohibited',
  'illegal',
  'unconstitutional',
  'assault',
  'crackdown',
  'attack',
  'harm',
  'epidemic',
];

// Neutral/balanced indicators
const NEUTRAL_KEYWORDS = ['report', 'study', 'analysis', 'according', 'data', 'survey', 'poll'];

/**
 * Analyze sentiment of article content
 */
export function analyzeSentiment(title: string, content: string): SentimentResult {
  const fullText = `${title} ${content}`.toLowerCase();
  const words = fullText.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  const foundKeywords: string[] = [];

  // Count keyword occurrences
  for (const word of words) {
    if (POSITIVE_KEYWORDS.some((kw) => word.includes(kw))) {
      positiveCount++;
      foundKeywords.push(word);
    }
    if (NEGATIVE_KEYWORDS.some((kw) => word.includes(kw))) {
      negativeCount++;
      foundKeywords.push(word);
    }
    if (NEUTRAL_KEYWORDS.some((kw) => word.includes(kw))) {
      neutralCount++;
    }
  }

  // Calculate sentiment score
  const total = positiveCount + negativeCount;
  let score = 0;
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let confidence = 0;

  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    confidence = Math.min(1.0, total / words.length);

    if (score > 0.2) {
      sentiment = 'positive';
    } else if (score < -0.2) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
  } else {
    confidence = neutralCount > 0 ? 0.5 : 0.3;
  }

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
    keywords: Array.from(new Set(foundKeywords)).slice(0, 5), // Top 5 unique keywords
  };
}

/**
 * Get sentiment interpretation
 */
export function getSentimentLabel(sentiment: 'positive' | 'negative' | 'neutral'): string {
  const labels: Record<string, string> = {
    positive: 'Pro-2nd Amendment / Rights-focused',
    negative: 'Anti-gun / Restriction-focused',
    neutral: 'Balanced / Factual reporting',
  };
  return labels[sentiment] || 'Unknown';
}

/**
 * Analyze article tone and bias
 */
export function analyzeTone(
  title: string,
  content: string
): {
  tone: 'favorable' | 'critical' | 'neutral';
  bias: 'pro-2a' | 'anti-gun' | 'balanced';
  explanation: string;
} {
  const sentiment = analyzeSentiment(title, content);
  const titleText = title.toLowerCase();

  let tone: 'favorable' | 'critical' | 'neutral' = 'neutral';
  let bias: 'pro-2a' | 'anti-gun' | 'balanced' = 'balanced';

  // Determine tone
  if (sentiment.sentiment === 'positive' && sentiment.score > 0.3) {
    tone = 'favorable';
    bias = 'pro-2a';
  } else if (sentiment.sentiment === 'negative' && sentiment.score < -0.3) {
    tone = 'critical';
    bias = 'anti-gun';
  }

  // Check for loaded language in title
  const loadedPositive = [
    'victory',
    'triumph',
    'success',
    'freedom',
    'upholds',
    'protects',
  ].some((w) => titleText.includes(w));
  const loadedNegative = ['tragedy', 'crisis', 'deadly', 'ban', 'attack'].some((w) =>
    titleText.includes(w)
  );

  if (loadedPositive && bias === 'balanced') {
    bias = 'pro-2a';
    tone = 'favorable';
  }
  if (loadedNegative && bias === 'balanced') {
    bias = 'anti-gun';
    tone = 'critical';
  }

  const explanations: Record<string, string> = {
    'favorable|pro-2a':
      'Article presents 2nd Amendment issues favorably, emphasizing rights and freedoms.',
    'critical|anti-gun':
      'Article takes critical stance on gun rights, emphasizing restrictions and control.',
    'neutral|balanced':
      'Article presents balanced reporting on 2nd Amendment issues.',
  };

  const key = `${tone}|${bias}`;
  const explanation = explanations[key] || 'Tone analysis complete.';

  return { tone, bias, explanation };
}
