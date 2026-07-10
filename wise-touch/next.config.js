/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.8.124'],
}

module.exports = nextConfig
