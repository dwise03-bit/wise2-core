import test from 'node:test';
import assert from 'node:assert/strict';
import { bestQuote, DemoOddsProvider, potentialPayout } from './odds.ts';
test('demo provider exposes timestamped quotes and sports', async () => {
  const provider = new DemoOddsProvider();
  const sports = await provider.getSports();
  assert.ok(sports.includes('NBA'));
  assert.ok(sports.includes('UFC'));
  const event = await provider.getEventOdds('nba-lal-den');
  assert.equal(event?.quotes.length, 2);
  assert.ok(event?.quotes.every(quote => !Number.isNaN(Date.parse(quote.capturedAt))));
  assert.equal(bestQuote(event.quotes).book, 'FanDuel');
});
test('American odds payout covers positive and negative prices', () => {
  assert.equal(potentialPayout(10, -105), 19.52);
  assert.equal(potentialPayout(10, 125), 22.5);
});
