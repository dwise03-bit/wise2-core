/**
 * Streak Tracking System Tests
 */

import { updateStreak, getStreak } from '@/lib/botEngineering/streak';
import { pool } from '@/lib/db';

const testMemberId = 'test-streak-00000000-0000-0000-0000-000000000002';

describe('Streak Tracking', () => {
  beforeEach(async () => {
    try {
      await pool.query('DELETE FROM member_progress WHERE member_id = $1', [testMemberId]);
    } catch (error) {
      // Tables might not exist yet
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM member_progress WHERE member_id = $1', [testMemberId]);
      await pool.end();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test('initializes streak to 1 on first activity', async () => {
    const streak = await updateStreak(testMemberId);
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
  });

  test('maintains streak on same day', async () => {
    await updateStreak(testMemberId);
    const streak = await updateStreak(testMemberId);
    expect(streak.current).toBe(1);
  });

  test('increments streak on consecutive days', async () => {
    // Day 1
    await updateStreak(testMemberId);

    // Simulate next day by updating last_active_date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await pool.query(
      'UPDATE member_progress SET last_active_date = $1 WHERE member_id = $2',
      [tomorrowStr, testMemberId]
    );

    const streak = await updateStreak(testMemberId);
    expect(streak.current).toBe(2);
    expect(streak.longest).toBe(2);
  });

  test('resets streak if no activity for 24h', async () => {
    await updateStreak(testMemberId);

    // Simulate 25+ hours without activity
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await pool.query(
      'UPDATE member_progress SET last_active_date = $1 WHERE member_id = $2',
      [yesterdayStr, testMemberId]
    );

    const streak = await updateStreak(testMemberId);
    expect(streak.current).toBe(1);
  });

  test('retrieves streak without updating', async () => {
    await updateStreak(testMemberId);
    const streak = await getStreak(testMemberId);
    expect(streak.current).toBeGreaterThan(0);
    expect(streak.longest).toBeGreaterThan(0);
  });

  test('returns 0 for non-existent member', async () => {
    const streak = await getStreak('non-existent-id');
    expect(streak.current).toBe(0);
    expect(streak.longest).toBe(0);
  });
});
