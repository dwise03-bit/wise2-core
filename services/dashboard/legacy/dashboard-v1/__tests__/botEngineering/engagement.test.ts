/**
 * Engagement Points System Tests
 */

import { awardPoints, getMemberPoints, recordEngagement } from '@/lib/botEngineering/engagement';
import { pool } from '@/lib/db';

// Test UUID for isolation
const testMemberId = 'test-engagement-00000000-0000-0000-0000-000000000001';

describe('Engagement Points', () => {
  beforeEach(async () => {
    // Clean up before each test
    try {
      await pool.query('DELETE FROM member_engagement WHERE member_id = $1', [testMemberId]);
      await pool.query('DELETE FROM member_progress WHERE member_id = $1', [testMemberId]);
    } catch (error) {
      // Tables might not exist yet, that's OK
    }
  });

  afterAll(async () => {
    // Clean up after all tests
    try {
      await pool.query('DELETE FROM member_engagement WHERE member_id = $1', [testMemberId]);
      await pool.query('DELETE FROM member_progress WHERE member_id = $1', [testMemberId]);
      await pool.end();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test('awards points to member', async () => {
    await awardPoints(testMemberId, 'check_in', 1);
    const points = await getMemberPoints(testMemberId);
    expect(points).toBe(1);
  });

  test('accumulates points across multiple actions', async () => {
    await awardPoints(testMemberId, 'check_in', 1);
    await awardPoints(testMemberId, 'reaction', 1);
    await awardPoints(testMemberId, 'social_share', 5);
    const points = await getMemberPoints(testMemberId);
    expect(points).toBe(7);
  });

  test('records engagement event', async () => {
    await recordEngagement(testMemberId, 'discord', 'check_in', { poll_id: '123' });
    const result = await pool.query(
      'SELECT * FROM member_engagement WHERE member_id = $1',
      [testMemberId]
    );
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].action_type).toBe('check_in');
  });

  test('returns 0 points for non-existent member', async () => {
    const points = await getMemberPoints('non-existent-id');
    expect(points).toBe(0);
  });
});
