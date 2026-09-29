/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Owner demo runs fully self-contained: no production API, no live integrations.
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
  },
};

module.exports = nextConfig;
