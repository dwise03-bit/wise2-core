import {
  getDailyActiveUsers,
  getEngagementRate,
  getTopPosts,
  getTierBreakdown,
  getTotalPoints,
} from '@/lib/botEngineering/analytics';

export async function GET() {
  try {
    const [dau, engagementRate, topPosts, tierBreakdown, totalPoints] = await Promise.all([
      getDailyActiveUsers(7),
      getEngagementRate(),
      getTopPosts(10),
      getTierBreakdown(),
      getTotalPoints(),
    ]);

    return Response.json({
      dau,
      engagementRate: Math.round(engagementRate * 100) / 100,
      topPosts,
      tierBreakdown,
      totalPoints,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
