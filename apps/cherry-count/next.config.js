/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/cherry-count',
  output: 'standalone',
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_BASE_PATH: '/cherry-count',
  },
};

module.exports = nextConfig;
