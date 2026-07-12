/**
 * Key Points Extractor
 * Extracts important points from news articles
 */

/**
 * Extract key points from article content
 */
export function extractKeyPoints(title: string, content: string, maxPoints = 5): string[] {
  const points: string[] = [];

  // Extract from title
  const titlePoints = extractTitlePoints(title);
  points.push(...titlePoints);

  // Extract from content - look for sentences with important keywords
  const sentences = content.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);

  const keywordPatterns = [
    /court|judge|ruling|decision/i,
    /law|legislation|bill|passed|signed/i,
    /2nd amendment|second amendment|gun rights/i,
    /regulation|restriction|ban|prohibited/i,
    /protection|defend|protect|safeguard/i,
    /impact|effect|consequence|result/i,
    /million|billion|number|\d+/i,
  ];

  // Score and extract sentences
  const scoredSentences = sentences.map((sentence) => {
    let score = 0;
    for (const pattern of keywordPatterns) {
      if (pattern.test(sentence)) score += 1;
    }
    return { sentence: capitalizeFirst(sentence), score };
  });

  // Sort by score and take top points
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPoints - points.length)
    .map((s) => s.sentence)
    .filter((s) => s.length > 30); // Avoid too-short sentences

  points.push(...topSentences);

  return points.slice(0, maxPoints);
}

/**
 * Extract points from title
 */
function extractTitlePoints(title: string): string[] {
  const points: string[] = [];

  // Check for specific patterns in title
  if (/court|judge|ruling|decision/i.test(title)) {
    points.push('Court ruling or legal decision');
  }
  if (/law|legislation|bill|passes/i.test(title)) {
    points.push('New legislation or law change');
  }
  if (/supreme|scotus/i.test(title)) {
    points.push('Supreme Court involvement');
  }
  if (/2nd amendment|gun rights/i.test(title)) {
    points.push('Direct 2nd Amendment focus');
  }
  if (/[a-z]+ v\. [a-z]+/i.test(title)) {
    points.push('Legal case or lawsuit');
  }

  return points;
}

/**
 * Extract implications of the article
 */
export function extractImplications(
  title: string,
  content: string,
  sentiment: string
): string[] {
  const implications: string[] = [];

  // Keyword-based implications
  if (/ban|restriction|prohibited/i.test(content)) {
    if (sentiment === 'negative') {
      implications.push(
        'May restrict firearm rights or access - potential advocacy opportunity'
      );
    } else {
      implications.push('Ban or restriction being challenged in court');
    }
  }

  if (/court.*struck|overturned|unconstitutional/i.test(content)) {
    implications.push('Favorable court ruling for 2nd Amendment rights');
  }

  if (/supremes|supreme court/i.test(content)) {
    implications.push('Could set national precedent for 2nd Amendment law');
  }

  if (/congress|senate|house|bill/i.test(content)) {
    implications.push('Federal legislative action or proposed change');
  }

  if (/swing state|election|political/i.test(content)) {
    implications.push('Political implications for 2nd Amendment advocacy');
  }

  if (/public health|research|study/i.test(content)) {
    implications.push('Health and safety angle on gun issues');
  }

  if (!implications.length) {
    implications.push('Article provides context on 2nd Amendment issues');
  }

  return implications.slice(0, 3);
}

/**
 * Generate article summary (basic version)
 */
export function generateBasicSummary(
  title: string,
  content: string,
  maxLength = 200
): string {
  let summary = title;

  // Add first 1-2 meaningful sentences from content
  const sentences = content.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 30);

  for (const sentence of sentences.slice(0, 2)) {
    if ((summary + ' ' + sentence).length < maxLength) {
      summary += ' ' + sentence + '.';
    } else {
      break;
    }
  }

  return summary.substring(0, maxLength) + (summary.length > maxLength ? '...' : '');
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
