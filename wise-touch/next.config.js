/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbo: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.8.124'],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
      ],
    },
  ],
}

module.exports = nextConfig
