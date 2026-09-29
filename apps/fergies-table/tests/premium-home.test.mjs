import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync(new URL('../app/(app)/home/page.tsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('premium home carries the approved Fergie brand message and customer actions', () => {
  for (const copy of ['Good Food.', 'Real Love.', 'Real Results.', 'View Menu', 'Book Your Table', 'Popular Right Now']) {
    assert.match(home, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('premium home includes the five brand promise tiles', () => {
  for (const promise of ['Bold Flavors', 'Made With Love', 'Perfect For Any Occasion', 'Reliable Service', 'Real Results']) {
    assert.match(home, new RegExp(promise, 'i'));
  }
});

test('premium visual system includes purple atmospheric glow and metallic gold treatment', () => {
  assert.match(css, /premium-hero/);
  assert.match(css, /metallic-gold/);
  assert.match(css, /purple-atmosphere/);
});
