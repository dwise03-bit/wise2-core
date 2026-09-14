/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
  },
};

module.exports = nextConfig;
