/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/fergies-table',
  output: 'standalone',
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_BASE_PATH: '/fergies-table',
  },
};

module.exports = nextConfig;
