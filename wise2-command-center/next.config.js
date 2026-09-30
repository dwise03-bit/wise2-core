/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/woji",
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] }];
  },
};

module.exports = nextConfig;
