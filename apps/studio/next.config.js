/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Skip ESLint during build to allow deployment
    // Run linting separately in development
    ignoreDuringBuilds: true,
  },
  // Studio pages change with active production work. Keep HTML fresh after a
  // deploy; Next can still cache its fingerprinted static JS/CSS assets.
  headers: async () => [
    {
      source: '/',
      headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }],
    },
    {
      source: '/workspace',
      headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }],
    },
    {
      source: '/live-studio',
      headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }],
    },
    {
      source: '/live-streaming',
      headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }],
    },
  ],
};

module.exports = nextConfig;
