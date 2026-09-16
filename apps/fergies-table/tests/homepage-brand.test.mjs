import fs from 'node:fs';
import assert from 'node:assert/strict';
const page = fs.readFileSync('app/page.tsx','utf8');
for (const text of ['WE COOK. YOU CONNECT.', 'Signature experiences', 'Cooking with Fergie', 'Plan your event']) {
  assert.ok(page.includes(text), `homepage missing: ${text}`);
}
assert.ok(page.includes('CATERING_PACKAGES.map'), 'homepage must render catering packages');
assert.ok(page.includes('MENU_ITEMS.filter'), 'homepage must render menu data');
console.log('homepage brand checks passed');
