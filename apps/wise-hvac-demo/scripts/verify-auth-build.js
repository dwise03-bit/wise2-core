const fs = require('fs');
const path = require('path');

const required = [
  '.next/server/app/api/auth/google/callback/route.js',
  '.next/server/app/api/auth/google/authorize/route.js',
  '.next/server/app/api/auth/config/route.js',
  '.next/server/app/api/auth/logout/route.js',
  '.next/server/app/api/auth/handoff/route.js',
  '.next/server/app/api/v1/auth/login/route.js',
  '.next/server/app/api/v1/auth/google/route.js',
];

const missing = required.filter((file) => !fs.existsSync(path.join(__dirname, '..', file)));
if (missing.length > 0) {
  console.error('HVAC auth build is incomplete. Missing compiled routes:');
  for (const file of missing) console.error(`  ${file}`);
  process.exit(1);
}

console.log('HVAC auth routes compiled.');
