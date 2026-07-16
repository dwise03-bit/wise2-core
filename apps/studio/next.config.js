/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Skip ESLint during build to allow deployment
    // Run linting separately in development
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
