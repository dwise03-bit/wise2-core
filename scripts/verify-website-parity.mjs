const target = process.argv[2] || process.env.WISE2_PUBLIC_URL || 'https://wise2.net/';
const marker = 'data-wise2-homepage="united-command-v2"';

const response = await fetch(target, { redirect: 'follow' });
const html = await response.text();

if (!response.ok) {
  throw new Error(`Production homepage returned HTTP ${response.status}: ${target}`);
}

if (!html.includes(marker)) {
  throw new Error(`Production homepage is not serving the expected WISE² source marker (${marker}): ${target}`);
}

console.log(`WISE² homepage parity verified: ${target}`);
