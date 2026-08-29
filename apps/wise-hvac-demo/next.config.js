/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: '/wise-hvac-demo',
  output: 'standalone',
  trailingSlash: false,
  redirects: async () => [
    {
      source: '/ft',
      destination: '/wise-hvac-demo/field-tech',
      permanent: false,
      basePath: false,
    },
    {
      source: '/hvac',
      destination: '/wise-hvac-demo/field-tech',
      permanent: false,
      basePath: false,
    },
    {
      source: '/field-tech',
      destination: '/wise-hvac-demo/field-tech',
      permanent: false,
      basePath: false,
    },
    {
      source: '/field-tech/:path*',
      destination: '/wise-hvac-demo/field-tech/:path*',
      permanent: false,
      basePath: false,
    },
    {
      source: '/health',
      destination: '/wise-hvac-demo/api/health',
      permanent: false,
      basePath: false,
    },
  ],
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
