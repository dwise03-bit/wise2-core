/**
 * Relevance Scorer
 * Scores articles for 2nd Amendment relevance (0-1 scale)
 */

// 2nd Amendment keywords and related terms
const PRIMARY_KEYWORDS = [
  '2nd amendment',
  'second amendment',
  '2a',
  'gun rights',
  'right to bear arms',
  'firearms',
  'shall not be infringed',
];

const SECONDARY_KEYWORDS = [
  'gun control',
  'gun violence',
  'gun regulations',
  'supreme court',
  'scotus',
  'second circuit',
  'atf',
  'armed',
  'firearm',
  'ammunition',
  'concealed carry',
  'ccw',
];

const TERTIARY_KEYWORDS = [
  'constitutional',
  'rights',
  'legislation',
  'congress',
  'senate',
  'bill',
  'law',
  'policy',
  'justice',
  'court',
];

const EXCLUDED_KEYWORDS = [
  'video game',
  'movie',
  'firearm safety course',
  'hunter education',
  'archery',
];

/**
 * Calculate relevance score based on keywords and content
 */
export function calculateRelevanceScore(
  title: string,
  content: string,
  source?: string
): number {
  let score = 0;
  const fullText = `${title} ${content}`.toLowerCase();

  // Check for excluded terms first
  for (const keyword of EXCLUDED_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      return 0.1; // Very low relevance
    }
  }

  // Primary keywords: +0.4 each
  for (const keyword of PRIMARY_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      score += 0.4;
    }
  }

  // Secondary keywords: +0.2 each
  for (const keyword of SECONDARY_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      score += 0.2;
    }
  }

  // Tertiary keywords: +0.05 each (lower impact)
  for (const keyword of TERTIARY_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      score += 0.05;
    }
  }

  // Title weight boost: if primary keyword in title, +0.15
  const titleLower = title.toLowerCase();
  if (PRIMARY_KEYWORDS.some((kw) => titleLower.includes(kw))) {
    score += 0.15;
  }

  // Clamp to 0-1 range
  score = Math.min(1.0, score);

  // Source credibility boost
  if (source) {
    const credibleSources = ['reuters', 'ap news', 'npr', 'politico', 'nytimes', 'washingtonpost'];
    if (credibleSources.some((s) => source.toLowerCase().includes(s))) {
      score = Math.min(1.0, score + 0.1);
    }
  }

  return parseFloat(score.toFixed(2));
}

/**
 * Get relevance category
 */
export function getRelevanceCategory(score: number): string {
  if (score >= 0.8) return 'HIGHLY_RELEVANT';
  if (score >= 0.6) return 'RELEVANT';
  if (score >= 0.4) return 'SOMEWHAT_RELEVANT';
  if (score >= 0.2) return 'LOOSELY_RELATED';
  return 'NOT_RELEVANT';
}

/**
 * Explain relevance score
 */
export function explainRelevance(score: number): string {
  const category = getRelevanceCategory(score);

  const explanations: Record<string, string> = {
    HIGHLY_RELEVANT:
      'This article is directly focused on 2nd Amendment issues and should be featured.',
    RELEVANT: 'This article covers important 2nd Amendment topics and is suitable for sharing.',
    SOMEWHAT_RELEVANT:
      'This article touches on 2nd Amendment-related issues but may not be primary focus.',
    LOOSELY_RELATED:
      'This article has tangential connection to gun rights or constitutional issues.',
    NOT_RELEVANT: 'This article does not appear relevant to 2nd Amendment advocacy.',
  };

  return explanations[category] || 'Unable to determine relevance';
}
