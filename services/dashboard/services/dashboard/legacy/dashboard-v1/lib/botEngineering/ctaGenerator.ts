/**
 * Call-to-Action Generator
 * Creates engaging CTAs for social media posts
 */

interface CTATemplate {
  category: string;
  templates: string[];
}

const CTA_TEMPLATES: CTATemplate[] = [
  {
    category: 'engagement',
    templates: [
      'What are your thoughts? Share in the comments.',
      'Join the conversation. Your voice matters.',
      'Tell us what you think. Reply below.',
      'Drop your thoughts in the comments.',
      'What\'s your take on this? Let\'s discuss.',
    ],
  },
  {
    category: 'education',
    templates: [
      'Learn more about your constitutional rights.',
      'Educate yourself on 2nd Amendment law.',
      'Read the full story to understand the implications.',
      'Click to learn what this means for you.',
      'Understand your rights. Read more.',
    ],
  },
  {
    category: 'action',
    templates: [
      'Stand up for your rights. Take action today.',
      'Defend liberty. Get involved now.',
      'Make your voice heard. Contact your representatives.',
      'It\'s time to act. Here\'s how you can help.',
      'This affects you. Take a stand.',
    ],
  },
  {
    category: 'sharing',
    templates: [
      'Share this important news with others.',
      'Help spread the word. Share now.',
      'Know someone who needs to see this? Share it.',
      'Spread awareness. Share with your network.',
      'This is important. Please share.',
    ],
  },
  {
    category: 'support',
    templates: [
      'Stand with us in defending constitutional rights.',
      'Join thousands fighting for freedom.',
      'Support the movement. Join today.',
      'Be part of the solution.',
      'Together, we can make a difference.',
    ],
  },
  {
    category: 'victory',
    templates: [
      'Victory for freedom! Celebrate with us.',
      'This is a win for liberty. Let\'s keep fighting.',
      'Right prevails. This is what victory looks like.',
      'A major win for constitutional rights.',
      'Justice served. The fight continues.',
    ],
  },
  {
    category: 'concern',
    templates: [
      'We need to address this threat to liberty.',
      'This is concerning. We must act.',
      'This threatens your rights. Here\'s what to do.',
      'Wake up. Your freedom is at stake.',
      'We can\'t ignore this. Time to respond.',
    ],
  },
];

/**
 * Generate CTA based on sentiment and article type
 */
export function generateCTA(
  sentiment: 'positive' | 'negative' | 'neutral',
  articleType: string
): string {
  let category = 'engagement';

  // Determine CTA category based on sentiment and content
  if (sentiment === 'positive') {
    if (articleType.includes('court') || articleType.includes('ruling')) {
      category = 'victory';
    } else if (articleType.includes('legislation')) {
      category = 'sharing';
    } else {
      category = 'support';
    }
  } else if (sentiment === 'negative') {
    if (articleType.includes('threat') || articleType.includes('ban')) {
      category = 'concern';
    } else if (articleType.includes('legislation')) {
      category = 'action';
    } else {
      category = 'engagement';
    }
  } else {
    if (articleType.includes('education') || articleType.includes('court')) {
      category = 'education';
    } else if (articleType.includes('news')) {
      category = 'sharing';
    } else {
      category = 'engagement';
    }
  }

  // Find template set
  const templateSet = CTA_TEMPLATES.find((t) => t.category === category);
  if (!templateSet) {
    return CTA_TEMPLATES[0].templates[0];
  }

  // Return random template from category
  const randomIndex = Math.floor(Math.random() * templateSet.templates.length);
  return templateSet.templates[randomIndex];
}

/**
 * Generate multiple CTA options
 */
export function generateCTAOptions(
  sentiment: 'positive' | 'negative' | 'neutral',
  articleType: string,
  count = 3
): string[] {
  const options: Set<string> = new Set();

  // Get primary CTA
  options.add(generateCTA(sentiment, articleType));

  // Get additional CTAs from related categories
  const relatedCategories = getRelatedCategories(sentiment, articleType);

  for (const category of relatedCategories) {
    const templateSet = CTA_TEMPLATES.find((t) => t.category === category);
    if (templateSet && options.size < count) {
      const randomIndex = Math.floor(Math.random() * templateSet.templates.length);
      options.add(templateSet.templates[randomIndex]);
    }
  }

  return Array.from(options).slice(0, count);
}

/**
 * Get related CTA categories
 */
function getRelatedCategories(
  sentiment: 'positive' | 'negative' | 'neutral',
  articleType: string
): string[] {
  const related: string[] = [];

  if (sentiment === 'positive') {
    related.push('engagement', 'sharing', 'support');
  } else if (sentiment === 'negative') {
    related.push('engagement', 'action', 'concern');
  } else {
    related.push('engagement', 'education', 'sharing');
  }

  return related;
}

/**
 * Format CTA for different platforms
 */
export function formatCTAForPlatform(cta: string, platform: 'twitter' | 'instagram' | 'linkedin'): string {
  switch (platform) {
    case 'twitter':
      // Keep it shorter for Twitter
      return cta.substring(0, 100).replace(/\.$/, '');

    case 'instagram':
      // Instagram allows longer CTAs
      return cta;

    case 'linkedin':
      // LinkedIn: professional tone
      return cta.replace(/Let.*do it/gi, 'I\'d love to hear your perspective');

    default:
      return cta;
  }
}
