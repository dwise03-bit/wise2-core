/**
 * Virality Tracking Tests
 */

import { trackVirality, isViral, getViralPosts } from '@/lib/botEngineering/virality';
import { pool } from '@/lib/db';

const testMemberId = 'test-virality-00000000-0000-0000-0000-000000000003';
const testMessageId = 'test-msg-12345';

describe('Virality Tracking', () => {
  beforeEach(async () => {
    try {
      await pool.query('DELETE FROM bot_social_posts WHERE discord_message_id LIKE $1', [
        'test-msg-%',
      ]);
    } catch (error) {
      // Tables might not exist yet
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM bot_social_posts WHERE discord_message_id LIKE $1', [
        'test-msg-%',
      ]);
      await pool.end();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test('tracks message reactions', async () => {
    const viral = await trackVirality(testMessageId, testMemberId, 5);
    expect(viral).toBe(true);
  });

  test('requires >=5 reactions to be viral', async () => {
    const viral = await trackVirality('test-msg-low', testMemberId, 4);
    expect(viral).toBe(false);
  });

  test('requires >5 reactions to be viral', async () => {
    const viral = await trackVirality('test-msg-high', testMemberId, 6);
    expect(viral).toBe(true);
  });

  test('checks virality status', async () => {
    await trackVirality('test-msg-check', testMemberId, 5);
    const viral = await isViral('test-msg-check');
    expect(viral).toBe(true);
  });

  test('returns false for non-viral messages', async () => {
    const viral = await isViral('non-existent-msg');
    expect(viral).toBe(false);
  });

  test('retrieves viral posts list', async () => {
    await trackVirality('test-msg-viral-1', testMemberId, 5);
    await trackVirality('test-msg-viral-2', testMemberId, 7);
    await trackVirality('test-msg-low', testMemberId, 3);

    const posts = await getViralPosts(10);
    expect(posts.length).toBeGreaterThanOrEqual(2);
  });
});
