/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/lil-lizzy',
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_BASE_PATH: '/lil-lizzy',
  },
};

module.exports = nextConfig;
