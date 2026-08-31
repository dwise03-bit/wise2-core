/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/action-dispatch',
  output: 'standalone',
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_SIMULATION: 'true',
    NEXT_PUBLIC_BASE_PATH: '/action-dispatch',
  },
};

module.exports = nextConfig;
