import { getRecommendedTier } from '../lib/tierRecommendation';

describe('getRecommendedTier', () => {
  test('recommends Starter for beginners regardless of time/goal', () => {
    expect(getRecommendedTier('beginner', 'casual', 'safe')).toBe('starter');
    expect(getRecommendedTier('beginner', '2-3hrs', 'self-defense')).toBe('starter');
    expect(getRecommendedTier('beginner', 'serious', 'competition')).toBe('starter');
  });

  test('recommends VIP for serious commitment regardless of experience', () => {
    expect(getRecommendedTier('some', 'serious', 'safe')).toBe('vip');
    expect(getRecommendedTier('competitive', 'serious', 'improve')).toBe('vip');
  });

  test('recommends VIP for competitive shooters', () => {
    expect(getRecommendedTier('competitive', 'casual', 'competition')).toBe('vip');
    expect(getRecommendedTier('competitive', '2-3hrs', 'improve')).toBe('vip');
  });

  test('recommends Pro for some experience + 2-3hrs + (self-defense or improve)', () => {
    expect(getRecommendedTier('some', '2-3hrs', 'self-defense')).toBe('pro');
    expect(getRecommendedTier('some', '2-3hrs', 'improve')).toBe('pro');
  });

  test('recommends Starter for some experience + casual time', () => {
    expect(getRecommendedTier('some', 'casual', 'safe')).toBe('starter');
    expect(getRecommendedTier('some', 'casual', 'improve')).toBe('starter');
  });

  test('defaults to Starter for edge cases', () => {
    expect(getRecommendedTier('some', '2-3hrs', 'safe')).toBe('starter');
  });
});
