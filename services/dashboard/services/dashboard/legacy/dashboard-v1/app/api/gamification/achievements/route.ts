import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

const ACHIEVEMENTS = {
  'first_drill': {
    name: 'First Shot',
    description: 'Complete your first drill',
    points: 10,
    icon: '🎯'
  },
  'accuracy_100': {
    name: 'Perfect Accuracy',
    description: 'Score 100% on any drill',
    points: 50,
    icon: '🔥'
  },
  'speedster': {
    name: 'Speedster',
    description: 'Complete 10 drills',
    points: 30,
    icon: '⚡'
  },
  'dedicated': {
    name: 'Dedicated Shooter',
    description: 'Complete 50 drills',
    points: 100,
    icon: '💪'
  },
  'week_streak': {
    name: 'Week Warrior',
    description: 'Train for 7 consecutive days',
    points: 75,
    icon: '🔗'
  },
  'month_streak': {
    name: 'Unstoppable',
    description: 'Train for 30 consecutive days',
    points: 200,
    icon: '🏆'
  },
  'social_share': {
    name: 'Influencer',
    description: 'Share results on social media',
    points: 25,
    icon: '📱'
  },
  'referral_5': {
    name: 'Recruiter',
    description: 'Refer 5 students',
    points: 150,
    icon: '👥'
  }
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at DESC`,
      [payload.userId]
    );

    const unlockedAchievements = result.rows.map(row => ({
      id: row.achievement_id,
      ...ACHIEVEMENTS[row.achievement_id as keyof typeof ACHIEVEMENTS],
      unlockedAt: row.unlocked_at
    }));

    const allAchievements = Object.entries(ACHIEVEMENTS).map(([id, data]) => ({
      id,
      ...data,
      unlocked: unlockedAchievements.some(a => a.id === id),
      unlockedAt: unlockedAchievements.find(a => a.id === id)?.unlockedAt
    }));

    const totalPoints = await query(
      `SELECT SUM(points) as total FROM user_achievements WHERE user_id = $1`,
      [payload.userId]
    );

    return NextResponse.json({
      achievements: allAchievements,
      totalPoints: parseInt(totalPoints.rows[0]?.total) || 0,
      unlockedCount: unlockedAchievements.length
    }, { status: 200 });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
