/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: '/wise-hvac-demo',
  allowedDevOrigins: ['172.20.10.7', '100.64.72.14', '192.168.8.114'],
  output: 'standalone',
  trailingSlash: false,
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
    };
  },
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_BASE_PATH: '/wise-hvac-demo',
  },
};

module.exports = nextConfig;
