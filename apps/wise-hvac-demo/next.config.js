/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: '/wise-hvac-demo',
  output: 'standalone',
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
  },
};

module.exports = nextConfig;
