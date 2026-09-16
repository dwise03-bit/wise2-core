const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const main = [...source.matchAll(/^\s{2}([a-zA-Z0-9_-]+):\s*\{\n\s{4}data:/gm)].map((m) => m[1]);
const contractor = require('../contractor-commands').commands.map((c) => c.toJSON().name);
const deploysRevenueModule = source.includes('commandData = [...commandData, ...revenueCommandData]');
const revenue = deploysRevenueModule ? require('../revenue-commands').commands.map((c) => c.toJSON().name) : [];
const all = [...main, ...revenue, ...contractor];
const duplicates = [...new Set(all.filter((name, i) => all.indexOf(name) !== i))];
assert.deepEqual(duplicates, [], `Duplicate Discord command names: ${duplicates.join(', ')}`);
console.log(`PASS: ${all.length} deployed Discord command definitions are unique`);
