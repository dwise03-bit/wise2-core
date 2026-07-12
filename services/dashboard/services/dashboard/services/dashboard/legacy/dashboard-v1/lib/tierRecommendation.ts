export type Experience = 'beginner' | 'some' | 'competitive';
export type TimeCommitment = 'casual' | '2-3hrs' | 'serious';
export type Goal = 'safe' | 'self-defense' | 'competition' | 'improve';
export type Tier = 'starter' | 'pro' | 'vip';

export interface DiscoveryState {
  experience: Experience | null;
  timeCommitment: TimeCommitment | null;
  goal: Goal | null;
}

export interface TierInfo {
  tier: Tier;
  price: number;
  description: string;
  benefits: string[];
}

export const TIER_RECOMMENDATIONS: Record<Tier, TierInfo> = {
  starter: {
    tier: 'starter',
    price: 99,
    description: 'Build your foundation safely',
    benefits: [
      'Beginner Fundamentals course',
      'Community forum access',
      'Performance tracking',
      'Certificates upon completion',
    ],
  },
  pro: {
    tier: 'pro',
    price: 199,
    description: 'Structured learning with personal guidance',
    benefits: [
      'Everything in Starter, plus:',
      'Concealed Carry course',
      '2 personalized coaching sessions/month',
      'Priority email support',
    ],
  },
  vip: {
    tier: 'vip',
    price: 399,
    description: 'Dedicated mastery and professional coaching',
    benefits: [
      'Everything in Pro, plus:',
      'Competitive Shooting course',
      'Weekly 1-on-1 coaching',
      '24/7 phone support',
      'Custom training programs',
    ],
  },
};

export function getRecommendedTier(
  experience: Experience,
  timeCommitment: TimeCommitment,
  goal: Goal
): Tier {
  // Rule 1: Beginners always get Starter
  if (experience === 'beginner') {
    return 'starter';
  }

  // Rule 2: Serious commitment always gets VIP
  if (timeCommitment === 'serious') {
    return 'vip';
  }

  // Rule 3: Competitive shooters get VIP
  if (experience === 'competitive') {
    return 'vip';
  }

  // Rule 4: Some experience + 2-3 hrs/week + (self-defense or improve) = Pro
  if (
    experience === 'some' &&
    timeCommitment === '2-3hrs' &&
    (goal === 'self-defense' || goal === 'improve')
  ) {
    return 'pro';
  }

  // Default: Starter
  return 'starter';
}

export function getRecommendationExplanation(
  experience: Experience,
  timeCommitment: TimeCommitment,
  goal: Goal,
  recommendedTier: Tier
): {
  profilePoints: string[];
  explanation: string;
} {
  const experienceLabel = {
    beginner: 'You\'re a beginner looking to learn safely',
    some: 'You have some shooting experience',
    competitive: 'You\'re a competitive shooter',
  }[experience];

  const timeLabel = {
    casual: 'You want flexible, self-paced learning',
    '2-3hrs': 'You can commit 2-3 hours per week',
    serious: 'You want dedicated weekly coaching',
  }[timeCommitment];

  const goalLabel = {
    safe: 'focusing on safety fundamentals',
    'self-defense': 'focused on self-defense readiness',
    competition: 'aiming for competitive excellence',
    improve: 'looking to improve existing skills',
  }[goal];

  const profilePoints = [
    experienceLabel,
    timeLabel,
    goalLabel,
  ];

  const explanationMap: Record<Tier, string> = {
    starter: 'Starter gives you everything you need to build a strong foundation with flexibility.',
    pro: 'Pro tier provides structured coaching and deeper training to level up your skills.',
    vip: 'VIP is the full commitment: dedicated coaching, all courses, and priority support.',
  };

  return {
    profilePoints,
    explanation: explanationMap[recommendedTier],
  };
}
