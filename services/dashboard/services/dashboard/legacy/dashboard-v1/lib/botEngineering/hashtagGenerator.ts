/**
 * Hashtag Generator
 * Generates relevant hashtags for 2nd Amendment content
 */

// Core 2A hashtags
const CORE_HASHTAGS = ['#2A', '#SecondAmendment', '#GunRights', '#2ndAmendment', '#ArmedCitizen'];

// Topic-based hashtags
const TOPIC_HASHTAGS: Record<string, string[]> = {
  court: [
    '#CourtRuling',
    '#LegalVictory',
    '#ConstitutionalRights',
    '#SupremeCourtRules',
    '#JusticeDecision',
  ],
  legislation: [
    '#2ALegislation',
    '#GunBill',
    '#Congress',
    '#Congress2A',
    '#ProGunLaws',
    '#SelfDefense',
  ],
  rights: [
    '#ConstitutionalRights',
    '#FreedomMatters',
    '#CivicLiberties',
    '#America',
    '#Patriot',
    '#Liberty',
  ],
  activism: [
    '#GunRightsAdvocacy',
    '#2ADrive',
    '#DefendTheSecond',
    '#ProGun',
    '#GunOwnersMatter',
    '#2ACommunity',
  ],
  education: [
    '#GunSafety',
    '#FirearmTraining',
    '#SelfDefenseTraining',
    '#MarksmanshipMatters',
    '#2AEducation',
  ],
};

// Engagement hashtags (broad reach)
const ENGAGEMENT_HASHTAGS = ['#News', '#Politics', '#USA', '#Rights', '#Constitution'];

/**
 * Generate hashtags for article
 */
export function generateHashtags(
  title: string,
  content: string,
  sentiment: string,
  keywords?: string[]
): string {
  const tags: Set<string> = new Set();

  // Always add core hashtags
  CORE_HASHTAGS.forEach((tag) => tags.add(tag));

  // Add topic-based hashtags
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (/court|judge|ruling|decision|verdict/i.test(titleLower)) {
    TOPIC_HASHTAGS.court.slice(0, 2).forEach((tag) => tags.add(tag));
  }

  if (/law|legislation|bill|congress|senate|house/i.test(titleLower)) {
    TOPIC_HASHTAGS.legislation.slice(0, 2).forEach((tag) => tags.add(tag));
  }

  if (/right|freedom|liberty|constitution|amendment/i.test(titleLower)) {
    TOPIC_HASHTAGS.rights.slice(0, 2).forEach((tag) => tags.add(tag));
  }

  if (/advocate|activism|campaign|movement|action/i.test(contentLower)) {
    TOPIC_HASHTAGS.activism.slice(0, 2).forEach((tag) => tags.add(tag));
  }

  if (/training|education|safety|course|skill/i.test(contentLower)) {
    TOPIC_HASHTAGS.education.slice(0, 2).forEach((tag) => tags.add(tag));
  }

  // Add sentiment-appropriate hashtags
  if (sentiment === 'positive') {
    tags.add('#Victory');
    tags.add('#WinForAmerica');
  } else if (sentiment === 'negative') {
    tags.add('#DefendOurRights');
    tags.add('#StandWithUs');
  }

  // Add engagement hashtags (limit to 2)
  ENGAGEMENT_HASHTAGS.slice(0, 2).forEach((tag) => tags.add(tag));

  // Convert to array and limit to 15 hashtags max
  const hashtagArray = Array.from(tags).slice(0, 15);

  return hashtagArray.join(' ');
}

/**
 * Generate hashtags optimized for Twitter (shorter)
 */
export function generateTwitterHashtags(
  title: string,
  content: string,
  sentiment: string
): string {
  const allHashtags = generateHashtags(title, content, sentiment);
  const tags = allHashtags.split(' ');

  // Twitter: Keep to ~8-10 hashtags for readability
  return tags.slice(0, 8).join(' ');
}

/**
 * Generate hashtags optimized for Instagram (more hashtags)
 */
export function generateInstagramHashtags(
  title: string,
  content: string,
  sentiment: string
): string {
  const allHashtags = generateHashtags(title, content, sentiment);
  const tags = allHashtags.split(' ');

  // Instagram: Can use all 15-30 hashtags
  const basicTags = tags;
  const additionalTags = [
    '#2AMeme',
    '#GunCommunity',
    '#AmericaFirst',
    '#ConstitutionalCarry',
    '#ProtectOurRights',
  ];

  const combined = [...basicTags, ...additionalTags].slice(0, 30);
  return combined.join(' ');
}

/**
 * Generate hashtags optimized for LinkedIn (professional)
 */
export function generateLinkedInHashtags(
  title: string,
  content: string,
  sentiment: string
): string {
  const tags: Set<string> = new Set();

  // LinkedIn: Professional focus
  tags.add('#CivicEngagement');
  tags.add('#ConstitutionalLaw');
  tags.add('#PolicyAdvocacy');
  tags.add('#CommunityLeadership');

  // Add relevant topic tags
  if (/legislation|bill|congress/i.test(title)) {
    tags.add('#PolicyAnalysis');
    tags.add('#GovernmentRelations');
  }

  if (/court|legal|ruling/i.test(title)) {
    tags.add('#LegalAnalysis');
    tags.add('#ConstitutionalLaw');
  }

  const tagArray = Array.from(tags).slice(0, 8);
  return tagArray.join(' ');
}
