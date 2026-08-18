/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // basePath should be empty for root domain deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  output: 'standalone',
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["@wise2/shared"],
  },
}

module.exports = nextConfig
