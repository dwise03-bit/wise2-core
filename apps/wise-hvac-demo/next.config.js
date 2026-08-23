/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.CAPACITOR_BUILD ? '' : '/wise-hvac-demo',
  output: process.env.CAPACITOR_BUILD ? 'export' : 'standalone',
  trailingSlash: true,
  // Owner demo runs fully self-contained: no production API, no live integrations.
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
  },
};

module.exports = nextConfig;
