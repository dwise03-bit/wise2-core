/**
 * AI-Powered Training Tips Generator
 * Generates personalized tips based on member skill level
 */

import { query } from '@/lib/db';

// Template-based tips (fallback when Hermes AI not available)
const TIPS_BY_LEVEL: Record<string, string[]> = {
  beginner: [
    '🔰 Today: Master the grip. A solid grip is the foundation of everything.',
    '🔰 Drill: 10 dry fires focusing on sight alignment. Quality over speed.',
    '🔰 Remember: Safety first. Always follow the four rules.',
    '🔰 Focus: Stance. Your body position affects everything. Practice the fundamentals.',
    '🔰 Tip: Start slow. Build good habits before building speed.',
  ],
  intermediate: [
    '📍 Today: Work on accuracy at 25 yards. Group your shots tight.',
    '📍 Drill: 50 rounds of draw-to-first-shot practice.',
    '📍 Challenge: One-handed shooting from your weak hand.',
    '📍 Focus: Trigger control. Smooth, consistent trigger press improves accuracy.',
    '📍 Tip: Track your performance. Keep records of your practice sessions.',
  ],
  advanced: [
    '🎯 Today: Speed and accuracy under pressure. Push your limits.',
    '🎯 Drill: Competitive stage walk-through and timed runs.',
    '🎯 Advanced: Multi-target transitions at high speed.',
    '🎯 Focus: Decision-making. React faster to threats.',
    '🎯 Challenge: Shoot from unconventional positions.',
  ],
};

/**
 * Generate personalized training tip for member
 */
export async function generatePersonalizedTip(memberId: string): Promise<string> {
  try {
    const result = await query(
      `SELECT experience_level FROM users WHERE id = $1`,
      [memberId]
    );

    if (!result.rows[0]) {
      return getRandomTip('beginner');
    }

    const skillLevel = result.rows[0].experience_level || 'beginner';
    const tip = getRandomTip(skillLevel);

    console.log(`[AI_TIPS] Generated tip for ${memberId} (${skillLevel}): ${tip.substring(0, 50)}...`);
    return tip;
  } catch (error) {
    console.error('[AI_TIPS] Error generating tip:', error);
    return getRandomTip('beginner');
  }
}

/**
 * Get random tip for skill level
 */
function getRandomTip(skillLevel: string): string {
  const tips = TIPS_BY_LEVEL[skillLevel] || TIPS_BY_LEVEL.beginner;
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Generate tips for all active members
 */
export async function generateTipsForAllMembers(): Promise<Map<string, string>> {
  const tips = new Map<string, string>();

  try {
    const result = await query(
      `SELECT id, experience_level FROM users WHERE is_active = true`
    );

    for (const user of result.rows) {
      const tip = getRandomTip(user.experience_level || 'beginner');
      tips.set(user.id, tip);
    }

    console.log(`[AI_TIPS] Generated tips for ${tips.size} members`);
    return tips;
  } catch (error) {
    console.error('[AI_TIPS] Error generating tips for all members:', error);
    return tips;
  }
}
